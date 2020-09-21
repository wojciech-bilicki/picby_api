import * as bcrypt from 'bcryptjs';
import {
  Arg,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import { User } from '../../entity/User';
import { ApiErrorCodes } from '../../utils/errorCodes';
import { createAccountConfirmationUrl } from '../utils/createAccountConfirmationUrl';
import { sendEmail } from '../utils/sendEmail';
import { RegisterInput } from './register/RegisterInput';

@ObjectType()
class FieldError {
  @Field()
  field!: string;

  @Field()
  message!: string;
}

@ObjectType()
class RegisterResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver(User)
export class RegisterResolver {
  @Query(() => String)
  hello() {
    return 'hello!';
  }

  @Mutation(() => RegisterResponse)
  async register(@Arg('data') data: RegisterInput): Promise<RegisterResponse> {
    const { password, email } = data;
    const hashedPassword = await bcrypt.hash(password, 12);

    try {
      const user = await User.create({
        email,
        password: hashedPassword,
      }).save();

      if (!user) {
        return {errors: [{field: 'password', message: 'Could not create user'}, {field: 'email', message: 'Could not create user'} ]}
      }

      await sendEmail({
        email,
        url: await createAccountConfirmationUrl(user.id),
        subjectIndex: 0,
      });

      return { user };
    } catch (e) {
      console.log(e);
      if(e.code === ApiErrorCodes.UniqueEntryConstraintErrorCode)
          return {
            errors: [{field: 'email', message: 'Email already exists'}]
          } 
      }
      return {
        errors: undefined
      }
    }
  }


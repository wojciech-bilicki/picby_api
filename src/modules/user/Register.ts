import * as bcrypt from 'bcryptjs';
import {
  Arg,
  Mutation,
  Query,
  Resolver,
} from 'type-graphql';
import { User } from '../../entity/User';
import { ApiErrorCodes } from '../../utils/errorCodes';
import { createAccountConfirmationUrl } from '../utils/createAccountConfirmationUrl';
import { sendEmail } from '../utils/sendEmail';
import { validateRegisterInput } from './register/register.inputValidator';
import { AuthorizationInput } from './AuthorizationInput';
import AuthorizationResponse from './AuthorizationResponse';



@Resolver(User)
export class RegisterResolver {
  @Query(() => String)
  hello() {
    return 'hello!';
  }

  @Mutation(() => AuthorizationResponse)
  async register(@Arg('data') data: AuthorizationInput): Promise<AuthorizationResponse> {
    const validationErrors = validateRegisterInput(data);

    if(validationErrors) {
      return {
        errors: validationErrors
      }
    }

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
      console.log(e.code);
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


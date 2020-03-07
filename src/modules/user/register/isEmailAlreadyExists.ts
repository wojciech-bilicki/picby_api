import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { User } from '../../../entity/User';

@ValidatorConstraint({ async: true })
export class DoesEmailExistConstraint
  implements ValidatorConstraintInterface {
  async validate(email: string) {
    const user = User.findOne({where:{email}})
    return !!user;
  }
}

export function DoesEmailExist(validationOptions?: ValidationOptions) {
  return function(object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: DoesEmailExistConstraint
    });
  };
}

import { Field, InputType } from "type-graphql";
import { PasswordInput } from "../shared/PasswordInput";
import { DoesEmailExist } from "./register/isEmailAlreadyExists";

@InputType()
export class AuthorizationInput extends PasswordInput {
  @Field()
  @DoesEmailExist({message: "email already in use"})
  email!: string;

}
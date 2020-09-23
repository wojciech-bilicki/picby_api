import { Field, InputType } from "type-graphql";
import { PasswordInput } from "../../shared/PasswordInput";
import { DoesEmailExist } from "./isEmailAlreadyExists";

@InputType()
export class RegisterInput extends PasswordInput {
  @Field()
  @DoesEmailExist({message: "email already in use"})
  email!: string;

}
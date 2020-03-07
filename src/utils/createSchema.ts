import { buildSchema } from "type-graphql";
import { CatalogResolver } from "../modules/catalogs/CatalogResolver";
import { EntryResolver } from "../modules/entries/EntryResolver";
import { ChangePasswordResolver } from "../modules/user/ChangePassword";
import { ConfirmUserResolver } from "../modules/user/ConfirmUser";
import { ForgotPasswordResolver } from "../modules/user/ForgotPassword";
import { LoginResolver } from "../modules/user/Login";
import { MeResolver } from "../modules/user/Me";
import { RegisterResolver } from "../modules/user/Register";


export const createSchema = async () =>  await buildSchema({
  resolvers: [EntryResolver, CatalogResolver, ChangePasswordResolver,ConfirmUserResolver, ForgotPasswordResolver, LoginResolver, MeResolver, RegisterResolver],
  validate: true,

});
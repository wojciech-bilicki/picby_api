import { Field, InputType } from "type-graphql";

@InputType()
export class UpdateEntryInput {

  @Field()
  id: string;

  @Field({nullable: true})
  description: string;

  @Field({nullable: true})
  currentCatalogId: string;

  @Field({nullable: true})
  newCatalogId: string;



}

@InputType() 
export class RemoveEntryInput {
  @Field()
  id: string;

  @Field()
  catalogId: string;
}
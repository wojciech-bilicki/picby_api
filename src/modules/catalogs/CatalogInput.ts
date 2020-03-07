import { MaxLength } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType()
export class CreateCatalogInput {
  @Field()
  @MaxLength(30)
  name: string;
}

@InputType()
export class ReadCatalogsInput {
  @Field({nullable: true})
  skip: number;

  @Field({nullable: true})
  take: number
}


@InputType()
export class UpdateCatalogInput extends CreateCatalogInput {

  @Field()
  id: string
}
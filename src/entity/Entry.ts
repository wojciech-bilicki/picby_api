import { Ctx, Field, ID, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Context } from "../types/Context";
import { Catalog } from "./Catalog";
import { User } from "./User";

@ObjectType()
@Entity()
export class Entry extends BaseEntity {
  
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column("text")
  desc: string;

  @ManyToOne(() => Catalog, catalog => catalog.entries, {onDelete: 'CASCADE' })
  catalog: Catalog;

  @Field(() => String)
  imageUrl(@Ctx() context: Context): string {
    return `${context.url}/images/${this.catalog.id}/${this.id}.png`;
  }

  @ManyToOne(() => User, user => user.entries)
  user: User
}

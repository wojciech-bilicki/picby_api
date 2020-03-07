import { Field, ID, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Entry } from "./Entry";
import { User } from "./User";

@ObjectType()
@Entity()
export class Catalog extends BaseEntity {
  
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column("text", {unique: true})
  name: string;

  @OneToMany(() => Entry, entry => entry.catalog)
  entries: Promise<Entry[]>

  @ManyToOne(() => User, user => user.catalogs)
  user: User;
}

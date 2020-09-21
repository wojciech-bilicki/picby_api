import { Field, ID, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Catalog } from "./Catalog";
import { Entry } from "./Entry";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Field()
  @Column("text", {unique: true})
  email!: string;

  @Column()
  password!: string;

  @Column('bool', {default: false})
  isConfirmed!: boolean;

  @Field(() =>[Catalog], {nullable: true})
  @OneToMany(() => Catalog, catalog => catalog.user, {eager: true})
  catalogs?: Catalog[];

  @Field(() => [Entry], {nullable: true})
  @OneToMany(() => Entry, entry => entry.user)
  entries?: Entry[]

}

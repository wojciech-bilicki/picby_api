import { Field, ID, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Entry } from "./Entry";
import { User } from "./User";

@ObjectType()
@Entity()
export class Catalog extends BaseEntity {
  
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Field()
  @Column("text", {unique: true})
  name!: string;

  @Field(() => Int)
  entryCount() {
    return this.entries?.then(entries => entries.length)
  }

  @OneToMany(() => Entry, entry => entry.catalog)
  entries?: Promise<Entry[]>

  @ManyToOne(() => User, user => user.catalogs)
  user!: User;
}

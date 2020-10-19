import {  Field, ID, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Catalog } from "./Catalog";
import { User } from "./User";

@ObjectType()
@Entity()
export class Entry extends BaseEntity {
  
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Field()
  @Column("text")
  desc!: string;

  @Field()
  @Column()
  catalogId!: string;

  @ManyToOne(() => Catalog, catalog => catalog.entries, {onDelete: 'CASCADE' })
  catalog!: Catalog;

  @Field()
  @Column('text')
  imageUrl!: string

  @Field()
  @Column()
  userId!: string;

  @ManyToOne(() => User, user => user.entries)
  user!: User
}

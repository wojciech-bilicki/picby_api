import { UserInputError } from "apollo-server-express";
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { FileUpload } from "graphql-upload";
import { GraphQLUpload} from 'apollo-server'


import { User } from "../../entity/User";
import { Context } from "../../types/Context";
import { Entry } from "../../entity/Entry";
import { withAuthenticatedUser } from "../middleware/withAuthenticatedUser";
import { removeImage, saveImage } from "../utils/fileOperations";
import { getCatalogById } from "./entries.utils";
import { UpdateEntryInput } from "./EntryInput";
import { v4 as uuidv4 } from 'uuid';
;

@Resolver()
export class EntryResolver {

  @UseMiddleware(withAuthenticatedUser)
  @Mutation(() => Boolean)
  async addEntry(
    @Arg("photo", ()  => GraphQLUpload!, {nullable: true}) photo: FileUpload,
    @Arg("description") description: string,
    @Arg("catalogId", {nullable: true}) catalogId: string,
    @Ctx() {req, url}: Context
  ):Promise<boolean> {
    

    const entryId = uuidv4()
    
    const entry = await Entry.create({ 
      id: entryId,
      desc: description,
      catalogId: catalogId,
      userId: req.session.userId,
      imageUrl:   `${url}/images/${catalogId}/${entryId}.png`

     }).save();
  
    const { createReadStream } = await photo;
   
    const result = await saveImage({createReadStream, id: entry.id, catalogId })
     
    return result;
  }

  @Query(() => [Entry])
  @UseMiddleware(withAuthenticatedUser)
  async entries(@Ctx() {req}: Context) {

    const result = await Entry.createQueryBuilder().select().where({userId: req.session.userId}).getMany()
    return result;
  }

  @Query(() => Entry, {nullable: true})
  @UseMiddleware(withAuthenticatedUser)
  async entry(@Arg('id') id:string, @Ctx() {req}: Context) {
    return await Entry.findOne({where: {id, userId: req.session.userId}})
  }

  @UseMiddleware(withAuthenticatedUser)
  @Mutation(() => Entry) 
  async removeEntry(@Arg('id') id: string, @Arg('catalogId') catalogId: string,  @Ctx() {req}: Context): Promise<Entry> {

      if(!req.session.userId) {
        throw new Error("NO user")
      }

      const user = await  User.findOne(req.session.userId)
      if(!user) {
        throw new Error("No user in DB")
      }
      const userCatalog = user.catalogs?.find(catalog => catalog.id === catalogId);
      if(!userCatalog) {
        throw new UserInputError(`No catalog for id: ${catalogId}`)
      }
      const catalogEntries = await userCatalog.entries;
      const entryToRemove = catalogEntries?.find(entry => entry.id === id);
      if(!entryToRemove) {
        throw new UserInputError(`No entry for id: ${id}`)
      }
      //remove the associated photo file
      const wasFileRemoved = await removeImage({catalogId, id: entryToRemove.id});
      if(!wasFileRemoved) {
        throw new Error(`Could not remove entry`)
      }

      const result =  await entryToRemove.remove()
      if(!result) {
        throw new Error(`Could not remove entry`);
      }

      return result;
    }

@UseMiddleware(withAuthenticatedUser)
@Mutation(() => Entry)
async updateEntry(
    @Arg('data') {currentCatalogId, id, newCatalogId, description}:UpdateEntryInput,
    @Arg("photo", () => GraphQLUpload!, {nullable: true}) photo: FileUpload,
    @Ctx() {req}: Context
    ) {

      if(!req.session.userId) {
        throw new UserInputError("No user with authentication");
      }
      const catalog = await getCatalogById({user: req.session.userId,catalogId: currentCatalogId})
      const catalogEntries =  await catalog.entries;
      const updateEntry = catalogEntries?.find(catalogEntry => catalogEntry.id = id)
      if(!updateEntry) {

        throw new UserInputError("Couldn't find entry to update");
      }

      //user wants to move the entry from catalog to catalog
      if(newCatalogId) {
        const newCatalog = await getCatalogById({user: req.session.userId, catalogId: newCatalogId});
      updateEntry.catalog = newCatalog;
      }

      if(description) {
        updateEntry.desc = description;        
      }

      const entryAfterUpdate = await updateEntry.save()

      if(!photo) {
        return entryAfterUpdate;
      } else  {
        const {createReadStream} = photo;
        const result = saveImage({
          createReadStream,
          id: entryAfterUpdate.id,
          catalogId: newCatalogId || currentCatalogId
        })
        if(!result) {
          throw new Error(`Could not update entry`);
        } else {
          return entryAfterUpdate;
        }
      }
    }
} 



import { UserInputError, GraphQLUpload } from "apollo-server-express";
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { User } from "../../entity/User";
import { Context } from "../../types/Context";
import { Entry } from "../../entity/Entry";
import { withAuthenticatedUser } from "../middleware/withAuthenticatedUser";
import { removeImage, saveImage } from "../utils/fileOperations";
import { getCatalogById } from "./entries.utils";
import { UpdateEntryInput } from "./EntryInput";
import { ReadStream } from "typeorm/platform/PlatformTools";

export interface FileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream(): ReadStream;
}

@Resolver()
export class EntryResolver {

  @UseMiddleware(withAuthenticatedUser)
  @Mutation(() => Boolean)
  async addEntry(
    @Arg("photo", ()  => GraphQLUpload!) photo: FileUpload,
    @Arg("description") description: string,
    @Ctx() {req}: Context,
    @Arg("catalogId", {nullable: true}) catalogId?: string,
  ):Promise<boolean> {

    if(!req.session.userId) {
      return false
    }

    const catalog = await getCatalogById({catalogId, user: req.session.userId})
    const entry = await Entry.create({ desc: description}).save();
    const { createReadStream } = await photo;
    // const catalog = await Catalog.findOneOrFail(catalogId)
    console.log(photo)
    const result = await saveImage({createReadStream, id: entry.id, catalogId: catalog.id})
    if(result) {
      let catalogEntries = await catalog.entries;
      if(catalogEntries ) {
        catalogEntries.push(entry); 
      } else {
        catalogEntries = [entry];
      }
      await catalog.save()
    }
    return result;
  }

  @Query(() => [Entry])
  @UseMiddleware(withAuthenticatedUser)
  async entries(@Ctx() {req}: Context) {
    const userId = req.session.userId
    const entries = await Entry.find({where: { user: userId }});
    return entries;
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



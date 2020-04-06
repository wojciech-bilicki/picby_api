import { UserInputError } from 'apollo-server-express';
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';
import { Catalog } from '../../entity/Catalog';
import { Context } from '../../types/Context';
import { withAuthenticatedUser } from '../middleware/withAuthenticatedUser';
import { CreateCatalogInput, UpdateCatalogInput } from './CatalogInput';

@Resolver(Catalog)
export class CatalogResolver {
  @UseMiddleware(withAuthenticatedUser)
  @Query(() => [Catalog])
  catalogs(
    @Ctx() {user}: Context
  ): Catalog[]  {
    return user?.catalogs || [];
  }

  @UseMiddleware(withAuthenticatedUser)
  @Query(() => Catalog)
  catalog(@Arg('id') id: string, @Ctx() {user}: Context): Catalog  {
    const catalog = user?.catalogs.find(catalog => catalog.id === id)
    if(!catalog) {
      //TODO: check how the fuck should we actually handle errors in graphql
      throw new Error("Couldn't find catalog with given ID")
    }
    return catalog; 
  }

  @UseMiddleware(withAuthenticatedUser)
  @Mutation(() => Catalog, { nullable: true })
  async addCatalog(
    @Arg('newCatalogData') newCatalogData: CreateCatalogInput,
    @Ctx() ctx: Context
  ): Promise<Catalog | null> {
    const {user} = ctx;
    if(!user) {
      throw new Error("There's no authenticated user")
    }
    const catalog = await Catalog.create(newCatalogData);

    catalog.user = user;
    await catalog.save();

    return catalog;
  }


  @UseMiddleware(withAuthenticatedUser)
  @Mutation(() => Boolean)
  async removeCatalog(@Arg('id') id: string, @Ctx() ctx: Context):Promise<Boolean> {
    //TODO: Throw some nice descriptive errors instead of returning false
      const { user } = ctx;

      if(!user) {
        return false;
      }

      const catalogToRemove = user?.catalogs.find(catalog => catalog.id === id);
      if(!catalogToRemove) {
        throw new UserInputError("Catalog with given id not found")
      }
      await catalogToRemove.remove()
    
      return true;
  }

  
  @UseMiddleware(withAuthenticatedUser)
  @Mutation(() => Catalog) 
  async updateCatalog(@Arg('data') data: UpdateCatalogInput, @Ctx() ctx: Context):Promise<Catalog> {

    const { user } = ctx;
      console.error(user)
      if(!user) {
        throw new Error("User not available")
      }

      const catalogToUpdate = user?.catalogs.find(catalog => catalog.id === data.id);
      if(!catalogToUpdate) {
        throw new UserInputError("Catalog with given id not found")
      }
      catalogToUpdate.name = data.name;
      const updatedCatalog = catalogToUpdate.save();
      return updatedCatalog;
  }
}

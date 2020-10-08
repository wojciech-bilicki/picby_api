import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';
import { getConnection } from 'typeorm';
import { Catalog } from '../../entity/Catalog';
import { Context } from '../../types/Context';
import { withAuthenticatedUser } from '../middleware/withAuthenticatedUser';
import { CreateCatalogInput, UpdateCatalogInput } from './CatalogInput';

@Resolver(Catalog)
export class CatalogResolver {
  @UseMiddleware(withAuthenticatedUser)
  @Query(() => [Catalog])
  async catalogs(
    @Ctx() {req}: Context
  ): Promise<Catalog[]>  {
    
    return await Catalog.find({user: req.session.userId})
    }

  @UseMiddleware(withAuthenticatedUser)
  @Query(() => Catalog)
  async catalog(@Arg('id') id: string, @Ctx() {req}: Context): Promise<Catalog> {
    const catalog = await Catalog.findOne({where: {id, user: req.session.userId }})
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
    @Ctx() {req}: Context
  ): Promise<Catalog | null> {
  
    return await Catalog.create({
      ...newCatalogData,
      user: req.session.userId
    }).save()

  }


  @UseMiddleware(withAuthenticatedUser)
  @Mutation(() => Boolean)
  async removeCatalog(@Arg('id') id: string, @Ctx() {req}: Context):Promise<Boolean> {
    //TODO: Throw some nice descriptive errors instead of returning false
  

       await Catalog.delete({id, user: req.session.userId })
    
    
      return true;
  }

  
  @UseMiddleware(withAuthenticatedUser)
  @Mutation(() => Catalog) 
  async updateCatalog(@Arg('data') data: UpdateCatalogInput, @Ctx() {req}: Context):Promise<Catalog> {

    const result = await getConnection()
      .createQueryBuilder()
      .update(Catalog)
      .set({name: data.name})
      .where('id = :id abd "userId" := userId', {
        id: data.id,
        userId:req.session.userId 

      })
      .returning("*")
      .execute()

      return result.raw[0]
  }
}


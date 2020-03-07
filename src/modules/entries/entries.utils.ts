import { UserInputError } from 'apollo-server-express';
import { Catalog } from '../../entity/Catalog';
import { User } from '../../entity/User';

const DEFAULT_CATALOG_NAME = 'default';

interface GetCatalogByIdArgs {
  catalogId?: string;
  user: User;
}

export const getCatalogById = async ({catalogId, user}: GetCatalogByIdArgs): Promise<Catalog> => {
  const defaultCatalog = await Catalog.findOne({ where: { name: DEFAULT_CATALOG_NAME, user: user } });

  if (!catalogId) {
    if (!defaultCatalog) {
      //user didn't specify catalog to which he'd like to add the entry and there's no default catalog yet so we have to create it
      const newDefaultCatalog = await Catalog.create({
        name: DEFAULT_CATALOG_NAME,
        
      })
      newDefaultCatalog.user = user;
      await newDefaultCatalog.save()
      return newDefaultCatalog;
    } else {
      return defaultCatalog;
    }
  } else {
    const expectedCatalog = await Catalog.findOne({where: {id: catalogId, user: user}});
    if (!expectedCatalog) {
      throw new UserInputError(`Catalog with ${catalogId} id does not exist`);
    }
    return expectedCatalog;
  }
};
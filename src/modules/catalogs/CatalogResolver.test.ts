import { internet } from 'faker';
import { Catalog } from 'src/entity/Catalog';
import { Connection } from 'typeorm';
import { User } from '../../entity/User';
import { redis } from '../../redis';
import { gCall } from '../../test-utils/gCall';
import { testConnection } from '../../test-utils/testConnection';

let conn: Connection;
let userId: string;

const registerMutation = `
  mutation Register($data: RegisterInput!) {
    register(data: $data) {
      id
      email
    }
  }
`;

interface RegisterResponse {
  register: {
    id: string;
  };
}

beforeAll(async () => {
  conn = await testConnection();
  if (redis.status === 'end') {
    await redis.connect();
  }

  const user = {
    email: internet.email(),
    password: internet.password(8)
  };

  const response = await gCall<RegisterResponse>({
    source: registerMutation,
    variableValues: {
      data: user
    }
  });

  if (response?.data?.register.id) {
    userId = response?.data?.register.id;
  }
});

afterAll(async () => {
  await conn.close();
  redis.disconnect();
});

const addCatalogMutation = `
mutation AddCatalog($data: CreateCatalogInput!) {
  addCatalog(newCatalogData: $data) {
    id
    name
  }
}`;

const catalogsQuery = `
query {
  catalogs {
    id
    name
  }
}`;

const removeCatalogMutation = `
mutation RemoveCatalog($data: String!) {
  removeCatalog(id: $data) 
}
`;

describe('CatalogResolver', () => {
  it('should allow user to add catalogs ', async () => {
    const response = await gCall({
      source: addCatalogMutation,
      userId: userId!,
      variableValues: {
        data: {
          name: 'Wakacje'
        }
      }
    });

    expect(response).toMatchObject({
      data: {
        addCatalog: {
          name: 'Wakacje'
        }
      }
    });

    const dbUser = await User.findOne(userId);
    expect(dbUser?.catalogs).toBeDefined();
    expect(dbUser?.catalogs).toHaveLength(1);
  });

  interface CatalogResponse {
    catalogs: Catalog[];
  }

  it('should allow user to remove catalogs', async () => {
    const { data } = await gCall<CatalogResponse>({
      source: catalogsQuery,
      userId: userId!
    });
    if (!data) {
      fail('No response for catalog query');
    }

 
    const { catalogs } = data;
    const beforeRemovalCatalogLength = catalogs.length;

    const catalogIdToRemove = catalogs[0].id;

     await gCall<Catalog>({
      source: catalogQuery,
      userId: userId!,
      variableValues: {
        data: catalogIdToRemove
      }
    })

   await gCall({
      source: removeCatalogMutation,
      variableValues: {
        data: catalogIdToRemove
      },
      userId: userId!
    });


    const { data: afterRemovalData } = await gCall<CatalogResponse>({
      source: catalogsQuery,
      userId: userId!
    });

    if (!afterRemovalData) {
      fail('No response for catalog query');
    }
    const { catalogs: afterRemovalCatalogs } = afterRemovalData;
    expect(afterRemovalCatalogs.length).toBeLessThan(
      beforeRemovalCatalogLength
    );
  });

  const catalogQuery = `
  
    query  FindCatalogById($data: String!){
 catalog(id: $data) {
  id
  name
}
}
  `;

interface AddCatalogResponse {
  addCatalog: Catalog
}

interface GetCatalogResponse {
  catalog: Catalog
}

  it('should allow user to get catalog by id', async () => {
  const addCatalogResponse = await gCall<AddCatalogResponse>({
      source: addCatalogMutation,
      userId: userId!,
      variableValues: {
        data: {
          name: 'Wakacje'
        }
      }
    });

    const { data  } = addCatalogResponse;
    
    if (!data) {
      fail('No response for add catalog mutation');
    }

    const { addCatalog: {id} } = data;

    const getCatalogResponse = await gCall<GetCatalogResponse>({
      source: catalogQuery,
      userId: userId!,
      variableValues: {
        data: id
      }
    })

    const {data: getCatalogData} = getCatalogResponse;
    if(!getCatalogData) {
      fail('No response for get catalog query')
    }
    
    expect(getCatalogData.catalog.name).toEqual('Wakacje')

  });
});

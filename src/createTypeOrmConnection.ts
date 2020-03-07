import { createConnection, getConnectionOptions } from "typeorm";

export const createTypeormConn = async () => {
  const options = await getConnectionOptions(
    process.env.NODE_ENV
  );
  
  return process.env.NODE_ENV === 'production' ?
    createConnection({
    ...options,
    url: process.env.DATABASE_URL  ,
    name: "default" } as any) : 
    createConnection({...options, name: "default"})
  
}


import { createWriteStream, existsSync, mkdirSync, unlink } from 'fs';
import path from 'path';
import { Stream } from 'stream';

interface SaveImageArgs {
  createReadStream: () => Stream;
  /* entry id */
  id: string;
  catalogId: string;
}

const getPathToCatalog = (catalogId: string) => path.join(__dirname,`../../../images/${catalogId}/`)

const getPathToFile = (catalogId: string, entryId: string) => path.join(getPathToCatalog(catalogId), `${entryId}.png`);

const saveImage = ({
  createReadStream,
  id,
  catalogId
}: SaveImageArgs): Promise<boolean> =>
  new Promise((resolve, reject) => {
    /* check if folder for given catalog already exists */ 
    const pathToCatalog = getPathToCatalog(catalogId); 
    if(!existsSync(pathToCatalog))   {
      /* if not create one */
      mkdirSync(pathToCatalog, {recursive: true})
    } 
    // add photo to a folder
    return createReadStream()
      .pipe(createWriteStream(getPathToFile(catalogId, id)))
      .on('finish', () => resolve(true))
      .on('error', err => {
        console.log(err);
        return reject(false);
      })
  })

  type RemoveImageArgs = Omit<SaveImageArgs, 'createReadStream'>

const removeImage = ({id, catalogId}:RemoveImageArgs) => {

  const pathToFile = getPathToFile(catalogId, id);

  return new Promise((resolve) => {
    unlink(pathToFile, (err) => {
      if(err) {
        resolve(false)
      }
      resolve(true)
    })
  })
}


export { removeImage, saveImage };


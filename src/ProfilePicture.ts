import { Resolver, Mutation, Arg } from "type-graphql";
import { GraphQLUpload }  from 'apollo-server'
import { FileUpload } from "graphql-upload";

import { createWriteStream } from "fs";


@Resolver()
export class ProfilePictureResolver {
  @Mutation(() => Boolean)
  async addProfilePicture(@Arg("picture", () => GraphQLUpload!)
  upload: FileUpload): Promise<boolean> {
    console.log(upload)
    return new Promise(async (resolve, reject) =>
      upload.createReadStream()
        .pipe(createWriteStream(__dirname + `/../images/${upload.filename}`))
        .on("finish", () => resolve(true))
        //@ts-ignore
        .on("error", (err) => {
          console.log(err)
          reject(false)
        })
    );
  }
}
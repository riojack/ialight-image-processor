import util from "util";
import fs from "fs";

const unlinkAsync = util.promisify(fs.unlink);
const gm = require('gm').subClass({ imageMagick: '7+' });

export async function modifyImage(buffer: Buffer, location: string): Promise<void> {
  return new Promise((done, fail) => {
    gm(buffer)
      .resize("50%")
      .write(location, function (err: any) {
        if (!err) {
          done();
        } else {
          fail(err);
        }
      });
  });
}

export async function deleteFile(filePath: string): Promise<void> {
  try {
    await unlinkAsync(filePath);
  }
  catch (e) {
    console.log("Encountered unlink error " + e);
  }
}

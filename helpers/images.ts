import { Readable, Stream } from "stream";
import util from "util";
import fs from "fs";

const gm = require('gm').subClass({ imageMagick: '7+' });

export async function modifyImage(stream: Stream): Promise<ReadableStream> {
  return new Promise((done, fail) => {
    gm(stream)
      .resize(100, 100)
      .stream(function (err: Error, stdout: ReadableStream, stderr: Stream) {
        if (err) {
          fail(err);
        }
        else {
          done(stdout);
        }
      });
  });
}

export async function deleteFile(filePath: string): Promise<void> {
  const unlinkAsync = util.promisify(fs.unlink);
  try {
    await unlinkAsync(filePath);
  }
  catch (e) {
    console.log("Encountered unlink error " + e);
  }
}

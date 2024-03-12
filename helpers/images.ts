import { Readable, Stream } from "stream";
import util from "util";
import fs from "fs";

const { log } = console;

const gm = require('gm').subClass({ imageMagick: '7+' });

export async function modifyImage(stream: Stream): Promise<ReadableStream> {
  return new Promise((done, fail) => {
    gm(stream)
      .resize(100, 100)
      .stream(function (err: Error, stdout: ReadableStream, stderr: Stream) {
        log('After resize 1')
        if (err) {
          fail(err);
          log('After resize 2')
        }
        else {
          log('After resize 3')
          done(stdout);
        }
        log('After resize 10')
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

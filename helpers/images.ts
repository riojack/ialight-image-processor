import { Readable, Stream } from "stream";

const gm = require('gm').subClass({ imageMagick: '7+' });

export async function modifyImage(stream: Stream) :Promise<ReadableStream>{
  return new Promise((done) => {
    gm(stream)
    .resize(100, 100)
    .stream(function (err: Error, stdout:ReadableStream, stderr:Stream) {
      done(stdout);
    });
  });
}

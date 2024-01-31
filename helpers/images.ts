import { Readable, Stream } from "stream";

const gm = require('gm').subClass({ imageMagick: '7+' });

export async function modifyImage(stream: Stream) :Promise<Readable>{
  return new Promise((done) => {
    gm(stream)
    .resize(100, 100)
    .stream(function (err: Error, stdout:Readable, stderr:Stream) {
      done(stdout);
    });
  });
}

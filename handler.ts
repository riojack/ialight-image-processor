import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { NodeJsClient } from "@smithy/types";
import { Context, SQSEvent } from 'aws-lambda';
import fs from 'fs';
import path from 'path';
import util from 'util';
import { finished } from 'stream/promises';
import { modifyImage } from "./helpers/images";
import { getFileFromS3 } from './helpers/s3';

const s3Client = new S3Client({}) as NodeJsClient<S3Client>;
const readFileAsync = util.promisify(fs.readFile);

exports.handler = async function (event: SQSEvent, context: Context) {
    for (const record of event.Records) {
        const s3FilePath = record.body;
        const extension = path.extname(s3FilePath);
        const fileName = path.parse(s3FilePath).name;
        const s3filePathnoext = path.basename(s3FilePath, extension);
        const news3filePath = `${s3filePathnoext}_100X100${extension}`;
        const s3File = await getFileFromS3(s3FilePath, s3Client);

        const s3ImageWriter = fs.createWriteStream(`/tmp/image_${fileName}.jpg`, { mode: 0o777 });
        await s3File.pipe(s3ImageWriter);
        await finished(s3ImageWriter);

        const imageFromS3AsBuffer = await readFileAsync(`/tmp/image_${fileName}.jpg`);
        await modifyImage(imageFromS3AsBuffer, `/tmp/image_${fileName}_resized.jpg`);

        const resizedImageAsBuffer = await readFileAsync(`/tmp/image_${fileName}_resized.jpg`);

        const upload = new Upload({
            client: s3Client,
            params: { Bucket: 'iowalight.com', Key: news3filePath, Body: resizedImageAsBuffer }
        });

        await upload.done();
    }
};

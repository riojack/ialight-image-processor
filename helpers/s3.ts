import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Readable, Stream } from "stream";

export async function getFileFromS3(s3FilePath: string, s3Client: S3Client): Promise<any> {
  const cmd = new GetObjectCommand({ Bucket: 'iowalight.com', Key: s3FilePath });
  const obj = await s3Client.send(cmd);
  if (!obj.Body) {
    throw "Body could not be loaded for S3 file: " + s3FilePath;
  }
  return obj.Body;
}

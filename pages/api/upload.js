import aws from "aws-sdk";
import sha1 from 'sha1';
import jsonToEnv from "json-to-env2";
import { getSession } from "next-auth/client";
import { isUserAllowed } from "../../src/utils/isUserAllowed";
import { downloadFromS3 } from "./download";
import EnvUpdateLogModel from "../../src/models/EnvUpdateLog.model";
import { createOrReturnDBConnection } from "../../src/utils/createOrReturnDBConnection";

function getSafeEnvString(envData = {}) {
  const envKeys = Object.entries(envData).reduce((acc, [key, value]) => {
    acc[key] = sha1(value);
    return acc;
  }, {});

  return jsonToEnv(envKeys);
}

async function createUploadLog({
  userName,
  userEmail,
  oldDocument,
  newDocument,
}) {
  return EnvUpdateLogModel.create({
    userName,
    userEmail,
    oldDocument,
    newDocument,
  });
}

export async function uploadToS3({ s3, fileName, buffer }) {
  return new Promise((resolve, reject) => {
    s3.putObject(
      {
        Bucket: process.env.BUCKET_NAME,
        Key: fileName,
        ContentType: "application/x-envoy",
        // ContentType: mimeType || res.headers.get('content-type'),
        // ContentLength: res.headers.get('content-length'),
        Body: buffer,
      },
      (err, res) => {
        console.log("err", err);
        if (err) return reject({ status: false, message: err.message });
        return resolve({ status: true, data: res });
      }
    );
  });
}

export default async function handler(req, res) {
  const [session] = await Promise.all([
    getSession({ req }),
    createOrReturnDBConnection(),
  ]);
  const { fileName, content, environment } = req.body;
  const isAllowed = isUserAllowed({ environment, email: session?.user?.email });

  if (!isAllowed)
    return res.status(401).json({
      status: false,
      message: `You do not have permission for ${environment}`,
    });

  const envString = jsonToEnv(JSON.parse(content));
  const buffer = Buffer.from(envString, "utf8");

  aws.config.update({
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
    region: process.env.REGION,
    signatureVersion: "v4",
  });

  const s3 = new aws.S3();

  const oldEnvDataPromise = downloadFromS3({
    s3,
    Bucket: process.env.BUCKET_NAME,
    Key: fileName,
  });

  const uploadEnvPromise =  uploadToS3({ s3, fileName, buffer });

  const [{ data: oldDocument }, uploadResponse] = await Promise.all([
    oldEnvDataPromise,
    uploadEnvPromise,
  ]);

  const xx = await createUploadLog({
    userName: session.user.name,
    userEmail: session.user.email,
    oldDocument: getSafeEnvString(oldDocument),
    newDocument: getSafeEnvString(JSON.parse(content)),
  });

  res.status(200).json(uploadResponse);
}

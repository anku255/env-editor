import aws from "aws-sdk";
import jsonToEnv from "json-to-env2";
import { getSession } from "next-auth/client";
import { isUserAllowed } from "../../src/utils/isUserAllowed";

export default async function handler(req, res) {
  const session = await getSession({ req });
  const { fileName, content, environment } = req.body;
  const isAllowed = isUserAllowed({ environment, email: session?.user?.email });
  
  if (!isAllowed)
    return res
      .status(401)
      .json({
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

  const data = await new Promise((resolve, reject) => {
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
  res.status(200).json(data);
}

import aws from "aws-sdk";
import { getSession } from "next-auth/client";
import { isUserAllowed } from "../../src/utils/isUserAllowed";

function parseEnvString(envString) {
  const lines = envString.split("\n");
  const data = lines.filter(Boolean).reduce((acc, curr) => {
    const [key, value] = curr.split("=");
    acc[key] = (value || "").replace(/\'/g, "");
    return acc;
  }, {});
  return data;
}

export async function downloadFromS3  ({ s3, Bucket, Key  })  {
  return new Promise((resolve, reject) => {
    s3.getObject({ Bucket, Key }, function (err, fileContents) {
      if (err) {
        console.log("err", err);
        resolve({ status: false, message: err.message });
      } else {
        // Read the file
        const contents = fileContents.Body.toString();
        resolve({ status: true, data: parseEnvString(contents) });
      }
    });
  });
}

export default async function handler(req, res) {
  const session = await getSession({ req });
  const { environment, repoName, fileName } = req.query;
  const isAllowed = isUserAllowed({ environment, email: session?.user?.email });

  if (!isAllowed)
    return res
      .status(401)
      .json({
        status: false,
        message: `You do not have permission for ${environment}`,
      });

  aws.config.update({
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
    region: process.env.REGION,
    signatureVersion: "v4",
  });

  const s3 = new aws.S3();

  var fileParams = {
    Bucket: process.env.BUCKET_NAME,
    Key: `${environment}/${repoName}/${fileName}`,
  };

  const response = await downloadFromS3({ s3, Bucket: fileParams.Bucket, Key: fileParams.Key });

  if(res.status) {
    return res.status(200).json(response);
  }

  return res.status(500).json(response);
}

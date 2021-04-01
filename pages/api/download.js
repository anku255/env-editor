import aws from 'aws-sdk';

function parseEnvString(envString) {
  const lines = envString.split('\n');
  const data = lines.filter(Boolean).reduce((acc, curr) => {
    const [key, value] = curr.split('=');
    acc[key] = (value || '').replace(/\'/g, '');
    return acc;
  }, {})
  return data;
}

export default async function handler(req, res) {
  aws.config.update({
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
    region: process.env.REGION,
    signatureVersion: 'v4',
  });

  const s3 = new aws.S3();

  const { environment, repoName, fileName } = req.query;

  var fileParams = {
    Bucket: process.env.BUCKET_NAME,
    Key: `${environment}/${repoName}/${fileName}`
  }

  s3.getObject(fileParams, function(err, fileContents){

    if (err) {
      console.log("err", err);
      res.status(500).json({ status: false, message: err.message });
    } else {
      // Read the file
      const contents = fileContents.Body.toString();
      res.status(200).json({ status: true, data: parseEnvString(contents)});
    }
  });
}
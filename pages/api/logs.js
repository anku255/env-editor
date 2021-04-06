import { getSession } from "next-auth/client";
import { isUserAllowed } from "../../src/utils/isUserAllowed";
import EnvUpdateLogModel from "../../src/models/EnvUpdateLog.model";
import { createOrReturnDBConnection } from "../../src/utils/createOrReturnDBConnection";

export default async function handler(req, res) {
  const [session] = await Promise.all([
    getSession({ req }),
    createOrReturnDBConnection(),
  ]);
  const { environment, repoName, fileName } = req.query;
  const isAllowed = isUserAllowed({ environment, email: session?.user?.email });

  if (!isAllowed)
    return res.status(401).json({
      status: false,
      message: `You do not have permission to view logs for ${environment}`,
    });

  try {
    const logs = await EnvUpdateLogModel.find({
      environment,
      repoName,
      fileName,
    })
      .sort({ createdAt: -1 })
      .limit(20);
    res.status(200).json({ status: true, data: logs });
  } catch (error) {
    console.log("error", error);
    res.status(200).json({ status: false, message: error.message });
  }
}

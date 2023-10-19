import { errorToPrettyError } from "@/utils/errors";
import { Database } from "@tableland/sdk";
import { randomUUID } from "crypto";
import { Wallet, getDefaultProvider } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Define request params
    const projectId = req.body.projectId;
    const activityIndex = req.body.activityIndex;
    const activityType = req.body.activityType;
    const authorAddress = req.body.authorAddress;
    const content = req.body.content;
    // Init database
    const wallet = new Wallet(
      process.env.TABLELAND_DATABASE_OWNER_PRIVATE_KEY as string
    );
    const provider = getDefaultProvider(
      process.env.TABLELAND_DATABASE_PROVIDER
    );
    const signer = wallet.connect(provider);
    const database = new Database({ signer });
    const table = process.env.NEXT_PUBLIC_TABLELAND_DATABASE_TABLE;
    // Insert data
    const statement = database
      .prepare(`INSERT INTO ${table} VALUES (?1,?2,?3,?4,?5,?6,?7);`)
      .bind(
        randomUUID(),
        projectId,
        activityIndex,
        activityType,
        authorAddress,
        Math.floor(Date.now() / 1000),
        content
      );
    const result = await statement.all();
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: errorToPrettyError(error) });
  }
}

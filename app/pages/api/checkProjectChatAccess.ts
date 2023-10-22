import { projectContractAbi } from "@/contracts/abi/projectContract";
import { errorToPrettyError } from "@/utils/errors";
import { didToAddress } from "@/utils/pushprotocol";
import { Contract, ethers, getDefaultProvider } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";
import { polygonMumbai } from "viem/chains";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Define params
    const projectId = req.query.projectId;
    const userDid = req.query.userDid;
    const chainId = req.query.chainId;
    // Define provider and contract
    let provider: ethers.providers.BaseProvider;
    let contract: ethers.Contract;
    if (Number(chainId) === polygonMumbai.id) {
      provider = getDefaultProvider(process.env.POLYGON_MUMBAI_PROVIDER);
      contract = new Contract(
        process.env
          .NEXT_PUBLIC_POLYGON_MUMBAI_PROJECT_CONTRACT_ADDRESS as string,
        projectContractAbi,
        provider
      );
    } else {
      throw new Error("Chain is not supported");
    }
    // Check access
    const isAccessAllowed = await contract.isAuthorOfAcceptedCompletedActivity(
      projectId,
      didToAddress(userDid as string)
    );
    // Return result
    if (!isAccessAllowed) {
      res.status(403).json({ status: "Access denied" });
    } else {
      res.status(200).json({ status: "Access allowed" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: errorToPrettyError(error) });
  }
}

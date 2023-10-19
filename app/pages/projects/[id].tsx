import Layout from "@/components/layout";
import ProjectActivities from "@/components/project/ProjectActivities";
import ProjectCompletedActivities from "@/components/project/ProjectCompletedActivities";
import ProjectDescription from "@/components/project/ProjectDescription";
import { FullWidthSkeleton, ThickDivider } from "@/components/styled";
import { projectContractAbi } from "@/contracts/abi/projectContract";
import { chainToSupportedChainConfig } from "@/utils/chains";
import { useRouter } from "next/router";
import { useContractRead, useNetwork } from "wagmi";

/**
 * Page with a project.
 */
export default function Project() {
  const router = useRouter();
  const { id } = router.query;
  const { chain } = useNetwork();

  /**
   * Define project owner
   */
  const { data: owner } = useContractRead({
    address: chainToSupportedChainConfig(chain).contracts.project,
    abi: projectContractAbi,
    functionName: "ownerOf",
    args: [id ? BigInt(id as string) : BigInt(0)],
    enabled: id !== undefined,
  });

  return (
    <Layout maxWidth="sm">
      {id && owner ? (
        <>
          <ProjectDescription id={id as string} owner={owner as string} />
          <ThickDivider sx={{ mt: 4 }} />
          <ProjectActivities id={id as string} sx={{ mt: 4 }} />
          <ThickDivider sx={{ mt: 4 }} />
          <ProjectCompletedActivities id={id as string} sx={{ mt: 4 }} />
        </>
      ) : (
        <FullWidthSkeleton />
      )}
    </Layout>
  );
}

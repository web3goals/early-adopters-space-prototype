import EntityList from "@/components/entity/EntityList";
import Layout from "@/components/layout";
import { CardBox, MediumLoadingButton } from "@/components/styled";
import { projectContractAbi } from "@/contracts/abi/projectContract";
import useUriDataLoader from "@/hooks/useUriDataLoader";
import { theme } from "@/theme";
import { ProjectUriData } from "@/types";
import { chainToSupportedChainConfig } from "@/utils/chains";
import { ipfsUriToHttpUri } from "@/utils/converters";
import {
  Avatar,
  Box,
  Link as MuiLink,
  SxProps,
  Typography,
} from "@mui/material";
import Link from "next/link";
import {
  paginatedIndexesConfig,
  useContractInfiniteReads,
  useNetwork,
} from "wagmi";

/**
 * Page with projects.
 */
export default function Projects() {
  const { chain } = useNetwork();

  const { data, fetchNextPage } = useContractInfiniteReads({
    cacheKey: "projectUris",
    ...paginatedIndexesConfig(
      (index: bigint) => {
        return [
          {
            address: chainToSupportedChainConfig(chain).contracts.project,
            abi: projectContractAbi,
            functionName: "tokenURI",
            args: [index],
          },
        ];
      },
      { start: 0, perPage: 30, direction: "increment" }
    ),
  });

  const projectUris = data?.pages?.flat(1).map((page) => page.result);

  return (
    <Layout maxWidth="sm">
      <Typography variant="h4" fontWeight={700} textAlign="center">
        🚀 Projects
      </Typography>
      <Typography textAlign="center" mt={1}>
        you can help create the next big thing
      </Typography>
      <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
        <Link href="/projects/create">
          <MediumLoadingButton variant="outlined">
            Create Project
          </MediumLoadingButton>
        </Link>
      </Box>
      <EntityList
        entities={projectUris}
        renderEntityCard={(projectUri, index) => (
          <ProjectCard projectId={index} projectUri={projectUri} key={index} />
        )}
        noEntitiesText="😐 no project"
        sx={{ mt: 2 }}
      />
      <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
        <MediumLoadingButton variant="outlined" onClick={() => fetchNextPage()}>
          Load More
        </MediumLoadingButton>
      </Box>
    </Layout>
  );
}

function ProjectCard(props: {
  projectId: number;
  projectUri: string;
  sx?: SxProps;
}) {
  /**
   * Define project uri data
   */
  const { data: projectUriData } = useUriDataLoader<ProjectUriData>(
    props.projectUri
  );

  if (!props.projectUri) {
    return <></>;
  }

  return (
    <CardBox sx={{ display: "flex", flexDirection: "row", ...props.sx }}>
      {/* Left part */}
      <Box>
        <Avatar
          sx={{
            width: 64,
            height: 64,
            borderRadius: 2,
            background: theme.palette.divider,
          }}
          src={
            projectUriData?.image
              ? ipfsUriToHttpUri(projectUriData.image)
              : undefined
          }
        >
          {" "}
          <Typography fontSize={22}>🚀</Typography>
        </Avatar>
      </Box>
      {/* Right part */}
      <Box
        width={1}
        ml={3}
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
      >
        <Link href={`/projects/${props.projectId}`} passHref legacyBehavior>
          <MuiLink variant="h6" fontWeight={700}>
            {projectUriData?.title}
          </MuiLink>
        </Link>
        <Typography>{projectUriData?.description}</Typography>
      </Box>
    </CardBox>
  );
}

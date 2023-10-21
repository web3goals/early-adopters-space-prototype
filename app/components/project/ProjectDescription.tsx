import { profileContractAbi } from "@/contracts/abi/profileContract";
import { projectContractAbi } from "@/contracts/abi/projectContract";
import useUriDataLoader from "@/hooks/useUriDataLoader";
import { ProfileUriData, ProjectUriData } from "@/types";
import { chainToSupportedChainConfig } from "@/utils/chains";
import { ipfsUriToHttpUri } from "@/utils/converters";
import { LinkOutlined } from "@mui/icons-material";
import {
  Avatar,
  Box,
  IconButton,
  Stack,
  SxProps,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useContractRead, useNetwork } from "wagmi";
import AccountAvatar from "../account/AccountAvatar";
import AccountLink from "../account/AccountLink";
import { FullWidthSkeleton, LargeLoadingButton } from "../styled";
import useToasts from "@/hooks/useToast";

/**
 * A component with a project description.
 */
export default function ProjectDescription(props: {
  id: string;
  owner: string;
  sx?: SxProps;
}) {
  const { chain } = useNetwork();
  const { showToastSuccess } = useToasts();

  /**
   * Define owner profile uri data
   */
  const { data: ownerProfileUri } = useContractRead({
    address: chainToSupportedChainConfig(chain).contracts.profile,
    abi: profileContractAbi,
    functionName: "getURI",
    args: [props.owner as `0x${string}`],
  });
  const { data: ownerProfileUriData } = useUriDataLoader<ProfileUriData>(
    ownerProfileUri as string
  );

  /**
   * Define project uri and uri data
   */
  const { data: projectUri } = useContractRead({
    address: chainToSupportedChainConfig(chain).contracts.project,
    abi: projectContractAbi,
    functionName: "tokenURI",
    args: [BigInt(props.id)],
  });
  const { data: projectUriData } = useUriDataLoader<ProjectUriData>(
    projectUri as string
  );

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{ ...props.sx }}
    >
      {projectUriData ? (
        <>
          <Avatar
            sx={{
              width: 216,
              height: 216,
              borderRadius: 6,
              background: "#FFFFFF",
            }}
            src={
              projectUriData.image
                ? ipfsUriToHttpUri(projectUriData.image)
                : undefined
            }
          >
            <Typography fontSize={64}>🚀</Typography>
          </Avatar>
          <Typography variant="h4" fontWeight={700} textAlign="center" mt={2}>
            {projectUriData.title}
          </Typography>
          <Typography textAlign="center" mt={2}>
            {projectUriData.description}
          </Typography>
          <IconButton
            href={projectUriData.link}
            target="_blank"
            component="a"
            color="primary"
            sx={{ mt: 1 }}
          >
            <LinkOutlined />
          </IconButton>
          <Typography variant="body1" fontWeight={700} mt={2}>
            Created by
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <AccountAvatar
              account={props.owner}
              accountProfileUriData={ownerProfileUriData}
              size={42}
              emojiSize={18}
            />
            <AccountLink
              account={props.owner}
              accountProfileUriData={ownerProfileUriData}
              variant="body1"
            />
          </Stack>
          <Stack direction="column" spacing={1} alignItems="center" mt={4}>
            {projectUriData.chat && (
              <Link href={`/projects/chats/${props.id}`}>
                <LargeLoadingButton variant="contained">
                  Open Chat
                </LargeLoadingButton>
              </Link>
            )}
            <LargeLoadingButton
              variant="outlined"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${global.window.location.origin}/projects/${props.id}`
                );
                showToastSuccess("Link copied!");
              }}
            >
              Share
            </LargeLoadingButton>
          </Stack>
        </>
      ) : (
        <FullWidthSkeleton />
      )}
    </Box>
  );
}

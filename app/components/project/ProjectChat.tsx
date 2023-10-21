import { DialogContext } from "@/context/dialog";
import { profileContractAbi } from "@/contracts/abi/profileContract";
import { projectContractAbi } from "@/contracts/abi/projectContract";
import useError from "@/hooks/useError";
import useSigner from "@/hooks/useSigner";
import useUriDataLoader from "@/hooks/useUriDataLoader";
import { ProfileUriData, ProjectUriData } from "@/types";
import { chainToSupportedChainConfig } from "@/utils/chains";
import { ipfsUriToHttpUri } from "@/utils/converters";
import { didToAddress } from "@/utils/pushprotocol";
import {
  Avatar,
  Box,
  Link as MuiLink,
  Stack,
  SxProps,
  Typography,
} from "@mui/material";
import { IMessageIPFS, PushAPI } from "@pushprotocol/restapi";
import { ENV } from "@pushprotocol/restapi/src/lib/constants";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { useContractRead, useNetwork } from "wagmi";
import AccountAvatar from "../account/AccountAvatar";
import AccountLink from "../account/AccountLink";
import EntityList from "../entity/EntityList";
import { CardBox, FullWidthSkeleton, MediumLoadingButton } from "../styled";
import ProjectSendMessageDialog from "./ProjectSendMessageDialog";

/**
 * A component with a project chat.
 */
export default function ProjectChat(props: { id: string; sx?: SxProps }) {
  const { showDialog, closeDialog } = useContext(DialogContext);
  const { chain } = useNetwork();

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
      {projectUriData && projectUriData.chat ? (
        <>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                background: "#FFFFFF",
              }}
              src={
                projectUriData.image
                  ? ipfsUriToHttpUri(projectUriData.image)
                  : undefined
              }
            >
              <Typography fontSize={22}>🚀</Typography>
            </Avatar>
            <Link href={`/projects/${props.id}`} passHref legacyBehavior>
              <MuiLink variant="h4" fontWeight={700}>
                {projectUriData?.title}
              </MuiLink>
            </Link>
          </Stack>
          <Typography textAlign="center" mt={1}>
            Chat only for people with accepted completed activities
          </Typography>
          <MediumLoadingButton
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={() => {
              showDialog?.(
                <ProjectSendMessageDialog
                  chat={projectUriData.chat!}
                  onClose={closeDialog}
                />
              );
            }}
          >
            Send Message
          </MediumLoadingButton>
          <ChatMessages chat={projectUriData.chat} sx={{ mt: 2 }} />
        </>
      ) : (
        <FullWidthSkeleton />
      )}
    </Box>
  );
}

function ChatMessages(props: { chat: string; sx?: SxProps }) {
  const { handleError } = useError();
  const { signer } = useSigner();
  const [messages, setMessages] = useState<IMessageIPFS[] | undefined>();

  async function loadData() {
    setMessages(undefined);
    try {
      if (!signer || !props.chat) {
        return;
      }
      const user = await PushAPI.initialize(signer, { env: ENV.STAGING });
      const messages = await user.chat.history(props.chat);
      setMessages(messages);
    } catch (error: any) {
      handleError(error, true);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.chat, signer]);

  return (
    <EntityList
      entities={messages}
      renderEntityCard={(message, index) => (
        <ChatMessageCard message={message} key={index} />
      )}
      noEntitiesText="😐 no messages"
      sx={{ mt: 2 }}
    />
  );
}

function ChatMessageCard(props: { message: IMessageIPFS; sx?: SxProps }) {
  const { chain } = useNetwork();

  /**
   * Define profile uri data
   */
  const { data: profileUri } = useContractRead({
    address: chainToSupportedChainConfig(chain).contracts.profile,
    abi: profileContractAbi,
    functionName: "getURI",
    args: [didToAddress(props.message.fromDID) as `0x${string}`],
  });
  const { data: profileUriData } = useUriDataLoader<ProfileUriData>(
    profileUri as string
  );

  return (
    <CardBox sx={{ display: "flex", flexDirection: "row", ...props.sx }}>
      {/* Left part */}
      <Box>
        <AccountAvatar
          account={didToAddress(props.message.fromDID)}
          accountProfileUriData={profileUriData}
          size={54}
          emojiSize={18}
        />
      </Box>
      {/* Right part */}
      <Box
        width={1}
        ml={3}
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
      >
        <AccountLink
          account={didToAddress(props.message.fromDID)}
          accountProfileUriData={profileUriData}
        />
        {props.message.timestamp && (
          <Typography variant="body2" color="text.secondary">
            {new Date(props.message.timestamp).toLocaleString()}
          </Typography>
        )}
        <Typography mt={1}>{props.message.messageContent}</Typography>
      </Box>
    </CardBox>
  );
}

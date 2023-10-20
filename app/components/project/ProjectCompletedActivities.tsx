import { ACTIVITY_TYPE_SEND_FEEDBACK } from "@/constants/activities";
import { DialogContext } from "@/context/dialog";
import { profileContractAbi } from "@/contracts/abi/profileContract";
import useError from "@/hooks/useError";
import useUriDataLoader from "@/hooks/useUriDataLoader";
import { ProfileUriData, ProjectRewardDetailsUriData } from "@/types";
import { chainToSupportedChainConfig } from "@/utils/chains";
import {
  Box,
  Link as MuiLink,
  Stack,
  SxProps,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useAccount, useContractRead, useNetwork } from "wagmi";
import AccountAvatar from "../account/AccountAvatar";
import AccountLink from "../account/AccountLink";
import EntityList from "../entity/EntityList";
import { CardBox, MediumLoadingButton } from "../styled";
import ProjectWatchFeedbackDialog from "./ProjectWatchFeedbackDialog";
import { projectContractAbi } from "@/contracts/abi/projectContract";
import { isAddressesEqual } from "@/utils/addresses";
import ProjectRevealMysteryBoxesDialog from "./ProjectRevealMysteryBoxesDialog";
import ProjectAcceptCompletedActivityDialog from "./ProjectAcceptCompletedActivityDialog";
import { formatEther } from "viem";
import { FormatQuote } from "@mui/icons-material";

/**
 * A component with project completed activities.
 */
export default function ProjectCompletedActivities(props: {
  id: string;
  owner: string;
  sx?: SxProps;
}) {
  const { showDialog, closeDialog } = useContext(DialogContext);
  const { chain } = useNetwork();
  const { address } = useAccount();
  const { handleError } = useError();
  const [completedActivities, setCompletedActivities] = useState<
    any[] | undefined
  >();

  /**
   * Define project reward and reward details uri data
   */
  const { data: reward } = useContractRead({
    address: chainToSupportedChainConfig(chain).contracts.project,
    abi: projectContractAbi,
    functionName: "getReward",
    args: [props.id],
  });
  const { data: rewardDetailsUriData } =
    useUriDataLoader<ProjectRewardDetailsUriData>(
      (reward as any)?.rewardDetailsURI
    );

  useEffect(() => {
    const statement = `select%20%2A%20from%20${process.env.NEXT_PUBLIC_TABLELAND_DATABASE_TABLE}%20where%20project_id%20%3D%20%22${props.id}%22%20order%20by%20date%20desc`;
    axios
      .get(
        `https://testnets.tableland.network/api/v1/query?statement=${statement}`
      )
      .then(({ data }) => setCompletedActivities(data))
      .catch((error) => handleError(error, true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.id]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{ ...props.sx }}
    >
      <Typography variant="h4" fontWeight={700} textAlign="center" mt={2}>
        ✨ Completed Activities
      </Typography>
      <Typography textAlign="center" mt={2}>
        that will bring mystery boxes to the authors after accepting by the
        project creator
      </Typography>
      {isAddressesEqual(props.owner, address) &&
        Boolean(reward) &&
        !(reward as any).isDistributed && (
          <MediumLoadingButton
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={() =>
              showDialog?.(
                <ProjectRevealMysteryBoxesDialog
                  id={props.id}
                  onClose={closeDialog}
                />
              )
            }
          >
            Reveal Mystery Boxes
          </MediumLoadingButton>
        )}
      <EntityList
        entities={completedActivities}
        renderEntityCard={(completedActivity, index) => (
          <CompletedActivityCard
            completedActivity={completedActivity}
            reward={reward}
            rewardDetailsUriData={rewardDetailsUriData}
            owner={props.owner}
            key={index}
          />
        )}
        noEntitiesText="😐 no completed activities"
        sx={{ mt: 2 }}
      />
    </Box>
  );
}

function CompletedActivityCard(props: {
  completedActivity: any;
  reward: any;
  rewardDetailsUriData: ProjectRewardDetailsUriData | undefined;
  owner: string;
  sx?: SxProps;
}) {
  const { showDialog, closeDialog } = useContext(DialogContext);
  const { chain } = useNetwork();
  const { address } = useAccount();

  /**
   * Define completed activity author profile uri data
   */
  const { data: authorProfileUri } = useContractRead({
    address: chainToSupportedChainConfig(chain).contracts.profile,
    abi: profileContractAbi,
    functionName: "getURI",
    args: [props.completedActivity.author_address],
  });
  const { data: authorProfileUriData } = useUriDataLoader<ProfileUriData>(
    authorProfileUri as string
  );

  /**
   * Define if activity is accepted
   */
  const { data: isAccepted } = useContractRead({
    address: chainToSupportedChainConfig(chain).contracts.project,
    abi: projectContractAbi,
    functionName: "isCompletedActivityAccepted",
    args: [
      props.completedActivity.project_id,
      props.completedActivity.activity_index,
      props.completedActivity.id,
    ],
  });

  return (
    <CardBox sx={{ display: "flex", flexDirection: "row", ...props.sx }}>
      {/* Left part */}
      <Box>
        <AccountAvatar
          account={props.completedActivity.author_address}
          accountProfileUriData={authorProfileUriData}
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
        {/* Author link */}
        <AccountLink
          account={props.completedActivity.author_address}
          accountProfileUriData={authorProfileUriData}
        />
        {/* Date */}
        <Typography variant="body2" color="text.secondary">
          {new Date(props.completedActivity.date * 1000).toLocaleString()}
        </Typography>
        {/* Content */}
        {props.completedActivity.activity_type ===
          ACTIVITY_TYPE_SEND_FEEDBACK && (
          <Stack direction="row" spacing={1} mt={1}>
            <Typography>🗣️</Typography>
            <Typography>Sent</Typography>
            <MuiLink
              component="button"
              fontWeight={700}
              onClick={() =>
                showDialog?.(
                  <ProjectWatchFeedbackDialog
                    content={props.completedActivity.content}
                    onClose={closeDialog}
                  />
                )
              }
            >
              feedback
            </MuiLink>
          </Stack>
        )}
        {/* Status */}
        {props.reward.isDistributed && isAccepted && (
          <>
            <Stack direction="row" spacing={1} mt={1}>
              <Typography>🎁</Typography>
              <Typography color="#1DB954">
                Mystery box is revealed, reward is{" "}
                <strong>
                  {formatEther(
                    ((props.reward.rewardValue as bigint) /
                      props.reward.rewardRecepientsNumber) as bigint
                  )}{" "}
                  {chainToSupportedChainConfig(chain).chain.nativeCurrency.name}
                </strong>
              </Typography>
            </Stack>
            {props.rewardDetailsUriData && (
              <Stack direction="row" spacing={1} mt={1}>
                <FormatQuote sx={{ color: "text.secondary", fontSize: 24 }} />
                <Typography color="text.secondary">
                  {props.rewardDetailsUriData.content}
                </Typography>
              </Stack>
            )}
          </>
        )}
        {props.reward.isDistributed && !isAccepted && (
          <>
            <Stack direction="row" spacing={1} mt={1}>
              <Typography>😔</Typography>
              <Typography color="#FF4400">
                Mystery box is revealed, but this activity wasn&apos;t accepted
              </Typography>
            </Stack>
          </>
        )}
        {props.reward && !props.reward.isDistributed && isAccepted && (
          <Stack direction="row" spacing={1} mt={1}>
            <Typography>✅</Typography>
            <Typography color="#1DB954">
              Activity is accepted but mystery box is not revealed yet
            </Typography>
          </Stack>
        )}
        {props.reward && !props.reward.isDistributed && !isAccepted && (
          <Stack direction="row" spacing={1} mt={1}>
            <Typography>⌛</Typography>
            <Typography color="#FFC833">
              Activity is not accepted yet
            </Typography>
          </Stack>
        )}
        {/* Accept button */}
        {isAddressesEqual(props.owner, address) &&
          props.reward &&
          !props.reward.isDistributed &&
          !isAccepted && (
            <MediumLoadingButton
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={() => {
                showDialog?.(
                  <ProjectAcceptCompletedActivityDialog
                    completedActivity={props.completedActivity}
                    onClose={closeDialog}
                  />
                );
              }}
            >
              ✅ Accept
            </MediumLoadingButton>
          )}
      </Box>
    </CardBox>
  );
}

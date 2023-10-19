import { ACTIVITY_TYPE_SEND_FEEDBACK } from "@/constants/activities";
import { DialogContext } from "@/context/dialog";
import { profileContractAbi } from "@/contracts/abi/profileContract";
import useError from "@/hooks/useError";
import useUriDataLoader from "@/hooks/useUriDataLoader";
import { ProfileUriData } from "@/types";
import { chainToSupportedChainConfig } from "@/utils/chains";
import { Box, Link as MuiLink, SxProps, Typography } from "@mui/material";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useContractRead, useNetwork } from "wagmi";
import AccountAvatar from "../account/AccountAvatar";
import AccountLink from "../account/AccountLink";
import EntityList from "../entity/EntityList";
import { CardBox } from "../styled";
import ProjectWatchFeedbackDialog from "./ProjectWatchFeedbackDialog";

/**
 * A component with project completed activities.
 */
export default function ProjectCompletedActivities(props: {
  id: string;
  sx?: SxProps;
}) {
  const { handleError } = useError();
  const [completedActivities, setCompletedActivities] = useState<
    any[] | undefined
  >();

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
      <EntityList
        entities={completedActivities}
        renderEntityCard={(completedActivity, index) => (
          <CompletedActivityCard
            completedActivity={completedActivity}
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
  sx?: SxProps;
}) {
  const { showDialog, closeDialog } = useContext(DialogContext);
  const { chain } = useNetwork();

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
        <AccountLink
          account={props.completedActivity.author_address}
          accountProfileUriData={authorProfileUriData}
        />
        <Typography variant="body2" color="text.secondary">
          {new Date(props.completedActivity.date * 1000).toLocaleString()}
        </Typography>
        {props.completedActivity.activity_type ===
          ACTIVITY_TYPE_SEND_FEEDBACK && (
          <Typography mt={1}>
            🗣️ Sent{" "}
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
          </Typography>
        )}
      </Box>
    </CardBox>
  );
}

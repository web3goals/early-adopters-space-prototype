import { ACTIVITY_TYPE_PARAMS } from "@/constants/activities";
import { DialogContext } from "@/context/dialog";
import { projectContractAbi } from "@/contracts/abi/projectContract";
import useUriDataLoader from "@/hooks/useUriDataLoader";
import { theme } from "@/theme";
import { ProjectActivityDetailsUriData } from "@/types";
import { isAddressesEqual } from "@/utils/addresses";
import { chainToSupportedChainConfig } from "@/utils/chains";
import { Avatar, Box, SxProps, Typography } from "@mui/material";
import { useContext } from "react";
import { useAccount, useContractRead, useNetwork } from "wagmi";
import EntityList from "../entity/EntityList";
import { CardBox, MediumLoadingButton } from "../styled";
import ProjectAddActivityDialog from "./ProjectAddActivityDialog";

/**
 * A component with project activities.
 */
export default function ProjectActivities(props: {
  id: string;
  owner: string;
  sx?: SxProps;
}) {
  const { showDialog, closeDialog } = useContext(DialogContext);
  const { chain } = useNetwork();
  const { address } = useAccount();

  /**
   * Define project activities
   */
  const { data: activities } = useContractRead({
    address: chainToSupportedChainConfig(chain).contracts.project,
    abi: projectContractAbi,
    functionName: "getActivities",
    args: [props.id],
  });

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{ ...props.sx }}
    >
      <Typography variant="h4" fontWeight={700} textAlign="center" mt={2}>
        🔥 Activities
      </Typography>
      <Typography textAlign="center" mt={2}>
        that you can do to help the project and get the mystery boxes that will
        be revealed when the project becomes successful
      </Typography>
      {isAddressesEqual(props.owner, address) && (
        <MediumLoadingButton
          variant="outlined"
          onClick={() =>
            showDialog?.(
              <ProjectAddActivityDialog id={props.id} onClose={closeDialog} />
            )
          }
          sx={{ mt: 2 }}
        >
          Add Activity
        </MediumLoadingButton>
      )}
      <EntityList
        entities={activities as any[]}
        renderEntityCard={(activity, index) => (
          <ActivityCard activity={activity} key={index} />
        )}
        noEntitiesText="😐 no activities"
        sx={{ mt: 2 }}
      />
    </Box>
  );
}

// TODO: Add button to complete activity
function ActivityCard(props: { activity: any; sx?: SxProps }) {
  /**
   * Define activity details data
   */
  const { data: activityDetailsUriData } =
    useUriDataLoader<ProjectActivityDetailsUriData>(
      props.activity.activityDetailsURI
    );

  return (
    <CardBox sx={{ display: "flex", flexDirection: "row", ...props.sx }}>
      {/* Left part */}
      <Box>
        <Avatar
          sx={{
            width: 96,
            height: 96,
            borderRadius: 3,
            background: theme.palette.divider,
          }}
        >
          <Typography fontSize={36}>
            {ACTIVITY_TYPE_PARAMS[props.activity.activityType].icon}
          </Typography>
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
        <Typography variant="h6" fontWeight={700}>
          {ACTIVITY_TYPE_PARAMS[props.activity.activityType].title}
        </Typography>
        {activityDetailsUriData && (
          <Typography>{activityDetailsUriData.content}</Typography>
        )}
      </Box>
    </CardBox>
  );
}

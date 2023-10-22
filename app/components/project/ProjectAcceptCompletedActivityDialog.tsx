import { ACTIVITY_TYPE_FOLLOW_TWITTER } from "@/constants/activities";
import { projectContractAbi } from "@/contracts/abi/projectContract";
import useError from "@/hooks/useError";
import useToasts from "@/hooks/useToast";
import useUriDataLoader from "@/hooks/useUriDataLoader";
import { ProjectActivityDetailsUriData } from "@/types";
import { chainToSupportedChainConfig } from "@/utils/chains";
import { Dialog, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import {
  useContractRead,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import {
  DialogCenterContent,
  ExtraLargeLoadingButton,
  FullWidthSkeleton,
} from "../styled";

export default function ProjectAcceptCompletedActivityDialog(props: {
  completedActivity: any;
  isClose?: boolean;
  onClose?: Function;
}) {
  const { chain } = useNetwork();

  /**
   * Dialog states
   */
  const [isOpen, setIsOpen] = useState(!props.isClose);

  /**
   * Function to close dialog
   */
  async function close() {
    setIsOpen(false);
    props.onClose?.();
  }

  /**
   * Define if activity is accepted
   */
  const { data: verificationStatus } = useContractRead({
    address: chainToSupportedChainConfig(chain).contracts.project,
    abi: projectContractAbi,
    functionName: "getCompletedActivityVerificationStatus",
    args: [
      props.completedActivity.project_id,
      props.completedActivity.activity_index,
      props.completedActivity.id,
    ],
  });

  return (
    <Dialog open={isOpen} onClose={close} maxWidth="sm" fullWidth>
      <DialogCenterContent>
        {verificationStatus ? (
          verificationStatus.isVerified ? (
            <AcceptCompletedActivity
              completedActivity={props.completedActivity}
              onSuccess={close}
            />
          ) : verificationStatus.isVerificationStarted ? (
            <FinishVerifyCompletedActivity
              completedActivity={props.completedActivity}
              onSuccess={close}
            />
          ) : (
            <StartVerifyCompletedActivity
              completedActivity={props.completedActivity}
              onSuccess={close}
            />
          )
        ) : (
          <FullWidthSkeleton />
        )}
      </DialogCenterContent>
    </Dialog>
  );
}

function StartVerifyCompletedActivity(props: {
  completedActivity: any;
  onSuccess?: Function;
}) {
  const { chain } = useNetwork();
  const { handleError } = useError();
  const { showToastSuccess } = useToasts();

  /**
   * Define project activity details data
   */
  const { data: activities } = useContractRead({
    address: chainToSupportedChainConfig(chain).contracts.project,
    abi: projectContractAbi,
    functionName: "getActivities",
    args: [BigInt(props.completedActivity.project_id)],
  });
  const { data: activityDetailsUriData } =
    useUriDataLoader<ProjectActivityDetailsUriData>(
      activities?.[props.completedActivity.activity_index]?.activityDetailsURI
    );

  /**
   * Define verification data
   */
  const verificationData =
    props.completedActivity.activity_type === ACTIVITY_TYPE_FOLLOW_TWITTER
      ? `Twitter user with the handle ${props.completedActivity.content} follows twitter user with the handle ${activityDetailsUriData?.content}`
      : "";

  /**
   * Contract states
   */
  const {
    config: contractConfig,
    isError: isContractConfigError,
    error: contractConfigError,
  } = usePrepareContractWrite({
    address: chainToSupportedChainConfig(chain).contracts.project,
    abi: projectContractAbi,
    functionName: "startVerifyCompletedActivity",
    args: [
      props.completedActivity.project_id,
      props.completedActivity.activity_index,
      props.completedActivity.id,
      verificationData,
    ],
    chainId: chainToSupportedChainConfig(chain).chain.id,
  });
  const {
    data: contractWriteData,
    isLoading: isContractWriteLoading,
    write: contractWrite,
    isSuccess: isContractWriteSuccess,
  } = useContractWrite(contractConfig);
  const { isLoading: isTransactionLoading, isSuccess: isTransactionSuccess } =
    useWaitForTransaction({
      hash: contractWriteData?.hash,
    });

  /**
   * Form states
   */
  const isFormLoading = isContractWriteLoading || isTransactionLoading;
  const isFormDisabled = isFormLoading || isTransactionSuccess;
  const isFormSubmitDisabled = isFormDisabled || !contractWrite;

  /**
   * Show error message
   */
  useEffect(() => {
    if (isContractConfigError && contractConfigError) {
      handleError(contractConfigError, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isContractConfigError]);

  /**
   * Show success message
   */
  useEffect(() => {
    if (isContractWriteSuccess) {
      showToastSuccess("Verification started, data will be updated soon!");
      props.onSuccess?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isContractWriteSuccess]);

  return (
    <>
      {activityDetailsUriData && Boolean(verificationData) ? (
        <>
          <Typography variant="h4" textAlign="center" fontWeight={700}>
            👀️ Start verification process
          </Typography>
          <Typography textAlign="center" mt={1}>
            It will take time, and once successfully verified, you can accept
            the activity and give the author a mystery box
          </Typography>
          {/* Submit button */}
          <ExtraLargeLoadingButton
            variant="outlined"
            loading={isFormLoading}
            disabled={isFormSubmitDisabled}
            sx={{ mt: 2 }}
            onClick={() => contractWrite?.()}
          >
            Submit
          </ExtraLargeLoadingButton>
        </>
      ) : (
        <FullWidthSkeleton />
      )}
    </>
  );
}

function FinishVerifyCompletedActivity(props: {
  completedActivity: any;
  onSuccess?: Function;
}) {
  const { chain } = useNetwork();
  const { handleError } = useError();
  const { showToastSuccess } = useToasts();

  /**
   * Contract states
   */
  const {
    config: contractConfig,
    isError: isContractConfigError,
    error: contractConfigError,
  } = usePrepareContractWrite({
    address: chainToSupportedChainConfig(chain).contracts.project,
    abi: projectContractAbi,
    functionName: "finishVerifyCompletedActivity",
    args: [
      props.completedActivity.project_id,
      props.completedActivity.activity_index,
      props.completedActivity.id,
    ],
    chainId: chainToSupportedChainConfig(chain).chain.id,
  });
  const {
    data: contractWriteData,
    isLoading: isContractWriteLoading,
    write: contractWrite,
    isSuccess: isContractWriteSuccess,
  } = useContractWrite(contractConfig);
  const { isLoading: isTransactionLoading, isSuccess: isTransactionSuccess } =
    useWaitForTransaction({
      hash: contractWriteData?.hash,
    });

  /**
   * Form states
   */
  const isFormLoading = isContractWriteLoading || isTransactionLoading;
  const isFormDisabled = isFormLoading || isTransactionSuccess;
  const isFormSubmitDisabled = isFormDisabled || !contractWrite;

  /**
   * Show error message
   */
  useEffect(() => {
    if (isContractConfigError && contractConfigError) {
      handleError(contractConfigError, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isContractConfigError]);

  /**
   * Show success message
   */
  useEffect(() => {
    if (isContractWriteSuccess) {
      showToastSuccess("Verification finished, data will be updated soon!");
      props.onSuccess?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isContractWriteSuccess]);

  return (
    <>
      <Typography variant="h4" textAlign="center" fontWeight={700}>
        🏁 Finish verification process
      </Typography>
      <Typography textAlign="center" mt={1}>
        It will take time, and once successfully verified, you can accept the
        activity and give the author a mystery box
      </Typography>
      {/* Submit button */}
      <ExtraLargeLoadingButton
        variant="outlined"
        loading={isFormLoading}
        disabled={isFormSubmitDisabled}
        sx={{ mt: 2 }}
        onClick={() => contractWrite?.()}
      >
        Submit
      </ExtraLargeLoadingButton>
    </>
  );
}

function AcceptCompletedActivity(props: {
  completedActivity: any;
  onSuccess?: Function;
}) {
  const { chain } = useNetwork();
  const { handleError } = useError();
  const { showToastSuccess } = useToasts();

  /**
   * Contract states
   */
  const {
    config: contractConfig,
    isError: isContractConfigError,
    error: contractConfigError,
  } = usePrepareContractWrite({
    address: chainToSupportedChainConfig(chain).contracts.project,
    abi: projectContractAbi,
    functionName: "acceptCompletedActivity",
    args: [
      props.completedActivity.project_id,
      props.completedActivity.activity_index,
      props.completedActivity.id,
      props.completedActivity.author_address,
    ],
    chainId: chainToSupportedChainConfig(chain).chain.id,
  });
  const {
    data: contractWriteData,
    isLoading: isContractWriteLoading,
    write: contractWrite,
    isSuccess: isContractWriteSuccess,
  } = useContractWrite(contractConfig);
  const { isLoading: isTransactionLoading, isSuccess: isTransactionSuccess } =
    useWaitForTransaction({
      hash: contractWriteData?.hash,
    });

  /**
   * Form states
   */
  const isFormLoading = isContractWriteLoading || isTransactionLoading;
  const isFormDisabled = isFormLoading || isTransactionSuccess;
  const isFormSubmitDisabled = isFormDisabled || !contractWrite;

  /**
   * Show error message
   */
  useEffect(() => {
    if (isContractConfigError && contractConfigError) {
      handleError(contractConfigError, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isContractConfigError]);

  /**
   * Show success message
   */
  useEffect(() => {
    if (isContractWriteSuccess) {
      showToastSuccess("Activity accepted, data will be updated soon!");
      props.onSuccess?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isContractWriteSuccess]);

  return (
    <>
      <Typography variant="h4" textAlign="center" fontWeight={700}>
        ✅️ Accept activity
      </Typography>
      <Typography textAlign="center" mt={1}>
        and give the author of the activity a mystery box
      </Typography>
      {/* Submit button */}
      <ExtraLargeLoadingButton
        variant="outlined"
        loading={isFormLoading}
        disabled={isFormSubmitDisabled}
        sx={{ mt: 2 }}
        onClick={() => contractWrite?.()}
      >
        Submit
      </ExtraLargeLoadingButton>
    </>
  );
}

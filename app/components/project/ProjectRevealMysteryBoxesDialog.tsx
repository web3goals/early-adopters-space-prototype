import { projectContractAbi } from "@/contracts/abi/projectContract";
import useError from "@/hooks/useError";
import useIpfs from "@/hooks/useIpfs";
import useToasts from "@/hooks/useToast";
import { ProjectRewardDetailsUriData } from "@/types";
import { chainToSupportedChainConfig } from "@/utils/chains";
import { Dialog, Stack, Typography } from "@mui/material";
import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { parseEther } from "viem";
import {
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import * as yup from "yup";
import FormikHelper from "../helper/FormikHelper";
import {
  DialogCenterContent,
  ExtraLargeLoadingButton,
  WidgetBox,
  WidgetInputTextField,
  WidgetTitle,
} from "../styled";

export default function ProjectRevealMysteryBoxesDialog(props: {
  id: string;
  isClose?: boolean;
  onClose?: Function;
}) {
  const { handleError } = useError();
  const { uploadJsonToIpfs } = useIpfs();
  const { showToastSuccess } = useToasts();
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
   * Form states
   */
  const [formValues, setFormValues] = useState({
    reward: 0.01,
    content: "",
  });
  const formValidationSchema = yup.object({
    reward: yup.number().required(),
    content: yup.string().required(),
  });
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  /**
   * Uri of uploaded data
   */
  const [rewardDetailsDataUri, setRewardDetailsDataUri] = useState("");

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
    functionName: "distributeReward",
    args: [props.id, rewardDetailsDataUri],
    chainId: chainToSupportedChainConfig(chain).chain.id,
    value: parseEther(String(formValues.reward)),
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
  const isFormLoading =
    isFormSubmitting || isContractWriteLoading || isTransactionLoading;
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
   * Function to handle submit
   */
  async function submit(values: any) {
    try {
      setIsFormSubmitting(true);
      const data: ProjectRewardDetailsUriData = {
        content: values.content,
      };
      const { uri } = await uploadJsonToIpfs(data);
      setRewardDetailsDataUri(uri);
    } catch (error: any) {
      handleError(error, true);
      setIsFormSubmitting(false);
    }
  }

  /**
   * Write data to contract if form was submitted
   */
  useEffect(() => {
    if (
      rewardDetailsDataUri !== "" &&
      contractWrite &&
      !isContractWriteLoading
    ) {
      contractWrite?.();
      setRewardDetailsDataUri("");
    }
  }, [rewardDetailsDataUri, contractWrite, isContractWriteLoading]);

  /**
   * Show success message
   */
  useEffect(() => {
    if (isContractWriteSuccess) {
      showToastSuccess(
        "Mystery boxes are revealed, data will be updated soon!"
      );
      close();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isContractWriteSuccess]);

  return (
    <Dialog
      open={isOpen}
      onClose={!isFormSubmitting ? close : undefined}
      maxWidth="sm"
      fullWidth
    >
      <DialogCenterContent>
        <Typography variant="h4" textAlign="center" fontWeight={700}>
          🎁️ Reveal mystery boxes
        </Typography>
        <Typography textAlign="center" mt={1}>
          and reward the authors of the activities
        </Typography>
        <Formik
          initialValues={formValues}
          validationSchema={formValidationSchema}
          onSubmit={submit}
        >
          {({ values, errors, touched, handleChange, setValues }) => (
            <Form
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
              }}
            >
              <FormikHelper onChange={(values: any) => setFormValues(values)} />
              {/* Reward */}
              <WidgetBox bgcolor="#410C92" mt={2}>
                <WidgetTitle>Reward</WidgetTitle>
                <Stack direction="row" spacing={2}>
                  <WidgetInputTextField
                    id="reward"
                    name="reward"
                    type="number"
                    value={values.reward}
                    onChange={handleChange}
                    error={touched.reward && Boolean(errors.reward)}
                    helperText={touched.reward && errors.reward}
                    disabled={isFormDisabled}
                    sx={{ width: 1 }}
                  />
                  <WidgetInputTextField
                    value={
                      chainToSupportedChainConfig(chain).chain.nativeCurrency
                        .name
                    }
                    disabled={true}
                    sx={{ width: 1 }}
                  />
                </Stack>
              </WidgetBox>
              {/* Content */}
              <WidgetBox bgcolor="#410C92" mt={2}>
                <WidgetTitle>Comment</WidgetTitle>
                <WidgetInputTextField
                  id="content"
                  name="content"
                  placeholder="Thank you for..."
                  value={values.content}
                  onChange={handleChange}
                  error={touched.content && Boolean(errors.content)}
                  helperText={touched.content && errors.content}
                  disabled={isFormDisabled}
                  multiline
                  minRows={2}
                  sx={{ width: 1 }}
                />
              </WidgetBox>
              {/* Submit button */}
              <ExtraLargeLoadingButton
                type="submit"
                variant="outlined"
                loading={isFormLoading}
                disabled={isFormSubmitDisabled}
                sx={{ mt: 2 }}
              >
                Submit
              </ExtraLargeLoadingButton>
            </Form>
          )}
        </Formik>
      </DialogCenterContent>
    </Dialog>
  );
}

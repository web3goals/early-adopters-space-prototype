import { ACTIVITY_TYPES, ACTIVITY_TYPE_PARAMS } from "@/constants/activities";
import { projectContractAbi } from "@/contracts/abi/projectContract";
import useError from "@/hooks/useError";
import useIpfs from "@/hooks/useIpfs";
import useToasts from "@/hooks/useToast";
import { ProjectActivityDetailsUriData } from "@/types";
import { chainToSupportedChainConfig } from "@/utils/chains";
import { Dialog, MenuItem, Typography } from "@mui/material";
import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
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
  WidgetInputSelect,
  WidgetInputTextField,
  WidgetTitle,
} from "../styled";

export default function ProjectAddActivityDialog(props: {
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
    type: ACTIVITY_TYPES[0],
    content: "",
  });
  const formValidationSchema = yup.object({
    type: yup.string().required(),
    content: yup.string().required(),
  });
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  /**
   * Uri of uploaded data
   */
  const [activityDetailsDataUri, setActivityDetailsDataUri] = useState("");

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
    functionName: "addActivity",
    args: [props.id, formValues.type, activityDetailsDataUri],
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
  const isFormLoading =
    isFormSubmitting || isContractWriteLoading || isTransactionLoading;
  const isFormDisabled = isFormLoading || isTransactionSuccess;
  const isFormSubmitDisabled = isFormDisabled || !contractWrite;

  /**
   * Function to handle submit
   */
  async function submit(values: any) {
    try {
      setIsFormSubmitting(true);
      const data: ProjectActivityDetailsUriData = {
        content: values.content,
      };
      const { uri } = await uploadJsonToIpfs(data);
      setActivityDetailsDataUri(uri);
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
      activityDetailsDataUri !== "" &&
      contractWrite &&
      !isContractWriteLoading
    ) {
      contractWrite?.();
      setActivityDetailsDataUri("");
    }
  }, [activityDetailsDataUri, contractWrite, isContractWriteLoading]);

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
      showToastSuccess("Activity added, data will be updated soon!");
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
          🔥️ Add activity
        </Typography>
        <Typography textAlign="center" mt={1}>
          that people can do to help the project and get the mystery boxes that
          will be revealed when the project becomes successful
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
              {/* Type */}
              <WidgetBox bgcolor="#2B6EFD" mt={2}>
                <WidgetTitle>Type</WidgetTitle>
                <WidgetInputSelect
                  id="type"
                  name="type"
                  value={values.type}
                  onChange={handleChange}
                  disabled={isFormSubmitting}
                  sx={{ width: 1 }}
                >
                  {ACTIVITY_TYPES.map((type, index) => (
                    <MenuItem value={type} key={index}>
                      {ACTIVITY_TYPE_PARAMS[type].title}
                    </MenuItem>
                  ))}
                </WidgetInputSelect>
              </WidgetBox>
              {/* Content */}
              <WidgetBox bgcolor="#410C92" mt={2}>
                <WidgetTitle>
                  {
                    ACTIVITY_TYPE_PARAMS[formValues.type].addActivityForm
                      .contentFieldTitle
                  }
                </WidgetTitle>
                <WidgetInputTextField
                  id="content"
                  name="content"
                  placeholder={
                    ACTIVITY_TYPE_PARAMS[formValues.type].addActivityForm
                      .contentFieldPlaceholder
                  }
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

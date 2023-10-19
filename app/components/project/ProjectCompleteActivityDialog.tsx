import { ACTIVITY_TYPE_PARAMS } from "@/constants/activities";
import useError from "@/hooks/useError";
import useToasts from "@/hooks/useToast";
import { Dialog, Typography } from "@mui/material";
import axios from "axios";
import { Form, Formik } from "formik";
import { useState } from "react";
import { useAccount } from "wagmi";
import * as yup from "yup";
import FormikHelper from "../helper/FormikHelper";
import {
  DialogCenterContent,
  ExtraLargeLoadingButton,
  WidgetBox,
  WidgetInputTextField,
  WidgetTitle,
} from "../styled";

export default function ProjectCompleteActivityDialog(props: {
  id: string;
  activityIndex: number;
  activityType: string;
  isClose?: boolean;
  onClose?: Function;
}) {
  const { handleError } = useError();
  const { showToastSuccess } = useToasts();
  const { address } = useAccount();

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
    content: "",
  });
  const formValidationSchema = yup.object({
    content: yup.string().required(),
  });
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  /**
   * Function to handle submit
   */
  async function submit(values: any) {
    try {
      setIsFormSubmitting(true);
      if (!address) {
        throw new Error("Wallet is not connected");
      }
      await axios.post("/api/completeActivity", {
        projectId: props.id,
        activityIndex: props.activityIndex,
        activityType: props.activityType,
        authorAddress: address,
        content: values.content,
      });
      showToastSuccess("Activity completed, data will be updated soon!");
      close();
    } catch (error: any) {
      handleError(error, true);
      setIsFormSubmitting(false);
    }
  }

  return (
    <Dialog
      open={isOpen}
      onClose={!isFormSubmitting ? close : undefined}
      maxWidth="sm"
      fullWidth
    >
      <DialogCenterContent>
        <Typography variant="h4" textAlign="center" fontWeight={700}>
          🔥️ Complete activity
        </Typography>
        <Typography textAlign="center" mt={1}>
          and get mystery box after accepting by the project creator
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
              {/* Content */}
              <WidgetBox bgcolor="#2B6EFD" mt={2}>
                <WidgetTitle>
                  {
                    ACTIVITY_TYPE_PARAMS[props.activityType]
                      .completeActivityForm.contentFieldTitle
                  }
                </WidgetTitle>
                <WidgetInputTextField
                  id="content"
                  name="content"
                  placeholder={
                    ACTIVITY_TYPE_PARAMS[props.activityType]
                      .completeActivityForm.contentFieldPlaceholder
                  }
                  value={values.content}
                  onChange={handleChange}
                  error={touched.content && Boolean(errors.content)}
                  helperText={touched.content && errors.content}
                  disabled={isFormSubmitting}
                  multiline
                  minRows={2}
                  sx={{ width: 1 }}
                />
              </WidgetBox>
              {/* Submit button */}
              <ExtraLargeLoadingButton
                type="submit"
                variant="outlined"
                loading={isFormSubmitting}
                disabled={isFormSubmitting}
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

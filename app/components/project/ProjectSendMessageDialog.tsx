import useError from "@/hooks/useError";
import useSigner from "@/hooks/useSigner";
import useToasts from "@/hooks/useToast";
import { Dialog, Typography } from "@mui/material";
import { PushAPI } from "@pushprotocol/restapi";
import { ENV } from "@pushprotocol/restapi/src/lib/constants";
import { Form, Formik } from "formik";
import { useState } from "react";
import * as yup from "yup";
import FormikHelper from "../helper/FormikHelper";
import {
  DialogCenterContent,
  ExtraLargeLoadingButton,
  WidgetBox,
  WidgetInputTextField,
  WidgetTitle,
} from "../styled";

export default function ProjectSendMessageDialog(props: {
  chat: string;
  isClose?: boolean;
  onClose?: Function;
  onSend?: Function;
}) {
  const { handleError } = useError();
  const { showToastSuccess } = useToasts();
  const { signer } = useSigner();

  /**
   * Dialog states
   */
  const [isOpen, setIsOpen] = useState(!props.isClose);

  /**
   * Form states
   */
  const [formValues, setFormValues] = useState({
    message: "",
  });
  const formValidationSchema = yup.object({
    message: yup.string().required(),
  });
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  /**
   * Function to close dialog
   */
  async function close() {
    setIsOpen(false);
    props.onClose?.();
  }

  async function submit(values: any) {
    try {
      setIsFormSubmitting(true);
      if (!signer) {
        throw new Error(`Signer is not defined`);
      }
      const user = await PushAPI.initialize(signer, { env: ENV.PROD });
      await user.chat.send(props.chat, {
        type: "Text",
        content: values.message,
      });
      showToastSuccess("Message sent, data will be updated soon!");
      props.onSend?.();
      close();
    } catch (error) {
      handleError(error as Error, true);
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
          💬 Send message
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
              }}
            >
              <FormikHelper onChange={(values: any) => setFormValues(values)} />
              {/* Message */}
              <WidgetBox bgcolor="#2B6EFD" mt={2}>
                <WidgetTitle>Message</WidgetTitle>
                <WidgetInputTextField
                  id="message"
                  name="message"
                  placeholder="Hey!"
                  value={values.message}
                  onChange={handleChange}
                  error={touched.message && Boolean(errors.message)}
                  helperText={touched.message && errors.message}
                  disabled={isFormSubmitting}
                  multiline
                  minRows={2}
                  maxRows={4}
                  sx={{ width: 1 }}
                />
              </WidgetBox>
              {/* Submit button */}
              <ExtraLargeLoadingButton
                loading={isFormSubmitting}
                variant="outlined"
                type="submit"
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

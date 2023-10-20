import FormikHelper from "@/components/helper/FormikHelper";
import Layout from "@/components/layout";
import {
  ExtraLargeLoadingButton,
  WidgetBox,
  WidgetInputTextField,
  WidgetTitle,
} from "@/components/styled";
import { projectContractAbi } from "@/contracts/abi/projectContract";
import useError from "@/hooks/useError";
import useIpfs from "@/hooks/useIpfs";
import useToasts from "@/hooks/useToast";
import { ProjectUriData } from "@/types";
import { chainToSupportedChainConfig } from "@/utils/chains";
import { AddPhotoAlternateOutlined } from "@mui/icons-material";
import { Avatar, Box, Typography } from "@mui/material";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import { zeroAddress } from "viem";
import {
  useAccount,
  useContractEvent,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import * as yup from "yup";

/**
 * Page to create a project.
 */
export default function CreateProject() {
  const { handleError } = useError();
  const { uploadJsonToIpfs, uploadFileToIpfs } = useIpfs();
  const { showToastSuccess } = useToasts();
  const router = useRouter();
  const { chain } = useNetwork();
  const { address } = useAccount();

  /**
   * Form states
   */
  const [formImageValue, setFormImageValue] = useState<{
    file: any;
    uri: any;
  }>();
  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
    link: "",
  });
  const formValidationSchema = yup.object({
    title: yup.string().required(),
    description: yup.string().required(),
    link: yup.string().required(),
  });
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  /**
   * Uri of uploaded data
   */
  const [projectDataUri, setProjectDataUri] = useState("");

  /**
   * Contract states
   */
  const { config: contractConfig } = usePrepareContractWrite({
    address: chainToSupportedChainConfig(chain).contracts.project,
    abi: projectContractAbi,
    functionName: "create",
    args: [projectDataUri],
    chainId: chainToSupportedChainConfig(chain).chain.id,
  });
  const {
    data: contractWriteData,
    isLoading: isContractWriteLoading,
    write: contractWrite,
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
   * Function to handle image change
   */
  async function onImageChange(files: any[]) {
    try {
      // Get file
      const file = files?.[0];
      if (!file) {
        return;
      }
      // Check file size
      const isLessThan2Mb = file.size / 1024 / 1024 < 2;
      if (!isLessThan2Mb) {
        throw new Error(
          "Only files with size smaller than 2MB are currently supported!"
        );
      }
      // Read and save file
      const fileReader = new FileReader();
      fileReader.onload = () => {
        if (fileReader.readyState === 2) {
          setFormImageValue({
            file: file,
            uri: fileReader.result,
          });
        }
      };
      fileReader.readAsDataURL(file);
    } catch (error: any) {
      handleError(error, true);
    }
  }

  /**
   * Function to handle form submit
   */
  async function submit(values: any) {
    try {
      setIsFormSubmitting(true);
      // Upload image to ipfs
      let imageUri;
      if (formImageValue?.file) {
        const { uri } = await uploadFileToIpfs(formImageValue.file);
        imageUri = uri;
      }
      // Upload data to ipfs
      const data: ProjectUriData = {
        title: values.title,
        description: values.description,
        link: values.link,
        image: imageUri as string,
      };
      // Upload uri data to ipfs
      const { uri } = await uploadJsonToIpfs(data);
      setProjectDataUri(uri);
    } catch (error: any) {
      handleError(error, true);
      setIsFormSubmitting(false);
    }
  }

  /**
   * Write data to contract if form was submitted
   */
  useEffect(() => {
    if (projectDataUri !== "" && contractWrite && !isContractWriteLoading) {
      contractWrite?.();
      setProjectDataUri("");
    }
  }, [projectDataUri, contractWrite, isContractWriteLoading]);

  /**
   * Listen contract events to get id of created project
   */
  useContractEvent({
    address: chainToSupportedChainConfig(chain).contracts.project,
    abi: projectContractAbi,
    eventName: "Transfer",
    listener(log: any) {
      if (log[0].args.from === zeroAddress && log[0].args.to === address) {
        showToastSuccess("Project is created!");
        router.push(`/projects/${log[0].args.tokenId}`);
      }
    },
  });

  return (
    <Layout maxWidth="sm">
      <Typography variant="h4" fontWeight={700} textAlign="center">
        🚀 Create a project
      </Typography>
      <Typography textAlign="center" mt={1}>
        to allow early adopters to help you create the next big thing and be a
        part of your success
      </Typography>
      <Formik
        initialValues={formValues}
        validationSchema={formValidationSchema}
        onSubmit={submit}
      >
        {({ values, errors, touched, handleChange, setValues }) => (
          <Form
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <FormikHelper onChange={(values: any) => setFormValues(values)} />
            {/* Title */}
            <WidgetBox bgcolor="#2B6EFD" mt={2}>
              <WidgetTitle>Title</WidgetTitle>
              <WidgetInputTextField
                id="title"
                name="title"
                placeholder="Family Finance"
                value={values.title}
                onChange={handleChange}
                error={touched.title && Boolean(errors.title)}
                helperText={touched.title && errors.title}
                disabled={isFormDisabled}
                multiline
                sx={{ width: 1 }}
              />
            </WidgetBox>
            {/* Description */}
            <WidgetBox bgcolor="#410C92" mt={2}>
              <WidgetTitle>Description</WidgetTitle>
              <WidgetInputTextField
                id="description"
                name="description"
                placeholder="Our mission is to create..."
                value={values.description}
                onChange={handleChange}
                error={touched.description && Boolean(errors.description)}
                helperText={touched.description && errors.description}
                disabled={isFormDisabled}
                multiline
                minRows={2}
                sx={{ width: 1 }}
              />
            </WidgetBox>
            {/* Link */}
            <WidgetBox bgcolor="#333333" mt={2}>
              <WidgetTitle>Link</WidgetTitle>
              <WidgetInputTextField
                id="link"
                name="link"
                placeholder="https://family..."
                value={values.link}
                onChange={handleChange}
                error={touched.link && Boolean(errors.link)}
                helperText={touched.link && errors.link}
                disabled={isFormDisabled}
                sx={{ width: 1 }}
              />
            </WidgetBox>
            {/* Image */}
            <WidgetBox bgcolor="#999999" mt={2}>
              <WidgetTitle>Image</WidgetTitle>
              <Dropzone
                multiple={false}
                disabled={isFormDisabled}
                onDrop={(files) => onImageChange(files)}
                accept={{ "image/*": [] }}
              >
                {({ getRootProps, getInputProps }) => (
                  <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                    >
                      <Avatar
                        sx={{
                          cursor: !isFormDisabled ? "pointer" : undefined,
                          width: 164,
                          height: 164,
                          borderRadius: 4,
                          background: "#FFFFFF",
                        }}
                        src={formImageValue?.uri}
                      >
                        <AddPhotoAlternateOutlined
                          sx={{ color: "#999999", fontSize: 64 }}
                        />
                      </Avatar>
                    </Box>
                  </div>
                )}
              </Dropzone>
            </WidgetBox>
            {/* Submit button */}
            <ExtraLargeLoadingButton
              type="submit"
              variant="outlined"
              loading={isFormLoading}
              disabled={isFormSubmitDisabled}
              sx={{ mt: 4 }}
            >
              Submit
            </ExtraLargeLoadingButton>
          </Form>
        )}
      </Formik>
    </Layout>
  );
}

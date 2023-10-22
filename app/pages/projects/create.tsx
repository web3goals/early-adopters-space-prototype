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
import useSigner from "@/hooks/useSigner";
import useToasts from "@/hooks/useToast";
import { ProjectUriData } from "@/types";
import { chainToSupportedChainConfig } from "@/utils/chains";
import { AddPhotoAlternateOutlined } from "@mui/icons-material";
import { Avatar, Box, Typography } from "@mui/material";
import { ConditionType, GroupDTO, PushAPI } from "@pushprotocol/restapi";
import { ENV } from "@pushprotocol/restapi/src/lib/constants";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import { zeroAddress } from "viem";
import {
  useAccount,
  useContractEvent,
  useContractRead,
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
  const { signer } = useSigner();

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
  const { data: nextProjectId, isFetched: isNextProjectIdFetched } =
    useContractRead({
      address: chainToSupportedChainConfig(chain).contracts.project,
      abi: projectContractAbi,
      functionName: "getNextTokenId",
    });

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
    isFormSubmitting ||
    isContractWriteLoading ||
    isTransactionLoading ||
    !isNextProjectIdFetched;
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
      // Create chat if chain supports this feature
      let chat: GroupDTO | undefined;
      if (chainToSupportedChainConfig(chain).isPushProtocolEnabled) {
        if (!signer) {
          throw new Error(`Signer is not defined`);
        }
        const user = await PushAPI.initialize(signer, { env: ENV.PROD });
        const customEndpointUrl = `${
          process.env.NEXT_PUBLIC_APP_URL
        }/api/checkProjectChatAccess/?projectId=${nextProjectId}&userDid={{user_address}}&chainId=${
          chainToSupportedChainConfig(chain).chain.id
        }`;
        chat = await user.chat.group.create(`${values.title}`, {
          description: `Awesome chat of early adopters`,
          image:
            "data:image/png;base64,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",
          members: [],
          admins: [],
          private: false,
          rules: {
            chat: {
              conditions: [
                {
                  any: [
                    {
                      type: ConditionType.PUSH,
                      category: "CustomEndpoint",
                      subcategory: "GET",
                      data: {
                        url: customEndpointUrl,
                      },
                    },
                  ],
                },
              ],
            },
          },
        });
      }
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
        chat: chat?.chatId,
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

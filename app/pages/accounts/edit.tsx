import { ProfileUriData } from "@/types";
import AccountEditProfileForm from "components/account/AccountEditProfileForm";
import Layout from "components/layout";
import { FullWidthSkeleton } from "components/styled";
import { profileContractAbi } from "contracts/abi/profileContract";
import useError from "hooks/useError";
import useIpfs from "hooks/useIpfs";
import { useEffect, useState } from "react";
import { chainToSupportedChainConfig } from "utils/chains";
import { useAccount, useContractRead, useNetwork } from "wagmi";

/**
 * Page to edit account profile.
 */
export default function EditAccountProfile() {
  const { handleError } = useError();
  const { chain } = useNetwork();
  const { address } = useAccount();
  const { loadJsonFromIpfs } = useIpfs();
  const [profileData, setProfileData] = useState<
    ProfileUriData | null | undefined
  >();

  /**
   * Contract states
   */
  const {
    status: contractReadStatus,
    error: contractReadError,
    data: contractReadData,
  } = useContractRead({
    address: chainToSupportedChainConfig(chain).contracts.profile,
    abi: profileContractAbi,
    functionName: "getURI",
    args: [address as `0x${string}`],
  });

  /**
   * Load profile data from IPFS
   */
  useEffect(() => {
    if (address && contractReadStatus === "success") {
      if (contractReadData) {
        loadJsonFromIpfs(contractReadData as string)
          .then((result) => setProfileData(result))
          .catch((error) => handleError(error, true));
      } else {
        setProfileData(null);
      }
    }
    if (address && contractReadStatus === "error" && contractReadError) {
      setProfileData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, contractReadStatus, contractReadError, contractReadData]);

  return (
    <Layout maxWidth="xs">
      {profileData !== undefined ? (
        <AccountEditProfileForm profileData={profileData} />
      ) : (
        <FullWidthSkeleton />
      )}
    </Layout>
  );
}

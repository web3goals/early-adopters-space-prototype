import { ProfileUriData } from "@/types";
import { chainToSupportedChainConfig } from "@/utils/chains";
import {
  AlternateEmail,
  Instagram,
  Language,
  Telegram,
  Twitter,
} from "@mui/icons-material";
import { Box, Divider, IconButton, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { FullWidthSkeleton, LargeLoadingButton } from "components/styled";
import { profileContractAbi } from "contracts/abi/profileContract";
import useUriDataLoader from "hooks/useUriDataLoader";
import Link from "next/link";
import { isAddressesEqual } from "utils/addresses";
import { useAccount, useContractRead, useNetwork } from "wagmi";
import AccountAvatar from "./AccountAvatar";
import AccountLink from "./AccountLink";

/**
 * A component with account profile.
 */
export default function AccountProfile(props: { address: string }) {
  const { chain } = useNetwork();
  const { address } = useAccount();

  /**
   * Define profile uri data
   */
  const { data: profileUri } = useContractRead({
    address: chainToSupportedChainConfig(chain).contracts.profile,
    abi: profileContractAbi,
    functionName: "getURI",
    args: [props.address as `0x${string}`],
  });
  const { data: profileUriData } = useUriDataLoader<ProfileUriData>(
    profileUri as string
  );

  if (profileUri === "" || profileUriData) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center">
        {/* Image */}
        <AccountAvatar
          account={props.address}
          accountProfileUriData={profileUriData}
          size={164}
          emojiSize={64}
          sx={{ mb: 3 }}
        />
        {/* Name */}
        <AccountLink
          account={props.address}
          accountProfileUriData={profileUriData}
          variant="h4"
          textAlign="center"
        />
        {/* About */}
        {profileUriData?.attributes?.[1]?.value && (
          <Typography textAlign="center" sx={{ maxWidth: 480, mt: 1 }}>
            {profileUriData.attributes[1].value}
          </Typography>
        )}
        {/* Links and other data */}
        <Stack
          direction={{ xs: "column-reverse", md: "row" }}
          alignItems="center"
          mt={1.5}
          divider={
            <Divider orientation="vertical" flexItem sx={{ borderWidth: 2 }} />
          }
          spacing={2}
        >
          {/* Email and links */}
          <Stack direction="row" alignItems="center">
            {profileUriData?.attributes?.[2]?.value && (
              <IconButton
                href={`mailto:${profileUriData.attributes[2].value}`}
                target="_blank"
                component="a"
                color="primary"
              >
                <AlternateEmail />
              </IconButton>
            )}
            {profileUriData?.attributes?.[3]?.value && (
              <IconButton
                href={profileUriData.attributes[3].value}
                target="_blank"
                component="a"
                color="primary"
              >
                <Language />
              </IconButton>
            )}
            {profileUriData?.attributes?.[4]?.value && (
              <IconButton
                href={`https://twitter.com/${profileUriData.attributes[4].value}`}
                target="_blank"
                component="a"
                color="primary"
              >
                <Twitter />
              </IconButton>
            )}
            {profileUriData?.attributes?.[5]?.value && (
              <IconButton
                href={`https://t.me/${profileUriData.attributes[5].value}`}
                target="_blank"
                component="a"
                color="primary"
              >
                <Telegram />
              </IconButton>
            )}
            {profileUriData?.attributes?.[6]?.value && (
              <IconButton
                href={`https://instagram.com/${profileUriData.attributes[6].value}`}
                target="_blank"
                component="a"
                color="primary"
              >
                <Instagram />
              </IconButton>
            )}
          </Stack>
        </Stack>
        {/* Owner buttons */}
        {isAddressesEqual(address, props.address) && (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
            <Link href="/accounts/edit">
              <LargeLoadingButton variant="contained" sx={{ width: 240 }}>
                {profileUriData ? "Edit Profile" : "Create Profile"}
              </LargeLoadingButton>
            </Link>
          </Stack>
        )}
      </Box>
    );
  }

  return <FullWidthSkeleton />;
}

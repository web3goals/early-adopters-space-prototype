import Layout from "@/components/layout";
import { ExtraLargeLoadingButton } from "@/components/styled";
import { Box, Container, Typography } from "@mui/material";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from "next/link";
import { useAccount } from "wagmi";

/**
 * Landing page.
 */
export default function Landing() {
  return (
    <Layout
      maxWidth={false}
      hideToolbar={true}
      disableGutters={true}
      sx={{ py: 0 }}
    >
      <Cover />
    </Layout>
  );
}

function Cover() {
  const { address } = useAccount();
  const { openConnectModal } = useConnectModal();

  return (
    <Box sx={{ background: "#FFD15E" }}>
      <Container
        maxWidth="lg"
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          minHeight: "100vh",
          py: 12,
        }}
      >
        {/* Image */}
        <Box flex={2} mr={{ md: 12 }}>
          <Image
            src="/images/objectives.png"
            alt="Objectives"
            width="100"
            height="100"
            sizes="100vw"
            style={{
              width: "100%",
              height: "auto",
            }}
          />
        </Box>
        {/* Text with button */}
        <Box
          flex={3}
          display="flex"
          flexDirection="column"
          alignItems={{ xs: "center", md: "start" }}
        >
          <Typography
            variant="h2"
            textAlign={{ xs: "center", md: "start" }}
            mt={{ xs: 2, md: 0 }}
          >
            <strong>Allow early adopters</strong> to help you{" "}
            <strong>create the next big thing</strong> and{" "}
            <strong>be a part</strong> of your <strong>success</strong>
          </Typography>
          {address ? (
            <Link href="/projects">
              <ExtraLargeLoadingButton variant="contained" sx={{ mt: 4 }}>
                Let’s go!
              </ExtraLargeLoadingButton>
            </Link>
          ) : (
            <ExtraLargeLoadingButton
              variant="contained"
              sx={{ mt: 4 }}
              onClick={() => openConnectModal?.()}
            >
              Let’s go!
            </ExtraLargeLoadingButton>
          )}
        </Box>
      </Container>
    </Box>
  );
}

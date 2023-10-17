import { DialogProvider } from "@/context/dialog";
import "@/styles/globals.css";
import { theme } from "@/theme";
import { getSupportedChains } from "@/utils/chains";
import { ThemeProvider } from "@mui/material";
import {
  RainbowKitProvider,
  getDefaultWallets,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import type { AppProps } from "next/app";
import NextNProgress from "nextjs-progressbar";
import { SnackbarProvider } from "notistack";
import { useEffect, useState } from "react";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [...getSupportedChains()],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "Early Adopters Space",
  chains,
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string,
});

const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

export default function App({ Component, pageProps }: AppProps) {
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  /**
   * Fix for hydration error (docs - https://github.com/vercel/next.js/discussions/35773#discussioncomment-3484225)
   */
  useEffect(() => {
    setIsPageLoaded(true);
  }, []);

  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider
        chains={chains}
        theme={lightTheme({ accentColor: theme.palette.primary.main })}
      >
        <ThemeProvider theme={theme}>
          <SnackbarProvider maxSnack={3}>
            <DialogProvider>
              <NextNProgress height={4} color={theme.palette.primary.main} />
              {isPageLoaded && <Component {...pageProps} />}
            </DialogProvider>
          </SnackbarProvider>
        </ThemeProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

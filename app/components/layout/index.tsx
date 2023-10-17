import { Breakpoint, Container, Toolbar, SxProps } from "@mui/material";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Head from "next/head";
import Footer from "./Footer";
import Navigation from "./Navigation";

/**
 * Component with layout.
 */
export default function Layout(props: {
  maxWidth?: Breakpoint | false;
  hideToolbar?: boolean;
  disableGutters?: boolean;
  sx?: SxProps;
  children: any;
}) {
  return (
    <Box sx={{ background: "#EEEEEE" }}>
      <CssBaseline />
      <Head>
        <title>Early Adopters Space</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <Navigation />
      <Container
        maxWidth={props.maxWidth !== undefined ? props.maxWidth : "md"}
        disableGutters={props.disableGutters || false}
        sx={{ minHeight: "100vh" }}
      >
        <Box sx={{ py: 6, ...props.sx }}>
          {!props.hideToolbar && <Toolbar />}
          {props.children}
        </Box>
      </Container>
      <Footer />
    </Box>
  );
}

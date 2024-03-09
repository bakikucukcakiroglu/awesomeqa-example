import "../styles/globals.css";
import { CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import type { AppProps } from "next/app";
import Layout from "../components/Layout";
import HeadComponent from "../components/Head";

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'
import { SnackbarProvider } from 'notistack';


const theme = createTheme({
  palette: {
    mode: "dark",
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} >
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <HeadComponent title={"Awesome Ticket Challenge"} metaData={"Awesome Ticket Challenge"} />
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>
    </>
  );
}

export default MyApp;

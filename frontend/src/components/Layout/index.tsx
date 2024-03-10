
"use client"
import "../../styles/globals.css";
import { Container, CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'
import { SnackbarProvider } from 'notistack';
import HomeHeader from "../homeHeader";
import Footer from "../footer";
import HeadComponent from "../Head";

const theme = createTheme({
  palette: {
    mode: "dark",
  },
});

function MyApp({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeadComponent />
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} >
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Container maxWidth="lg" sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
              <HomeHeader />
              <>
                {children}
              </>
              <Footer />
            </Container >
          </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>
    </>
  );
}

export default MyApp;
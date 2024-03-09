import HomeHeader from "../homeHeader";
import Footer from "../footer";
import { Container } from "@mui/material";
import HeadComponent from "../Head";

const Layout = ({ children }: JSX.ElementChildrenAttribute) => {
  return (
    <>
      <Container maxWidth="lg" sx={{ height: "inherit", display: "flex", flexDirection: "column" }}>
        <HomeHeader />
        <>
          {children}
        </>
        <Footer />
      </Container >
    </>
  );
};

export default Layout;

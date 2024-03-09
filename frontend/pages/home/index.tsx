import * as React from "react";
import { NextPage } from "next";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";

import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import HomeButton from "../../components/HomeButton";
import HeadComponent from "../../components/Head";
import { useRouter } from "next/router";

const Home: NextPage = () => {

  const router = useRouter();

  const handleClickTickets = () => {
    router.push("/tickets?page=1");
  }

  return (
    <>
      <HeadComponent title={"Home"} metaData={"Home"} />
      <Box sx={{ flexGrow: 1, mt: 2, display: "flex", flexWrap: "wrap" }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 2,
              }}
            >
              <HomeButton icon={<LibraryBooksOutlinedIcon />} text="Knowledge Base" />
              <HomeButton icon={<SupportAgentIcon />} text="Tickets" onClick={handleClickTickets} />
              <HomeButton icon={<LightbulbOutlinedIcon />} text="FAQ Insights" />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default Home;

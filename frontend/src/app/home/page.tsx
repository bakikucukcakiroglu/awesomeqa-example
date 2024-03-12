import * as React from "react";
import { Metadata, NextPage } from "next";
import Link from "next/link";
import { Box, Grid } from "@mui/material";
import { LibraryBooksOutlined, LightbulbOutlined, SupportAgent } from "@mui/icons-material";
import AwesomeHomeButton from "./components/AwesomeHomeButton";

export const metadata: Metadata = {
  title: 'Home',
  description: 'Home|Awesome Ticket Challenge',
}

const Home: NextPage = () => {
  return (
    <>
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
              <AwesomeHomeButton icon={<LibraryBooksOutlined />} text="Knowledge Base" />
              <Link href={"/tickets?page=1&status=open"} style={{ flex: 1 }}>
                <AwesomeHomeButton icon={<SupportAgent />} text="Tickets" />
              </Link>
              <AwesomeHomeButton icon={<LightbulbOutlined />} text="FAQ Insights" />
            </Box>
          </Grid>
        </Grid>
      </Box >
    </>
  );
};

export default Home;

import { Box, Typography } from "@mui/material";
import Link from "next/link";
import HeadComponent from "../Head";

const HomeHeader = () => {
  return (
    <Link href="/" style={{ cursor: "pointer" }}>
      <Box sx={{ border: 1, justifyContent: "center", mt: 5, borderRadius: 2, padding: 1, cursor: "pointer" }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Typography variant="h2" component="div">
            Awesome tech challenge
          </Typography>
        </Box>
      </Box>
    </Link>
  );
};

export default HomeHeader;

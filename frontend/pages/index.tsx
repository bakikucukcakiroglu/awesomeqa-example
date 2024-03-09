import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { Button } from "@mui/material";
import { useRouter } from 'next/router';
import Home from "./home";
import HeadComponent from "../components/Head";


const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

const IndexPage = () => {

  const router = useRouter();

  return (
    <Box sx={{ flexGrow: 1, mt: 15, mb: 15 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              color="primary"
              sx={{ width: "50%", height: "4rem", fontSize: "1.2rem" }}
              onClick={() => {
                router.push('/home');
              }}
            >
              Home
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default IndexPage;

import { Box, Typography } from "@mui/material";
import styles from "./footer.module.css";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 1 }}>
        Have fun! Made with ❤️ in Istanbul
      </Box>
    </footer>
  );
};

export default Footer;

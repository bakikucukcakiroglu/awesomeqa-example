import React, { ReactElement } from "react";
import { ButtonBase, IconProps, Typography } from "@mui/material";

type HomeButtonProps = {
  icon: ReactElement<IconProps>;
  text: string;
  onClick?: () => void;
};

export default function AwesomeHomeButton({ icon, text, onClick }: HomeButtonProps) {

  const iconWithStyle = React.isValidElement(icon)
    ? React.cloneElement(icon, {
      sx: {
        ...icon.props.sx,
        fontSize: '3rem',
        backgroundColor: "#302c50",
        padding: 1,
        borderRadius: 2
      },
    })
    : null;

  return (
    <ButtonBase
      component={"div"}
      onClick={onClick}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        flex: 1,
        border: "1px solid #302f36",
        backgroundColor: "#1c1c1f",
        gap: 2,
        padding: 2,
        borderRadius: 2,
        cursor: "pointer",
        transition: "all 0.3s",
        '&:hover': {
          backgroundColor: "#302c50",

        }
      }}
    >
      {iconWithStyle}
      <Typography sx={{ color: "white", fontSize: "1.5rem", fontWeight: 600 }}>
        {text}
      </Typography>
    </ButtonBase>
  )
}
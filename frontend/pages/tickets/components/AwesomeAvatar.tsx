import { useState } from "react";
import { Avatar } from "@mui/material";

export default function AwesomeAvatar(props) {
  const { src, fallbackColor, ...rest } = props;
  const [isError, setIsError] = useState(false);

  return (
    <Avatar
      {...rest}
      sx={{ bgcolor: (isError || !src) ? fallbackColor : "transparent", color: "white" }}
    >
      {
        (src && !isError) ? <img
          loading="lazy"
          src={src}
          width={40}
          height={40}
          onError={() => {
            setIsError(true);
          }}
        /> : props.fallbackLetter.toUpperCase()
      }
    </Avatar>
  );
};
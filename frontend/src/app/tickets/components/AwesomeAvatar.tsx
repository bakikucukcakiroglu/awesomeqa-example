import { useState } from "react";
import { Avatar } from "@mui/material";

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str?.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
}

function hexToRgb(hex) {
  hex = hex.replace(/^#/, '');
  let bigint = parseInt(hex, 16);
  let r = (bigint >> 16) & 255;
  let g = (bigint >> 8) & 255;
  let b = bigint & 255;

  return [r, g, b];
}

function luminance([r, g, b]: [number, number, number]) {
  const a = [r, g, b].map(function (v) {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function isColorCloserToBlackOrWhite(hex) {
  const rgb = hexToRgb(hex);
  const lum = luminance([rgb[0], rgb[1], rgb[2]]);
  return lum > 0.8 ? 'white' : 'black';
}

type AwesomeAvatarProps = {
  src: string,
  fallbackColor: string,
  fallbackLetter: string,
  uniqueKey: string
}

export default function AwesomeAvatar({ src, fallbackColor, fallbackLetter, uniqueKey }: AwesomeAvatarProps) {

  const [isError, setIsError] = useState(false);

  return (
    <Avatar
      sx={{ bgcolor: (isError || !src) ? (fallbackColor || stringToColor(uniqueKey)) : "transparent", color: "white" }}
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
        /> : <p style={{
          fontWeight: "bold",
          color: isColorCloserToBlackOrWhite(fallbackColor || stringToColor(uniqueKey)) === "black" ? "white" : "black",
        }}
        >{fallbackLetter?.toUpperCase()}</p>
      }
    </Avatar >
  );
};
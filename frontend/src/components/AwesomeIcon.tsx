import SvgIcon from '@mui/material/SvgIcon';
import { SvgIconProps } from '@mui/material/SvgIcon';

export default function AwesomeIcon(props: SvgIconProps) {
  return <SvgIcon
    viewBox="0 0 172.000000 172.000000"
    {...props}
  >
    <defs>
      <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style={{ stopColor: "rgba(95, 81, 197, 1)", stopOpacity: 1 }} />
        <stop offset="93%" style={{ stopColor: "rgba(166, 87, 240, 1)", stopOpacity: 1 }} />
      </linearGradient>
    </defs>

    <g fill="url(#gradient1)" transform="translate(0.000000,172.000000) scale(0.100000,-0.100000)"
      stroke="none" >
      <path d="M802 1655 c-36 -30 -47 -70 -32 -111 6 -16 154 -172 336 -355 l326
-326 -326 -330 c-179 -182 -330 -343 -336 -358 -31 -81 77 -170 145 -121 25
18 607 604 698 703 58 62 67 77 67 109 0 34 -11 48 -132 173 -356 366 -606
614 -630 627 -41 21 -83 17 -116 -11z"/>
      <path d="M133 1632 c-30 -5 -69 -47 -77 -82 -6 -33 4 -69 27 -91 113 -107 627
-625 625 -629 -2 -3 -148 -144 -325 -313 -178 -170 -327 -316 -333 -327 -13
-25 -13 -63 2 -95 21 -46 93 -69 139 -44 29 15 752 706 766 732 7 12 13 38 13
57 0 32 -22 56 -292 328 -441 442 -479 475 -545 464z"/>
    </g>
  </SvgIcon>
}

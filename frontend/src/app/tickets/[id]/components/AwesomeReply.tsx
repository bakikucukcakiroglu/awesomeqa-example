import { ListItemAvatar, Stack, Typography } from "@mui/material";
import AwesomeAvatar from '../../components/AwesomeAvatar';
import AwesomeMessage from "./AwesomeMessage/AwesomeMessage";

type AwesomeReplyProps = {
  message: any,
  isTicketMessage?: boolean,
  handleDeleteContextMessage?: () => void
}

const LShape = () => {

  return <span style={{ position: "absolute", top: "19px", left: "18px", zIndex: "-1" }}>
    <div style={{ width: "40px", height: "1px", borderTop: "1px solid white" }} />
    <div style={{ height: "20px", width: "1px", borderLeft: "1px solid white" }} />
  </span>
}

export default function AwesomeReply({ message, isTicketMessage = false, handleDeleteContextMessage }: AwesomeReplyProps) {

  return (

    <Stack alignItems={"flex-start"} sx={{ position: "relative", margin: 1 }}>
      <AwesomeMessage
        message={message?.reference_msg}
        props={{ sx: { transform: "scale(0.7)", transformOrigin: "left", marginLeft: "55px" } }}
        isReply={true}
      />
      <LShape />
      <AwesomeMessage
        message={message}
        isTicketMessage={isTicketMessage}
        handleDeleteContextMessage={handleDeleteContextMessage}
      />

    </Stack>
  )
}
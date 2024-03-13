import { ListItemAvatar, Stack, Tooltip, Typography } from "@mui/material";
import AwesomeAvatar from '../../../components/AwesomeAvatar';
import { StackProps } from "@mui/material";
import { RemoveCircleOutline } from "@mui/icons-material";
import { format } from "date-fns";
import DiscordIcon from "../../../../../components/DiscordIcon";
import Link from "next/link";

type AwesomeMessageProps = {
  message: any,
  isTicketMessage?: boolean
  props?: StackProps,
  isReply?: boolean,
  handleDeleteContextMessage?: () => void,
  showAvatar?: boolean
}

export default function AwesomeMessage({ message, isTicketMessage = false, isReply, props, handleDeleteContextMessage, showAvatar = true }: AwesomeMessageProps) {

  return (
    <Stack direction={"row"} {...props}>

      <ListItemAvatar
        sx={{
          opacity: showAvatar ? 1 : 0,
        }}
      >
        <AwesomeAvatar
          src={message?.author?.avatar_url}
          fallbackColor={message?.author?.color}
          fallbackLetter={message?.author?.name[0]}
          uniqueKey={message?.author?._id}
        />
      </ListItemAvatar>
      <Stack
        alignItems={"flex-start"}
        sx={{
          '&:hover .disappear': {
            opacity: 1,
          }
        }}
      >
        <Stack
          sx={{
            backgroundColor: "darkslategray",
            padding: 1,
            border: isTicketMessage ? "2px solid lightgray" : "none",
            borderRadius: "0 10px 10px 10px",
            position: "relative",
            margin: 0,
            flex: "unset",
            "-webkit-flex": "unset"
          }}

          direction={isReply ? "row" : "column"}
          gap={isReply ? 1 : 0}
          alignItems={isReply ? "center" : "initial"}
        >
          <Stack direction={"row"} >
            <Typography
              sx={{ display: 'inline' }}
              component="span"
              fontSize={"1rem"}
              fontWeight={400}
            >
              {message?.author?.name}
            </Typography>
          </Stack>
          < Stack direction={"row"} justifyContent={"space-between"} >
            <Typography
              sx={{ display: 'inline', ...(isReply ? { textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: "calc(40vw - 300px)" } : {}) }}
              component="span"
              variant="body2"
              color="text.primary"
            >
              {message?.content}
            </Typography>
          </Stack >
        </Stack >
        {!isReply ?
          <Stack direction={"row"} gap={1} alignItems={"center"}>
            <Typography
              sx={{ color: "gray", fontSize: "0.8rem", textAlign: "right" }}
            >
              {format(new Date(message?.timestamp), "MMMM d, yyyy h:mm a")}
            </Typography>
            {!isTicketMessage &&
              <Tooltip title="Remove from context" arrow enterDelay={300}>
                <RemoveCircleOutline
                  className="disappear"
                  onClick={handleDeleteContextMessage}
                  sx={{
                    fontSize: "14px",
                    opacity: 0,
                    transition: "all 0.3s",
                    '&:hover': {
                      cursor: "pointer",
                      color: "red"
                    }
                  }}
                />
              </Tooltip>
            }
            <Tooltip title="Open in discord" arrow enterDelay={300}>
              <Link
                target="_blank"
                href={message?.msg_url}
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <DiscordIcon
                  className={"disappear"}
                  sx={{
                    fontSize: "14px",
                    opacity: 0,
                    transition: "all 0.3s",
                    '&:hover': {
                      cursor: "pointer",
                      color: "#5865F2"
                    }
                  }}
                />
              </Link>
            </Tooltip>
          </Stack>
          : null}
      </Stack>
    </Stack >
  )
}
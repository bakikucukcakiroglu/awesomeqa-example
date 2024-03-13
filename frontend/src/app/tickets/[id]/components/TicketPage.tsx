"use client"
import { useState } from 'react';
import { useParams } from 'next/navigation'
import { format } from 'date-fns';
import { Box, Button, Chip, Divider, Skeleton, Stack, Typography } from "@mui/material";
import { Close, Loop } from "@mui/icons-material";
import { useResolveTicket, useTicket, useUpdateTicket } from "../../../../queries/ticket.queries";
import AwesomeIcon from "../../../../components/AwesomeIcon";
import AwesomeMessage from "./AwesomeMessage/AwesomeMessage";
import AwesomeReply from "./AwesomeReply";
import AwesomeResolver from './AwesomeResolver';
import AwesomeStatusChip from './AwesomeStatusChip';

export default function TicketPage() {

  const params = useParams<{ id: string }>()
  const id = params?.id;

  const { loading, ticket, refetch } = useTicket(id?.toString() || "");
  const updateTicket = useUpdateTicket(refetch);
  const resolveTicket = useResolveTicket(refetch);


  const [resolveModalOpen, setResolveModalOpen] = useState(false);

  const ticketMessage = ticket?.messages?.find((message) => ticket?.msg_id == message?._id);

  const onCloseResolveModal = () => {
    setResolveModalOpen(false);
  }

  const handleDeleteContextMessage = (msg_id) => {
    updateTicket(ticket?._id, { "context_messages": ticket?.context_messages?.filter((msg) => msg != msg_id) })
  }

  const handleResolve = (content) => {

    resolveTicket({
      id: ticket?._id,
      content: content,
      reply_to_message_id: ticket?.msg_id
    });

    setResolveModalOpen(false);

  }

  return (
    <>
      <AwesomeResolver open={resolveModalOpen} onClose={onCloseResolveModal} handleResolve={handleResolve} />
      <Box sx={{ overflow: "auto", height: "-webkit-fill-available" }}>
        <Box sx={{
          position: "sticky", top: "0px", zIndex: 1000, backdropFilter: "blur(10px)"
        }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            padding={1}
          >
            <Stack direction={"row"} gap={1}>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", marginRight: 1 }}
              >
                Ticket
              </Typography>
              {loading ?
                <Skeleton variant="rounded" width={120} height={30} />
                :
                <AwesomeStatusChip status={ticket?.status || ""} />
              }
              {
                loading ?
                  <Skeleton variant="rounded" width={120} height={30} />
                  :
                  ticket?.resolved_by && ticket?.status == "resolved" &&
                  <Chip
                    label={ticket?.resolved_by}
                    variant="outlined"
                    icon={<Chip
                      label="resolved by"
                      size="small"
                      variant="outlined"
                    />}
                  />}
              {
                loading ?
                  <Skeleton variant="rounded" width={120} height={30} />
                  :
                  ticket?.ts_last_status_change &&
                  <Chip
                    label={format(ticket?.ts_last_status_change, "MMMM d, yyyy h:mm a")}
                    variant="outlined"
                    icon={<Chip
                      label={ticket.status + " at"}
                      size="small"
                      variant="outlined"
                    />}
                  />}
            </Stack>
            <Stack direction={"row"} gap={1}>
              {loading ?
                <Skeleton variant="rounded" width={120} height={36} />
                :
                ticket?.status == "open" &&
                <Button
                  onClick={() => {
                    setResolveModalOpen(true);
                  }}
                  sx={{
                    border: "1px solid rgb(95,81,197)",
                    '&:hover': {
                      backgroundColor: "rgba(95,81,197, 0.15)"
                    }
                  }}
                  startIcon={<AwesomeIcon />}
                  variant="outlined"
                >
                  <Typography
                    sx={{
                      backgroundcolor: "primary",
                      backgroundImage: `linear-gradient(90deg, rgba(95,81,197,1) 0%, rgba(166,87,240,1) 93%)`,
                      backgroundSize: "100%",
                      backgroundRepeat: "repeat",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent"
                    }}
                  >
                    Resolve
                  </Typography>
                </Button>
              }
              {
                loading ?
                  <Skeleton variant="rounded" width={120} height={36} />
                  :
                  ticket?.status == "open" ?
                    <Button
                      color="error"
                      startIcon={<Close />}
                      variant="outlined"
                      onClick={() => {
                        updateTicket(ticket?._id, { "status": "closed" })
                      }}
                    >
                      Close
                    </Button> :
                    <Button
                      color="info"
                      startIcon={<Loop />}
                      variant="outlined"
                      onClick={() => {
                        updateTicket(ticket?._id, { "status": "open" })
                      }}
                    >
                      Re-open
                    </Button>
              }
            </Stack>
          </Stack>
        </Box>
        <Divider />
        {(!id || loading) ?
          Array.from(Array(20).keys()).map((i) => {
            return <Stack direction={"row"} key={`skeleton-${i}`} gap={2} marginTop={2}>
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="rounded" width={`${Math.random() * 40 + 10}vw`} height={60} />
            </Stack>
          })
          :
          <Box sx={{ marginTop: 2 }}>
            <AwesomeMessage
              message={ticketMessage}
              isTicketMessage={true}
            />
            <Divider>{`${ticket?.messages?.length} messages in this context`}</Divider>
            <Stack
              sx={{
                overflowX: "hidden",
              }}
            >
              {
                ticket?.messages?.map((message, index) => {
                  return (

                    message?.reference_msg_id ? <AwesomeReply
                      message={message}
                      isTicketMessage={ticket?.msg_id == message?._id}
                      key={index}
                      handleDeleteContextMessage={() => handleDeleteContextMessage(message?._id)}

                    /> : <AwesomeMessage
                      key={index}
                      message={message}
                      isTicketMessage={ticket?.msg_id == message?._id}
                      props={{ sx: { margin: 1 } }}
                      handleDeleteContextMessage={() => handleDeleteContextMessage(message?._id)}
                      showAvatar={ticket?.messages?.[index - 1]?.author?.id != message?.author?.id}
                    />
                  )
                })}
            </Stack>
          </Box>
        }
      </Box>
    </>
  )
}
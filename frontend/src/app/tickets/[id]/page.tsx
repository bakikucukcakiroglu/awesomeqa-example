"use client"
import HeadComponent from "../../../components/Head";
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useTicket, useUpdateTicket } from "../../../queries/ticket.queries";
import { Box, Divider, Icon, IconButton, List, ListItem, ListItemAvatar, ListItemText, Stack, Typography } from "@mui/material";
import AwesomeMessage from "./components/AwesomeMessage/AwesomeMessage";
import AwesomeReply from "./components/AwesomeReply";
import Head from "next/head";

export default function Ticket() {

  const params = useParams<{ id: string }>()
  const id = params?.id;

  const { loading, ticket, refetch } = useTicket(id?.toString() || "");

  const ticketMessage = ticket?.messages?.find((message) => ticket?.msg_id == message?._id);

  const updateTicket = useUpdateTicket(refetch);

  const handleDeleteContextMessage = (msg_id) => {
    updateTicket(ticket?._id, { "context_messages": ticket?.context_messages?.filter((msg) => msg != msg_id) })
  }

  return (
    <>
      <Head>
        <title>This page has a title 🤔</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Box sx={{ overflow: "auto", height: "-webkit-fill-available" }}>
        {(!id || loading) ? <p>Loading...</p> :
          <>
            <AwesomeMessage
              message={ticketMessage}
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
          </>
        }
      </Box>
    </>
  )
}
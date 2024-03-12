"use client"
import { useParams, useRouter } from 'next/navigation'
import { useTicket, useUpdateTicket } from "../../../../../queries/ticket.queries";
import { Drawer } from "@mui/material";
import AwesomeResolver from '../../../[id]/components/AwesomeResolver';
import { useState } from 'react';
import TicketPage from '../../../[id]/components/TicketPage';

export default function Ticket() {

  const router = useRouter();


  const params = useParams<{ id: string }>()
  const id = params?.id;

  const { loading, ticket, refetch } = useTicket(id?.toString() || "");
  const updateTicket = useUpdateTicket(refetch);

  const [resolveModalOpen, setResolveModalOpen] = useState(false);

  const ticketMessage = ticket?.messages?.find((message) => ticket?.msg_id == message?._id);

  const onCloseResolveModal = () => {
    setResolveModalOpen(false);
  }

  const handleDeleteContextMessage = (msg_id) => {
    updateTicket(ticket?._id, { "context_messages": ticket?.context_messages?.filter((msg) => msg != msg_id) })
  }

  return (
    <>
      <AwesomeResolver open={resolveModalOpen} onClose={onCloseResolveModal} />
      <Drawer open={true} onClose={() => router.back()}

        ModalProps={{
          sx: {
            maxWidth: "40vw", '& .MuiDrawer-paper': {
              width: "40vw", maxWidth: "40vw", padding: 0, overflow: "hidden", backdropFilter: "blur(10px)",
              background: "transparent"
            }
          }
        }} >

        <TicketPage />
      </Drawer>
    </>
  )
}
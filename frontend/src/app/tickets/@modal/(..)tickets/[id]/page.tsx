"use client"
import { useRouter } from 'next/navigation'
import { Drawer } from "@mui/material";
import TicketPage from '../../../[id]/components/TicketPage';

export default function Ticket() {

  const router = useRouter();

  return (
    <>
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
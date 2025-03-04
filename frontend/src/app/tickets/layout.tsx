export default function TicketsLayout({
  children,
  modal
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {

  return (
    <>
      {children}
      {modal}
    </>
  )
}
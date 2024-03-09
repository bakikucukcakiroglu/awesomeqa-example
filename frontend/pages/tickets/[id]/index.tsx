import HeadComponent from "../../../components/Head";
import { useRouter } from 'next/router'


export default function Ticket() {

  const router = useRouter()
  const { id } = router.query

  return (
    <>
      <HeadComponent title={"Ticket"} metaData={"Ticket"} />
      <div>
        <h1>Ticket {id}</h1>
      </div>
    </>
  )
}
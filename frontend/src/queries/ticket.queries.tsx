import { enqueueSnackbar, useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { Ticket, TicketsResponse, Author } from "../types";


const AUTHOR_ADMIN = {
  "author": {
    "id": "208997",
    "name": "Saul Goodman",
    "nickname": "saul",
    "avatar_url": "https://cdn.discordapp.com/avatars/988762531663327302/1e8745b161f3bc10fb5e3be942fd2774.png?size=1024",
  }
}

const msg_url = `https://discord.com/channels/888373065871747594/888373065871747597`


type UseTicketsProps = {
  page: number,
  flagged: boolean,
  author: string,
  channel: string,
  status: string,
  query: string
}

export function useTickets({ page, flagged, author, channel, status, query }: UseTicketsProps) {

  const size: number = 20;

  const params = new URLSearchParams();

  params.set("page", page?.toString());
  params.set("size", size.toString());
  flagged && params.set("flagged", "true")
  params.set("author", author);
  params.set("channel", channel);
  params.set("status", status);
  params.set("query", query);

  const [tickets, setTickets] = useState<TicketsResponse | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [enabled, setEnabled] = useState<boolean>(false);

  const refetch = () => {
    fetchData();
  }

  const fetchData = async () => {

    if (!enabled) return;
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/?${params.toString()}`);
      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
    setLoading(false);
  }

  useEffect(() => {
    console.log('useTickets effect');
    fetchData();
  }, [page, flagged, author, channel, status, query, enabled, size]);

  return { refetch, loading, page, tickets, enabled, setEnabled, size };
}

export function useTicket(id: string) {

  const [ticket, setTicket] = useState<Ticket | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  const refetch = () => {
    fetchData();
  }

  const fetchData = async () => {

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/${id}`);
      const data = await response.json();
      setTicket(data);
    } catch (error) {
      console.error('Error fetching ticket:', error);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!id) return;
    fetchData();
  }, [id]);

  return { loading, ticket, refetch };
}

export function useResolveTicket(refetch: () => void) {

  const { enqueueSnackbar } = useSnackbar();

  const resolveTicket = ({
    id,
    content,
    reply_to_message_id
  }) => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/${id}/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content,
        reply_to_message_id,
        ...AUTHOR_ADMIN,
        msg_url
      })
    }).then(() => {

      enqueueSnackbar("Ticket resolved!", { variant: 'success' });
      console.log('Resolved ticket:', id);
      refetch();
    }).catch((error) => {
      console.error('Error deleting tickets:', error);
      enqueueSnackbar('Error resolving tickets!', { variant: 'error' });
    })
  }

  return resolveTicket;
}

export function useCloseTickets(refetch: () => void) {

  const closeTickets = (ids) => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/close`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ids)
    }).then(() => {
      enqueueSnackbar(ids?.length > 1 ? 'Tickets closed!' : "Ticket closed!", { variant: 'success' });
      console.log('Closed tickets:', ids);
      refetch();
    }).catch((error) => {
      console.error('Error closing tickets:', error);
    })
  }

  return closeTickets;
}

export function useOpenTickets(refetch: () => void) {

  const openTickets = (ids) => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/open`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ids)
    }).then(() => {
      enqueueSnackbar(ids?.length > 1 ? 'Tickets re-opened!' : "Ticket re-opened!", { variant: 'success' });
      console.log('Opened tickets:', ids);
      refetch();
    }).catch((error) => {
      console.error('Error opening tickets:', error);
    })
  }

  return openTickets;
}

export function useFlagTickets() {

  const flagTicket = (ticket_ids, flagged) => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/flag`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ticket_ids, flagged })
    });
  }

  return flagTicket;
}


export function useUpdateTicket(refetch: () => void) {

  const updateTicket = async (ticket_id, data) => {

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/${ticket_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      refetch();
      enqueueSnackbar('Ticket updated!', { variant: 'success' });
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  }

  return updateTicket;
}

export function useTicketAuthors() {

  const [users, setUsers] = useState<Author[] | undefined>(undefined);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/authors`)
      .then((response) => {
        console.log(response);
        return response.json()
      })
      .then((data) => setUsers(data))
      .catch((error) => console.error('Error fetching users:', error));
  }, []);

  return users;
}

export function useChannels() {

  const [channels, setChannels] = useState<string[] | undefined>(undefined);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/channels`)
      .then((response) => {
        console.log(response);
        return response.json()
      })
      .then((data) => setChannels(data))
      .catch((error) => console.error('Error fetching channels:', error));
  }, []);

  return channels;
}

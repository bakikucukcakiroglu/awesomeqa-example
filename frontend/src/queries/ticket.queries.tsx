import { enqueueSnackbar, useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { Ticket, TicketsResponse } from "../types";
import { Author } from "next/dist/lib/metadata/types/metadata-types";


type UseTicketsProps = {
  page: number,
  flagged: boolean,
  author: string,
  channel: string
}

export function useTickets({ page, flagged, author, channel }: UseTicketsProps) {

  const size: number = 20;

  const params = new URLSearchParams();

  params.set("page", page?.toString());
  params.set("size", size.toString());
  params.set("author", author);
  params.set("channel", channel);

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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets?${params.toString()}`);
      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, [page, flagged, author, channel, enabled, size]);

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

export function useResolveTickets(refetch: () => void) {

  const { enqueueSnackbar } = useSnackbar();

  const resolveTickets = (ids) => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/resolved_by`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ticket_ids: ids, resolved_by: 'admin' })
    }).then(() => {

      enqueueSnackbar(ids?.length > 1 ? 'Tickets resolved!' : "Ticket resolved!", { variant: 'success' });
      console.log('Deleted tickets:', ids);
      refetch();
    }).catch((error) => {
      console.error('Error deleting tickets:', error);
      enqueueSnackbar('Error resolving tickets!', { variant: 'error' });
    })
  }

  return resolveTickets;
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

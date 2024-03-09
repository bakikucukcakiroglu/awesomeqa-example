import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";

export function useTickets(page, flagged, author, channel) {

  const size = 20;

  const params = new URLSearchParams();

  page && params.set("page", page);
  params.set("size", size.toString());
  flagged && params.set("flagged", flagged);
  author && params.set("author", author);
  channel && params.set("channel", channel);

  console.log(params.toString());

  const [tickets, setTickets] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);

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

export function useDeleteTickets(refetch: () => void) {

  const { enqueueSnackbar } = useSnackbar();

  const deleteTickets = (ids) => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ids)
    }).then(() => {

      enqueueSnackbar(ids?.length > 1 ? 'Tickets resolved!' : "Ticket resolved!", { variant: 'success' });
      console.log('Deleted tickets:', ids);
      refetch();
    }).catch((error) => {
      console.error('Error deleting tickets:', error);
      enqueueSnackbar('Error resolving tickets!', { variant: 'error' });
    })
  }

  return deleteTickets;

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

export function useDistinctTicketAuthors() {

  const [users, setUsers] = useState(undefined);

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

  const [channels, setChannels] = useState(undefined);

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

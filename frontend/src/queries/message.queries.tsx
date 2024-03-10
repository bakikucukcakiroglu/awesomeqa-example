import { useEffect, useState } from "react";

export function useChannels() {

  const [channels, setChannels] = useState(undefined);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/channels`)
      .then((response) => {
        console.log(response);
        return response.json()
      })
      .then((data) => setChannels(data))
      .catch((error) => console.error('Error fetching channels:', error));
  }, []);

  return channels;
}

export function useUsers() {

  const [users, setUsers] = useState(undefined);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/users`)
      .then((response) => {
        console.log(response);
        return response.json()
      })
      .then((data) => setUsers(data))
      .catch((error) => console.error('Error fetching users:', error));
  }, []);

  return users;
}

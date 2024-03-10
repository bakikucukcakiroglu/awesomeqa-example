export interface Ticket {
  _id: string;
  msg_id: string;
  status: string;
  resolved_by: null | string;
  flagged: boolean;
  ts_last_status_change: null | string;
  timestamp: string;
  context_messages: string[];
  message: Message;
  messages?: Message[];
}

export interface TicketsResponse {
  data: Ticket[];
  total_count: number;
}

export interface Author {
  id: string;
  name: string;
  nickname: string;
  color: string;
  discriminator: string;
  avatar_url: string;
  is_bot: boolean;
  timestamp_insert: string;
}

interface Message {
  _id: string;
  channel_id: string;
  parent_channel_id: string | null;
  community_server_id: string;
  timestamp: string;
  has_attachment: boolean;
  reference_msg_id: string | null;
  timestamp_insert: string;
  discussion_id: string;
  author_id: string;
  content: string;
  msg_url: string;
  author: Author;
}

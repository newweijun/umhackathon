export interface Message {
  id: number;
  text: string;
  sender: string;
  isMe: boolean;
  time: string;
}

export interface Chat {
  id: string;
  company: string;
  avatar: string;
  lastMessage: string;
  time: string;
  messages: Message[];
}

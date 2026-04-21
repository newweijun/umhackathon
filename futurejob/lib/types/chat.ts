export interface Message {
  id: string;
  text: string;
  sender: string;
  isMe: boolean;
  time: string;
}

export interface Chat {
  id: string;
  participantId: string;
  company: string;
  avatar: string;
  lastMessage: string;
  time: string;
  messages: Message[];
}

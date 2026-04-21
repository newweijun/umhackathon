"use client";

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  type DocumentData,
  type QuerySnapshot,
} from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase/client";

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  participants: string[];
  applicationId: string;
  createdAt: any;
}

export async function sendMessage(
  senderId: string,
  receiverId: string,
  text: string,
  applicationId: string
): Promise<void> {
  const messagesRef = collection(firebaseDb, "messages");
  await addDoc(messagesRef, {
    senderId,
    receiverId,
    text,
    participants: [senderId, receiverId].sort(),
    applicationId,
    createdAt: serverTimestamp(),
  });
}

export function subscribeToMessages(
  applicationId: string,
  userId: string,
  callback: (messages: Message[]) => void
) {
  const messagesRef = collection(firebaseDb, "messages");
  const q = query(
    messagesRef,
    where("applicationId", "==", applicationId),
    where("participants", "array-contains", userId),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Message[];
    callback(messages);
  });
}

export function subscribeToConversations(
  userId: string,
  callback: (messages: Message[]) => void
) {
  const messagesRef = collection(firebaseDb, "messages");
  const q = query(
    messagesRef,
    where("participants", "array-contains", userId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Message[];
    callback(messages);
  });
}

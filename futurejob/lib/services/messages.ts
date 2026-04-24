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
  applicationId: string,
) {
  await addDoc(collection(firebaseDb, "messages"), {
    senderId,
    receiverId,
    text,
    applicationId, // ← must exist
    participants: [senderId, receiverId], // ← must exist
    createdAt: serverTimestamp(),
  });
}

export function subscribeToMessages(
  applicationId: string,
  currentUserId: string,
  callback: (msgs: Message[]) => void,
) {
  const q = query(
    collection(firebaseDb, "messages"),
    where("applicationId", "==", applicationId), // ← filter by applicationId
    orderBy("createdAt", "asc"),
  );

  return onSnapshot(q, (snapshot) => {
    const msgs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Message[];
    callback(msgs);
  });
}

export function subscribeToConversations(
  userId: string,
  callback: (messages: Message[]) => void,
) {
  const messagesRef = collection(firebaseDb, "messages");
  const q = query(
    messagesRef,
    where("participants", "array-contains", userId),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Message[];
    callback(messages);
  });
}

"use client";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp,
  type DocumentData,
  type QuerySnapshot,
} from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase/client";
import { type NotificationType } from "@/lib/domain/enums";

export interface NotificationRecord {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  applicationId?: string;
  read: boolean;
  createdAt: any;
}

export async function createNotification2(
  data: Omit<NotificationRecord, "id" | "createdAt" | "read">,
): Promise<string> {
  const notificationsRef = collection(firebaseDb, "notifications");
  const docRef = await addDoc(notificationsRef, {
    ...data,
    read: false,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getUserNotifications(
  userId: string,
): Promise<NotificationRecord[]> {
  const notificationsRef = collection(firebaseDb, "notifications");
  const q = query(
    notificationsRef,
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as NotificationRecord[];
}

export async function markNotificationAsRead(
  notificationId: string,
): Promise<void> {
  const notificationRef = doc(firebaseDb, "notifications", notificationId);
  await updateDoc(notificationRef, {
    read: true,
  });
}

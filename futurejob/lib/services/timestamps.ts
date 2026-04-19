import { serverTimestamp } from "firebase/firestore";

type FirestorePayload = Record<string, unknown>;

export function withCreatedAndUpdatedAt<T extends FirestorePayload>(payload: T) {
  return {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

export function withUpdatedAt<T extends FirestorePayload>(payload: T) {
  return {
    ...payload,
    updatedAt: serverTimestamp(),
  };
}

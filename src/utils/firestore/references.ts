import { db } from "@/../firebase.config";
import { Signals } from "@/types/signals";
import { doc, collection, setDoc, getDoc } from "firebase/firestore";

const environmentDocRef = doc(
  db,
  "environments",
  (process.env.NEXT_PUBLIC_ENVIRONMENT as string) || "development"
);

const devicesCollection = collection(
  db,
  "environments",
  (process.env.NEXT_PUBLIC_ENVIRONMENT as string) || "development",
  "devices"
);

const actionsDoc = (deviceFingerprint: string, actionType: string) =>
  doc(
    db,
    "environments",
    (process.env.NEXT_PUBLIC_ENVIRONMENT as string) || "development",
    "devices",
    deviceFingerprint,
    "actions",
    actionType
  );

const historyCollectionActions = (
  deviceFingerprint: string,
  actionType: string
) =>
  collection(
    db,
    "environments",
    (process.env.NEXT_PUBLIC_ENVIRONMENT as string) || "development",
    "devices",
    deviceFingerprint,
    "actions",
    actionType,
    "history"
  );

const historyCollectionSignals = (deviceFingerprint: string, signal: Signals) =>
  collection(
    db,
    "environments",
    (process.env.NEXT_PUBLIC_ENVIRONMENT as string) || "development",
    "devices",
    deviceFingerprint,
    "signals",
    signal,
    "history"
  );

const initPaths = async () => {
  // Make sure environment doc exists
  const environmentDoc = await getDoc(environmentDocRef);
  if (!environmentDoc.exists()) {
    await setDoc(environmentDocRef, {
      name: "development",
    });
  }
};

export {
  actionsDoc,
  historyCollectionActions,
  historyCollectionSignals,
  devicesCollection,
  environmentDocRef,
  initPaths,
};

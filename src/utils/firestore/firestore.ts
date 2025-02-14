/* eslint-disable @typescript-eslint/no-explicit-any */
import { Action } from "@/types/actions";
import { HeartbeatSendSignal, Signals } from "@/types/signals";
import {
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  getDoc,
  setDoc,
  Unsubscribe,
  onSnapshot,
} from "firebase/firestore";
import {
  actionsDoc,
  devicesCollection,
  historyCollectionActions,
  historyCollectionSignals,
} from "./references";
export async function sendAction(action: Action) {
  // check if doc of action.type exists and create if not
  const actionsRef = actionsDoc(action.deviceFingerprint, action.type);
  const actions = await getDoc(actionsRef);
  console.log("Sending action to", action.deviceFingerprint);
  if (!actions.exists()) {
    await setDoc(actionsRef, {});
  }

  const historyCollectionRef = historyCollectionActions(
    action.deviceFingerprint,
    action.type
  );

  console.log("Adding action to history", action.id);
  await addDoc(historyCollectionRef, {
    id: action.id,
    data: action.data,
    timestamp: action.timestamp,
    expiresAt: action.expiresAt,
    didComplete: false,
  });
  console.log("Action added to history", action.id);
}

/**
 * Goes over all users->fingerprints, for each fingerprint go into signals and get the latest heartbeat action
 */
export async function getDevicesLatestHeartbeat(): Promise<
  HeartbeatSendSignal[]
> {
  const heartbeatSendActions: HeartbeatSendSignal[] = [];
  const allDevices = await getDocs(devicesCollection);
  for (const device of allDevices.docs) {
    const historyCollectionRef = historyCollectionActions(
      device.id,
      "heartbeat"
    );

    const q = query(
      historyCollectionRef,
      orderBy("timestamp", "desc"),
      limit(1)
    );
    const latestHeartbeat = await getDocs(q);
    if (!latestHeartbeat.empty) {
      const heartbeatData = latestHeartbeat.docs[0].data();
      const heartbeatSend = new HeartbeatSendSignal({
        id: heartbeatData.id,
        data: heartbeatData.data.state,
        currentPath: heartbeatData.currentPath,
        timestamp: heartbeatData.timestamp,
      });
      heartbeatSendActions.push(heartbeatSend);
    }
  }

  return heartbeatSendActions;
}

export async function getAllDevices() {
  const allDevices = await getDocs(devicesCollection);
  return allDevices.docs.map((doc) => doc.data());
}

/**
 * This function listens to changes in the actions collection for a specific action type
 * @param deviceFingerprint - The device fingerprint
 * @param actionType - The type of action to listen for (e.g., 'heartbeat-send')
 * @param onUpdate - The function to call when the data changes
 * @returns An unsubscribe function
 */
export async function listenToDevicesSignal(
  signal: Signals,
  onUpdate: (data: any[]) => void,
  condition: (doc: any) => boolean
): Promise<Unsubscribe> {
  return onSnapshot(devicesCollection, async (querySnapshot) => {
    const allDevices = querySnapshot.docs.map((doc) => doc.data());
    const deviceFingerprints = allDevices.map(
      (device) => device.deviceFingerprint
    );
    deviceFingerprints.map((deviceFingerprint) => {
      return onSnapshot(
        historyCollectionSignals(deviceFingerprint, signal),
        async (querySnapshot) => {
          const filteredDocs = querySnapshot.docs.filter((doc) => {
            return condition(doc.data());
          });

          const filteredDocsData = filteredDocs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          if (filteredDocsData.length > 0) {
            onUpdate(filteredDocsData);
          }
        }
      );
    });
  });
}

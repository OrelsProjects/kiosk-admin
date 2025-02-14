/* eslint-disable @typescript-eslint/no-explicit-any */
import { HeartbeatAction, RefreshAction, ResetCheckInAction } from "@/types/actions";
import { HeartbeatSendSignal } from "@/types/signals";
import {
  sendAction as sendActionToFirestore,
  listenToDevicesSignal as listenToDevicesSignalFirestore,
  getDevicesLatestHeartbeat,
  getAllDevices,
} from "@/utils/firestore/firestore";
import cuid from "cuid";
import { Unsubscribe } from "firebase/firestore";
import { getStartOfDay } from "@/lib/date";
import { useEffect } from "react";
import { initPaths } from "@/utils/firestore/references";

/**
/**
 * This client will send actions to the kiosk and listen to signals from the kiosk.
 */
export const useActions = () => {
  useEffect(() => {
    initPaths();
  }, []);

  const sendRefreshAllAction = async (data?: {
    extraData?: Record<string, string>;
  }) => {
    const allDevices = await getAllDevices();
    console.log("Sending refresh all action to", allDevices.length, "devices");
    for (const device of allDevices) {
      await sendActionToFirestore(
        new HeartbeatAction({
          id: cuid(),
          deviceFingerprint: device.deviceFingerprint,
          propertyId: device.propertyId || "",
          extraData: data?.extraData,
        })
      );
    }
    console.log("Refresh all action sent to", allDevices.length, "devices");
  };

  const sendRefreshAction = async (to: {
    deviceFingerprint: string;
    propertyId: string;
    data?: Record<string, string>;
  }) => {
    try {
      await sendActionToFirestore(
        new RefreshAction({
          id: cuid(),
          deviceFingerprint: to.deviceFingerprint,
          propertyId: to.propertyId,
          data: to.data,
        })
      );
      console.log("Refresh action sent to", to.deviceFingerprint);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const sendResetCheckInAction = async (to: {
    deviceFingerprint: string;
    propertyId: string;
  }) => {
    await sendActionToFirestore(
      new ResetCheckInAction({
        id: cuid(),
        deviceFingerprint: to.deviceFingerprint,
        propertyId: to.propertyId,
      })
    );
  };

  const getAllDevicesHeartbeat = async (): Promise<HeartbeatSendSignal[]> => {
    try {
      const heartbeats = await getDevicesLatestHeartbeat();
      return heartbeats;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const listenToDevicesHeartbeat = async (
    onUpdate: (data: HeartbeatSendSignal) => void
  ): Promise<Unsubscribe> => {
    return listenToDevicesSignalFirestore(
      "heartbeat",
      (data: any[]) => {
        const heartbeats = data.map((item) => {
          return new HeartbeatSendSignal({
            id: item.id,
            data: item.data?.state,
            currentPath: item.currentPath,
            timestamp: item.timestamp,
          });
        });
        const latestHeartbeat = heartbeats.sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        )[0];
        onUpdate(latestHeartbeat || null);
      },
      (doc) => doc.timestamp?.toDate() > getStartOfDay()
    );
  };

  return {
    sendRefreshAction,
    getAllDevicesHeartbeat,
    sendRefreshAllAction,
    listenToDevicesHeartbeat,
    sendResetCheckInAction,
  };
};

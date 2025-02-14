"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCw, MoreVertical } from "lucide-react";
import { formatDistanceToNow, differenceInSeconds } from "date-fns";
import { cn } from "@/lib/utils";
import { useActions } from "@/hooks/useActions";
import { HeartbeatSendSignal } from "@/types/signals";
import { Actions } from "@/types/actions";
import { Unsubscribe } from "firebase/firestore";
import { toast } from "react-toastify";

export default function AdminPanel() {
  const {
    sendRefreshAction,
    sendRefreshAllAction,
    listenToDevicesHeartbeat,
    sendResetCheckInAction,
  } = useActions();
  const devices = useRef<HeartbeatSendSignal[]>([]);
  // const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [loadingAction, setLoadingAction] = useState<boolean>(false);
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);
  const heartbeatSubscription = useRef<Unsubscribe | null>(null);
  const [, setTimeUpdate] = useState(0);
  const [, setDevices] = useState<HeartbeatSendSignal[]>([]);

  useEffect(() => {
    console.log("Listening to heartbeat");
    listenToDevicesHeartbeat((data) => {
      if (!data) {
        return;
      }
      console.log("Received heartbeat", data.deviceFingerprint);
      // if the device exists, update it, otherwise add it
      const deviceIndex = devices.current.findIndex(
        (device) => device.deviceFingerprint === data.deviceFingerprint
      );
      if (deviceIndex !== -1) {
        devices.current[deviceIndex] = data;
      } else {
        devices.current.push(data);
        console.log("Added device", data.deviceFingerprint);
        setDevices([...devices.current]);
      }
    }).then((unsubscribe) => {
      heartbeatSubscription.current = unsubscribe;
    });

    return () => {
      heartbeatSubscription.current?.();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUpdate((prev) => prev + 1);
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  // const handleSelectAll = () => {
  //   if (selectedDevices.length === devices.current.length) {
  //     setSelectedDevices([]);
  //   } else {
  //     setSelectedDevices(devices.current.map((device) => device.id));
  //   }
  // };

  // const handleSelectDevice = (deviceId: string) => {
  //   if (selectedDevices.includes(deviceId)) {
  //     setSelectedDevices(selectedDevices.filter((id) => id !== deviceId));
  //   } else {
  //     setSelectedDevices([...selectedDevices, deviceId]);
  //   }
  // };

  const handleDeviceAction = async (
    deviceId: string,
    propertyId: string,
    propertyName: string,
    action: Actions
  ) => {
    setLoadingAction(true);
    const toastId = toast.loading(() => (
      <p>
        Sending action: <span className="text-primary">{action}</span> to{" "}
        <span className="text-primary">{propertyName}</span>
      </p>
    ));
    try {
      switch (action) {
        case "reset-check-in":
          await sendResetCheckInAction({
            deviceFingerprint: deviceId,
            propertyId,
          });
          break;
        case "refresh":
          await sendRefreshAction({
            deviceFingerprint: deviceId,
            propertyId,
          });
          break;
      }
      toast.update(toastId, {
        render: "Action sent successfully",
        isLoading: false,
        autoClose: 2500,
      });
    } catch (error) {
      console.error(error);
      toast.update(toastId, {
        render: "Error sending action",
        isLoading: false,
        autoClose: 2500,
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRefreshAll = async () => {
    setIsRefreshingAll(true);
    const toastId = toast.loading("Sending refresh request...");
    try {
      await sendRefreshAllAction();
      toast.update(toastId, {
        render: "Refresh successful",
        type: "success",
        autoClose: 2500,
        isLoading: false,
      });
    } catch (error) {
      console.error(error);
      toast.update(toastId, {
        render: "Error refreshing",
        type: "error",
        autoClose: 2500,
        isLoading: false,
      });
    } finally {
      setIsRefreshingAll(false);
    }
  };

  const formatTimestamp = (date: Date) => {
    const diffInSeconds = differenceInSeconds(new Date(), date);
    if (diffInSeconds < 60) {
      return "now";
    }
    return formatDistanceToNow(date, {
      addSuffix: true,
      includeSeconds: true,
    });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Active Devices</h1>
        <Button
          onClick={handleRefreshAll}
          variant="outline"
          disabled={isRefreshingAll}
        >
          <RefreshCw
            className={cn("mr-2 h-4 w-4", {
              "animate-spin": isRefreshingAll,
            })}
          />
          Refresh All
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {/* <TableHead className="w-12">
                <Checkbox
                  checked={selectedDevices.length === devices.current.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead> */}
              <TableHead>Location</TableHead>
              <TableHead>Path</TableHead>
              <TableHead>Property ID</TableHead>
              <TableHead>Device ID</TableHead>
              <TableHead>Last Seen</TableHead>
              <TableHead>System State</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="w-[180px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {devices.current.map((device) => (
              <TableRow key={device.id}>
                {/* <TableCell>
                  <Checkbox
                    checked={selectedDevices.includes(device.id)}
                    onCheckedChange={() => handleSelectDevice(device.id)}
                  />
                </TableCell> */}
                <TableCell>
                  {device.data.property.selectedProperty?.listing_name}
                </TableCell>
                <TableCell>{device.currentPath}</TableCell>
                <TableCell>
                  {device.data.property.selectedProperty?.id}
                </TableCell>
                <TableCell>{device.data.auth.deviceFingerprint}</TableCell>
                <TableCell>{formatTimestamp(device.timestamp)}</TableCell>
                <TableCell>{device.data.system.state}</TableCell>
                <TableCell>{device.data?.auth?.user?.username}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <span className="mr-2">Actions</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuItem
                        className="w-full justify-start"
                        onSelect={(e) => e.preventDefault()}
                        onClick={() =>
                          handleDeviceAction(
                            device.deviceFingerprint,
                            device.data.property.selectedProperty?.id || "",
                            device.data.property.selectedProperty
                              ?.listing_name || "",
                            "reset-check-in"
                          )
                        }
                        disabled={loadingAction}
                      >
                        Reset check in
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="w-full justify-start"
                        onSelect={(e) => e.preventDefault()}
                        onClick={() =>
                          handleDeviceAction(
                            device.deviceFingerprint,
                            device.data.property.selectedProperty?.id || "",
                            device.data.property.selectedProperty
                              ?.listing_name || "",
                            "refresh"
                          )
                        }
                        disabled={loadingAction}
                      >
                        Refresh
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

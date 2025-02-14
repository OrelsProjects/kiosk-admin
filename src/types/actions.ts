export type Actions = "refresh" | "heartbeat" | "reset-check-in";
export class Action {
  id: string;
  type: Actions;
  data: Record<string, string>;
  deviceFingerprint: string;
  propertyId: string;
  timestamp: Date;
  expiresAt: Date;

  constructor(
    id: string,
    type: Actions,
    data: Record<string, string>,
    deviceFingerprint: string,
    propertyId: string,
    expiresAt: Date
  ) {
    this.id = id;
    this.type = type;
    this.data = data;
    this.deviceFingerprint = deviceFingerprint;
    this.propertyId = propertyId;
    this.timestamp = new Date();
    this.expiresAt = expiresAt;
  }
}

export class RefreshAction extends Action {
  constructor(data: {
    id: string;
    propertyId: string;
    deviceFingerprint: string;
    data?: Record<string, string>;
  }) {
    super(
      data.id,
      "refresh",
      data.data || {},
      data.deviceFingerprint,
      data.propertyId,
      new Date(Date.now() + 1000 * 10)
    );
  }
}

export class HeartbeatAction extends Action {
  constructor(data: {
    id: string;
    deviceFingerprint: string;
    propertyId: string;
    extraData?: Record<string, string>;
  }) {
    super(
      data.id,
      "heartbeat",
      data.extraData || {},
      data.deviceFingerprint,
      data.propertyId,
      new Date(Date.now() + 1000 * 10) // 10 seconds
    );
  }
}

export class ResetCheckInAction extends Action {
  constructor(data: {
    id: string;
    deviceFingerprint: string;
    propertyId: string;
  }) {
    super(
      data.id,
      "reset-check-in",
      {},
      data.deviceFingerprint,
      data.propertyId,
      new Date(Date.now() + 1000 * 10)
    );
  }
}

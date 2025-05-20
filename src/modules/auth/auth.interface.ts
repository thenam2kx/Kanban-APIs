export interface DeviceInfo {
  userId: string;
  deviceType: string;
  os: string;
  ip: string;
  browser: string;
  lastLogin?: string;
}

export interface SessionInfo {
  userId?: string;
  deviceId: string;
  token: string;
  expireTime: Date;
  loginTime: Date;
  revoked: boolean;
}

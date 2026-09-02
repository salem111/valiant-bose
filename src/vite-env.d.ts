/// <reference types="vite/client" />

declare module 'agora-token' {
  export const RtcRole: {
    PUBLISHER: number;
    SUBSCRIBER: number;
  };
  export const RtcTokenBuilder: {
    buildTokenWithUid(
      appId: string,
      appCertificate: string,
      channelName: string,
      uid: number,
      role: number,
      privilegeExpiredTs: number,
      serviceExpiredTs?: number
    ): string;
    buildTokenWithUserAccount(
      appId: string,
      appCertificate: string,
      channelName: string,
      account: string,
      role: number,
      privilegeExpiredTs: number,
      serviceExpiredTs?: number
    ): string;
  };
}

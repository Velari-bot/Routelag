declare module 'ping';

declare global {
    interface Window {
      electron: {
        minimizeWindow: () => Promise<void>;
        pingVpsServers: () => Promise<{ id: string; ip: string; ping: number }[]>;
      };
    }
  }
  export {};
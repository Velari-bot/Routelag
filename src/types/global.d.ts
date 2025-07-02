export {};

declare global {
  interface Window {
    electron: {
      pingHost: (host: string) => Promise<{
        host: string;
        time: number;
        success: boolean;
      }>;
      optimizeRoute: (serverId: string) => Promise<{
        success: boolean;
        output?: string;
        error?: string;
      }>;
      toggleLowLatencyMode: (enabled: boolean) => Promise<{
        success: boolean;
        output?: string;
        error?: string;
      }>;
      minimizeWindow: () => Promise<void>;
      pingVpsServers: () => Promise<{ id: string; ip: string; region: string; location?: string; name?: string; ping: number; }[]>;
    };
  }
}

declare module 'ping'; 
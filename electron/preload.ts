const { contextBridge, ipcRenderer } = require('electron');

/**
 * @typedef {{ ip: string, [key: string]: any }} Vps
 */

contextBridge.exposeInMainWorld('electron', {
  /**
   * @param {Array<{ip: string, [key: string]: any}>} vpsList
   * @returns {Promise<Array<{ip: string, [key: string]: any, ping: number}>>}
   */
  pingVpsServers: async () => {
    return await ipcRenderer.invoke('ping-vps-list');
  }
}); 
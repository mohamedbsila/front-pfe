const { contextBridge } = require('electron');
const os = require('os');

// Expose safe APIs to the renderer via contextBridge
contextBridge.exposeInMainWorld('electronAPI', {
    getMachineMetadata: () => ({
        device: os.hostname() || 'Desktop',
        os: `${os.platform()} ${os.release()}`,
        arch: os.arch()
    })
});

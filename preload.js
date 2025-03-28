console.log('hii from preloaddd');

const { contextBridge, ipcRenderer } = require('electron');
const io = require('socket.io-client');
//const { jsPDF } = require('jspdf');
//require('jspdf-autotable');
//const crypto = require('crypto');

// Generate a random nonce for CSP
//function generateNonce() {
  //  return crypto.randomBytes(16).toString("base64");
//}

//const nonce = generateNonce();

// Initialize socket connection
const socket = io('http://192.168.40.38:3050');

// Expose safe functions to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    send: (event, message, message2) => ipcRenderer.send(event, message, message2),
    on: (event, callback) => ipcRenderer.on(event, (_event, data) => callback(data)),
    once: (event, callback) => ipcRenderer.once(event, (_event, data) => callback(data)),
    // WebSocket methods
    sockOn: (event, callback) => socket.on(event, callback),
    sockOnce: (event, callback) => socket.once(event, callback),
    sockOff: (event) => socket.off(event),
    removeAllSockListeners: (event) => socket.removeAllListeners(event), // <-- Add this
    listeners: (event) => socket.listeners(event), // <-- Added this
    emit: (event, data) => socket.emit(event, data),
    disconnect: () => socket.disconnect(),
    connect: () => socket.connect(),

    // PDF Functions
   // jsPDF: jsPDF,
  //  jsPDFAutoTable: jsPDF.autoTable,

    // Expose the nonce
   // cspNonce: nonce
});

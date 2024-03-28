const { contextBridge, ipcRenderer } = require('electron');

const leveldb = require('./server/leveldbModule');
const serviceBusModule = require('./server/serviceBusModule')

contextBridge.exposeInMainWorld("leveldb", leveldb);
contextBridge.exposeInMainWorld("servicebus", serviceBusModule);
contextBridge.exposeInMainWorld("ipcApi", {
    initDownload: topicData => ipcRenderer.send('init-download', topicData),
    handleProgress: callback => ipcRenderer.on('progress-download', callback),

    openDialog: () => ipcRenderer.send("open-dialog"),
    openDialogReply: callback => ipcRenderer.on('open-dialog-reply', callback),

    massiveSendDialog: topicData => ipcRenderer.send("massive-send-dialog", topicData),
    massiveSendDialogReply: callback => ipcRenderer.on('massive-send-dialog-reply', callback)
});

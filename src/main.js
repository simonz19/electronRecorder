const { app, BrowserWindow, ipcMain } = require("electron");
const qs = require("qs");
if (require('electron-squirrel-startup')) return;
const squirrelEvent = process.argv[1];
if(squirrelEvent === '--squirrel-firstrun'){
  return;
}

const argv = process.argv;
let params;

let mainWindow;
let pickerDialog;

/** only main process can access node run time */
const parseArgv = () => {
  const searchReg = /.+:\/\/([^\/]+)\/?/.exec(argv[1]);
  const search = searchReg && searchReg[1];
  if (search) {
    params = qs.parse(search);
  }
};

parseArgv();

const getMainWindow = () => {
  if (!mainWindow) {
    mainWindow = new BrowserWindow({
      height: 630,
      width: 900
    });
  }
  mainWindow.loadURL("file://" + __dirname + "/index.html");
  mainWindow.webContents.openDevTools();
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.send("get-process-args", { argv, params });
    if (params && params.type === "screen") {
      openPickerDialog(null, {
        types: ["screen"]
      });
    }
  });
  return mainWindow;
};

const getPickerDialog = () => {
  if (!pickerDialog) {
    pickerDialog = new BrowserWindow({
      parent: mainWindow,
      skipTaskbar: true,
      modal: true,
      show: false,
      height: 390,
      width: 680
    });
  }
  pickerDialog.loadURL("file://" + __dirname + "/picker.html");
  pickerDialog.webContents.openDevTools();
  pickerDialog.on("closed", () => {
    pickerDialog = null;
  });
  return pickerDialog;
};

const openPickerDialog = (event, options) => {
  getPickerDialog();
  pickerDialog.webContents.on("did-finish-load", () => {
    pickerDialog.webContents.send("get-sources", options);
  });
  pickerDialog.show();
};

app.on("ready", () => {
  getMainWindow();
});

app.on("window-all-closed", () => app.quit());

/** render process to main process emsg */
ipcMain.on("show-picker", openPickerDialog);

/** render process to main process emsg */
ipcMain.on("source-id-selected", (event, sourceId) => {
  pickerDialog.close();
  mainWindow.webContents.send("source-id-selected", sourceId);
});

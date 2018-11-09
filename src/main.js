const { app, BrowserWindow, ipcMain } = require("electron");

let mainWindow;
let pickerDialog;

const getMainWindow = () => {
  if (!mainWindow) {
    mainWindow = new BrowserWindow({
      height: 500,
      width: 600
    });
  }
  mainWindow.loadURL("file://" + __dirname + "/index.html");
  mainWindow.webContents.openDevTools();
  mainWindow.on("closed", () => {
    mainWindow = null;
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
  pickerDialog.webContents.openDevTools()
  pickerDialog.on("closed", () => {
    pickerDialog = null;
  });
  return pickerDialog;
};

app.on("ready", () => {
  getMainWindow();
});

ipcMain.on("show-picker", (event, options) => {
  getPickerDialog();
  pickerDialog.show();
  setTimeout(() => {
    pickerDialog.webContents.send("get-sources", options);
  }, 1000);
});

ipcMain.on("source-id-selected", (event, sourceId) => {
  pickerDialog.close();
  mainWindow.webContents.send("source-id-selected", sourceId);
});

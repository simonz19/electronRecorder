var electronInstaller = require("electron-winstaller");
const path = require("path");

electronInstaller
  .createWindowsInstaller({
    appDirectory: path.resolve(__dirname, "app-win32-x64"),
    outputDirectory: path.resolve(__dirname, "dist"),
    authors: "My App Inc.",
    exe: "app.exe"
  })
  .then(
    () => console.log("It worked!"),
    e => console.log(`No dice: ${e.message}`)
  );

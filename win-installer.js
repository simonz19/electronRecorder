var electronInstaller = require("electron-winstaller");
const path = require("path");
const config = require('./config');

electronInstaller
  .createWindowsInstaller({
    appDirectory: path.resolve(__dirname, `${config.packageDir}/${process.env.npm_package_name}-win32-x64`),
    outputDirectory: path.resolve(__dirname, config.installerDir),
    authors: "simonz",
    exe: `${process.env.npm_package_name}.exe`,
    noMsi: true,
  })
  .then(
    () => console.log("It worked!"),
    e => console.log(`No dice: ${e.message}`)
  );

const electronInstaller = require("electron-winstaller");
const fs = require("fs");
const os = require("os");
const path = require("path");
const config = require("./package.json");
const argv = process.argv;
const args = {
  platform: os.platform(),
  arch: os.arch(),
  ...require("minimist")(argv.slice(2))
};

const opts = {
  appDirectory: path.resolve(
    __dirname,
    `${config._packageDir}/${config.name}-${args.platform}-${args.arch}`
  ),
  outputDirectory: path.resolve(
    __dirname,
    `${config._winInstallerDir}/${config.name}-${args.platform}-${args.arch}`
  ),
  authors: "zxy",
  exe: `${config.name}.exe`,
  noMsi: true
};

require("./utils").deleteFileOrDirSync(opts.outputDirectory);

if (!fs.existsSync(opts.appDirectory)) {
  console.error("no package availabel to build a installer");
  process.exit(1);
  return;
}

electronInstaller
  .createWindowsInstaller(opts)
  .then(
    () => console.log("It worked!"),
    e => console.log(`No dice: ${e.message}`)
  );

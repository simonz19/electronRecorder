const fs = require("fs");
const os = require("os");
const path = require("path");
const packager = require("electron-packager");
const argv = process.argv;
const config = require("./package.json");
const args = {
  platform: os.platform(),
  arch: os.arch(),
  ...require("minimist")(argv.slice(2))
};

require("./utils").deleteFileOrDirSync(path.resolve(__dirname, config._releaseDir));

packager({
  dir: path.resolve(__dirname, "."),
  all: false,
  appVersion: config.version,
  name: config.name,
  overwrite: true,
  asar: true,
  out: path.resolve(__dirname, config._packageDir),
  platform: args.platform,
  arch: args.arch
})
  .then(appPaths => {
    console.log("success", appPaths);
  })
  .catch(error => {
    console.log("pacakge-error", error);
  });

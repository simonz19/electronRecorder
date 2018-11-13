const fs = require("fs");
const path = require("path");
const packager = require("electron-packager");
const argv = process.argv;
const params = argv.slice(2);
const config = require('./config');

// recursion delete file and folder
function deleteFolder(path) {
  var files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach(function(file, index) {
      var curPath = path + "/" + file;
      if (fs.statSync(curPath).isDirectory()) {
        // recurse
        deleteFolder(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}
deleteFolder(path.resolve(__dirname, config.releaserDir));

const all = params.indexOf("--all") !== -1;

packager({
  dir: path.resolve(__dirname, "."),
  all,
  appVersion: process.env.npm_package_version,
  name: process.env.npm_package_name,
  overwrite: true,
  asar: true,
  out: path.resolve(__dirname, config.packageDir),
  platform: 'win32',
  arch: "x64"
})
  .then(appPaths => {
    console.log("success", appPaths);
  })
  .catch(error => {
    console.log("pacakge-error", error);
  });

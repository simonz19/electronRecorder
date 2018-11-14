const zip = require("electron-installer-zip");
const path = require("path");
const os = require("os");
const config = require("./package.json");
const fs = require("fs");
const argv = process.argv;
const args = {
  platform: os.platform(),
  arch: os.arch(),
  ...require("minimist")(argv.slice(2))
};

var opts = {
  dir: path.resolve(
    __dirname,
    `${config._packageDir}/${config.name}-${args.platform}-${args.arch}`
  ),
  out: path.resolve(__dirname, `${config._zipDir}/${config.name}.zip`)
};

require("./utils").deleteFileOrDirSync(opts.out);

if (!fs.existsSync(opts.dir)) {
  console.error("no package availabel to be ziped");
  process.exit(1);
  return;
}

zip(opts, function(err, res) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log("Zip file written to: ", opts.out);
});

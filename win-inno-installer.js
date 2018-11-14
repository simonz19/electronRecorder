const path = require("path");
const fs = require("fs");
const os = require("os");
const config = require("./package.json");
const argv = process.argv;
const args = {
  platform: os.platform(),
  arch: os.arch(),
  ...require("minimist")(argv.slice(2))
};

const innoFileName = "inno-setup.iss";
const sourcePath = `${config._packageDir}/${config.name}-${args.platform}-${
  args.arch
}`;
const outputPath = `${config._winInnoInstallerDir}/${config.name}-${
  args.platform
}-${args.arch}`;

if (!fs.existsSync(sourcePath)) {
  console.error("no package availabel to build a installer");
  process.exit(1);
  return;
}

const generateInnoFile = () => {
  require("./utils").deleteFileOrDirSync(path.resolve(__dirname, innoFileName));
  let data = fs.readFileSync("./inno-setup-template.iss", "utf-8");
  data = data.replace("SourcePathPlaceHolder", sourcePath);
  data = data.replace("OutputPathPlaceHolder", outputPath);
  data = data.replace("MyAppVersionPlaceHolder", `${config.version}`);
  data = data.replace("MyAppNamePlaceHolder", `${config.name}`);
  fs.writeFileSync(`./${innoFileName}`, data);
};

require("./utils").deleteFileOrDirSync(outputPath);
generateInnoFile();

require("innosetup-compiler")(
  path.resolve(__dirname, innoFileName),
  {
    gui: false,
    verbose: false
    // signtoolname: 'signtool',
    // signtoolcommand: '"path/to/signtool.exe" sign /f "C:\\absolute\\path\\to\\mycertificate.pfx" /t http://timestamp.globalsign.com/scripts/timstamp.dll /p "MY_PASSWORD" $f'
  },
  function(resp) {
    if (!resp) {
      console.log("success! ,inno-installer has been there");
    } else {
      console.log(resp);
    }
  }
);

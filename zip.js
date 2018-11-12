var zip = require('electron-installer-zip');
const config = require('./config');

var opts = {
  dir: `${config.packageDir}/${process.env.npm_package_name}-win32-x64`,
  out: `${config.releaserDir}/${process.env.npm_package_name}.zip`
};

zip(opts, function(err, res) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log('Zip file written to: ', opts.out);
});
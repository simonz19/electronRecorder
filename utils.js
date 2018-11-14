const fs = require("fs");

const deleteFileOrDirSync = path => {
  var files = [];
  if (fs.existsSync(path)) {
    if (fs.statSync(path).isDirectory()) {
      files = fs.readdirSync(path);
      files.forEach(function(file, index) {
        var curPath = path + "/" + file;
        if (fs.statSync(curPath).isDirectory()) {
          // recurse
          deleteFileOrDirSync(curPath);
        } else {
          // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    } else {
      fs.unlinkSync(path);
    }
  }
};

module.exports = {
  deleteFileOrDirSync
};

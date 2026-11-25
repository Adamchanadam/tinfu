"use strict";var i=require("os"),e=require("path");function o(){let r=process.env.ZIWEI_DATA_DIR||e.join(i.homedir(),".ziwei-claude-plugin");return e.resolve(r)}module.exports={dataDir:o};

const { initProject } = require("./commands/init");
const { resetProject } = require("./commands/reset");
const { checkStatus } = require("./commands/status");

module.exports = {
  initProject,
  resetProject,
  checkStatus,
};

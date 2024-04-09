const { exec } = require("child_process");

// Function to run CMD code
function runCmd(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      if (stderr) {
        reject(stderr);
        return;
      }
      resolve(stdout);
    });
  });
}

function checkIfExists(array, item) {
  for (let i = 0; i < array.length; i++) {
    if (array[i] === item) {
      return true; // Item found, return true
    }
  }
  return false; // Item not found after looping through the entire array
}

module.exports = { runCmd, checkIfExists };

var jsonfile = require('jsonfile');

/*
 DRONE=true
 DRONE_REPO - repository name for the current build
 DRONE_BRANCH - branch name for the current build
 DRONE_COMMIT - git sha for the current build
 DRONE_DIR - working directory for the current build
 DRONE_BUILD_NUMBER - build number for the current build
 DRONE_PULL_REQUEST - pull request number fo the current build
 DRONE_JOB_NUMBER - job number for the current build
 DRONE_TAG - tag name for the current build
 */

var json = {
    "commit": process.env.DRONE_COMMIT,
    "branch": process.env.DRONE_BRANCH,
    "build": process.env.DRONE_BUILD_NUMBER,
    "job": process.env.DRONE_JOB_NUMBER,
    "tag": process.env.DRONE_TAG
};

jsonfile.writeFileSync("git.json", json);
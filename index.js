const core = require('@actions/core');
const github = require('@actions/github');

try {
  const time = (new Date()).toTimeString();
  core.setOutput("timeTo", (Math.random() * 1000000).toFixed(0));
  core.setOutput("time", (Math.random() * 1000000).toFixed(0));
  core.setOutput("release", (Math.random() * 1000000).toFixed(0));
  core.setOutput("releaseId", (Math.random() * 1000000).toFixed(0));

  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
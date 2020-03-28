const yaml = require('js-yaml');
const path = require('path');
const fs = require('fs').promises;
const nomadApi = require('./nomad-api');

module.exports = async (jobFile, templateFile) => {
  const jobVars = yaml.safeLoad(await fs.readFile(jobFile));
  const { render, mergePrevious } = require(templateFile);

  const job = render(jobVars);
  if (!mergePrevious) return job;
  else return mergePrevious(job, await nomadApi.getRunningJobInformation(job.ID));
}

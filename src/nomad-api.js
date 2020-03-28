const request = require('request-promise-native');
const drawDiff = require('./draw-diff');

const fetchNomad = async (path, method, json) => {
  if (!process.env.NOMAD_ADDR) throw new Error('NOMAD_ADDR is not set.');
  try {
    return await request({
      url: `${process.env.NOMAD_ADDR}/v1/${path}`,
      method: method || 'GET',
      json
    });
  } catch (ex) {
    if (ex.statusCode) throw ex;
    else throw new Error(`Nomad is not available.`);
  }
}

module.exports.runJob = async (job, jobModifyIndex = null) => {
  try {
    return await fetchNomad(`job/${job.ID}`, 'POST', {
      Job: job,
      EnforceIndex: jobModifyIndex !== null,
      JobModifyIndex: jobModifyIndex,
    });
  } catch (ex) {
    throw new Error(ex.message);
  }
}

module.exports.planJob = async(job, short = false) => {
  try {
    const result = (await fetchNomad(`job/${job.ID}/plan`, 'POST', { Diff: true, Job: job }));
    const diff = drawDiff(result.Diff, 'Job') || 'No changes';
    const jobModifyText = `Job Modify Index: ${result.JobModifyIndex}`
      +`\nTo submit the job with version verification run:`
      +`\n\nvagabond run --check-index ${result.JobModifyIndex} ${job.ID}.yml`
      +`\n\nWhen running the job with the check-index flag, the job will only be run if the server side version matches`
      +` the job modify index returned. If the index has changed, another user has modified the job and the plan's`
      +` results are potentially invalid.`;

    if (short) return diff;
    else return `${diff}\n\n${jobModifyText}`;
  } catch (ex) {
    throw new Error(ex.message);
  }
}

module.exports.getRunningJobInformation = async (jobName) => {
  try {
    return JSON.parse(await fetchNomad(`job/${jobName}`));
  } catch (ex) {
    if (ex.statusCode === 404) return {};
    else throw ex;
  }
}

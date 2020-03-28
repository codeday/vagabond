const yargs = require('yargs');
const { render, run, plan } = require('./commands');

const withJob = (yargs) => yargs.positional('job', { describe: 'The YAML file describing the job to run.' });

const argv = yargs
  .command('render [job]', 'Renders a job to JSON for use with the nomad command', withJob, render)
  .command('plan [job]', 'Shows the changes which would be applied if a job was deployed', withJob, plan)
  .command('run [job]', 'Deploys a job', (yargs) => withJob(yargs) && yargs.option('check-index'), run)
  .option('template', { description: 'The JS function to run to process the template. Defaults to cwd/template.js'})
  .help().alias('help', 'h').alias('help', '?')
  .argv;

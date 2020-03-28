const yargs = require('yargs');
const {
  render,
  renderAll,
  run,
  runAll,
  plan,
  planAll,
} = require('./commands');

const withJob = (yargs) => yargs.positional('job', { describe: 'The YAML file describing the job to run.' });
const out = (fn) => async (argv) => console.log(await fn(argv));

const argv = yargs
  .command(
    'render [job]',
    'Renders a job to JSON for use with the nomad command',
    withJob,
    async (argv) => console.log(JSON.stringify(await render(argv), null, 2))
  )
  .command(
    'render-all',
    'Renders all job to JSON for use with the nomad command',
    () => {},
    async (argv) => console.log(JSON.stringify(await renderAll(argv), null, 2))
  )

  .command('plan [job]', 'Shows the changes which would be applied if a job was deployed', withJob, out(plan))
  .command('plan-all', 'Shows the changes which would be applied if all jobs were deployed', () => {}, out(planAll))

  .command('run [job]', 'Deploys a job', (yargs) => withJob(yargs) && yargs.option('check-index'), out(run))
  .command('run-all', 'Deploys all jobs', () => {}, out(runAll))

  .option('template', { description: 'The JS function to run to process the template. Defaults to cwd/template.js'})
  .help().alias('help', 'h').alias('help', '?')
  .argv;

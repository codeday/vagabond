const fs = require('fs').promises;
const path = require('path');
const nomadApi = require('./nomad-api');
const generate = require('./generate');

const argvGenerate = async (argv) => await generate(path.resolve(argv.job), path.resolve(argv.template || 'template.js'));
const withAll = async (argv, fn) => (await Promise.all((await fs.readdir(process.cwd()))
  .map(async (file) => {
    if (['.yaml', '.yml'].indexOf(path.extname(file)) === -1) return { file, result: null };

    try {
      return { file, result: await fn({...argv, job: path.join(process.cwd(), file)}) };
    } catch (ex) {
      return { file, result: ex.message };
    }
  })))
  .filter((out) => out.result);

const render = module.exports.render = async (argv) => await argvGenerate(argv);
const run = module.exports.run = async (argv) => await nomadApi.runJob(await argvGenerate(argv), argv.checkIndex);
const plan = module.exports.plan = async (argv) => await nomadApi.planJob(await argvGenerate(argv), true);

module.exports.renderAll = async (argv) => await withAll(argv, render);
module.exports.runAll = async (argv) => await withAll(argv, run);
module.exports.planAll = async (argv) => {
  const files = (await withAll(argv, plan))
  const changes = files.filter((file) => file.result !== 'No changes');

  return [ ...changes, { file: 'summary', result: `${files.length} processed, ${changes.length} changes `}]
    .map((file) => `${file.file}\n${'-'.repeat(file.file.length)}\n${file.result}`)
    .join("\n\n");
}

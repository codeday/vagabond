const nomadApi = require('./nomad-api');
const generate = require('./generate');
const { resolve } = require('path');

const argvGenerate = (argv) => generate(resolve(argv.job), resolve(argv.template || 'template.js'));

module.exports.render = async (argv) => console.log(JSON.stringify(await argvGenerate(argv)));
module.exports.run = async (argv) => await nomadApi.runJob(await argvGenerate(argv), argv.checkIndex);
module.exports.plan = async (argv) => console.log(await nomadApi.planJob(await argvGenerate(argv)));

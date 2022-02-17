import { glob } from 'glob';
import { hideBin } from 'yargs/helpers';

import yargs from 'yargs';

const argv = yargs(hideBin(process.argv)).argv;
const numberOfChunks = argv.chunks as number;
const matrix = argv.matrix as number;

glob('./cypress/integration/**/*.spec.ts', {}, (_er, files) => {
  const res = [];
  const chunkLength = files.length / numberOfChunks;
  while (files.length > 0) {
    const chunk = files.splice(0, chunkLength);
    res.push(chunk);
  }

  console.log(res[matrix - 1].join(','));
});

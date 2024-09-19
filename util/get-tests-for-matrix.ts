import { glob } from 'glob';
import { hideBin } from 'yargs/helpers';

import yargs from 'yargs';

const argv = yargs(hideBin(process.argv)).argv as {
  chunks?: number;
  matrix?: number;
};

if (typeof argv.chunks !== 'number' || typeof argv.matrix !== 'number') {
  throw new Error(
    'Both chunks and matrix arguments must be provided and must be numbers.',
  );
}

const numberOfChunks = argv.chunks;
const matrix = argv.matrix;

glob('./cypress/e2e/**/*.cy.ts', {}, (_er, files) => {
  const res: string[][] = [];

  for (
    let remainingChunks = numberOfChunks;
    remainingChunks > 0;
    remainingChunks--
  ) {
    const chunkLength = Math.round(files.length / remainingChunks);
    const chunk = files.splice(0, chunkLength);
    res.push(chunk);
  }

  console.log(res[matrix - 1].join(','));
});

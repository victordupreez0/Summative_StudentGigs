import fs from 'fs/promises';
import path from 'path';
import postcss from 'postcss';
import tailwind from 'tailwindcss';

async function build() {
  const inFile = path.resolve('./src/index.css');
  const outFile = path.resolve('./src/tailwind.output.css');
  const css = await fs.readFile(inFile, 'utf8');
  const result = await postcss([tailwind('./tailwind.config.cjs')]).process(css, { from: inFile });
  await fs.writeFile(outFile, result.css, 'utf8');
  console.log('Wrote', outFile);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});

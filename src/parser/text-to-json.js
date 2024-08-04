const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');

const dirPath = path.join(process.cwd(), '/book/txt');
const dirs = fs.readdirSync(dirPath);

// 标点符号unicode字符序列，包含部分全角
const sequence = '[\x21-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E\u2010-\u201F]';
const punctuationRegex = new RegExp(`^${sequence}|${sequence}$`, 'g');

const createFile = (filename, map) => {
  const name = path.parse(filename).name;
  const jsonFilePath = path.join(process.cwd(), `/book/json/${name}.json`);
  fs.writeFileSync(jsonFilePath, JSON.stringify(map));
};

const parseText = (data, wordsMap) => {
  const roughWords = data.split(' ');

  roughWords.forEach((word) => {
    word = word.replace(punctuationRegex, '').toLowerCase();

    let times = wordsMap[word];

    if (!times) {
      wordsMap[word] = 1;
      return;
    }

    wordsMap[word] = ++times;
  });

  return wordsMap;
};

const readText = async (filename) => {
  const wordsMap = {};
  const readStream = fs.createReadStream(`${dirPath}/${filename}`, {});
  const rl = readline.createInterface({ input: readStream });

  rl.on('line', (input) => {
    if (input.trim() == '') {
      return;
    }
    console.log(`Received: ${input}`);

    parseText(input, wordsMap);
  });

  return new Promise((resolve) => {
    rl.on('close', () => {
      createFile(filename, wordsMap);
      resolve();
    });
  });
};

dirs.reduce(async (result, current) => {
  await readText(current);
}, undefined);

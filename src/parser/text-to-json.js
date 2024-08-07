const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');

const dirPath = path.join(process.cwd(), '/book/txt');
const dirs = ['5.txt']; //fs.readdirSync(dirPath);

// 标点符号unicode字符序列，包含部分全角
const sequence = '[\x21-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E\u2010-\u201F]';
const punctuationRegex = new RegExp(`^${sequence}|${sequence}+$`, 'g');

const wordRegex = /^[a-zA-Z\-]+$/;
// —, EM DASH, U+2014
const sentenceSeparator = /—/;

const createFile = (filename, map) => {
  const name = path.parse(filename).name;
  const jsonFilePath = path.join(process.cwd(), `/book/json/${name}.json`);
  fs.writeFileSync(jsonFilePath, JSON.stringify(map));
};

const parseWord = (word, wordsMap) => {
  let times = wordsMap[word];

  if (!wordRegex.test(word)) {
    return;
  }

  if (!times) {
    wordsMap[word] = 1;
    return;
  }

  wordsMap[word] = ++times;
};

const parseText = (data, wordsMap) => {
  const roughWords = data.split(' ');
  const newRoughWords = [];

  roughWords.forEach((word) => {
    word = word.replace(punctuationRegex, '').toLowerCase();

    const newWords = word.split(sentenceSeparator);

    if (newWords.length > 1) {
      newRoughWords.push(...newWords);
      return;
    }

    parseWord(word, wordsMap);
  });

  newRoughWords.forEach((word) => {
    parseWord(word, wordsMap);
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

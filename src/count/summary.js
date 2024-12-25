const path = require('path');
const fs = require('fs');

const chapterJsonFilesPath = `${process.cwd()}/book/json`;
const files = fs.readdirSync(chapterJsonFilesPath);
console.log(files);

const bookWords = {};

for (const file of files) {
  const jsonStr = fs.readFileSync(`${chapterJsonFilesPath}/${file}`);
  const wordsObj = JSON.parse(jsonStr);

  for (const word in wordsObj) {
    bookWords[word] = bookWords[word]
      ? bookWords[word] + wordsObj[word]
      : wordsObj[word];
  }
}

const bookWordList = [];
for (const key in bookWords) {
  bookWordList.push({ word: key, count: bookWords[key] });
}

bookWordList.sort((word1, word2) => word2.count - word1.count);

const summary = {
  count: bookWordList.length,
  list: bookWordList,
};

fs.writeFileSync(`${process.cwd()}/book/summary.json`, JSON.stringify(summary));

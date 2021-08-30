const fs = require('fs');
const path = require('path');
const xmlJs = require('xml-js');
const { Parser } = require('json2csv');

const xmlDir = '../../0pdd.scrambled/';
const csvOpts = { fields: [
    { label: 'ID', value: 'id', default: '' },
    { label: 'Body', value: 'body', default: '' },
    { label: 'File', value: 'file', default: '' },
    { label: 'Role', value: 'role', default: '' },
    { label: 'Time', value: 'time', default: '' },
    { label: 'Email', value: 'email', default: '' },
    { label: 'Puzzle Lines', value: 'lines', default: '' },
    { label: 'Owner', value: 'owner', default: '' },
    { label: 'Author', value: 'author', default: '' },
    { label: 'Issue No.', value: 'issueNo', default: '' },
    { label: 'Estimate', value: 'estimate', default: '' },
    { label: 'Parent ID', value: 'parentId', default: '' },
    { label: 'Ticket No.', value: 'ticketNo', default: '' },
    { label: 'Issue Link', value: 'issueLink', default: '' },
    { label: 'Issue Closed On', value: 'issueClosed', default: '' },
]};

function transformData(puzzles, owner, parentId = '') {
    let children = [];
    const formattedPuzzles = (Array.isArray(puzzles) ? puzzles : [puzzles])
    .filter(v => !!v)
    .map((puzzle) => {
        const {
            issue: { _text: issueNo, _attributes: { href: issueLink, closed: issueClosed } = {} } = {},
            ticket: { _text: ticketNo },
            estimate: { _text: estimate },
            id: { _text: id },
            body: { _text: body },
            file: { _text: file },
            author: { _text: author },
            email: { _text: email },
            time: { _text: time },
            role: { _text: role },
            lines: { _text: lines },
            children: { puzzle: childPuzzle },
            parentId,
        } = puzzle;

        if (childPuzzle) {
            children = [...children, ...transformData(childPuzzle, owner, id)];
        }

        return {
            id,
            body,
            file,
            role,
            time,
            email,
            lines,
            owner,
            author,
            issueNo,
            estimate,
            parentId,
            ticketNo,
            issueLink,
            issueClosed
        };
    });

    return [...formattedPuzzles, ...children];
}

function convertToCsv(dataDir, cache) {
  const files = fs.readdirSync(dataDir);
  files.forEach(filename => {
    const filepath = path.join(dataDir, filename);
    const stat = fs.lstatSync(filepath);

    if (stat.isDirectory()) {
      convertToCsv(filepath, cache);
    } else if (stat.isFile() && filename.endsWith('.xml')) {
      const owner = path.dirname(filepath).split(path.sep).pop();
      const filepathNoExt = filepath.split('.').slice(0, -1).join('.');

      const xml = fs.readFileSync(filepath);
      const json = xmlJs.xml2json(xml, {compact: true, spaces: 2});
      const formattedJson = transformData(JSON.parse(json).puzzles.puzzle, owner);
      cache.json = [...cache.json, ...formattedJson];
      const csv = new Parser(csvOpts).parse(formattedJson);

      fs.writeFileSync(filepathNoExt + '.json', JSON.stringify(formattedJson, null, 2), 'utf8');
      fs.writeFileSync(filepathNoExt + '.csv', csv, 'utf8');
    }
  });
}

function main() {
  const cache = { json: [] };
  convertToCsv(xmlDir, cache);

  const allCsvData = new Parser(csvOpts).parse(cache.json);
  fs.writeFileSync(path.join(xmlDir, 'all-puzzles.json'), JSON.stringify(cache.json, null, 2), 'utf8');
  fs.writeFileSync(path.join(xmlDir, 'all-puzzles.csv'), allCsvData, 'utf8');
}

main();
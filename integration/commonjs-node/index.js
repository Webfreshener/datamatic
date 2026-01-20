const { Pipeline } = require('datamatic');

const accent = (text) => `\x1b[38;5;82m${text}\x1b[0m`;
const dim = (text) => `\x1b[2m${text}\x1b[0m`;

const pipeline = new Pipeline({
  type: 'array',
  items: {
    type: 'string'
  }
});

console.log('');
console.log(accent('Datamatic CommonJS Integration'));
console.log(dim('='.repeat(32)));

pipeline.subscribe({
  next: (data) => {
    console.log(accent('Pipeline output:'), data);
  },
  error: (error) => {
    console.error(accent('Pipeline error:'), error);
  }
});

pipeline.write(['alpha', 'beta', 'gamma']);

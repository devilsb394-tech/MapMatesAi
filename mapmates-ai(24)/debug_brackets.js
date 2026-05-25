
import fs from 'fs';
const content = fs.readFileSync('/src/components/AdminAnalytics.tsx', 'utf8');
let stack = [];
let line = 1;
let col = 1;
for (let i = 0; i < content.length; i++) {
  const char = content[i];
  if (char === '\n') { line++; col = 1; continue; }
  if (char === '(' || char === '{' || char === '[') {
    stack.push({ char, line, col });
  } else if (char === ')' || char === '}' || char === ']') {
    const last = stack.pop();
    if (!last) {
      console.log(`Unmatched closing ${char} at ${line}:${col}`);
    } else if (
      (char === ')' && last.char !== '(') ||
      (char === '}' && last.char !== '{') ||
      (char === ']' && last.char !== '[')
    ) {
      console.log(`Mismatch: ${last.char} at ${last.line}:${last.col} closed by ${char} at ${line}:${col}`);
    }
  }
  col++;
}
while (stack.length > 0) {
  const left = stack.pop();
  console.log(`Unclosed ${left.char} at ${left.line}:${left.col}`);
}

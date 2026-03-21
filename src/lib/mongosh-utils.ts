export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function looksLikeMongoshPrompt(text: string): boolean {
  if (!text) return false;
  const tail = text.trimEnd();
  return (
    /\[[^\]]+\]\s+\S+>\s*$/.test(tail) ||
    /\b\w+>\s*$/.test(tail)
  );
}

export function isSafeMongoshDbName(value: string): boolean {
  return /^[A-Za-z0-9._-]+$/.test(value);
}

export function splitMongoshStatements(code: string): string[] {
  const source = code.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!source) return [];
  const parts: string[] = [];
  let start = 0;
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let inLineComment = false;
  let inBlockComment = false;
  let escape = false;
  let depthParen = 0;
  let depthBrace = 0;
  let depthBracket = 0;

  for (let i = 0; i < source.length; i += 1) {
    const c = source[i];
    const n = i + 1 < source.length ? source[i + 1] : '';

    if (inLineComment) {
      if (c === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (c === '*' && n === '/') {
        inBlockComment = false;
        i += 1;
      }
      continue;
    }
    if (inSingle || inDouble || inTemplate) {
      if (escape) {
        escape = false;
        continue;
      }
      if (c === '\\') {
        escape = true;
        continue;
      }
      if (inSingle && c === "'") inSingle = false;
      else if (inDouble && c === '"') inDouble = false;
      else if (inTemplate && c === '`') inTemplate = false;
      continue;
    }

    if (c === '/' && n === '/') {
      inLineComment = true;
      i += 1;
      continue;
    }
    if (c === '/' && n === '*') {
      inBlockComment = true;
      i += 1;
      continue;
    }
    if (c === "'") {
      inSingle = true;
      continue;
    }
    if (c === '"') {
      inDouble = true;
      continue;
    }
    if (c === '`') {
      inTemplate = true;
      continue;
    }
    if (c === '(') depthParen += 1;
    else if (c === ')') depthParen = Math.max(0, depthParen - 1);
    else if (c === '{') depthBrace += 1;
    else if (c === '}') depthBrace = Math.max(0, depthBrace - 1);
    else if (c === '[') depthBracket += 1;
    else if (c === ']') depthBracket = Math.max(0, depthBracket - 1);

    if (c === ';' && depthParen === 0 && depthBrace === 0 && depthBracket === 0) {
      const statement = source.slice(start, i + 1).trim();
      if (statement) parts.push(statement);
      start = i + 1;
    }
  }

  const rest = source.slice(start).trim();
  if (rest) parts.push(rest);
  return parts;
}

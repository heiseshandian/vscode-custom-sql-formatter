import { EOL } from "os";

export enum ParsedLineType {
  singleSql,
  startOfSql,
  middleOfSql,
  endOfSql,

  singleComment,
  startOfComment,
  middleOfComment,
  endOfComment,

  other,
}

interface ParsedLine {
  type: ParsedLineType;
  line: string;
}

export const parse = cache<ParsedLine[]>(innerParse);

function cache<T>(fn: Function) {
  const cacheMap: Record<string, any> = {};

  return (param: string): T => {
    return cacheMap[param] || (cacheMap[param] = fn(param));
  };
}

function innerParse(txt: string): ParsedLine[] {
  const lines = txt.split(EOL);

  let isInMiddleOfSql = false;
  let isInMiddleOfComment = false;

  return lines.map((line) => {
    if (isStartOfSql(line) && isEndOfSql(line)) {
      return {
        type: ParsedLineType.singleSql,
        line,
      };
    }

    if (isStartOfSql(line)) {
      isInMiddleOfSql = true;

      return {
        type: ParsedLineType.startOfSql,
        line,
      };
    }
    if (isEndOfSql(line)) {
      isInMiddleOfSql = false;

      return {
        type: ParsedLineType.endOfSql,
        line,
      };
    }
    if (isInMiddleOfSql) {
      return {
        type: ParsedLineType.middleOfSql,
        line,
      };
    }

    if (isSingleLineComment(line)) {
      return {
        type: ParsedLineType.singleComment,
        line,
      };
    }

    if (isStartOfMultiLineComment(line)) {
      isInMiddleOfComment = true;

      return {
        type: ParsedLineType.startOfComment,
        line,
      };
    }
    if (isEndOfMultiLineComment(line)) {
      isInMiddleOfComment = false;

      return {
        type: ParsedLineType.endOfComment,
        line,
      };
    }
    if (isInMiddleOfComment) {
      return {
        type: ParsedLineType.middleOfComment,
        line,
      };
    }

    return {
      type: ParsedLineType.other,
      line,
    };
  });
}

function isStartOfMultiLineComment(line = "") {
  const lineWithoutBlank = line.replace(/\s/g, "");
  return /^\/\*[\s\S]*?/.test(lineWithoutBlank);
}

function isEndOfMultiLineComment(line = "") {
  const lineWithoutBlank = line.replace(/\s/g, "");
  return /[\s\S]*?\*\/$/.test(line);
}

function isSingleLineComment(line = "") {
  const lineWithoutBlank = line.replace(/\s/g, "");

  return (
    /^--.*/.test(lineWithoutBlank) || /^\/\*[\s\S]*?\*\//.test(lineWithoutBlank)
  );
}

function isEndOfSql(line = "") {
  const lineWithoutComment = removeComment(line);
  return lineWithoutComment.endsWith(";");
}

function removeComment(line = "") {
  return line.replace(/--.*/, "").replace(/\/\*[\s\S]*?\*\//g, "");
}

function isStartOfSql(line = "") {
  const reservedTopLevelWords = [
    // "ADD",
    // "AFTER",
    "ALTER COLUMN",
    "ALTER TABLE",
    "DELETE FROM",
    // "EXCEPT",
    // "FETCH FIRST",
    // "FROM",
    // "GROUP BY",
    // "GO",
    // "HAVING",
    "INSERT INTO",
    "INSERT",
    // "LIMIT",
    "MODIFY",
    // "ORDER BY",
    "SELECT",
    "SET CURRENT SCHEMA",
    "SET SCHEMA",
    "SET",
    "UPDATE",
    // "VALUES",
    // "WHERE",
  ];

  const firstWord = line.split(/\s+/)[0].toUpperCase();
  return reservedTopLevelWords.includes(firstWord);
}

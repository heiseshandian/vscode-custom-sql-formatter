import { EOL } from "os";

export function handleMaxLineLength(txt: string, maxLineLength: number) {
  const lines = txt.split(EOL);

  const finalLines: string[] = [];

  let isInMiddleOfSql = false;
  let tmpSqls: string[] = [];
  let isInMiddleOfComment = false;

  const convertTmpSqls = (sqls: string[]) => {
    const sql = sqls.join(" ").replace(/\s+/g, " ");
    if (sql.length <= maxLineLength) {
      return [sql];
    }

    return sqls;
  };

  lines.forEach((line, i) => {
    if (isStartOfSql(line)) {
      tmpSqls = [];
      isInMiddleOfSql = true;
    }
    if (isInMiddleOfSql) {
      tmpSqls.push(line);
    }
    if (isEndOfSql(line)) {
      isInMiddleOfSql = false;
      const sqls = convertTmpSqls(tmpSqls);
      finalLines.push(...sqls);
      return;
    }
    if (isInMiddleOfSql) {
      return;
    }

    if (isSingleLineComment(line)) {
      finalLines.push(line);
      return;
    }

    if (isStartOfMultiLineComment(line)) {
      isInMiddleOfComment = true;
    }
    if (isInMiddleOfComment) {
      finalLines.push(line);
    }
    if (isEndOfMultiLineComment(line)) {
      isInMiddleOfComment = false;
      return;
    }
    if (isInMiddleOfComment) {
      return;
    }

    finalLines.push(line);
  });

  if (tmpSqls.length > 0) {
    const sqls = convertTmpSqls(tmpSqls);
    finalLines.push(...sqls);
  }

  return finalLines.join(EOL);
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

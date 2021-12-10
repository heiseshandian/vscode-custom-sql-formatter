import { EOL } from "os";
import { parse, ParsedLineType } from "./parser";

export function handleRemoveDoubleQuotes(
  txt: string,
  removeDoubleQuotes: boolean
) {
  if (!removeDoubleQuotes) {
    return txt;
  }

  const lines = parse(txt);

  const finalLines = lines.map(({ type, line }) => {
    if (
      type === ParsedLineType.singleSql ||
      type === ParsedLineType.startOfSql ||
      type === ParsedLineType.middleOfSql ||
      type === ParsedLineType.endOfSql
    ) {
      const firstIndexOfComment = findFirstIndexOfComment(line);

      if (firstIndexOfComment === -1) {
        return line.replace(/"/g, "");
      }

      const comment = line.substring(firstIndexOfComment);
      return line
        .substring(0, firstIndexOfComment)
        .replace(/"/g, "")
        .concat(comment);
    }
    return line;
  });

  return finalLines.join(EOL);
}

const singleLineCommentToken = "--";
const multiLineCommentToken = "/*";
const commentTokenLen = singleLineCommentToken.length;

function findFirstIndexOfComment(line: string) {
  for (let i = 0, len = line.length; i < len - commentTokenLen; i++) {
    const word = line.substring(i, i + commentTokenLen);
    if (word === singleLineCommentToken || word === multiLineCommentToken) {
      return i;
    }
  }

  return -1;
}

export function handleMaxLineLength(txt: string, maxLineLength: number) {
  const lines = parse(txt);
  const finalLines: string[] = [];

  const convertTmpSqls = (sqls: string[]) => {
    const sql = sqls.join(" ").replace(/\s+/g, " ");
    if (sql.length <= maxLineLength) {
      return [sql];
    }

    return sqls;
  };

  let tmpSqls: string[] = [];
  lines.forEach(({ type, line }) => {
    if (type === ParsedLineType.startOfSql) {
      tmpSqls = [line];
      return;
    }
    if (type === ParsedLineType.middleOfSql) {
      tmpSqls.push(line);
      return;
    }
    if (type === ParsedLineType.endOfSql) {
      tmpSqls.push(line);
      const sqls = convertTmpSqls(tmpSqls);
      finalLines.push(...sqls);
      tmpSqls = [];
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

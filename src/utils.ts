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
      // For simplification, we ignore the case of writing multi-line comment syntax on one line.
      // Such as /* this is comment */;
      const firstIndexOfComment = line.indexOf("--");

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

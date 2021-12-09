import { handleMaxLineLength, handleRemoveDoubleQuotes } from "../utils";
import { readFileSync } from "fs";
import { resolve } from "path";
import { EOL } from "os";

describe("extension", () => {
  test("handleMaxLineLength", () => {
    const readOptions: { encoding: "utf-8" } = {
      encoding: "utf-8",
    };

    [1, 2].forEach((i) => {
      const originalSqlPath = resolve(
        __dirname,
        `./utils.original${i}.testdata.sql`
      );
      const expectedSqlPath = resolve(
        __dirname,
        `./utils.expected${i}.testdata.sql`
      );
      const originalSql = readFileSync(originalSqlPath, readOptions);
      const expectedSql = readFileSync(expectedSqlPath, readOptions);

      expect(handleMaxLineLength(originalSql, 80)).toEqual(expectedSql);
    });
  });

  test("handleRemoveDoubleQuotes", () => {
    const original = 'select "field",fieldA from table; --just a "comment"';
    const expected = 'select field,fieldA from table; --just a "comment"';

    expect(handleRemoveDoubleQuotes(original, true)).toEqual(expected);
  });
});

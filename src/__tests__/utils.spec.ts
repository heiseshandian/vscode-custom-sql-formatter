import { handleMaxLineLength } from "../utils";
import { readFileSync } from "fs";
import { resolve } from "path";

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
});

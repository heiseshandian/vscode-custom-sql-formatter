import { handleMaxLineLength } from "../utils";
import { readFileSync } from "fs";
import { resolve } from "path";

const originalSqlPath = resolve(__dirname, "./utils.original1.testdata.sql");
const expectedSqlPath = resolve(__dirname, "./utils.expected1.testdata.sql");

describe("extension", () => {
  test("handleMaxLineLength", () => {
    const readOptions: { encoding: "utf-8" } = {
      encoding: "utf-8",
    };
    const originalSql = readFileSync(originalSqlPath, readOptions);
    const expectedSql = readFileSync(expectedSqlPath, readOptions);

    expect(handleMaxLineLength(originalSql, 80)).toEqual(expectedSql);
  });
});

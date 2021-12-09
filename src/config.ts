import * as vscode from "vscode";
import { handleMaxLineLength, handleRemoveDoubleQuotes } from "./utils";

export function getConfig({ insertSpaces, tabSize }: vscode.FormattingOptions) {
  return {
    indent: insertSpaces ? " ".repeat(tabSize) : "\t",
    language: getSetting("dialect", "sql"),
    uppercase: getSetting("uppercase", false),
    linesBetweenQueries: getSetting("linesBetweenQueries", 2),

    maxLineLength: getSetting("maxLineLength", 80),
    removeDoubleQuotes: getSetting("removeDoubleQuotes", true),
  };
}

function getSetting(key: string, def: any) {
  const section = "custom-sql-formatter";

  const settings = vscode.workspace.getConfiguration(section, null);
  const editor = vscode.window.activeTextEditor;
  const language = editor && editor.document && editor.document.languageId;
  const languageSettings =
    language &&
    vscode.workspace
      .getConfiguration(undefined, null)
      .get<Record<string, any>>(`[${language}]`);

  let value = languageSettings && languageSettings[`${section}.${key}`];
  if (value === undefined) {
    value = settings.get(key, def);
  }
  return value === undefined ? def : value;
}

export function applyConfig(originalTxt: string, config: any) {
  const handlers: Array<{
    key: string;
    handler: (txt: string, val: any) => string;
  }> = [
    { key: "maxLineLength", handler: handleMaxLineLength },
    { key: "removeDoubleQuotes", handler: handleRemoveDoubleQuotes },
  ];

  return handlers.reduce(
    (previousTxt, { key, handler }) => handler(previousTxt, config[key]),
    originalTxt
  );
}

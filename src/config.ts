import * as vscode from "vscode";
import { handleMaxLineLength, handleRemoveDoubleQuotes } from "./utils";

export function getConfig({ insertSpaces, tabSize }: vscode.FormattingOptions) {
  return {
    indent: insertSpaces ? " ".repeat(tabSize) : "\t",
    language: getSetting("dialect"),
    uppercase: getSetting("uppercase"),
    linesBetweenQueries: getSetting("linesBetweenQueries"),

    maxLineLength: getSetting("maxLineLength"),
    removeDoubleQuotes: getSetting("removeDoubleQuotes"),
  };
}

function getSetting(key: string) {
  const section = "custom-sql-formatter";
  const setting = vscode.workspace.getConfiguration(section, null).get(key);
  const languageSetting = getLanguageSpecificSetting(section, key);

  return languageSetting !== undefined ? languageSetting : setting;
}

function getLanguageSpecificSetting(section: string, key: string) {
  const editor = vscode.window.activeTextEditor;
  const language = editor && editor.document && editor.document.languageId;
  const languageSettings =
    language &&
    vscode.workspace
      .getConfiguration(undefined, null)
      .get<Record<string, any>>(`[${language}]`);
  const value = languageSettings && languageSettings[`${section}.${key}`];

  return value;
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

import * as vscode from "vscode";
// @ts-expect-error There is no type defination for sql-formatter-plus, we'll just ignore it.
import { format } from "sql-formatter-plus";
import { handleMaxLineLength } from "./utils";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const disposable =
    vscode.languages.registerDocumentRangeFormattingEditProvider("sql", {
      provideDocumentRangeFormattingEdits(document, range, options) {
        const config = getConfig(options);
        const formated: string = format(document.getText(range), config);
        const handled = handleMaxLineLength(formated, config.maxLineLength);

        return [vscode.TextEdit.replace(range, handled)];
      },
    });

  context.subscriptions.push(disposable);
}

function getConfig({ insertSpaces, tabSize }: vscode.FormattingOptions) {
  return {
    indent: insertSpaces ? " ".repeat(tabSize) : "\t",
    language: getSetting("dialect", "sql"),
    uppercase: getSetting("uppercase", false),
    linesBetweenQueries: getSetting("linesBetweenQueries", 2),
    maxLineLength: getSetting("maxLineLength", 80),
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

import * as vscode from "vscode";
// @ts-expect-error There is no type defination for sql-formatter-plus, we'll just ignore it.
import { format } from "sql-formatter-plus";
import { applyConfig, getConfig } from "./config";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const disposable =
    vscode.languages.registerDocumentRangeFormattingEditProvider("sql", {
      provideDocumentRangeFormattingEdits(document, range, options) {
        const config = getConfig(options);
        const formated: string = format(document.getText(range), config);
        const final = applyConfig(formated, config);

        return [vscode.TextEdit.replace(range, final)];
      },
    });

  context.subscriptions.push(disposable);
}

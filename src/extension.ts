import * as vscode from "vscode";
import { Base, findNumberInLine, formatNumber, makeHoverText } from "./converter";

export function activate(context: vscode.ExtensionContext) {
    // подсказка при наведении мыши
    const hoverProvider = vscode.languages.registerHoverProvider(["cpp", "c"], {
        provideHover(document, position) {
            const lineText = document.lineAt(position.line).text;
            const found = findNumberInLine(lineText, position.character);

            if (found === null) {
                return undefined;
            }

            const markdown = new vscode.MarkdownString(makeHoverText(found.value));
            return new vscode.Hover(markdown);
        },
    });
    context.subscriptions.push(hoverProvider);

    // команды для горячих клавиш
    const commands: { id: string; base: Base }[] = [
        { id: "numberConverter.toHex", base: 16 },
        { id: "numberConverter.toDec", base: 10 },
        { id: "numberConverter.toOct", base: 8 },
        { id: "numberConverter.toBin", base: 2 },
    ];

    for (const cmd of commands) {
        const disposable = vscode.commands.registerCommand(cmd.id, () => {
            convertNumberAtCursor(cmd.base);
        });
        context.subscriptions.push(disposable);
    }
}

// заменяет число под курсором на число в нужной системе счисиления
function convertNumberAtCursor(targetBase: Base) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }

    const cursor = editor.selection.active; // позиция курсора
    const lineText = editor.document.lineAt(cursor.line).text;
    const found = findNumberInLine(lineText, cursor.character);

    if (found === null) {
        vscode.window.showInformationMessage("Под курсором нет числа");
        return;
    }

    if (found.base === targetBase) {
        return; // уже в нужной системе
    }

    // диапазон, который будем заменять
    const range = new vscode.Range(cursor.line, found.start, cursor.line, found.end);
    const newText = formatNumber(found.value, targetBase);

    editor.edit((editBuilder) => {
        editBuilder.replace(range, newText);
    });
}

export function deactivate() {}
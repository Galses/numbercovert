"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const converter_1 = require("./converter");
function activate(context) {
    // подсказка при наведении мыши
    const hoverProvider = vscode.languages.registerHoverProvider(["cpp", "c"], {
        provideHover(document, position) {
            const lineText = document.lineAt(position.line).text;
            const found = (0, converter_1.findNumberInLine)(lineText, position.character);
            if (found === null) {
                return undefined;
            }
            const markdown = new vscode.MarkdownString((0, converter_1.makeHoverText)(found.value));
            return new vscode.Hover(markdown);
        },
    });
    context.subscriptions.push(hoverProvider);
    // команды для горячих клавиш
    const commands = [
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
function convertNumberAtCursor(targetBase) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    const cursor = editor.selection.active; // позиция курсора
    const lineText = editor.document.lineAt(cursor.line).text;
    const found = (0, converter_1.findNumberInLine)(lineText, cursor.character);
    if (found === null) {
        vscode.window.showInformationMessage("Под курсором нет числа");
        return;
    }
    if (found.base === targetBase) {
        return; // уже в нужной системе
    }
    // диапазон, который будем заменять
    const range = new vscode.Range(cursor.line, found.start, cursor.line, found.end);
    const newText = (0, converter_1.formatNumber)(found.value, targetBase);
    editor.edit((editBuilder) => {
        editBuilder.replace(range, newText);
    });
}
function deactivate() { }
//# sourceMappingURL=extension.js.map
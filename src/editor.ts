import * as vscode from 'vscode'

export class ScrollerManager {
    disposables: vscode.Disposable[]

    constructor() {
        vscode.window.onDidChangeTextEditorVisibleRanges((ev) => {
            const editor = ev.textEditor
            const nextEditor = this.getNextActiveEditor(editor)
            if (!nextEditor) {
                return
            }
            const range = ev.visibleRanges[0]
            this.scrollNextEditor(nextEditor, range)
        })
    }

    scrollNextEditor(nextEditor: vscode.TextEditor, range: vscode.Range) {
        const endPos = new vscode.Position(range.end.line + 1, 0)
        nextEditor.revealRange(new vscode.Range(range.end, endPos), vscode.TextEditorRevealType.AtTop)
    }

    getNextActiveEditor(editor: vscode.TextEditor) {
        const column = editor.viewColumn
        if (column === undefined) {
            return
        }
        for (const ed of vscode.window.visibleTextEditors) {
            if (column + 1 === ed.viewColumn) {
                return ed
            }
        }
        return
    }

    continueOnRight() {
        const activeEditor = vscode.window.activeTextEditor
        if (!activeEditor) {
            return
        }
        const nextEditor = this.getNextActiveEditor(activeEditor)
        if (!nextEditor) {
            return
        }
        const range = activeEditor.visibleRanges[0]
        this.scrollNextEditor(nextEditor, range)
    }
}

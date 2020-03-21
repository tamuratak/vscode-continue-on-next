import * as vscode from 'vscode'

export class ScrollerManager {
    scrollEvent?: vscode.Disposable
    decorationMap: Map<vscode.TextEditor, vscode.TextEditorDecorationType> = new Map()
    overlap: number = 0

    start() {
        if (this.scrollEvent) {
            return
        }
        this.scrollEvent = vscode.window.onDidChangeTextEditorVisibleRanges((ev) => {
            const editor = ev.textEditor
            const nextEditor = this.getNextActiveEditor(editor)
            if (!nextEditor) {
                return
            }
            const range = ev.visibleRanges[0]
            const lastLine = this.getLastLine(range)
            this.decorate(editor, lastLine)
            this.scrollNextEditor(nextEditor, range)
        })
        this.continueOnRight()
    }

    stop() {
        this.scrollEvent?.dispose()
        this.scrollEvent = undefined
        this.decorationMap.forEach((v) => v.dispose())
    }


    getLastLine(range: vscode.Range) {
        const begPos = new vscode.Position(range.end.line - this.overlap, 0)
        const endPos = new vscode.Position(range.end.line + 1, 10000)
        return new vscode.Range(begPos, endPos)
    }

    decorate(editor: vscode.TextEditor, range: vscode.Range) {
        this.decorationMap.get(editor)?.dispose()
        const option = { opacity: '0.3' }
        const deco = vscode.window.createTextEditorDecorationType(option)
        this.decorationMap.set(editor, deco)
        editor.setDecorations(deco, [range])
    }

    scrollNextEditor(nextEditor: vscode.TextEditor, visibleRange: vscode.Range) {
        const begPos = new vscode.Position(visibleRange.end.line - this.overlap, 0)
        const endPos = new vscode.Position(visibleRange.end.line + 1, 0)
        nextEditor.revealRange(new vscode.Range(begPos, endPos), vscode.TextEditorRevealType.AtTop)
    }

    getNextActiveEditor(editor: vscode.TextEditor) {
        const column = editor.viewColumn
        if (column === undefined) {
            return
        }
        for (const ed of vscode.window.visibleTextEditors) {
            if (column + 1 === ed.viewColumn && editor.document.uri.toString() === ed.document.uri.toString()) {
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
        const lastLine = this.getLastLine(range)
        this.decorate(activeEditor, lastLine)
        this.scrollNextEditor(nextEditor, range)
    }
}

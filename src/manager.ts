import * as vscode from 'vscode'

type LR = 'left' | 'right'

export class ScrollManager {
    scrollEvent?: vscode.Disposable
    changeVisibleTextEditors: vscode.Disposable
    decorationMap: Map<vscode.TextEditor, vscode.TextEditorDecorationType> = new Map()
    overlapLines: number = 0
    currentLeftRight: LR = 'right'

    constructor() {
        this.changeVisibleTextEditors = vscode.window.onDidChangeVisibleTextEditors(() => {
            this.clearDecorationMap()
        })
    }

    clearScrollEvent() {
        this.scrollEvent?.dispose()
        this.scrollEvent = undefined
    }

    clearDecorationMap() {
        this.decorationMap.forEach((v) => v.dispose())
        this.decorationMap.clear()
    }

    dispose() {
        this.clearScrollEvent()
        this.changeVisibleTextEditors.dispose()
        this.clearDecorationMap()
    }

    start(lr: LR = 'right') {
        this.currentLeftRight = lr
        this.stop()
        this.scrollEvent = vscode.window.onDidChangeTextEditorVisibleRanges((ev) => {
            const editor = ev.textEditor
            const nextEditor = this.getNextEditor(editor)
            if (!nextEditor) {
                return
            }
            this.scroll(editor, nextEditor, ev.visibleRanges)
        })
        this.continueOnNext()
    }

    stop() {
        this.clearScrollEvent()
        this.clearDecorationMap()
    }

    getOverlapRange(visibleRanges: readonly vscode.Range[]) {
        const endLine = Math.max(...visibleRanges.map((r) => r.end.line))
        const begPos = new vscode.Position(endLine - this.overlapLines, 0)
        const endPos = new vscode.Position(endLine + 1, 10000)
        return new vscode.Range(begPos, endPos)
    }

    decorate(editor: vscode.TextEditor, range: vscode.Range) {
        this.decorationMap.get(editor)?.dispose()
        const option = { opacity: '0.3' }
        const deco = vscode.window.createTextEditorDecorationType(option)
        this.decorationMap.set(editor, deco)
        editor.setDecorations(deco, [range])
    }

    scroll(editor: vscode.TextEditor, nextEditor: vscode.TextEditor, visibleRanges: readonly vscode.Range[]) {
        const overlap = this.getOverlapRange(visibleRanges)
        this.decorate(editor, overlap)
        nextEditor.revealRange(overlap, vscode.TextEditorRevealType.AtTop)
    }

    getNextEditor(editor: vscode.TextEditor) {
        const column = editor.viewColumn
        const lrNum = this.currentLeftRight === 'right' ? 1 : -1
        if (column === undefined) {
            return
        }
        for (const ed of vscode.window.visibleTextEditors) {
            if (column + lrNum === ed.viewColumn && editor.document.uri.toString() === ed.document.uri.toString()) {
                return ed
            }
        }
        return
    }

    continueOnNext() {
        const activeEditor = vscode.window.activeTextEditor
        if (!activeEditor) {
            return
        }
        const nextEditor = this.getNextEditor(activeEditor)
        if (!nextEditor) {
            return
        }
        this.scroll(activeEditor, nextEditor, activeEditor.visibleRanges)
    }
}

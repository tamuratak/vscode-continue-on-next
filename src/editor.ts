import * as vscode from 'vscode'

export class Scroller {
    next?: Scroller

    constructor(readonly editor: vscode.TextEditor) {}

    async continueOnRight() {
        if (this.next) {
            return this.next
        }
        const doc = this.editor.document
        const editor = await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside, true)
        const sc = new Scroller(editor)
        this.next = sc
        return sc
    }

    revealeNextLineAtTop(range: vscode.Range) {
        const endPos = new vscode.Position(range.end.line + 1, 0)
        this.editor.revealRange(new vscode.Range(range.end, endPos), vscode.TextEditorRevealType.AtTop)
    }
}

export class ScrollerManager {
    editorMap: Map<vscode.TextEditor, Scroller>
    disposables: vscode.Disposable[]

    constructor() {
        this.editorMap = new Map()
        vscode.window.onDidChangeTextEditorVisibleRanges((ev) => {
            const editor = ev.textEditor
            const sc = this.editorMap.get(editor)
            if (!sc || !sc.next) {
                return
            }
            const range = ev.visibleRanges[0]
            sc.next.revealeNextLineAtTop(range)
        })
        vscode.window.onDidChangeVisibleTextEditors((visibleEditors) => {
            const deletedEditorSet = new Set(this.editorMap.keys())
            for (const editor of visibleEditors) {
                deletedEditorSet.delete(editor)
            }
            for (const editor of deletedEditorSet.values()) {
                for (const sc of this.editorMap.values()) {
                    if (sc.next?.editor === editor) {
                        const e = sc.next?.next?.editor
                        if (e) {
                            sc.next = new Scroller(e)
                        } else {
                            sc.next = undefined
                        }
                    }
                }
                this.editorMap.delete(editor)
            }
        })
    }

    createScroller(editor: vscode.TextEditor) {
        const sc = new Scroller(editor)
        this.editorMap.set(editor, sc)
        return sc
    }

    get(editor: vscode.TextEditor) {
        const ret = this.editorMap.get(editor)
        if (ret) {
            return ret
        } else {
            return this.createScroller(editor)
        }
    }

    async continueOnRight() {
        const activeEditor = vscode.window.activeTextEditor
        if (!activeEditor) {
            return
        }
        const sc = this.get(activeEditor)
        const next = await sc.continueOnRight()
        this.editorMap.set(next.editor, next)
        next.revealeNextLineAtTop(activeEditor.visibleRanges[0])
    }
}
import * as vscode from 'vscode'

function getEditor(doc: vscode.TextDocument, column: vscode.ViewColumn | undefined) {
    for (const editor of vscode.window.visibleTextEditors) {
        if (editor.document === doc && column && editor.viewColumn === column) {
            return editor
        }
    }
    return
}

export class Scroller {
    next?: Scroller
    doc: vscode.TextDocument
    column: vscode.ViewColumn | undefined

    constructor(editor: vscode.TextEditor) {
        this.doc = editor.document
        this.column = editor.viewColumn
    }

    revealeNextLineAtTop(range: vscode.Range) {
        const endPos = new vscode.Position(range.end.line + 1, 0)
        const editor = getEditor(this.doc, this.column)
        editor?.revealRange(new vscode.Range(range.end, endPos), vscode.TextEditorRevealType.AtTop)
    }

}

export class ScrollerManager {
    editorMap: Map<string, Scroller>
    disposables: vscode.Disposable[]

    constructor() {
        this.editorMap = new Map()
        vscode.window.onDidChangeTextEditorVisibleRanges((ev) => {
            const editor = ev.textEditor
            const sc= this.editorMap.get(JSON.stringify([editor.document.uri.toString(), editor.viewColumn]))
            if (!sc || !sc.next || vscode.window.activeTextEditor !== editor) {
                return
            }
            const range = ev.visibleRanges[0]
            sc.next.revealeNextLineAtTop(range)
        })
    }

    createScroller(editor: vscode.TextEditor) {
        const sc = new Scroller(editor)
        this.editorMap.set(JSON.stringify([editor.document.uri.toString(), editor.viewColumn]), sc)
        return sc
    }

    get(editor: vscode.TextEditor) {
        const sc = this.editorMap.get(JSON.stringify([editor.document.uri.toString(), editor.viewColumn]))
        if (sc) {
            return sc
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
        const doc = sc.doc
        const nextEditor = await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside, true)
        const next = this.createScroller(nextEditor)
        sc.next = next
        next.revealeNextLineAtTop(activeEditor.visibleRanges[0])
    }
}

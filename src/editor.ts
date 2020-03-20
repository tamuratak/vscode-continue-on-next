import * as vscode from 'vscode'

export class Scroller {
    next: Scroller

    constructor(readonly self: vscode.TextEditor) {}

    async continueOnRight() {
        if (this.next) {
            return this.next
        }
        const doc = this.self.document
        const editor = await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside, true)
        const sc = new Scroller(editor)
        this.next = sc
        return sc
    }

}

export class ScrollerManager {
    editorMap: Map<vscode.TextEditor, Scroller>

    constructor() {
        this.editorMap = new Map()
    }

    get(editor: vscode.TextEditor) {
        const ret = this.editorMap.get(editor)
        if (ret) {
            return ret
        } else {
            const sc = new Scroller(editor)
            this.editorMap.set(editor, sc)
            return sc
        }
    }

    async continueOnRight() {
        const activeEditor = vscode.window.activeTextEditor
        if (!activeEditor) {
            return
        }
        const sc = this.get(activeEditor)
        return await sc.continueOnRight()
    }
}
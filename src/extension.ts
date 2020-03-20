import * as vscode from 'vscode'
import {ScrollerManager} from './editor'

export function activate(context: vscode.ExtensionContext) {
    const manager = new ScrollerManager()
    const disposable = vscode.commands.registerCommand('continue-on-next.continueOnRight', () => manager.continueOnRight() )
    context.subscriptions.push(disposable)
}

export function deactivate() {}

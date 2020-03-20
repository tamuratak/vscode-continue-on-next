import * as vscode from 'vscode'
import {ScrollerManager} from './editor'

export function activate(context: vscode.ExtensionContext) {
    const manager = new ScrollerManager()
    context.subscriptions.push( vscode.commands.registerCommand('continue-on-next.start', () => manager.start() ) )
    context.subscriptions.push( vscode.commands.registerCommand('continue-on-next.stop', () => manager.stop() ) )
}

export function deactivate() {}

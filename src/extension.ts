import * as vscode from 'vscode'
import {ScrollManager} from './manager'

export function activate(context: vscode.ExtensionContext) {
    const manager = new ScrollManager()
    context.subscriptions.push(manager)
    context.subscriptions.push( vscode.commands.registerCommand('continue-on-next.right', () => manager.start('right') ) )
    context.subscriptions.push( vscode.commands.registerCommand('continue-on-next.left', () => manager.start('left') ) )
    context.subscriptions.push( vscode.commands.registerCommand('continue-on-next.stop', () => manager.stop() ) )
}

export function deactivate() {}

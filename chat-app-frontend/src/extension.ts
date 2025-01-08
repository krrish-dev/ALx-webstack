import * as vscode from 'vscode';
import { discoverAllFilesInWorkspace } from './discoverFiles';

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "chat-app-frontend" is now active!');

  context.subscriptions.push(
    vscode.commands.registerCommand('extension.discoverFiles', async () => {
      await discoverAllFilesInWorkspace();
    })
  );
}

export function deactivate() {
  // Clean up resources if needed
}

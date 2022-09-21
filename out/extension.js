"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const config_interface_1 = require("./config-interface");
const vscode_1 = require("vscode");
const node_fetch_1 = require("node-fetch");
function activate(context) {
    const getKey = async () => {
        let key = config_interface_1.Config.section.get('key');
        if (key) {
            return key;
        }
        const url = 'https://dictionaryapi.com';
        vscode.window.showInformationMessage(`Get your API key here: ${url}`, { key: 'open', title: 'Open URL' }).then(item => {
            if (item && item.key === 'open')
                vscode.env.openExternal(vscode.Uri.parse(url));
        });
        const input = await vscode.window.showInputBox({
            prompt: 'Paste your API key here to use the thesaurus service.',
            ignoreFocusOut: true,
        });
        if (input) {
            key = input;
            config_interface_1.Config.section.update('key', key, vscode_1.ConfigurationTarget.Global);
            return key;
        }
        else {
            vscode.window.showWarningMessage('No API key was provided. The thesaurus service cannot be accessed.');
            return;
        }
    };
    const getWordRange = async () => {
        let word;
        let range;
        const editor = vscode.window.activeTextEditor;
        const hasSelection = (e) => e.selections.length > 0 && e.selection.isEmpty === false;
        if (editor) {
            if (hasSelection(editor)) {
                word = editor.document.getText(editor.selection);
            }
            else {
                range = editor.document.getWordRangeAtPosition(editor.selection.active);
                if (range) {
                    word = editor.document.getText(range);
                }
            }
        }
        if (!word) {
            const input = await vscode.window.showInputBox({ prompt: 'Enter a word to look up.' });
            if (input) {
                word = input;
            }
        }
        return [word, range];
    };
    const getWordData = async (word, key) => {
        const res = await (0, node_fetch_1.default)(`https://www.dictionaryapi.com/api/v3/references/thesaurus/json/${encodeURIComponent(word)}?key=${key}`);
        switch (res.status) {
            case 400:
                vscode.window.showErrorMessage(`The server responded with "Bad Request". This might be a bug in the extension.`);
                return;
            case 403:
                vscode.window.showErrorMessage(`The server responded with "Forbidden". Check your API key. Alternatively, the request limit may be exceeded.`);
                return;
            case 404:
                vscode.window.showInformationMessage(`No matches found for word "${word}".`);
                return;
        }
        const text = await res.text();
        if (!text.startsWith('[')) {
            vscode.window.showErrorMessage(`Unknown word, did you mean: ${text}`);
            return;
        }
        const data = JSON.parse(text);
        return data;
    };
    const synonyms = vscode.commands.registerCommand('mw-thesaurus.synonyms', async () => {
        let key = await getKey();
        if (!key) {
            vscode.window.showWarningMessage('No API key was provided. The thesaurus service cannot be accessed.');
            return;
        }
        const [word, range] = await getWordRange();
        if (!word) {
            vscode.window.showWarningMessage('No word found near cursor or in selection.');
            return;
        }
        const data = await getWordData(word, key);
        if (!data) {
            return;
        }
        const list = data.flatMap(response => {
            return response.shortdef.flatMap((def, idx) => {
                const sep = {
                    label: '',
                    kind: vscode.QuickPickItemKind.Separator
                };
                const defItem = {
                    label: response.hwi.hw,
                    description: def,
                };
                const sepafter = {
                    label: 'Synonyms',
                    kind: vscode.QuickPickItemKind.Separator
                };
                const items = response.meta.syns[idx]?.map(syn => ({
                    label: syn
                })) ?? [];
                return items.length ? [sep, defItem, sepafter, ...items] : [];
            });
        });
        const pick = await vscode.window.showQuickPick(list);
        const editor = vscode.window.activeTextEditor;
        if (pick?.label && editor) {
            editor.edit(builder => builder.replace(range ?? editor.selection, pick.label));
        }
    });
    const antonyms = vscode.commands.registerCommand('mw-thesaurus.antonyms', async () => {
        let key = await getKey();
        if (!key) {
            vscode.window.showWarningMessage('No API key was provided. The thesaurus service cannot be accessed.');
            return;
        }
        const [word, range] = await getWordRange();
        if (!word) {
            vscode.window.showWarningMessage('No word found near cursor or in selection.');
            return;
        }
        const data = await getWordData(word, key);
        if (!data) {
            return;
        }
        const list = data.filter(r => r.meta.ants.length > 0).flatMap(response => {
            return response.shortdef.flatMap((def, idx) => {
                const sep = {
                    label: '',
                    kind: vscode.QuickPickItemKind.Separator
                };
                const defItem = {
                    label: response.hwi.hw,
                    description: def,
                };
                const sepafter = {
                    label: 'Antonyms',
                    kind: vscode.QuickPickItemKind.Separator
                };
                const items = response.meta.ants[idx]?.map(syn => ({
                    label: syn
                })) ?? [];
                return items.length ? [sep, defItem, sepafter, ...items] : [];
            });
        });
        const pick = await vscode.window.showQuickPick(list);
        const editor = vscode.window.activeTextEditor;
        if (pick?.label && editor) {
            editor.edit(builder => builder.replace(range ?? editor.selection, pick.label));
        }
    });
    context.subscriptions.push(synonyms, antonyms);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map
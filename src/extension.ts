import * as vscode from 'vscode'
import { Config } from "./config"
import { ConfigurationTarget } from 'vscode'
import fetch from 'node-fetch'

export function activate(context: vscode.ExtensionContext) {

	const getKey = async () => {
		let key = Config.section.get('key')
		if (key) {
			return key
		}
		const url = 'https://dictionaryapi.com'
		vscode.window.showInformationMessage(
			`Get your API key here: ${url}`,
			<MessageAction>{ key: 'open', title: 'Open URL' }
		).then(item => {
			if (item && item.key === 'open')
				vscode.env.openExternal(vscode.Uri.parse(url))
		})

		const input = await vscode.window.showInputBox({
			prompt: 'Paste your API key here to use the thesaurus service.',
			ignoreFocusOut: true,
		})
		if (input) {
			key = input
			Config.section.update('key', key, ConfigurationTarget.Global)
			return key
		} else {
			vscode.window.showWarningMessage('No API key was provided. The thesaurus service cannot be accessed.')
			return
		}
	}

	const getWordRange = async (): Promise<[string | undefined, vscode.Range | undefined]> => {
		let word: string | undefined
		let range: vscode.Range | undefined
		const editor = vscode.window.activeTextEditor
		const hasSelection = (e: vscode.TextEditor) => e.selections.length > 0 && e.selection.isEmpty === false
		if (editor) {
			if (hasSelection(editor)) {
				word = editor.document.getText(editor.selection)
			} else {
				range = editor.document.getWordRangeAtPosition(editor.selection.active)
				if (range) {
					word = editor.document.getText(range)
				}
			}
		}
		if (!word) {
			const input = await vscode.window.showInputBox({ prompt: 'Enter a word to look up.' })
			if (input) {
				word = input
			}
		}
		return [word, range]
	}

	const getWordData =async (word: string, key: string): Promise<ApiResponse[] | undefined> => {
		const res = await fetch(`https://www.dictionaryapi.com/api/v3/references/thesaurus/json/${encodeURIComponent(word)}?key=${key}`)
		switch (res.status)
		{
			case 400:
				vscode.window.showErrorMessage(`The server responded with "Bad Request". This might be a bug in the extension.`)
				return
			case 403:
				vscode.window.showErrorMessage(`The server responded with "Forbidden". Check your API key. Alternatively, the request limit may be exceeded.`)
				return
			case 404:
				vscode.window.showInformationMessage(`No matches found for word "${word}".`)
				return
		}
		const text = await res.text()
		if (!text.startsWith('[')) {
			vscode.window.showErrorMessage(`Unknown word, did you mean: ${text}`)
			return
		}
		const data: ApiResponse[] = JSON.parse(text)
		return data
	}

	const synonyms = vscode.commands.registerCommand('mw-thesaurus.synonyms', async () => {
		let key = await getKey()
		if (!key) {
			vscode.window.showWarningMessage('No API key was provided. The thesaurus service cannot be accessed.')
			return
		}

		const [word, range] = await getWordRange()
		if (!word) {
			vscode.window.showWarningMessage('No word found near cursor or in selection.')
			return
		}
		const data = await getWordData(word, key)
		if (!data) {
			return
		}

		const list = data.flatMap(response => {
			return response.shortdef.flatMap((def, idx) => {
				const sep: vscode.QuickPickItem = {
					label: '',
					kind: vscode.QuickPickItemKind.Separator
				}
				const defItem: vscode.QuickPickItem = {
					label: response.hwi.hw,
					description: def,
				}
				const sepafter: vscode.QuickPickItem = {
					label: 'Synonyms',
					kind: vscode.QuickPickItemKind.Separator
				}
				const items = response.meta.syns[idx]?.map(syn => <vscode.QuickPickItem>({
					label: syn
				})) ?? []
				return items.length ? [sep, defItem, sepafter, ...items] : []
			})
		})

		const pick = await vscode.window.showQuickPick(list)
		const editor = vscode.window.activeTextEditor
		if (pick?.label && editor) {
			editor.edit(builder => builder.replace(range ?? editor.selection, pick.label))
		}
	})

	const antonyms = vscode.commands.registerCommand('mw-thesaurus.antonyms', async () => {
		let key = await getKey()
		if (!key) {
			vscode.window.showWarningMessage('No API key was provided. The thesaurus service cannot be accessed.')
			return
		}

		const [word, range] = await getWordRange()
		if (!word) {
			vscode.window.showWarningMessage('No word found near cursor or in selection.')
			return
		}
		const data = await getWordData(word, key)
		if (!data) {
			return
		}

		const list = data.filter(r => r.meta.ants.length > 0).flatMap(response => {
			return response.shortdef.flatMap((def, idx) => {
				const sep: vscode.QuickPickItem = {
					label: '',
					kind: vscode.QuickPickItemKind.Separator
				}
				const defItem: vscode.QuickPickItem = {
					label: response.hwi.hw,
					description: def,
				}
				const sepafter: vscode.QuickPickItem = {
					label: 'Antonyms',
					kind: vscode.QuickPickItemKind.Separator
				}
				const items = response.meta.ants[idx]?.map(syn => <vscode.QuickPickItem>({
					label: syn
				})) ?? []
				return items.length ? [sep, defItem, sepafter, ...items] : []
			})
		})

		const pick = await vscode.window.showQuickPick(list)
		const editor = vscode.window.activeTextEditor
		if (pick?.label && editor) {
			editor.edit(builder => builder.replace(range ?? editor.selection, pick.label))
		}
	})

	context.subscriptions.push(synonyms, antonyms)
}

export function deactivate() { }

type ApiResponse = {
	meta: {
		id: string
		uuid: string
		src: string
		section: string
		stems: string[]
		syns: string[][]
		ants: string[][]
	}
	hwi: {
		hw: string
	}
	shortdef: string[]
}

interface MessageAction extends vscode.MessageItem {
	key: string
}

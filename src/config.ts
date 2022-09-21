import * as vscode from "vscode";

interface TypedConfig {
	get(item: "key"): string | null;
	update(section: "key", value: string | null, configurationTarget?: vscode.ConfigurationTarget | boolean): Thenable<void>;
}

export class Config {
	static get section(): vscode.WorkspaceConfiguration & TypedConfig {
		return vscode.workspace.getConfiguration("mw-thesaurus");
	}
}
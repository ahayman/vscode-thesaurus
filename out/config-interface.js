"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
const vscode = require("vscode");
class Config {
    static get section() {
        return vscode.workspace.getConfiguration("mw-thesaurus");
    }
}
exports.Config = Config;
//# sourceMappingURL=config-interface.js.map
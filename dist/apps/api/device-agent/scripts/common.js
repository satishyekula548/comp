"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScriptFilename = getScriptFilename;
exports.getPackageFilename = getPackageFilename;
function getScriptFilename(os) {
    return os === 'macos' ? 'run_me_first.command' : 'run_me_first.bat';
}
function getPackageFilename(os) {
    return os === 'macos' ? 'compai-device-agent.pkg' : 'compai-device-agent.msi';
}

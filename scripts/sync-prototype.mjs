// プロトタイプHTML（唯一の元ファイル）を、配信される public/play/index.html へコピーする。
// build / dev / preview の前に自動実行され、元ファイルは prototype/ の1つだけに保たれる。
import { mkdirSync, copyFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = resolve(root, 'prototype/football-chess-prototype.html');
const dest = resolve(root, 'public/play/index.html');

mkdirSync(dirname(dest), { recursive: true });
copyFileSync(src, dest);
console.log(`[sync-prototype] copied prototype -> public/play/index.html`);

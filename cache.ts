import {DenoDir} from 'https://deno.land/x/deno_cache@0.6.2/deno_dir.ts';
import {join as joinPath} from 'https://deno.land/std@0.210.0/path/join.ts';
import {ensureDirSync} from 'https://deno.land/std@0.210.0/fs/ensure_dir.ts';
import {existsSync} from 'https://deno.land/std@0.210.0/fs/exists.ts';
import {encodeHex} from 'https://deno.land/std@0.210.0/encoding/hex.ts';

const wincompileCacheDir = joinPath(new DenoDir().root, 'wincompile');
ensureDirSync(wincompileCacheDir);

const txtEnc = new TextEncoder();

async function cache(url: URL): Promise<boolean> {
	const filename = await makePath(url.href);
	Deno.writeFileSync(filename, new Uint8Array(await (await fetch(url)).arrayBuffer()));
	return true;
}

async function getDataFromCache(url: URL): Promise<Uint8Array | null> {
	const path = await _getPathFromCache(url.href);

	if (!path)
		return null;

	return await Deno.readFile(path);
}

function getPathFromCache(url: URL): Promise<string | null> {
	return _getPathFromCache(url.href);
}

async function _getPathFromCache(url: string): Promise<string | null> {
	const path = await makePath(url);

	if (!existsSync(path))
		return null;

	return path;
}

async function makePath(url: string): Promise<string> {
	return joinPath(wincompileCacheDir, await hashUrl(url.toString()));
}

async function hashUrl(url: string): Promise<string> {
	return encodeHex(await crypto.subtle.digest('sha-256', txtEnc.encode(url)));
}

export {cache, getDataFromCache, getPathFromCache};
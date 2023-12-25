import {DenoDir} from 'https://deno.land/x/deno_cache@0.6.2/deno_dir.ts';
import {join as joinPath} from 'https://deno.land/std@0.210.0/path/join.ts';
import {ensureDirSync} from 'https://deno.land/std@0.210.0/fs/ensure_dir.ts';
import {existsSync} from 'https://deno.land/std@0.210.0/fs/exists.ts';
import {encodeHex} from 'https://deno.land/std@0.210.0/encoding/hex.ts';

const wincompileCacheDir = joinPath(new DenoDir().root, 'wincompile');
ensureDirSync(wincompileCacheDir);

const txtEnc = new TextEncoder();

async function cache(url: URL, opts = {refresh: false}): Promise<string> {
	const filename = await makePath(url.href);
	if (opts.refresh || !await getPathFromCache(url.href))
		Deno.writeFileSync(filename, new Uint8Array(await (await fetch(url)).arrayBuffer()));
	return filename;
}

async function getDataFromCache(url: URL): Promise<Uint8Array | null> {
	const path = await getPathFromCache(url.href);
	if (!path) return null;
	return await Deno.readFile(path);
}

async function getPathFromCache(url: string): Promise<string> {
	const path = await makePath(url);
	if (!existsSync(path)) return '';
	return path;
}

async function makePath(url: string): Promise<string> {
	return joinPath(wincompileCacheDir, await hashUrl(url.toString()));
}

async function hashUrl(url: string): Promise<string> {
	return encodeHex(await crypto.subtle.digest('sha-256', txtEnc.encode(url)));
}

export default cache;
export {getDataFromCache};
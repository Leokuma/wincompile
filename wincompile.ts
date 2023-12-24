import {copySync} from 'https://deno.land/std@0.210.0/fs/copy.ts';
import {parseArgs} from 'https://deno.land/std@0.210.0/cli/parse_args.ts';
import {red} from 'https://deno.land/std@0.210.0/fmt/colors.ts';
import {cache, getPathFromCache} from './cache.ts';
import {Metadata} from './metadata.ts';

if (Deno.build.os != 'windows') {
	console.error(red('Wincompile is Windows only.'));
	Deno.exit(1);
}

const args = parseArgs<Partial<Metadata>>(Deno.args);

const rceditUrl = new URL('https://github.com/electron/rcedit/releases/download/v2.0.0/rcedit-x64.exe');
let rceditPath = await getPathFromCache(rceditUrl);
if (!rceditPath) {
	await cache(rceditUrl);
	rceditPath = await getPathFromCache(rceditUrl) as string;
}

const defaultIconUrl = new URL('https://raw.githubusercontent.com/Leokuma/wincompile/0.1.0/windowprogram.ico');
let defaultIconPath = await getPathFromCache(defaultIconUrl);
if (!defaultIconPath) {
	await cache(defaultIconUrl);
	defaultIconPath = await getPathFromCache(defaultIconUrl) as string;
}

const defaultMetadata: Metadata = {
	Icon: defaultIconPath,
	FileDescription: '',
	LegalCopyright: '',
 	OriginalFilename: '',
	FileVersion: '1',
	ProductVersion: '1',
	ProductName: '',
	// Translation: ''
	// RequestedExecutionLevel: 'asInvoker'
};

const metadata = {...defaultMetadata, ...args};

if (!/\d/.test(metadata.ProductVersion[0])) {
	console.error(red('Error: the first character of the ProductVersion must be a number'));
	Deno.exit(1);
}

if (!/^\d[\d\.]*$/.test(metadata.FileVersion)) {
	console.error(red('Error: FileVersion can only contain numbers and dots, and must begin with a number'));
	Deno.exit(1);
}

const patchedDenoPath = Deno.makeTempFileSync();
copySync(Deno.execPath(), patchedDenoPath, {overwrite: true});

const {stdout: stdoutPatchDeno, stderr: stderrPatchDeno} = new Deno.Command(rceditPath, {
	args: [
		patchedDenoPath,
		'--set-icon', metadata.Icon,
		'--set-version-string', 'FileDescription', metadata.FileDescription,
		'--set-version-string', 'LegalCopyright', metadata.LegalCopyright,
		'--set-version-string', 'OriginalFilename', metadata.OriginalFilename,
		'--set-file-version', metadata.FileVersion,
		'--set-product-version', metadata.ProductVersion,
		'--set-version-string', 'ProductName', metadata.ProductName,
		// '--set-version-string', 'Translation', metadata.Translation,
		// '--set-requested-execution-level', metadata.RequestedExecutionLevel,
	],
	stdout: 'piped',
	stderr: 'piped',
}).outputSync();

const txtDec = new TextDecoder();

if (stdoutPatchDeno.length)
	console.log('[rcedit] ' + txtDec.decode(stdoutPatchDeno));

if (stderrPatchDeno.length)
	console.error('[rcedit] ' + txtDec.decode(stderrPatchDeno));

const {stdout: stdoutCompile, stderr: stderrCompile} = new Deno.Command(patchedDenoPath, {
	args: ['compile', 'D:/ZPT/Programas/wincompile/wincompile.ts'],
	stdout: 'piped',
	stderr: 'piped',
}).outputSync();

if (stdoutPatchDeno.length)
	console.log(txtDec.decode(stdoutPatchDeno));

if (stderrPatchDeno.length)
	console.error(txtDec.decode(stderrPatchDeno));

Deno.removeSync(patchedDenoPath);
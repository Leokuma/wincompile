import {copySync} from 'https://deno.land/std@0.210.0/fs/copy.ts';
import {parseArgs} from 'https://deno.land/std@0.210.0/cli/parse_args.ts';
import {red} from 'https://deno.land/std@0.210.0/fmt/colors.ts';
import cache from './cache.ts';
import {type Metadata, setMetadata} from './metadata.ts';
import help from './help.ts';

if (!Deno.args.length) {
	console.log(help);
	Deno.exit();
}

if (Deno.build.os != 'windows') {
	console.error(red('Wincompile is for Windows only.'));
	Deno.exit(1);
}

const parsedArgs = parseArgs(Deno.args, {string: ['FileVersion', 'ProductVersion']});

const defaultIconPath = await cache(new URL('https://raw.githubusercontent.com/Leokuma/wincompile/0.1.0/windowprogram.ico'), {refresh: !!parsedArgs.recache});

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

const metadata: Metadata = {...defaultMetadata, ...parsedArgs};

const patchedDenoPath = Deno.makeTempFileSync();
copySync(Deno.execPath(), patchedDenoPath, {overwrite: true});
const patchErrors = await setMetadata(patchedDenoPath, metadata, {recache: !!parsedArgs.recache});
if (patchErrors.length) {
	console.error(red(patchErrors.join('\n')) + '\n');
	Deno.exit(1);
}

const {stdout, stderr} = new Deno.Command(patchedDenoPath, {
	args: ['compile', ...parsedArgs._.map(arg => String(arg))],
	stdout: 'piped',
	stderr: 'piped',
}).outputSync();

const txtDec = new TextDecoder();

if (stdout.length) console.log(txtDec.decode(stdout));
if (stderr.length) console.error(txtDec.decode(stderr));

Deno.removeSync(patchedDenoPath);
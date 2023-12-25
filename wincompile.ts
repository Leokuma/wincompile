import {copySync} from 'https://deno.land/std@0.210.0/fs/copy.ts';
import {parseArgs} from 'https://deno.land/std@0.210.0/cli/parse_args.ts';
import {bold, italic, red} from 'https://deno.land/std@0.210.0/fmt/colors.ts';
import cache from './cache.ts';
import {type Metadata, setMetadata} from './metadata.ts';

if (!Deno.args.length) {
	const help = `Compile Deno apps for Windows with custom icon and metadata.

${bold('Installation')}
	deno install -f --allow-env=DENO_DIR,LOCALAPPDATA allow-net=raw.githubusercontent.com/Leokuma/wincompile --allow-read --allow-write --allow-run https://deno.land/x/wincompile@0.2.0/wincompile.ts

${bold('Examples')}
	wincompile --Icon=abc.ico -- -A --unstable app.ts
	wincompile --Icon="C:/Program Files/my program/my icon.ico" --FileDescription="Super App" --FileVersion=1.0.2 --ProductVersion=1.0.2.standard -- --allow-all --unstable app.ts
	wincompile -- -A --unstable app.ts

${bold('Usage')}
	wincompile [Wincompile options] -- [Deno compile options] <filename>

${bold('Wincompile options (case-sensitive)')}
	--FileDescription      Main file description
	--FileVersion          Examples: "2.3.0", "2". Default "1"
	--Icon                 ${italic('.ico')} filepath
	--LegalCopyright       Legal information text
	--OriginalFilename     Example: "my_app.exe"
	--ProductName          Example: "Super App"
	--ProductVersion       Examples: "1", "2.rc2". Default "1"

${bold('Deno compile options')}
	Same as ${italic('deno compile')}.


https://github.com/Leokuma/wincompile
`;

	console.log(help);
	Deno.exit();
}

if (Deno.build.os != 'windows') {
	console.error(red('Wincompile is for Windows only.'));
	Deno.exit(1);
}

const parsedArgs = parseArgs(Deno.args, {string: ['FileVersion', 'ProductVersion']});

const defaultIconPath = await cache(new URL('https://raw.githubusercontent.com/Leokuma/wincompile/0.1.0/windowprogram.ico'));

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
const patchErrors = setMetadata(patchedDenoPath, metadata);
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

if (stdout.length)	console.log(txtDec.decode(stdout));
if (stderr.length)	console.error(txtDec.decode(stderr));

Deno.removeSync(patchedDenoPath);
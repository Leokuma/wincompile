import cache from './cache.ts';

const txtDec = new TextDecoder();

async function setMetadata(exePath: string, metadata: Metadata, opts = {recache: false}): Promise<string[]> {
	const rceditPath = await cache(new URL('https://github.com/electron/rcedit/releases/download/v2.0.0/rcedit-x64.exe'), {refresh: opts.recache});

	const problems = checkMetadata(metadata);
	if (problems.length) return problems;

	const errors: string[] = [];

	const {stdout, stderr} = new Deno.Command(rceditPath, {
		args: [
			exePath,
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

	if (stdout.length) errors.push(txtDec.decode(stdout));
	if (stderr.length) errors.push(txtDec.decode(stderr));

	return errors;
}

function checkMetadata(metadata: Metadata): string[] {
	const problems: string[] = [];

	if (!/\d/.test(metadata.ProductVersion[0]))
		problems.push('The first character of the ProductVersion must be a number.');
	
	if (!/^\d[\d\.]*$/.test(metadata.FileVersion))
		problems.push('FileVersion can only contain numbers and dots, and must begin with a number.');

	return problems;
}

interface Metadata {
	Icon: string,
	FileDescription: string
	LegalCopyright: string
 	OriginalFilename: string
	FileVersion: string
	ProductVersion: string
	ProductName: string
	// Translation: string
	// RequestedExecutionLevel: 'asInvoker' | 'highestAvailable' | 'requireAdministrator'
}

export {type Metadata, setMetadata, checkMetadata};
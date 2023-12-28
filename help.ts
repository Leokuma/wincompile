import {bold, italic} from 'https://deno.land/std@0.210.0/fmt/colors.ts';

export default
`Compile Deno apps for Windows with custom icon and metadata.

${bold('Installation')}
	deno install -f --allow-env=DENO_DIR,LOCALAPPDATA --allow-net=raw.githubusercontent.com/Leokuma/wincompile --allow-read --allow-write --allow-run https://deno.land/x/wincompile/wincompile.ts

${bold('Examples')}
	wincompile --Icon=abc.ico -- -A --unstable my_app.ts
	wincompile --Icon="C:/Program Files/my program/my icon.ico" --FileDescription="Super App" --FileVersion=1.0.2 --ProductVersion=1.0.2.standard -- --allow-all --unstable app.ts
	wincompile -- -A main.ts

${bold('Usage')}
	wincompile [Wincompile options] -- [Deno compile options] <filename>

${bold('Wincompile options (case-sensitive)')}
	--FileDescription      Main file description
	--FileVersion          Examples: "2.3.0", "2". Default "1"
	--Icon                 ${italic('.ico')} filepath. Prefer 256x256 icons, as they scale better
	--LegalCopyright       Legal information text
	--OriginalFilename     Example: "my_app.exe"
	--ProductName          Example: "Super App"
	--ProductVersion       Examples: "1", "2.rc2". Default "1"
	--recache              Redownload and cache Wincompile assets. Use only if Wincompile is not working properly

${bold('Deno compile options')}
	Same as ${italic('deno compile')}.


https://github.com/Leokuma/wincompile
`;
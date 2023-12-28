# Wincompile
Compile Deno apps for Windows with custom icon and metadata.

### Examples
```
wincompile --Icon=abc.ico -- -A --unstable main.ts
```

```
wincompile --Icon="C:/Program Files/my program/my icon.ico" --FileDescription="Super App" --FileVersion=1.0.2 --ProductVersion=1.0.2.standard -- --allow-all --unstable main.ts
```

```
wincompile -- -A --unstable app.ts
```

Run `wincompile` in the command line to see more usage information.

> Windows caches EXEs' icons, so it may look like the icon wasn't applied. Change the EXE name or move it to another folder to force Windows to reload the icon.

### Installation
```
deno install -f --allow-env=DENO_DIR,LOCALAPPDATA --allow-net=raw.githubusercontent.com/Leokuma/wincompile --allow-read --allow-write --allow-run https://deno.land/x/wincompile/wincompile.ts
```

### Run remotely
You can also run Wincompile remotely instead of installing it:
```
deno run -A https://deno.land/x/wincompile/wincompile.ts --Icon=abc.ico -- -A --unstable main.ts
```
For brevity, the command above uses `-A` to grant Wincompile full permissions, but you can use the same permissions as the installation command above.

## How it works
Wincompile uses Electron's [rcedit](https://github.com/electron/rcedit) to create a patched version of Deno on the fly just to compile your app. After compilation, the patched Deno is deleted. Your original Deno installation is untouched in the process.
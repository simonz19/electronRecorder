# Screen Recorder

a desktop recorder app based on electron , it can record screen ,camera and also audio stream through Webrtc .

## quick start

```bash
    npm install
    npm start
```

## about platform

fortunately, `eletron` can build desktop app of diffrent platforms, including windows, macos and also linux.

in this demo, platform and arch infos are passed by as npm script
arguments, here are examples:<br/>

- windows: `node build.js --platform=win32 --arch=x64`
- mac: `node build.js --platform=darwin --arch=x64`

## about windows installer

two choice to build an windows installer:

- [windows-installer](https://github.com/electron/windows-installer) uses squirrel which is Wizard-Free™, with no UAC dialogs while installing, this can be as fast and as easy to install an app, all things will have been done default by quirrel.

- [inno setup](http://www.jrsoftware.org/isinfo.php) is usefull if you want a step by step installer width user choice ,this will need a `*iss` script file to tell **inno** what you want, in this file you can define any registry keys/values you like.

```bash
    npm run build
    npm run win-installer // compiled by windows-installer

    or

    npm run build
    npm run win-inno-installer // compiled by inno setup
```

## about windows registry

use **inno setup**, an "open commond"(has been configuered with registry section in `*.iss` file) will be defined into windows registry, you can type `zxy://[args]` in browser such as chrome to open the app and args will be received in electron app's main process, but notice that the firfox seems not working in this way.

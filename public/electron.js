const unhandled = require('electron-unhandled');
const contextMenu = require('electron-context-menu');
const { openNewGitHubIssue, debugInfo } = require('electron-util');
const debug = require('electron-debug');
const electron = require('electron');
const { app, BrowserWindow, Menu, Notification, ipcMain, Tray, nativeImage } = electron;
const { checkForUpdates } = require('./updater.js');

try {
	require('electron-reloader')(module);
} catch (_) {}
const setAppUserModelId = () => {
	global.appUserModelId = 'electron-svelte-sass-starter';
	app.setAppUserModelId('electron-svelte-sass-starter');
};
setAppUserModelId();
contextMenu({
	showCopyImage: false,
	showSearchWithGoogle: false,
});

//debug(); // Open dev tools for all windows

unhandled({
	reportButton: error => {
		openNewGitHubIssue({
			repoUrl: 'https://github.com/Debaerdm/Electron-Svelte-Sass-Starter',
			body: `\`\`\`\n${error.stack}\n\`\`\`\n\n---\n\n${debugInfo()}`,
		});
	},
});

let window;
let splashscreen;
let tray;

function createWindow() {
	window = new BrowserWindow({
		title: 'Electron-Svelte-Sass-Starter',
		center: true,
		width: 1024,
		height: 768,
		resizable: true,
		frame: false,
		show: false,
		webPreferences: {
			nodeIntegration: true,
			experimentalFeatures: true,
			webviewTag: true,
		},
	});

	window.loadURL(`file:///${__dirname}/index.html`);

	window.on('closed', () => {
		window = null;
	});

	window.once('focus', () => window.flashFrame(false));
	window.flashFrame(true);

	tray = new Tray(nativeImage.createEmpty());
	tray.setToolTip('Electron-Svelte-Sass-Starter application');

	const contextMenu = Menu.buildFromTemplate([
		{
			label: 'Application',
			submenu: [
				{
					label: 'About Application',
					selector: 'orderFrontStandardAboutPanel:',
				},
				{ type: 'separator' },
				{
					label: 'Quit',
					accelerator: 'Command+Q',
					click() {
						app.quit();
					},
				},
			],
		},
		{
			label: 'Edit',
			submenu: [
				{ label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
				{ label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
				{ type: 'separator' },
				{ label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
				{ label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
				{ label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
				{
					label: 'Select All',
					accelerator: 'CmdOrCtrl+A',
					selector: 'selectAll:',
				},
			],
		},
		{
			label: 'Ouvrir la console de développement',
			click: () => window.webContents.openDevTools({ mode: 'detach' }),
			accelerator: 'CommandOrControl+O',
		},
		{
			label: "Recharger l'application",
			click: () => window.reload(),
			accelerator: 'F5',
		},
		{ type: 'separator' },
		{
			label: 'Quitter',
			click: () => app.quit(),
			accelerator: 'CommandOrControl+Q',
		},
	]);

	tray.setContextMenu(contextMenu);
	Menu.setApplicationMenu(contextMenu);

	tray.on('click', () => {
		if (window.isMinimized()) window.restore();
		if (!window.isVisible()) window.show();
		window.focus();
	});

	splashscreen = new BrowserWindow({
		autoHideMenuBar: true,
		frame: false,
		width: 525,
		height: 265,
		resizable: false,
		show: true,
		skipTaskbar: true,
		webPreferences: {
			nodeIntegration: true,
		},
	});

	splashscreen.loadURL(`file:///${__dirname}/splashscreen.html`);

	splashscreen.on('closed', () => {
		splashscreen = null;
	});
}

if (app.isPackaged) {
	const settings = app.getLoginItemSettings();

	app.setLoginItemSettings({
		openAtLogin: settings.openAtLogin,
	});

	ipcMain.on('launch-startup', (event, arg) => {
		app.setLoginItemSettings({
			openAtLogin: arg,
		});
	});
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
	app.quit();
} else {
	app.on('second-instance', (event, commandLine, workingDirectory) => {
		if (window) {
			if (window.isMinimized()) window.restore();
			if (!window.isVisible()) window.show();
			window.focus();
		}
	});

	app.commandLine.appendSwitch('disable-site-isolation-trials');
	app.on('ready', () => {
		createWindow();
		checkForUpdates(splashscreen, window);
	});

	app.on('window-all-closed', () => {
		if (process.platform !== 'darwin') {
			app.quit();
		}
	});
	app.on('activate', () => {
		if (window === null) {
			createWindow();
		}
	});

	ipcMain.on('notifier', (event, arg) => {
		const { body, title } = arg;

		if (Notification.isSupported()) {
			new Notification({ body, title }).show();
		}
	});
}

const { is } = require('electron-util');
const { autoUpdater } = require('electron-updater');
const { app } = require('electron');

let notifiedWindow;
let mainWindow;
autoUpdater.autoDownload = false;

autoUpdater.on('error', error => {
	notifiedWindow.webContents.send('message', {
		text: !app.isPackaged ? 'Development mode, skip the update' : 'An error occurred during the update.',
	});

	if (!app.isPackaged) {
		setTimeout(() => {
			notifiedWindow.hide();
			mainWindow.show();
		}, 2000);
	}
});

autoUpdater.on('checking-for-update', () => {
	notifiedWindow.webContents.send('message', {
		text: 'Check for update...',
	});
});

autoUpdater.on('update-available', () => {
	notifiedWindow.webContents.send('message', {
		text: 'An update is available',
	});

	autoUpdater.downloadUpdate();
});

autoUpdater.on('update-not-available', () => {
	notifiedWindow.webContents.send('message', {
		text: 'Your app is up to date',
	});

	setTimeout(() => {
		notifiedWindow.hide();
		mainWindow.show();
	}, 2000);
});

autoUpdater.on('download-progress', progressObj => {
	notifiedWindow.webContents.send('message', {
		text: 'Downloading...',
		data: { ...progressObj },
	});
});

autoUpdater.on('update-downloaded', () => {
	notifiedWindow.webContents.send('message', {
		text: 'Install the update',
	});

	let seconds = 5;

	setInterval(() => {
		notifiedWindow.webContents.send('message', {
			text: `Restart in ${seconds} second${seconds > 1 ? 's' : ''}`,
		});

		if (seconds > 0) {
			seconds = seconds - 1;
		}
	}, 1000);

	setTimeout(() => {
		setImmediate(() => autoUpdater.quitAndInstall(true, true));
	}, 5000);
});

function checkForUpdates(secondWindow, primayWindow) {
	notifiedWindow = secondWindow;
	mainWindow = primayWindow;

	if (!is.macAppStore) {
		const log = require('electron-log');
		log.transports.file.level = 'debug';
		autoUpdater.logger = log;

		setTimeout(() => {
			autoUpdater.checkForUpdates();
		}, 2000);
	}
}

module.exports.checkForUpdates = checkForUpdates;

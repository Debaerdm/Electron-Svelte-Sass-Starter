<script>
	import { onMount } from 'svelte';
	const { remote, ipcRenderer } = require('electron');
	const svelte = require('svelte/compiler');
	const sass =  require('sass');
	import Header from '../Header';
	import { isOffline } from '../../shared/store';

	onMount(() => {
		document.getElementById('node-version').innerText = process.versions['node'];
		document.getElementById('chrome-version').innerText = process.versions['chrome'];
		document.getElementById('electron-version').innerText = process.versions['electron'];
		document.getElementById('svelte-version').innerText = svelte.VERSION;
		document.getElementById('sass-version').innerText = sass.info;
		document.getElementById('package-version').innerText = remote.app.getVersion();

		setInterval(() => {
			console.log('plop');
			ipcRenderer.send('notifier', { title: 'It\'s a notification', body: 'See public/electron.js for more informations.' });
		}, 20000);
	});

	window.addEventListener('online', () => isOffline.set(false));
 	window.addEventListener('offline', () => isOffline.set(true));
</script>

<style src="./App.scss"></style>

<Header />
{#if $isOffline}
	<div class="offline-banner">
		<p>You'r are offline.</p>
	</div>
{/if}
<div class="overview">
	<h1>Welcom to you'r univers!</h1>
	<p>
		We are using Node.js <span id="node-version"></span>,
		Chromium <span id="chrome-version"></span>,
		Electron <span id="electron-version"></span>,
		Svelte <span id="svelte-version"></span>,
		Sass <span id="sass-version"></span>,
		and package version <span id="package-version"></span>.
	</p>
</div>

import jump from 'jump.js';

let player = null;
let ready = false;
let state = -1;

const RATIO = 16 / 9;
const REM = 16;
const PLAY_HEIGHT = REM * 10;

const $media = d3.select('#media');
const $playerContainer = d3.select('#player-container');
const $playsContainer = d3.select('#plays-container');

function getCurrentTime() {
	if (state === 1) return player.getCurrentTime();
	return false;
}

function loadVideo(id) {
	player.loadVideoById(id);
}

function seek(timestamp) {
	player.seekTo(timestamp);
}

function isPlaying() {
	return state === 1;
}

function resize() {
	if (player) {
		const w = $media.node().offsetWidth;
		const h = w / RATIO;
		const ih = window.innerHeight - PLAY_HEIGHT * 1.75;
		const width = h > ih ? Math.floor(ih * RATIO) : w;
		const height = h > ih ? ih : Math.floor(width / RATIO);
		$playsContainer.st({ width });
		$playerContainer.st({ width });
		player.setSize(width, height);
	}
}

// gross global cuz youtube
window.onYouTubeIframeAPIReady = () => {
	ready = true;
};

function loadScript() {
	// This code loads the IFrame Player API code asynchronously.
	const tag = document.createElement('script');
	tag.src = 'https://www.youtube.com/iframe_api';

	const firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function handleError({ data }) {
	console.error('error', data);
}

// function handleReady() {}

function handleStateChange({ target, data }) {
	state = data;
	if (state === 1) jump('#media');
}

function setupPlayer() {
	player = new YT.Player('player', {
		videoId: 'Y53dlJ4hsIg',
		playerVars: {
			controls: 1,
			cc_load_policy: 0,
			enablejsapi: 1,
			fs: 1,
			iv_load_policy: 3,
			modestbranding: 1,
			rel: 0,
			showinfo: 0,
			playsinline: 1,
			color: 'white'
		},
		events: {
			// onReady: handleReady,
			onStateChange: handleStateChange,
			onError: handleError
		}
	});
}

function setup() {
	setupPlayer();
	resize();
}

function init() {
	return new Promise((resolve, reject) => {
		loadScript();

		let count = 0;
		const maxCount = 300; // 15 seconds
		const check = () => {
			count += 1;
			if (ready) resolve();
			else if (count > maxCount) reject('waited too long for youtube api');
			else setTimeout(check, 50);
		};

		// keep checking if youtube api has loaded
		check();
	});
}

export default {
	init,
	setup,
	resize,
	getCurrentTime,
	loadVideo,
	seek,
	isPlaying
};

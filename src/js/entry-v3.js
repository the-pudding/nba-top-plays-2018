// D3 is included by globally by default
import debounce from 'lodash.debounce';
import isMobile from './utils/is-mobile';
import loadData from './load-data';

const ASPECT = 16 / 9;
const REM = 16;
const PLAY_WIDTH = REM * 20;

let playData = null;
let previousWidth = 0;
let currentIndex = 0;

const $body = d3.select('body');
const $content = $body.select('#content');
const $media = $body.select('#media');
const $plays = $body.select('#plays');
const $video = $body.select('video');
const $videoEl = $video.node();
let $play = null;

function prefix(prop) {
	return [prop, `webkit-${prop}`, `ms-${prop}`];
}

function resize() {
	const width = $body.node().offsetWidth;
	const height = Math.floor(window.innerHeight - $plays.node().offsetHeight / 2);
	$content.st({ width });
	$media.st({ height });
	if (previousWidth !== width) {
		previousWidth = width;
	}
}

function swapVideo() {
	const offX = -PLAY_WIDTH * currentIndex;
	const prefixes = prefix('transform');
	prefixes.forEach(pre => {
		const transform = `translate(${offX}px, 0)`;
		$plays.node().style[pre] = transform;
	});

	$play.classed('is-active', (d, i) => i === currentIndex);
	const d = playData[currentIndex];

	// set the source of the video element
	$videoEl.src = `assets/video/${d.shortcode}.mp4`;

	// load the video
	$videoEl.load();

	// when its ready, play
	$video.on('canplaythrough', () => {
		if ($videoEl.paused) $videoEl.play();
	});

	// check if in cache, play if ready
	if ($videoEl.readyState > 3) {
		if ($videoEl.paused) $videoEl.play();
	}

	$video.on('ended', () => {
		currentIndex += 1;
		swapVideo();
	});
}

function setup() {
	$play = $plays.selectAll('.play').data(playData);

	const $playEnter = $play
		.enter()
		.append('div.play')
		.at('data-shortcode', d => d.shortcode);

	$playEnter.append('p.title').text(d => d.display_title);
	const $info = $playEnter.append('div.info');
	$info.append('p.info__views').text(d => `${d.display_views} views`);
	// $info.append('p.info__score').text(d => `${formatComma(d.score)} upvotes`);
	$info.append('p.info__comments').text(d => `${d.display_comments} comments`);
	$info.append('p.info__date').text(d => `${d.display_date}`);

	$play = $playEnter.merge($play);
	swapVideo();
}

function init() {
	// add mobile class to body tag
	$body.classed('is-mobile', isMobile.any());
	// setup resize event
	window.addEventListener('resize', debounce(resize, 150));
	// kick off graphic code
	loadData()
		.then(data => {
			playData = data;
			setup();
			resize();
		})
		.catch(console.error);
}

init();

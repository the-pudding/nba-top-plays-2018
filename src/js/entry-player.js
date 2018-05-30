// D3 is included by globally by default
import debounce from 'lodash.debounce';
import isMobile from './utils/is-mobile';
import loadImage from './utils/load-image';
import loadData from './load-data';

let playData = null;
let currentIndex = 0;
let playWidth = 0;
const imageCache = {};

const $body = d3.select('body');
const $content = $body.select('#content');
const $media = $body.select('#media');
const $plays = $body.select('#plays');
const $video = $media.select('video');
const $videoEl = $video.node();
const $progress = $media.select('.progress-bar');

let $play = null;

function prefix(prop) {
	return [prop, `webkit-${prop}`, `ms-${prop}`];
}

function resize() {
	const width = $body.node().offsetWidth;
	const height = window.innerHeight;

	$content.st({ width, height });
	$media.st({ height });
}

function movePlays() {
	const offX = -playWidth * currentIndex;
	const prefixes = prefix('transform');
	prefixes.forEach(p => {
		const transform = `translate(${offX}px, 0)`;
		$plays.node().style[p] = transform;
	});

	$play.classed('is-active', (d, i) => i === currentIndex);
}

function handleVideoEnded() {
	console.log('ended');
	currentIndex += 1;
	advance();
}

function preloadNext() {
	const nextIndex = currentIndex + 1;
	if (nextIndex >= playData.length) return false;

	const { shortcode } = playData[nextIndex];
	if (imageCache[shortcode]) return false;

	loadImage(`assets/poster/${shortcode}.jpg`, err => {
		if (err) console.error(err);
		else imageCache[shortcode] = true;
	});
}

function playVideo() {
	if ($videoEl.paused) {
		// $videoEl.play();
		setTimeout(() => $videoEl.play(), 3000);
		preloadNext();
	}
}

function handleTimeUpdate() {
	const { currentTime, duration } = $videoEl;
	const progress = currentTime / duration;
	const percent = d3.format('%')(progress);
	$progress.st('width', percent);
}

function advance() {
	movePlays();

	const { shortcode } = playData[currentIndex];

	$video.at('src', `assets/video/${shortcode}.mp4`);
	$video.at('poster', 'assets/img/poster.png');
	$video.st('background-image', `url(assets/poster/${shortcode}.jpg`);

	$videoEl.load();

	$video.on('canplaythrough', playVideo);

	// check if it is in cache
	if ($videoEl.readyState > 3) playVideo();

	$video.on('ended', handleVideoEnded);

	$video.on('timeupdate', handleTimeUpdate);
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
	$info.append('p.info__comments').text(d => `${d.display_comments} comments`);
	$info.append('p.info__date').text(d => `${d.display_date}`);

	$play = $playEnter.merge($play);

	playWidth = $play.node().offsetWidth;

	advance();
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

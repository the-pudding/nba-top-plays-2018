// D3 is included by globally by default
import debounce from 'lodash.debounce';
import isMobile from './utils/is-mobile';
import loadImage from './utils/load-image';
import enterView from 'enter-view';

const ASPECT = 16 / 9;
const REM = 16;
const PLAY_HEIGHT = REM * 8;

let rawData = null;
let playlistData = null;
let previousWidth = 0;
let currentIndex = 0;

const $body = d3.select('body');
const $plays = $body.select('#plays');
const $video = $body.select('video');
const $videoEl = $video.node();
let $play = null;

function prefix(prop) {
	return [prop, `webkit-${prop}`, `ms-${prop}`];
}

function formatNum(num) {
	return d3.format('.3s')(num);
}

function formatComma(num) {
	return d3.format(',.1s')(num);
}

function resize() {
	const width = $body.node().offsetWidth;
	if (previousWidth !== width) {
		previousWidth = width;
		// const w = $plays.select('.play').node().offsetWidth;
		// const h = Math.floor(w / ASPECT);
		// $plays.selectAll('.play').st('height', h);
	}
}

function cleanData(data) {
	return data.map(d => ({
		...d,
		score: +d.score,
		play: d.play === 'TRUE',
		num_comments: +d.num_comments,
		views: +d.views,
		week: +d.week
	}));
}

function refine() {
	const plays = rawData.filter(d => d.play);

	const nested = d3
		.nest()
		.key(d => d.week)
		.rollup(v => v.slice(0, 3))
		.entries(plays)
		.map(d => d.value);
	const flattened = [].concat(...nested);
	return flattened;
}

function swapVideo() {
	const offY = -PLAY_HEIGHT * currentIndex;
	const prefixes = prefix('transform');
	prefixes.forEach(pre => {
		const transform = `translate(0, ${offY}px)`;
		$plays.node().style[pre] = transform;
	});

	$play.classed('is-active', (d, i) => i === currentIndex);
	const d = playlistData[currentIndex];
	$videoEl.src = `assets/video/${d.created_utc}-${d.shortcode}.mp4`;
	$videoEl.load();
	$video.on('canplaythrough', () => {
		console.log('a', $videoEl.paused);
		if ($videoEl.paused) $videoEl.play();
	});
	// check if in cache
	if ($videoEl.readyState > 3) {
		console.log('b', $videoEl.paused);
		if ($videoEl.paused) $videoEl.play();
	}

	$video.on('ended', () => {
		currentIndex += 1;
		swapVideo();
	});
}

function setup() {
	playlistData = refine();

	$play = $plays.selectAll('.play').data(playlistData);

	const $playEnter = $play
		.enter()
		.append('div.play')
		.at('data-shortcode', d => d.shortcode);

	$playEnter.append('p.title').text(d => d.title);
	const $info = $playEnter.append('div.info');
	$info.append('p.info__views').text(d => `${formatNum(d.views)} views`);
	$info.append('p.info__score').text(d => `${formatComma(d.score)} upvotes`);
	$info
		.append('p.info__comments')
		.text(d => `${formatComma(d.num_comments)} comments`);

	$play = $playEnter.merge($play);
	swapVideo();

	// enterView({
	// 	selector: '.play',
	// 	offset: 0.5,
	// 	enter: el => {
	// 		const s = d3.select(el).at('data-shortcode');
	// 		swapVideo(s);
	// 	}
	// });
}

function init() {
	// add mobile class to body tag
	$body.classed('is-mobile', isMobile.any());
	// setup resize event
	window.addEventListener('resize', debounce(resize, 150));
	// kick off graphic code
	d3.loadData('assets/data/web.csv', (err, response) => {
		rawData = cleanData(response[0]);
		setup();
		resize();
	});
}

init();

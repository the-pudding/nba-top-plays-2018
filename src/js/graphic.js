import LoadData from './load-data';
import Youtube from './youtube';

const REM = 16;
const PLAY_WIDTH = REM * 20;
const PLAY_HEIGHT = REM * 8;

let playData = [];
let currentIndex = -1;

const $content = d3.select('#content');
const $plays = d3.select('#plays');
let $play = null;

function prefix(prop) {
	return [prop, `webkit-${prop}`, `ms-${prop}`];
}

function resize() {
	const width = d3.select('body').node().offsetWidth;
	$content.st({ width });
	Youtube.resize();
}

function findCurrentPlay(t) {
	const filtered = playData.filter(d => d.offset_chron < t);
	if (filtered.length) return filtered.pop();
	return null;
}

function progress() {
	const t = Youtube.getCurrentTime();
	const currentPlay = findCurrentPlay(t);
	if (currentPlay) {
		const { rank_chron } = currentPlay;
		if (rank_chron !== currentIndex) {
			currentIndex = rank_chron;

			const offX = -PLAY_WIDTH * currentIndex;

			const prefixes = prefix('transform');
			prefixes.forEach(pre => {
				const transform = `translate(${offX}px, 0)`;
				$plays.node().style[pre] = transform;
			});

			$play.classed('is-active', (d, i) => i === currentIndex);
		}
	}

	window.requestAnimationFrame(progress);
}

function setupPlays() {
	$play = $plays.selectAll('.play').data(playData);

	const $playEnter = $play
		.enter()
		.append('div.play')
		.at('data-shortcode', d => d.shortcode);

	$playEnter.append('p.title').text(d => d.display_title);
	const $info = $playEnter.append('div.info');
	$info.append('p.info__views').text(d => `${d.display_views} views`);
	// $info.append('p.info__comments').text(d => `${d.display_comments} comments`);
	$info.append('p.info__date').text(d => `${d.display_date}`);

	$play = $playEnter.merge($play);
}

function setup(data) {
	playData = data;
	setupPlays();
	Youtube.setup();
	progress();
	resize();
}

function init() {
	Youtube.init()
		.then(LoadData)
		.then(setup);
}

export default { init, resize };

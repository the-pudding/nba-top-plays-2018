import LoadData from './load-data';
import Youtube from './youtube';

const REM = 16;
const PLAY_WIDTH = REM * 20;

let playData = [];
let currentIndex = -1;
let prop = 'chron';

const $body = d3.select('body');
const $content = d3.select('#content');
const $plays = d3.select('#plays');
const $btn = $content.selectAll('.toggle .btn');
let $play = null;

function prefix(p) {
	return [p, `webkit-${p}`, `ms-${p}`];
}

function resize() {
	const width = $body.node().offsetWidth;
	$content.st({ width });
	Youtube.resize();
}

function findCurrentPlay(t) {
	const filtered = playData.filter(d => d[`offset_${prop}`] < t);
	if (filtered.length) return filtered.pop();
	return null;
}

function progress() {
	const t = Youtube.getCurrentTime();
	const currentPlay = findCurrentPlay(t);
	if (currentPlay) {
		const rank = currentPlay[`rank_${prop}`];
		if (rank !== currentIndex) {
			currentIndex = rank;

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
	const prefixes = prefix('transform');
	prefixes.forEach(pre => {
		$plays.node().style[pre] = 'translate(0, 0)';
	});

	if ($play) $play.remove();

	playData.sort((a, b) => {
		if (prop === 'chron') return d3.ascending(a.created_utc, b.created_utc);
		return d3.descending(a.views, b.views);
	});

	$play = $plays.selectAll('.play').data(playData);

	const $playEnter = $play
		.enter()
		.append('div.play')
		.at('data-shortcode', d => d.shortcode);

	const $info = $playEnter.append('div.info');
	$info.append('p.info__views').text(d => `${d.display_views} views`);
	$info.append('p.info__date').text(d => `${d.display_date}`);
	const $title = $playEnter.append('p.title');
	$title
		.append('a')
		.text(d => d.display_title)
		.at('href', d => `https://reddit.com/r/nba/${d.id}`)
		.at('target', '_blank');

	$play = $playEnter.merge($play);
}

function handleToggle() {
	const $sel = d3.select(this);
	$btn.classed('is-active', false);
	$sel.classed('is-active', true);
	const id = $sel.at('data-id');
	prop = $sel.at('data-prop');
	currentIndex = -1;
	setupPlays();
	Youtube.loadVideo(id);
}

function setupToggle() {
	$btn.on('click', handleToggle);
}

function setup(data) {
	playData = data;
	setupPlays();
	setupToggle();
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

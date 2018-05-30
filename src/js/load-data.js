function formatNum(num) {
	return d3.format('.3s')(num);
}

function formatComma(num) {
	return d3.format(',.1s')(num);
}

function formatDate(timestamp) {
	const d = new Date(timestamp * 1000);
	return d.toString().substring(4, 15);
}

function refine(data) {
	data.sort((a, b) => d3.ascending(a.created_utc, b.created_utc));
	return data;
}

function getOffset(data, index) {
	const trans = 0.5 * 2;
	const sub = index * trans;
	const sum = d3.sum(data.filter((d, i) => i < index).map(d => d.duration));
	return Math.max(0, sum - sub);
}

function cleanData(data) {
	const clean = data.map((d, i) => ({
		...d,
		rank_chron: i,
		score: +d.score,
		num_comments: +d.num_comments,
		views: +d.views,
		created_utc: +d.created_utc,
		duration: +d.duration,
		player: d.player
			.split(',')
			.map(v => v.trim())
			.filter(v => v),
		tag: d.tag
			.split(',')
			.map(v => v.trim())
			.filter(v => v),
		display_score: formatNum(+d.score),
		display_comments: formatNum(+d.num_comments),
		display_views: formatComma(+d.views),
		display_date: formatDate(+d.created_utc),
		display_title: d.custom_title || d.title
	}));

	const withOffsetChron = clean.map(d => ({
		...d,
		offset_chron: getOffset(clean, d.rank_chron)
	}));

	withOffsetChron.sort((a, b) => d3.descending(a.views, b.views));

	const withRankViews = withOffsetChron.map((d, i) => ({
		...d,
		rank_views: i
	}));

	const withOffset = withRankViews.map(d => ({
		...d,
		offset_views: getOffset(withRankViews, d.rank_views)
	}));
	window.out = JSON.stringify(withOffset, null, 2)
	return withOffset;
}

export default function loadData() {
	return new Promise((resolve, reject) => {
		d3.loadData('assets/data/web.csv', (err, response) => {
			if (err) reject(err);
			const cleaned = cleanData(response[0]);
			const refined = refine(cleaned);
			resolve(refined);
		});
	});
}

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
	const plays = data.filter(d => d.play && !d.not);
	const nested = d3
		.nest()
		.key(d => d.week)
		.entries(plays)
		.map(d => d.values);
	const flattened = [].concat(...nested);
	flattened.sort((a, b) => d3.ascending(a.created_utc, b.created_utc));

	// plays.sort((a, b) => d3.descending(a.views, b.views));
	// const s = plays.filter(d => d.views >= 250000);

	// const nested2 = d3
	// 	.nest()
	// 	.key(d => d.week)
	// 	.rollup(v => v)
	// 	.entries(s)
	// 	.map(d => d.value);
	// const flattened2 = [].concat(...nested2);
	// flattened2.sort((a, b) => d3.ascending(a.created_utc, b.created_utc));

	// console.table(flattened);
	// console.table(flattened2);
	return flattened;
}

function cleanData(data) {
	return data.map(d => ({
		...d,
		score: +d.score,
		num_comments: +d.num_comments,
		views: +d.views,
		week: +d.week,
		created_utc: +d.created_utc,
		play: d.play === 'TRUE',
		not: d.not === 'TRUE',
		display_score: formatNum(+d.score),
		display_comments: formatNum(+d.num_comments),
		display_views: formatComma(+d.views),
		display_date: formatDate(+d.created_utc),
		display_title: d.custom_title || d.title
	}));
}

export default function loadData() {
	return new Promise((resolve, reject) => {
		d3.loadData('assets/data/web.csv', (err, response) => {
			if (err) reject(err);
			const cleaned = cleanData(response[0]);
			const refined = refine(cleaned);
			// console.table(refined);
			resolve(refined);
		});
	});
}

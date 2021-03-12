const margin = { t: 50, r: 50, b: 50, l: 50 };
const size = { w: 800, h: 700 };
const svg = d3.select("svg");

svg.attr("width", size.w).attr("height", size.h);

const containerG = svg.append("g").classed("container", true);

d3.csv("data/airbnb-reduced.csv").then(function (data) {
	data.forEach(parseData);
	console.log(data);

	const colorScale = d3.scaleOrdinal(d3.schemeCategory10.reverse());

	const xScale = d3
		.scaleLinear()
		.domain(d3.extent(data, (d) => d.price))
		.range([margin.l, size.w - margin.r]);

	const yStrengthScale = d3
		.scaleLinear()
		.domain(d3.extent(data, (d) => d.price))
		.range([0.03, 0.5]);

	const roomTypes = ["Entire home/apt", "Private room", "Shared room"];
	const legendColors = ["#00bed1", "#bcbe00", "#7f7f7f"];
	containerG
		.append("text")
		.attr("x", size.w - 205)
		.attr("y", 80)
		.text("Room types");
	roomTypes.forEach((e, i) => {
		containerG
			.append("circle")
			.attr("cx", size.w - 200)
			.attr("cy", 100 + i * 20)
			.attr("r", 5)
			.attr("stroke", "white")
			.attr("stroke-width", 1)
			.attr("fill", legendColors[i]);
		containerG
			.append("text")
			.classed("legend", true)
			.attr("x", size.w - 190)
			.attr("y", 105 + i * 20)
			.text(e);
	});

	const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("$,"));
	const xAxisG = containerG
		.append("g")
		.attr("transform", `translate(0, ${size.h - margin.b})`)
		.call(xAxis);
	const xAxisLabel = containerG
		.append("text")
		.classed("axis-label", true)
		.attr("x", size.w / 2)
		.attr("y", size.h - 10)
		.text("Airbnb room price");

	let simulation = d3
		.forceSimulation(data)
		.force("collide", d3.forceCollide().radius(3.5).strength(0.7))
		.force(
			"x",
			d3
				.forceX()
				.x((d) => xScale(d.price))
				.strength(5)
		)
		.force(
			"y",
			d3
				.forceY()
				.y(size.h / 2)
				.strength((d) => yStrengthScale(d.price))
		);

	let nodes = containerG
		.append("g")
		.attr("stroke", "white")
		.attr("stroke-width", 1)
		.selectAll("circle")
		.data(data)
		.join("circle")
		.attr("cx", (d) => xScale(d.price))
		.attr("cy", size.h / 2)
		.attr("r", 5)
		.attr("fill", (d) => colorScale(d.room_type))
		.attr("fill-opacity", 0.8)
		.call(drag(simulation));

	simulation.on("tick", () => {
		console.log("ticked!");
		nodes.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
	});
});

function parseData(d) {
	d.bedrooms = +d.bedrooms;
	d.overall_sa = +d.overall_sa;
	d.price = +d.price;
	d.reviews = +d.reviews;
}

function drag(simulation) {
	function dragstarted(event) {
		if (!event.active) simulation.alphaTarget(0.3).restart();
		event.subject.fx = event.subject.x;
		event.subject.fy = event.subject.y;
	}

	function dragged(event) {
		event.subject.fx = event.x;
		event.subject.fy = event.y;
	}

	function dragended(event) {
		if (!event.active) simulation.alphaTarget(0);
		event.subject.fx = null;
		event.subject.fy = null;
	}

	return d3
		.drag()
		.on("start", dragstarted)
		.on("drag", dragged)
		.on("end", dragended);
}

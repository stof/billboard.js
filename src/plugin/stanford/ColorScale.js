/**
 * Copyright (c) 2017 ~ present NAVER Corp.
 * billboard.js project is licensed under the MIT license
 */
import {range as d3Range} from "d3-array";
import {axisRight as d3AxisRight} from "d3-axis";
import {format as d3Format} from "d3-format";
import {scaleSequential as d3ScaleSequential, scaleLog as d3ScaleLog} from "d3-scale";
import CLASS from "./classes";
import {isFunction} from "../../internals/util";

/**
 * Stanford diagram plugin color scale class
 * @class ColorScale
 * @param {Stanford} owner Stanford instance
 * @private
 */
export default class ColorScale {
	constructor(owner) {
		this.owner = owner;
	}

	drawColorScale() {
		const $$ = this.owner.$$;
		const config = this.owner.config;
		const target = $$.data.targets[0];
		const height = $$.height - config.padding_bottom - config.padding_top;
		const barWidth = config.scale_width;
		const barHeight = 5;
		const points = d3Range(config.padding_bottom, height, barHeight);

		const inverseScale = d3ScaleSequential(target.colors)
			.domain([points[points.length - 1], points[0]]);

		if (this.colorScale) {
			this.colorScale.remove();
		}

		this.colorScale = $$.svg.append("g")
			.attr("width", 50)
			.attr("height", height)
			.attr("class", CLASS.colorScale);

		this.colorScale.append("g")
			.attr("transform", `translate(0, ${config.padding_top})`)
			.selectAll("bars")
			.data(points)
			.enter()
			.append("rect")
			.attr("y", (d, i) => i * barHeight)
			.attr("x", 0)
			.attr("width", barWidth)
			.attr("height", barHeight)
			.attr("fill", d => inverseScale(d));

		// Legend Axis
		const axisScale = d3ScaleLog()
			.domain([target.minEpochs, target.maxEpochs])
			.range([
				points[0] + config.padding_top + points[points.length - 1] + barHeight - 1,
				points[0] + config.padding_top
			]);

		const legendAxis = d3AxisRight(axisScale);
		const scaleFormat = config.scale_format;

		if (scaleFormat === "pow10") {
			legendAxis.tickValues([1, 10, 100, 1000, 10000, 100000, 1000000, 10000000]);
		} else if (isFunction(scaleFormat)) {
			legendAxis.tickFormat(scaleFormat);
		} else {
			legendAxis.tickFormat(d3Format("d"));
		}

		// Draw Axis
		const axis = this.colorScale.append("g")
			.attr("class", "legend axis")
			.attr("transform", `translate(${barWidth},0)`)
			.call(legendAxis);

		if (scaleFormat === "pow10") {
			axis.selectAll(".tick text")
				.text(null)
				.filter(d => d / Math.pow(10, Math.ceil(Math.log(d) / Math.LN10 - 1e-12)) === 1) // Power of Ten
				.text(10)
				.append("tspan")
				.attr("dy", "-.7em") // https://bl.ocks.org/mbostock/6738229
				.text(d => Math.round(Math.log(d) / Math.LN10));
		}

		this.colorScale.attr("transform", `translate(${$$.currentWidth - this.xForColorScale()}, 0)`);
	}

	xForColorScale() {
		return this.owner.config.padding_right +
			this.colorScale.node().getBBox().width;
	}

	getColorScalePadding() {
		return this.xForColorScale() + this.owner.config.padding_left + 20;
	}
}

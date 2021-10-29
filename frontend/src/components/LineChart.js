import { useEffect, useRef } from "react";
import * as d3 from 'd3'

const LineChart = (props) => {
    const ref = useRef();
    const colors = [
        "#000001",
        "#ffcc00",
        "#129384",
        "#880099",
        "#69fa23",
        "#e93524",
        "#00e5ff",
        "#8866aa",
        "#225511",
        "#55ff66"
    ];
    useEffect(() => {
        if (props.stale || !props.hist) {
            return;
        }
        const svg = d3.select(ref.current);
        const data = Array.from(Array(props.data.length).keys()).map((i) => {
            return [i + 1, ...props.data[i]];
        });
        svg.selectAll("*").remove();
        svg.attr("width", 700)
            .attr("height", 260);
        const x = d3.scaleLinear()
            .domain([1, props.data.length])
            .range([30, 530]);
        const y = d3.scaleLinear()
            .domain([0, 1])
            .range([230, 30]);
        svg.append("g")
            .attr("transform", "translate(0, 230)")
            .call(d3.axisBottom(x));
        svg.append("g")
            .attr("transform", "translate(30,0)")
            .call(d3.axisLeft(y)
                .ticks(10)
                .tickValues(d3.range(0, 1.1, 0.1))
                .tickFormat(d3.format(".1f")));
        for (let i = 0; i < props.data[0].length; ++i) {
            svg.append("circle")
                .attr("cx", 540)
                .attr("cy", 30 + i * 10)
                .attr("r", 3)
                .attr("fill", colors[i]);
            svg.append("text")
                .attr("x", 560)
                .attr("y", 30 + i * 10)
                .text(`State ${i}`)
                .style("font-size", "12px")
                .attr("alignment-baseline","middle");
            svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "#69b3a2")
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .x((item) => x(item[0]))
                    .y((item) => y(item[i + 1]))
                );
            svg.append("g")
                .selectAll("dot")
                .data(data)
                .enter()
                .append("circle")
                    .attr("cx", (item) => x(item[0]))
                    .attr("cy", (item) => y(item[i + 1]))
                    .attr("fill", colors[i])
                    .attr("r", 3);
        }

    });
    if (props.stale || !props.hist) {
        return "";
    }
    return (
        <svg
            ref={ref}
        />
    );
}
export default LineChart;

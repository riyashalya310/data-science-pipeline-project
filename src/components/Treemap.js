// src/components/TreemapChart.js
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const TreemapChart = ({ data }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (data && data.length > 0) {
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove(); // Clear previous content

      const width = svgRef.current.clientWidth;
      const height = svgRef.current.clientHeight;

      const root = d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);

      d3.treemap()
        .size([width, height])
        .padding(1)(root);

      const color = d3.scaleOrdinal(d3.schemeCategory10);

      svg.selectAll('rect')
        .data(root.leaves())
        .enter()
        .append('rect')
        .attr('x', d => d.x0)
        .attr('y', d => d.y0)
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .style('fill', d => color(d.data.name));

      svg.selectAll('text')
        .data(root.leaves())
        .enter()
        .append('text')
        .attr('x', d => d.x0 + 5)
        .attr('y', d => d.y0 + 15)
        .text(d => d.data.name)
        .attr('font-size', '12px')
        .attr('fill', '#fff');
    }
  }, [data]);

  return <svg ref={svgRef} width="100%" height="500px"></svg>;
};

export default TreemapChart;

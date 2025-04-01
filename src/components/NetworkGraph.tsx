import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useSelector } from "react-redux";

// Define types for Node and Link
interface Node {
  id: string;
  value: number;
  label: string;
  to: number | null;
  from: number | null;
  x?: number;
  y?: number;
  children?: Node[];
}

interface Link {
  source: Node;
  target: Node;
}

const NetworkGraph = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const dataStructure = useSelector(
    (state: any) => state.algorithm.dataStructure
  );
  const nodes: Node[] =
    dataStructure[0]?.nodes.map((node: Node) => ({ ...node })) || [];

  const rootNode = nodes.find((n) => n.from === null);
  if (!rootNode) {
    console.error("No root node found (from: null)");
    return null;
  }

  const nodeIds = new Set(nodes.map((n) => n.id));
  const invalidNodes = nodes.filter(
    (n) => n.from !== null && !nodeIds.has(String(n.from))
  );
  if (invalidNodes.length > 0) {
    console.error("Invalid 'from' references found:", invalidNodes);
    return null;
  }

  const stratify = d3
    .stratify<Node>()
    .id((d) => d.id)
    .parentId((d) => (d.from === null ? null : String(d.from)));

  let treeData;
  try {
    treeData = stratify(nodes);
  } catch (error) {
    console.error("Stratify failed:", error);
    return null;
  }

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = svg.node()?.getBoundingClientRect().width || 0;
    const height = svg.node()?.getBoundingClientRect().height || 0;

    svg.selectAll("*").remove();

    // Create the tree layout with dynamic size
    const treeLayout = d3.tree<Node>().size([width, height - 100]);
    const treeNodes = treeLayout(treeData);

    // Calculate bounds to fit the tree, including node sizes and labels
    const nodeRadius = (d: d3.HierarchyPointNode<Node>) => d.data.value * 5;
    const labelWidthEstimate = 80;
    const labelHeightEstimate = 20;
    const bounds = treeNodes.descendants().reduce(
      (acc, d) => {
        const r = nodeRadius(d);
        const x = d.x || 0;
        const y = d.y || 0;
        return {
          minX: Math.min(acc.minX, x - r - labelWidthEstimate),
          maxX: Math.max(acc.maxX, x + r + labelWidthEstimate),
          minY: Math.min(acc.minY, y - r - labelHeightEstimate),
          maxY: Math.max(acc.maxY, y + r + labelHeightEstimate),
        };
      },
      { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
    );

    const treeWidth = bounds.maxX - bounds.minX;
    const treeHeight = bounds.maxY - bounds.minY;

    // Calculate initial zoom to fit the tree
    const padding = 50;
    const topOffset = 30;
    const scaleX = (width - 2 * padding) / treeWidth;
    const scaleY = (height - 2 * padding) / treeHeight;
    const scale = Math.min(scaleX, scaleY) * 0.9;
    const translateX = (width - treeWidth * scale) / 2 - bounds.minX * scale;
    const translateY = padding - bounds.minY * scale + topOffset;

    const g = svg.append("g");

    // Apply initial zoom transform
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg
      .call(zoom)
      .call(
        zoom.transform,
        d3.zoomIdentity.translate(translateX, translateY).scale(scale)
      );

    // Create links
    const links = treeNodes.links();
    const link = g
      .selectAll(".link")
      .data(links)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", (d) => {
        const sx = d.source.x || 0;
        const sy = d.source.y || 0;
        const tx = d.target.x || 0;
        const ty = d.target.y || 0;
        return `M${sx},${sy} L${tx},${ty}`;
      })
      .attr("stroke", "#999")
      .attr("stroke-width", 2)
      .attr("fill", "none");

    // Create nodes
    const node = g
      .selectAll(".node")
      .data(treeNodes.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.x || 0},${d.y || 0})`)
      .call(
        d3
          .drag<SVGGElement, d3.HierarchyPointNode<Node>>()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    node
      .append("circle")
      .attr("r", (d) => 10)
      .attr("fill", "#69b3a2")
      .on("mouseover", function (event: MouseEvent, d) {
        d3.select(this).attr("fill", "#ff5722");
        tooltip.style("visibility", "visible").text(d.data.label);
      })
      .on("mousemove", function (event: MouseEvent) {
        tooltip
          .style("top", event.pageY - 10 + "px")
          .style("left", event.pageX + 10 + "px");
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill", "#69b3a2");
        tooltip.style("visibility", "hidden");
      });

    node
      .append("text")
      .attr("dx", 0) // Center horizontally
      .attr("dy", ".35em") // Center vertically (slight adjustment)
      .attr("text-anchor", "middle") // Ensure text is centered
      .text((d) => d.data.value) // Show only the number (e.g., "1" instead of "Node 1")
      .style("font-size", () => `12px`) // Scale font size with node radius
      .style("fill", "white") // White text for contrast
      .style("pointer-events", "none"); // Prevent text from interfering with drag/tooltip

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "#fff")
      .style("border", "1px solid #ccc")
      .style("padding", "5px");

    return () => {
      svg.selectAll("*").remove();
      tooltip.remove();
    };
  }, [nodes]);

  return <svg ref={svgRef} width="100%" height="100vh" />;
};

// Drag functions
function dragstarted(event: any, d: d3.HierarchyPointNode<Node>) {
  d3.select(this).raise().attr("stroke", "black");
}

function dragged(event: any, d: d3.HierarchyPointNode<Node>) {
  const width = window.innerWidth * 0.8;
  const height = (window.innerHeight - 100) * 0.8;
  d.x = Math.max(20, Math.min(width - 20, event.x));
  d.y = Math.max(20, Math.min(height - 20, event.y));
  d3.select(this).attr("transform", `translate(${d.x},${d.y})`);

  d3.selectAll(".link")
    .filter((l: any) => l.source.data === d.data || l.target.data === d.data)
    .attr("d", (l: any) => {
      const sx = l.source.data === d.data ? d.x : l.source.x || 0;
      const sy = l.source.data === d.data ? d.y : l.source.y || 0;
      const tx = l.target.data === d.data ? d.x : l.target.x || 0;
      const ty = l.target.data === d.data ? d.y : l.target.y || 0;
      return `M${sx},${sy} L${tx},${ty}`;
    });
}

function dragended(event: any, d: d3.HierarchyPointNode<Node>) {
  d3.select(this).attr("stroke", null);
}

export default NetworkGraph;

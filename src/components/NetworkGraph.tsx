import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { useSelector, useDispatch } from "react-redux";
import {
  nextStep,
  previousStep,
  setPlaying,
  resetAnimation,
  setSearchTarget,
} from "../store";
import { Node } from "../types";
const NetworkGraph = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dispatch = useDispatch();

  const dataStructure = useSelector(
    (state: {
      algorithm: {
        dataStructure: {
          nodes: Node[];
        }[];
      };
    }) => state.algorithm.dataStructure
  );
  const nodes: Node[] = useMemo(
    () =>
      dataStructure[0]?.nodes
        ? JSON.parse(JSON.stringify(dataStructure[0].nodes))
        : [],
    [dataStructure]
  );

  const { animationSteps, currentStepIndex, isPlaying, animationSpeed } =
    useSelector(
      (state: {
        animation: {
          animationSteps: {
            currentNode: Node;
            remainingNodes: Node[];
            searchTarget: number;
          }[];
          currentStepIndex: number;
          isPlaying: boolean;
          animationSpeed: number;
        };
      }) => state.animation
    );

  const [comparisonMessage, setComparisonMessage] = useState<string>("");

  const rootNode = nodes.find((n) => n.from === null);
  if (!rootNode) {
    console.error("No root node found (from: null)");
  }

  const nodeIds = new Set(nodes.map((n) => n.id));
  const invalidNodes = nodes.filter(
    (n) => n.from !== null && !nodeIds.has(String(n.from))
  );
  if (invalidNodes.length > 0) {
    console.error("Invalid 'from' references found:", invalidNodes);
  }

  const stratify = d3
    .stratify<Node>()
    .id((d) => d.id)
    .parentId((d) => (d.from === null ? null : String(d.from)));

  let hierarchyData: d3.HierarchyNode<Node> | null = null;
  try {
    hierarchyData = stratify(nodes);
  } catch (error) {
    console.error("Stratify failed:", error);
  }

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isPlaying && currentStepIndex < animationSteps.length - 1) {
      timer = setTimeout(() => {
        dispatch(nextStep());
      }, animationSpeed);
    } else if (isPlaying && currentStepIndex === animationSteps.length - 1) {
      dispatch(setPlaying(false));
    }
    return () => clearTimeout(timer);
  }, [
    isPlaying,
    currentStepIndex,
    animationSteps.length,
    animationSpeed,
    dispatch,
  ]);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = svg.node()?.getBoundingClientRect().width || 0;
    const height = svg.node()?.getBoundingClientRect().height || 0;

    svg.selectAll("*").remove();

    const nodeSpacingX = 60;
    const nodeSpacingY = 80;
    const treeLayout = d3.tree<Node>().nodeSize([nodeSpacingX, nodeSpacingY]);
    //@ts-expect-error will take this up in the future
    const treeNodes = treeLayout(hierarchyData);

    const nodeRadius = 10;
    const bounds = treeNodes.descendants().reduce(
      (acc, d) => {
        const r = nodeRadius;
        const x = d.x || 0;
        const y = d.y || 0;
        return {
          minX: Math.min(acc.minX, x - r),
          maxX: Math.max(acc.maxX, x + r),
          minY: Math.min(acc.minY, y - r),
          maxY: Math.max(acc.maxY, y + r),
        };
      },
      { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
    );

    const treeWidth = bounds.maxX - bounds.minX;
    const treeHeight = bounds.maxY - bounds.minY;

    const padding = 50;
    const topOffset = 30;
    const scaleX = (width - 2 * padding) / treeWidth;
    const scaleY = (height - 2 * padding) / treeHeight;
    const scale = Math.min(scaleX, scaleY) * 0.9;
    const translateX = (width - treeWidth * scale) / 2 - bounds.minX * scale;
    const translateY = padding - bounds.minY * scale + topOffset;

    const g = svg.append("g");

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

    const links = treeNodes.links();
    g.selectAll(".link")
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
      .attr("stroke", (d) => {
        if (currentStepIndex === -1) return "#999";
        const step = animationSteps[currentStepIndex];
        if (!step) return "#999";
        const { remainingNodes } = step;
        const sourceId = d.source.data.id;
        const targetId = d.target.data.id;
        const sourceInPath = remainingNodes.some(
          (n: Node) => n.id === sourceId
        );
        const targetInPath = remainingNodes.some(
          (n: Node) => n.id === targetId
        );
        return sourceInPath && targetInPath ? "#4caf50" : "#999";
      })
      .attr("stroke-width", 2)
      .attr("fill", "none");

    const node = g
      .selectAll(".node")
      .data(treeNodes.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.x || 0},${d.y || 0})`);

    let startPos: { x: number; y: number } | null = null;
    const clickThreshold = 5;

    node
      .append("circle")
      .attr("r", nodeRadius)
      .attr("fill", (d) => {
        if (currentStepIndex === -1) return "#69b3a2";
        const step = animationSteps[currentStepIndex];
        if (!step) return "#69b3a2";
        const { currentNode, remainingNodes } = step;
        if (currentNode && d.data.id === currentNode.id) return "#ff5722";
        if (remainingNodes.some((n: Node) => n.id === d.data.id))
          return "#4caf50";
        return "#d3d3d3";
      })
      .on("mousedown", (event: MouseEvent) => {
        startPos = { x: event.x, y: event.y };
      })
      .on("mouseup", (event: MouseEvent, d) => {
        if (startPos) {
          const dx = Math.abs(event.x - startPos.x);
          const dy = Math.abs(event.y - startPos.y);
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < clickThreshold) {
            dispatch(setSearchTarget(d.data.value));
            console.log(`Set search target to: ${d.data.value}`);
          }
        }
        startPos = null;
      })
      .on("click", (_, d) => {
        dispatch(setSearchTarget(d.data.value));
        console.log(`Set search target to: ${d.data.value}`);
      })
      .on("mouseover", function (_, d) {
        d3.select(this).attr("fill", "#ff5722");
        tooltip.style("visibility", "visible").text(d.data.label);
      })
      .on("mousemove", function (event: MouseEvent) {
        tooltip
          .style("top", event.pageY - 10 + "px")
          .style("left", event.pageX + 10 + "px");
      })
      .on("mouseout", function (_, d) {
        if (currentStepIndex === -1) {
          d3.select(this).attr("fill", "#69b3a2");
        } else {
          const step = animationSteps[currentStepIndex];
          if (!step) {
            d3.select(this).attr("fill", "#69b3a2");
          } else {
            const { currentNode, remainingNodes } = step;
            if (currentNode && d.data.id === currentNode.id) {
              d3.select(this).attr("fill", "#ff5722");
            } else if (remainingNodes.some((n: Node) => n.id === d.data.id)) {
              d3.select(this).attr("fill", "#4caf50");
            } else {
              d3.select(this).attr("fill", "#d3d3d3");
            }
          }
        }
        tooltip.style("visibility", "hidden");
      });

    node
      .append("text")
      .attr("dx", 0)
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .text((d) => d.data.value)
      .style("font-size", "12px")
      .style("fill", "white")
      .style("pointer-events", "none");

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "#fff")
      .style("border", "1px solid #ccc")
      .style("padding", "5px");

    if (currentStepIndex !== -1 && animationSteps[currentStepIndex]) {
      const step = animationSteps[currentStepIndex];
      const { currentNode, searchTarget } = step;
      if (currentNode) {
        if (currentNode.value === searchTarget) {
          setComparisonMessage(`Found: ${searchTarget} = ${currentNode.value}`);
        } else if (searchTarget < currentNode.value) {
          setComparisonMessage(
            `${searchTarget} < ${currentNode.value}: Go left`
          );
        } else {
          setComparisonMessage(
            `${searchTarget} > ${currentNode.value}: Go right`
          );
        }
      } else {
        setComparisonMessage(`Target ${searchTarget} not found`);
      }
    } else {
      setComparisonMessage("");
    }

    return () => {
      svg.selectAll("*").remove();
      tooltip.remove();
    };
  }, [nodes, currentStepIndex, animationSteps, dispatch, hierarchyData]);

  const handlePlayPause = () => {
    dispatch(setPlaying(!isPlaying));
  };

  const handleNext = () => {
    dispatch(nextStep());
    dispatch(setPlaying(false));
  };

  const handlePrevious = () => {
    dispatch(previousStep());
    dispatch(setPlaying(false));
  };

  const handleReset = () => {
    dispatch(resetAnimation());
    setComparisonMessage("");
  };

  return (
    <>
      <svg ref={svgRef} width="100%" height="100vh" />
      <div
        style={{ position: "absolute", bottom: 20, left: 20 }}
        className="flex gap-2"
      >
        <button
          className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={handlePrevious}
          disabled={currentStepIndex <= 0}
        >
          Previous
        </button>
        <button
          className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={handlePlayPause}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={handleNext}
          disabled={currentStepIndex >= animationSteps.length - 1}
        >
          Next
        </button>
        <button
          className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={handleReset}
        >
          Reset
        </button>
        <span style={{ marginLeft: "10px" }}>
          Step: {currentStepIndex + 1} / {animationSteps.length}
        </span>
        <span style={{ marginLeft: "10px" }}>{comparisonMessage}</span>
      </div>
    </>
  );
};

export default NetworkGraph;

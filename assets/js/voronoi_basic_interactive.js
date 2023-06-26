import { SVG } from "https://cdn.skypack.dev/@svgdotjs/svg.js";
import {
  createVoronoiTessellation,
  random,
  createCoordsTransformer
} from "https://cdn.skypack.dev/@georgedoescode/generative-utils";

const width = 196;
const height = 196;

const svg = SVG()
  .viewbox(0, 0, width, height)
  .addTo("body")
  .attr("preserveAspectRatio", "xMidYMid slice");
const transformCoords = createCoordsTransformer(svg.node);

let points = [];

let tessellation;

let relaxIterations = 0;

svg.node.addEventListener("click", (e) => {
  const { x, y } = transformCoords(e);

  points.push({ x, y });

  svg.clear();

  tessellation = createVoronoiTessellation({
    width,
    height,
    points,
    relaxIterations: relaxIterations
  });

  console.log(tessellation);

  render();
});

document.querySelector("input").addEventListener("input", (e) => {
  const value = ~~e.target.value;

  relaxIterations = value;

  svg.clear();

  tessellation = createVoronoiTessellation({
    width,
    height,
    points,
    relaxIterations: relaxIterations
  });

  render();
});

function render() {
  tessellation.cells.forEach((cell, index) => {
    svg
      .polygon(cell.points)
      .fill("none")
      .stroke({
        width: 2,
        color: "#1d1934"
      })
      .attr("vector-effect", "non-scaling-stroke");

    svg
      .circle(4)
      .cx(tessellation.points[index].x)
      .cy(tessellation.points[index].y)
      .fill("#48CB8A");

    svg.circle(2).cx(cell.centroid.x).cy(cell.centroid.y).fill("#F25C54");
  });
}

document.querySelector("button").addEventListener("click", () => {
  svg.clear();
  points = [];
});
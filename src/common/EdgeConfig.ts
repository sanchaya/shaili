import { Edge } from "edge.js";

const edge = Edge.create();
edge.mount(new URL("../frontend/views", import.meta.url));

export default edge;

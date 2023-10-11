import { Edge } from "edge.js";

const edge = Edge.create();
edge.mount("Pages", new URL("../frontend/views", import.meta.url));
edge.mount("Emails", new URL("../backend/templates", import.meta.url));

export default edge;

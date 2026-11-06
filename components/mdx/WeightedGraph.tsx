import {
  displayNodeId,
  edgeSegment,
  GRAPH_DOT,
  GRAPH_HEIGHT,
  GRAPH_NODE_R,
  GRAPH_WIDTH,
  graphPosition,
  isMapStyle,
  parseGraphEdges,
  parseGraphNodes,
} from "@/lib/diagrams/graph";
import styles from "./diagrams.module.css";

export function WeightedGraph({
  nodes,
  edges,
  directed = false,
  path,
  start,
  goal,
  caption,
  height = GRAPH_HEIGHT,
}: {
  nodes: string;
  edges: string;
  directed?: boolean;
  /** Comma-separated node ids along the highlighted path */
  path?: string;
  start?: string;
  goal?: string;
  caption?: string;
  height?: number;
}) {
  const nodeList = parseGraphNodes(nodes);
  const mapStyle = isMapStyle(nodeList);
  const r = mapStyle ? GRAPH_DOT : GRAPH_NODE_R;
  const byId = new Map(nodeList.map((n) => [n.id, n]));
  const pathIds = path ? path.split(",").map((s) => s.trim()) : [];
  const onPath = (a: string, b: string) => {
    for (let i = 0; i < pathIds.length - 1; i++) {
      if ((pathIds[i] === a && pathIds[i + 1] === b) || (!directed && pathIds[i] === b && pathIds[i + 1] === a)) {
        return true;
      }
    }
    return false;
  };
  const markerId = `arrow-${nodeList.map((n) => n.id).join("")}`.slice(0, 40);

  return (
    <figure className={`${styles.diagram} reveal`}>
      <div className={styles.scroll}>
        <svg viewBox={`0 0 ${GRAPH_WIDTH} ${height}`} style={{ minWidth: 480 }} role="img" aria-label={caption ?? "Graph"}>
          {directed ? (
            <defs>
              <marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" className={styles.arrowHead} />
              </marker>
            </defs>
          ) : null}
          {parseGraphEdges(edges).map((edge) => {
            const a = byId.get(edge.from);
            const b = byId.get(edge.to);
            if (!a || !b) throw new Error(`WeightedGraph: unknown node in edge ${edge.from}-${edge.to}`);
            const { x1, y1, x2, y2, mx, my } = edgeSegment(graphPosition(a, height), graphPosition(b, height), r, directed);
            const active = onPath(edge.from, edge.to);
            return (
              <g key={`${edge.from}-${edge.to}`}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  className={active ? styles.edgeActive : styles.edge}
                  markerEnd={directed ? `url(#${markerId})` : undefined}
                />
                {edge.weight ? (
                  <g>
                    <rect x={mx - 15} y={my - 11} width={30} height={22} rx={6} className={active ? styles.weightBgActive : styles.weightBg} />
                    <text x={mx} y={my + 4.5} className={styles.weight}>
                      {edge.weight}
                    </text>
                  </g>
                ) : null}
              </g>
            );
          })}
          {nodeList.map((node) => {
            const { x, y } = graphPosition(node, height);
            const cls =
              node.id === goal
                ? styles.nodeGoal
                : node.id === start
                  ? styles.nodeStart
                  : pathIds.includes(node.id)
                    ? styles.nodeActive
                    : styles.node;
            if (mapStyle) {
              // Name above the dot, unless that would clip the top edge.
              const below = y - 13 < 16;
              return (
                <g key={node.id}>
                  <circle cx={x} cy={y} r={r} className={cls} />
                  <text x={x} y={below ? y + 22 : y - 13} className={styles.mapLabel}>
                    {displayNodeId(node.id)}
                  </text>
                </g>
              );
            }
            return (
              <g key={node.id}>
                <circle cx={x} cy={y} r={r} className={cls} />
                <text x={x} y={y + 5} className={node.id === goal || node.id === start ? styles.labelGoal : styles.label}>
                  {displayNodeId(node.id)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

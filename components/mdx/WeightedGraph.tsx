import styles from "./diagrams.module.css";

type GraphNode = { id: string; x: number; y: number };
type GraphEdge = { from: string; to: string; weight?: string };

/** "S:10,50 A:35,20" → nodes on a 0–100 grid */
function parseNodes(source: string): GraphNode[] {
  return source
    .trim()
    .split(/\s+/)
    .map((token) => {
      const [id, coords] = token.split(":");
      const [x, y] = coords.split(",").map(Number);
      return { id, x, y };
    });
}

/** "S-A:1 S-B:5 A-G" → edges with optional weights */
function parseEdges(source: string): GraphEdge[] {
  return source
    .trim()
    .split(/\s+/)
    .map((token) => {
      const [pair, weight] = token.split(":");
      const [from, to] = pair.split(/->|-/);
      return { from, to, weight };
    });
}

const W = 640;
const H = 340;
const R = 20;
/** Map-style graphs (long city names) draw small dots with the name beside them. */
const DOT = 7;

export function WeightedGraph({
  nodes,
  edges,
  directed = false,
  path,
  start,
  goal,
  caption,
  height = H,
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
  const nodeList = parseNodes(nodes);
  const mapStyle = nodeList.some((n) => n.id.length > 2);
  const r = mapStyle ? DOT : R;
  const display = (id: string) => id.replace(/_/g, " ");
  const byId = new Map(nodeList.map((n) => [n.id, n]));
  const pos = (n: GraphNode) => ({ x: 40 + (n.x / 100) * (W - 80), y: 36 + (n.y / 100) * (height - 72) });
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
    <figure className={styles.diagram}>
      <div className={styles.scroll}>
        <svg viewBox={`0 0 ${W} ${height}`} style={{ minWidth: 480 }} role="img" aria-label={caption ?? "Graph"}>
          {directed ? (
            <defs>
              <marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" className={styles.arrowHead} />
              </marker>
            </defs>
          ) : null}
          {parseEdges(edges).map((edge) => {
            const a = byId.get(edge.from);
            const b = byId.get(edge.to);
            if (!a || !b) throw new Error(`WeightedGraph: unknown node in edge ${edge.from}-${edge.to}`);
            const p = pos(a);
            const q = pos(b);
            const len = Math.hypot(q.x - p.x, q.y - p.y);
            const ux = (q.x - p.x) / len;
            const uy = (q.y - p.y) / len;
            const x1 = p.x + ux * r;
            const y1 = p.y + uy * r;
            const x2 = q.x - ux * (r + (directed ? 4 : 0));
            const y2 = q.y - uy * (r + (directed ? 4 : 0));
            const mx = (p.x + q.x) / 2;
            const my = (p.y + q.y) / 2;
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
            const { x, y } = pos(node);
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
                    {display(node.id)}
                  </text>
                </g>
              );
            }
            return (
              <g key={node.id}>
                <circle cx={x} cy={y} r={r} className={cls} />
                <text x={x} y={y + 5} className={node.id === goal || node.id === start ? styles.labelGoal : styles.label}>
                  {display(node.id)}
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

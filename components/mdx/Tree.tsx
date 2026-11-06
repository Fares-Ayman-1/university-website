import { layoutTree, treeNodeWidth } from "@/lib/diagrams/tree";
import styles from "./diagrams.module.css";

export function Tree({
  tree,
  order,
  path,
  goal,
  caption,
}: {
  tree: string;
  /** Comma-separated node ids in visit order; numbered badges are drawn on them */
  order?: string;
  /** Comma-separated node ids from the root to highlight as the solution path */
  path?: string;
  goal?: string;
  caption?: string;
}) {
  const { nodes, edges, width, height } = layoutTree(tree);
  const orderList = order ? order.split(",").map((s) => s.trim()) : [];
  const pathSet = new Set(path ? path.split(",").map((s) => s.trim()) : []);

  return (
    <figure className={`${styles.diagram} reveal`}>
      <div className={styles.scroll}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ minWidth: Math.min(width, 560) }}
          role="img"
          aria-label={caption ?? "Search tree"}
        >
          {edges.map(([from, to]) => (
            <line
              key={`${from.id}-${to.id}`}
              x1={from.x}
              y1={from.y + 16}
              x2={to.x}
              y2={to.y - 16}
              className={pathSet.has(from.id) && pathSet.has(to.id) ? styles.edgeActive : styles.edge}
            />
          ))}
          {nodes.map((node) => {
            const w = treeNodeWidth(node.label);
            const step = orderList.indexOf(node.id);
            const cls =
              node.id === goal ? styles.nodeGoal : pathSet.has(node.id) ? styles.nodeActive : styles.node;
            return (
              <g key={node.id}>
                <rect x={node.x - w / 2} y={node.y - 16} width={w} height={32} rx={16} className={cls} />
                <text x={node.x} y={node.y + 5} className={node.id === goal ? styles.labelGoal : styles.label}>
                  {node.label}
                </text>
                {step >= 0 ? (
                  <g>
                    <circle cx={node.x + w / 2 - 2} cy={node.y - 16} r={10} className={styles.badge} />
                    <text x={node.x + w / 2 - 2} y={node.y - 12} className={styles.badgeText}>
                      {step + 1}
                    </text>
                  </g>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

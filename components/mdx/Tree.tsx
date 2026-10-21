import styles from "./diagrams.module.css";

type Node = { id: string; label: string; children: Node[]; x: number; y: number; depth: number };

/**
 * Parses "A(B(D,E),C(F,G))". A label may carry a "#n" suffix to keep ids unique
 * when the same state appears twice ("Arad#2" is displayed as "Arad").
 */
function parse(source: string): Node {
  let i = 0;
  const text = source.replace(/\s+/g, "");

  function readLabel(): string {
    const start = i;
    while (i < text.length && !"(),".includes(text[i])) i++;
    return text.slice(start, i);
  }

  function readNode(depth: number): Node {
    const id = readLabel();
    const node: Node = { id, label: id.split("#")[0], children: [], x: 0, y: 0, depth };
    if (text[i] === "(") {
      i++;
      node.children.push(readNode(depth + 1));
      while (text[i] === ",") {
        i++;
        node.children.push(readNode(depth + 1));
      }
      if (text[i] !== ")") throw new Error(`Tree: expected ")" at ${i} in "${source}"`);
      i++;
    }
    return node;
  }

  return readNode(0);
}

const LEVEL_GAP = 78;
const SLOT = 70;
const PAD = 30;

function nodeWidth(label: string) {
  return Math.max(38, label.length * 8.6 + 20);
}

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
  const root = parse(tree);
  const nodes: Node[] = [];
  const edges: [Node, Node][] = [];
  let leaf = 0;
  let maxDepth = 0;

  (function layout(node: Node) {
    nodes.push(node);
    maxDepth = Math.max(maxDepth, node.depth);
    node.y = PAD + 18 + node.depth * LEVEL_GAP;
    if (node.children.length === 0) {
      node.x = PAD + leaf * SLOT + SLOT / 2;
      leaf++;
      return;
    }
    node.children.forEach((child) => {
      edges.push([node, child]);
      layout(child);
    });
    node.x = (node.children[0].x + node.children[node.children.length - 1].x) / 2;
  })(root);

  const width = PAD * 2 + leaf * SLOT;
  const height = PAD * 2 + 36 + maxDepth * LEVEL_GAP;
  const orderList = order ? order.split(",").map((s) => s.trim()) : [];
  const pathSet = new Set(path ? path.split(",").map((s) => s.trim()) : []);

  return (
    <figure className={styles.diagram}>
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
            const w = nodeWidth(node.label);
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

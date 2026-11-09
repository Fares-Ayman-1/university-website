"use client";

import { BFS_TREE, PY_GRAPH, placeTree, pyBfsDfs, pyIds, pyList, pyUcs, type PyCall } from "@/lib/widgets/ai-lecture-03";
import type { python } from "@/lib/walkthroughs/artificial-intelligence/lecture-03";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Text, Svg } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Cells, FringeTable, TreeView, type TreeLight } from "./local";

const runs = { bfs: pyBfsDfs("bfs", PY_GRAPH, "A", "G"), dfs: pyBfsDfs("dfs", PY_GRAPH, "A", "G"), ucs: pyUcs(PY_GRAPH, "A", "G") };

/** The loop of each function in uninformed_search.py; `pop` is the line that differs. */
const CODE: Record<keyof typeof runs, { lines: string[]; pop: number }> = {
  bfs: {
    pop: 1,
    lines: [
      "while fringe:",
      "    node = fringe.popleft()",
      "    if node == goal:",
      "        return path_to(parents, node)",
      "    for child in graph[node]:",
      "        if child not in parents:",
      "            parents[child] = node",
      "            fringe.append(child)",
    ],
  },
  dfs: {
    pop: 1,
    lines: [
      "while fringe:",
      "    node = fringe.pop()",
      "    if node == goal:",
      "        return path_to(parents, node)",
      "    for child in reversed(list(graph[node])):",
      "        if child not in parents:",
      "            parents[child] = node",
      "            fringe.append(child)",
    ],
  },
  ucs: {
    pop: 1,
    lines: [
      "while fringe:",
      "    cost, node, path = heapq.heappop(fringe)",
      "    if node == goal:",
      "        return path, cost",
      "    for child, step in graph[node].items():",
      "        new_cost = cost + step",
      '        if new_cost < best.get(child, float("inf")):',
      "            best[child] = new_cost",
      "            heapq.heappush(fringe, (new_cost, child, …))",
    ],
  },
};

const LINE = 19;
const smallTree = placeTree(BFS_TREE, { x: 410, y: 62, w: 120, h: 96 });

function Loop({ control }: { control: string }) {
  const kind = control as keyof typeof runs;
  const code = CODE[kind];
  const run = runs[kind];
  const lineY = (i: number) => 54 + i * LINE;
  const lights: TreeLight[] = run.steps.map((s, i) => ({ id: s.node, d: 900 + i * 260, tone: s.node === "G" ? "success" : "navy" }));
  const badges = run.steps.map((s, i) => ({ id: s.node, n: i + 1, d: 900 + i * 260 }));
  const second = run.steps[1];
  // A stack's top is its end; show every fringe front first.
  const fringe = kind === "dfs" ? [...second.fringe].reverse() : second.fringe;
  return (
    <Svg>
      <Text x={24} y={26} text={`def ${kind}(graph, start, goal):`} anchor="start" mono size={11} tone="muted" d={0} />
      <Box x={16} y={lineY(code.pop) - LINE / 2} w={350} h={LINE} r={3} tone="gold" d={500} />
      {code.lines.map((l, i) => (
        <Text key={i} x={24} y={lineY(i)} text={l} anchor="start" mono size={10} tone={i === code.pop ? "heading" : "text"} weight={i === code.pop ? 700 : 500} d={100 + i * 50} />
      ))}
      <Arrow pts={[[368, lineY(code.pop)], [398, lineY(code.pop)], [smallTree.byId.A.x - 18, smallTree.byId.A.y]]} tone="gold" d={700} dur={300} />
      <TreeView tree={smallTree} nw={24} nh={20} size={10} lights={lights} badges={badges} d={200} />
      <Text x={470} y={186} text={bi(`fringe after popping ${second.node}`, `الحافة بعد إخراج ${second.node}`)} tone="muted" size={10} d={1500} />
      <Cells x={470 - (fringe.length * 34 - 4) / 2} y={208} items={fringe.map((f) => ({ label: f }))} cw={30} ch={26} gap={4} size={10.5} tone={(i) => (i === 0 ? "gold" : "outline")} d={1600} />
      <Text x={470} y={250} text={bi("front first", "المقدمة أولًا")} tone="muted" size={10} d={1600} />
    </Svg>
  );
}

const bfsRun = runs.bfs;
const parentRows = Object.entries(bfsRun.parents).map(([child, parent]) => [`"${child}"`, parent === null ? "None" : `"${parent}"`]);
const pathTree = placeTree(BFS_TREE, { x: 330, y: 74, w: 180, h: 130 });

function Parents() {
  const path = bfsRun.path!;
  const back = [...path].reverse();
  const keys = Object.keys(bfsRun.parents);
  const walkAt = 1600;
  // Each step of the walk runs beside the tree edge, from a child up to its parent.
  const up = (from: string, to: string): [number, number][] => {
    const a = pathTree.byId[from];
    const b = pathTree.byId[to];
    return [
      [a.x + 9, a.y - 14],
      [b.x + 15, b.y + 10],
    ];
  };
  return (
    <Svg>
      <Text x={125} y={26} text="parents" mono size={12} tone="heading" d={0} />
      <FringeTable
        x={40}
        y={42}
        rows={parentRows}
        head={["child", "parent"]}
        cw={[80, 90]}
        rh={24}
        size={11}
        d={100}
        stagger={140}
        tone={(r) => (back.includes(keys[r]) ? "gold" : undefined)}
      />
      <Text x={425} y={26} text={'path_to(parents, "G")'} mono size={11.5} tone="heading" d={walkAt - 300} />
      <TreeView tree={pathTree} nw={28} nh={24} lights={back.map((id, i) => ({ id, d: walkAt + i * 450, tone: id === "G" ? "success" : "gold" }))} d={0} />
      {back.slice(1).map((id, i) => (
        <Arrow key={id} pts={up(back[i], id)} tone="gold" width={2.4} d={walkAt + 200 + i * 450} dur={350} />
      ))}
      <Text x={425} y={226} text={bi("walk back, then reverse", "ارجع للخلف ثم اعكس")} tone="muted" size={10.5} d={walkAt + 1000} />
      <Text x={425} y={262} text={pyList(path)} mono size={13} tone="gold" d={walkAt + 1300} />
    </Svg>
  );
}

const calls = pyIds(PY_GRAPH, "A", "G");
const idsTree = placeTree(BFS_TREE, { x: 400, y: 70, w: 130, h: 130 });
const shown = (r: PyCall["result"]) => (Array.isArray(r) ? pyList(r) : r === null ? "None" : '"cutoff"');

function Ids({ control }: { control: string }) {
  const depth = Number(control);
  const run = calls[depth];
  const step = 260;
  const lights: TreeLight[] = run.calls.map((c, i) => ({ id: c.node, d: 400 + i * step, tone: c.node === "G" ? "success" : c.limit === 0 ? "warn" : "navy" }));
  return (
    <Svg>
      <Text x={24} y={26} text={`ids → dls(graph, "A", "G", ${depth})`} anchor="start" mono size={11.5} tone="heading" d={0} />
      {run.calls.map((c, i) => (
        <Text key={i} x={36 + c.depth * 22} y={60 + i * 24} text={`dls(${c.node}, limit=${c.limit}) → ${shown(c.result)}`} anchor="start" mono size={10.5} tone={Array.isArray(c.result) ? "success" : "text"} d={400 + i * step} />
      ))}
      <TreeView tree={idsTree} nw={26} nh={22} size={11} ghost={(id) => idsTree.byId[id].depth > depth} lights={lights} d={0} />
      <Text x={465} y={222} text={bi("limit 0: test, then stop", "limit 0: اختبر ثم توقّف")} tone="muted" size={10.5} d={300} />
      <Text
        x={465}
        y={256}
        text={run.result === "cutoff" ? bi(`cutoff: next, depth ${depth + 1}`, `قطع: التالي هو العمق ${depth + 1}`) : bi(`ids returns ${shown(run.result)}`, `تُرجع ids ${shown(run.result)}`)}
        size={11}
        tone={run.result === "cutoff" ? "muted" : "success"}
        d={400 + run.calls.length * step}
      />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof python>>({ loop: Loop, parents: Parents, ids: Ids });

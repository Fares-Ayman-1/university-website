"use client";

import { ROMANIA_TREE, insertAll, label, pathCosts, placeTree, type FringeKind } from "@/lib/widgets/ai-lecture-03";
import type { treeSearch } from "@/lib/walkthroughs/artificial-intelligence/lecture-03";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Mark, Text, Token, Svg } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Cells, TreeView } from "./local";

const tree = placeTree(ROMANIA_TREE, { x: 46, y: 58, w: 468, h: 150 });

function Expand({ control }: { control: string }) {
  const expanded = control === "none" ? [] : control === "arad" ? ["Arad"] : ["Arad", "Sibiu"];
  const generated = new Set(["Arad", ...expanded.flatMap((id) => tree.byId[id].children)]);
  const newest = expanded.length ? tree.byId[expanded[expanded.length - 1]].children : ["Arad"];
  return (
    <Svg>
      <TreeView
        tree={tree}
        nh={24}
        size={10.5}
        ghost={(id) => !generated.has(id)}
        base={(id) => (expanded.includes(id) ? "navy" : newest.includes(id) ? "outline" : "gold")}
        lights={newest.map((id, i) => ({ id, d: 500 + i * 140, tone: id === "Arad#2" ? "warn" : "gold" }))}
        d={0}
      />
      {control === "sibiu" ? <Chip x={tree.byId["Arad#2"].x + 20} y={tree.byId["Arad#2"].y + 34} text={bi("repeated state", "حالة متكررة")} tone="warn" center size={10} d={1300} /> : null}
      <Chip x={214} y={256} text={bi("expanded", "موسَّعة")} tone="navy" center size={10.5} d={300} />
      <Chip x={330} y={256} text={bi("fringe (leaves)", "الحافة (الأوراق)")} tone="gold" center size={10.5} d={400} />
      <Chip x={468} y={256} text={bi("not generated yet", "لم تُولَّد بعد")} tone="muted" center size={10.5} d={500} />
    </Svg>
  );
}

const PUZZLE = [
  ["5", "4", ""],
  ["6", "1", "8"],
  ["7", "3", "2"],
];

function StateNode({ control }: { control: string }) {
  if (control === "many") {
    const arads = tree.nodes.filter((n) => n.label === "Arad");
    const xs = arads.map((_, i) => 82 + i * 132);
    return (
      <Svg>
        {arads.map((n, i) => (
          <g key={n.id}>
            <Chip x={xs[i]} y={50} text={n.parent ? label(n.parent) : bi("root", "الجذر")} tone="slate" center size={10.5} d={i * 150} />
            <Arrow pts={[[xs[i], n.parent ? 62 : 70], [xs[i], 92]]} tone="faint" d={100 + i * 150} dur={200} />
            <Box x={xs[i] - 56} y={94} w={112} h={56} label="Arad" sub={bi(`depth ${n.depth}`, `العمق ${n.depth}`)} tone="outline" d={150 + i * 150} />
            <Arrow pts={[[xs[i], 152], [280 + (i - 1.5) * 28, 208]]} tone="gold" d={900 + i * 120} dur={360} />
          </g>
        ))}
        <Box x={200} y={210} w={160} h={46} label={bi("the state Arad", "الحالة Arad")} tone="gold" d={1400} />
        <Text x={376} y={233} text={bi("one state", "حالة واحدة")} anchor="start" tone="gold" size={11} d={1600} />
      </Svg>
    );
  }
  const fields = ["STATE", "PARENT-NODE", "ACTION", "DEPTH = 6", "PATH-COST = 6"];
  return (
    <Svg>
      <Text x={100} y={30} text={bi("State", "الحالة")} tone="heading" size={12.5} d={0} />
      {PUZZLE.map((row, r) =>
        row.map((v, c) => <Box key={`${r}-${c}`} x={46 + c * 36} y={58 + r * 36} w={36} h={36} r={2} label={v} tone={v ? "outline" : "muted"} size={14} d={100 + r * 120} />),
      )}
      <Text x={100} y={190} text={bi("8-puzzle board", "لوحة اللغز الثماني")} tone="muted" size={10.5} d={500} />
      <Text x={320} y={30} text={bi("Node", "العقدة")} tone="heading" size={12.5} d={400} />
      {fields.map((f, i) => (
        <Box key={f} x={240} y={58 + i * 30} w={160} h={30} r={0} label={f} tone={i === 0 ? "slate" : i >= 3 ? "gold" : "outline"} size={10.5} mono d={500 + i * 140} />
      ))}
      <Arrow pts={[[240, 73], [158, 92]]} tone="slate" d={1300} />
      <Box x={448} y={80} w={96} h={44} label={bi("parent", "العقدة الأم")} tone="navy" size={11.5} d={1500} />
      <Arrow pts={[[400, 103], [446, 103]]} tone="navy" d={1600} dur={260} />
      <Text x={496} y={146} text={bi("parent, action", "الأم، والفعل")} tone="muted" size={10.5} d={1700} />
      <Text x={320} y={232} text={bi("depth = 6, g = 6: bookkeeping that the state does not have", "العمق = 6 و g = 6: بيانات تنظيمية ليست للحالة")} tone="gold" size={11} d={2000} />
    </Svg>
  );
}

function Loop() {
  return (
    <Svg>
      <Box x={20} y={50} w={156} h={68} label="REMOVE-FRONT" sub={bi("take the front node", "خذ العقدة الأمامية")} tone="navy" size={11.5} mono d={0} />
      <Box x={202} y={50} w={156} h={68} label="GOAL-TEST" sub={bi("is it a goal?", "هل هي هدف؟")} tone="slate" size={11.5} mono d={200} />
      <Box x={384} y={50} w={156} h={68} label="EXPAND" sub={bi("generate its children", "ولّد أبناءها")} tone="slate" size={11.5} mono d={400} />
      <Box x={384} y={178} w={156} h={68} label="INSERT-ALL" sub={bi("put them in the fringe", "أدرجها في الحافة")} tone="slate" size={11.5} mono d={600} />
      <Arrow pts={[[176, 84], [200, 84]]} d={300} dur={200} />
      <Arrow pts={[[358, 84], [382, 84]]} d={500} dur={200} />
      <Text x={370} y={58} text={bi("no", "لا")} tone="muted" size={10} d={600} />
      <Arrow pts={[[462, 118], [462, 176]]} d={700} dur={200} />
      <Arrow pts={[[382, 212], [300, 212]]} d={800} dur={200} />
      <Arrow pts={[[50, 174], [50, 120]]} d={900} dur={200} />
      <Arrow pts={[[280, 118], [280, 140]]} tone="success" d={1000} dur={200} />
      <Chip x={280} y={154} text={bi("yes: return the node", "نعم: أعِد العقدة")} tone="success" center size={10.5} d={1100} />
      <Cells x={28} y={176} items={[{ label: "B" }, { label: "C" }]} cw={44} ch={30} d={800} />
      <Text x={130} y={191} text={bi("fringe before", "الحافة قبل")} anchor="start" tone="muted" size={10.5} d={800} />
      <Cells x={28} y={222} items={[{ label: "C" }, { label: "D" }, { label: "E" }]} cw={44} ch={30} tone={(i) => (i ? "gold" : "outline")} d={2600} />
      <Text x={180} y={237} text={bi("fringe after expanding B", "الحافة بعد توسيع B")} anchor="start" tone="muted" size={10.5} d={2700} />
      <Token
        pts={[
          [50, 191],
          [50, 150],
          [98, 84],
          [280, 84],
          [462, 84],
          [462, 212],
          [300, 212],
        ]}
        d={1300}
        dur={1400}
      />
      <Mark x={340} y={64} ok={false} r={9} d={1700} />
    </Svg>
  );
}

const g = pathCosts(tree);
const leftover = ["Timisoara", "Zerind"].map((id) => ({ id, g: g[id] }));
const kids = tree.byId.Sibiu.children.map((id) => ({ id, g: g[id] }));
const small = placeTree(ROMANIA_TREE, { x: 46, y: 42, w: 468, h: 82 });

function Insert({ control }: { control: string }) {
  const kind = control as FringeKind;
  const fringe = insertAll(leftover, kids, kind);
  const next = fringe[0].id;
  const generated = new Set(["Arad", "Sibiu", "Timisoara", "Zerind", ...kids.map((k) => k.id)]);
  const kidIds = new Set(kids.map((k) => k.id));
  const caption = {
    fifo: bi("children go to the back", "يذهب الأبناء إلى النهاية"),
    lifo: bi("children go to the front", "يذهب الأبناء إلى المقدمة"),
    priority: bi("everything is kept sorted by g(n)", "يبقى الكل مرتَّبًا حسب g(n)"),
  }[kind];
  return (
    <Svg>
      <TreeView
        tree={small}
        nh={22}
        size={10}
        hide={(id) => !generated.has(id)}
        base={(id) => (id === "Arad" || id === "Sibiu" ? "navy" : "outline")}
        lights={[{ id: next, d: 1300, tone: "gold" }]}
        d={0}
      />
      <Text x={30} y={154} text={bi("front", "المقدمة")} anchor="start" tone="gold" size={10.5} d={300} />
      <Cells
        x={28}
        y={182}
        items={fringe.map((f) => ({ label: label(f.id), sub: kind === "priority" ? `g = ${f.g}` : undefined }))}
        cw={78}
        ch={40}
        size={11}
        tone={(i) => (i === 0 ? "gold" : kidIds.has(fringe[i].id) ? "slate" : "outline")}
        d={400}
        stagger={110}
      />
      <Text x={280} y={248} text={caption} tone="heading" size={12} d={1100} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof treeSearch>>({ expand: Expand, "state-node": StateNode, loop: Loop, insert: Insert });

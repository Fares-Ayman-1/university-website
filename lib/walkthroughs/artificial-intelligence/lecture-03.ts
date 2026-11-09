import { bi } from "@/components/widgets/types";
import {
  BFS_MB_PER_SECOND,
  BFS_TREE,
  DFS_GOAL,
  DFS_TREE,
  NO_GOAL,
  PY_GRAPH,
  ROMANIA_TREE,
  UCS_MAP,
  bfsGenerated,
  chainProblem,
  chainTree,
  depthLimited,
  firstGoal,
  gbAfterHours,
  goalOnGeneration,
  idsGenerated,
  insertAll,
  iterativeDeepening,
  join,
  lastLevelShare,
  levelSizes,
  listed,
  memoryAtEnd,
  pathCosts,
  placeTree,
  pyBfsDfs,
  pyIds,
  pyList,
  pyUcs,
  repeatsIn,
  thousands,
  treeMeasures,
  treeOf,
  ucsProblem,
  type FringeKind,
} from "@/lib/widgets/ai-lecture-03";
import { runSearch } from "@/lib/widgets/search";
import { defineWalkthrough } from "@/lib/widgets/walkthrough";

/*
 * Artificial Intelligence · Lecture 3 (content/subjects/artificial-intelligence/lectures/03-uninformed-search.mdx).
 * One walkthrough per heading; the scenes are in
 * components/widgets/walkthrough/scenes/artificial-intelligence/lecture-03/. Every order and
 * count below is computed by lib/widgets/ai-lecture-03.ts (on top of search.ts), and the
 * page's `expect` checks the ones it prints.
 */

// ---------- Tree search ----------
const romania = placeTree(ROMANIA_TREE, { x: 0, y: 0, w: 1, h: 1 });
const romaniaG = pathCosts(romania);
const leftover = ["Timisoara", "Zerind"].map((id) => ({ id, g: romaniaG[id] }));
const sibiuKids = romania.byId.Sibiu.children.map((id) => ({ id, g: romaniaG[id] }));
const nextOut = (kind: FringeKind) => insertAll(leftover, sibiuKids, kind)[0];
const aradNodes = romania.nodes.filter((n) => n.label === "Arad");

export const treeSearch = defineWalkthrough({
  id: "ai3-tree-search",
  title: bi("Tree search: remove, test, expand, insert", "البحث الشجري: أزِل، واختبر، ووسّع، وأدرج"),
  analogy: bi(
    "Planning a trip on a map before leaving home: you pencil in every road out of the towns you have looked at, then choose which pencilled road to follow further.",
    "التخطيط لرحلة على الخريطة قبل مغادرة البيت: ترسم بالقلم كل طريق يخرج من المدن التي نظرت فيها، ثم تختار أي طريق مرسوم تتابعه أبعد.",
  ),
  panels: [
    {
      id: "expand",
      pill: bi("Expanding nodes", "توسيع العقد"),
      heading: bi("Every expansion grows the search tree", "كل توسيع يُنمّي شجرة البحث"),
      control: {
        label: bi("Expanded so far", "ما وُسِّع حتى الآن"),
        options: [
          { id: "none", label: bi("Nothing", "لا شيء") },
          { id: "arad", label: bi("Arad", "Arad") },
          { id: "sibiu", label: bi("Arad, then Sibiu", "Arad ثم Sibiu") },
        ],
        initial: "none",
      },
      points: [
        bi(
          "Search is an **offline, simulated** exploration: we **expand** a node by generating its successors, without moving in the real world.",
          "البحث **استكشاف محاكى (simulated) يجري دون اتصال (offline)**: **نوسّع (expand)** العقدة بتوليد الحالات التالية لها، دون أي حركة في العالم الحقيقي.",
        ),
      ],
      pointsFor: {
        none: [bi("The tree starts as one node holding the **initial state**, Arad.", "تبدأ الشجرة بعقدة واحدة تحمل **الحالة الابتدائية (initial state)**، وهي Arad.")],
        arad: [
          bi(
            "Expanding Arad adds Sibiu, Timisoara and Zerind as **leaves**. The **strategy** decides which leaf to expand next.",
            "يضيف توسيع Arad المدن Sibiu و Timisoara و Zerind **أوراقًا (leaves)**، وتقرر **الاستراتيجية (strategy)** أي ورقة تُوسَّع بعد ذلك.",
          ),
        ],
        sibiu: [
          bi(
            "Expanding Sibiu adds four children, and one of them is **Arad again**: tree search does not notice repeated states.",
            "يضيف توسيع Sibiu أربعة أبناء، أحدها **Arad مرة أخرى**: فالبحث الشجري لا ينتبه إلى الحالات المتكررة (repeated states).",
          ),
        ],
      },
    },
    {
      id: "state-node",
      pill: bi("State vs. node", "الحالة مقابل العقدة"),
      heading: bi("A node wraps a state with bookkeeping", "العقدة تغلّف الحالة ببيانات تنظيمية"),
      control: {
        label: bi("Look at", "اعرض"),
        options: [
          { id: "node", label: bi("One node", "عقدة واحدة") },
          { id: "many", label: bi("One state, many nodes", "حالة واحدة وعقد كثيرة") },
        ],
        initial: "node",
      },
      points: [bi("A **state** is a configuration of the world; a **node** is a data structure in the search tree.", "**الحالة (state)** تهيئة للعالم، أما **العقدة (node)** فبنية بيانات في شجرة البحث.")],
      pointsFor: {
        node: [
          bi(
            "The node stores the state plus its **parent**, the **action** that produced it, its **depth** and its **path cost** g. Here depth = 6 and g = 6.",
            "تخزّن العقدة الحالة ومعها **العقدة الأم (parent)**، و**الفعل (action)** الذي أنتجها، و**العمق (depth)**، و**تكلفة المسار (path cost)** g، وهنا العمق = 6 و g = 6.",
          ),
        ],
        many: [
          bi(
            `The state Arad sits in ${aradNodes.length} nodes of the Romania tree, each with its own parent and depth. States have no parents or depths; nodes do.`,
            `تظهر الحالة Arad في ${aradNodes.length} عقد من شجرة رومانيا، لكل منها عقدتها الأم وعمقها. فليس للحالات عقد أم ولا أعماق، بل هذه للعقد.`,
          ),
        ],
      },
    },
    {
      id: "loop",
      pill: bi("The fringe", "الحافة"),
      heading: bi("One loop: remove a node, test it, expand it", "حلقة واحدة: أزِل عقدة، واختبرها، ثم وسّعها"),
      points: [
        bi(
          "The **fringe** holds the nodes generated but not yet expanded. Each turn of the loop removes the node at its front.",
          "تضم **الحافة (fringe)** العقد التي وُلِّدت ولم تُوسَّع بعد، وفي كل دورة من الحلقة تُزال العقدة التي في مقدمتها.",
        ),
        bi(
          "A goal node is returned; any other node is expanded, and **INSERT-ALL** puts its children into the fringe. An empty fringe means **failure**.",
          "إن كانت العقدة هدفًا أُعيدت، وإلا وُسِّعت وأدرجت **INSERT-ALL** أبناءها في الحافة. أما خلوّ الحافة فيعني **الإخفاق (failure)**.",
        ),
      ],
    },
    {
      id: "insert",
      pill: bi("Where new nodes go", "أين تُدرَج العقد الجديدة"),
      heading: bi("The strategy is where INSERT-ALL puts new nodes", "الاستراتيجية هي موضع إدراج العقد الجديدة"),
      control: {
        label: bi("Fringe", "الحافة"),
        options: [
          { id: "fifo", label: bi("FIFO queue", "طابور FIFO") },
          { id: "lifo", label: bi("LIFO stack", "مكدس LIFO") },
          { id: "priority", label: bi("Priority queue", "طابور أولوية") },
        ],
        initial: "fifo",
      },
      points: [
        bi(
          "Sibiu has just been expanded. Every strategy runs the same loop; only the place where its four children go changes, and with it the next node out.",
          "وُسِّعت Sibiu للتو. تشغّل كل الاستراتيجيات الحلقة نفسها، ولا يتغير إلا الموضع الذي يذهب إليه أبناؤها الأربعة، ومعه العقدة التي تخرج تاليًا.",
        ),
      ],
      pointsFor: {
        fifo: [
          bi(
            `**FIFO queue**: new nodes go to the back, so the shallowest node, ${nextOut("fifo").id}, comes out next. This is **breadth-first** search.`,
            `**طابور FIFO**: تُضاف العقد الجديدة إلى نهايته، فتخرج العقدة الأقل عمقًا، وهي ${nextOut("fifo").id}، تاليًا. وهذا هو البحث **بالعرض أولًا (breadth-first)**.`,
          ),
        ],
        lifo: [
          bi(
            `**LIFO stack**: new nodes go to the front, so Sibiu's first child, ${nextOut("lifo").id.split("#")[0]}, comes out next. This is **depth-first** search.`,
            `**مكدس LIFO**: تُضاف العقد الجديدة إلى مقدمته، فيخرج أول أبناء Sibiu، وهو ${nextOut("lifo").id.split("#")[0]}، تاليًا. وهذا هو البحث **بالعمق أولًا (depth-first)**.`,
          ),
        ],
        priority: [
          bi(
            `**Priority queue by g(n)**, with road lengths as step costs: the cheapest path so far comes out next, ${nextOut("priority").id} at ${nextOut("priority").g} km. This is **uniform-cost** search.`,
            `**طابور أولوية حسب g(n)**، مع أطوال الطرق تكاليفَ للخطوات: يخرج المسار الأرخص حتى الآن تاليًا، وهو ${nextOut("priority").id} بطول ${nextOut("priority").g} km. وهذا هو البحث **بالتكلفة الموحدة (uniform-cost)**.`,
          ),
        ],
      },
    },
  ],
});

// ---------- Evaluating search strategies ----------
export const BDM_TREE = "A(B(D(H(K,L),I),E),C(F,G))";
export const BDM_GOAL = "G";
const bdm = treeMeasures(BDM_TREE, BDM_GOAL);
const GROWTH_DEPTH = 5;
const growthPoint = (b: number) => {
  const sizes = levelSizes(b, GROWTH_DEPTH);
  const total = sizes.reduce((s, v) => s + v, 0);
  const pct = Math.round(lastLevelShare(b, GROWTH_DEPTH) * 100);
  return bi(
    `With b = ${b}, level ${GROWTH_DEPTH} holds ${thousands(sizes[GROWTH_DEPTH])} of the tree's ${thousands(total)} nodes: ${pct}% of them sit on the last level.`,
    `عندما b = ${b} يضم المستوى ${GROWTH_DEPTH} عدد ${thousands(sizes[GROWTH_DEPTH])} من عقد الشجرة البالغة ${thousands(total)} عقدة، أي إن ${pct}% منها في المستوى الأخير.`,
  );
};

export const evaluating = defineWalkthrough({
  id: "ai3-evaluating",
  title: bi("Four questions for every strategy", "أربعة أسئلة لكل استراتيجية"),
  analogy: bi(
    "Choosing a route planner: does it always find a route, is it the shortest one, how long does it think, and how much scrap paper does it need?",
    "اختيار برنامج لتخطيط الطرق: هل يجد طريقًا دائمًا، وهل هو الأقصر، وكم يستغرق في التفكير، وكم ورقة مسودة يحتاج؟",
  ),
  panels: [
    {
      id: "criteria",
      pill: bi("Four criteria", "أربعة معايير"),
      heading: bi("Complete, optimal, time and space", "الاكتمال والأمثلية والزمن والمساحة"),
      points: [
        bi("A strategy is defined by the **order of node expansion**, and we judge it on four criteria.", "تُعرَّف الاستراتيجية بـ**ترتيب توسيع العقد**، ونحكم عليها وفق أربعة معايير."),
        bi(
          "**Completeness** and **optimality** ask about the answer it returns; **time** and **space** ask what finding it costs.",
          "يسأل **الاكتمال (completeness)** و**الأمثلية (optimality)** عن الإجابة التي تعيدها، بينما يسأل **الزمن** و**المساحة** عن تكلفة الوصول إليها.",
        ),
      ],
    },
    {
      id: "bdm",
      pill: bi("b, d and m", "b و d و m"),
      heading: bi("Three numbers measure a search tree", "ثلاثة أرقام تقيس شجرة البحث"),
      points: [
        bi(
          "**b** is the maximum **branching factor**, **d** the depth of the least-cost solution and **m** the maximum depth of the state space, possibly ∞.",
          "**b** هو أقصى **معامل تفرّع (branching factor)**، و**d** عمق الحل الأقل تكلفة، و**m** أقصى عمق لفضاء الحالات (state space)، وقد يكون ∞.",
        ),
        bi(
          `In this tree b = ${bdm.b}, the goal ${BDM_GOAL} sits at d = ${bdm.d}, and the deepest branch reaches m = ${bdm.m}.`,
          `في هذه الشجرة b = ${bdm.b}، والهدف ${BDM_GOAL} عند d = ${bdm.d}، ويبلغ أعمق فرع m = ${bdm.m}.`,
        ),
      ],
    },
    {
      id: "growth",
      pill: bi("Exponential growth", "النمو الأُسّي"),
      heading: bi(`Level k holds b^k nodes`, "يضم المستوى k عدد b^k من العقد"),
      control: {
        label: bi("Branching factor", "معامل التفرّع"),
        options: [
          { id: "2", label: bi("b = 2", "b = 2") },
          { id: "3", label: bi("b = 3", "b = 3") },
          { id: "10", label: bi("b = 10", "b = 10") },
        ],
        initial: "2",
      },
      points: [
        bi(
          "Each extra level multiplies the work by **b**, so time and space grow **exponentially** with the depth.",
          "كل مستوى إضافي يضرب العمل في **b**، لذا ينمو الزمن والمساحة **أُسّيًّا** مع العمق.",
        ),
      ],
      pointsFor: { "2": [growthPoint(2)], "3": [growthPoint(3)], "10": [growthPoint(10)] },
    },
    {
      id: "blind",
      pill: bi("Uninformed", "غير المُوجَّه"),
      heading: bi("Blind search cannot tell which state is closer", "البحث الأعمى لا يميّز أي حالة أقرب"),
      control: {
        label: bi("Search", "البحث"),
        options: [
          { id: "uninformed", label: bi("Uninformed", "غير مُوجَّه") },
          { id: "informed", label: bi("Informed (next lecture)", "مُوجَّه (المحاضرة القادمة)") },
        ],
        initial: "uninformed",
      },
      points: [
        bi(
          "**Uninformed** (blind) strategies use only the problem definition: the successors, the step costs and the goal test.",
          "تستخدم الاستراتيجيات **غير المُوجَّهة (uninformed)** (العمياء) تعريف المسألة فقط: الحالات التالية، وتكاليف الخطوات، واختبار الهدف (goal test).",
        ),
      ],
      pointsFor: {
        uninformed: [
          bi("To a blind search every non-goal state looks the same: it cannot tell that Y is closer to the goal than X.", "تبدو كل الحالات غير الهدف متشابهة للبحث الأعمى، فلا يستطيع أن يعرف أن Y أقرب إلى الهدف من X."),
        ],
        informed: [
          bi("**Informed** search adds an estimate of the distance to the goal, so it can expand the promising state first.", "يضيف البحث **المُوجَّه (informed)** تقديرًا للمسافة إلى الهدف، فيستطيع توسيع الحالة الواعدة أولًا."),
        ],
      },
    },
  ],
});

// ---------- Breadth-first search ----------
const bfsRun = runSearch(treeOf(BFS_TREE), "bfs", "G");
const mapBfs = runSearch(ucsProblem(), "bfs", UCS_MAP.goal);
const mapBfsUnit = runSearch(ucsProblem(true), "bfs", UCS_MAP.goal);
const mapUcs = runSearch(ucsProblem(), "ucs", UCS_MAP.goal);
const arrows = (path: readonly string[] | null) => (path ?? []).join(" → ");
const BIG = { b: 10, d: 5 } as const;

export const bfs = defineWalkthrough({
  id: "ai3-bfs",
  title: bi("Breadth-first search: level by level", "البحث بالعرض أولًا: مستوى بعد مستوى"),
  analogy: bi(
    "Ripples on a pond: the ring reaches everything one step away before anything two steps away.",
    "تموّجات في بركة ماء: تبلغ الحلقة كل ما يبعد خطوة واحدة قبل أي شيء يبعد خطوتين.",
  ),
  facts: { bfs: join(bfsRun.order), day: gbAfterHours(24) },
  panels: [
    {
      id: "fifo",
      pill: bi("FIFO queue", "طابور FIFO"),
      heading: bi("Expand the shallowest unexpanded node", "وسّع العقدة الأقل عمقًا من بين العقد غير الموسَّعة"),
      points: [
        bi(
          "The fringe is a **FIFO queue**: a node's children join the back, so a whole level is expanded before the next one starts.",
          "الحافة **طابور (queue) من نوع FIFO**: ينضم أبناء العقدة إلى نهايته، فيُوسَّع المستوى كاملًا قبل أن يبدأ المستوى التالي.",
        ),
        bi(
          `BFS expands ${listed(bfsRun.order)}. With G as the goal, the far right leaf, it is reached only after the whole tree.`,
          `يوسّع BFS العقد ${listed(bfsRun.order)}. وإذا كان الهدف G، وهو أقصى ورقة على اليمين، فلا يُبلَغ إلا بعد الشجرة كلها.`,
        ),
      ],
    },
    {
      id: "optimal",
      pill: bi("Complete? Optimal?", "مكتمل؟ أمثل؟"),
      heading: bi("Shallowest is cheapest only when steps cost the same", "الأقل عمقًا هو الأرخص فقط عندما تتساوى تكاليف الخطوات"),
      control: {
        label: bi("Step costs", "تكاليف الخطوات"),
        options: [
          { id: "unit", label: bi("All equal to 1", "كلها تساوي 1") },
          { id: "km", label: bi("Road lengths", "أطوال الطرق") },
        ],
        initial: "unit",
      },
      points: [
        bi(
          "BFS is **complete** if b is finite: every level is finite, so it reaches the shallowest goal after finitely many steps.",
          "يكون BFS **مكتملًا (complete)** إذا كان b منتهيًا: فكل مستوى منتهٍ، لذا يبلغ أقرب هدف بعد عدد منتهٍ من الخطوات.",
        ),
      ],
      pointsFor: {
        unit: [
          bi(
            `With every step costing 1, the shallowest goal is the cheapest: ${arrows(mapBfsUnit.path)} costs ${mapBfsUnit.cost}, so BFS is **optimal**.`,
            `عندما تكون تكلفة كل خطوة 1 يكون أقرب هدف هو الأرخص: فالمسار ${arrows(mapBfsUnit.path)} تكلفته ${mapBfsUnit.cost}، لذا يكون BFS **أمثل (optimal)**.`,
          ),
        ],
        km: [
          bi(
            `With road lengths BFS still returns ${arrows(mapBfs.path)} (${mapBfs.cost} km), but ${arrows(mapUcs.path)} is only ${mapUcs.cost} km: BFS is **not optimal** in general.`,
            `مع أطوال الطرق يظل BFS يعيد ${arrows(mapBfs.path)} (${mapBfs.cost} km)، مع أن ${arrows(mapUcs.path)} طوله ${mapUcs.cost} km فقط: فـ BFS **ليس أمثل** في الحالة العامة.`,
          ),
        ],
      },
    },
    {
      id: "time",
      pill: bi("Time", "الزمن"),
      heading: bi("Testing on expansion costs a whole extra level", "الاختبار عند التوسيع يكلّف مستوى إضافيًا كاملًا"),
      control: {
        label: bi("Goal test when a node is", "اختبار الهدف عند"),
        options: [
          { id: "expansion", label: bi("Expanded", "توسيع العقدة") },
          { id: "generation", label: bi("Generated", "توليد العقدة") },
        ],
        initial: "expansion",
      },
      points: [
        bi(
          `For b = ${BIG.b} and the goal at the far right of depth d = ${BIG.d}, count the nodes BFS generates (not counting the root).`,
          `عندما b = ${BIG.b} والهدف في أقصى يمين العمق d = ${BIG.d}، نَعُدّ العقد التي يولّدها BFS (دون احتساب الجذر).`,
        ),
      ],
      pointsFor: {
        expansion: [
          bi(
            `Every depth-${BIG.d} node but the goal is expanded first, adding b(b^d − 1) = ${thousands(BIG.b * (BIG.b ** BIG.d - 1))} nodes at depth ${BIG.d + 1}: ${thousands(bfsGenerated(BIG.b, BIG.d, "expansion", false))} in all, O(b^(d+1)).`,
            `تُوسَّع كل عقدة عند العمق ${BIG.d} ما عدا الهدف أولًا، فتُضاف b(b^d − 1) = ${thousands(BIG.b * (BIG.b ** BIG.d - 1))} عقدة عند العمق ${BIG.d + 1}، ويصبح المجموع ${thousands(bfsGenerated(BIG.b, BIG.d, "expansion", false))}، أي O(b^(d+1)).`,
          ),
        ],
        generation: [
          bi(
            `Testing each child as it is generated stops at depth ${BIG.d}: ${thousands(bfsGenerated(BIG.b, BIG.d, "generation", false))} nodes, O(b^d).`,
            `أما اختبار كل ابن عند توليده فيتوقف عند العمق ${BIG.d}: ${thousands(bfsGenerated(BIG.b, BIG.d, "generation", false))} عقدة، أي O(b^d).`,
          ),
        ],
      },
    },
    {
      id: "memory",
      pill: bi("Space", "المساحة"),
      heading: bi("Memory runs out long before time does", "تنفد الذاكرة قبل الوقت بكثير"),
      points: [
        bi("BFS keeps **every node in memory**, so its space, O(b^(d+1)), grows as fast as its time.", "يحتفظ BFS بـ**كل عقدة في الذاكرة**، لذا تنمو مساحته O(b^(d+1)) بسرعة نمو زمنه نفسها."),
        bi(
          `At ${BFS_MB_PER_SECOND} MB of new nodes per second, memory fills by ${thousands(gbAfterHours(1))} GB an hour and ${thousands(gbAfterHours(24))} GB a day.`,
          `بمعدل ${BFS_MB_PER_SECOND} MB من العقد الجديدة في الثانية، تمتلئ الذاكرة بمقدار ${thousands(gbAfterHours(1))} GB كل ساعة و ${thousands(gbAfterHours(24))} GB كل يوم.`,
        ),
      ],
    },
  ],
});

// ---------- Uniform-cost search ----------
const mapUcsUnit = runSearch(ucsProblem(true), "ucs", UCS_MAP.goal);
const early = goalOnGeneration(mapUcs)!;
export const C_STAR = 6;

export const ucs = defineWalkthrough({
  id: "ai3-ucs",
  title: bi("Uniform-cost search: cheapest path first", "البحث بالتكلفة الموحدة: المسار الأرخص أولًا"),
  analogy: bi(
    "A courier who always continues the cheapest trip planned so far, not the one with the fewest stops.",
    "ساعي بريد يكمل دائمًا الرحلة الأرخص المخطَّط لها حتى الآن، لا الرحلة ذات المحطات الأقل.",
  ),
  facts: { cost: mapUcs.cost!, early: early.cost },
  panels: [
    {
      id: "priority",
      pill: bi("Priority queue", "طابور الأولوية"),
      heading: bi("Expand the least-cost unexpanded node", "وسّع العقدة غير الموسَّعة الأقل تكلفة"),
      points: [
        bi("The fringe is a **priority queue ordered by path cost g(n)**, lowest first.", "الحافة **طابور أولوية (priority queue) مرتَّب حسب تكلفة المسار g(n)**، الأقل أولًا."),
        bi(
          `From Sibiu, UCS expands ${listed(mapUcs.order)} and reaches Bucharest at g = ${mapUcs.cost} through Rimnicu and Pitesti.`,
          `بدءًا من Sibiu يوسّع UCS العقد ${listed(mapUcs.order)}، ويبلغ Bucharest بقيمة g = ${mapUcs.cost} عبر Rimnicu و Pitesti.`,
        ),
      ],
    },
    {
      id: "equal",
      pill: bi("Equal costs", "تكاليف متساوية"),
      heading: bi("With equal step costs, UCS behaves like BFS", "مع تساوي تكاليف الخطوات يتصرف UCS مثل BFS"),
      control: {
        label: bi("Step costs", "تكاليف الخطوات"),
        options: [
          { id: "km", label: bi("Road lengths", "أطوال الطرق") },
          { id: "unit", label: bi("All equal to 1", "كلها تساوي 1") },
        ],
        initial: "km",
      },
      points: [bi("UCS cares about the **total cost** of a path, not its number of steps.", "يهتم UCS بـ**التكلفة الكلية** للمسار، لا بعدد خطواته.")],
      pointsFor: {
        km: [
          bi(
            `With road lengths it expands ${listed(mapUcs.order)} and returns the ${mapUcs.cost} km route.`,
            `مع أطوال الطرق يوسّع العقد ${listed(mapUcs.order)}، ويعيد الطريق الذي طوله ${mapUcs.cost} km.`,
          ),
        ],
        unit: [
          bi(
            `With every step costing 1, g(n) is just the depth: UCS expands ${listed(mapUcsUnit.order)}, exactly BFS's order.`,
            `عندما تكون تكلفة كل خطوة 1 تصبح g(n) هي العمق نفسه: فيوسّع UCS العقد ${listed(mapUcsUnit.order)}، وهو ترتيب BFS تمامًا.`,
          ),
        ],
      },
    },
    {
      id: "goal-test",
      pill: bi("Optimal", "الأمثلية"),
      heading: bi(`Bucharest is generated at ${early.cost} before it is reached at ${mapUcs.cost}`, `تُولَّد Bucharest بتكلفة ${early.cost} قبل الوصول إليها بتكلفة ${mapUcs.cost}`),
      control: {
        label: bi("Goal test when a node is", "اختبار الهدف عند"),
        options: [
          { id: "removed", label: bi("Removed from the fringe", "إزالة العقدة من الحافة") },
          { id: "generated", label: bi("Generated", "توليد العقدة") },
        ],
        initial: "removed",
      },
      points: [
        bi(
          "UCS is **optimal** because nodes leave the fringe in increasing order of g(n): the first goal removed is the cheapest.",
          "يكون UCS **أمثل (optimal)** لأن العقد تغادر الحافة بترتيب تصاعدي لقيمة g(n)، فأول هدف يُزال هو الأرخص.",
        ),
      ],
      pointsFor: {
        removed: [
          bi(
            `Bucharest at ${early.cost} waits in the queue while cheaper paths are expanded; the ${mapUcs.cost} path overtakes it and is removed first.`,
            `تنتظر Bucharest بتكلفة ${early.cost} في الطابور بينما تُوسَّع مسارات أرخص، فيتجاوزها المسار ذو التكلفة ${mapUcs.cost} ويُزال أولًا.`,
          ),
        ],
        generated: [
          bi(
            `Testing on generation would stop as soon as Fagaras is expanded and return ${arrows(early.path)} at ${early.cost} km, which is not optimal.`,
            `أما الاختبار عند التوليد فيتوقف بمجرد توسيع Fagaras، ويعيد ${arrows(early.path)} بطول ${early.cost} km، وهو ليس الأمثل.`,
          ),
        ],
      },
    },
    {
      id: "bound",
      pill: bi("Time and space", "الزمن والمساحة"),
      heading: bi("UCS expands every node cheaper than the solution", "يوسّع UCS كل عقدة أرخص من الحل"),
      control: {
        label: bi("Smallest step cost ε", "أصغر تكلفة خطوة ε"),
        options: [
          { id: "2", label: bi("ε = 2", "ε = 2") },
          { id: "1", label: bi("ε = 1", "ε = 1") },
          { id: "0", label: bi("ε = 0", "ε = 0") },
        ],
        initial: "2",
      },
      points: [
        bi(
          "UCS expands every node with g ≤ C*. A path can take ⌈C*/ε⌉ steps before its cost passes C*, so time and space are O(b^⌈C*/ε⌉).",
          "يوسّع UCS كل عقدة تحقق g ≤ C*. ويمكن أن يمتد المسار ⌈C*/ε⌉ خطوة قبل أن تتجاوز تكلفته C*، لذا يكون الزمن والمساحة O(b^⌈C*/ε⌉).",
        ),
      ],
      pointsFor: {
        "2": [bi(`With C* = ${C_STAR} and ε = 2, paths up to ${C_STAR / 2} steps deep are cheaper than the solution.`, `عندما C* = ${C_STAR} و ε = 2 تكون المسارات حتى عمق ${C_STAR / 2} خطوات أرخص من الحل.`)],
        "1": [bi(`Halve ε and the bound doubles to ${C_STAR} steps: the exponent grows as ε shrinks.`, `إذا نصّفنا ε تضاعف الحد إلى ${C_STAR} خطوات: فالأُس يكبر كلما صغرت ε.`)],
        "0": [
          bi(
            "With zero-cost steps a path can grow forever without its cost passing C*: UCS may loop, which is why it needs every step cost ≥ ε > 0.",
            "مع خطوات تكلفتها صفر يمكن أن يطول المسار إلى الأبد دون أن تتجاوز تكلفته C*، فقد يدور UCS بلا نهاية، ولهذا يحتاج إلى أن تكون تكلفة كل خطوة ≥ ε > 0.",
          ),
        ],
      },
    },
  ],
});

// ---------- Depth-first search ----------
const dfsTree = treeOf(DFS_TREE);
const dfsRun = runSearch(dfsTree, "dfs", DFS_GOAL);
const bfsOnDfsTree = runSearch(dfsTree, "bfs", DFS_GOAL);
const shallowGoal = { dfs: runSearch(dfsTree, "dfs", "C"), bfs: runSearch(dfsTree, "bfs", "C") };
const denseGoal = { dfs: runSearch(dfsTree, "dfs", "H"), bfs: runSearch(dfsTree, "bfs", "H") };
export const TWO_GOALS = ["K", "C"] as const;
const twoGoals = { dfs: firstGoal(dfsTree, "dfs", TWO_GOALS), bfs: firstGoal(dfsTree, "bfs", TWO_GOALS) };
const dfsHeld = memoryAtEnd(dfsRun);
const bfsHeld = memoryAtEnd(bfsOnDfsTree);
const dfsSiblings = dfsHeld.filter((id) => !dfsRun.path!.includes(id));

export const dfs = defineWalkthrough({
  id: "ai3-dfs",
  title: bi("Depth-first search: dive, then backtrack", "البحث بالعمق أولًا: غُص ثم تراجع"),
  analogy: bi(
    "Exploring a cave with a ball of string: follow one passage to its end, wind back to the last fork, and try the next passage.",
    "استكشاف كهف بكرة خيط: تتبع ممرًا واحدًا حتى نهايته، ثم تلفّ الخيط عائدًا إلى آخر تفرّع وتجرّب الممر التالي.",
  ),
  facts: { dfs: join(dfsRun.order), expanded: dfsRun.order.length, path: join(dfsRun.path) },
  panels: [
    {
      id: "lifo",
      pill: bi("LIFO stack", "مكدس LIFO"),
      heading: bi("Expand the deepest unexpanded node", "وسّع العقدة غير الموسَّعة الأعمق"),
      points: [
        bi(
          "The fringe is a **LIFO stack**: a node's children go on top, so the search dives to the left-most leaf before it **backtracks**.",
          "الحافة **مكدس (stack) من نوع LIFO**: يوضع أبناء العقدة في أعلاه، فيغوص البحث إلى الورقة الأقصى يسارًا قبل أن **يتراجع (backtrack)**.",
        ),
        bi(
          `With goal ${DFS_GOAL} it expands ${dfsRun.order.length} nodes, ${listed(dfsRun.order)}, and returns the path ${arrows(dfsRun.path)}.`,
          `مع الهدف ${DFS_GOAL} يوسّع ${dfsRun.order.length} عقدة، هي ${listed(dfsRun.order)}، ويعيد المسار ${arrows(dfsRun.path)}.`,
        ),
      ],
    },
    {
      id: "complete",
      pill: bi("Complete?", "مكتمل؟"),
      heading: bi("An endless branch or a loop traps DFS", "الفرع الذي لا ينتهي أو الحلقة يوقعان DFS في الفخ"),
      control: {
        label: bi("State space", "فضاء الحالات"),
        options: [
          { id: "infinite", label: bi("Infinite depth", "عمق لا نهائي") },
          { id: "loop", label: bi("A loop", "حلقة") },
          { id: "check", label: bi("Loop check on the path", "فحص الحلقات على المسار") },
        ],
        initial: "infinite",
      },
      points: [bi("DFS is **not complete**: it can dive forever and never come back to the goal.", "البحث DFS **ليس مكتملًا (complete)**: فقد يغوص إلى الأبد ولا يعود أبدًا إلى الهدف.")],
      pointsFor: {
        infinite: [bi("The left branch never ends, so DFS keeps diving and never tries G, one step to the right of the root.", "الفرع الأيسر لا ينتهي، فيظل DFS يغوص فيه ولا يجرّب أبدًا G التي تبعد خطوة واحدة يمين الجذر.")],
        loop: [bi("With reversible actions, A → B → A → B → … is an endless path through just two states.", "مع الأفعال القابلة للعكس يصبح A → B → A → B → … مسارًا لا ينتهي عبر حالتين فقط.")],
        check: [
          bi(
            "Skipping a state already on the current path breaks the loop: DFS backtracks to A, tries G, and is complete in **finite** spaces.",
            "تجاوز الحالة الموجودة على المسار الحالي يكسر الحلقة: فيتراجع DFS إلى A ويجرّب G، ويصبح مكتملًا في الفضاءات **المنتهية**.",
          ),
        ],
      },
    },
    {
      id: "time",
      pill: bi("Time", "الزمن"),
      heading: bi("O(b^m): terrible or fast, depending on the goals", "O(b^m): سيئ جدًا أو سريع، حسب موقع الأهداف"),
      control: {
        label: bi("Goal", "الهدف"),
        options: [
          { id: "C", label: bi("C, depth 1", "C، العمق 1") },
          { id: "H", label: bi("H, the first leaf", "H، أول ورقة") },
        ],
        initial: "C",
      },
      points: [bi("In the worst case DFS visits the whole tree down to the maximum depth m: **O(b^m)** time.", "في أسوأ الحالات يزور DFS الشجرة كلها حتى أقصى عمق m، أي زمن **O(b^m)**.")],
      pointsFor: {
        C: [
          bi(
            `Goal C is at depth 1, but DFS first explores B's whole subtree: ${shallowGoal.dfs.order.length} nodes against BFS's ${shallowGoal.bfs.order.length}. Terrible when m is much larger than d.`,
            `الهدف C عند العمق 1، لكن DFS يستكشف أولًا الشجرة الفرعية لـ B كاملةً: ${shallowGoal.dfs.order.length} عقد مقابل ${shallowGoal.bfs.order.length} لـ BFS. وهذا سيئ جدًا عندما يكون m أكبر بكثير من d.`,
          ),
        ],
        H: [
          bi(
            `Goal H is the first leaf DFS reaches: ${denseGoal.dfs.order.length} nodes against BFS's ${denseGoal.bfs.order.length}. When solutions are dense, DFS may be much faster.`,
            `الهدف H هو أول ورقة يبلغها DFS: ${denseGoal.dfs.order.length} عقد مقابل ${denseGoal.bfs.order.length} لـ BFS. فعندما تكون الحلول كثيفة قد يكون DFS أسرع بكثير.`,
          ),
        ],
      },
    },
    {
      id: "space",
      pill: bi("Space", "المساحة"),
      heading: bi(`Memory when the goal ${DFS_GOAL} is found`, `الذاكرة عند العثور على الهدف ${DFS_GOAL}`),
      control: {
        label: bi("Search", "البحث"),
        options: [
          { id: "dfs", label: bi("DFS", "DFS") },
          { id: "bfs", label: bi("BFS", "BFS") },
        ],
        initial: "dfs",
      },
      points: [bi("DFS needs only **linear space**, O(bm): the current path plus the unexpanded siblings along it.", "لا يحتاج DFS إلا إلى **مساحة خطية**، O(bm): المسار الحالي والعقد الشقيقة غير الموسَّعة على امتداده.")],
      pointsFor: {
        dfs: [
          bi(
            `DFS holds ${dfsHeld.length} nodes: the path ${arrows(dfsRun.path)} and the unexpanded sibling ${dfsSiblings.join(", ")}. Fully explored subtrees have been dropped.`,
            `يحتفظ DFS بـ ${dfsHeld.length} عقد: المسار ${arrows(dfsRun.path)} والعقدة الشقيقة غير الموسَّعة ${dfsSiblings.join(", ")}، فقد حُذفت الأشجار الفرعية التي استُكشفت كاملةً.`,
          ),
        ],
        bfs: [
          bi(
            `BFS has generated all ${bfsHeld.length} nodes and keeps every one, so its memory grows like the tree itself.`,
            `أما BFS فقد ولّد العقد الـ ${bfsHeld.length} كلها ويحتفظ بها جميعًا، لذا تنمو ذاكرته بنمو الشجرة نفسها.`,
          ),
        ],
      },
    },
    {
      id: "optimal",
      pill: bi("Optimal?", "أمثل؟"),
      heading: bi("DFS returns the first goal it meets", "يعيد DFS أول هدف يصادفه"),
      points: [
        bi(
          `With goals at ${TWO_GOALS[0]} (depth 3) and ${TWO_GOALS[1]} (depth 1), DFS reaches ${twoGoals.dfs.goal} first and returns the ${twoGoals.dfs.path!.length - 1}-step path ${arrows(twoGoals.dfs.path)}.`,
          `مع هدفين عند ${TWO_GOALS[0]} (العمق 3) و ${TWO_GOALS[1]} (العمق 1)، يبلغ DFS الهدف ${twoGoals.dfs.goal} أولًا ويعيد المسار ${arrows(twoGoals.dfs.path)} المكوَّن من ${twoGoals.dfs.path!.length - 1} خطوات.`,
        ),
        bi(
          `BFS would return ${arrows(twoGoals.bfs.path)}, one step. DFS is **not optimal**.`,
          `بينما يعيد BFS المسار ${arrows(twoGoals.bfs.path)}، وهو خطوة واحدة. فـ DFS **ليس أمثل (optimal)**.`,
        ),
      ],
    },
  ],
});

// ---------- Depth-limited search ----------
const dls = (limit: number) => depthLimited(dfsTree, DFS_GOAL, limit);
const dlsPoint = (limit: number) => {
  const r = dls(limit);
  return r.outcome === "found"
    ? bi(
        `With l = ${limit} it reaches ${DFS_GOAL} after ${r.order.length} nodes and returns the path ${arrows(r.path)}.`,
        `عندما l = ${limit} يبلغ ${DFS_GOAL} بعد ${r.order.length} عقدة ويعيد المسار ${arrows(r.path)}.`,
      )
    : bi(
        `With l = ${limit} it visits ${listed(r.order)} and returns **cutoff**: ${DFS_GOAL} lies below the limit.`,
        `عندما l = ${limit} يزور ${listed(r.order)} ويُرجع **القطع (cutoff)**: فالهدف ${DFS_GOAL} يقع تحت الحد.`,
      );
};
export const NO_SOLUTION_TREE = BFS_TREE;
const bfsTree = treeOf(BFS_TREE);
const noSolution = (limit: number) => depthLimited(bfsTree, NO_GOAL, limit);
export const ROMANIA_CITIES = 20;

export const dlsWalk = defineWalkthrough({
  id: "ai3-dls",
  title: bi("Depth-limited search: DFS with a depth limit", "البحث محدود العمق: DFS مع حدٍّ للعمق"),
  analogy: bi(
    "Searching a building under orders not to go below the third basement: you may miss what is deeper, but you can never get lost going down forever.",
    "تفتيش مبنى مع تعليمات بعدم النزول تحت الطابق السفلي الثالث: قد يفوتك ما هو أعمق، لكنك لن تضيع أبدًا في نزول لا ينتهي.",
  ),
  facts: { romania: ROMANIA_CITIES - 1 },
  panels: [
    {
      id: "limit",
      pill: bi("Depth limit l", "حد العمق l"),
      heading: bi("Nodes at depth l are treated as having no successors", "تُعامَل العقد عند العمق l كأنها بلا حالات تالية"),
      control: {
        label: bi("Limit", "الحد"),
        options: [
          { id: "1", label: bi("l = 1", "l = 1") },
          { id: "2", label: bi("l = 2", "l = 2") },
          { id: "3", label: bi("l = 3", "l = 3") },
        ],
        initial: "1",
      },
      points: [
        bi(
          "DLS is DFS that stops at depth **l**: the subtree under a node at the limit is never generated, so no path can run forever.",
          "البحث DLS هو DFS يتوقف عند العمق **l**: فالشجرة الفرعية تحت العقدة الواقعة عند الحد لا تُولَّد أبدًا، ولا يمكن لأي مسار أن يمتد إلى الأبد.",
        ),
      ],
      pointsFor: { "1": [dlsPoint(1)], "2": [dlsPoint(2)], "3": [dlsPoint(3)] },
    },
    {
      id: "outcomes",
      pill: bi("Cutoff or failure", "القطع أم الإخفاق"),
      heading: bi("Two ways to come back without a solution", "طريقتان للعودة دون حل"),
      control: {
        label: bi("Limit", "الحد"),
        options: [
          { id: "1", label: bi("l = 1", "l = 1") },
          { id: "3", label: bi("l = 3", "l = 3") },
        ],
        initial: "1",
      },
      points: [
        bi(
          "This tree has no goal at all. **cutoff** means the limit stopped the search, so a deeper solution might exist; **failure** means there is none.",
          "لا هدف في هذه الشجرة على الإطلاق. ويعني **القطع (cutoff)** أن الحد أوقف البحث، فقد يوجد حل أعمق، أما **الإخفاق (failure)** فيعني أنه لا يوجد حل.",
        ),
      ],
      pointsFor: {
        "1": [
          bi(
            `${noSolution(1).cut.join(" and ")} sit at the limit with children left unexplored, so cutoff-occurred? becomes true and DLS returns **${noSolution(1).outcome}**.`,
            `تقع ${noSolution(1).cut.join(" و ")} عند الحد ولها أبناء لم تُستكشف، فتصبح cutoff-occurred? صحيحة ويُرجع DLS **القطع (${noSolution(1).outcome})**.`,
          ),
        ],
        "3": [
          bi(
            `Every branch ends above the limit and none holds the goal, so DLS returns **${noSolution(3).outcome}**: the tree has no solution.`,
            `ينتهي كل فرع قبل الحد ولا يحمل أي منها الهدف، لذا يُرجع DLS **الإخفاق (${noSolution(3).outcome})**: فلا حل في الشجرة.`,
          ),
        ],
      },
    },
    {
      id: "choose",
      pill: bi("Choosing l", "اختيار l"),
      heading: bi("Complete only if l ≥ d", "مكتمل فقط إذا كان l ≥ d"),
      points: [
        bi("DLS is complete only if **l ≥ d**, and like DFS it is **not optimal**.", "لا يكون DLS مكتملًا إلا إذا كان **l ≥ d**، وهو مثل DFS **ليس أمثل**."),
        bi(
          `Choosing l needs knowledge of the problem: Romania has ${ROMANIA_CITIES} cities, so any solution has at most ${ROMANIA_CITIES - 1} steps and l = ${ROMANIA_CITIES - 1} is safe.`,
          `يحتاج اختيار l إلى معرفة بالمسألة: ففي رومانيا ${ROMANIA_CITIES} مدينة، لذا لا يزيد طول أي حل على ${ROMANIA_CITIES - 1} خطوة، ويكون l = ${ROMANIA_CITIES - 1} آمنًا.`,
        ),
      ],
    },
  ],
});

// ---------- Iterative deepening search ----------
const ids = iterativeDeepening(dfsTree, DFS_GOAL);
const idsPoint = (limit: number) => {
  const r = ids.runs[limit];
  if (r.outcome === "found") {
    const sum = ids.runs.map((x) => x.order.length);
    return bi(
      `l = ${limit}: ${listed(r.order)}; ${DFS_GOAL} is the goal. Over the ${ids.runs.length} iterations IDS visited ${sum.join(" + ")} = ${ids.visited} nodes.`,
      `l = ${limit}: ${listed(r.order)}، و ${DFS_GOAL} هي الهدف. وعلى امتداد التكرارات الـ ${ids.runs.length} زار IDS ${sum.join(" + ")} = ${ids.visited} عقدة.`,
    );
  }
  return bi(`l = ${limit}: ${listed(r.order)}. The result is cutoff, so IDS tries l = ${limit + 1}.`, `l = ${limit}: ${listed(r.order)}. والنتيجة قطع (cutoff)، لذا يجرّب IDS الحد l = ${limit + 1}.`);
};
export const IDS_EXAMPLES = { b10: { b: 10, d: 5, root: false }, b2: { b: 2, d: 3, root: true } } as const;

export const idsWalk = defineWalkthrough({
  id: "ai3-ids",
  title: bi("Iterative deepening: DLS with limits 0, 1, 2, …", "التعميق التكراري: DLS بالحدود 0, 1, 2, …"),
  analogy: bi(
    "Looking for lost keys: first within arm's reach, then the room, then the house. Each round rechecks the near spots, but they are quick to check.",
    "البحث عن مفاتيح ضائعة: أولًا في متناول يدك، ثم في الغرفة، ثم في البيت. وكل جولة تعيد فحص الأماكن القريبة، لكن فحصها سريع.",
  ),
  facts: {
    l0: join(ids.runs[0].order),
    l1: join(ids.runs[1].order),
    l2: join(ids.runs[2].order),
    l3: join(ids.runs[3].order),
    ids: idsGenerated(10, 5, false),
    bfs: bfsGenerated(10, 5, "expansion", false),
    "bfs-gen": bfsGenerated(10, 5, "generation", false),
    practice: idsGenerated(2, 3, true),
  },
  panels: [
    {
      id: "iterations",
      pill: bi("Growing limit", "حد متزايد"),
      heading: bi("Each iteration reruns DLS one level deeper", "كل تكرار يعيد تشغيل DLS أعمق بمستوى واحد"),
      control: {
        label: bi("Iteration", "التكرار"),
        options: ids.runs.map((r) => ({ id: String(r.limit), label: bi(`l = ${r.limit}`, `l = ${r.limit}`) })),
        initial: "0",
      },
      points: [
        bi(
          "IDS runs DLS with l = 0, 1, 2, … until the result is not **cutoff**. Each run is a DFS, so memory stays **O(bd)**.",
          "يشغّل IDS البحث DLS بالحدود l = 0, 1, 2, … حتى لا تكون النتيجة **قطعًا (cutoff)**. وكل تشغيل هو DFS، لذا تبقى الذاكرة **O(bd)**.",
        ),
      ],
      pointsFor: Object.fromEntries(ids.runs.map((r) => [String(r.limit), [idsPoint(r.limit)]])),
    },
    {
      id: "formula",
      pill: bi("Counting nodes", "عدّ العقد"),
      heading: bi("Level k is generated d + 1 − k times", "يُولَّد المستوى k عدد d + 1 − k من المرات"),
      control: {
        label: bi("Example", "المثال"),
        options: [
          { id: "b10", label: bi("b = 10, d = 5", "b = 10, d = 5") },
          { id: "b2", label: bi("b = 2, d = 3", "b = 2, d = 3") },
        ],
        initial: "b10",
      },
      points: [
        bi(
          "The bottom level is generated once, the level above it twice, and so on: (d + 1)b^0 + d·b^1 + … + b^d = O(b^d).",
          "يُولَّد المستوى السفلي مرة واحدة، والمستوى الذي فوقه مرتين، وهكذا: (d + 1)b^0 + d·b^1 + … + b^d = O(b^d).",
        ),
      ],
      pointsFor: {
        b10: [
          bi(
            `For b = 10 and d = 5, not counting the root: ${thousands(idsGenerated(10, 5, false))} nodes in the worst case.`,
            `عندما b = 10 و d = 5، ودون احتساب الجذر: ${thousands(idsGenerated(10, 5, false))} عقدة في أسوأ الحالات.`,
          ),
        ],
        b2: [
          bi(
            `For b = 2 and d = 3, counting the root in every iteration: ${idsGenerated(2, 3, true)} nodes, as in the IDS overhead exercise.`,
            `عندما b = 2 و d = 3، مع احتساب الجذر في كل تكرار: ${idsGenerated(2, 3, true)} عقدة، كما في تمرين التكلفة الإضافية لـ IDS.`,
          ),
        ],
      },
    },
    {
      id: "overhead",
      pill: bi("IDS vs. BFS", "IDS مقابل BFS"),
      heading: bi("Repeating the upper levels costs little", "تكرار المستويات العليا قليل التكلفة"),
      control: {
        label: bi("Count for", "العدّ لـ"),
        options: [
          { id: "ids", label: bi("IDS", "IDS") },
          { id: "bfs", label: bi("BFS, test on expansion", "BFS، الاختبار عند التوسيع") },
          { id: "bfs-gen", label: bi("BFS, test on generation", "BFS، الاختبار عند التوليد") },
        ],
        initial: "ids",
      },
      points: [
        bi(
          "For b = 10 and d = 5, most nodes live on the bottom level, so regenerating the levels above it adds little.",
          "عندما b = 10 و d = 5 تقع معظم العقد في المستوى السفلي، لذا لا تضيف إعادة توليد المستويات التي فوقه إلا القليل.",
        ),
      ],
      pointsFor: {
        ids: [
          bi(
            `IDS: ${thousands(idsGenerated(10, 5, false))} nodes, and the bottom level alone is ${thousands(10 ** 5)} of them.`,
            `IDS: ${thousands(idsGenerated(10, 5, false))} عقدة، منها ${thousands(10 ** 5)} في المستوى السفلي وحده.`,
          ),
        ],
        bfs: [
          bi(
            `BFS testing on expansion: ${thousands(bfsGenerated(10, 5, "expansion", false))} nodes, because it also generates ${thousands(10 * (10 ** 5 - 1))} at depth 6. That is ${Math.round(bfsGenerated(10, 5, "expansion", false) / idsGenerated(10, 5, false))} times IDS.`,
            `BFS مع الاختبار عند التوسيع: ${thousands(bfsGenerated(10, 5, "expansion", false))} عقدة، لأنه يولّد أيضًا ${thousands(10 * (10 ** 5 - 1))} عقدة عند العمق 6، أي ${Math.round(bfsGenerated(10, 5, "expansion", false) / idsGenerated(10, 5, false))} أضعاف IDS.`,
          ),
        ],
        "bfs-gen": [
          bi(
            `BFS testing on generation: ${thousands(bfsGenerated(10, 5, "generation", false))} nodes, so IDS does about ${Math.round((idsGenerated(10, 5, false) / bfsGenerated(10, 5, "generation", false) - 1) * 100)}% more work. That is the price of its O(bd) memory.`,
            `BFS مع الاختبار عند التوليد: ${thousands(bfsGenerated(10, 5, "generation", false))} عقدة، أي إن IDS يؤدي عملًا أكثر بنحو ${Math.round((idsGenerated(10, 5, false) / bfsGenerated(10, 5, "generation", false) - 1) * 100)}%، وهذا ثمن ذاكرته O(bd).`,
          ),
        ],
      },
    },
  ],
});

// ---------- Summary of algorithms ----------
export const summary = defineWalkthrough({
  id: "ai3-summary",
  title: bi("Five strategies side by side", "خمس استراتيجيات جنبًا إلى جنب"),
  analogy: bi(
    "A spec sheet for five cars: no model wins every row, so the right choice depends on what you can afford.",
    "جدول مواصفات لخمس سيارات: لا يتفوق طراز واحد في كل الصفوف، لذا يعتمد الاختيار الصحيح على ما تستطيع تحمّله.",
  ),
  panels: [
    {
      id: "guarantees",
      pill: bi("Complete, optimal", "الاكتمال والأمثلية"),
      heading: bi("Which strategies guarantee an answer, and the best one", "أي الاستراتيجيات تضمن إجابة، والإجابة الأفضل"),
      points: [
        bi(
          "BFS is complete if b is finite and UCS if step costs ≥ ε > 0; DLS only if l ≥ d; DFS is not complete.",
          "يكون BFS مكتملًا إذا كان b منتهيًا، و UCS إذا كانت تكاليف الخطوات ≥ ε > 0، و DLS فقط إذا كان l ≥ d، أما DFS فليس مكتملًا.",
        ),
        bi("UCS is optimal; BFS and IDS are optimal when all step costs are equal; DFS and DLS are not.", "البحث UCS أمثل، و BFS و IDS أمثلان عندما تتساوى تكاليف جميع الخطوات، أما DFS و DLS فليسا أمثلين."),
      ],
    },
    {
      id: "costs",
      pill: bi("Time and space", "الزمن والمساحة"),
      heading: bi("Exponential time for all, linear space for three", "زمن أُسّي للجميع، ومساحة خطية لثلاثة"),
      points: [
        bi("Every strategy takes **exponential time** in the worst case.", "تستغرق كل الاستراتيجيات **زمنًا أُسّيًّا** في أسوأ الحالات."),
        bi("Only the depth-first family needs **linear space**: bm for DFS, bl for DLS and bd for IDS.", "لا يحتاج إلى **مساحة خطية** إلا عائلة البحث بالعمق أولًا: bm لـ DFS، و bl لـ DLS، و bd لـ IDS."),
      ],
    },
    {
      id: "pick",
      pill: bi("Which one?", "أيها؟"),
      heading: bi("Pick the strategy that fits the problem", "اختر الاستراتيجية التي تناسب المسألة"),
      control: {
        label: bi("The problem has", "في المسألة"),
        options: [
          { id: "unit", label: bi("Equal costs, enough memory", "تكاليف متساوية وذاكرة كافية") },
          { id: "costs", label: bi("Different step costs", "تكاليف خطوات مختلفة") },
          { id: "memory", label: bi("Little memory, unknown depth", "ذاكرة قليلة وعمق مجهول") },
        ],
        initial: "memory",
      },
      points: [bi("No strategy wins every row of the table, so the problem decides.", "لا تتفوق أي استراتيجية في كل صفوف الجدول، لذا فالمسألة هي التي تقرر.")],
      pointsFor: {
        unit: [bi("**BFS** finds the shallowest solution, which is the cheapest when steps cost the same, if its memory fits.", "يجد **BFS** الحل الأقل عمقًا، وهو الأرخص عندما تتساوى تكاليف الخطوات، إن اتسعت له الذاكرة.")],
        costs: [bi("**UCS** expands in order of path cost, so the first goal it removes is the cheapest solution.", "يوسّع **UCS** بترتيب تكلفة المسار، لذا يكون أول هدف يزيله هو الحل الأرخص.")],
        memory: [
          bi(
            "**IDS** is the preferred uninformed method: linear space, complete, and not much more time than BFS.",
            "البحث **IDS** هو الطريقة غير المُوجَّهة المفضلة: مساحة خطية، ومكتمل، وزمن لا يزيد كثيرًا على زمن BFS.",
          ),
        ],
      },
    },
  ],
});

// ---------- Repeated states and graph search ----------
export const CHAIN = ["A", "B", "C", "D"] as const;
export const CHAIN_TREE = chainTree(CHAIN);
const chainNodes = placeTree(CHAIN_TREE, { x: 0, y: 0, w: 1, h: 1 }).nodes.length;
const chainLevels = CHAIN.map((_, k) => 2 ** k);
const chainRun = runSearch(chainProblem(CHAIN), "bfs", CHAIN[CHAIN.length - 1]);
const chainSkips = chainRun.steps.filter((s) => s.kind === "skip").length;
const romaniaOrder = runSearch(treeOf(ROMANIA_TREE), "bfs", NO_GOAL).order;
const romaniaRepeats = repeatsIn(romaniaOrder);
const countOf = (ids: readonly string[], name: string) => ids.filter((id) => id.split("#")[0] === name).length;

export const graphSearch = defineWalkthrough({
  id: "ai3-graph-search",
  title: bi("Repeated states and the closed set", "الحالات المتكررة والمجموعة المغلقة"),
  analogy: bi(
    "Chalking a cross on every room you have searched: when a corridor leads back to a marked room, you do not search it again.",
    "رسم علامة بالطباشير على كل غرفة فتّشتها: عندما يقودك ممر إلى غرفة معلَّمة، لا تفتشها مرة أخرى.",
  ),
  panels: [
    {
      id: "unfold",
      pill: bi("Linear becomes exponential", "الخطي يصبح أُسّيًّا"),
      heading: bi(`${CHAIN.length} states, ${chainNodes} nodes`, `${CHAIN.length} حالات و ${chainNodes} عقدة`),
      points: [
        bi(
          `In this chain each state has two actions leading to the next, so there are only ${CHAIN.length} states.`,
          `في هذه السلسلة لكل حالة فعلان يؤديان إلى الحالة التالية، لذا لا يوجد إلا ${CHAIN.length} حالات.`,
        ),
        bi(
          `Tree search treats every path as a new node: ${chainLevels.join(" + ")} = ${chainNodes} nodes. With d + 1 states it builds 2^d paths to the last one.`,
          `يعامل البحث الشجري كل مسار على أنه عقدة جديدة: ${chainLevels.join(" + ")} = ${chainNodes} عقدة. ومع d + 1 حالة يبني 2^d مسارًا إلى الحالة الأخيرة.`,
        ),
      ],
    },
    {
      id: "closed",
      pill: bi("The closed set", "المجموعة المغلقة"),
      heading: bi("Graph search expands each state once", "يوسّع البحث في الرسم البياني كل حالة مرة واحدة"),
      points: [
        bi(
          "Before expanding a node, graph search looks up its state in the **closed set**; a state already there is skipped.",
          "قبل توسيع أي عقدة يبحث البحث في الرسم البياني (graph search) عن حالتها في **المجموعة المغلقة (closed set)**، فإن كانت فيها تخطّاها.",
        ),
        bi(
          `On the chain, BFS with a closed set expands ${listed(chainRun.order)} once each and skips the ${chainSkips} repeated copies.`,
          `على هذه السلسلة يوسّع BFS مع المجموعة المغلقة الحالات ${listed(chainRun.order)} مرة واحدة لكل منها، ويتخطى النسخ المتكررة وعددها ${chainSkips}.`,
        ),
      ],
    },
    {
      id: "romania",
      pill: bi("Back to Romania", "عودة إلى رومانيا"),
      heading: bi("Roads in both directions put Arad back in the fringe", "الطرق ذات الاتجاهين تعيد Arad إلى الحافة"),
      control: {
        label: bi("Search", "البحث"),
        options: [
          { id: "tree", label: bi("Tree search", "البحث الشجري") },
          { id: "graph", label: bi("Graph search", "البحث في الرسم البياني") },
        ],
        initial: "tree",
      },
      points: [bi("Every neighbour of Arad leads straight back to Arad, so the same state keeps returning.", "كل جار لـ Arad يقود مباشرة إلى Arad، لذا تظل الحالة نفسها تعود.")],
      pointsFor: {
        tree: [
          bi(
            `Tree search expands all ${romaniaOrder.length} nodes, including ${countOf(romaniaRepeats, "Arad")} more copies of Arad, and each copy regrows the same subtree.`,
            `يوسّع البحث الشجري العقد الـ ${romaniaOrder.length} كلها، ومنها ${countOf(romaniaRepeats, "Arad")} نسخ أخرى من Arad، وكل نسخة تعيد إنماء الشجرة الفرعية نفسها.`,
          ),
        ],
        graph: [
          bi(
            `In BFS order, graph search skips Arad ${countOf(romaniaRepeats, "Arad")} times and Oradea ${countOf(romaniaRepeats, "Oradea") === 1 ? "once" : `${countOf(romaniaRepeats, "Oradea")} times`}: ${romaniaOrder.length - romaniaRepeats.length} states expanded instead of ${romaniaOrder.length} nodes.`,
            `بترتيب BFS يتخطى البحث في الرسم البياني Arad ${countOf(romaniaRepeats, "Arad")} مرات و Oradea ${countOf(romaniaRepeats, "Oradea") === 1 ? "مرة واحدة" : `${countOf(romaniaRepeats, "Oradea")} مرات`}: فتُوسَّع ${romaniaOrder.length - romaniaRepeats.length} حالات بدلًا من ${romaniaOrder.length} عقدة.`,
          ),
        ],
      },
    },
  ],
});

// ---------- Implementation in Python ----------
const pyRuns = { bfs: pyBfsDfs("bfs", PY_GRAPH, "A", "G"), dfs: pyBfsDfs("dfs", PY_GRAPH, "A", "G"), ucs: pyUcs(PY_GRAPH, "A", "G") };
const pyIdsCalls = pyIds(PY_GRAPH, "A", "G");
const pops = (k: keyof typeof pyRuns) => pyRuns[k].steps.map((s) => s.node).join(", ");
const pyResult = (r: string[] | "cutoff" | null) => (Array.isArray(r) ? pyList(r) : r === null ? "None" : `"${r}"`);

export const python = defineWalkthrough({
  id: "ai3-python",
  title: bi("From pseudocode to Python", "من الشيفرة الزائفة إلى Python"),
  analogy: bi(
    "One machine with swappable trays: change the tray (queue, stack or heap) and the same machine hands out the work in a different order.",
    "آلة واحدة بأدراج قابلة للتبديل: بدّل الدرج (طابور أو مكدس أو كومة) فتوزّع الآلة نفسها العمل بترتيب مختلف.",
  ),
  facts: { bfs: join(pyRuns.bfs.path), ids: join(pyIdsCalls[pyIdsCalls.length - 1].result as string[]) },
  panels: [
    {
      id: "loop",
      pill: bi("One loop", "حلقة واحدة"),
      heading: bi("Only the line that removes a node changes", "لا يتغير إلا السطر الذي يزيل العقدة"),
      control: {
        label: bi("Function", "الدالة"),
        options: [
          { id: "bfs", label: bi("bfs", "bfs") },
          { id: "dfs", label: bi("dfs", "dfs") },
          { id: "ucs", label: bi("ucs", "ucs") },
        ],
        initial: "bfs",
      },
      points: [
        bi(
          "bfs, dfs and ucs share one while loop: remove a node, return if it is the goal, otherwise add its children to the fringe.",
          "تشترك bfs و dfs و ucs في حلقة while واحدة: أزِل عقدة، وأعِدها إن كانت الهدف، وإلا فأضِف أبناءها إلى الحافة (fringe).",
        ),
      ],
      pointsFor: {
        bfs: [bi(`fringe.popleft() takes the oldest node (FIFO): it pops ${pops("bfs")}.`, `يأخذ fringe.popleft() أقدم عقدة (FIFO): فيُخرج ${pops("bfs")}.`)],
        dfs: [
          bi(
            `fringe.pop() takes the newest node (LIFO); children are pushed in reverse so the left one comes out first: ${pops("dfs")}.`,
            `يأخذ fringe.pop() أحدث عقدة (LIFO)، ويُدفع الأبناء بترتيب معكوس كي يخرج الأيسر أولًا: ${pops("dfs")}.`,
          ),
        ],
        ucs: [
          bi(
            `heapq.heappop takes the lowest g(n). Every cost here is 1, so it pops ${pops("ucs")} and returns cost ${pyRuns.ucs.cost}.`,
            `يأخذ heapq.heappop العقدة صاحبة أقل g(n). وكل التكاليف هنا 1، لذا يُخرج ${pops("ucs")} ويعيد التكلفة ${pyRuns.ucs.cost}.`,
          ),
        ],
      },
    },
    {
      id: "parents",
      pill: bi("Recording parents", "تسجيل العقد الأم"),
      heading: bi("parents rebuilds the path and remembers what was seen", "القاموس parents يعيد بناء المسار ويتذكر ما رُئي"),
      points: [
        bi(
          "Each child's parent is stored when the child is first generated, and child not in parents skips states already seen: that is graph search.",
          "تُخزَّن العقدة الأم لكل ابن عند توليده أول مرة، ويتخطى الشرط child not in parents الحالات التي سبق رؤيتها: وهذا هو البحث في الرسم البياني (graph search).",
        ),
        bi(
          `path_to walks back from G through its parents and reverses the list: ${pyList(pyRuns.bfs.path)}.`,
          `تعود path_to من G عبر العقد الأم ثم تعكس القائمة: ${pyList(pyRuns.bfs.path)}.`,
        ),
      ],
    },
    {
      id: "ids",
      pill: bi("dls and ids", "dls و ids"),
      heading: bi("ids calls dls with depth 0, 1, 2, …", "تستدعي ids الدالة dls بالعمق 0, 1, 2, …"),
      control: {
        label: bi("depth", "depth"),
        options: pyIdsCalls.map((c) => ({ id: String(c.depth), label: bi(String(c.depth), String(c.depth)) })),
        initial: "0",
      },
      points: [
        bi(
          "dls passes limit - 1 to each child; when limit == 0 it returns \"cutoff\" without looking further.",
          "تمرّر dls القيمة limit - 1 إلى كل ابن، وعندما يتحقق limit == 0 تُرجع \"cutoff\" دون أن تنظر أبعد.",
        ),
      ],
      pointsFor: Object.fromEntries(
        pyIdsCalls.map((c) => [
          String(c.depth),
          [
            bi(
              `depth = ${c.depth}: dls tests ${c.tested.join(", ")} and returns ${pyResult(c.result)}${c.result === "cutoff" ? ", so ids tries the next depth" : ", so ids stops"}.`,
              `depth = ${c.depth}: تختبر dls العقد ${c.tested.join(", ")} وتُرجع ${pyResult(c.result)}${c.result === "cutoff" ? "، لذا تجرّب ids العمق التالي" : "، لذا تتوقف ids"}.`,
            ),
          ],
        ]),
      ),
    },
  ],
});

/** Every walkthrough in this lecture, registered in lib/walkthroughs/index.ts. */
export const all = [treeSearch, evaluating, bfs, ucs, dfs, dlsWalk, idsWalk, summary, graphSearch, python] as const;

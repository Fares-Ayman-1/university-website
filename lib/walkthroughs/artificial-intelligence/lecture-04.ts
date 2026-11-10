import { bi } from "@/components/widgets/types";
import { cityName } from "@/lib/widgets/ai-lecture-02";
import {
  ASTAR_RUN,
  GREEDY_RUN,
  H_SLD,
  H_STAR,
  OVER_CITY,
  OVER_RUN,
  OVER_VALUE,
  PUZZLE_START,
  TOY_CONSISTENT_RUN,
  TOY_H_CONSISTENT,
  TOY_H_INCONSISTENT,
  TOY_INCONSISTENT_RUN,
  UCS_RUN,
  belowCStar,
  firstVisits,
  fringeBefore,
  goalFirstSeen,
  greedyLoop,
  manhattan,
  misplaced,
  names,
  puzzleAstar,
} from "@/lib/widgets/ai-lecture-04";
import { defineWalkthrough } from "@/lib/widgets/walkthrough";

/*
 * Artificial Intelligence · Lecture 4 (content/subjects/artificial-intelligence/lectures/04-informed-search.mdx).
 * One walkthrough per heading; the scenes are in
 * components/widgets/walkthrough/scenes/artificial-intelligence/lecture-04/. Every order, cost
 * and count below comes from lib/widgets/ai-lecture-04.ts, and the page's `expect` checks the
 * ones it prints.
 */

const C_STAR = ASTAR_RUN.cost!;
const thousands = (n: number) => n.toLocaleString("en-US");
/** "Rimnicu_Vilcea" → "Rimnicu Vilcea" */
const nm = cityName;

// ---------- What makes a search informed ----------
const ucsCities = firstVisits(UCS_RUN);
const greedyCities = firstVisits(GREEDY_RUN);
const afterArad = (run: typeof ASTAR_RUN) => run.steps[0].fringe;
const queueLine = (run: typeof ASTAR_RUN, key: "g" | "h" | "f") =>
  afterArad(run)
    .map((n) => `${nm(n.city)} ${n[key]}`)
    .join(", ");

export const informed = defineWalkthrough({
  id: "ai4-informed",
  title: bi("Blind versus informed search", "البحث الأعمى مقابل البحث المُوجَّه"),
  analogy: bi(
    "Looking for a friend's house in a new city: you can try every street in order of how far you have walked, or head for the tower you know stands next to it.",
    "البحث عن بيت صديق في مدينة جديدة: يمكنك أن تجرّب كل شارع بحسب المسافة التي مشيتها، أو أن تتجه نحو البرج الذي تعرف أنه يقف بجواره.",
  ),
  facts: { "ucs-cities": ucsCities.length, "greedy-cities": greedyCities.length },
  panels: [
    {
      id: "blind-informed",
      pill: bi("Same map, two searches", "خريطة واحدة وبحثان"),
      heading: bi("Blind search spreads out; informed search heads for the goal", "البحث الأعمى ينتشر، والبحث المُوجَّه يتجه نحو الهدف"),
      control: {
        label: bi("Search", "البحث"),
        options: [
          { id: "ucs", label: bi("Uniform-cost (blind)", "التكلفة الموحدة (أعمى)") },
          { id: "greedy", label: bi("Greedy with h_SLD (informed)", "الجشع مع h_SLD (مُوجَّه)") },
        ],
        initial: "ucs",
      },
      points: [
        bi(
          "Both searches start in **Arad** and stop when **Bucharest** is removed from the fringe; the numbers give the order in which cities are first removed.",
          "يبدأ البحثان كلاهما في **Arad** ويتوقفان عندما تُزال **Bucharest** من الحافة (fringe)؛ وتعطي الأرقام ترتيب أول إزالة لكل مدينة.",
        ),
      ],
      pointsFor: {
        ucs: [
          bi(
            `**Uniform-cost search** knows only the road lengths driven so far, so it spreads out in every direction: ${ucsCities.length} cities, including Zerind, Timisoara and Lugoj, which lie away from Bucharest.`,
            `لا يعرف **البحث بالتكلفة الموحدة (uniform-cost)** إلا أطوال الطرق المقطوعة حتى الآن، لذا ينتشر في كل اتجاه: ${ucsCities.length} مدينة، منها Zerind و Timisoara و Lugoj، وهي تقع بعيدًا عن Bucharest.`,
          ),
        ],
        greedy: [
          bi(
            `**Greedy best-first search** also knows each city's straight-line distance to Bucharest, so it heads south-east: only ${greedyCities.length} cities.`,
            `أما **البحث الجشع الأفضل أولًا (greedy best-first)** فيعرف أيضًا المسافة بخط مستقيم من كل مدينة إلى Bucharest، لذا يتجه نحو الجنوب الشرقي: ${greedyCities.length} مدن فقط.`,
          ),
        ],
      },
    },
    {
      id: "knowledge",
      pill: bi("Extra knowledge", "معرفة إضافية"),
      heading: bi("An informed search uses hints beyond the problem definition", "يستخدم البحث المُوجَّه تلميحات تتجاوز تعريف المسألة"),
      points: [
        bi(
          "The **problem definition** gives the initial state, actions, transition model, goal test and path cost; an uninformed search uses nothing else.",
          "يعطي **تعريف المسألة** الحالة الابتدائية، والأفعال، ونموذج الانتقال (transition model)، واختبار الهدف، وتكلفة المسار؛ ولا يستخدم البحث غير المُوجَّه شيئًا سواها.",
        ),
        bi(
          "An **informed** (heuristic) search adds **domain-specific hints** about where the goal is, as a heuristic function **h(n)**: here, distances computed from the map.",
          "أما البحث **المُوجَّه (informed)** (الاستدلالي) فيضيف **تلميحات خاصة بالمجال** عن موقع الهدف، في صورة دالة استدلالية (heuristic) **h(n)**: وهي هنا مسافات محسوبة من الخريطة.",
        ),
      ],
    },
    {
      id: "best-first",
      pill: bi("Best-first search", "البحث الأفضل أولًا"),
      heading: bi("One fringe ordered by f(n); f picks the strategy", "حافة واحدة مرتبة حسب f(n)، و f تحدد الاستراتيجية"),
      control: {
        label: bi("Evaluation function", "دالة التقييم"),
        options: [
          { id: "ucs", label: bi("f = g", "f = g") },
          { id: "greedy", label: bi("f = h", "f = h") },
          { id: "astar", label: bi("f = g + h", "f = g + h") },
        ],
        initial: "ucs",
      },
      points: [
        bi(
          "**Best-first search** keeps the fringe as a priority queue ordered by an **evaluation function f(n)** and always expands the node with the lowest f. Here Arad has just been expanded.",
          "يحتفظ **البحث الأفضل أولًا (best-first search)** بالحافة طابورَ أولوية مرتَّبًا حسب **دالة تقييم (evaluation function) f(n)**، ويوسّع دائمًا العقدة صاحبة أقل f. وقد وُسِّعت Arad للتو هنا.",
        ),
      ],
      pointsFor: {
        ucs: [
          bi(
            `f(n) = g(n), the path cost so far: ${queueLine(UCS_RUN, "f")}. This is **uniform-cost search**, and Zerind goes first.`,
            `f(n) = g(n)، أي تكلفة المسار حتى الآن: ${queueLine(UCS_RUN, "f")}. وهذا هو **البحث بالتكلفة الموحدة**، فتخرج Zerind أولًا.`,
          ),
        ],
        greedy: [
          bi(
            `f(n) = h(n), the estimated cost to the goal: ${queueLine(GREEDY_RUN, "f")}. This is **greedy best-first search**, and Sibiu goes first.`,
            `f(n) = h(n)، أي التكلفة المقدَّرة إلى الهدف: ${queueLine(GREEDY_RUN, "f")}. وهذا هو **البحث الجشع الأفضل أولًا**، فتخرج Sibiu أولًا.`,
          ),
        ],
        astar: [
          bi(
            `f(n) = g(n) + h(n), the estimated cost of a whole solution through n: ${queueLine(ASTAR_RUN, "f")}. This is **A* search**.`,
            `f(n) = g(n) + h(n)، أي التكلفة المقدَّرة لحل كامل يمر بـ n: ${queueLine(ASTAR_RUN, "f")}. وهذا هو **البحث A* **.`,
          ),
        ],
      },
    },
  ],
});

// ---------- Heuristic functions ----------
const ARAD_ROAD = H_STAR.Arad;

export const heuristic = defineWalkthrough({
  id: "ai4-heuristic",
  title: bi("The heuristic function h(n)", "الدالة الاستدلالية h(n)"),
  analogy: bi(
    "A satnav that shows the distance to your destination as the crow flies: not the road you will drive, but a quick and useful hint of how far you still are.",
    "جهاز ملاحة يعرض المسافة إلى وجهتك في خط مستقيم: ليست الطريق التي ستقودها، لكنها تلميح سريع ومفيد لمدى بعدك.",
  ),
  facts: { arad: H_SLD.Arad, road: ARAD_ROAD },
  panels: [
    {
      id: "estimate",
      pill: bi("Estimate the rest", "قدّر ما تبقّى"),
      heading: bi("h(n) estimates the cost still to go from n", "تقدّر h(n) التكلفة المتبقية من n"),
      points: [
        bi(
          "**g(n)** is the cost of the path already travelled from the start to n, and it depends on that path. **h(n)** estimates the cost of the **cheapest path from n's state to a goal**.",
          "**g(n)** تكلفة المسار المقطوع فعلًا من البداية إلى n، وهي تعتمد على ذلك المسار. أما **h(n)** فتقدّر تكلفة **أرخص مسار من حالة n إلى هدف**.",
        ),
        bi(
          `h depends only on the **state**: Sibiu has h = ${H_SLD.Sibiu} whether it is reached directly (g = 140) or through Zerind and Oradea (g = 297). At a goal, h = 0.`,
          `تعتمد h على **الحالة (state)** فقط: فلـ Sibiu القيمة h = ${H_SLD.Sibiu} سواء وُصل إليها مباشرة (g = 140) أو عبر Zerind و Oradea (g = 297). وعند الهدف h = 0.`,
        ),
      ],
    },
    {
      id: "sld",
      pill: bi("Straight lines", "خطوط مستقيمة"),
      heading: bi("h_SLD: the straight-line distance to Bucharest", "h_SLD: المسافة بخط مستقيم إلى Bucharest"),
      points: [
        bi(
          "For route finding, a natural heuristic is the **straight-line distance** from a city to the goal, drawn here as dashed lines to Bucharest, with each city's value in km.",
          "في إيجاد الطرق يكون الاستدلال الطبيعي هو **المسافة بخط مستقيم (straight-line distance)** من المدينة إلى الهدف، وهي مرسومة هنا خطوطًا متقطعة إلى Bucharest، مع قيمة كل مدينة بالكيلومتر.",
        ),
        bi(`For example, **h_SLD(Arad) = ${H_SLD.Arad}**; the farther a city lies from Bucharest, the larger its value.`, `فمثلًا **h_SLD(Arad) = ${H_SLD.Arad}**؛ وكلما بعدت المدينة عن Bucharest كبرت قيمتها.`),
      ],
    },
    {
      id: "table",
      pill: bi("The values", "القيم"),
      heading: bi("h_SLD for all 20 cities, and where each value comes from", "قيم h_SLD للمدن العشرين، ومصدر كل قيمة"),
      points: [
        bi(
          "The book prints eight values (gold), and Pitesti's 100 follows from its f = 417 (slate). It gives no table, so the other eleven come from **AIMA's** table.",
          "يطبع الكتاب ثماني قيم (بالذهبي)، وتنتج قيمة Pitesti البالغة 100 من f = 417 فيه (بالرمادي). ولا يعطي جدولًا، لذا فالقيم الإحدى عشرة الأخرى مأخوذة من جدول **AIMA**.",
        ),
      ],
    },
    {
      id: "knowledge",
      pill: bi("World knowledge", "معرفة بالعالم"),
      heading: bi(`Arad: ${H_SLD.Arad} km in a straight line, ${ARAD_ROAD} km by road`, `Arad: ${H_SLD.Arad} km بخط مستقيم، و ${ARAD_ROAD} km عبر الطريق`),
      points: [
        bi(
          "Computing h_SLD needs the cities' **map coordinates**, which are not part of the problem definition: this is the **world knowledge** a heuristic brings.",
          "يحتاج حساب h_SLD إلى **إحداثيات المدن على الخريطة**، وهي ليست جزءًا من تعريف المسألة: فهذه هي **المعرفة بالعالم (world knowledge)** التي يجلبها الاستدلال.",
        ),
        bi(
          `The values help because they are **correlated** with the true road distances: Arad is ${H_SLD.Arad} km away in a straight line and ${ARAD_ROAD} km by the best road.`,
          `وتفيد هذه القيم لأنها **مترابطة (correlated)** مع مسافات الطرق الحقيقية: فـ Arad تبعد ${H_SLD.Arad} km بخط مستقيم و ${ARAD_ROAD} km عبر أفضل طريق.`,
        ),
      ],
    },
  ],
});

// ---------- Greedy best-first search ----------
const G_STEPS = GREEDY_RUN.steps;
const gFront = (k: number) => fringeBefore(GREEDY_RUN, k)[0];
const gList = (k: number, count: number) =>
  fringeBefore(GREEDY_RUN, k)
    .slice(0, count)
    .map((n) => `${nm(n.city)} (${n.h})`)
    .join(", ");
const OPTIMAL_COST = C_STAR;
const loop = greedyLoop(6);

export const greedy = defineWalkthrough({
  id: "ai4-greedy",
  title: bi("Greedy best-first search: f(n) = h(n)", "البحث الجشع الأفضل أولًا: f(n) = h(n)"),
  analogy: bi(
    "A hiker who always takes the trail that points most directly at the summit, without checking how long or winding it is.",
    "متنزّه يسلك دائمًا الدرب الذي يشير مباشرة إلى القمة، دون أن يتحقق من طوله أو تعرّجه.",
  ),
  facts: { greedy: GREEDY_RUN.cost!, order: names(GREEDY_RUN.order), optimal: OPTIMAL_COST, extra: GREEDY_RUN.cost! - OPTIMAL_COST },
  panels: [
    {
      id: "rule",
      pill: bi("Lowest h first", "الأقل h أولًا"),
      heading: bi("Expand the node that looks closest to the goal", "وسّع العقدة التي تبدو الأقرب إلى الهدف"),
      points: [
        bi("Greedy best-first search orders the fringe by **f(n) = h(n)** alone.", "يرتّب البحث الجشع الأفضل أولًا الحافة حسب **f(n) = h(n)** وحدها."),
        bi(
          `From Arad it picks **Sibiu** (h = ${H_SLD.Sibiu}), although the road to Zerind (75 km) is the shortest: what a path has already cost does not count.`,
          `فمن Arad يختار **Sibiu** (h = ${H_SLD.Sibiu})، مع أن الطريق إلى Zerind (75 km) هو الأقصر: فما كلّفه المسار حتى الآن لا يُحتسب.`,
        ),
      ],
    },
    {
      id: "run",
      pill: bi("Step by step", "خطوة بخطوة"),
      heading: bi("Greedy best-first search from Arad, fringe sorted by h", "البحث الجشع الأفضل أولًا من Arad، والحافة مرتبة حسب h"),
      control: {
        label: bi("Last expanded", "آخر عقدة موسَّعة"),
        options: [
          { id: "0", label: bi("None", "لا شيء") },
          { id: "1", label: bi("Arad", "Arad") },
          { id: "2", label: bi("Sibiu", "Sibiu") },
          { id: "3", label: bi("Fagaras", "Fagaras") },
        ],
        initial: "0",
      },
      points: [
        bi(
          "On the map, navy cities have been expanded (numbered in order), slate ones wait on the fringe and the **gold** one comes out next. The list on the right is the fringe, **lowest h first**.",
          "على الخريطة، المدن الكحلية وُسِّعت (ومرقّمة بالترتيب)، والرمادية تنتظر على الحافة، و**الذهبية** تخرج تاليًا. والقائمة على اليمين هي الحافة، **الأقل h أولًا**.",
        ),
      ],
      pointsFor: {
        "0": [bi(`Only the start node is on the fringe: Arad, h = ${H_SLD.Arad}. It is removed and expanded first.`, `لا يوجد على الحافة إلا عقدة البداية: Arad، و h = ${H_SLD.Arad}. فتُزال وتُوسَّع أولًا.`)],
        "1": [bi(`Arad's children, sorted by h: ${gList(1, 3)}. Sibiu is at the front.`, `أبناء Arad مرتبة حسب h: ${gList(1, 3)}. و Sibiu في المقدمة.`)],
        "2": [
          bi(
            `Sibiu's children join, **Arad again** among them (tree search does not notice repeats). ${nm(gFront(2).city)} (${gFront(2).h}) now leads, ahead of Rimnicu Vilcea (${H_SLD.Rimnicu_Vilcea}).`,
            `ينضم أبناء Sibiu، ومنهم **Arad مرة أخرى** (فالبحث الشجري لا ينتبه إلى التكرار). وتتقدّم الآن ${nm(gFront(2).city)} (${gFront(2).h})، أمام Rimnicu Vilcea (${H_SLD.Rimnicu_Vilcea}).`,
          ),
        ],
        "3": [
          bi(
            `Fagaras puts Bucharest on the fringe with h = 0. It is removed next and passes the goal test after ${G_STEPS.length - 1} expansions: the route costs **${GREEDY_RUN.cost} km**.`,
            `تضع Fagaras المدينةَ Bucharest على الحافة مع h = 0. فتُزال تاليًا وتجتاز اختبار الهدف بعد ${G_STEPS.length - 1} عمليات توسيع: ويكلّف الطريق **${GREEDY_RUN.cost} km**.`,
          ),
        ],
      },
    },
    {
      id: "cost",
      pill: bi("Not optimal", "ليس أمثل"),
      heading: bi(`${GREEDY_RUN.cost} km, while the best route is ${OPTIMAL_COST} km`, `${GREEDY_RUN.cost} km، بينما أفضل طريق ${OPTIMAL_COST} km`),
      points: [
        bi(
          `Greedy search expanded only nodes on its own path, but its solution is **not the cheapest**: 140 + 99 + 211 = ${GREEDY_RUN.cost} km.`,
          `لم يوسّع البحث الجشع إلا عقدًا على مساره، لكن حله **ليس الأرخص**: 140 + 99 + 211 = ${GREEDY_RUN.cost} km.`,
        ),
        bi(
          `Through Rimnicu Vilcea and Pitesti it is 140 + 80 + 97 + 101 = **${OPTIMAL_COST} km**, ${GREEDY_RUN.cost! - OPTIMAL_COST} km less. Fagaras looked closer (176 < 193), but its last road is 211 km long.`,
          `أما عبر Rimnicu Vilcea و Pitesti فالطول 140 + 80 + 97 + 101 = **${OPTIMAL_COST} km**، أي أقل بـ ${GREEDY_RUN.cost! - OPTIMAL_COST} km. فقد بدت Fagaras أقرب (176 < 193)، لكن طريقها الأخير طوله 211 km.`,
        ),
      ],
    },
    {
      id: "loop",
      pill: bi("Going in circles", "الدوران في حلقة"),
      heading: bi("Tree-like greedy search can loop forever", "قد يدور البحث الجشع الشجري في حلقة إلى الأبد"),
      points: [
        bi(
          "From Iasi to Fagaras (AIMA's example), **Neamt** looks closest to the goal but is a dead end, and expanding it puts **Iasi** back on the fringe, ahead of Vaslui.",
          "من Iasi إلى Fagaras (مثال AIMA) تبدو **Neamt** الأقرب إلى الهدف لكنها طريق مسدود، وتوسيعها يعيد **Iasi** إلى الحافة أمام Vaslui.",
        ),
        bi(
          `So the search removes ${loop.join(", ")}… forever: it is **not complete**. Graph search, with a closed set, breaks the loop in a finite space.`,
          `فيُزيل البحث ${loop.join("، ")}… إلى الأبد: فهو **ليس مكتملًا (complete)**. أما البحث في الرسم البياني (graph search)، مع مجموعة مغلقة، فيكسر الحلقة في فضاء منتهٍ.`,
        ),
      ],
    },
  ],
});

// ---------- A* search ----------
const A_STEPS = ASTAR_RUN.steps;
const aFront = (k: number) => fringeBefore(ASTAR_RUN, k)[0];
const node = (k: number, city: string) => fringeBefore(ASTAR_RUN, k).find((n) => n.city === city)!;
const sum = (n: { g: number; h: number; f: number }) => `${n.g} + ${n.h} = ${n.f}`;
const firstSeen = goalFirstSeen(ASTAR_RUN)!;
const pitestiNode = node(4, "Pitesti");

export const astar = defineWalkthrough({
  id: "ai4-astar",
  title: bi("A* search: f(n) = g(n) + h(n)", "البحث A*: f(n) = g(n) + h(n)"),
  analogy: bi(
    "Planning a trip by adding the kilometres already on the odometer to the straight-line distance left, and always continuing the trip whose total looks smallest.",
    "التخطيط لرحلة بجمع الكيلومترات المسجّلة في عدّاد السيارة إلى المسافة المتبقية بخط مستقيم، ثم مواصلة الرحلة التي يبدو مجموعها الأصغر دائمًا.",
  ),
  facts: { astar: ASTAR_RUN.cost!, order: names(ASTAR_RUN.order), first: firstSeen.f, pitesti: pitestiNode.f },
  panels: [
    {
      id: "formula",
      pill: bi("g + h = f", "g + h = f"),
      heading: bi("f(n) estimates the cost of the best solution through n", "تقدّر f(n) تكلفة أفضل حل يمر بـ n"),
      control: {
        label: bi("Node n", "العقدة n"),
        options: [
          { id: "rimnicu", label: bi("Rimnicu Vilcea", "Rimnicu Vilcea") },
          { id: "fagaras", label: bi("Fagaras", "Fagaras") },
        ],
        initial: "rimnicu",
      },
      points: [
        bi(
          "**g(n)** is the road distance already driven from Arad, **h(n)** the straight-line estimate of what is left, and their sum **f(n)** estimates the whole trip through n.",
          "**g(n)** مسافة الطريق المقطوعة فعلًا من Arad، و**h(n)** التقدير بخط مستقيم لما تبقّى، ومجموعهما **f(n)** يقدّر الرحلة كلها المارة بـ n.",
        ),
      ],
      pointsFor: {
        rimnicu: [bi(`Rimnicu Vilcea: ${sum(node(2, "Rimnicu_Vilcea"))}.`, `Rimnicu Vilcea: ${sum(node(2, "Rimnicu_Vilcea"))}.`)],
        fagaras: [
          bi(
            `Fagaras: ${sum(node(2, "Fagaras"))}. Greedy search prefers Fagaras (smaller h); A* prefers Rimnicu Vilcea (smaller f).`,
            `Fagaras: ${sum(node(2, "Fagaras"))}. يفضّل البحث الجشع Fagaras (لأن h أصغر)، ويفضّل A* المدينة Rimnicu Vilcea (لأن f أصغر).`,
          ),
        ],
      },
    },
    {
      id: "run",
      pill: bi("Step by step", "خطوة بخطوة"),
      heading: bi("A* from Arad, fringe sorted by f = g + h", "البحث A* من Arad، والحافة مرتبة حسب f = g + h"),
      control: {
        label: bi("Last expanded", "آخر عقدة موسَّعة"),
        options: [
          { id: "0", label: bi("None", "لا شيء") },
          { id: "1", label: bi("Arad", "Arad") },
          { id: "2", label: bi("Sibiu", "Sibiu") },
          { id: "3", label: bi("Rimnicu V.", "Rimnicu V.") },
          { id: "4", label: bi("Fagaras", "Fagaras") },
          { id: "5", label: bi("Pitesti", "Pitesti") },
        ],
        initial: "0",
      },
      points: [
        bi(
          "Navy cities have been expanded, slate ones wait on the fringe and the **gold** one comes out next. The list shows the fringe as **g + h = f**, lowest f first.",
          "المدن الكحلية وُسِّعت، والرمادية تنتظر على الحافة، و**الذهبية** تخرج تاليًا. وتعرض القائمة الحافة بالصورة **g + h = f**، الأقل f أولًا.",
        ),
      ],
      pointsFor: {
        "0": [bi(`Only Arad is on the fringe: f = ${sum(aFront(0))}.`, `لا يوجد على الحافة إلا Arad: f = ${sum(aFront(0))}.`)],
        "1": [
          bi(
            `Arad's children: Sibiu ${sum(aFront(1))} leads, ahead of Timisoara (${node(1, "Timisoara").f}) and Zerind (${node(1, "Zerind").f}).`,
            `أبناء Arad: تتقدّم Sibiu بـ ${sum(aFront(1))}، أمام Timisoara (${node(1, "Timisoara").f}) و Zerind (${node(1, "Zerind").f}).`,
          ),
        ],
        "2": [
          bi(
            `Sibiu's children: Rimnicu Vilcea (${node(2, "Rimnicu_Vilcea").f}) now leads, just ahead of Fagaras (${node(2, "Fagaras").f}).`,
            `أبناء Sibiu: تتقدّم الآن Rimnicu Vilcea (${node(2, "Rimnicu_Vilcea").f})، أمام Fagaras (${node(2, "Fagaras").f}) بفارق ضئيل.`,
          ),
        ],
        "3": [
          bi(
            `Rimnicu Vilcea adds Pitesti with ${sum(node(3, "Pitesti"))}; Fagaras (${aFront(3).f}) is still at the front.`,
            `تضيف Rimnicu Vilcea المدينةَ Pitesti بـ ${sum(node(3, "Pitesti"))}؛ وما زالت Fagaras (${aFront(3).f}) في المقدمة.`,
          ),
        ],
        "4": [
          bi(
            `Fagaras adds Bucharest with ${sum(node(4, "Bucharest"))}, but Pitesti (${pitestiNode.f}) is ahead of it.`,
            `تضيف Fagaras المدينةَ Bucharest بـ ${sum(node(4, "Bucharest"))}، لكن Pitesti (${pitestiNode.f}) أمامها.`,
          ),
        ],
        "5": [
          bi(
            `Pitesti adds Bucharest again with ${sum(aFront(5))}, now at the front. It is removed and passes the goal test: the route costs **${ASTAR_RUN.cost} km**.`,
            `تضيف Pitesti المدينةَ Bucharest مجددًا بـ ${sum(aFront(5))}، وهي الآن في المقدمة. فتُزال وتجتاز اختبار الهدف: ويكلّف الطريق **${ASTAR_RUN.cost} km**.`,
          ),
        ],
      },
    },
    {
      id: "wait",
      pill: bi("Not so fast, Bucharest", "ليس بهذه السرعة يا Bucharest"),
      heading: bi("A goal on the fringe is not a solution until it is removed", "الهدف على الحافة ليس حلًّا حتى يُزال"),
      points: [
        bi(
          `After Fagaras, Bucharest is on the fringe with f = ${firstSeen.f}. Stopping there would return the ${firstSeen.f} km route.`,
          `بعد Fagaras تكون Bucharest على الحافة مع f = ${firstSeen.f}. والتوقف عندها كان سيُرجع طريق ${firstSeen.f} km.`,
        ),
        bi(
          `A* tests for the goal only when a node is **removed**: Pitesti's f = ${pitestiNode.f} < ${firstSeen.f}, so Pitesti goes first and reveals the ${ASTAR_RUN.cost} km route.`,
          `لا يختبر A* الهدف إلا عند **إزالة** العقدة: فـ f لـ Pitesti تساوي ${pitestiNode.f} < ${firstSeen.f}، لذا تخرج Pitesti أولًا وتكشف طريق ${ASTAR_RUN.cost} km.`,
        ),
      ],
    },
    {
      id: "versus",
      pill: bi("Greedy vs A*", "الجشع مقابل A*"),
      heading: bi("Same map, same heuristic, a different f", "الخريطة نفسها والاستدلال نفسه، و f مختلفة"),
      control: {
        label: bi("Search", "البحث"),
        options: [
          { id: "greedy", label: bi("Greedy: f = h", "الجشع: f = h") },
          { id: "astar", label: bi("A*: f = g + h", "A*: f = g + h") },
        ],
        initial: "greedy",
      },
      points: [bi("Both runs use h_SLD, tree search and the goal test on removal; only f differs.", "يستخدم التشغيلان كلاهما h_SLD والبحث الشجري واختبار الهدف عند الإزالة؛ ولا يختلف إلا f.")],
      pointsFor: {
        greedy: [
          bi(
            `Greedy removes ${GREEDY_RUN.order.length} nodes and returns **${GREEDY_RUN.cost} km**: fast, but not the cheapest route.`,
            `يُزيل البحث الجشع ${GREEDY_RUN.order.length} عقد ويُرجع **${GREEDY_RUN.cost} km**: فهو سريع، لكن طريقه ليس الأرخص.`,
          ),
        ],
        astar: [
          bi(
            `A* removes ${ASTAR_RUN.order.length} nodes and returns the optimal **${ASTAR_RUN.cost} km**: a little more work buys the cheapest route.`,
            `يُزيل A* عدد ${ASTAR_RUN.order.length} عقد ويُرجع الطريق الأمثل **${ASTAR_RUN.cost} km**: فقليل من العمل الإضافي يشتري الطريق الأرخص.`,
          ),
        ],
      },
    },
  ],
});

// ---------- Admissible heuristics and the optimality of A* ----------
const overPitesti = fringeBefore(OVER_RUN, 4).find((n) => n.city === OVER_CITY)!;
const below = belowCStar(ASTAR_RUN, C_STAR);

export const admissible = defineWalkthrough({
  id: "ai4-admissible",
  title: bi("Admissible heuristics make A* optimal", "الاستدلالات المقبولة تجعل A* أمثل"),
  analogy: bi(
    "Price quotes that are never above the real price: a shop whose quote is already higher than a price you have actually paid can be skipped, but one with a lower quote must still be checked.",
    "عروض أسعار لا تتجاوز السعر الحقيقي أبدًا: فالمتجر الذي يزيد عرضه على سعر دفعته فعلًا يمكن تجاهله، أما الذي عرضه أقل فلا بد من فحصه.",
  ),
  facts: { cstar: C_STAR, over: OVER_RUN.cost!, "pitesti-over": overPitesti.f, below: below.length },
  panels: [
    {
      id: "optimistic",
      pill: bi("Never too high", "لا يبالغ أبدًا"),
      heading: bi("An admissible h never overestimates the true cost", "الاستدلال المقبول لا يبالغ أبدًا في تقدير التكلفة الحقيقية"),
      control: {
        label: bi("Heuristic", "الاستدلال"),
        options: [
          { id: "sld", label: bi("h_SLD", "h_SLD") },
          { id: "over", label: bi(`h(${OVER_CITY}) = ${OVER_VALUE}`, `h(${OVER_CITY}) = ${OVER_VALUE}`) },
        ],
        initial: "sld",
      },
      points: [
        bi(
          "A heuristic is **admissible** if h(n) ≤ h*(n) for every n, where h*(n) is the true cost of the cheapest path from n to a goal: it is **optimistic**.",
          "يكون الاستدلال **مقبولًا (admissible)** إذا كان h(n) ≤ h*(n) لكل n، حيث h*(n) التكلفة الحقيقية لأرخص مسار من n إلى هدف: أي إنه **متفائل (optimistic)**.",
        ),
      ],
      pointsFor: {
        sld: [bi("Every gold bar (h_SLD) is no taller than its road distance h*: a straight line is never longer than a road.", "لا يزيد طول أي عمود ذهبي (h_SLD) على مسافة الطريق h* المقابلة له: فالخط المستقيم لا يكون أطول من طريق أبدًا.")],
        over: [
          bi(
            `Raising h(${OVER_CITY}) to ${OVER_VALUE} overestimates its true ${H_STAR[OVER_CITY]} km, so this heuristic is **not admissible**.`,
            `رفع h(${OVER_CITY}) إلى ${OVER_VALUE} يبالغ في تقدير تكلفتها الحقيقية البالغة ${H_STAR[OVER_CITY]} km، لذا فهذا الاستدلال **غير مقبول**.`,
          ),
        ],
      },
    },
    {
      id: "overestimate",
      pill: bi("Overestimating", "المبالغة في التقدير"),
      heading: bi("One overestimate is enough to lose the best route", "تكفي مبالغة واحدة لفقدان أفضل طريق"),
      control: {
        label: bi("Heuristic", "الاستدلال"),
        options: [
          { id: "sld", label: bi("h_SLD", "h_SLD") },
          { id: "over", label: bi(`h(${OVER_CITY}) = ${OVER_VALUE}`, `h(${OVER_CITY}) = ${OVER_VALUE}`) },
        ],
        initial: "sld",
      },
      points: [bi("The fringe right after Fagaras is expanded decides the result.", "الحافة مباشرة بعد توسيع Fagaras هي التي تحسم النتيجة.")],
      pointsFor: {
        sld: [
          bi(
            `With h_SLD, Pitesti's f = ${pitestiNode.f} keeps it ahead of Bucharest at ${firstSeen.f}, and A* returns **${ASTAR_RUN.cost} km**.`,
            `مع h_SLD تُبقي f = ${pitestiNode.f} المدينةَ Pitesti أمام Bucharest عند ${firstSeen.f}، فيُرجع A* الطول **${ASTAR_RUN.cost} km**.`,
          ),
        ],
        over: [
          bi(
            `With h(${OVER_CITY}) = ${OVER_VALUE}, Pitesti's f = ${overPitesti.f} > ${firstSeen.f}: Bucharest via Fagaras is removed first and A* returns **${OVER_RUN.cost} km**.`,
            `مع h(${OVER_CITY}) = ${OVER_VALUE} تصبح f لـ Pitesti مساوية ${overPitesti.f} > ${firstSeen.f}: فتُزال Bucharest عبر Fagaras أولًا، ويُرجع A* الطول **${OVER_RUN.cost} km**.`,
          ),
        ],
      },
    },
    {
      id: "proof",
      pill: bi("The proof", "البرهان"),
      heading: bi("Why A* with an admissible h returns an optimal path", "لماذا يُرجع A* مع h مقبولة مسارًا أمثل"),
      points: [
        bi(
          "Suppose A* returned a **worse** solution, of cost C > C*. Some node n of an optimal path is still on the fringe, and admissibility gives f(n) ≤ C*.",
          "لنفترض أن A* أرجع حلًّا **أسوأ** تكلفته C > C*. توجد عقدة n من مسار أمثل ما زالت على الحافة، ويعطي القبول (admissibility) f(n) ≤ C*.",
        ),
        bi(
          `Then f(n) ≤ C* < C, so A* would have removed n before the goal: a **contradiction**. On Romania, n = Pitesti with ${pitestiNode.f} ≤ ${C_STAR} < ${firstSeen.f}.`,
          `إذن f(n) ≤ C* < C، فكان A* سيُزيل n قبل الهدف: وهذا **تناقض**. ففي رومانيا n = Pitesti مع ${pitestiNode.f} ≤ ${C_STAR} < ${firstSeen.f}.`,
        ),
      ],
    },
    {
      id: "contour",
      pill: bi("f below C*", "f تحت C*"),
      heading: bi("A* expands every node with f(n) < C*, and none above it", "يوسّع A* كل عقدة تحقق f(n) < C*، ولا يوسّع أي عقدة فوقها"),
      points: [
        bi(
          `The ${A_STEPS.reduce((s, st) => s + st.added.length, 1)} nodes A* generated, sorted by f: the ${below.length} with f < ${C_STAR} are expanded, the goal is removed at f = ${C_STAR}, and nothing above the line is touched.`,
          `العقد التي ولّدها A* وعددها ${A_STEPS.reduce((s, st) => s + st.added.length, 1)} مرتبة حسب f: تُوسَّع العقد التي تحقق f < ${C_STAR} وعددها ${below.length}، ويُزال الهدف عند f = ${C_STAR}، ولا يُمَسّ شيء فوق الخط.`,
        ),
        bi("A better heuristic raises f for the nodes off the optimal path, so fewer of them fall below C*.", "والاستدلال الأفضل يرفع f للعقد الواقعة خارج المسار الأمثل، فيقل عدد ما يقع منها تحت C*."),
      ],
    },
  ],
});

// ---------- Comparing the strategies ----------
export const compare = defineWalkthrough({
  id: "ai4-compare",
  title: bi("Uniform-cost, greedy and A* side by side", "التكلفة الموحدة والجشع و A* جنبًا إلى جنب"),
  analogy: bi(
    "Three drivers: one watches only the odometer, one only the compass, and one watches both.",
    "ثلاثة سائقين: أحدهم لا ينظر إلا إلى عدّاد المسافة، والثاني لا ينظر إلا إلى البوصلة، والثالث ينظر إلى الاثنين.",
  ),
  facts: { ucs: UCS_RUN.order.length, greedy: GREEDY_RUN.order.length, astar: ASTAR_RUN.order.length },
  panels: [
    {
      id: "table",
      pill: bi("Properties", "الخصائص"),
      heading: bi("Complete, optimal, time and space", "الاكتمال والأمثلية والزمن والمساحة"),
      points: [
        bi(
          "Uniform-cost search and A* are **complete and optimal** under their conditions; greedy best-first search is neither.",
          "البحث بالتكلفة الموحدة و A* **مكتملان وأمثلان** ضمن شروطهما؛ أما البحث الجشع الأفضل أولًا فليس كذلك.",
        ),
        bi(
          "All three keep their fringe in memory, so **space** is the usual limit; a good heuristic cuts the time of greedy search and A* sharply.",
          "تحتفظ الثلاثة كلها بحافتها في الذاكرة، لذا تكون **المساحة** هي القيد المعتاد؛ والاستدلال الجيد يخفض زمن البحث الجشع و A* خفضًا كبيرًا.",
        ),
      ],
    },
    {
      id: "work",
      pill: bi("On Romania", "في رومانيا"),
      heading: bi("Nodes removed from the fringe, Arad to Bucharest", "العقد المُزالة من الحافة، من Arad إلى Bucharest"),
      points: [
        bi(
          `Tree search with repeated states counted: uniform-cost search removes ${UCS_RUN.order.length} nodes, greedy best-first ${GREEDY_RUN.order.length} and A* ${ASTAR_RUN.order.length}.`,
          `في البحث الشجري مع احتساب الحالات المتكررة: يُزيل البحث بالتكلفة الموحدة ${UCS_RUN.order.length} عقدة، والبحث الجشع الأفضل أولًا ${GREEDY_RUN.order.length}، و A* عدد ${ASTAR_RUN.order.length}.`,
        ),
        bi(
          `Greedy is the fastest but returns ${GREEDY_RUN.cost} km; A* returns the optimal ${ASTAR_RUN.cost} km for a fraction of uniform-cost search's work.`,
          `البحث الجشع هو الأسرع لكنه يُرجع ${GREEDY_RUN.cost} km؛ أما A* فيُرجع الطول الأمثل ${ASTAR_RUN.cost} km بجزء يسير من عمل البحث بالتكلفة الموحدة.`,
        ),
      ],
    },
    {
      id: "pick",
      pill: bi("Which one?", "أيها؟"),
      heading: bi("Pick the strategy that fits the problem", "اختر الاستراتيجية التي تناسب المسألة"),
      control: {
        label: bi("You need", "تحتاج إلى"),
        options: [
          { id: "nohint", label: bi("No heuristic at hand", "لا يتوفر استدلال") },
          { id: "fast", label: bi("Any route, fast", "أي طريق، بسرعة") },
          { id: "best", label: bi("The cheapest route", "الطريق الأرخص") },
        ],
        initial: "best",
      },
      points: [bi("No strategy wins every row of the table, so the problem decides.", "لا تتفوق أي استراتيجية في كل صفوف الجدول، لذا فالمسألة هي التي تقرر.")],
      pointsFor: {
        nohint: [bi("**Uniform-cost search** needs only step costs and still returns the cheapest solution, at the price of exploring in every direction.", "لا يحتاج **البحث بالتكلفة الموحدة** إلا إلى تكاليف الخطوات، ويُرجع مع ذلك الحل الأرخص، مقابل الاستكشاف في كل اتجاه.")],
        fast: [bi("**Greedy best-first search** heads straight for the goal and often expands very few nodes, but its route may be longer than necessary.", "يتجه **البحث الجشع الأفضل أولًا** مباشرة نحو الهدف، وكثيرًا ما يوسّع عقدًا قليلة جدًا، لكن طريقه قد يكون أطول من اللازم.")],
        best: [bi("**A* search** with an admissible heuristic returns the cheapest route and expands far fewer nodes than uniform-cost search; memory is its limit.", "يُرجع **البحث A* ** مع استدلال مقبول الطريق الأرخص، ويوسّع عقدًا أقل بكثير من البحث بالتكلفة الموحدة؛ والذاكرة هي قيده.")],
      },
    },
  ],
});

// ---------- Beyond the book: consistency and designing heuristics ----------
const SIBIU_BOUND = 80 + H_SLD.Rimnicu_Vilcea;
/** f of each node A* removes along the optimal route: it never decreases. */
const PATH_F = ASTAR_RUN.steps.filter((s) => s.removed.path.join() === ASTAR_RUN.path!.slice(0, s.removed.path.length).join()).map((s) => s.removed.f);
const h1 = misplaced(PUZZLE_START);
const h2 = manhattan(PUZZLE_START);
const run1 = puzzleAstar("h1");
const run2 = puzzleAstar("h2");

export const beyond = defineWalkthrough({
  id: "ai4-beyond",
  title: bi("Consistency and better heuristics", "الاتساق واستدلالات أفضل"),
  analogy: bi(
    "An honest progress bar: finishing one task can move it forward by at most that task's share, never jump ahead and then fall back.",
    "شريط تقدّم صادق: إنجاز مهمة واحدة يحرّكه إلى الأمام بمقدار حصة تلك المهمة على الأكثر، دون أن يقفز إلى الأمام ثم يتراجع.",
  ),
  facts: {
    sibiu: SIBIU_BOUND,
    inconsistent: TOY_INCONSISTENT_RUN.cost,
    consistent: TOY_CONSISTENT_RUN.cost,
    h1,
    h2,
    true: run2.cost,
    "expanded-h1": run1.expanded,
    "expanded-h2": run2.expanded,
  },
  panels: [
    {
      id: "consistent",
      pill: bi("Consistency", "الاتساق"),
      heading: bi("h(n) ≤ c(n, a, n′) + h(n′): a triangle inequality", "h(n) ≤ c(n, a, n′) + h(n′): متباينة مثلثية"),
      points: [
        bi(
          `A heuristic is **consistent** if one step can lower h by at most the step's cost. h_SLD is: h(Sibiu) = ${H_SLD.Sibiu} ≤ 80 + ${H_SLD.Rimnicu_Vilcea} = ${SIBIU_BOUND}.`,
          `يكون الاستدلال **متّسقًا (consistent)** إذا كانت الخطوة الواحدة لا تخفض h بأكثر من تكلفتها. و h_SLD كذلك: h(Sibiu) = ${H_SLD.Sibiu} ≤ 80 + ${H_SLD.Rimnicu_Vilcea} = ${SIBIU_BOUND}.`,
        ),
        bi(
          `Then f never decreases along a path (${PATH_F.join(", ")} on the optimal route), and every consistent heuristic is admissible.`,
          `عندئذ لا تتناقص f أبدًا على امتداد المسار (${PATH_F.join("، ")} على الطريق الأمثل)، وكل استدلال متّسق مقبول.`,
        ),
      ],
    },
    {
      id: "graph-search",
      pill: bi("Graph search", "البحث في الرسم البياني"),
      heading: bi("With a closed set, admissible is not enough", "مع مجموعة مغلقة لا يكفي القبول"),
      control: {
        label: bi("Heuristic", "الاستدلال"),
        options: [
          { id: "inconsistent", label: bi(`h(A) = ${TOY_H_INCONSISTENT.A}: inconsistent`, `h(A) = ${TOY_H_INCONSISTENT.A}: غير متّسق`) },
          { id: "consistent", label: bi(`h(A) = ${TOY_H_CONSISTENT.A}: consistent`, `h(A) = ${TOY_H_CONSISTENT.A}: متّسق`) },
        ],
        initial: "inconsistent",
      },
      points: [
        bi(
          "Lecture 3's GRAPH-SEARCH skips a state that is already in the **closed set**, even if the new path to it is cheaper.",
          "تتخطى خوارزمية GRAPH-SEARCH في المحاضرة 3 الحالة الموجودة في **المجموعة المغلقة (closed set)**، حتى لو كان المسار الجديد إليها أرخص.",
        ),
      ],
      pointsFor: {
        inconsistent: [
          bi(
            `h(A) = ${TOY_H_INCONSISTENT.A} is admissible, but A* closes C through B (g = 3) before A; the cheaper path through A (g = 2) is skipped, and A* returns **${TOY_INCONSISTENT_RUN.cost}** instead of ${TOY_CONSISTENT_RUN.cost}.`,
            `القيمة h(A) = ${TOY_H_INCONSISTENT.A} مقبولة، لكن A* يغلق C عبر B (g = 3) قبل A؛ فيُتخطّى المسار الأرخص عبر A (g = 2)، ويُرجع A* القيمة **${TOY_INCONSISTENT_RUN.cost}** بدلًا من ${TOY_CONSISTENT_RUN.cost}.`,
          ),
        ],
        consistent: [
          bi(
            `With h(A) = ${TOY_H_CONSISTENT.A}, A is expanded before C, C is closed with its best g = 2, and A* returns the optimal **${TOY_CONSISTENT_RUN.cost}**.`,
            `مع h(A) = ${TOY_H_CONSISTENT.A} تُوسَّع A قبل C، وتُغلق C بأفضل قيمة لها g = 2، ويُرجع A* القيمة المثلى **${TOY_CONSISTENT_RUN.cost}**.`,
          ),
        ],
      },
    },
    {
      id: "puzzle",
      pill: bi("8-puzzle: h1 and h2", "اللغز الثماني: h1 و h2"),
      heading: bi("Two admissible heuristics for the 8-puzzle", "استدلالان مقبولان للغز الثماني"),
      control: {
        label: bi("Heuristic", "الاستدلال"),
        options: [
          { id: "h1", label: bi("h1: misplaced tiles", "h1: البلاطات في غير مواضعها") },
          { id: "h2", label: bi("h2: Manhattan distance", "h2: مسافة مانهاتن") },
        ],
        initial: "h1",
      },
      points: [bi(`Lecture 2's start state; its shortest solution takes ${run2.cost} moves.`, `حالة البداية في المحاضرة 2؛ ويستغرق أقصر حل لها ${run2.cost} نقلة.`)],
      pointsFor: {
        h1: [
          bi(
            `**h1** counts the tiles that are not on their goal square: ${h1} here. Each of them must move at least once.`,
            `يعدّ **h1** البلاطات التي ليست في مربعاتها في الهدف: ${h1} هنا. وكل واحدة منها يجب أن تتحرك مرة على الأقل.`,
          ),
        ],
        h2: [
          bi(
            `**h2** adds each tile's distance from its goal square in rows plus columns: ${h2} here. One move shifts one tile by one square.`,
            `يجمع **h2** بُعد كل بلاطة عن مربعها في الهدف بعدد الصفوف زائد الأعمدة: ${h2} هنا. فالنقلة الواحدة تزيح بلاطة واحدة مربعًا واحدًا.`,
          ),
        ],
      },
    },
    {
      id: "dominance",
      pill: bi("Dominance", "الهيمنة"),
      heading: bi("h2 dominates h1, so A* expands fewer nodes", "يهيمن h2 على h1، فيوسّع A* عقدًا أقل"),
      points: [
        bi(
          `h1(n) ≤ h2(n) ≤ h*(n) for every state, here ${h1} ≤ ${h2} ≤ ${run2.cost}: the larger admissible heuristic **dominates**.`,
          `h1(n) ≤ h2(n) ≤ h*(n) لكل حالة، وهنا ${h1} ≤ ${h2} ≤ ${run2.cost}: فالاستدلال المقبول الأكبر **يهيمن (dominates)**.`,
        ),
        bi(
          `A* graph search from this state expands ${thousands(run1.expanded)} states with h1 but only ${thousands(run2.expanded)} with h2.`,
          `يوسّع A* في البحث في الرسم البياني من هذه الحالة ${thousands(run1.expanded)} حالة مع h1، و ${thousands(run2.expanded)} حالة فقط مع h2.`,
        ),
      ],
    },
  ],
});

/** Every walkthrough in this lecture, registered in lib/walkthroughs/index.ts. */
export const all = [informed, heuristic, greedy, astar, admissible, compare, beyond] as const;

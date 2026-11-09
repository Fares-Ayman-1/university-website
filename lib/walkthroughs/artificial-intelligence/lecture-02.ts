import { bi } from "@/components/widgets/types";
import { defineWalkthrough } from "@/lib/widgets/walkthrough";
import {
  CONFORMANT_PLAN,
  CONFORMANT_TRACE,
  OPTIMAL,
  PUZZLE_START,
  TILE_ACTIONS,
  VACUUM_GOALS,
  VACUUM_STATES,
  VIA_FAGARAS,
  arrangements,
  legalMoves,
  moveBlank,
  pathCost,
  reachable,
  road,
  runningCost,
  thousands,
  type Dir,
} from "@/lib/widgets/ai-lecture-02";

/*
 * Artificial Intelligence · Lecture 2 (content/subjects/artificial-intelligence/lectures/02-problem-solving.mdx).
 * One walkthrough per heading; the scenes are in
 * components/widgets/walkthrough/scenes/artificial-intelligence/lecture-02/.
 */

const FAGARAS_KM = pathCost(VIA_FAGARAS);
const OPTIMAL_KM = OPTIMAL.cost ?? NaN;
const OPTIMAL_RUN = runningCost(OPTIMAL.path ?? []).slice(1);
const BELIEF_SIZES = CONFORMANT_TRACE.map((s) => s.length);
const FINAL_BELIEF = CONFORMANT_TRACE[CONFORMANT_TRACE.length - 1];

// ---------- Problem-solving agents ----------
export const agents = defineWalkthrough({
  id: "ai2-agents",
  title: bi("How a problem-solving agent works", "كيف يعمل وكيل حل المسائل"),
  analogy: bi(
    "Planning a road trip on a map the night before. You choose the destination, pick a route, then drive it turn by turn without redrawing the plan at every junction.",
    "التخطيط لرحلة بالسيارة على خريطة في الليلة السابقة: تختار الوجهة، ثم تحدد الطريق، ثم تقوده منعطفًا بعد منعطف دون أن تعيد رسم الخطة عند كل تقاطع.",
  ),
  facts: { viaFagaras: FAGARAS_KM, optimal: OPTIMAL_KM },
  panels: [
    {
      id: "loop",
      pill: bi("Four steps", "أربع خطوات"),
      heading: bi("Formulate, search, then execute", "الصياغة ثم البحث ثم التنفيذ"),
      points: [
        bi(
          "A **problem-solving agent** is a goal-based agent that thinks ahead: it finds a whole sequence of actions before it acts.",
          "**وكيل حل المسائل (problem-solving agent)** وكيل قائم على الهدف (goal-based agent) يفكر مسبقًا: فهو يجد تسلسلًا كاملًا من الأفعال قبل أن يتصرف.",
        ),
        bi(
          "It **formulates a goal**, **formulates the problem**, **searches** for a solution and **executes** it. It plans again only when the sequence runs out.",
          "فهو **يصوغ الهدف**، ثم **يصوغ المسألة**، ثم **يبحث** عن حل، ثم **ينفّذه**، ولا يعيد التخطيط إلا عندما ينفد التسلسل.",
        ),
      ],
    },
    {
      id: "romania",
      pill: bi("Goal and problem", "الهدف والمسألة"),
      heading: bi("On holiday in Arad, flying home from Bucharest", "في عطلة في أراد، والعودة جوًا من بوخارست"),
      points: [
        bi("The **goal** is to be in Bucharest for tomorrow's flight. It limits what the agent has to think about.", "**الهدف (goal)** هو الوصول إلى بوخارست (Bucharest) قبل رحلة الغد، وهو يحدّ مما يجب على الوكيل التفكير فيه."),
        bi(
          "In the **problem**, the **states** are cities and the **actions** are drives to a neighbouring city. Three roads leave Arad, and none of them reaches Bucharest directly.",
          "وفي **المسألة (problem)** تكون **الحالات (states)** هي المدن، و**الأفعال (actions)** هي القيادة إلى مدينة مجاورة. وتخرج من أراد (Arad) ثلاث طرق، لا يصل أيٌّ منها إلى بوخارست مباشرةً.",
        ),
      ],
    },
    {
      id: "route",
      pill: bi("Search finds a route", "البحث يجد طريقًا"),
      heading: bi("A solution is a sequence of cities", "الحل تسلسل من المدن"),
      control: {
        label: bi("Route", "الطريق"),
        options: [
          { id: "fagaras", label: bi("Via Fagaras", "عبر Fagaras") },
          { id: "rimnicu", label: bi("Via Rimnicu Vilcea", "عبر Rimnicu Vilcea") },
        ],
        initial: "fagaras",
      },
      points: [bi("**Search** tries sequences of actions on the agent's map until one of them reaches Bucharest.", "يجرّب **البحث (search)** تسلسلات من الأفعال على خريطة الوكيل، حتى يصل أحدها إلى بوخارست.")],
      pointsFor: {
        fagaras: [bi(`The slide's example, Arad → Sibiu → Fagaras → Bucharest, is three drives and **${FAGARAS_KM} km**.`, `مثال الشريحة، Arad → Sibiu → Fagaras → Bucharest، ثلاث رحلات قيادة طولها **${FAGARAS_KM} كم**.`)],
        rimnicu: [
          bi(
            `Through Rimnicu Vilcea and Pitesti is one drive more but only **${OPTIMAL_KM} km**, the shortest route on the map.`,
            `أما الطريق عبر Rimnicu Vilcea و Pitesti فيزيد رحلة قيادة واحدة، لكن طوله **${OPTIMAL_KM} كم** فقط، وهو أقصر طريق على الخريطة.`,
          ),
        ],
      },
    },
    {
      id: "execute",
      pill: bi("Execute", "التنفيذ"),
      heading: bi("One action per call: FIRST, then REST", "فعل واحد في كل استدعاء: FIRST ثم REST"),
      points: [
        bi(
          "Each time the agent is called, it returns **FIRST(seq)** and keeps **REST(seq)** for later, so the plan shrinks by one action per step.",
          "في كل مرة يُستدعى فيها الوكيل، يُرجع **FIRST(seq)** ويحتفظ بـ **REST(seq)** لما بعد، فتتقلص الخطة بمقدار فعل واحد في كل خطوة.",
        ),
        bi("When **seq** is empty, the agent formulates a new goal and searches again.", "وعندما يصبح **seq** فارغًا، يصوغ الوكيل هدفًا جديدًا ويبحث من جديد."),
      ],
    },
    {
      id: "open-loop",
      pill: bi("Open loop", "الحلقة المفتوحة"),
      heading: bi("Executing with its eyes closed", "التنفيذ بعينين مغمضتين"),
      control: {
        label: bi("The world", "العالم"),
        options: [
          { id: "model", label: bi("Matches the map", "يطابق الخريطة") },
          { id: "surprise", label: bi("A road is closed", "طريق مغلق") },
        ],
        initial: "model",
      },
      points: [bi("While it executes **seq**, the agent ignores its percepts. This is **open-loop** execution.", "أثناء تنفيذ **seq** يتجاهل الوكيل إدراكاته (percepts)، وهذا هو التنفيذ **بالحلقة المفتوحة (open-loop)**.")],
      pointsFor: {
        model: [
          bi(
            "In a fully observable, deterministic world every action does what the model predicts, so the plan arrives.",
            "في عالم قابل للملاحظة كليًا (fully observable) وحتمي (deterministic) يؤدي كل فعل ما يتوقعه النموذج، فتصل الخطة إلى الهدف.",
          ),
        ],
        surprise: [
          bi(
            "When the world differs from the model, the percept \"road closed\" is ignored and the plan fails. Uncertain worlds need a **closed loop** that checks percepts.",
            "أما حين يختلف العالم عن النموذج، فيُتجاهَل إدراك «الطريق مغلق» وتفشل الخطة؛ لذا تحتاج العوالم غير المؤكدة إلى **حلقة مغلقة (closed loop)** تراجع الإدراكات.",
          ),
        ],
      },
    },
  ],
});

// ---------- Problem types ----------
export const problemTypes = defineWalkthrough({
  id: "ai2-problem-types",
  title: bi("Four problem types in the vacuum world", "أنواع المسائل الأربعة في عالم المكنسة"),
  analogy: bi(
    "Getting to the kitchen at night. With the lights on you just walk there; blindfolded you follow moves that work from anywhere; with a torch you check each doorway; in a stranger's house you have to explore.",
    "الوصول إلى المطبخ ليلًا: إن كانت الأنوار مضاءة تمشي إليه مباشرةً، وإن كنت معصوب العينين تتبع حركات تنجح من أي مكان، وإن كان معك مصباح تتفقد كل مدخل، وفي بيت غريب عليك أن تستكشف.",
  ),
  facts: { states: VACUUM_STATES.length, beliefs: BELIEF_SIZES.join(",") },
  panels: [
    {
      id: "states",
      pill: bi(`${VACUUM_STATES.length} states`, `${VACUUM_STATES.length} حالات`),
      heading: bi("The two-square vacuum world", "عالم المكنسة ذو المربعين"),
      points: [
        bi(
          `A state says where the robot is and which squares are dirty: **2 × 2 × 2 = ${VACUUM_STATES.length}** states.`,
          `تحدد الحالة (state) موضع الروبوت والمربعات المتسخة: **2 × 2 × 2 = ${VACUUM_STATES.length}** حالات.`,
        ),
        bi(
          `In the odd states the robot is in A, in the even ones in B. States ${VACUUM_GOALS.join(" and ")} have no dirt at all: they are the **goal**.`,
          `في الحالات الفردية يكون الروبوت في A، وفي الزوجية يكون في B. والحالتان ${VACUUM_GOALS.join(" و ")} خاليتان من الأوساخ تمامًا، وهما **الهدف (goal)**.`,
        ),
      ],
    },
    {
      id: "types",
      pill: bi("Four types", "أربعة أنواع"),
      heading: bi("What the agent knows decides the problem type", "ما يعرفه الوكيل يحدد نوع المسألة"),
      control: {
        label: bi("Problem type", "نوع المسألة"),
        options: [
          { id: "single", label: bi("Single-state", "الحالة الواحدة") },
          { id: "conformant", label: bi("Conformant", "المتوافقة") },
          { id: "contingency", label: bi("Contingency", "الطوارئ") },
          { id: "exploration", label: bi("Exploration", "الاستكشاف") },
        ],
        initial: "single",
      },
      points: [bi("How hard a problem is depends on what the agent knows about its **state** and about its **actions**.", "تتوقف صعوبة المسألة على ما يعرفه الوكيل عن **حالته (state)** وعن **أفعاله (actions)**.")],
      pointsFor: {
        single: [
          bi(
            "**Deterministic and fully observable**: the agent knows exactly which state it is in, so the solution is a fixed **sequence**.",
            "**حتمية وقابلة للملاحظة كليًا**: يعرف الوكيل الحالة التي هو فيها بالضبط، لذا فالحل **تسلسل (sequence)** ثابت.",
          ),
        ],
        conformant: [
          bi(
            "**Non-observable** (sensorless): the agent may have no idea where it is. A solution, if any, is still one sequence, and it must work from every possible state.",
            "**غير قابلة للملاحظة** (عديمة المستشعرات sensorless): قد لا يعرف الوكيل أين هو إطلاقًا. والحل إن وُجد يظل تسلسلًا واحدًا، ويجب أن ينجح من كل حالة ممكنة.",
          ),
        ],
        contingency: [
          bi(
            "**Nondeterministic and/or partially observable**: percepts bring new information while acting, so the solution is a **contingent plan** with branches.",
            "**غير حتمية و/أو قابلة للملاحظة جزئيًا**: تأتي الإدراكات بمعلومات جديدة أثناء التصرف، لذا فالحل **خطة طوارئ (contingent plan)** ذات تفرعات.",
          ),
        ],
        exploration: [
          bi(
            "**Unknown state space**: the agent doesn't even know which states exist or what its actions do, so it has to act to find out (**online**).",
            "**فضاء حالات مجهول**: لا يعرف الوكيل حتى ما الحالات الموجودة ولا ما تفعله أفعاله، لذا عليه أن يتصرف ليكتشف ذلك (**آنيًا online**).",
          ),
        ],
      },
    },
    {
      id: "single",
      pill: bi("Single-state", "الحالة الواحدة"),
      heading: bi("Start in #5: [Right, Suck]", "البداية من الحالة 5: [Right, Suck]"),
      points: [
        bi("The agent knows it is in state **5**: in square A, with A clean and B dirty.", "يعرف الوكيل أنه في الحالة **5**: في المربع A، و A نظيف و B متسخ."),
        bi("So it plans **[Right, Suck]**: 5 → 6 → 8, a clean world in two actions.", "لذا يخطط للتسلسل **[Right, Suck]**: من 5 إلى 6 ثم إلى 8، أي عالم نظيف بفعلين فقط."),
      ],
    },
    {
      id: "belief",
      pill: bi("Conformant", "المتوافقة"),
      heading: bi("Reasoning about a set of states", "الاستدلال على مجموعة من الحالات"),
      points: [
        bi(
          `With no sensors the agent tracks a **belief state**: the set of states it might be in, at first all ${BELIEF_SIZES[0]}.`,
          `من دون مستشعرات يتتبع الوكيل **حالة اعتقاد (belief state)**: أي مجموعة الحالات التي قد يكون فيها، وهي في البداية الحالات الـ ${BELIEF_SIZES[0]} كلها.`,
        ),
        bi(
          `Each action moves the whole set: **[${CONFORMANT_PLAN.join(", ")}]** shrinks it ${BELIEF_SIZES.join(" → ")}, ending in clean state ${FINAL_BELIEF.join(", ")} from any start.`,
          `يحرّك كل فعل المجموعة كلها: فالتسلسل **[${CONFORMANT_PLAN.join(", ")}]** يقلّصها ${BELIEF_SIZES.join(" → ")}، لينتهي في الحالة النظيفة ${FINAL_BELIEF.join(", ")} مهما كانت البداية.`,
        ),
      ],
    },
    {
      id: "contingency",
      pill: bi("Contingency", "الطوارئ"),
      heading: bi("A plan with a branch: [Right, if dirt then Suck]", "خطة ذات تفرّع: [Right, if dirt then Suck]"),
      points: [
        bi(
          "**Murphy's law**: Suck can dirty a clean carpet. And the agent senses only its own square, so from A it can't tell whether B is dirty.",
          "**قانون مورفي (Murphy's law)**: قد يؤدي Suck إلى اتساخ سجادة نظيفة. كما أن الوكيل لا يستشعر إلا مربعه، فلا يعرف وهو في A إن كان B متسخًا.",
        ),
        bi("So it moves Right, **senses**, and sucks only if there is dirt. The percept picks the branch.", "لذا يتحرك Right، ثم **يستشعر**، ولا يشغّل Suck إلا إذا وُجدت أوساخ، فالإدراك هو الذي يختار الفرع."),
      ],
    },
  ],
});

// ---------- Formulating a single-state problem ----------
export const formulation = defineWalkthrough({
  id: "ai2-formulation",
  title: bi("The parts of a problem", "مكونات المسألة"),
  analogy: bi(
    "A board game's rule book: where the pieces start, which moves are allowed and what each one does, how you win, and how the score is kept.",
    "كتيّب قواعد لعبة لوحية: أين تبدأ القطع، وما الحركات المسموح بها وماذا تفعل كل حركة، وكيف تفوز، وكيف تُحسب النقاط.",
  ),
  facts: { optimal: OPTIMAL_KM, viaFagaras: FAGARAS_KM, goals: VACUUM_GOALS.join(",") },
  panels: [
    {
      id: "components",
      pill: bi("The parts", "المكونات"),
      heading: bi("A problem, filled in", "مسألة مكتملة العناصر"),
      control: {
        label: bi("Example", "المثال"),
        options: [
          { id: "romania", label: bi("Romania", "رومانيا") },
          { id: "vacuum", label: bi("Vacuum world", "عالم المكنسة") },
          { id: "puzzle", label: bi("8-puzzle", "لغز الثمانية") },
        ],
        initial: "romania",
      },
      points: [
        bi(
          "A problem gives an **initial state**, the **actions** available, a **transition model** saying what each action does, a **goal test** and a **path cost**.",
          "تحدد المسألة **حالة ابتدائية (initial state)**، و**الأفعال (actions)** المتاحة، و**نموذج انتقال (transition model)** يبيّن نتيجة كل فعل، و**اختبار الهدف (goal test)**، و**تكلفة المسار (path cost)**.",
        ),
        bi(
          "The slides bundle the actions and the transition model into one **successor function S(x)**, which leaves four items.",
          "تجمع الشرائح الأفعالَ ونموذجَ الانتقال في **دالة الحالات التالية (successor function) S(x)** واحدة، فتبقى أربعة عناصر.",
        ),
      ],
      pointsFor: {
        romania: [bi("Route finding: the states are cities, and a step costs the length of the road in km.", "إيجاد الطريق: الحالات هي المدن، وتكلفة الخطوة هي طول الطريق بالكيلومتر.")],
        vacuum: [
          bi(
            `The goal test is **implicit**: any state with no dirt passes, so ${VACUUM_GOALS.join(" and ")} are both goals.`,
            `اختبار الهدف هنا **ضمني (implicit)**: تجتازه أي حالة بلا أوساخ، لذا فالحالتان ${VACUUM_GOALS.join(" و ")} كلتاهما هدف.`,
          ),
        ],
        puzzle: [bi("The actions move the **blank**, and every move costs 1, so the path cost is the number of moves.", "الأفعال تحرّك **الخانة الفارغة (blank)**، وتكلفة كل حركة 1، لذا فتكلفة المسار هي عدد الحركات.")],
      },
    },
    {
      id: "successor",
      pill: bi("Successor function", "دالة الحالات التالية"),
      heading: bi("S(Arad): every action and where it leads", "S(Arad): كل فعل وإلى أين يقود"),
      control: {
        label: bi("Written as", "مكتوبة على هيئة"),
        options: [
          { id: "pairs", label: bi("S(x) pairs (slides)", "أزواج S(x) (الشرائح)") },
          { id: "split", label: bi("ACTIONS + RESULT", "ACTIONS + RESULT") },
        ],
        initial: "pairs",
      },
      points: [bi("Three roads leave Arad, so the agent has three actions there, each leading to one city.", "تخرج من أراد ثلاث طرق، لذا لدى الوكيل هناك ثلاثة أفعال، يقود كل منها إلى مدينة واحدة.")],
      pointsFor: {
        pairs: [
          bi(
            "The **successor function** returns (action, next state) pairs: S(Arad) = {(Arad→Zerind, Zerind), …}.",
            "تُرجع **دالة الحالات التالية (successor function)** أزواجًا من (فعل، حالة تالية): S(Arad) = {(Arad→Zerind, Zerind), …}.",
          ),
        ],
        split: [
          bi(
            "Newer editions split it in two: **ACTIONS(s)** lists what can be done, and **RESULT(s, a)** gives the state it leads to. The information is the same.",
            "تقسمها الطبعات الأحدث إلى جزأين: **ACTIONS(s)** تسرد ما يمكن فعله، و **RESULT(s, a)** تعطي الحالة التي يقود إليها الفعل، والمعلومات نفسها.",
          ),
        ],
      },
    },
    {
      id: "goal-test",
      pill: bi("Goal test", "اختبار الهدف"),
      heading: bi("Is this state a goal?", "هل هذه الحالة هدف؟"),
      control: {
        label: bi("Goal test", "اختبار الهدف"),
        options: [
          { id: "explicit", label: bi("Explicit", "صريح") },
          { id: "implicit", label: bi("Implicit", "ضمني") },
        ],
        initial: "explicit",
      },
      points: [bi("The **goal test** is applied to a state and answers yes or no.", "يُطبَّق **اختبار الهدف (goal test)** على حالة ما، ويجيب بنعم أو لا.")],
      pointsFor: {
        explicit: [bi("**Explicit**: the goal is one named state, x = In(Bucharest). Only one city passes.", "**صريح (explicit)**: الهدف حالة واحدة محددة بالاسم، x = In(Bucharest)، ولا تجتازه إلا مدينة واحدة.")],
        implicit: [
          bi(
            `**Implicit**: the goal is a property, NoDirt(x). Every state with that property passes, here ${VACUUM_GOALS.join(" and ")}.`,
            `**ضمني (implicit)**: الهدف خاصية، NoDirt(x)، وتجتازه كل حالة تتصف بها، وهنا الحالتان ${VACUUM_GOALS.join(" و ")}.`,
          ),
        ],
      },
    },
    {
      id: "path-cost",
      pill: bi("Path cost", "تكلفة المسار"),
      heading: bi("Step costs add up along the path", "تكاليف الخطوات تتراكم على طول المسار"),
      points: [
        bi(
          "The **path cost** is additive: g is the sum of the **step costs** c(x, a, y) along the path.",
          "**تكلفة المسار (path cost)** جمعية: g هي مجموع **تكاليف الخطوات (step costs)** c(x, a, y) على طول المسار.",
        ),
        bi(
          `Step costs are assumed **≥ 0**, so g can only grow as the path gets longer: ${OPTIMAL_RUN.join(", ")}.`,
          `يُفترض أن تكون تكاليف الخطوات **≥ 0**، لذا لا يمكن لـ g إلا أن تزداد كلما طال المسار: ${OPTIMAL_RUN.join("، ")}.`,
        ),
      ],
    },
    {
      id: "solution",
      pill: bi("Optimal solution", "الحل الأمثل"),
      heading: bi("Every path to a goal is a solution; the cheapest is optimal", "كل مسار إلى الهدف حل، وأرخصها هو الأمثل"),
      points: [
        bi(
          "A **solution** is a sequence of actions from the initial state to a goal state. A path that stops anywhere else is not one.",
          "**الحل (solution)** تسلسل من الأفعال يقود من الحالة الابتدائية إلى حالة هدف، أما المسار الذي يتوقف في أي مكان آخر فليس حلًا.",
        ),
        bi(`An **optimal solution** has the lowest path cost of all: ${OPTIMAL_KM} km beats ${FAGARAS_KM} km.`, `و**الحل الأمثل (optimal solution)** هو صاحب أقل تكلفة مسار بين الحلول كلها: ${OPTIMAL_KM} كم أفضل من ${FAGARAS_KM} كم.`),
      ],
    },
  ],
});

// ---------- Selecting a state space ----------
export const abstraction = defineWalkthrough({
  id: "ai2-abstraction",
  title: bi("From the real world to a state space", "من العالم الحقيقي إلى فضاء الحالات"),
  analogy: bi(
    "A metro map. It drops the streets, distances and buildings and keeps only stations and lines, which is exactly what you need to plan a trip.",
    "خريطة المترو: تُسقط الشوارع والمسافات والمباني، ولا تُبقي إلا المحطات والخطوط، وهذا بالضبط ما تحتاج إليه لتخطيط رحلتك.",
  ),
  facts: { aradZerind: road("Arad", "Zerind") },
  panels: [
    {
      id: "states",
      pill: bi("Abstract state", "الحالة المجردة"),
      heading: bi("Many real states, one abstract state", "حالات حقيقية كثيرة وحالة مجردة واحدة"),
      points: [
        bi("The real world is absurdly complex, so the state space must be **abstracted**: irrelevant detail is left out.", "العالم الحقيقي معقد إلى حد مفرط، لذا يجب **تجريد (abstract)** فضاء الحالات بإسقاط التفاصيل غير ذات الصلة."),
        bi(
          "An **abstract state** stands for a set of real states: In(Arad) covers any weather, any radio station and any spot in town.",
          "**الحالة المجردة (abstract state)** تمثل مجموعة من الحالات الحقيقية: فالحالة In(Arad) تشمل أي طقس وأي محطة راديو وأي مكان في المدينة.",
        ),
      ],
    },
    {
      id: "actions",
      pill: bi("Abstract action", "الفعل المجرد"),
      heading: bi("Arad → Zerind hides a lot of driving", "الفعل Arad → Zerind يُخفي قيادة كثيرة"),
      control: {
        label: bi("View", "العرض"),
        options: [
          { id: "real", label: bi("Real world", "العالم الحقيقي") },
          { id: "abstract", label: bi("State space", "فضاء الحالات") },
        ],
        initial: "real",
      },
      points: [bi("An **abstract action** stands for a complex combination of real actions.", "**الفعل المجرد (abstract action)** يمثل تركيبة معقدة من الأفعال الحقيقية.")],
      pointsFor: {
        real: [bi("On the ground, getting to Zerind means choosing among routes, detours and rest stops.", "على أرض الواقع، يعني الوصول إلى زيرند (Zerind) الاختيار بين طرق وتحويلات ومحطات استراحة.")],
        abstract: [
          bi(`In the state space all of that is one edge, Arad → Zerind, with one cost: ${road("Arad", "Zerind")} km.`, `أما في فضاء الحالات فكل ذلك حافة (edge) واحدة، Arad → Zerind، بتكلفة واحدة: ${road("Arad", "Zerind")} كم.`),
        ],
      },
    },
    {
      id: "valid",
      pill: bi("Valid", "صالح"),
      heading: bi("Every real state in Arad must reach Zerind", "يجب أن تصل كل حالة حقيقية في أراد إلى زيرند"),
      points: [
        bi(
          "For guaranteed **realizability**, every real state \"in Arad\" must be able to get to some real state \"in Zerind\".",
          "لضمان **قابلية التحقيق (realizability)**، يجب أن تتمكن كل حالة حقيقية «في أراد» من الوصول إلى حالة حقيقية ما «في زيرند».",
        ),
        bi("Then an **abstract solution** stands for a set of real paths that are solutions in the real world.", "عندئذٍ يمثل **الحل المجرد (abstract solution)** مجموعة من المسارات الحقيقية التي تُعدّ حلولًا في العالم الحقيقي."),
      ],
    },
    {
      id: "detail",
      pill: bi("Useful", "مفيد"),
      heading: bi("How much detail to keep", "ما مقدار التفاصيل التي نحتفظ بها"),
      control: {
        label: bi("Level of detail", "مستوى التفاصيل"),
        options: [
          { id: "fine", label: bi("Steering moves", "حركات التوجيه") },
          { id: "cities", label: bi("City to city", "من مدينة إلى مدينة") },
          { id: "coarse", label: bi("One big step", "خطوة واحدة كبيرة") },
        ],
        initial: "cities",
      },
      points: [bi("Each abstract action should be **easier** than the original problem.", "يجب أن يكون كل فعل مجرد **أسهل** من المسألة الأصلية.")],
      pointsFor: {
        fine: [bi("Too much detail: thousands of tiny steering moves make the search hopeless.", "تفاصيل أكثر من اللازم: آلاف من حركات التوجيه الصغيرة تجعل البحث ميؤوسًا منه.")],
        cities: [bi("Just right: four drives, each easy to carry out with road signs and a map.", "القدر المناسب: أربع رحلات قيادة، كل منها سهل التنفيذ بلافتات الطريق وخريطة.")],
        coarse: [
          bi("Too little: the single action Arad → Bucharest is as hard as the problem itself, so nothing has been solved.", "تفاصيل أقل من اللازم: الفعل الوحيد Arad → Bucharest صعب صعوبةَ المسألة نفسها، فلم يُحلّ شيء."),
        ],
      },
    },
  ],
});

// ---------- Example problems ----------
const DIR_TEXT: Record<Dir, { en: string; ar: string; opp: { en: string; ar: string } }> = {
  up: { en: "up", ar: "إلى أعلى", opp: { en: "down", ar: "إلى أسفل" } },
  down: { en: "down", ar: "إلى أسفل", opp: { en: "up", ar: "إلى أعلى" } },
  left: { en: "left", ar: "إلى اليسار", opp: { en: "right", ar: "إلى اليمين" } },
  right: { en: "right", ar: "إلى اليمين", opp: { en: "left", ar: "إلى اليسار" } },
};

/** The tile that slides when the blank moves `dir` from the start state. */
const slid = (dir: Dir) => {
  const next = moveBlank(PUZZLE_START, dir);
  return next ? PUZZLE_START[next.indexOf(0)] : null;
};

export const examples = defineWalkthrough({
  id: "ai2-examples",
  title: bi("Three example problems", "ثلاث مسائل نموذجية"),
  analogy: bi(
    "Practice drills. Each toy problem isolates one feature of real ones: a space small enough to draw, a huge but discrete space, and a continuous one.",
    "تمارين تدريبية: كل مسألة مصغّرة تعزل سمة واحدة من سمات المسائل الحقيقية: فضاء صغير يمكن رسمه، وفضاء ضخم لكنه منفصل، وفضاء متصل.",
  ),
  facts: { states: VACUUM_STATES.length, puzzleStates: reachable(3), tileActions: TILE_ACTIONS },
  panels: [
    {
      id: "vacuum",
      pill: bi("Vacuum world", "عالم المكنسة"),
      heading: bi("The whole state space fits in one picture", "فضاء الحالات كله يتسع في صورة واحدة"),
      points: [
        bi(
          `**${VACUUM_STATES.length} states**; actions **Left, Right, Suck** (and NoOp); goal: **no dirt**; cost: **1 per action** (0 for NoOp).`,
          `**${VACUUM_STATES.length} حالات**؛ والأفعال **Left و Right و Suck** (و NoOp)؛ والهدف: **لا أوساخ**؛ والتكلفة: **1 لكل فعل** (و 0 للفعل NoOp).`,
        ),
        bi("Each arrow is an action. Actions that change nothing, like Suck on a clean square, are left out.", "كل سهم فعل، وقد حُذفت الأفعال التي لا تغيّر شيئًا، مثل Suck على مربع نظيف."),
      ],
    },
    {
      id: "puzzle",
      pill: bi("8-puzzle", "لغز الثمانية"),
      heading: bi("Slide the tiles until the board matches the goal", "حرّك القطع حتى تطابق اللوحةُ الهدفَ"),
      points: [
        bi("**States**: where each tile and the blank are. **Goal test**: the board equals the given goal state.", "**الحالات**: موضع كل قطعة والخانة الفارغة. **اختبار الهدف**: أن تساوي اللوحةُ الحالةَ الهدف المعطاة."),
        bi("**Path cost**: 1 per move. Positions half-way through a slide are ignored.", "**تكلفة المسار**: 1 لكل حركة، مع تجاهل المواضع الوسيطة أثناء انزلاق القطعة."),
      ],
    },
    {
      id: "blank",
      pill: bi("Move the blank", "حرّك الخانة الفارغة"),
      heading: bi(`${legalMoves(PUZZLE_START).length} actions, all of them moves of the blank`, `${legalMoves(PUZZLE_START).length} أفعال، كلها حركات للخانة الفارغة`),
      control: {
        label: bi("Move the blank", "حرّك الخانة الفارغة"),
        options: [
          { id: "up", label: bi("Up", "أعلى") },
          { id: "down", label: bi("Down", "أسفل") },
          { id: "left", label: bi("Left", "يسار") },
          { id: "right", label: bi("Right", "يمين") },
        ],
        initial: "left",
      },
      points: [
        bi("An action moves the **blank** one square, and the tile there slides the other way.", "يحرّك الفعل **الخانة الفارغة (blank)** مربعًا واحدًا، فتنزلق القطعة التي هناك في الاتجاه المعاكس."),
        bi(
          `Counted per tile it would be 8 tiles × 4 directions = ${TILE_ACTIONS} actions, and only ${legalMoves(PUZZLE_START).length} of them legal.`,
          `ولو عُدّت الأفعال لكل قطعة لكانت 8 قطع × 4 اتجاهات = ${TILE_ACTIONS} فعلًا، ${legalMoves(PUZZLE_START).length} منها فقط مسموح بها.`,
        ),
      ],
      pointsFor: Object.fromEntries(
        (["up", "down", "left", "right"] as const).map((d) => [
          d,
          [bi(`Blank ${DIR_TEXT[d].en}: tile ${slid(d)} slides ${DIR_TEXT[d].opp.en} into the centre.`, `الخانة الفارغة ${DIR_TEXT[d].ar}: تنزلق القطعة ${slid(d)} ${DIR_TEXT[d].opp.ar} نحو المركز.`)],
        ]),
      ),
    },
    {
      id: "count",
      pill: bi(`${thousands(reachable(3))} states`, `${thousands(reachable(3))} حالة`),
      heading: bi("Only half of the arrangements can be reached", "لا يمكن الوصول إلا إلى نصف الترتيبات"),
      control: {
        label: bi("Board", "اللوحة"),
        options: [
          { id: "three", label: bi("3 × 3 (8-puzzle)", "3 × 3 (لغز الثمانية)") },
          { id: "four", label: bi("4 × 4 (15-puzzle)", "4 × 4 (لغز الخمسة عشر)") },
        ],
        initial: "three",
      },
      points: [
        bi(
          "A slide never changes the board's **parity**, so the arrangements split into two halves that can never reach each other.",
          "لا يغيّر الانزلاق أبدًا **زوجية (parity)** اللوحة، لذا تنقسم الترتيبات إلى نصفين لا يصل أحدهما إلى الآخر أبدًا.",
        ),
      ],
      pointsFor: {
        three: [
          bi(
            `9! = ${thousands(arrangements(3))} arrangements, so **9!/2 = ${thousands(reachable(3))}** reachable states.`,
            `9! = ${thousands(arrangements(3))} ترتيبًا، أي **9!/2 = ${thousands(reachable(3))}** حالة يمكن الوصول إليها.`,
          ),
        ],
        four: [
          bi(
            `One size up, 16!/2 is over ${Math.floor(reachable(4) / 1e12)} trillion states. Solving the n-puzzle optimally is **NP-hard**.`,
            `وبزيادة الحجم درجة واحدة يتجاوز 16!/2 عشرة تريليونات حالة، وحل n-puzzle حلًا أمثل مسألة **NP-hard**.`,
          ),
        ],
      },
    },
    {
      id: "assembly",
      pill: bi("Robotic assembly", "التجميع الروبوتي"),
      heading: bi("A continuous state space", "فضاء حالات متصل"),
      control: {
        label: bi("Joint angles", "زوايا المفاصل"),
        options: [
          { id: "continuous", label: bi("Real-valued", "قيم حقيقية") },
          { id: "discrete", label: bi("Discretised", "مقطَّعة") },
        ],
        initial: "continuous",
      },
      points: [
        bi(
          "**States** are real-valued joint angles plus the parts; **actions** are continuous joint motions; the **cost** is the time to execute.",
          "**الحالات** زوايا مفاصل ذات قيم حقيقية بالإضافة إلى الأجزاء، و**الأفعال** حركات متصلة للمفاصل، و**التكلفة** زمن التنفيذ.",
        ),
      ],
      pointsFor: {
        continuous: [
          bi("An angle can take any value, so there are infinitely many states and no finite list of successors to search.", "يمكن للزاوية أن تأخذ أي قيمة، لذا فعدد الحالات لا نهائي، ولا توجد قائمة منتهية من الحالات التالية للبحث فيها."),
        ],
        discrete: [
          bi("Rounding each angle to steps, say every 15°, gives a finite grid that ordinary search can handle.", "تقريب كل زاوية إلى خطوات، كل 15° مثلًا، يعطي شبكة منتهية يستطيع البحث العادي التعامل معها."),
        ],
      },
    },
  ],
});

/** Every walkthrough in this lecture, registered in lib/walkthroughs/index.ts. */
export const all = [agents, problemTypes, formulation, abstraction, examples] as const;

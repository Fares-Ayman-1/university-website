import { bi } from "@/components/widgets/types";
import { defineWalkthrough } from "@/lib/widgets/walkthrough";
import { CHESS_PLY, CHESS_TREE_EXP, EVAL_VALUE, HORIZON, INTENTION_VALUES, PLAYOUT_WINS, PLAYOUTS, TTT_LEAVES, WORKED_FACTS } from "@/lib/widgets/ai-lecture-04";

/*
 * Artificial Intelligence · Lecture 4 (content/subjects/artificial-intelligence/lectures/04-adversarial-search.mdx),
 * written from the course book's Chapter 4. One walkthrough per heading; the scenes are in
 * components/widgets/walkthrough/scenes/artificial-intelligence/lecture-04/, and every number
 * they draw comes from lib/widgets/ai-lecture-04.ts.
 */

// ---------- 4.1 Introduction ----------
export const intro = defineWalkthrough({
  id: "ai4-intro",
  title: bi("Games as adversarial search", "الألعاب بوصفها بحثًا تنافسيًا"),
  analogy: bi(
    "Planning a drive while a rival controls every traffic light and wants you to be late. You cannot just hope for green: at each junction you plan for the worst light the rival can show.",
    "تخطيط رحلة بالسيارة بينما يتحكم منافسٌ في كل إشارات المرور ويريد أن تتأخر. لا يمكنك أن تكتفي بتمنّي الضوء الأخضر، بل تخطط عند كل تقاطع لأسوأ إشارة يستطيع المنافس أن يُظهرها.",
  ),
  panels: [
    {
      id: "conflict",
      pill: bi("Conflicting goals", "أهداف متعارضة"),
      heading: bi("Two agents pull one game in opposite directions", "وكيلان يشدّان لعبة واحدة في اتجاهين متعاكسين"),
      points: [
        bi("In a **competitive** environment, two or more agents have **conflicting goals**.", "في البيئة **التنافسية (competitive)** يكون لوكيلين أو أكثر **أهداف متعارضة**."),
        bi(
          "Planning ahead there is **adversarial search**: every plan must allow for the moves of an opponent who wants the opposite outcome.",
          "والتخطيط المسبق في مثل هذه البيئة هو **البحث التنافسي (adversarial search)**: إذ يجب أن تحسب كل خطة حسابَ نقلات خصمٍ يريد النتيجة المعاكسة.",
        ),
      ],
    },
    {
      id: "structured",
      pill: bi("Board or field", "رقعة أم ملعب"),
      heading: bi("Why AI studies board games, not field games", "لماذا يدرس الذكاء الاصطناعي ألعاب الرقعة لا ألعاب الملعب"),
      control: {
        label: bi("Game", "اللعبة"),
        options: [
          { id: "chess", label: bi("Chess", "الشطرنج") },
          { id: "hockey", label: bi("Ice hockey", "هوكي الجليد") },
        ],
        initial: "chess",
      },
      points: [
        bi(
          "AI research concentrates on **structured games**: they are easy to represent, and precise rules govern their actions.",
          "تركّز أبحاث الذكاء الاصطناعي على **الألعاب المهيكلة (structured games)**: فتمثيلها سهل، وتحكم أفعالَها قواعدُ دقيقة.",
        ),
      ],
      pointsFor: {
        chess: [bi("A chess position is a **well-defined state**, and the rules say exactly which moves are legal in it.", "وضعية الشطرنج **حالة (state) محددة تمامًا**، والقواعد تحدد بدقة أي النقلات مسموح بها فيها.")],
        hockey: [
          bi(
            "Physical games such as **croquet** or **ice hockey** have complex descriptions, a huge range of possible actions and **imprecise** rules of legality.",
            "أما الألعاب البدنية مثل **الكروكيه (croquet)** أو **هوكي الجليد (ice hockey)** فأوصافها معقدة، ونطاق أفعالها الممكنة هائل، وقواعد مشروعية الأفعال فيها **غير دقيقة**.",
          ),
        ],
      },
    },
    {
      id: "which",
      pill: bi("Chess, Go, poker", "الشطرنج وغو والبوكر"),
      heading: bi("Which games fit this lecture's algorithms", "أي الألعاب تناسب خوارزميات هذه المحاضرة"),
      points: [
        bi(
          "Chess and Go are **deterministic** games of **perfect information**: there are no dice, and both players see the whole board.",
          "الشطرنج وغو (Go) لعبتان **حتميتان (deterministic)** وذواتا **معلومات كاملة (perfect information)**: فلا نرد فيهما، ويرى اللاعبان الرقعة كاملة.",
        ),
        bi(
          "Poker **hides** each player's cards and deals them at random, so it needs more than the minimax methods of this lecture.",
          "أما البوكر (poker) فـ**يُخفي** أوراق كل لاعب ويوزّعها عشوائيًا، لذا يحتاج إلى أكثر من أساليب minimax في هذه المحاضرة.",
        ),
      ],
    },
  ],
});

// ---------- 4.2 Game theory perspectives ----------
export const stances = defineWalkthrough({
  id: "ai4-stances",
  title: bi("Three stances towards other agents", "ثلاثة منظورات للتعامل مع الوكلاء الآخرين"),
  analogy: bi(
    "A shopkeeper watches total demand, not each buyer; a farmer treats the weather as luck; a chess player assumes the rival will find the strongest reply.",
    "صاحب المتجر يراقب إجمالي الطلب لا كل مشترٍ على حدة؛ والمزارع يتعامل مع الطقس على أنه حظ؛ أما لاعب الشطرنج فيفترض أن منافسه سيجد أقوى رد.",
  ),
  facts: {
    avgL: INTENTION_VALUES.random.L,
    avgR: INTENTION_VALUES.random.R,
    minL: INTENTION_VALUES.adversary.L,
    minR: INTENTION_VALUES.adversary.R,
  },
  panels: [
    {
      id: "stances",
      pill: bi("Three stances", "ثلاثة منظورات"),
      heading: bi("How to treat the other agents", "كيف نتعامل مع الوكلاء الآخرين"),
      control: {
        label: bi("Stance", "المنظور"),
        options: [
          { id: "aggregate", label: bi("Aggregate", "تجميعي") },
          { id: "environment", label: bi("Part of the environment", "جزء من البيئة") },
          { id: "explicit", label: bi("Explicit adversary", "خصم صريح") },
        ],
        initial: "aggregate",
      },
      points: [bi("Game theory offers **three stances** for an environment that contains other agents.", "تقدّم نظرية الألعاب (game theory) **ثلاثة منظورات** للبيئة التي تحتوي على وكلاء آخرين.")],
      pointsFor: {
        aggregate: [
          bi(
            "**Aggregate stance**: when a very large number of agents interact, model them together as an **economy**. Rising demand predicts rising prices without tracking any single agent.",
            "**المنظور التجميعي (aggregate stance)**: عندما يتفاعل عدد كبير جدًا من الوكلاء، نمذجهم معًا بوصفهم **اقتصادًا**؛ فزيادة الطلب تتنبأ بارتفاع الأسعار دون تتبّع أي وكيل بعينه.",
          ),
        ],
        environment: [
          bi(
            "**Adversary as environment**: treat opponents as part of a **nondeterministic** environment, like the weather, and plan for every outcome they might cause.",
            "**الخصم بوصفه جزءًا من البيئة**: عامِل الخصوم كجزء من بيئة **غير حتمية (nondeterministic)** مثل الطقس، وخطّط لكل نتيجة قد يتسببون فيها.",
          ),
        ],
        explicit: [
          bi(
            "**Explicit adversarial modelling**: represent the opponent as an agent with its own goal in a **game tree**, search it with **minimax**, and **prune** the parts that cannot matter.",
            "**النمذجة الصريحة للخصم**: مثّل الخصم وكيلًا له هدفه الخاص في **شجرة لعبة (game tree)**، وابحث فيها باستخدام **minimax**، و**قلّم (prune)** الأجزاء التي لا يمكن أن تؤثر.",
          ),
        ],
      },
    },
    {
      id: "intention",
      pill: bi("Rain or rival", "مطر أم منافس"),
      heading: bi("The environment view misses intention", "منظور البيئة يُغفل النيّة"),
      control: {
        label: bi("The other side is", "الطرف الآخر"),
        options: [
          { id: "random", label: bi("Random, like rain", "عشوائي مثل المطر") },
          { id: "adversary", label: bi("An adversary", "خصم") },
        ],
        initial: "random",
      },
      points: [bi("Rain falls at random, but an adversary **chooses** the outcome that is worst for us.", "المطر يهطل عشوائيًا، أما الخصم فـ**يختار** النتيجة الأسوأ بالنسبة إلينا.")],
      pointsFor: {
        random: [bi("Averaging the two outcomes of each move, **L** looks better: 4 against 3.5.", "بحساب متوسط نتيجتَي كل نقلة تبدو النقلة **L** أفضل: 4 مقابل 3.5.")],
        adversary: [bi("An adversary answers L with 0, so **R** is the better move: it guarantees at least 3.", "أما الخصم فيرد على L بالنتيجة 0، لذا تكون **R** النقلة الأفضل: فهي تضمن 3 على الأقل.")],
      },
    },
    {
      id: "estimate",
      pill: bi("Cut off and estimate", "اقطع ثم قدّر"),
      heading: bi("When the tree is too big, estimate the outcome", "حين تكون الشجرة أكبر من اللازم، قدّر النتيجة"),
      control: {
        label: bi("Estimate with", "التقدير باستخدام"),
        options: [
          { id: "eval", label: bi("Evaluation function", "دالة التقييم") },
          { id: "mc", label: bi("Monte Carlo", "مونت كارلو") },
        ],
        initial: "eval",
      },
      points: [
        bi(
          "Time limits force a nontrivial game's search to **stop early** and **estimate** how good the position at the cut is.",
          "تُجبر حدود الوقت البحثَ في أي لعبة غير بسيطة على **التوقف مبكرًا** و**تقدير** مدى جودة الوضعية عند نقطة القطع.",
        ),
      ],
      pointsFor: {
        eval: [
          bi(
            `A **heuristic evaluation function** scores the position from its **features**, such as the material each side has: here ${EVAL_VALUE}.`,
            `تقيّم **دالة التقييم الاستدلالية (heuristic evaluation function)** الوضعيةَ من خلال **سماتها (features)**، مثل العتاد (material) الذي يملكه كل طرف: والنتيجة هنا ${EVAL_VALUE}.`,
          ),
        ],
        mc: [
          bi(
            `A **Monte Carlo** simulation plays many fast games to the end and **averages** the results: ${PLAYOUT_WINS} wins in ${PLAYOUTS.length} gives ${PLAYOUT_WINS / PLAYOUTS.length}.`,
            `أما محاكاة **مونت كارلو (Monte Carlo)** فتلعب مباريات سريعة كثيرة حتى نهايتها وتأخذ **متوسط** نتائجها: ${PLAYOUT_WINS} انتصارات من ${PLAYOUTS.length} تعطي ${PLAYOUT_WINS / PLAYOUTS.length}.`,
          ),
        ],
      },
    },
  ],
});

// ---------- 4.3 Two-player, zero-sum, perfect-information games ----------
export const games = defineWalkthrough({
  id: "ai4-games",
  title: bi("Two-player, zero-sum, perfect-information games", "الألعاب الثنائية صفرية المجموع ذات المعلومات الكاملة"),
  analogy: bi(
    "Two people sharing one cake: every slice one of them takes is a slice the other loses, so the two shares always add up to the same whole.",
    "شخصان يتقاسمان كعكة واحدة: كل قطعة يأخذها أحدهما قطعةٌ يخسرها الآخر، فيبقى مجموع النصيبين دائمًا الكعكة كاملة.",
  ),
  facts: { ttt: TTT_LEAVES },
  panels: [
    {
      id: "properties",
      pill: bi("Four properties", "أربع خصائص"),
      heading: bi("The kind of game this lecture solves", "نوع الألعاب التي تحلّها هذه المحاضرة"),
      points: [
        bi(
          "The games are **deterministic**, **turn-taking**, **two-player** and **zero-sum**, with **perfect information**, like chess and tic-tac-toe.",
          "الألعاب المقصودة **حتمية (deterministic)**، و**تتبادل الأدوار (turn-taking)**، و**ثنائية اللاعبين**، و**صفرية المجموع (zero-sum)**، وذات **معلومات كاملة (perfect information)**، مثل الشطرنج ولعبة إكس-أو (tic-tac-toe).",
        ),
        bi("The players are called **MAX**, who moves first, and **MIN**, the opponent.", "ويُسمّى اللاعبان **MAX**، وهو الذي يبدأ اللعب، و**MIN**، وهو الخصم."),
      ],
    },
    {
      id: "payoff",
      pill: bi("Zero-sum payoffs", "عوائد صفرية المجموع"),
      heading: bi("What is good for one is equally bad for the other", "ما يفيد أحدهما يضرّ الآخر بالقدر نفسه"),
      control: {
        label: bi("Scores", "النقاط"),
        options: [
          { id: "chess", label: bi("Chess: 1, ½, 0", "الشطرنج: 1، ½، 0") },
          { id: "symmetric", label: bi("+1, 0, −1", "+1، 0، −1") },
        ],
        initial: "chess",
      },
      points: [bi("In a **zero-sum** game no outcome is good for both players: whatever MAX gains, MIN loses.", "في اللعبة **صفرية المجموع (zero-sum)** لا توجد نتيجة جيدة للاعبين كليهما: فكل ما يكسبه MAX يخسره MIN.")],
      pointsFor: {
        chess: [
          bi(
            "Chess scores a win as 1, a draw as ½ and a loss as 0. Every row adds up to **1**: the total is constant, which is what zero-sum really means.",
            "يحتسب الشطرنج الفوز 1 والتعادل ½ والخسارة 0. ومجموع كل صف **1**: فالمجموع ثابت، وهذا هو المعنى الحقيقي لصفرية المجموع.",
          ),
        ],
        symmetric: [
          bi(
            "Scoring +1, 0, −1 instead makes every total **0**. The players' preferences, and so their best moves, stay the same.",
            "أما احتساب النتائج +1 و 0 و −1 فيجعل كل مجموع **0**، وتبقى تفضيلات اللاعبين، ومن ثَمّ أفضل نقلاتهم، كما هي.",
          ),
        ],
      },
    },
    {
      id: "formal",
      pill: bi("The game as functions", "اللعبة بوصفها دوالّ"),
      heading: bi("Six pieces define a game", "ستة عناصر تعرّف اللعبة"),
      points: [
        bi(
          "A game is defined by its initial state **S0** and five functions: **TO-MOVE**, **ACTIONS**, **RESULT**, **IS-TERMINAL** and **UTILITY**.",
          "تُعرَّف اللعبة بحالتها الابتدائية **S0** وخمس دوال: **TO-MOVE** و**ACTIONS** و**RESULT** و**IS-TERMINAL** و**UTILITY**.",
        ),
        bi("**UTILITY(s, p)** is the final payoff to player p when the game ends in state s; here X has won, so MAX gets +1.", "والدالة **UTILITY(s, p)** هي العائد النهائي للاعب p عندما تنتهي اللعبة في الحالة s؛ وهنا فاز X، فيحصل MAX على +1."),
      ],
    },
    {
      id: "tree",
      pill: bi("The game tree", "شجرة اللعبة"),
      heading: bi("From the state space to a game tree", "من فضاء الحالات إلى شجرة اللعبة"),
      points: [
        bi(
          "As in search, the **state-space graph** of positions and moves underlies a **search tree**; the **complete game tree** follows every line of play to a terminal state.",
          "كما في البحث، يقوم **رسم فضاء الحالات (state-space graph)**، أي الوضعيات والنقلات، تحت **شجرة بحث (search tree)**؛ أما **شجرة اللعبة الكاملة (complete game tree)** فتتبع كل مسار لعب حتى حالة نهائية.",
        ),
        bi(
          "It is small for tic-tac-toe, with fewer than **9! = 362,880** terminal nodes, but astronomically large for chess: over **10^40** nodes.",
          "وهي صغيرة في لعبة إكس-أو، إذ فيها أقل من **9! = 362,880** عقدة نهائية، لكنها هائلة الحجم في الشطرنج: أكثر من **10^40** عقدة.",
        ),
      ],
    },
    {
      id: "value",
      pill: bi("Minimax value", "قيمة minimax"),
      heading: bi("MINIMAX(s): the value under optimal play", "MINIMAX(s): القيمة في ظل اللعب الأمثل"),
      points: [
        bi(
          "**MINIMAX(s)** is the utility for MAX of being in state s, assuming **both players play optimally** from there on.",
          "**MINIMAX(s)** هي منفعة (utility) الوجود في الحالة s بالنسبة إلى MAX، بافتراض أن **اللاعبين كليهما يلعبان على النحو الأمثل** من تلك اللحظة فصاعدًا.",
        ),
        bi("At a terminal state it is the **utility**; at a MAX node, the **largest** child value; at a MIN node, the **smallest**.", "وهي عند الحالة النهائية **المنفعة** نفسها؛ وعند عقدة MAX **أكبر** قيم الأبناء؛ وعند عقدة MIN **أصغرها**."),
      ],
    },
  ],
});

// ---------- 4.4 The minimax algorithm ----------
export const minimax = defineWalkthrough({
  id: "ai4-minimax",
  title: bi("Minimax on a two-ply tree", "خوارزمية minimax على شجرة من مستويين"),
  analogy: bi(
    "A manager asks each department for its worst-case forecast, then backs the department whose worst case is the best.",
    "مدير يطلب من كل قسم توقعاته لأسوأ الاحتمالات، ثم يدعم القسم الذي يكون أسوأ احتمالاته هو الأفضل.",
  ),
  facts: { root: WORKED_FACTS.root, B: WORKED_FACTS.B, C: WORKED_FACTS.C, D: WORKED_FACTS.D, move: WORKED_FACTS.move, nodes: WORKED_FACTS.nodes, chessExp: CHESS_TREE_EXP },
  panels: [
    {
      id: "leaves",
      pill: bi("The tree", "الشجرة"),
      heading: bi("MAX moves, MIN replies, the leaves are scored", "يتحرك MAX ويرد MIN وتُقيَّم الأوراق"),
      points: [
        bi("MAX chooses **a1, a2 or a3**; MIN then replies, and each leaf holds the **utility for MAX** of that ending.", "يختار MAX إحدى النقلات **a1 أو a2 أو a3**، ثم يرد MIN، وتحمل كل ورقة **منفعة MAX** في تلك النهاية."),
        bi("This is a **two-ply** tree: a **ply** is one move by one player, so here each player moves once.", "هذه شجرة من **مستويين (two-ply)**: فالمستوى (ply) نقلةٌ واحدة يؤديها لاعب واحد، أي إن كل لاعب يتحرك هنا مرة واحدة."),
      ],
    },
    {
      id: "min-level",
      pill: bi("MIN backs up", "MIN يرفع القيم"),
      heading: bi("Each MIN node takes its smallest leaf", "كل عقدة MIN تأخذ أصغر أوراقها"),
      points: [
        bi(
          "MIN wants MAX to score as little as possible, so each MIN node is worth the **minimum** of its leaves: **B = 3, C = 2, D = 2**.",
          "يريد MIN أن يحصل MAX على أقل ما يمكن، لذا تساوي كل عقدة MIN **أصغر** أوراقها: **B = 3 و C = 2 و D = 2**.",
        ),
      ],
    },
    {
      id: "max-level",
      pill: bi("MAX decides", "MAX يقرر"),
      heading: bi("The root takes the largest MIN value", "الجذر يأخذ أكبر قيم عقد MIN"),
      points: [
        bi("MAX picks the child with the **highest backed-up value**: A = max(3, 2, 2) = **3**.", "يختار MAX الابن صاحب **أعلى قيمة مرفوعة (backed-up value)**: A = max(3, 2, 2) = **3**."),
        bi("So the **minimax decision** is **a1**, and MIN's best reply is **b1**: with best play the game ends with utility 3.", "إذن **قرار minimax** هو **a1**، وأفضل رد لـ MIN هو **b1**: ومع اللعب الأمثل تنتهي اللعبة بمنفعة 3."),
      ],
    },
    {
      id: "depth-first",
      pill: bi("Depth-first", "بالعمق أولًا"),
      heading: bi("A depth-first recursion, and what it costs", "استدعاء ذاتي بالعمق أولًا، وتكلفته"),
      points: [
        bi(
          "Minimax is a **depth-first** recursion: it walks down to a leaf, applies UTILITY, and backs values up as each call returns. The numbers give the order of the 13 visits.",
          "خوارزمية minimax استدعاء ذاتي (recursion) **بالعمق أولًا (depth-first)**: تنزل حتى ورقة، وتطبّق UTILITY، ثم ترفع القيم كلما عاد استدعاء. وتُبيّن الأرقام ترتيب الزيارات الثلاث عشرة.",
        ),
        bi(
          "Time is **O(b^m)** and space **O(bm)**. Chess, with b ≈ 35 and m ≈ 80, would need about **10^123** nodes, so full minimax is only the ideal to aim for.",
          "زمنها **O(b^m)** ومساحتها **O(bm)**. والشطرنج، حيث b ≈ 35 و m ≈ 80، يحتاج إلى نحو **10^123** عقدة، لذا فإن minimax الكاملة ليست إلا المثال الذي يُسعى إلى الاقتراب منه.",
        ),
      ],
    },
    {
      id: "suboptimal",
      pill: bi("A weaker MIN", "خصم أضعف"),
      heading: bi("Minimax is a guarantee, not a prediction", "minimax ضمانٌ لا تنبّؤ"),
      control: {
        label: bi("MIN plays", "MIN يلعب"),
        options: [
          { id: "optimal", label: bi("Optimally", "على النحو الأمثل") },
          { id: "careless", label: bi("Carelessly", "بإهمال") },
        ],
        initial: "optimal",
      },
      points: [bi("Minimax assumes MIN plays **optimally**. Against any other MIN, MAX scores **at least as much**.", "تفترض minimax أن MIN يلعب **على النحو الأمثل**؛ وأمام أي MIN آخر يحصل MAX على **القدر نفسه على الأقل**.")],
      pointsFor: {
        optimal: [bi("MIN answers a1 with **b1**, and MAX gets exactly **3**.", "يرد MIN على a1 بالنقلة **b1**، فيحصل MAX على **3** بالضبط.")],
        careless: [
          bi(
            "If MIN slips and plays **b2**, MAX gets 12. Against a known weak opponent a riskier move can sometimes win more, but only minimax guarantees 3.",
            "إذا أخطأ MIN ولعب **b2** حصل MAX على 12. وأمام خصم معروف بضعفه قد تكسب نقلةٌ أكثر مخاطرة قدرًا أكبر أحيانًا، لكن minimax وحدها تضمن 3.",
          ),
        ],
      },
    },
  ],
});

// ---------- 4.5 Alpha–beta pruning ----------
const traceStage = (id: string, en: string, ar: string) => [id, [bi(en, ar)]] as const;

export const alphaBeta = defineWalkthrough({
  id: "ai4-alpha-beta",
  title: bi("Alpha–beta pruning on the same tree", "التقليم ألفا-بيتا على الشجرة نفسها"),
  analogy: bi(
    "Choosing a restaurant by its worst dish: if the first dish you taste at a new place is already worse than your favourite's worst, you skip the rest of that menu.",
    "اختيار مطعم وفق أسوأ أطباقه: إذا كان أول طبق تتذوقه في مطعم جديد أسوأ من أسوأ أطباق مطعمك المفضل، فلا داعي لتذوّق بقية قائمة ذلك المطعم.",
  ),
  facts: {
    root: WORKED_FACTS.root,
    read: WORKED_FACTS.read,
    pruned: WORKED_FACTS.pruned,
    readWorst: WORKED_FACTS.readWorst,
    readBook: WORKED_FACTS.readBook,
    readBest: WORKED_FACTS.readBest,
  },
  panels: [
    {
      id: "bounds",
      pill: bi("α and β", "α و β"),
      heading: bi("Two bounds travel down the path", "حدّان ينتقلان على امتداد المسار"),
      points: [
        bi("Alpha–beta returns the **same minimax decision** but skips branches that **cannot** influence it.", "يُرجع التقليم ألفا-بيتا **قرار minimax نفسه**، لكنه يتخطى الفروع التي **لا يمكن** أن تؤثر فيه."),
        bi(
          "**α** is the best value found so far for MAX on the path (MAX gets **at least** α); **β** is the best so far for MIN (MAX gets **at most** β).",
          "**α** أفضل قيمة وُجدت حتى الآن لـ MAX على المسار (أي يحصل MAX على α **على الأقل**)؛ و**β** أفضل قيمة حتى الآن لـ MIN (أي يحصل MAX على β **على الأكثر**).",
        ),
        bi("A node is pruned once its value is provably **≤ α at a MIN node** or **≥ β at a MAX node**.", "وتُقلَّم العقدة بمجرد أن يثبت أن قيمتها **≤ α عند عقدة MIN** أو **≥ β عند عقدة MAX**."),
      ],
    },
    {
      id: "trace",
      pill: bi("Step through", "خطوة بخطوة"),
      heading: bi("Alpha–beta, one leaf at a time", "ألفا-بيتا ورقةً بعد ورقة"),
      control: {
        label: bi("Last leaf read", "آخر ورقة قُرئت"),
        options: ["b1", "b2", "b3", "c1", "d1", "d2", "d3"].map((id) => ({ id, label: bi(id, id) })),
        initial: "b1",
      },
      points: [
        bi(
          "Each node shows its value so far and the **α and β** it holds now; gold marks the nodes still being searched.",
          "تعرض كل عقدة قيمتها حتى الآن وقيمتي **α و β** اللتين تحملهما الآن؛ ويميّز اللون الذهبي العقدَ التي ما زال البحث فيها جاريًا.",
        ),
      ],
      pointsFor: Object.fromEntries([
        traceStage("b1", "B is a MIN node, so after its first leaf B is worth **at most 3**: β at B drops to 3.", "العقدة B عقدة MIN، لذا تصبح قيمتها بعد ورقتها الأولى **3 على الأكثر**: فتنخفض β عند B إلى 3."),
        traceStage("b2", "12 is worse for MIN than 3, so nothing changes: B is still **at most 3**.", "القيمة 12 أسوأ من 3 بالنسبة إلى MIN، فلا يتغير شيء: تبقى B **3 على الأكثر**."),
        traceStage("b3", "All of B's leaves are read, so **B = 3**. Back at the root MAX can now get **at least 3**: α = 3.", "قُرئت أوراق B كلها، فأصبحت **B = 3**. وعند العودة إلى الجذر صار MAX يستطيع الحصول على **3 على الأقل**: α = 3."),
        traceStage(
          "c1",
          "C is searched with α = 3. Its first leaf makes C **at most 2**, and 2 ≤ α: MAX will never choose C, so **c2 and c3 are pruned**.",
          "يُبحث في C مع α = 3. وورقتها الأولى تجعل C **2 على الأكثر**، و 2 ≤ α: فلن يختار MAX العقدة C أبدًا، لذا **تُقلَّم c2 و c3**.",
        ),
        traceStage("d1", "D is also searched with α = 3. After 14, D is at most 14, still above 3, so the search goes on.", "ويُبحث في D كذلك مع α = 3. وبعد 14 تصبح D على الأكثر 14، وهي ما زالت أعلى من 3، فيستمر البحث."),
        traceStage("d2", "After 5, D is at most 5: still above α = 3, so one more leaf must be read.", "وبعد 5 تصبح D على الأكثر 5: وما زالت أعلى من α = 3، فلا بد من قراءة ورقة أخرى."),
        traceStage(
          "d3",
          "After 2, **D = 2**. The root is max(3, 2, 2) = **3**, the minimax value, after reading only **7 of the 9** leaves.",
          "وبعد 2 تصبح **D = 2**. والجذر max(3, 2, 2) = **3**، وهي قيمة minimax نفسها، بعد قراءة **7 من 9** أوراق فقط.",
        ),
      ]),
    },
    {
      id: "compare",
      pill: bi("Minimax vs. alpha–beta", "minimax مقابل ألفا-بيتا"),
      heading: bi("Same answer, fewer leaves", "الإجابة نفسها بأوراق أقل"),
      control: {
        label: bi("Algorithm", "الخوارزمية"),
        options: [
          { id: "minimax", label: bi("Minimax", "خوارزمية minimax") },
          { id: "alphabeta", label: bi("Alpha–beta", "ألفا-بيتا") },
        ],
        initial: "minimax",
      },
      points: [bi("Both return **3** at the root and choose **a1**.", "تُرجع الخوارزميتان كلتاهما **3** عند الجذر وتختاران **a1**.")],
      pointsFor: {
        minimax: [bi("Minimax reads **all 9** leaves.", "تقرأ minimax **الأوراق التسع كلها**.")],
        alphabeta: [
          bi(
            "Alpha–beta reads **7**: **c2 and c3** are never examined, whatever their values are, because C is already worse than B for MAX.",
            "أما ألفا-بيتا فتقرأ **7** أوراق فقط: إذ لا تُفحص **c2 و c3** أبدًا مهما كانت قيمتاهما، لأن C صارت أسوأ من B بالنسبة إلى MAX.",
          ),
        ],
      },
    },
    {
      id: "ordering",
      pill: bi("Move ordering", "ترتيب النقلات"),
      heading: bi("The order of the moves decides how much is pruned", "ترتيب النقلات يحدد مقدار التقليم"),
      control: {
        label: bi("Examine", "افحص"),
        options: [
          { id: "worst", label: bi("Worst moves first", "الأسوأ أولًا") },
          { id: "book", label: bi("The book's order", "ترتيب الكتاب") },
          { id: "best", label: bi("Best moves first", "الأفضل أولًا") },
        ],
        initial: "book",
      },
      points: [bi("The root is worth 3 in every order; only the **number of leaves read** changes.", "قيمة الجذر 3 في كل ترتيب، ولا يتغير إلا **عدد الأوراق المقروءة**.")],
      pointsFor: {
        worst: [
          bi(
            "Worst moves first (MAX's weakest child first, the highest leaf first under each MIN): **9 of 9** leaves are read and nothing is pruned.",
            "الأسوأ أولًا (أضعف أبناء MAX أولًا، وأعلى ورقة أولًا تحت كل عقدة MIN): تُقرأ **9 من 9** أوراق، ولا يُقلَّم شيء.",
          ),
        ],
        book: [bi("The book's order prunes c2 and c3: **7 of 9** leaves are read.", "يقلّم ترتيب الكتاب الورقتين c2 و c3: فتُقرأ **7 من 9** أوراق.")],
        best: [
          bi(
            "Best moves first: only **5 of 9** leaves are read, exactly 3 + 3 − 1, the best case for b = 3 and m = 2. Programs approach it with **killer moves**, captures first and **iterative deepening**.",
            "الأفضل أولًا: لا تُقرأ إلا **5 من 9** أوراق، أي 3 + 3 − 1 بالضبط، وهي أفضل حالة عندما b = 3 و m = 2. وتقترب البرامج من ذلك باستخدام **النقلات القاتلة (killer moves)**، وتقديم نقلات الأسر (captures)، و**التعميق التكراري (iterative deepening)**.",
          ),
        ],
      },
    },
    {
      id: "growth",
      pill: bi("b^m vs. b^(m/2)", "b^m مقابل b^(m/2)"),
      heading: bi("Perfect ordering halves the exponent", "الترتيب المثالي ينصّف الأُس"),
      points: [
        bi(
          "With perfect ordering alpha–beta examines about **b^(m/2)** nodes instead of **b^m**: the effective branching factor falls from b to **√b**, about 6 instead of 35 in chess.",
          "مع الترتيب المثالي تفحص ألفا-بيتا نحو **b^(m/2)** عقدة بدلًا من **b^m**: فينخفض معامل التفرّع الفعلي (effective branching factor) من b إلى **√b**، أي نحو 6 بدلًا من 35 في الشطرنج.",
        ),
        bi("So in the same time it can search about **twice as deep**. With a random order the count is roughly **b^(3m/4)**.", "لذا تستطيع في الوقت نفسه أن تبحث إلى **ضعف العمق** تقريبًا. أما مع ترتيب عشوائي فيبلغ العدد نحو **b^(3m/4)**."),
      ],
    },
  ],
});

// ---------- 4.5.1–4.5.3 Heuristic alpha–beta, forward pruning, chess ----------
export const heuristic = defineWalkthrough({
  id: "ai4-heuristic",
  title: bi("Cutting the search off", "قطع البحث"),
  analogy: bi(
    "A chess player who can only think a few moves ahead: at that point they stop and judge the position by what is on the board, instead of playing it out to the end.",
    "لاعب شطرنج لا يستطيع التفكير إلا بضع نقلات إلى الأمام: يتوقف عندها ويحكم على الوضعية بما يراه على الرقعة، بدلًا من أن يلعبها حتى النهاية.",
  ),
  facts: { eval: EVAL_VALUE, static: HORIZON.atCutoff, quiet: HORIZON.afterRecapture, plyMinimax: CHESS_PLY.minimax, plyAlphaBeta: CHESS_PLY.alphaBeta },
  panels: [
    {
      id: "cutoff",
      pill: bi("Depth cutoff", "القطع عند عمق"),
      heading: bi("Stop at depth d and evaluate", "توقّف عند العمق d وقيّم"),
      points: [
        bi(
          "**Heuristic alpha–beta** stops at a depth limit d (the test **IS-CUTOFF**) and calls a fast **evaluation function EVAL(s, p)** where UTILITY would be.",
          "يتوقف **التقليم ألفا-بيتا الاستدلالي (heuristic alpha–beta)** عند حدٍّ للعمق d (الاختبار **IS-CUTOFF**)، ويستدعي **دالة تقييم (evaluation function)** سريعة **EVAL(s, p)** في الموضع الذي كانت ستُستدعى فيه UTILITY.",
        ),
        bi(
          "Values are backed up exactly as before (**H-MINIMAX**): the root is still 3, but now it is an **estimate**, not a proven result.",
          "وتُرفع القيم تمامًا كما سبق (**H-MINIMAX**): فيبقى الجذر 3، لكنه الآن **تقدير** لا نتيجة مُثبتة.",
        ),
      ],
    },
    {
      id: "eval",
      pill: bi("Evaluation function", "دالة التقييم"),
      heading: bi("A weighted sum of features", "مجموع موزون للسمات"),
      points: [
        bi(
          "Most evaluation functions compute **features** fi(s), such as material, mobility and king safety in chess, and combine them as **EVAL(s) = Σ wi·fi(s)**.",
          "تحسب معظم دوال التقييم **سمات (features)** fi(s)، مثل العتاد (material) وحرية الحركة (mobility) وأمان الملك في الشطرنج، وتجمعها في **EVAL(s) = Σ wi·fi(s)**.",
        ),
        bi(
          "EVAL must be **fast** and strongly **correlated** with the chances of winning; the weights can be hand-tuned or **learned** from self-play.",
          "ويجب أن تكون EVAL **سريعة** وشديدة **الارتباط (correlated)** بفرص الفوز؛ ويمكن ضبط الأوزان يدويًا أو **تعلّمها** من اللعب الذاتي (self-play).",
        ),
      ],
    },
    {
      id: "quiescence",
      pill: bi("Horizon effect", "تأثير الأفق"),
      heading: bi("Don't stop in the middle of an exchange", "لا تتوقف في منتصف تبادل للقطع"),
      control: {
        label: bi("Search", "البحث"),
        options: [
          { id: "fixed", label: bi("Fixed depth", "عمق ثابت") },
          { id: "quiescence", label: bi("Quiescence search", "بحث السكون") },
        ],
        initial: "fixed",
      },
      points: [bi("A fixed cutoff can fall in the middle of a **tactical** sequence, where the position is about to change sharply.", "قد يقع القطع الثابت في منتصف تسلسل **تكتيكي (tactical)**، حيث توشك الوضعية أن تتغير تغيرًا حادًا.")],
      pointsFor: {
        fixed: [
          bi(
            "At the cutoff MAX's queen has just taken a knight, so EVAL says **+3**. But MIN takes the queen on the very next move: this blindness past the cutoff is the **horizon effect**.",
            "عند نقطة القطع يكون وزير MAX قد أسر حصانًا للتو، فتقول EVAL **+3**. لكن MIN يأسر الوزير في النقلة التالية مباشرة، وهذا العمى عمّا وراء نقطة القطع هو **تأثير الأفق (horizon effect)**.",
          ),
        ],
        quiescence: [
          bi(
            "**Quiescence search** keeps searching positions with pending captures or checks until they are quiet, and finds the true value **−6**.",
            "أما **بحث السكون (quiescence search)** فيواصل البحث في الوضعيات التي فيها عمليات أسر أو كش معلّقة حتى تهدأ، فيجد القيمة الحقيقية **−6**.",
          ),
        ],
      },
    },
    {
      id: "deepening",
      pill: bi("Iterative deepening", "التعميق التكراري"),
      heading: bi("Search deeper until time runs out", "ابحث أعمق حتى ينفد الوقت"),
      points: [
        bi(
          "With **iterative deepening**, search to depth 1, 2, 3, … and, when time runs out, play the best move of the **deepest completed** search.",
          "مع **التعميق التكراري (iterative deepening)** ابحث إلى العمق 1 ثم 2 ثم 3 وهكذا، وعندما ينفد الوقت العب أفضل نقلة من **أعمق بحث اكتمل**.",
        ),
        bi(
          "Each iteration's best moves and its **transposition table** of evaluated positions give the next iteration a better **move ordering**, so it prunes more.",
          "وتمنح أفضلُ نقلات كل تكرار و**جدولُ التبديلات (transposition table)** الذي يحفظ الوضعيات المقيَّمة التكرارَ التالي **ترتيبَ نقلات** أفضل، فيقلّم أكثر.",
        ),
      ],
    },
    {
      id: "forward",
      pill: bi("Forward pruning", "التقليم الأمامي"),
      heading: bi("Drop moves that only seem poor", "استبعد النقلات التي تبدو ضعيفة فقط"),
      control: {
        label: bi("Technique", "الأسلوب"),
        options: [
          { id: "beam", label: bi("Beam search", "بحث الحزمة") },
          { id: "probcut", label: bi("PROBCUT", "PROBCUT") },
          { id: "lmr", label: bi("Late-move reduction", "تقليص النقلات المتأخرة") },
        ],
        initial: "beam",
      },
      points: [
        bi(
          "**Forward pruning** drops moves that **seem** poor before proving them irrelevant (Shannon's **Type B** strategy). It saves time but risks **missing a tactic**.",
          "يستبعد **التقليم الأمامي (forward pruning)** النقلات التي **تبدو** ضعيفة قبل إثبات أنها غير مؤثرة (استراتيجية **النوع B** عند شانون (Shannon)). وهو يوفر الوقت لكنه قد **يُفوِّت تكتيكًا**.",
        ),
      ],
      pointsFor: {
        beam: [bi("**Beam search** keeps only the **top n** moves at each ply (here n = 2) and never looks at the others.", "يحتفظ **بحث الحزمة (beam search)** بأفضل **n** نقلات فقط عند كل مستوى (هنا n = 2)، ولا ينظر إلى غيرها أبدًا.")],
        probcut: [
          bi(
            "**PROBCUT** runs a shallow search and, using statistics learned from earlier games, prunes moves whose value is **probably** outside the (α, β) window.",
            "يُجري **PROBCUT** بحثًا ضحلًا، ويستعين بإحصاءات متعلَّمة من مباريات سابقة، فيقلّم النقلات التي تقع قيمتها **على الأرجح** خارج النافذة (α, β).",
          ),
        ],
        lmr: [
          bi(
            "**Late-move reduction** searches the moves that come late in the ordering to a **reduced depth**, and searches one again to full depth only if it looks promising.",
            "يبحث **تقليص النقلات المتأخرة (late-move reduction)** في النقلات المتأخرة في الترتيب إلى **عمق مخفَّض**، ولا يعيد البحث في إحداها إلى العمق الكامل إلا إذا بدت واعدة.",
          ),
        ],
      },
    },
    {
      id: "chess",
      pill: bi("Chess in practice", "الشطرنج عمليًا"),
      heading: bi("How deep a chess program can see", "إلى أي عمق يرى برنامج الشطرنج"),
      points: [
        bi(
          "At about **a million nodes per second**, one minute buys 60 million nodes: enough for full minimax to reach only **5 ply** (35^5 ≈ 52.5 million), too shallow to play well.",
          "بمعدل **مليون عقدة في الثانية** تقريبًا، تتيح دقيقة واحدة 60 مليون عقدة: وهذا لا يكفي minimax الكاملة إلا لبلوغ **5 مستويات (ply)** (35^5 ≈ 52.5 مليونًا)، وهو عمق أضحل من أن يُلعب به جيدًا.",
        ),
        bi(
          "Alpha–beta with good ordering doubles that to about **10 ply**; transposition tables, quiescence and iterative deepening push past **14**, and engines such as **Stockfish** reach **30+**.",
          "ويضاعف ألفا-بيتا مع ترتيب جيد ذلك إلى نحو **10 مستويات**؛ وتدفعه جداول التبديلات وبحث السكون والتعميق التكراري إلى ما بعد **14**، وتبلغ محركات مثل **Stockfish** أكثر من **30**.",
        ),
      ],
    },
  ],
});

/** Every walkthrough in this lecture, registered in lib/walkthroughs/index.ts. */
export const all = [intro, stances, games, minimax, alphaBeta, heuristic] as const;

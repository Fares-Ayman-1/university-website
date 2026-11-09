import { bi } from "@/components/widgets/types";
import { defineWalkthrough } from "@/lib/widgets/walkthrough";
import {
  ENVIRONMENTS,
  HALF_DONE,
  HORIZON,
  K,
  PEAS_NAMES,
  PLANS,
  REFLEX_RUN,
  STATE_RUN,
  STEPS,
  THRESHOLD,
  componentOf,
  hardCount,
  reflexVacuumAgent,
  score,
  stateAgentStep,
  tableSize,
  utility,
} from "@/lib/widgets/ai-lecture-01";

/*
 * Artificial Intelligence · Lecture 1
 * (content/subjects/artificial-intelligence/lectures/01-introduction-intelligent-agents.mdx).
 * One walkthrough per heading; the scenes are in
 * components/widgets/walkthrough/scenes/artificial-intelligence/lecture-01/. Every number in
 * the text is computed in lib/widgets/ai-lecture-01.ts, and the page's `expect` checks the `facts`.
 */

// ---------- What is AI? ----------
export const whatIsAi = defineWalkthrough({
  id: "ai1-what-is-ai",
  title: bi("Four ways to define AI", "أربع طرق لتعريف الذكاء الاصطناعي"),
  analogy: bi(
    "Judging a chef. You can study how they think about a dish or only taste the result, and you can compare them with a famous human chef or with the perfect recipe. AI definitions make the same two choices.",
    "تقييم طاهٍ: يمكنك أن تدرس طريقة تفكيره في الطبق أو أن تتذوق النتيجة فقط، ويمكنك أن تقارنه بطاهٍ بشري مشهور أو بالوصفة المثالية. وتعريفات الذكاء الاصطناعي تقوم على الاختيارين نفسيهما.",
  ),
  panels: [
    {
      id: "axes",
      pill: bi("Two axes", "محوران"),
      heading: bi("Thinking or acting, human or rational", "التفكير أم التصرف، البشري أم العقلاني"),
      control: {
        label: bi("Approach", "المنهج"),
        options: [
          { id: "think-human", label: bi("Thinking humanly", "التفكير بشكل بشري") },
          { id: "think-rational", label: bi("Thinking rationally", "التفكير بعقلانية") },
          { id: "act-human", label: bi("Acting humanly", "التصرف بشكل بشري") },
          { id: "act-rational", label: bi("Acting rationally", "التصرف بعقلانية") },
        ],
        initial: "think-human",
      },
      points: [
        bi(
          "One axis asks whether we judge **thinking** or **behaviour**; the other asks whether success is measured against **humans** or against ideal **rationality**.",
          "يسأل أحد المحورين هل نحكم على **التفكير** أم على **السلوك**، ويسأل الآخر هل يُقاس النجاح بالمقارنة مع **البشر** أم مع **العقلانية (rationality)** المثالية.",
        ),
      ],
      pointsFor: {
        "think-human": [
          bi(
            "**Cognitive modelling**: the system's internal reasoning should mirror how people think, which needs theories of the mind from psychology and neuroscience.",
            "**النمذجة المعرفية (cognitive modelling)**: يجب أن يحاكي الاستدلال الداخلي للنظام طريقة تفكير البشر، وهذا يحتاج إلى نظريات عن العقل من علم النفس وعلم الأعصاب.",
          ),
        ],
        "think-rational": [
          bi(
            "**Laws of thought**: reason with correct logic from premises to valid conclusions. The catch is that not all knowledge is certain or easy to formalise.",
            "**قوانين التفكير (laws of thought)**: الاستدلال بمنطق صحيح من المقدّمات إلى استنتاجات سليمة، والصعوبة أن المعرفة ليست كلها يقينية أو سهلة الصياغة الرسمية.",
          ),
        ],
        "act-human": [
          bi(
            "**Turing test**: behave so much like a person that an interrogator cannot tell the machine apart.",
            "**اختبار تورنغ (Turing test)**: التصرف بشكل يشبه الإنسان إلى حدّ أن المُحاوِر لا يستطيع تمييز الآلة.",
          ),
        ],
        "act-rational": [
          bi(
            "**Rational agent**: do the right thing, the action expected to achieve the best outcome given what the system knows. This course takes this view.",
            "**الوكيل العقلاني (rational agent)**: فعل الشيء الصحيح، أي الفعل الذي يُتوقَّع أن يحقق أفضل نتيجة بناءً على ما يعرفه النظام، وهذا هو منظور هذا المقرر.",
          ),
        ],
      },
    },
    {
      id: "turing",
      pill: bi("Acting humanly", "التصرف بشكل بشري"),
      heading: bi("The Turing test: who wrote the answer?", "اختبار تورنغ: من كتب الإجابة؟"),
      control: {
        label: bi("Behind the wall", "خلف الجدار"),
        options: [
          { id: "person", label: bi("A person", "إنسان") },
          { id: "machine", label: bi("A machine", "آلة") },
        ],
        initial: "person",
      },
      points: [
        bi(
          "An **interrogator** types questions and reads only the written answers, without seeing who wrote them.",
          "يكتب **المُحاوِر (interrogator)** أسئلة ولا يقرأ إلا الإجابات المكتوبة، دون أن يرى من كتبها.",
        ),
        bi(
          "Passing needs **language**, **knowledge**, **reasoning** and **learning**.",
          "ويتطلب النجاح في الاختبار **اللغة** و**المعرفة** و**الاستدلال (reasoning)** و**التعلّم**.",
        ),
      ],
      pointsFor: {
        person: [bi("A person answers. The interrogator reads a natural, sensible reply.", "يجيب إنسان، فيقرأ المُحاوِر ردًّا طبيعيًا ومعقولًا.")],
        machine: [
          bi(
            "A machine answers just as naturally. If the interrogator still **cannot tell** which one it was, the machine passes.",
            "تجيب آلة بالطريقة الطبيعية نفسها، فإذا ظل المُحاوِر **عاجزًا عن التمييز**، نجحت الآلة في الاختبار.",
          ),
        ],
      },
    },
    {
      id: "laws",
      pill: bi("Thinking rationally", "التفكير بعقلانية"),
      heading: bi("Laws of thought: premises in, conclusion out", "قوانين التفكير: مقدّمات تدخل واستنتاج يخرج"),
      control: {
        label: bi("The knowledge is", "المعرفة"),
        options: [
          { id: "certain", label: bi("Certain", "يقينية") },
          { id: "uncertain", label: bi("Uncertain", "غير يقينية") },
        ],
        initial: "certain",
      },
      points: [
        bi(
          "Logic derives **valid conclusions** from premises, so a conclusion is only as reliable as the premises behind it.",
          "يشتق المنطق **استنتاجات سليمة (valid conclusions)** من المقدّمات، فيكون الاستنتاج موثوقًا بقدر موثوقية المقدّمات التي يستند إليها.",
        ),
      ],
      pointsFor: {
        certain: [
          bi(
            "\"If it rains, the street gets wet\" and \"it is raining\" give \"the street is wet\" for sure.",
            "من «إذا أمطرت ابتلّ الشارع» و«إنها تمطر» يلزم حتمًا أن «الشارع مبتلّ».",
          ),
        ],
        uncertain: [
          bi(
            "\"Clouds **often** bring rain\" is not a rule logic can use, so it cannot decide whether to take an umbrella.",
            "أما «الغيوم **كثيرًا** ما تجلب المطر» فليست قاعدة يستطيع المنطق استخدامها، فلا يستطيع أن يقرر هل تأخذ مظلة أم لا.",
          ),
        ],
      },
    },
    {
      id: "why-rational",
      pill: bi("Why acting rationally", "لماذا التصرف بعقلانية"),
      heading: bi("Correct inference is only one way to act well", "الاستدلال الصحيح ليس إلا طريقة واحدة للتصرف الجيد"),
      control: {
        label: bi("A hand touches a hot stove", "يد تلمس موقدًا ساخنًا"),
        options: [
          { id: "deliberate", label: bi("Deliberate", "التروّي") },
          { id: "reflex", label: bi("Reflex", "رد فعل انعكاسي") },
        ],
        initial: "deliberate",
      },
      points: [
        bi(
          "**Acting rationally** is more general than the laws of thought, and easier to define precisely than acting like a human.",
          "**التصرف بعقلانية** أعمّ من قوانين التفكير، وأسهل في التعريف الدقيق من التصرف مثل الإنسان.",
        ),
      ],
      pointsFor: {
        deliberate: [
          bi(
            "Reasoning step by step to \"pull the hand away\" is correct, but slow: the hand is burned before the conclusion arrives.",
            "الاستدلال خطوةً خطوة حتى «اسحب يدك» صحيح، لكنه بطيء: تحترق اليد قبل أن يصل الاستنتاج.",
          ),
        ],
        reflex: [
          bi(
            "A **reflex** acts at once, with no inference at all, and gets the better outcome: here it is the rational choice.",
            "أما **رد الفعل الانعكاسي (reflex)** فيتصرف فورًا دون أي استدلال، ويحقق نتيجة أفضل، فهو هنا الخيار العقلاني.",
          ),
        ],
      },
    },
  ],
});

// ---------- Agents and environments ----------
const run = REFLEX_RUN;
export const agents = defineWalkthrough({
  id: "ai1-agents",
  title: bi("An agent in its environment", "الوكيل في بيئته"),
  analogy: bi(
    "A driver. Eyes and ears take in the road (sensors), hands and feet act on the car (actuators), and every choice can depend on everything seen since the trip began (the percept sequence).",
    "سائق السيارة: تلتقط عيناه وأذناه الطريق (المستشعرات)، وتؤثر يداه وقدماه في السيارة (المشغِّلات)، ويمكن أن يعتمد كل قرار يتخذه على كل ما رآه منذ بداية الرحلة (تسلسل الإدراكات).",
  ),
  facts: {
    "a-dirty": reflexVacuumAgent(["A", "Dirty"]),
    "b-clean": reflexVacuumAgent(["B", "Clean"]),
  },
  panels: [
    {
      id: "loop",
      pill: bi("Sensors and actuators", "المستشعرات والمشغِّلات"),
      heading: bi("Percepts come in, actions go out", "الإدراكات تدخل والأفعال تخرج"),
      control: {
        label: bi("Agent", "الوكيل"),
        options: [
          { id: "human", label: bi("Human", "الإنسان") },
          { id: "robot", label: bi("Robot", "الروبوت") },
          { id: "softbot", label: bi("Software bot", "برنامج آلي") },
          { id: "thermostat", label: bi("Thermostat", "منظِّم الحرارة") },
        ],
        initial: "human",
      },
      points: [
        bi(
          "An **agent** perceives its environment through **sensors** and acts on it through **actuators**.",
          "**الوكيل (agent)** يُدرك بيئته من خلال **المستشعرات (sensors)** ويؤثّر فيها من خلال **المشغِّلات (actuators)**.",
        ),
      ],
      pointsFor: {
        human: [bi("A person senses with eyes, ears and skin, and acts with hands, legs and voice.", "يستشعر الإنسان بالعينين والأذنين والجلد، ويتصرف باليدين والساقين والصوت.")],
        robot: [bi("A robot senses with cameras and bump sensors, and acts with motors and wheels.", "يستشعر الروبوت بالكاميرات ومستشعرات الاصطدام، ويتصرف بالمحركات والعجلات.")],
        softbot: [
          bi(
            "A **software bot** senses keystrokes, files and network packets, and acts by showing output, writing files and sending packets.",
            "يستشعر **البرنامج الآلي (software bot)** ضغطات المفاتيح والملفات وحزم الشبكة، ويتصرف بعرض المخرجات وكتابة الملفات وإرسال الحزم.",
          ),
        ],
        thermostat: [
          bi(
            "Even a **thermostat** is an agent: its sensor reads the temperature, its actuator switches the heater on or off.",
            "حتى **منظِّم الحرارة (thermostat)** وكيل: مستشعره يقرأ درجة الحرارة، ومشغِّله يشغّل المدفأة أو يطفئها.",
          ),
        ],
      },
    },
    {
      id: "sequence",
      pill: bi("Percept sequence", "تسلسل الإدراكات"),
      heading: bi("The agent function maps the whole history to an action", "دالة الوكيل تربط التاريخ كاملًا بفعل"),
      points: [
        bi(
          "At each moment the agent receives one **percept**; everything perceived so far is its **percept sequence**.",
          "في كل لحظة يتلقى الوكيل **إدراكًا (percept)** واحدًا، وكل ما أدركه حتى الآن هو **تسلسل الإدراكات (percept sequence)**.",
        ),
        bi(
          "The **agent function** f : P* → A picks an action for every possible percept sequence, not just for the latest percept.",
          "تختار **دالة الوكيل (agent function)** f : P* → A فعلًا لكل تسلسل إدراكات ممكن، لا لآخر إدراك فقط.",
        ),
      ],
    },
    {
      id: "vacuum",
      pill: bi("Vacuum world", "عالم المكنسة"),
      heading: bi("Two squares, one robot", "مربعان وروبوت واحد"),
      points: [
        bi(
          "A **percept** is the robot's location and whether that square is dirty, for example [A, Dirty].",
          "**الإدراك (percept)** هو موقع الروبوت وهل ذلك المربع متسخ أم لا، مثل [A, Dirty].",
        ),
        bi("It has four **actions**: Left, Right, Suck and NoOp (do nothing).", "وله أربعة **أفعال (actions)**: Left و Right و Suck و NoOp (لا شيء)."),
      ],
    },
    {
      id: "run",
      pill: bi("Step by step", "خطوة بخطوة"),
      heading: bi("The reflex agent at work", "الوكيل الانعكاسي أثناء العمل"),
      points: [
        bi(
          `Each step the robot **perceives** its square, the program picks an **action**, and the world changes. The table logs the percept sequence for ${STEPS} steps.`,
          `في كل خطوة **يُدرك** الروبوت مربعه، ويختار البرنامج **فعلًا**، فيتغير العالم. ويسجّل الجدول تسلسل الإدراكات خلال ${STEPS} خطوات.`,
        ),
        bi(
          `${run[0].action}, ${run[1].action}, ${run[2].action}: after three steps both squares are clean, yet it keeps shuttling **${run[3].action}** and **${run[4].action}**.`,
          `${run[0].action} ثم ${run[1].action} ثم ${run[2].action}: بعد ثلاث خطوات يصبح المربعان نظيفين، ومع ذلك يستمر في التنقل بين **${run[3].action}** و**${run[4].action}**.`,
        ),
      ],
    },
    {
      id: "table-program",
      pill: bi("Table or program", "جدول أم برنامج"),
      heading: bi("The agent function is a table; the agent program is code", "دالة الوكيل جدول، وبرنامج الوكيل شيفرة"),
      control: {
        label: bi("Describe the agent as", "صِف الوكيل بوصفه"),
        options: [
          { id: "table", label: bi("A table", "جدولًا") },
          { id: "program", label: bi("A program", "برنامجًا") },
        ],
        initial: "table",
      },
      points: [
        bi(
          "The **agent function** is an abstract description: one table entry for every percept sequence.",
          "**دالة الوكيل (agent function)** وصف مجرد: مُدخل واحد في الجدول لكل تسلسل إدراكات.",
        ),
      ],
      pointsFor: {
        table: [
          bi(
            `With 4 possible percepts there are ${tableSize(3)} sequences of length 3 or less, and ${tableSize(10).toLocaleString("en-US")} up to length 10, so the table is never stored.`,
            `مع 4 إدراكات ممكنة هناك ${tableSize(3)} تسلسلًا طولها 3 أو أقل، و${tableSize(10).toLocaleString("en-US")} تسلسلًا حتى الطول 10، لذلك لا يُخزَّن الجدول أبدًا.`,
          ),
        ],
        program: [
          bi(
            "The **agent program** is short code that implements f and runs on the agent's **architecture**: agent = architecture + program.",
            "**برنامج الوكيل (agent program)** شيفرة قصيرة تنفّذ f وتعمل على **بنية (architecture)** الوكيل: الوكيل = البنية + البرنامج.",
          ),
          bi(
            "Computation is limited, so the practical goal is the best program for the machine resources available.",
            "قدرة الحوسبة محدودة، لذا فالهدف العملي هو أفضل برنامج في حدود موارد الآلة المتاحة.",
          ),
        ],
      },
    },
  ],
});

// ---------- Rationality ----------
const measureText = (m: "cleaned" | "clean-moves" | "penalty") => [score(REFLEX_RUN, m), score(STATE_RUN, m)] as const;
const [cleanedReflex, cleanedState] = measureText("cleaned");
const [movesReflex, movesState] = measureText("clean-moves");
const [penaltyReflex, penaltyState] = measureText("penalty");

export const rationality = defineWalkthrough({
  id: "ai1-rationality",
  title: bi("What makes an agent rational", "ما الذي يجعل الوكيل عقلانيًا"),
  analogy: bi(
    "A good doctor. They choose the treatment that is best given the tests so far. If a hidden condition turns up later, the choice was still right, and the next step is to order more tests.",
    "الطبيب الجيد: يختار العلاج الأفضل بناءً على نتائج الفحوص حتى الآن، وإذا ظهرت لاحقًا حالة خفية فقد كان اختياره صحيحًا مع ذلك، والخطوة التالية أن يطلب مزيدًا من الفحوص.",
  ),
  panels: [
    {
      id: "measure",
      pill: bi("Performance measure", "مقياس الأداء"),
      heading: bi("Same two agents, three measures", "الوكيلان أنفسهما وثلاثة مقاييس"),
      control: {
        label: bi("Measure", "المقياس"),
        options: [
          { id: "cleaned", label: bi("Squares cleaned", "المربعات المنظَّفة") },
          { id: "clean-moves", label: bi("Clean squares − moves", "المربعات النظيفة − الحركات") },
          { id: "penalty", label: bi("Penalty if dirty > k", "عقوبة إذا زاد المتسخ عن k") },
        ],
        initial: "cleaned",
      },
      points: [
        bi(
          `A **performance measure** scores the sequence of environment states. Here both agents start in A with both squares dirty and run for ${STEPS} steps.`,
          `يقيّم **مقياس الأداء (performance measure)** تسلسل حالات البيئة. وهنا يبدأ الوكيلان في A والمربعان متسخان، ويعملان ${STEPS} خطوات.`,
        ),
      ],
      pointsFor: {
        cleaned: [
          bi(
            `One point per square cleaned within T = ${STEPS}: the reflex agent scores ${cleanedReflex} and the agent with state ${cleanedState}, so this measure cannot tell them apart.`,
            `نقطة لكل مربع يُنظَّف خلال T = ${STEPS}: يحصل الوكيل الانعكاسي على ${cleanedReflex} والوكيل ذو الحالة على ${cleanedState}، فلا يميّز هذا المقياس بينهما.`,
          ),
        ],
        "clean-moves": [
          bi(
            `One point per clean square per step, minus one per move: the reflex agent scores ${movesReflex}, the agent with state ${movesState}, because its **NoOp** saves moves.`,
            `نقطة لكل مربع نظيف في كل خطوة، مع خصم نقطة لكل حركة: يحصل الوكيل الانعكاسي على ${movesReflex} والوكيل ذو الحالة على ${movesState}، لأن **NoOp** يوفّر الحركات.`,
          ),
        ],
        penalty: [
          bi(
            `−1 for each step with more than k = ${K} dirty squares: both score ${penaltyReflex === penaltyState ? penaltyReflex : `${penaltyReflex} and ${penaltyState}`}, since they clean at the same speed.`,
            `خصم نقطة عن كل خطوة يزيد فيها عدد المربعات المتسخة عن k = ${K}: يحصل كلاهما على ${penaltyReflex === penaltyState ? penaltyReflex : `${penaltyReflex} و${penaltyState}`}، لأنهما ينظّفان بالسرعة نفسها.`,
          ),
        ],
      },
    },
    {
      id: "omniscient",
      pill: bi("Not omniscient", "ليس كلي العلم"),
      heading: bi("Rational means best for what it knows", "العقلاني هو الأفضل بحسب ما يعرفه"),
      control: {
        label: bi("Agent", "الوكيل"),
        options: [
          { id: "rational", label: bi("Rational", "عقلاني") },
          { id: "omniscient", label: bi("Omniscient", "كلي العلم") },
        ],
        initial: "rational",
      },
      points: [
        bi("The robot in A perceives only [A, Clean]. Whether B is dirty is not in its percept sequence.", "لا يُدرك الروبوت في A إلا [A, Clean]، وحالة B ليست ضمن تسلسل إدراكاته."),
      ],
      pointsFor: {
        rational: [
          bi(
            "B might be dirty, so going to look has the best **expected** score. B turns out clean and the move is wasted, yet the choice was rational.",
            "قد يكون B متسخًا، لذلك فالذهاب للتحقق هو الفعل صاحب أفضل نتيجة **متوقَّعة**. ويتضح أن B نظيف وأن الحركة ضاعت، ومع ذلك كان الاختيار عقلانيًا.",
          ),
        ],
        omniscient: [
          bi(
            "An **omniscient** agent knows the actual outcome, so it stays put. It maximises **actual** performance, which is impossible in reality.",
            "أما الوكيل **كلي العلم (omniscient)** فيعرف النتيجة الفعلية، فيبقى في مكانه. إنه يعظّم الأداء **الفعلي**، وهذا مستحيل في الواقع.",
          ),
        ],
      },
    },
    {
      id: "outcome",
      pill: bi("Not clairvoyant", "ليس عالمًا بالغيب"),
      heading: bi("A rational choice can still fail", "قد يفشل الاختيار العقلاني"),
      control: {
        label: bi("What happens next", "ما يحدث بعد ذلك"),
        options: [
          { id: "expected", label: bi("As expected", "كما هو متوقَّع") },
          { id: "surprise", label: bi("A surprise", "مفاجأة") },
        ],
        initial: "expected",
      },
      points: [
        bi(
          "The robot perceives [A, Dirty] and chooses **Suck**, the best action given what it knows.",
          "يُدرك الروبوت [A, Dirty] فيختار **Suck**، وهو أفضل فعل بناءً على ما يعرفه.",
        ),
      ],
      pointsFor: {
        expected: [bi("A ends up clean: the choice was rational **and** successful.", "يصبح A نظيفًا: كان الاختيار عقلانيًا **وناجحًا**.")],
        surprise: [
          bi(
            "Fresh dirt falls on A right after: action outcomes may not be as expected. The choice was still rational, just not **successful**.",
            "تسقط أوساخ جديدة على A مباشرةً بعد ذلك، فنتائج الأفعال قد لا تأتي كما هو متوقَّع. ومع ذلك ظل الاختيار عقلانيًا، لكنه لم يكن **ناجحًا**.",
          ),
        ],
      },
    },
    {
      id: "what-you-want",
      pill: bi("Measure what you want", "قِس ما تريده"),
      heading: bi("A rational agent gives you exactly what you score", "الوكيل العقلاني يعطيك بالضبط ما تكافئه عليه"),
      control: {
        label: bi("Reward", "المكافأة"),
        options: [
          { id: "dirt", label: bi("Dirt sucked up", "الأوساخ المشفوطة") },
          { id: "floor", label: bi("A clean floor", "أرضية نظيفة") },
        ],
        initial: "dirt",
      },
      points: [
        bi(
          "Design the measure around **what you want in the environment**, not around how you think the agent should behave.",
          "صمِّم المقياس حول **ما تريده في البيئة**، لا حول الطريقة التي تظن أن على الوكيل أن يتصرف بها.",
        ),
      ],
      pointsFor: {
        dirt: [
          bi(
            "Paying for each suck rewards a robot that dumps the dirt back out and sucks it up again: the score climbs, the floor never stays clean.",
            "الدفع مقابل كل عملية شفط يكافئ روبوتًا يفرغ الأوساخ على الأرض ثم يشفطها من جديد: ترتفع النتيجة، ولا تبقى الأرضية نظيفة أبدًا.",
          ),
        ],
        floor: [
          bi(
            "Paying one point per clean square per step rewards the result itself, so the best plan is to clean and keep it clean.",
            "الدفع بنقطة لكل مربع نظيف في كل خطوة يكافئ النتيجة نفسها، فتكون أفضل خطة أن ينظّف ويُبقي المكان نظيفًا.",
          ),
        ],
      },
    },
    {
      id: "autonomy",
      pill: bi("Explore and learn", "الاستكشاف والتعلّم"),
      heading: bi("Rationality pushes the agent to gather information", "العقلانية تدفع الوكيل إلى جمع المعلومات"),
      control: {
        label: bi("The agent relies on", "يعتمد الوكيل على"),
        options: [
          { id: "prior", label: bi("Built-in knowledge", "المعرفة المدمجة") },
          { id: "own", label: bi("Its own percepts", "إدراكاته الخاصة") },
        ],
        initial: "prior",
      },
      points: [
        bi(
          "Percepts are incomplete, so a rational agent **gathers information** (explores) and **learns** from experience.",
          "الإدراكات ناقصة، لذلك **يجمع** الوكيل العقلاني **المعلومات (information gathering)** (أي يستكشف) و**يتعلّم** من التجربة.",
        ),
      ],
      pointsFor: {
        prior: [
          bi(
            "The designer built in \"dirt only appears in A\". The rule is wrong, but the robot never checks B, so it never finds out.",
            "أدمج المصمم القاعدة «الأوساخ لا تظهر إلا في A». القاعدة خاطئة، لكن الروبوت لا يتحقق من B أبدًا، فلا يكتشف خطأها.",
          ),
        ],
        own: [
          bi(
            "An **autonomous** agent relies on its own percepts: it visits B, sees the dirt and corrects what it was told.",
            "أما الوكيل **المستقل (autonomous)** فيعتمد على إدراكاته الخاصة: يزور B، ويرى الأوساخ، ويصحّح ما قيل له.",
          ),
        ],
      },
    },
  ],
});

// ---------- Specifying the task: PEAS ----------
export const peas = defineWalkthrough({
  id: "ai1-peas",
  title: bi("Specify the task before the agent", "حدِّد المهمة قبل الوكيل"),
  analogy: bi(
    "A job advert. Before anyone is hired, it says how the work is judged, where it happens, which tools come with it and what information you will have.",
    "إعلان وظيفة: قبل أن يُعيَّن أي شخص، يحدد كيف سيُقيَّم العمل، وأين يجري، وما الأدوات المتاحة، وما المعلومات التي ستتوفر لك.",
  ),
  facts: {
    steering: PEAS_NAMES[componentOf("taxi", "steering") ?? "P"],
  },
  panels: [
    {
      id: "letters",
      pill: bi("P, E, A, S", "P و E و A و S"),
      heading: bi("Four parts of a task environment", "أربعة مكونات لبيئة المهمة"),
      points: [
        bi(
          "A **task environment** is specified by four parts: **P**erformance measure, **E**nvironment, **A**ctuators and **S**ensors.",
          "تُحدَّد **بيئة المهمة (task environment)** بأربعة مكونات: **مقياس الأداء (Performance measure)**، و**البيئة (Environment)**، و**المشغِّلات (Actuators)**، و**المستشعرات (Sensors)**.",
        ),
        bi(
          "The measure judges the environment from outside; the agent reaches the world only through its sensors and actuators.",
          "يحكم المقياس على البيئة من الخارج، ولا يصل الوكيل إلى العالم إلا من خلال مستشعراته ومشغِّلاته.",
        ),
      ],
    },
    {
      id: "card",
      pill: bi("PEAS card", "بطاقة PEAS"),
      heading: bi("PEAS for the page's two agents", "وصف PEAS لوكيلَي الصفحة"),
      control: {
        label: bi("Task", "المهمة"),
        options: [
          { id: "taxi", label: bi("Automated taxi", "سيارة الأجرة الآلية") },
          { id: "shopping", label: bi("Internet shopping", "التسوق عبر الإنترنت") },
        ],
        initial: "taxi",
      },
      points: [
        bi(
          "Each part answers one question: how is success scored, where does the agent work, how does it act, and how does it perceive?",
          "يجيب كل مكوّن عن سؤال: كيف يُقيَّم النجاح، وأين يعمل الوكيل، وكيف يتصرف، وكيف يُدرك؟",
        ),
      ],
      pointsFor: {
        taxi: [
          bi(
            "The taxi's performance measure mixes goals such as safety, profit and comfort, which can pull against each other.",
            "يجمع مقياس أداء سيارة الأجرة أهدافًا مثل السلامة والربح والراحة، وقد يتعارض بعضها مع بعض.",
          ),
        ],
        shopping: [
          bi(
            "The shopping agent lives in software: its actuators are web actions and its only sensor input is HTML pages.",
            "يعيش وكيل التسوق داخل البرمجيات: مشغِّلاته أفعال على الويب، ومُدخله الحسّي الوحيد صفحات HTML.",
          ),
        ],
      },
    },
    {
      id: "sort",
      pill: bi("Sort the parts", "صنِّف المكونات"),
      heading: bi("Which letter does each part belong to?", "إلى أي حرف ينتمي كل مكوّن؟"),
      control: {
        label: bi("Task", "المهمة"),
        options: [
          { id: "taxi", label: bi("Automated taxi", "سيارة الأجرة الآلية") },
          { id: "shopping", label: bi("Internet shopping", "التسوق عبر الإنترنت") },
        ],
        initial: "taxi",
      },
      points: [
        bi(
          "Follow the flow: **sensors** bring information in, **actuators** change the world, the **environment** is what they touch, and the **performance measure** judges the result.",
          "تتبّع الاتجاه: **المستشعرات** تُدخل المعلومات، و**المشغِّلات** تغيّر العالم، و**البيئة** هي ما تتعامل معه، و**مقياس الأداء** يحكم على النتيجة.",
        ),
      ],
      pointsFor: {
        taxi: [
          bi(
            "The **steering wheel** is an actuator. The **keyboard** is a sensor: the destination the passenger types flows into the agent.",
            "**المقود** مشغِّل، أما **لوحة المفاتيح** فمستشعر: فالوجهة التي يكتبها الراكب تدخل إلى الوكيل.",
          ),
        ],
        shopping: [
          bi(
            "**Filling in a form** changes the world, so it is an actuator; the **HTML pages** the agent reads are its sensor input.",
            "**تعبئة النموذج** تغيّر العالم، فهي مشغِّل، أما **صفحات HTML** التي يقرؤها الوكيل فهي مُدخله الحسّي.",
          ),
        ],
      },
    },
  ],
});

// ---------- Environment types ----------
export const environments = defineWalkthrough({
  id: "ai1-environments",
  title: bi("Six questions about an environment", "ستة أسئلة عن البيئة"),
  analogy: bi(
    "A board game versus city traffic. In solitaire you see every card, nothing moves while you think and the moves can be counted; in traffic you see part of the road, everyone moves at once and steering is smooth.",
    "لعبة لوحية مقابل حركة المرور في المدينة: في السوليتير ترى كل الأوراق، ولا يتحرك شيء بينما تفكر، ويمكن عدّ الحركات؛ أما في المرور فلا ترى إلا جزءًا من الطريق، ويتحرك الجميع في الوقت نفسه، والتوجيه متصل.",
  ),
  facts: {
    "taxi-hard": hardCount("taxi"),
    "backgammon-deterministic": ENVIRONMENTS.backgammon.deterministic,
  },
  panels: [
    {
      id: "observable",
      pill: bi("Observable?", "قابلة للملاحظة؟"),
      heading: bi("Do the sensors show the whole relevant state?", "هل تُظهر المستشعرات الحالة الكاملة ذات الصلة؟"),
      control: {
        label: bi("Environment", "البيئة"),
        options: [
          { id: "fully", label: bi("Fully observable", "قابلة للملاحظة كليًا") },
          { id: "partially", label: bi("Partially observable", "قابلة للملاحظة جزئيًا") },
        ],
        initial: "fully",
      },
      points: [
        bi(
          "**Fully observable**: the sensors give the complete state that matters for the choice.",
          "**قابلة للملاحظة كليًا (fully observable)**: تعطي المستشعرات الحالة الكاملة المهمة لاتخاذ القرار.",
        ),
      ],
      pointsFor: {
        fully: [bi("A camera above both squares shows A and B at once, so the agent needs no memory.", "تُظهر كاميرا فوق المربعين A و B معًا، فلا يحتاج الوكيل إلى ذاكرة.")],
        partially: [
          bi(
            "The page's robot senses only the square it stands on; whether the other one is dirty must be remembered or guessed.",
            "أما روبوت الصفحة فلا يستشعر إلا المربع الذي يقف عليه، ويجب أن يتذكر حالة المربع الآخر أو يخمّنها.",
          ),
        ],
      },
    },
    {
      id: "deterministic",
      pill: bi("Deterministic?", "حتمية؟"),
      heading: bi("Does the action fix the next state?", "هل يحدد الفعل الحالة التالية؟"),
      control: {
        label: bi("Environment", "البيئة"),
        options: [
          { id: "deterministic", label: bi("Deterministic", "حتمية") },
          { id: "stochastic", label: bi("Stochastic", "عشوائية") },
        ],
        initial: "deterministic",
      },
      points: [
        bi(
          "**Deterministic**: the next state is completely determined by the current state and the action.",
          "**حتمية (deterministic)**: تتحدد الحالة التالية بالكامل بالحالة الحالية والفعل.",
        ),
      ],
      pointsFor: {
        deterministic: [bi("In the vacuum world, **Suck** in a dirty A always leaves A clean: one action, one next state.", "في عالم المكنسة، يترك **Suck** في A المتسخ المربعَ نظيفًا دائمًا: فعل واحد وحالة تالية واحدة.")],
        stochastic: [
          bi(
            "In backgammon the next position also depends on the **dice**, so the same turn can lead to many different states.",
            "في لعبة الطاولة (backgammon) يعتمد الوضع التالي أيضًا على **النرد**، فقد يؤدي الدور نفسه إلى حالات كثيرة مختلفة.",
          ),
        ],
      },
    },
    {
      id: "episodic",
      pill: bi("Episodic?", "عَرَضية؟"),
      heading: bi("Is each decision independent of the earlier ones?", "هل كل قرار مستقل عن القرارات السابقة؟"),
      control: {
        label: bi("Environment", "البيئة"),
        options: [
          { id: "episodic", label: bi("Episodic", "عَرَضية") },
          { id: "sequential", label: bi("Sequential", "تتابعية") },
        ],
        initial: "episodic",
      },
      points: [
        bi(
          "**Episodic**: experience splits into separate episodes, and a decision in one does not affect the next.",
          "**عَرَضية (episodic)**: تنقسم التجربة إلى حلقات منفصلة، ولا يؤثر القرار في إحداها على الحلقة التالية.",
        ),
      ],
      pointsFor: {
        episodic: [
          bi(
            "An inspector labels each part on a conveyor as OK or defective; one label does not change the next part.",
            "يصنّف فاحصٌ كل قطعة على السير الناقل إلى سليمة أو معيبة، ولا يغيّر تصنيف قطعة شيئًا في القطعة التالية.",
          ),
        ],
        sequential: [
          bi(
            "In a game, a move now changes the options later. All four of the page's tasks are **sequential**.",
            "في اللعبة تغيّر الحركة الآن الخيارات المتاحة لاحقًا، والمهام الأربع في الصفحة كلها **تتابعية (sequential)**.",
          ),
        ],
      },
    },
    {
      id: "static",
      pill: bi("Static?", "ساكنة؟"),
      heading: bi("Does the world wait while the agent thinks?", "هل ينتظر العالم بينما يفكر الوكيل؟"),
      control: {
        label: bi("Environment", "البيئة"),
        options: [
          { id: "static", label: bi("Static", "ساكنة") },
          { id: "semi", label: bi("Semi-dynamic", "شبه ديناميكية") },
          { id: "dynamic", label: bi("Dynamic", "ديناميكية") },
        ],
        initial: "static",
      },
      points: [
        bi(
          "**Static**: nothing changes while the agent deliberates, so it can take its time.",
          "**ساكنة (static)**: لا يتغير شيء بينما يتروّى الوكيل، فيستطيع أن يأخذ وقته.",
        ),
      ],
      pointsFor: {
        static: [bi("Solitaire waits: the cards stay where they are while you think.", "السوليتير ينتظر: تبقى الأوراق في مكانها بينما تفكر.")],
        semi: [
          bi(
            "Chess with a clock: the board waits, but the clock runs, so only the score changes. That is **semi-dynamic**.",
            "الشطرنج بساعة توقيت: الرقعة تنتظر لكن الساعة تعمل، فلا يتغير إلا الأداء المحسوب، وهذا معنى **شبه ديناميكية (semi-dynamic)**.",
          ),
        ],
        dynamic: [
          bi(
            "Taxi driving: the other cars keep moving while the agent decides, so hesitating is itself a choice.",
            "قيادة سيارة الأجرة: تواصل السيارات الأخرى حركتها بينما يقرر الوكيل، فيصبح التردد نفسه اختيارًا.",
          ),
        ],
      },
    },
    {
      id: "discrete-agents",
      pill: bi("Discrete? Alone?", "منفصلة؟ منفرد؟"),
      heading: bi("Countable steps, and who else is acting", "خطوات قابلة للعدّ، ومن غيره يتصرف"),
      control: {
        label: bi("Task", "المهمة"),
        options: [
          { id: "solitaire", label: bi("Solitaire", "السوليتير") },
          { id: "taxi", label: bi("Taxi", "سيارة الأجرة") },
        ],
        initial: "solitaire",
      },
      points: [
        bi(
          "**Discrete**: states, time, percepts and actions can be counted. **Single-agent**: the agent is acting alone.",
          "**منفصلة (discrete)**: يمكن عدّ الحالات والزمن والإدراكات والأفعال. **وكيل واحد (single-agent)**: يعمل الوكيل منفردًا.",
        ),
      ],
      pointsFor: {
        solitaire: [
          bi(
            "Solitaire has a countable set of positions and moves, and the player acts alone: discrete and single-agent.",
            "للسوليتير مجموعة قابلة للعدّ من الأوضاع والحركات، ويلعبه اللاعب وحده: فهو منفصل وذو وكيل واحد.",
          ),
        ],
        taxi: [
          bi(
            "A taxi's speed and steering angle vary smoothly, and other drivers and pedestrians act too: continuous and **multi-agent**.",
            "تتغير سرعة سيارة الأجرة وزاوية توجيهها بشكل متصل، ويتصرف سائقون ومشاة آخرون أيضًا: فهي متصلة و**متعددة الوكلاء (multi-agent)**.",
          ),
        ],
      },
    },
    {
      id: "tasks",
      pill: bi("Four tasks", "أربع مهام"),
      heading: bi("Where the page's four tasks sit", "أين تقع مهام الصفحة الأربع"),
      control: {
        label: bi("Task", "المهمة"),
        options: [
          { id: "solitaire", label: bi("Solitaire", "السوليتير") },
          { id: "backgammon", label: bi("Backgammon", "الطاولة") },
          { id: "shopping", label: bi("Internet shopping", "التسوق عبر الإنترنت") },
          { id: "taxi", label: bi("Taxi", "سيارة الأجرة") },
        ],
        initial: "solitaire",
      },
      points: [
        bi(
          "Each slider runs from the easy case to the hard case. The environment type largely decides the agent design.",
          "يمتد كل مؤشر من الحالة السهلة إلى الحالة الصعبة، ونوع البيئة هو ما يحدد تصميم الوكيل إلى حد كبير.",
        ),
      ],
      pointsFor: {
        solitaire: [
          bi(
            `Hard on ${hardCount("solitaire")} of 6: like every task here, it is **sequential**.`,
            `صعبة في ${hardCount("solitaire")} من 6 فقط: فهي **تتابعية** مثل كل المهام هنا.`,
          ),
        ],
        backgammon: [
          bi(
            `Hard on ${hardCount("backgammon")} of 6: the dice make it **stochastic** and the opponent makes it **multi-agent**.`,
            `صعبة في ${hardCount("backgammon")} من 6: النرد يجعلها **عشوائية**، والخصم يجعلها **متعددة الوكلاء**.`,
          ),
        ],
        shopping: [
          bi(
            `Hard on ${hardCount("shopping")} of 6: the agent sees only the pages it opens, and prices are only partly predictable.`,
            `صعبة في ${hardCount("shopping")} من 6: لا يرى الوكيل إلا الصفحات التي يفتحها، والأسعار لا يمكن توقعها إلا جزئيًا.`,
          ),
        ],
        taxi: [
          bi(`Hard on all ${hardCount("taxi")}: the real world is the hardest case.`, `صعبة في الأبعاد الـ${hardCount("taxi")} كلها: العالم الحقيقي هو أصعب الحالات.`),
        ],
      },
    },
  ],
});

// ---------- Agent architectures ----------
const recent = stateAgentStep({ A: 0, B: 1 }, ["A", "Clean"]);
const longAgo = stateAgentStep({ A: 0, B: 4 }, ["A", "Clean"]);
const uDirect = utility(HALF_DONE, PLANS.direct);
const uWander = utility(HALF_DONE, PLANS.wander);

export const architectures = defineWalkthrough({
  id: "ai1-architectures",
  title: bi("Five agent architectures", "خمس معماريات للوكلاء"),
  analogy: bi(
    "Ways to drive. React to the car in front (reflex), remember the car in your blind spot (model), plan a route to the address (goal), pick the fastest and safest route (utility), and get better with every trip (learning).",
    "طرق القيادة: أن تتفاعل مع السيارة التي أمامك (انعكاس)، وأن تتذكر السيارة في النقطة العمياء (نموذج)، وأن تخطط مسارًا إلى العنوان (هدف)، وأن تختار المسار الأسرع والأكثر أمانًا (منفعة)، وأن تتحسن مع كل رحلة (تعلّم).",
  ),
  facts: {
    recent: recent.action,
    threshold: THRESHOLD,
  },
  panels: [
    {
      id: "ladder",
      pill: bi("Increasing generality", "عمومية متزايدة"),
      heading: bi("Each type adds one piece", "كل نوع يضيف قطعة واحدة"),
      points: [
        bi(
          "Four basic types in order of increasing generality: **simple reflex**, **model-based reflex**, **goal-based** and **utility-based**.",
          "أربعة أنواع أساسية مرتبة حسب العمومية المتزايدة: **الانعكاس البسيط (simple reflex)**، و**الانعكاس القائم على النموذج (model-based)**، و**القائم على الهدف (goal-based)**، و**القائم على المنفعة (utility-based)**.",
        ),
        bi("Any of them can be turned into a **learning agent**.", "ويمكن تحويل أي منها إلى **وكيل متعلِّم (learning agent)**."),
      ],
    },
    {
      id: "simple-reflex",
      pill: bi("Simple reflex", "الانعكاس البسيط"),
      heading: bi("From the current percept straight to an action", "من الإدراك الحالي إلى الفعل مباشرةً"),
      control: {
        label: bi("Percept", "الإدراك"),
        options: [
          { id: "a-dirty", label: bi("[A, Dirty]", "[A, Dirty]") },
          { id: "a-clean", label: bi("[A, Clean]", "[A, Clean]") },
          { id: "b-clean", label: bi("[B, Clean]", "[B, Clean]") },
        ],
        initial: "a-dirty",
      },
      points: [
        bi(
          "It uses the **current percept only**: the first **condition–action rule** whose condition holds fires.",
          "يعتمد على **الإدراك الحالي فقط**: تُنفَّذ أول **قاعدة شرط–فعل (condition–action rule)** يتحقق شرطها.",
        ),
        bi(
          "Simple and fast, but correct only in a **fully observable** world; without memory it can loop forever.",
          "بسيط وسريع، لكنه لا يكون صحيحًا إلا في عالم **قابل للملاحظة كليًا (fully observable)**، ومن دون ذاكرة قد يدور في حلقة لا نهائية.",
        ),
      ],
      pointsFor: {
        "a-dirty": [bi(`The square is dirty, so rule 1 fires: **${reflexVacuumAgent(["A", "Dirty"])}**.`, `المربع متسخ، فتُنفَّذ القاعدة 1: **${reflexVacuumAgent(["A", "Dirty"])}**.`)],
        "a-clean": [bi(`A is clean, so rule 1 fails and rule 2 fires: **${reflexVacuumAgent(["A", "Clean"])}**.`, `المربع A نظيف، فلا تتحقق القاعدة 1 وتُنفَّذ القاعدة 2: **${reflexVacuumAgent(["A", "Clean"])}**.`)],
        "b-clean": [bi(`In a clean B only rule 3 holds: **${reflexVacuumAgent(["B", "Clean"])}**.`, `في B النظيف لا تتحقق إلا القاعدة 3: **${reflexVacuumAgent(["B", "Clean"])}**.`)],
      },
    },
    {
      id: "model-based",
      pill: bi("Model-based", "القائم على النموذج"),
      heading: bi("Internal state tracks what it can't see", "الحالة الداخلية تتتبّع ما لا يراه"),
      control: {
        label: bi("B was last cleaned", "آخر تنظيف لـ B كان"),
        options: [
          { id: "recent", label: bi("Recently", "مؤخرًا") },
          { id: "long-ago", label: bi("Long ago", "منذ مدة طويلة") },
        ],
        initial: "recent",
      },
      points: [
        bi(
          "An **internal state** remembers what the percept no longer shows. Updating it needs **how the world evolves** and **what my actions do**.",
          "تتذكر **الحالة الداخلية (internal state)** ما لم يعد الإدراك يُظهره، ويحتاج تحديثها إلى معرفة **كيف يتطوّر العالم** و**ما الذي تفعله أفعالي**.",
        ),
      ],
      pointsFor: {
        recent: [
          bi(
            `B was cleaned ${recent.memory.B} steps ago, not more than ${THRESHOLD}, so the robot stays put: **${recent.action}**.`,
            `عدد الخطوات منذ تنظيف B هو ${recent.memory.B}، وهو لا يزيد على ${THRESHOLD}، فيبقى الروبوت في مكانه: **${recent.action}**.`,
          ),
        ],
        "long-ago": [
          bi(
            `B was cleaned ${longAgo.memory.B} steps ago, more than ${THRESHOLD}, so it goes back to check: **${longAgo.action}**.`,
            `عدد الخطوات منذ تنظيف B هو ${longAgo.memory.B}، وهو أكثر من ${THRESHOLD}، فيعود الروبوت للتحقق: **${longAgo.action}**.`,
          ),
        ],
      },
    },
    {
      id: "goal-based",
      pill: bi("Goal-based", "القائم على الهدف"),
      heading: bi("What will happen if I do action A?", "ماذا سيحدث لو نفّذت الفعل A؟"),
      control: {
        label: bi("Plan to test", "الخطة المختبَرة"),
        options: [
          { id: "wait", label: bi("Wait (NoOp)", "الانتظار (NoOp)") },
          { id: "direct", label: bi("Right, then Suck", "Right ثم Suck") },
        ],
        initial: "wait",
      },
      points: [
        bi(
          "The agent predicts the result of a plan with its model and checks it against its **goal**: both squares clean.",
          "يتنبأ الوكيل بنتيجة الخطة باستخدام نموذجه، ويقارنها بـ**هدفه (goal)**: أن يكون المربعان نظيفين.",
        ),
        bi("**Search** and **planning** (the next lectures) find action sequences that reach a goal.", "و**البحث (search)** و**التخطيط (planning)** (موضوعا المحاضرات القادمة) يجدان تسلسلات الأفعال التي تصل إلى الهدف."),
      ],
      pointsFor: {
        wait: [bi("Predicted: B stays dirty. The goal is not reached, so this plan is rejected.", "النتيجة المتوقعة: يبقى B متسخًا، فلا يتحقق الهدف وتُرفض هذه الخطة.")],
        direct: [
          bi(
            `Predicted: both squares clean. The goal is reached, so the agent starts the plan: **${PLANS.direct[0]}**.`,
            `النتيجة المتوقعة: المربعان نظيفان، فيتحقق الهدف ويبدأ الوكيل تنفيذ الخطة: **${PLANS.direct[0]}**.`,
          ),
        ],
      },
    },
    {
      id: "utility-based",
      pill: bi("Utility-based", "القائم على المنفعة"),
      heading: bi("How happy will I be in such a state?", "ما مدى سعادتي في حالة كهذه؟"),
      control: {
        label: bi("Plan to score", "الخطة المقيَّمة"),
        options: [
          { id: "direct", label: bi("Right, Suck", "Right ثم Suck") },
          { id: "wander", label: bi("Right, Left, Right, Suck", "Right ثم Left ثم Right ثم Suck") },
        ],
        initial: "direct",
      },
      points: [
        bi(
          "Both plans reach the goal, so a goal alone cannot choose. A **utility function** gives each outcome a number.",
          "كلتا الخطتين تصل إلى الهدف، فلا يستطيع الهدف وحده أن يختار بينهما، أما **دالة المنفعة (utility function)** فتُسند إلى كل نتيجة رقمًا.",
        ),
      ],
      pointsFor: {
        direct: [
          bi(
            `Utility over ${HORIZON} steps (clean squares per step, minus one per move): ${uDirect}. This is the highest, so the agent picks it.`,
            `المنفعة خلال ${HORIZON} خطوات (المربعات النظيفة في كل خطوة مع خصم نقطة لكل حركة): ${uDirect}، وهي الأعلى، فيختار الوكيل هذه الخطة.`,
          ),
        ],
        wander: [
          bi(
            `The detour costs extra moves and leaves B dirty for longer: utility ${uWander}, below ${uDirect}.`,
            `يكلّف الالتفاف حركات إضافية ويُبقي B متسخًا مدة أطول: المنفعة ${uWander}، وهي أقل من ${uDirect}.`,
          ),
        ],
      },
    },
    {
      id: "learning",
      pill: bi("Learning", "المتعلِّم"),
      heading: bi("Four parts that improve the agent over time", "أربعة مكونات تحسّن الوكيل بمرور الوقت"),
      control: {
        label: bi("Component", "المكوّن"),
        options: [
          { id: "performance", label: bi("Performance element", "عنصر الأداء") },
          { id: "critic", label: bi("Critic", "الناقد") },
          { id: "learning", label: bi("Learning element", "عنصر التعلّم") },
          { id: "problem", label: bi("Problem generator", "مولِّد المسائل") },
        ],
        initial: "performance",
      },
      points: [
        bi(
          "A **learning agent** improves its own performance over time: after each action, feedback flows back and changes how it acts.",
          "يحسّن **الوكيل المتعلِّم (learning agent)** أداءه بمرور الوقت: بعد كل فعل تعود التغذية الراجعة (feedback) وتغيّر طريقة تصرفه.",
        ),
      ],
      pointsFor: {
        performance: [
          bi(
            "The **performance element** selects external actions. It is the whole agent of the previous types.",
            "يختار **عنصر الأداء (performance element)** الأفعال الخارجية، وهو الوكيل كاملًا في الأنواع السابقة.",
          ),
        ],
        critic: [
          bi(
            "The **critic** compares behaviour with a fixed **performance standard** and sends feedback.",
            "يقارن **الناقد (critic)** السلوك بـ**معيار أداء (performance standard)** ثابت ويرسل التغذية الراجعة.",
          ),
        ],
        learning: [
          bi(
            "The **learning element** uses the critic's feedback to change the knowledge inside the performance element.",
            "يستخدم **عنصر التعلّم (learning element)** التغذية الراجعة من الناقد لتغيير المعرفة داخل عنصر الأداء.",
          ),
        ],
        problem: [
          bi(
            "The **problem generator** suggests **exploratory** actions that lead to new, informative experiences.",
            "يقترح **مولِّد المسائل (problem generator)** أفعالًا **استكشافية** تؤدي إلى تجارب جديدة غنية بالمعلومات.",
          ),
        ],
      },
    },
  ],
});

/** Every walkthrough in this lecture, registered in lib/walkthroughs/index.ts. */
export const all = [whatIsAi, agents, rationality, peas, environments, architectures] as const;

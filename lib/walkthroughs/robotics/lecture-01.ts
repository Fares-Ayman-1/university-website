import { bi } from "@/components/widgets/types";
import { defineWalkthrough } from "@/lib/widgets/walkthrough";
import { AFR, FIRST_LAWS, FLEET, JIRA, RIA_CLASSES, YEAR, rangeOf, robotCount, yearsBetween } from "@/lib/widgets/rob-lecture-01";

/*
 * Robotics · Lecture 1 (content/subjects/robotics/lectures/01-introduction.mdx).
 * One walkthrough per heading; the scenes are in
 * components/widgets/walkthrough/scenes/robotics/lecture-01/. The years and counts the page
 * states come from lib/widgets/rob-lecture-01.ts, and the page's `expect` checks the facts.
 */

const Y = YEAR;

// ---------- What is a robot? ----------
export const whatIsRobot = defineWalkthrough({
  id: "rob1-what-is-robot",
  title: bi("Sense, think, act", "يستشعر، يفكّر، يتصرّف"),
  analogy: bi(
    "Filling a glass of water. Your eyes watch the level (sense), you judge it is almost full (think), your hand tilts the jug back (act), and your eyes check again, because pouring changed what there is to see.",
    "ملء كوب بالماء: تراقب عيناك مستوى الماء (تستشعر)، وتحكم بأنه أوشك أن يمتلئ (تفكّر)، وتُميل يدك الإبريق إلى الخلف (تتصرّف)، ثم تتحقق عيناك من جديد، لأن الصبّ غيّر ما تراه.",
  ),
  panels: [
    {
      id: "loop",
      pill: bi("Sense–think–act", "استشعار، تفكير، تصرّف"),
      heading: bi("Three subsystems in a closed loop", "ثلاثة أنظمة فرعية في حلقة مغلقة"),
      points: [
        bi(
          "A robot must have **sensors** to sense, **processing** that emulates some aspects of cognition to think, and **actuators** to act.",
          "يجب أن يحتوي الروبوت على **مستشعرات (sensors)** ليستشعر، و**معالجة** تحاكي بعض جوانب الإدراك المعرفي (cognition) ليفكّر، و**مشغِّلات (actuators)** ليتصرّف.",
        ),
        bi(
          "The three form a **closed loop**: acting changes the world, and that changes what is sensed next.",
          "وتشكّل الثلاثة **حلقة مغلقة (closed loop)**: فالفعل يغيّر العالم، وهذا يغيّر ما سيُستشعَر بعد ذلك.",
        ),
      ],
    },
    {
      id: "test",
      pill: bi("The test", "الاختبار"),
      heading: bi("Does it sense, think and act?", "هل تستشعر وتفكّر وتتصرّف؟"),
      control: {
        label: bi("Machine", "الآلة"),
        options: [
          { id: "washer", label: bi("Timer washing machine", "غسّالة بمؤقّت") },
          { id: "alarm", label: bi("Alarm system", "نظام إنذار") },
          { id: "robot", label: bi("Robot", "روبوت") },
        ],
        initial: "washer",
      },
      points: [
        bi(
          "Ask three questions of any machine: does it take in information, does it use it to decide, and does it change the physical world as a result? A robot needs **all three**.",
          "اطرح على أي آلة ثلاثة أسئلة: هل تلتقط معلومات، وهل تستخدمها لتقرّر، وهل تغيّر العالم المادي نتيجةً لذلك؟ ويحتاج الروبوت إلى **الثلاثة جميعًا**.",
        ),
      ],
      pointsFor: {
        washer: [
          bi(
            "It senses very little and decides nothing: it runs its timer whatever is in the drum. It **acts**, but acting alone does not make a robot.",
            "تستشعر القليل جدًا ولا تقرّر شيئًا: فهي تنفّذ مؤقّتها أيًّا كان ما في الحوض. إنها **تتصرّف**، لكن التصرّف وحده لا يصنع روبوتًا.",
          ),
        ],
        alarm: [
          bi(
            "It **senses** an intruder and **decides** to raise the alarm, but it does not act on the physical world, so it is not a robot.",
            "**يستشعر** وجود متسلّل و**يقرّر** إطلاق الإنذار، لكنه لا يؤثّر في العالم المادي، فليس روبوتًا.",
          ),
        ],
        robot: [
          bi(
            "It senses, decides and acts, and each action changes what it senses next: the loop is **closed**.",
            "يستشعر ويقرّر ويتصرّف، وكل فعل يغيّر ما يستشعره بعد ذلك: فالحلقة **مغلقة**.",
          ),
        ],
      },
    },
    {
      id: "agent",
      pill: bi("An AI agent", "وكيل ذكاء اصطناعي"),
      heading: bi("The agent from the AI course, with a body", "وكيل مقرر الذكاء الاصطناعي، ولكن بجسد"),
      points: [
        bi(
          "In artificial intelligence such systems are called **agents**: percepts come in through sensors, the agent program decides, and actuators carry out the action.",
          "تُسمّى هذه الأنظمة في الذكاء الاصطناعي **وكلاء (agents)**: تدخل الإدراكات (percepts) عبر المستشعرات، ويقرّر برنامج الوكيل (agent program)، وتنفّذ المشغِّلات الفعل.",
        ),
        bi(
          "In a robot the actions are physical: motors move an arm, a gripper or wheels in the real world.",
          "وأفعال الروبوت مادية: فالمحركات تحرّك ذراعًا أو قابضًا (gripper) أو عجلات في العالم الحقيقي.",
        ),
      ],
    },
    {
      id: "black-box",
      pill: bi("Black box", "الصندوق الأسود"),
      heading: bi("Human directions in, work done automatically out", "توجيهات الإنسان تدخل، وعمل يُنجَز آليًا يخرج"),
      control: {
        label: bi("View", "العرض"),
        options: [
          { id: "closed", label: bi("Black box", "صندوق أسود") },
          { id: "open", label: bi("Inside the box", "داخل الصندوق") },
        ],
        initial: "closed",
      },
      points: [
        bi(
          "Seen from outside, a robot takes **human directions** as input and produces **many types of work, done automatically**, as output.",
          "من الخارج، يأخذ الروبوت **توجيهات الإنسان** مدخلاتٍ وينتج **أنواعًا كثيرة من العمل تُنجَز آليًا** مخرجاتٍ.",
        ),
      ],
      pointsFor: {
        closed: [
          bi(
            "The box hides how it works: you see only the directions going in and the finished work coming out.",
            "يُخفي الصندوق طريقة عمله: فلا ترى إلا التوجيهات وهي تدخل والعمل المُنجَز وهو يخرج.",
          ),
        ],
        open: [
          bi(
            "Inside are the sensors, the controller and the actuators. The loop drawn **outside** the box, from the work back to the sensors, is the part beginners overlook.",
            "في الداخل توجد المستشعرات والمتحكِّم (controller) والمشغِّلات. والحلقة المرسومة **خارج** الصندوق، من العمل عائدةً إلى المستشعرات، هي الجزء الذي يغفل عنه المبتدئون.",
          ),
        ],
      },
    },
  ],
});

// ---------- A short history ----------
const wordToIndustry = yearsBetween("word", "unimation");
const mathsToIndustry = yearsBetween("dh", "unimation");

export const history = defineWalkthrough({
  id: "rob1-history",
  title: bi("From a word to an industry", "من كلمة إلى صناعة"),
  analogy: bi(
    "Flight. People imagined flying long before the first aeroplane, and airlines came only once the machine and its theory existed. Robots went the same way: the word, then the machine and its mathematics, then the industry.",
    "الطيران: تخيّل الناس الطيران قبل أول طائرة بزمن طويل، ولم تظهر شركات الطيران إلا بعد أن وُجدت الآلة ونظريتها. وقد سارت الروبوتات في الطريق نفسه: الكلمة، ثم الآلة ورياضياتها، ثم الصناعة.",
  ),
  facts: {
    word: Y.word,
    asimov: Y.asimov,
    devol: Y.devol,
    dh: Y.dh,
    unimation: Y.unimation,
    t3: Y.t3,
    abb: Y.abb,
    laws: FIRST_LAWS,
  },
  panels: [
    {
      id: "word",
      pill: bi("The word", "الكلمة"),
      heading: bi(`${Y.word} and ${Y.asimov}: robots in fiction first`, `${Y.word} و${Y.asimov}: الروبوتات في الأدب أولًا`),
      points: [
        bi(
          `In **${Y.word}** Karel Čapek's story Rossum's Universal Robots introduced the word **robot**, from the Czech and Slavonic root rabota: forced labour, work.`,
          `في عام **${Y.word}** قدّمت قصة كارل تشابيك (Karel Čapek) Rossum's Universal Robots كلمة **روبوت (robot)**، المشتقة من الجذر التشيكي والسلافي rabota: السُّخرة، العمل.`,
        ),
        bi("The name fixed the idea that a robot is a **worker**, a substitute for human labour.", "وقد رسّخ الاسم فكرة أن الروبوت **عامل**، أي بديل للعمل البشري."),
        bi(
          `In **${Y.asimov}** Isaac Asimov's I, Robot set out his **Three Laws of Robotics** (the last panel of this walkthrough).`,
          `وفي عام **${Y.asimov}** عرض كتاب إسحاق أسيموف (Isaac Asimov) I, Robot **قوانين الروبوتات الثلاثة (Three Laws of Robotics)** (اللوحة الأخيرة في هذه الجولة).`,
        ),
      ],
    },
    {
      id: "programmable",
      pill: bi("The machine", "الآلة"),
      heading: bi(`${Y.devol} and ${Y.dh}: a programmable robot and its mathematics`, `${Y.devol} و${Y.dh}: روبوت قابل للبرمجة ورياضياته`),
      points: [
        bi(
          `In **${Y.devol}** George Devol developed the **first programmable robot**: its motions could be changed by editing stored instructions instead of rebuilding cams and stops.`,
          `في عام **${Y.devol}** طوّر جورج ديفول (George Devol) **أول روبوت قابل للبرمجة**: إذ يمكن تغيير حركاته بتعديل تعليمات مخزَّنة بدلًا من إعادة بناء الكامات (cams) والمصدّات.`,
        ),
        bi("Being programmable is what separates a robot from an automatic machine.", "والقابلية للبرمجة هي ما يميّز الروبوت من الآلة الأوتوماتيكية."),
        bi(
          `In **${Y.dh}** Denavit and Hartenberg developed **homogeneous transformation matrices**, still used today for robot kinematics.`,
          `وفي عام **${Y.dh}** طوّر دينافيت وهارتنبرغ (Denavit and Hartenberg) **مصفوفات التحويل المتجانس (homogeneous transformation matrices)**، التي لا تزال تُستخدم حتى اليوم في علم حركة الروبوتات (kinematics).`,
        ),
      ],
    },
    {
      id: "industry",
      pill: bi("The industry", "الصناعة"),
      heading: bi(`${Y.unimation} to ${Y.abb}: robots go to work`, `من ${Y.unimation} إلى ${Y.abb}: الروبوتات تدخل المصانع`),
      points: [
        bi(`**${Y.unimation}**: Unimation is formed and the first industrial robots appear.`, `**${Y.unimation}**: تأسيس شركة Unimation وظهور أولى الروبوتات الصناعية.`),
        bi(`**${Y.t3}**: Cincinnati Milacron's **T3** becomes very popular in industry.`, `**${Y.t3}**: يحظى الروبوت **T3** من شركة Cincinnati Milacron بانتشار واسع في الصناعة.`),
        bi(
          `**${Y.abb}**: ABB acquires Cincinnati Milacron, part of the industry's consolidation into a few large suppliers.`,
          `**${Y.abb}**: تستحوذ شركة ABB على Cincinnati Milacron، في إطار اندماج هذه الصناعة في عدد قليل من الموردين الكبار.`,
        ),
      ],
    },
    {
      id: "gaps",
      pill: bi("Theory first", "النظرية أولًا"),
      heading: bi(`${wordToIndustry} years from the word, ${mathsToIndustry} from the mathematics`, `${wordToIndustry} عامًا من الكلمة، و${mathsToIndustry} أعوام من الرياضيات`),
      points: [
        bi(
          `From the word (**${Y.word}**) to the first industrial robots (**${Y.unimation}**) took **${wordToIndustry} years**; from the mathematics (**${Y.dh}**) it took only **${mathsToIndustry}**.`,
          `استغرق الطريق من الكلمة (**${Y.word}**) إلى أولى الروبوتات الصناعية (**${Y.unimation}**) **${wordToIndustry} عامًا**، أما من الرياضيات (**${Y.dh}**) فلم يستغرق إلا **${mathsToIndustry}** أعوام.`,
        ),
        bi(
          "Theory ran ahead of practice: what held robots back was the means to command a motion (programmable control and servo actuation), not knowing which motion to command.",
          "سبقت النظرية التطبيق: فما أخّر الروبوتات هو وسيلة تنفيذ الحركة (التحكم القابل للبرمجة والتشغيل بالمؤازرة (servo actuation))، لا معرفة الحركة التي ينبغي طلبها.",
        ),
      ],
    },
    {
      id: "laws",
      pill: bi("Asimov's laws", "قوانين أسيموف"),
      heading: bi("When two laws disagree, the higher one wins", "حين يتعارض قانونان، يغلب الأعلى منهما"),
      control: {
        label: bi("The order", "الأمر"),
        options: [
          { id: "harm", label: bi("Hurt someone", "إيذاء شخص") },
          { id: "flood", label: bi("Go into danger", "مواجهة الخطر") },
        ],
        initial: "harm",
      },
      points: [
        bi(
          `Asimov proposed **${FIRST_LAWS} laws** and later added a **zeroth law** above them. The laws are strictly ordered, so a conflict is settled by **precedence**, not by judgement.`,
          `اقترح أسيموف **${FIRST_LAWS} قوانين**، ثم أضاف لاحقًا **قانونًا صفريًا (zeroth law)** يعلوها. والقوانين مرتّبة ترتيبًا صارمًا، فيُحسَم التعارض **بالأسبقية (precedence)** لا بالتقدير.`,
        ),
        bi(
          "They are literature, not an engineering specification: real robot safety comes from guarding, light curtains, force and speed limits and emergency stops.",
          "وهي أدب لا مواصفات هندسية: فالسلامة الحقيقية للروبوتات تأتي من الحواجز الواقية، والستائر الضوئية (light curtains)، وحدود القوة والسرعة، ومفاتيح إيقاف الطوارئ.",
        ),
      ],
      pointsFor: {
        harm: [
          bi(
            "Ordered to push a person: Law 2 says obey, Law 1 says don't injure a human. **Law 1 ranks higher**, so the robot refuses.",
            "إذا أُمر الروبوت بدفع شخص: يقول القانون 2 أطِع، ويقول القانون 1 لا تؤذِ إنسانًا. و**القانون 1 أعلى رتبة**، فيرفض الروبوت.",
          ),
        ],
        flood: [
          bi(
            "Ordered into a flooded pit to fetch a tool: Law 3 says protect yourself, Law 2 says obey. **Law 2 ranks higher**, so the robot goes.",
            "إذا أُمر الروبوت بالنزول إلى حفرة مغمورة بالماء لإحضار أداة: يقول القانون 3 احمِ نفسك، ويقول القانون 2 أطِع. و**القانون 2 أعلى رتبة**، فيذهب الروبوت.",
          ),
        ],
      },
    },
  ],
});

// ---------- Formal definitions ----------
const riaCount = robotCount("ria");
const jaraCount = robotCount("jara");

export const definitions = defineWalkthrough({
  id: "rob1-definitions",
  title: bi("Three bodies, three definitions", "ثلاث جهات، ثلاثة تعريفات"),
  analogy: bi(
    "Deciding what counts as a vehicle. One rulebook means cars and lorries; another also includes bicycles and wheelchairs. Count the same street with each and you get two different totals.",
    "تحديد ما يُعدّ «مركبة»: فقاعدة تقصد السيارات والشاحنات، وأخرى تضمّ أيضًا الدراجات والكراسي المتحركة. وإذا عددتَ الشارع نفسه بكل قاعدة حصلتَ على مجموعين مختلفين.",
  ),
  panels: [
    {
      id: "compare",
      pill: bi("Side by side", "جنبًا إلى جنب"),
      heading: bi("What each definition requires", "ما يشترطه كل تعريف"),
      control: {
        label: bi("Definition by", "التعريف بحسب"),
        options: [
          { id: "ria", label: bi("RIA (USA)", "RIA (الولايات المتحدة)") },
          { id: "raa", label: bi("RAA (USA)", "RAA (الولايات المتحدة)") },
          { id: "jara", label: bi("JARA (Japan)", "JARA (اليابان)") },
        ],
        initial: "ria",
      },
      points: [
        bi(
          "There is no single agreed definition of a robot. Comparing them shows what each body considers essential.",
          "لا يوجد تعريف واحد متفق عليه للروبوت، ومقارنة التعريفات تُظهر ما تعدّه كل جهة جوهريًا.",
        ),
      ],
      pointsFor: {
        ria: [
          bi(
            "**RIA**: a re-programmable, multifunctional **manipulator** that moves material, parts, tools or specialised devices through variable programmed motions.",
            "**RIA**: ذراع آلية (manipulator) قابلة لإعادة البرمجة ومتعددة الوظائف، تحرّك المواد أو القطع أو الأدوات أو الأجهزة المتخصصة عبر حركات مبرمجة متغيرة.",
          ),
        ],
        raa: [
          bi(
            "**RAA** (Robotics Association of America): almost the same words, but it begins \"an **industrial** robot is…\", so it defines only production equipment.",
            "**RAA** (Robotics Association of America): الكلمات نفسها تقريبًا، لكنه يبدأ بعبارة «الروبوت **الصناعي** هو…»، فلا يعرّف إلا معدات الإنتاج.",
          ),
        ],
        jara: [
          bi(
            "**JARA**: devices that move **flexibly, like the moving parts of living organisms**, with or without intelligence, in response to human commands. Nothing about reprogramming or industry.",
            "**JARA**: أجهزة تتحرك **بمرونة تشبه الأجزاء المتحركة في الكائنات الحية**، سواء أكانت ذكية أم لا، استجابةً لأوامر الإنسان، دون أي ذكر لإعادة البرمجة أو للصناعة.",
          ),
        ],
      },
    },
    {
      id: "four-words",
      pill: bi("RIA's four ideas", "أفكار RIA الأربع"),
      heading: bi("Each idea in the RIA definition rules something out", "كل فكرة في تعريف RIA تستبعد شيئًا ما"),
      points: [
        bi(
          "**Re-programmable** rules out a machine whose behaviour is fixed by its mechanism; **multifunctional** rules out one dedicated to a single operation.",
          "تستبعد عبارة **قابلة لإعادة البرمجة** الآلةَ التي تحدّد آليتُها سلوكَها، وتستبعد عبارة **متعددة الوظائف** الآلةَ المخصّصة لعملية واحدة.",
        ),
        bi(
          "**Manipulator** limits it to devices that move objects, so a mobile robot with no arm does not clearly qualify. **Variable programmed motion** means the path is data, not a mechanical constraint.",
          "وتقصر كلمة **ذراع آلية (manipulator)** التعريف على الأجهزة التي تحرّك الأشياء، فلا ينطبق بوضوح على روبوت متنقّل بلا ذراع. وتعني عبارة **حركات مبرمجة متغيرة** أن المسار بيانات لا قيد ميكانيكي.",
        ),
      ],
    },
    {
      id: "verdict",
      pill: bi("Is it a robot?", "هل هو روبوت؟"),
      heading: bi("It depends on whose definition you use", "يتوقف ذلك على التعريف الذي تستخدمه"),
      control: {
        label: bi("Machine", "الآلة"),
        options: [
          { id: "arm", label: bi("Welding arm", "ذراع لحام") },
          { id: "prosthetic", label: bi("Prosthetic limb", "طرف صناعي") },
          { id: "teleop", label: bi("Teleoperated handler", "مناوِل يُدار عن بُعد") },
        ],
        initial: "arm",
      },
      points: [
        bi(
          "JARA's wording is broader, so many devices that RIA would not count are robots in Japan.",
          "صياغة JARA أوسع، ولذلك تُعدّ في اليابان روبوتاتٍ أجهزةٌ كثيرة لا تعدّها RIA كذلك.",
        ),
      ],
      pointsFor: {
        arm: [
          bi(
            "A re-programmable arm that moves a welding torch along programmed paths meets **both** definitions.",
            "الذراع القابلة لإعادة البرمجة التي تحرّك شعلة اللحام على مسارات مبرمجة تستوفي **كلا** التعريفين.",
          ),
        ],
        prosthetic: [
          bi(
            "A powered prosthetic limb moves flexibly, like a living limb, at its wearer's command: a robot for **JARA**. It is not a re-programmable, multifunctional manipulator, so RIA would not count it.",
            "يتحرك الطرف الصناعي المزوَّد بمحرك بمرونة مثل الطرف الحي وبأمر من مرتديه: فهو روبوت بحسب **JARA**. لكنه ليس ذراعًا آلية قابلة لإعادة البرمجة ومتعددة الوظائف، فلا تعدّه RIA روبوتًا.",
          ),
        ],
        teleop: [
          bi(
            "A teleoperated handler moves parts, but a person drives every motion and nothing is programmed: a robot for **JARA**, not for RIA.",
            "يحرّك المناوِل الذي يُدار عن بُعد القطع، لكن إنسانًا يقود كل حركة ولا شيء فيه مبرمج: فهو روبوت بحسب **JARA**، لا بحسب RIA.",
          ),
        ],
      },
    },
    {
      id: "statistics",
      pill: bi("Counting robots", "عدّ الروبوتات"),
      heading: bi("Same machines, different robot counts", "الآلات نفسها، وأعداد مختلفة من الروبوتات"),
      control: {
        label: bi("Count with", "العدّ بحسب"),
        options: [
          { id: "ria", label: bi("RIA's rule", "قاعدة RIA") },
          { id: "jara", label: bi("JARA's rule", "قاعدة JARA") },
        ],
        initial: "ria",
      },
      points: [
        bi(
          `The counting rules differ, so robot statistics from different countries are hard to compare: these ${FLEET.length} machines make **${riaCount}** robots by RIA's rule and **${jaraCount}** by JARA's.`,
          `تختلف قواعد العدّ، ولذلك يصعب مقارنة إحصاءات الروبوتات بين الدول: فهذه الآلات الخمس تعطي **${riaCount}** روبوتات بحسب قاعدة RIA و**${jaraCount}** بحسب قاعدة JARA.`,
        ),
        bi("So when you define a robot in an exam, **name the source** of the definition.", "لذا عندما تعرّف الروبوت في الامتحان، **اذكر مصدر** التعريف."),
      ],
      pointsFor: {
        ria: [bi("RIA counts only the re-programmable arms.", "لا تعدّ RIA إلا الأذرع القابلة لإعادة البرمجة.")],
        jara: [bi("JARA counts the prosthetic limb and the teleoperated handler too.", "وتعدّ JARA الطرف الصناعي والمناوِل الذي يُدار عن بُعد أيضًا.")],
      },
    },
  ],
});

// ---------- The robotic system ----------
export const system = defineWalkthrough({
  id: "rob1-system",
  title: bi("Inside a robotic system", "داخل النظام الروبوتي"),
  analogy: bi(
    "A body at work. The arm and hand do the job, the senses report, the brain coordinates, food supplies the energy, and a teacher or a memory says what to do.",
    "جسم يعمل: الذراع واليد تنجزان المهمة، والحواس تُبلغ، والدماغ ينسّق، والغذاء يمدّ بالطاقة، والمعلّم أو الذاكرة يحدّدان ما يجب فعله.",
  ),
  panels: [
    {
      id: "blocks",
      pill: bi("The blocks", "الكتل"),
      heading: bi("Components of a robotic system", "مكوّنات النظام الروبوتي"),
      points: [
        bi("The **computer controller** sits in the middle and coordinates all motion: it is the brain.", "يقع **المتحكِّم الحاسوبي (controller)** في المنتصف وينسّق جميع الحركات: إنه الدماغ."),
        bi(
          "The **mechanical arm** moves in space and the **end-of-arm tooling** (a gripper or tool) does the work. The **power supply** drives the arm, and the **sensors** report the state of the robot and its surroundings.",
          "تتحرك **الذراع الميكانيكية** في الفضاء، وتنجز **أدوات نهاية الذراع (end-of-arm tooling)** (قابض (gripper) أو أداة) العمل. ويمدّ **مصدر الطاقة** الذراعَ بالطاقة، وتُبلغ **المستشعرات (sensors)** عن حالة الروبوت والبيئة المحيطة به.",
        ),
        bi(
          "A human gives instructions or teaches positions with the **input device or teach pendant**, and programs are kept in **program storage or on a network**.",
          "ويعطي الإنسان التعليمات أو يعلّم الروبوت المواضع عبر **جهاز الإدخال أو لوحة التعليم (teach pendant)**، وتُحفظ البرامج في **وحدة تخزين البرامج أو على شبكة**.",
        ),
      ],
    },
    {
      id: "flow",
      pill: bi("What flows", "ما يتدفّق"),
      heading: bi("Commands and power go out, information comes back", "الأوامر والطاقة تخرج، والمعلومات تعود"),
      control: {
        label: bi("Show", "اعرض"),
        options: [
          { id: "outward", label: bi("Commands and power", "الأوامر والطاقة") },
          { id: "back", label: bi("Information", "المعلومات") },
        ],
        initial: "outward",
      },
      points: [
        bi(
          "Follow the arrows: commands and power flow **outward** toward the mechanism, and information flows **back** to the controller.",
          "تتبّع الأسهم: تتدفق الأوامر والطاقة **إلى الخارج** نحو الآلية، وتتدفق المعلومات **عائدةً** إلى المتحكِّم.",
        ),
      ],
      pointsFor: {
        outward: [
          bi(
            "The pendant and the program storage tell the controller what to do, the controller commands the arm, the power supply drives it, and the arm moves its tooling.",
            "تُخبر لوحةُ التعليم ووحدةُ تخزين البرامج المتحكِّمَ بما يجب فعله، ويأمر المتحكِّمُ الذراعَ، ويمدّها مصدرُ الطاقة بالطاقة، وتحرّك الذراعُ أدواتِ نهايتها.",
          ),
        ],
        back: [
          bi(
            "The sensors report to the controller along a one-way arrow. The two-way arrows carry information back too: from the tooling to the arm, from the arm to the controller, and from the controller to the pendant.",
            "تُبلغ المستشعراتُ المتحكِّمَ عبر سهم أحادي الاتجاه. وتحمل الأسهم ثنائية الاتجاه المعلوماتِ عائدةً أيضًا: من الأدوات إلى الذراع، ومن الذراع إلى المتحكِّم، ومن المتحكِّم إلى لوحة التعليم.",
          ),
        ],
      },
    },
    {
      id: "feedback",
      pill: bi("Open or closed loop", "حلقة مفتوحة أم مغلقة"),
      heading: bi("Remove the information arrows and the loop opens", "احذف أسهم المعلومات فتنفتح الحلقة"),
      control: {
        label: bi("Feedback", "التغذية الراجعة"),
        options: [
          { id: "closed", label: bi("With feedback", "مع تغذية راجعة") },
          { id: "open", label: bi("Without feedback", "دون تغذية راجعة") },
        ],
        initial: "closed",
      },
      points: [
        bi(
          "A robot whose information arrows are missing is an **open-loop** machine: it commands a motion and never checks the result.",
          "الروبوت الذي تغيب عنه أسهم المعلومات آلةٌ **بحلقة مفتوحة (open-loop)**: يأمر بحركة ولا يتحقق أبدًا من نتيجتها.",
        ),
      ],
      pointsFor: {
        closed: [
          bi(
            "The controller compares the measured position with the target and keeps correcting the error until the arm arrives. This is **servo control**.",
            "يقارن المتحكِّم الموضع المقيس بالموضع المستهدف ويواصل تصحيح الخطأ حتى تصل الذراع. وهذا هو **التحكم بالمؤازرة (servo control)**.",
          ),
        ],
        open: [
          bi(
            "A heavy load makes the arm stop short, and nothing detects it, so the error stays. Robots are classified by this difference (**method of control**).",
            "يجعل حِملٌ ثقيل الذراعَ تتوقف قبل الهدف، ولا شيء يكتشف ذلك، فيبقى الخطأ. وتُصنَّف الروبوتات بهذا الفرق (**طريقة التحكم**).",
          ),
        ],
      },
    },
    {
      id: "disciplines",
      pill: bi("Disciplines", "التخصصات"),
      heading: bi("Robotics is interdisciplinary", "علم الروبوتات متعدد التخصصات"),
      control: {
        label: bi("Discipline", "التخصص"),
        options: [
          { id: "mechanical", label: bi("Mechanical", "الميكانيكا") },
          { id: "electrical", label: bi("Electrical", "الكهرباء") },
          { id: "computer", label: bi("Computer science", "علوم الحاسب") },
          { id: "biology", label: bi("Biology", "علم الأحياء") },
        ],
        initial: "mechanical",
      },
      points: [
        bi(
          "**Robotics** is the art, knowledge base and know-how of designing, applying and using robots, and no single discipline covers it.",
          "**علم الروبوتات (Robotics)** هو فنّ تصميم الروبوتات وتطبيقها واستخدامها، وقاعدته المعرفية وخبرته العملية (know-how)، ولا يغطيه تخصص واحد.",
        ),
      ],
      pointsFor: {
        mechanical: [
          bi(
            "**Mechanical engineering** shapes the arm and its tooling: mechanisms, structures, joints and transmissions.",
            "تشكّل **الهندسة الميكانيكية** الذراعَ وأدواتها: الآليات، والهياكل، والمفاصل، ونقل الحركة.",
          ),
        ],
        electrical: [
          bi(
            "**Electrical and electronic engineering** gives the motors and drives in the arm, the power supply, the sensors and the safety circuits.",
            "تقدّم **الهندسة الكهربائية والإلكترونية** المحركات ومشغّلاتها (drives) في الذراع، ومصدر الطاقة، والمستشعرات، ودوائر السلامة.",
          ),
        ],
        computer: [
          bi(
            "**Computer science** gives the controller's programs, planning and perception, the network, and the pendant's human–machine interface.",
            "تقدّم **علوم الحاسب** برامج المتحكِّم، والتخطيط والإدراك (perception)، والشبكة، وواجهة التفاعل بين الإنسان والآلة في لوحة التعليم.",
          ),
        ],
        biology: [
          bi(
            "**Biology** gives inspiration: arms and grippers modelled on limbs and hands, and sensing modelled on perception.",
            "يقدّم **علم الأحياء** الإلهام: أذرع وقوابض على غرار الأطراف والأيدي، واستشعار على غرار الإدراك.",
          ),
        ],
      },
    },
  ],
});

// ---------- Classifying robots ----------
const riaRange = rangeOf(RIA_CLASSES);
const afrRange = rangeOf(AFR.map((t) => t.letter));

export const classify = defineWalkthrough({
  id: "rob1-classify",
  title: bi("Sorting robots into classes", "فرز الروبوتات إلى فئات"),
  analogy: bi(
    "Sorting vehicles: by licence class, by fuel, by what they carry. Each scheme answers a different question, and one vehicle has a place in every scheme.",
    "فرز المركبات: حسب فئة الرخصة، أو نوع الوقود، أو ما تحمله. كل مخطط يجيب عن سؤال مختلف، وللمركبة الواحدة مكان في كل مخطط.",
  ),
  facts: {
    jira: JIRA.length,
    ria: riaRange,
    afr: afrRange,
  },
  panels: [
    {
      id: "jira",
      pill: bi("JIRA classes", "فئات JIRA"),
      heading: bi(`JIRA's ${JIRA.length} classes of increasing autonomy`, `فئات JIRA الست ذات الاستقلالية المتزايدة`),
      control: {
        label: bi("Scheme", "المخطط"),
        options: [
          { id: "jira", label: bi("JIRA: all classes", "JIRA: كل الفئات") },
          { id: "ria", label: bi("RIA: robots only", "RIA: الروبوتات فقط") },
        ],
        initial: "jira",
      },
      points: [
        bi(
          `The Japanese Industrial Robot Association sorts machines into **${JIRA.length} classes**. From class 1 to class ${JIRA.length}, the decisions move from the human operator into the machine.`,
          `تصنّف جمعية الروبوتات الصناعية اليابانية (JIRA) الآلات إلى **${JIRA.length} فئات**. ومن الفئة 1 إلى الفئة ${JIRA.length} تنتقل القرارات من المشغّل البشري إلى الآلة.`,
        ),
      ],
      pointsFor: {
        jira: [
          bi(
            "A **playback** robot (class 4) only records and replays the path a human led it through: recording is not learning. Only the **intelligent** robot copes with changes in its environment.",
            "روبوت **إعادة التشغيل (playback)** (الفئة 4) لا يفعل إلا أن يسجّل المسار الذي قاده الإنسان عبره ويعيده: فالتسجيل ليس تعلّمًا. ولا يتعامل مع التغيّرات في بيئته إلا **الروبوت الذكي**.",
          ),
        ],
        ria: [
          bi(
            `The RIA counts only classes **${riaRange}** as robots. A manual-handling device and a fixed-sequence machine are tooling or automation.`,
            `لا تعدّ RIA روبوتاتٍ إلا الفئات **${riaRange}**، أما جهاز المناولة اليدوية وآلة التسلسل الثابت فتُعدّان أدواتٍ أو أتمتة.`,
          ),
        ],
      },
    },
    {
      id: "afr",
      pill: bi("AFR types", "أنواع AFR"),
      heading: bi(`AFR's types ${afrRange}, and two kinds of path`, `أنواع AFR من ${AFR[0].letter} إلى ${AFR[AFR.length - 1].letter}، ونوعان من المسارات`),
      control: {
        label: bi("Type C path", "مسار النوع C"),
        options: [
          { id: "ptp", label: bi("Point-to-point", "من نقطة إلى نقطة") },
          { id: "cp", label: bi("Continuous path", "مسار مستمر") },
        ],
        initial: "ptp",
      },
      points: [
        bi(
          `The French association uses **types ${afrRange}**: A manual handling and telerobotics, B predetermined cycles, C programmable servo-controlled robots, and D like C but able to **acquire information**.`,
          `تستخدم الجمعية الفرنسية (AFR) **الأنواع ${afrRange}**: النوع A للمناولة اليدوية والتحكم الروبوتي عن بُعد (telerobotics)، والنوع B للدورات المحددة مسبقًا، والنوع C للروبوتات القابلة للبرمجة المتحكَّم بها بالمؤازرة، والنوع D مثل C لكنه قادر على **اكتساب المعلومات**.`,
        ),
        bi(
          "Roughly, A matches JIRA class 1, B class 2, C classes 3–5 and D class 6.",
          "وبصورة تقريبية، يقابل النوع A الفئة 1 في JIRA، والنوع B الفئة 2، والنوع C الفئات 3–5، والنوع D الفئة 6.",
        ),
      ],
      pointsFor: {
        ptp: [
          bi(
            "**Point-to-point**: the robot is sent to a series of taught positions, and the path between them is not specified.",
            "**من نقطة إلى نقطة (point-to-point)**: يُرسَل الروبوت إلى سلسلة من المواضع المعلَّمة، دون تحديد المسار بينها.",
          ),
        ],
        cp: [
          bi(
            "**Continuous path**: the trajectory itself is controlled, as needed when the tool works while moving (arc welding, sealing, cutting).",
            "**المسار المستمر (continuous path)**: يُتحكَّم في المسار نفسه، وهذا مطلوب حين تعمل الأداة أثناء الحركة (اللحام بالقوس، ووضع المادة المانعة للتسرب، والقطع).",
          ),
        ],
      },
    },
    {
      id: "generations",
      pill: bi("Generations", "الأجيال"),
      heading: bi("Three generations, told apart by how much they sense", "ثلاثة أجيال يميّز بينها مقدار ما تستشعره"),
      control: {
        label: bi("Generation", "الجيل"),
        options: [
          { id: "1", label: bi("1st", "الأول") },
          { id: "2", label: bi("2nd", "الثاني") },
          { id: "3", label: bi("3rd", "الثالث") },
        ],
        initial: "1",
      },
      points: [bi("A part arrives somewhere the robot was not taught. What each generation does depends on its sensing.", "تصل قطعة إلى موضع لم يُعلَّم للروبوت، وما يفعله كل جيل يتوقف على استشعاره.")],
      pointsFor: {
        "1": [
          bi(
            "**1st generation** (1960s–70s): a re-programmable arm with **internal sensors** only. It repeats its stored motion and grips where the part used to be.",
            "**الجيل الأول** (الستينيات والسبعينيات): ذراع قابلة لإعادة البرمجة ذات **مستشعرات داخلية** فقط، تكرّر حركتها المخزَّنة وتقبض حيث كانت القطعة.",
          ),
        ],
        "2": [
          bi(
            "**2nd generation** (1980s): **external sensors** and feedback let it see that the part moved and make a limited decision to reach it.",
            "**الجيل الثاني** (الثمانينيات): تتيح له **المستشعرات الخارجية** والتغذية الراجعة (feedback) أن يرى أن القطعة تحرّكت، ويتخذ قرارًا محدودًا للوصول إليها.",
          ),
        ],
        "3": [
          bi(
            "**3rd generation** (late 1990s on): **artificial intelligence** lets it recognise a part it has never seen, learn how to grasp it and adapt.",
            "**الجيل الثالث** (منذ أواخر التسعينيات): يتيح له **الذكاء الاصطناعي** أن يتعرّف على قطعة لم يرها من قبل، ويتعلّم كيف يقبض عليها، ويتكيّف.",
          ),
        ],
      },
    },
    {
      id: "tree",
      pill: bi("Other axes", "محاور أخرى"),
      heading: bi("One robot, one branch on every axis", "روبوت واحد، وفرع واحد على كل محور"),
      control: {
        label: bi("Robot", "الروبوت"),
        options: [
          { id: "arm", label: bi("Welding arm", "ذراع لحام") },
          { id: "loader", label: bi("Press loader", "مُلقِّم مكبس") },
          { id: "rover", label: bi("Mars rover", "مركبة المريخ") },
        ],
        initial: "arm",
      },
      points: [
        bi(
          "Besides the association schemes, a robot is classified by **use**, **mobility**, **power source**, **method of control** and **capability** (its generation). **Kinematic configuration** comes in Lecture 2.",
          "إلى جانب مخططات الجمعيات، يُصنَّف الروبوت حسب **الاستخدام** و**التنقّل** و**مصدر الطاقة** و**طريقة التحكم** و**القدرة** (أي جيله). أما **التهيئة الحركية (kinematic configuration)** فتأتي في المحاضرة 2.",
        ),
      ],
      pointsFor: {
        arm: [
          bi(
            "An arc-welding arm that follows the seam: industrial, fixed, electric, servo-controlled and 2nd generation, because it senses the seam.",
            "ذراع لحام بالقوس تتبع خط اللحام: صناعية، ثابتة، كهربائية، مُتحكَّم بها بالمؤازرة، ومن الجيل الثاني لأنها تستشعر خط اللحام.",
          ),
        ],
        loader: [
          bi(
            "A bench machine whose pneumatic axes run between hand-set stops to feed a press: industrial, fixed, pneumatic, non-servo, and 1st generation at best (JIRA class 2).",
            "آلة مثبّتة على طاولة تتحرك محاورها الهوائية بين مصدّات تُضبط يدويًا لتغذية مكبس: صناعية، ثابتة، هوائية، غير مؤازَرة، ومن الجيل الأول في أحسن الأحوال (الفئة 2 في JIRA).",
          ),
        ],
        rover: [
          bi(
            "A NASA Mars rover: non-industrial, mobile, electric, servo-controlled, and 3rd generation by necessity, because the signal delay to Mars rules out real-time remote control.",
            "مركبة استكشاف المريخ من NASA: غير صناعية، متنقّلة، كهربائية، مُتحكَّم بها بالمؤازرة، ومن الجيل الثالث بحكم الضرورة، لأن تأخر الإشارة إلى المريخ يمنع التحكم عن بُعد في الزمن الحقيقي.",
          ),
        ],
      },
    },
    {
      id: "function",
      pill: bi("By function", "حسب الوظيفة"),
      heading: bi("Where the robot works decides its problem", "مكان عمل الروبوت يحدّد مشكلته"),
      control: {
        label: bi("Family", "العائلة"),
        options: [
          { id: "manip", label: bi("Manipulators", "الأذرع الآلية") },
          { id: "motion", label: bi("Motion generators", "مولِّدات الحركة") },
          { id: "loco", label: bi("Locomotors", "روبوتات التنقّل") },
          { id: "swimfly", label: bi("Swimming & flying", "السابحة والطائرة") },
        ],
        initial: "manip",
      },
      points: [
        bi(
          "The function families differ mainly in how the machine relates to the surface that supports it, and that predicts its engineering problem.",
          "تختلف عائلات الوظيفة أساسًا في علاقة الآلة بالسطح الذي يحملها، وهذا ينبئ بمشكلتها الهندسية.",
        ),
      ],
      pointsFor: {
        manip: [
          bi(
            "**Manipulators**: a fixed base, a chain of links and an end effector, such as 6-axis articulated arms and 4-axis palletisers. The problem is geometry: **where is the tool?**",
            "**الأذرع الآلية (manipulators)**: قاعدة ثابتة وسلسلة من الوصلات ومؤثِّر نهائي (end effector)، مثل الأذرع المفصلية سداسية المحاور وروبوتات رصّ المنصات رباعية المحاور. والمشكلة هندسية: **أين الأداة؟**",
          ),
        ],
        motion: [
          bi(
            "**Motion generators** move a platform, often with a person on it: flight simulators, SCARA robots and moving platforms.",
            "**مولِّدات الحركة (motion generators)** تحرّك منصة، وكثيرًا ما يكون عليها إنسان: أجهزة محاكاة الطيران، وروبوتات SCARA، والمنصات المتحركة.",
          ),
        ],
        loco: [
          bi(
            "**Locomotors** move themselves: legged (Aibo, Big Dog, hexapods), humanoid (ASIMO, NAO) and wheeled (Mars rovers). The problem is navigation: **where am I?**",
            "**روبوتات التنقّل (locomotors)** تحرّك نفسها: ذات أرجل (Aibo و Big Dog والروبوتات سداسية الأرجل)، وشبيهة بالبشر (ASIMO و NAO)، وذات عجلات (مركبات المريخ). والمشكلة ملاحية: **أين أنا؟**",
          ),
        ],
        swimfly: [
          bi(
            "**Swimming** robots (AUVs) and **flying** robots (UAVs, micro-robots) work where measuring is hard and staying in place costs energy all the time: their problem is **sensing and energy**.",
            "تعمل الروبوتات **السابحة** (AUV) و**الطائرة** (UAV والروبوتات الدقيقة) حيث يصعب القياس ويستهلك البقاء في المكان الطاقةَ باستمرار: فمشكلتها هي **الاستشعار والطاقة**.",
          ),
        ],
      },
    },
  ],
});

/** Every walkthrough in this lecture, registered in lib/walkthroughs/index.ts. */
export const all = [whatIsRobot, history, definitions, system, classify] as const;

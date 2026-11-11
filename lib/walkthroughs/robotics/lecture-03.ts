import { bi } from "@/components/widgets/types";
import { defineWalkthrough } from "@/lib/widgets/walkthrough";
import {
  ADC_MAX,
  BOOK_LDR_K,
  LDR_K,
  POT_STEP,
  RANGE_MM,
  R_FIXED,
  SUPPLY,
  SWITCH_V,
  THETA_MAX,
  adc,
  angleOf,
  bookLdrOut,
  ldrCurrent,
  ldrOut,
  potV,
  rangeText,
  show,
} from "@/lib/widgets/rob-lecture-03";

/*
 * Robotics · Lecture 3 walkthroughs (content/subjects/robotics/lectures/03-sensors-i.mdx).
 * One walkthrough per heading; the scenes are in
 * components/widgets/walkthrough/scenes/robotics/lecture-03/. Every number the text quotes is
 * computed in lib/widgets/rob-lecture-03.ts, and the page's `expect` checks the facts.
 */

const v = {
  bright: show(ldrOut("bright")),
  dim: show(ldrOut("dim")),
  dark: show(ldrOut("dark")),
  brightFixed: show(ldrOut("bright", "fixed")),
  darkFixed: show(ldrOut("dark", "fixed")),
  bookBright: show(bookLdrOut("bright")),
  bookDark: show(bookLdrOut("dark")),
};
const count = { bright: adc(ldrOut("bright")), dim: adc(ldrOut("dim")), dark: adc(ldrOut("dark")) };
const current = { bright: show(ldrCurrent("bright")), dark: show(ldrCurrent("dark") * 1000, 1) };
const pot = (theta: number) => ({ v: show(potV(theta)), count: adc(potV(theta)) });

// ---------- What is a sensor? ----------
export const whatIsSensor = defineWalkthrough({
  id: "rob3-what-is-sensor",
  title: bi("From a physical input to a usable signal", "من دخل فيزيائي إلى إشارة قابلة للاستخدام"),
  analogy: bi(
    "A doorbell. The button only tells you that it was pressed; whether it was a visitor, the postman or a child running past is something you have to work out.",
    "جرس الباب: لا يخبرك الزر إلا بأنه ضُغط، أما هل كان الضاغط زائرًا أم ساعي البريد أم طفلًا مرّ مسرعًا، فهذا ما عليك أن تستنتجه.",
  ),
  facts: { closed: SWITCH_V.closed, fixed: R_FIXED, bright: v.bright, dark: v.dark },
  panels: [
    {
      id: "definition",
      pill: bi("Input → output", "الدخل ← الخرج"),
      heading: bi("A sensor turns a physical input into a usable output", "المستشعر يحوّل دخلًا فيزيائيًا إلى خرج قابل للاستخدام"),
      control: {
        label: bi("Sensor", "المستشعر"),
        options: [
          { id: "thermocouple", label: bi("Thermocouple", "المزدوجة الحرارية") },
          { id: "switch", label: bi("Limit switch", "المفتاح الحدّي") },
          { id: "ldr", label: bi("LDR", "المقاومة الضوئية") },
        ],
        initial: "thermocouple",
      },
      points: [
        bi(
          "A **sensor** is an input device that gives a **usable output** in response to a **specified physical input**. Usable, in practice, means electrical: something the controller can read.",
          "**المستشعر (sensor)** جهاز إدخال يعطي **خرجًا قابلًا للاستخدام** استجابةً **لدخل فيزيائي محدد**. والقابل للاستخدام يعني عمليًا الخرج الكهربائي: شيئًا يستطيع المتحكِّم (controller) قراءته.",
        ),
      ],
      pointsFor: {
        thermocouple: [
          bi(
            "A **thermocouple** turns a temperature difference into a voltage of only tens of microvolts per degree, so it is amplified before the controller reads it (book p. 95).",
            "تحوّل **المزدوجة الحرارية (thermocouple)** فرق درجات الحرارة إلى جهد لا يتجاوز عشرات الميكروفولتات لكل درجة، لذا يُضخَّم قبل أن يقرأه المتحكِّم (الكتاب، ص 95).",
          ),
        ],
        switch: [
          bi(
            `A **limit switch** turns contact into one of two voltages: ${SWITCH_V.open} V when open, ${SWITCH_V.industrial} V DC when closed on an industrial controller.`,
            `يحوّل **المفتاح الحدّي (limit switch)** التلامس إلى أحد جهدين: ${SWITCH_V.open} V عندما يكون مفتوحًا، و ${SWITCH_V.industrial} V DC عندما يكون مغلقًا في متحكِّم صناعي.`,
          ),
        ],
        ldr: [
          bi(
            "An **LDR** turns light into a resistance; a voltage divider then turns that resistance into a voltage.",
            "تحوّل **المقاومة الضوئية (LDR)** الضوء إلى مقاومة، ثم يحوّل مقسِّم الجهد (voltage divider) هذه المقاومة إلى جهد.",
          ),
        ],
      },
    },
    {
      id: "inference",
      pill: bi("What was the world like?", "كيف كان العالم؟"),
      heading: bi("One reading, several possible worlds", "قراءة واحدة وعوالم ممكنة عدة"),
      points: [
        bi(
          "The general question of sensing: **given the reading, what was the world like?** The world causes the reading, and the robot has to reason back from the reading to the world.",
          "السؤال العام للاستشعار: **بمعلومية القراءة، كيف كان العالم؟** فالعالم هو سبب القراءة، وعلى الروبوت أن يستدل عكسيًا من القراءة على العالم.",
        ),
        bi(
          "A break-beam sensor over a chute reads **blocked**. One part, two jammed parts, a dead emitter or a dusty lens all give that same reading (book p. 95), so real robots combine sensors and check that their readings make sense.",
          "يقرأ مستشعر قطع الشعاع (break-beam) فوق مجرى القطع القيمة **محجوب**. وتعطي القراءةَ نفسها قطعةٌ واحدة، أو قطعتان عالقتان، أو مُرسِل (emitter) معطَّل، أو عدسة مغطاة بالغبار (الكتاب، ص 95)؛ لذا تجمع الروبوتات الحقيقية بين المستشعرات وتتحقق من معقولية قراءاتها.",
        ),
      ],
    },
    {
      id: "levels",
      pill: bi("Levels of processing", "مستويات المعالجة"),
      heading: bi("From one bit to millions of pixels", "من بِت واحد إلى ملايين البكسلات"),
      control: {
        label: bi("Sensor", "المستشعر"),
        options: [
          { id: "switch", label: bi("Switch", "المفتاح") },
          { id: "scale", label: bi("Digital scale", "الميزان الرقمي") },
          { id: "mic", label: bi("Microphone", "الميكروفون") },
          { id: "camera", label: bi("Camera", "الكاميرا") },
        ],
        initial: "switch",
      },
      points: [
        bi(
          "Sensors range from **simple** to **complex**, and the difference is how much processing the raw output needs before it means anything.",
          "تتدرج المستشعرات من **البسيطة** إلى **المعقدة**، والفرق هو مقدار المعالجة التي يحتاجها الخرج الخام قبل أن يصبح ذا معنى.",
        ),
      ],
      pointsFor: {
        switch: [
          bi(
            `A **switch** gives one bit: open = ${SWITCH_V.open} V, closed = ${SWITCH_V.closed} V. The wire itself carries the answer.`,
            `يعطي **المفتاح** بِتًا واحدًا: مفتوح = ${SWITCH_V.open} V، ومغلق = ${SWITCH_V.closed} V. فالسلك نفسه يحمل الإجابة.`,
          ),
        ],
        scale: [
          bi(
            "A **digital scale** gives a number. It needs only scaling and **calibration** (book p. 96).",
            "يعطي **الميزان الرقمي** رقمًا، ولا يحتاج إلا إلى التحجيم و**المعايرة (calibration)** (الكتاب، ص 96).",
          ),
        ],
        mic: [
          bi(
            "A **microphone** gives a waveform. One sample means nothing, so it needs **filtering** and **frequency analysis**.",
            "يعطي **الميكروفون** شكلًا موجيًا (waveform). والعينة الواحدة لا تعني شيئًا، لذا يحتاج إلى **الترشيح (filtering)** و**تحليل الترددات**.",
          ),
        ],
        camera: [
          bi(
            "A **camera** gives millions of pixel values, arriving again and again. Getting meaning out of them takes **computer vision**, the heaviest processing of all.",
            "تعطي **الكاميرا** ملايين من قيم البكسلات تصل مرة بعد مرة. واستخلاص المعنى منها يتطلب **الرؤية الحاسوبية (computer vision)**، وهي أثقل معالجة على الإطلاق.",
          ),
        ],
      },
    },
    {
      id: "divider",
      pill: bi("Ohm's law and the divider", "قانون أوم والمقسِّم"),
      heading: bi("The same current flows through both, so the voltage splits like the resistances", "يمر التيار نفسه في المقاومتين، فينقسم الجهد بنسبتهما"),
      control: {
        label: bi("Sensor R₂", "المستشعر R₂"),
        options: [
          { id: "bright", label: bi(`${LDR_K.bright} kΩ`, `${LDR_K.bright} kΩ`) },
          { id: "dark", label: bi(`${LDR_K.dark} kΩ`, `${LDR_K.dark} kΩ`) },
        ],
        initial: "bright",
      },
      points: [
        bi(
          `Most simple sensors change a **resistance**, but a controller measures a **voltage**. Put the sensor R₂ in series with a fixed R₁ = ${R_FIXED} kΩ across ${SUPPLY} V and apply **Ohm's law**, V = I·R, twice.`,
          `تغيّر معظم المستشعرات البسيطة **مقاومةً (resistance)**، لكن المتحكِّم يقيس **جهدًا (voltage)**. ضع المستشعر R₂ على التوالي مع مقاومة ثابتة R₁ = ${R_FIXED} kΩ عبر ${SUPPLY} V، وطبّق **قانون أوم (Ohm's law)** V = I·R مرتين.`,
        ),
      ],
      pointsFor: {
        bright: [
          bi(
            `R₂ = ${LDR_K.bright} kΩ: I = ${SUPPLY} V / ${R_FIXED + LDR_K.bright} kΩ ≈ ${current.bright} mA, so V_out = I·R₂ ≈ **${v.bright} V**. A small R₂ takes a small share of the supply.`,
            `R₂ = ${LDR_K.bright} kΩ: I = ${SUPPLY} V / ${R_FIXED + LDR_K.bright} kΩ ≈ ${current.bright} mA، ومن ثَمّ V_out = I·R₂ ≈ **${v.bright} V**. فالمقاومة R₂ الصغيرة تأخذ حصة صغيرة من جهد التغذية.`,
          ),
        ],
        dark: [
          bi(
            `R₂ = ${LDR_K.dark} kΩ: I = ${SUPPLY} V / ${R_FIXED + LDR_K.dark} kΩ ≈ ${current.dark} µA, so V_out = I·R₂ ≈ **${v.dark} V**. A large R₂ takes most of it.`,
            `R₂ = ${LDR_K.dark} kΩ: I = ${SUPPLY} V / ${R_FIXED + LDR_K.dark} kΩ ≈ ${current.dark} µA، ومن ثَمّ V_out = I·R₂ ≈ **${v.dark} V**. فالمقاومة R₂ الكبيرة تأخذ معظمه.`,
          ),
        ],
      },
    },
  ],
});

// ---------- Mechanical switches and limit switches ----------
export const limitSwitch = defineWalkthrough({
  id: "rob3-limit-switch",
  title: bi("Contacts that open and close", "نقاط تلامس تُفتح وتُغلق"),
  analogy: bi(
    "A light switch on the wall: it only knows on or off, something has to press it, and after enough presses it wears out.",
    "مفتاح الإضاءة على الحائط: لا يعرف إلا التشغيل أو الإيقاف، ولا بد أن يضغطه شيء، ومع كثرة الضغط يبلى.",
  ),
  facts: { logic1: SWITCH_V.industrial },
  panels: [
    {
      id: "on-off",
      pill: bi("On/off signal", "إشارة تشغيل/إيقاف"),
      heading: bi("A switch turns presence into one bit", "المفتاح يحوّل الوجود إلى بِت واحد"),
      control: {
        label: bi("Workpiece", "قطعة العمل"),
        options: [
          { id: "absent", label: bi("Absent", "غير موجودة") },
          { id: "present", label: bi("Present", "موجودة") },
        ],
        initial: "present",
      },
      points: [
        bi(
          "A **mechanical switch** gives an **on/off** signal when a mechanical input opens or closes its contacts.",
          "يعطي **المفتاح الميكانيكي (mechanical switch)** إشارة **تشغيل/إيقاف (on/off)** عندما يفتح دخلٌ ميكانيكي نقاط تلامسه أو يغلقها.",
        ),
      ],
      pointsFor: {
        absent: [
          bi(
            `No workpiece on the table: the switch is **open**, the input sees **${SWITCH_V.open} V**, logic 0.`,
            `لا توجد قطعة عمل على الطاولة: المفتاح **مفتوح**، فيرى الدخل **${SWITCH_V.open} V**، أي المنطق 0.`,
          ),
        ],
        present: [
          bi(
            `The workpiece presses the plunger: the switch **closes** and the input sees **${SWITCH_V.industrial} V DC**, logic 1, as is typical in industry.`,
            `تضغط قطعة العمل المكبس (plunger): فـ**يُغلق** المفتاح ويرى الدخل **${SWITCH_V.industrial} V DC**، أي المنطق 1، كما هو معتاد في الصناعة.`,
          ),
        ],
      },
    },
    {
      id: "contacts",
      pill: bi("NO and NC contacts", "نقاط التلامس NO و NC"),
      heading: bi("Normally open or normally closed", "مفتوح عادةً أم مغلق عادةً"),
      control: {
        label: bi("Wired to", "التوصيل على"),
        options: [
          { id: "no", label: bi("NO (normally open)", "NO (مفتوح عادةً)") },
          { id: "nc", label: bi("NC (normally closed)", "NC (مغلق عادةً)") },
        ],
        initial: "no",
      },
      points: [
        bi(
          "Inside the body (slide 10) the plunger moves a **movable contact** between two pairs of fixed contacts, **NC** and **NO**. A **return spring** pushes it back when the plunger is released.",
          "داخل جسم المفتاح (الشريحة 10) يحرّك المكبس (plunger) **نقطة تلامس متحركة** بين زوجين من نقاط التلامس الثابتة، **NC** و **NO**. ويعيدها **نابض الإرجاع (return spring)** عند تحرير المكبس.",
        ),
      ],
      pointsFor: {
        no: [
          bi(
            "**Normally open**: the circuit closes only while the switch is pressed, so pressed = 1.",
            "**مفتوح عادةً (normally open)**: لا تُغلق الدائرة إلا أثناء ضغط المفتاح، فالمضغوط = 1.",
          ),
        ],
        nc: [
          bi(
            "**Normally closed**: the circuit is closed at rest and opens when pressed. A safety interlock needs exactly that, a circuit that opens when the switch acts; the book (p. 100) describes direct-opening contacts that the mechanism forces open even if they have welded.",
            "**مغلق عادةً (normally closed)**: تكون الدائرة مغلقة في وضع السكون وتُفتح عند الضغط. وهذا بالضبط ما يحتاجه قفل الأمان (safety interlock): دائرة تُفتح عندما يعمل المفتاح؛ ويصف الكتاب (ص 100) نقاط تلامس ذات فتح مباشر (direct-opening) تفتحها الآلية قسرًا حتى لو التحمت.",
          ),
        ],
      },
    },
    {
      id: "actuation",
      pill: bi("Lever, roller or cam", "ذراع أو بكرة أو حدبة"),
      heading: bi("Different heads, the same switch body", "رؤوس مختلفة وجسم المفتاح نفسه"),
      control: {
        label: bi("Actuated by", "يُشغَّل بواسطة"),
        options: [
          { id: "lever", label: bi("Lever", "ذراع رافعة") },
          { id: "roller", label: bi("Roller", "بكرة") },
          { id: "cam", label: bi("Cam", "حدبة") },
        ],
        initial: "lever",
      },
      points: [
        bi(
          "A **limit switch** detects the **presence or passage of a moving part**. Its **actuator head** turns whatever motion is available into the short push the switch body needs.",
          "يكتشف **المفتاح الحدّي (limit switch)** **وجود جزء متحرك أو مروره**. ويحوّل **رأس التشغيل (actuator head)** أي حركة متاحة إلى الدفعة القصيرة التي يحتاجها جسم المفتاح.",
        ),
        bi(
          "Other heads on slide 11: push plunger, roller plunger, roller lever, fork, adjustable roller arm, adjustable rod and spring rod.",
          "ومن الرؤوس الأخرى في الشريحة 11: مكبس الدفع (push plunger)، ومكبس البكرة، وذراع البكرة، والنوع الشوكي (fork)، وذراع البكرة القابل للضبط، والقضيب القابل للضبط، والقضيب النابضي (spring rod).",
        ),
      ],
      pointsFor: {
        lever: [
          bi(
            "**Lever**: the part pushes the lever down onto the button. A lever copes with motion that arrives at an angle.",
            "**ذراع رافعة (lever)**: يدفع الجزءُ الذراعَ إلى أسفل فوق الزر، والذراع يتحمّل الحركة القادمة بزاوية.",
          ),
        ],
        roller: [
          bi(
            "**Roller**: the part rides over a wheel instead of scraping across the plunger, so it can pass without scuffing.",
            "**بكرة (roller)**: يمر الجزء فوق عجلة بدل أن يحتك بالمكبس، فيعبر دون أن يخدشه.",
          ),
        ],
        cam: [
          bi(
            "**Cam**: as the cam rotates, its lobe comes round and presses the button (slide 9).",
            "**حدبة (cam)**: عندما تدور الحدبة يصل نتوؤها إلى الزر فيضغطه (الشريحة 9).",
          ),
        ],
      },
    },
    {
      id: "end-of-travel",
      pill: bi("End of travel", "نهاية المشوار"),
      heading: bi("A moving axis trips the switch at its limit", "محور متحرك يشغّل المفتاح عند حدّه"),
      points: [
        bi(
          "The name comes from the original job: detecting that an axis has reached the **limit of its travel** (book p. 99). Here the moving carriage presses the roller lever and the contacts change over.",
          "يأتي الاسم من مهمته الأصلية: اكتشاف وصول المحور إلى **حدّ مشواره** (الكتاب، ص 99). وهنا تضغط العربة المتحركة ذراعَ البكرة، فتتبدّل نقاط التلامس.",
        ),
        bi(
          "It is an independent, physical check: when a robot is **homed**, a limit switch usually sets the reference, and on **overtravel** it cuts the drive power (book p. 99).",
          "وهو تحقق فيزيائي مستقل: فعند **العودة إلى الموضع المرجعي (homing)** يحدد المفتاح الحدّي عادةً المرجع، وعند **تجاوز المشوار (overtravel)** يقطع القدرة عن المحرك (الكتاب، ص 99).",
        ),
      ],
    },
    {
      id: "bounce",
      pill: bi("Pros and cons", "المزايا والعيوب"),
      heading: bi("Cheap and simple, but it must touch, and it bounces", "رخيص وبسيط، لكنه يجب أن يلمس، ويرتد"),
      points: [
        bi(
          "Limit switches are **cheaper** than proximity or photoelectric switches and come in a **wide range of sizes**. They also don't care what the part is made of.",
          "المفاتيح الحدّية **أرخص** من مفاتيح التقارب والمفاتيح الكهروضوئية، وتتوفر **بمجموعة واسعة من الأحجام**، كما أنها لا تهتم بالمادة المصنوعة منها القطعة.",
        ),
        bi(
          "The price: they must **touch** the part, their moving parts **wear**, and the contacts **bounce** for a few milliseconds on closing. Debounce in hardware or in software, or one part is counted as three (book p. 100).",
          "والثمن: يجب أن **تلمس** القطعة، وتبلى أجزاؤها المتحركة، و**ترتد (bounce)** نقاط التلامس بضع مللي ثوانٍ عند الإغلاق. لذا أزِل الارتداد (debounce) بالعتاد أو بالبرمجيات، وإلا عُدَّت القطعة الواحدة ثلاث قطع (الكتاب، ص 100).",
        ),
      ],
    },
  ],
});

// ---------- Proximity switches ----------
export const proximity = defineWalkthrough({
  id: "rob3-proximity",
  title: bi("Detecting without touching", "الاكتشاف دون تلامس"),
  analogy: bi(
    "Feeling a hot stove from a hand's width away: you know it is there without touching it, but only from close by, and only because it is hot. Each proximity switch likewise feels one property of the target, at short range.",
    "أن تشعر بموقد ساخن من مسافة عرض كف: تعرف أنه موجود دون أن تلمسه، لكن من قريب فقط، ولأنه ساخن فقط. وكذلك يستشعر كل مفتاح تقارب خاصية واحدة في الهدف، من مسافة قصيرة.",
  ),
  facts: { inductive: rangeText(RANGE_MM.inductive), capacitive: rangeText(RANGE_MM.capacitive) },
  panels: [
    {
      id: "types",
      pill: bi("Three principles", "ثلاثة مبادئ"),
      heading: bi("What each type detects, and from how far", "ما يكتشفه كل نوع، ومن أي مسافة"),
      control: {
        label: bi("Type", "النوع"),
        options: [
          { id: "inductive", label: bi("Inductive", "حثّي") },
          { id: "capacitive", label: bi("Capacitive", "سعوي") },
          { id: "magnetic", label: bi("Magnetic", "مغناطيسي") },
        ],
        initial: "inductive",
      },
      points: [
        bi(
          "Proximity switches detect an object **without touching it**. The inductive and capacitive types are the most widely used in industry.",
          "تكتشف مفاتيح التقارب (proximity switches) الجسم **دون أن تلمسه**، والنوعان الحثّي والسعوي هما الأكثر استخدامًا في الصناعة.",
        ),
      ],
      pointsFor: {
        inductive: [
          bi(
            `**Inductive**: a change in **inductance**. It detects metal, best of all ferrous metal, at about **${rangeText(RANGE_MM.inductive)} mm**; aluminium or copper only at a shorter distance (book p. 101).`,
            `**الحثّي (inductive)**: تغيّر في **المحاثّة (inductance)**. يكتشف المعادن، وأفضلها المعادن الحديدية، على مسافة **${rangeText(RANGE_MM.inductive)} مم** تقريبًا، أما الألومنيوم أو النحاس فعلى مسافة أقصر (الكتاب، ص 101).`,
          ),
        ],
        capacitive: [
          bi(
            `**Capacitive**: a change in **capacitance**. It detects metal **and non-metal** (plastic, glass, wood, liquids; book p. 102) at about **${rangeText(RANGE_MM.capacitive)} mm**.`,
            `**السعوي (capacitive)**: تغيّر في **السعة (capacitance)**. يكتشف المعادن **وغير المعادن** (البلاستيك، والزجاج، والخشب، والسوائل؛ الكتاب، ص 102) على مسافة **${rangeText(RANGE_MM.capacitive)} مم** تقريبًا.`,
          ),
        ],
        magnetic: [
          bi(
            "**Magnetic**: a change in magnetic flux. It responds only to a **magnet** fixed on the moving part, even through a non-magnetic wall, such as a piston inside an aluminium cylinder (book p. 103).",
            "**المغناطيسي (magnetic)**: تغيّر في التدفق المغناطيسي (magnetic flux). لا يستجيب إلا **لمغناطيس** مثبت على الجزء المتحرك، ولو من خلف جدار غير مغناطيسي، مثل مكبس داخل أسطوانة من الألومنيوم (الكتاب، ص 103).",
          ),
        ],
      },
    },
    {
      id: "inductive",
      pill: bi("Inductive: a damped oscillator", "الحثّي: مذبذب مُخمَّد"),
      heading: bi("Metal near the coil damps the oscillation", "المعدن القريب من الملف يُخمِد التذبذب"),
      control: {
        label: bi("Metal target", "الهدف المعدني"),
        options: [
          { id: "far", label: bi("Far", "بعيد") },
          { id: "near", label: bi("Near", "قريب") },
        ],
        initial: "far",
      },
      points: [
        bi(
          "A coil on a ferrous core is part of an **LC oscillator**, and its field reaches out past the sensor face.",
          "الملف الملفوف على قلب حديدي جزء من **مذبذب LC (LC oscillator)**، ويمتد مجاله إلى ما بعد وجه المستشعر.",
        ),
        bi(
          "A **Schmitt trigger** compares the oscillation's amplitude with a threshold, and an amplifier switches the transistor output: an **on/off** device.",
          "يقارن **قادح شميت (Schmitt trigger)** سعة التذبذب بعتبة (threshold)، ثم يبدّل مضخِّمٌ خرج الترانزستور، فنحصل على جهاز **تشغيل/إيقاف (on/off)**.",
        ),
      ],
      pointsFor: {
        far: [
          bi(
            "No metal in the field: the oscillation keeps its full amplitude, above the threshold, and the output is **off**.",
            "لا معدن في المجال: يحتفظ التذبذب بسعته الكاملة فوق العتبة، ويكون الخرج **مطفأً (off)**.",
          ),
        ],
        near: [
          bi(
            "Metal enters the field: it changes the coil's inductance, and the **eddy currents** induced in it damp the oscillation. The amplitude falls below the threshold and the output switches **on**.",
            "يدخل المعدن المجال: فيغيّر محاثّة الملف، وتُخمِد **التيارات الدوّامية (eddy currents)** المستحثة فيه التذبذب. فتهبط السعة دون العتبة ويتحول الخرج إلى **التشغيل (on)**.",
          ),
        ],
      },
    },
    {
      id: "capacitive",
      pill: bi("Capacitive: gap and dielectric", "السعوي: الفجوة والعازل"),
      heading: bi("The target changes the capacitance", "الهدف يغيّر السعة"),
      control: {
        label: bi("Target", "الهدف"),
        options: [
          { id: "metal", label: bi("Metal", "معدني") },
          { id: "nonmetal", label: bi("Non-metal", "غير معدني") },
        ],
        initial: "metal",
      },
      points: [
        bi(
          "The sensor face is **one plate of a capacitor**. The smaller the gap between the plates, the higher the capacitance, and the capacitance also depends on the **dielectric** between them (slides 17–18; book p. 102). An **RC oscillator** and a Schmitt trigger turn the change into an on/off output (slide 19).",
          "وجه المستشعر هو **أحد لوحَي مكثِّف (capacitor)**. فكلما صغرت الفجوة بين اللوحين زادت السعة (capacitance)، كما تعتمد السعة أيضًا على **العازل (dielectric)** بينهما (الشريحتان 17–18؛ الكتاب، ص 102). ويحوّل **مذبذب RC** وقادح شميت (Schmitt trigger) هذا التغيّر إلى خرج تشغيل/إيقاف (الشريحة 19).",
        ),
      ],
      pointsFor: {
        metal: [
          bi(
            "**Metal** target: the object is the other plate. As it approaches, the gap shrinks and the capacitance rises.",
            "هدف **معدني**: الجسم هو اللوح الآخر. فكلما اقترب صغرت الفجوة وزادت السعة.",
          ),
        ],
        nonmetal: [
          bi(
            "**Non-metal** target: the plates are the sensor and earth, and the object is the **dielectric** between them, changing the capacitance as it enters. Water, with a very high dielectric constant, is easy to detect; dry plastic foam is hard (book p. 102).",
            "هدف **غير معدني**: اللوحان هما المستشعر والأرض، والجسم هو **العازل (dielectric)** بينهما، فيغيّر السعة عند دخوله. والماء، لارتفاع ثابت العزل (dielectric constant) فيه كثيرًا، سهل الاكتشاف، أما الإسفنج البلاستيكي الجاف فصعب (الكتاب، ص 102).",
          ),
        ],
      },
    },
    {
      id: "wiring",
      pill: bi("Two-wire or three-wire", "سلكان أم ثلاثة أسلاك"),
      heading: bi("Wiring the switch to its load", "توصيل المفتاح بحِمله"),
      control: {
        label: bi("Connection", "التوصيل"),
        options: [
          { id: "two", label: bi("Two-wire", "سلكان") },
          { id: "three", label: bi("Three-wire", "ثلاثة أسلاك") },
        ],
        initial: "two",
      },
      points: [
        bi(
          "Proximity switches come in **cylindrical**, **rectangular** and **slot** shapes and run on **AC or DC**. The load may be a relay coil, a control circuit or a **PLC digital input**.",
          "تأتي مفاتيح التقارب بأشكال **أسطوانية** و**مستطيلة** و**مشقوقة (slot)**، وتعمل بالتيار **المتردد أو المستمر (AC أو DC)**. وقد يكون الحِمل ملف مرحِّل (relay)، أو دائرة تحكم، أو **دخلًا رقميًا في PLC**.",
        ),
      ],
      pointsFor: {
        two: [
          bi(
            "**Two-wire**: the switch sits **in series** with the load, like a mechanical switch. Its electronics still draw a small **leakage current** when off, which can hold a sensitive PLC input on (book pp. 103–104).",
            "**السلكان**: يوصَل المفتاح **على التوالي** مع الحِمل مثل المفتاح الميكانيكي. وتظل دوائره الإلكترونية تسحب **تيار تسرّب (leakage current)** صغيرًا وهو مطفأ، وقد يكفي ذلك لإبقاء دخل PLC الحساس في حالة التشغيل (الكتاب، ص 103–104).",
          ),
        ],
        three: [
          bi(
            "**Three-wire**: supply, ground and a separate **output** wire. The sensor is powered on its own, so nothing leaks through the load; this is the usual choice for a controller input.",
            "**الأسلاك الثلاثة**: سلك للتغذية، وسلك للأرضي، وسلك **خرج** منفصل. فيُغذّى المستشعر بشكل مستقل ولا يتسرب شيء عبر الحِمل، وهذا هو الاختيار المعتاد لدخل المتحكِّم.",
          ),
        ],
      },
    },
    {
      id: "advantages",
      pill: bi("Why not a limit switch?", "لماذا لا نستخدم مفتاحًا حدّيًا؟"),
      heading: bi("No moving parts: fast, durable and long-lived", "لا أجزاء متحركة: سريع ومتين وطويل العمر"),
      points: [
        bi(
          "Nothing touches and nothing moves, so proximity switches have a **long electrical life**, survive **vibration, fast motion and toxic environments**, and run on DC or AC.",
          "لا شيء يتلامس ولا شيء يتحرك، لذا تتمتع مفاتيح التقارب **بعمر كهربائي طويل**، وتتحمّل **الاهتزاز والحركة السريعة والبيئات السامة**، وتعمل بالتيار المستمر أو المتردد.",
        ),
        bi(
          "They respond to fast-approaching objects and **high switching frequencies**, such as counting the teeth of a turning shaft (slide 27). Where they lose to a limit switch is price.",
          "وتستجيب للأجسام سريعة الاقتراب ولـ**ترددات التبديل العالية**، مثل عدّ أسنان عمود دوّار (الشريحة 27). أما ما تخسر فيه أمام المفتاح الحدّي فهو السعر.",
        ),
      ],
    },
  ],
});

// ---------- Photoelectric switches ----------
const [photoMin, photoMax] = RANGE_MM.photoelectric;
export const photoelectric = defineWalkthrough({
  id: "rob3-photoelectric",
  title: bi("A beam of light that is broken or sent back", "شعاع ضوئي يُقطَع أو يُعاد"),
  analogy: bi(
    "Three ways to know someone is in a dark corridor: watch a torch held at the far end, bounce your torch off a mirror at the far end, or shine it into the dark and wait for a face to light up.",
    "ثلاث طرق لتعرف أن شخصًا في ممر مظلم: أن تراقب مصباحًا يُمسَك في الطرف الآخر، أو أن تعكس مصباحك على مرآة في الطرف الآخر، أو أن توجّهه إلى الظلام وتنتظر أن يضيء وجه.",
  ),
  facts: { min: photoMin / 10, max: photoMax / 1000 },
  panels: [
    {
      id: "types",
      pill: bi("Three arrangements", "ثلاثة ترتيبات"),
      heading: bi("Where the emitter, receiver and reflector sit", "أين يقع المُرسِل والمُستقبِل والعاكس"),
      control: {
        label: bi("Type", "النوع"),
        options: [
          { id: "through", label: bi("Through-beam", "الشعاع المباشر") },
          { id: "retro", label: bi("Retro-reflective", "العاكس الارتدادي") },
          { id: "diffuse", label: bi("Diffuse", "الانعكاس المنتشر") },
        ],
        initial: "through",
      },
      points: [
        bi(
          "Every photoelectric switch has an **emitter** and a **receiver** of a visible or infrared beam, and the object either **breaks** the beam or **reflects** it.",
          "لكل مفتاح كهروضوئي **مُرسِل (emitter)** و**مُستقبِل (receiver)** لشعاع مرئي أو تحت أحمر، والجسم إما أن **يقطع** الشعاع أو **يعكسه**.",
        ),
      ],
      pointsFor: {
        through: [
          bi(
            "**Through-beam**: separate emitter and receiver face each other. The light makes one trip, so the range is the **longest**, but both ends need wiring and alignment.",
            "**الشعاع المباشر (through-beam)**: مُرسِل ومُستقبِل منفصلان ومتقابلان. يقطع الضوء المسافة مرة واحدة فيكون المدى **الأطول**، لكن الطرفين يحتاجان إلى توصيل ومحاذاة.",
          ),
        ],
        retro: [
          bi(
            "**Retro-reflective**: one housing, plus a **reflector** of corner-cube prisms that sends the beam straight back. The object breaks the returning beam.",
            "**العاكس الارتدادي (retro-reflective)**: غلاف واحد، ومعه **عاكس (reflector)** من منشورات ركنية مكعبة يعيد الشعاع في اتجاهه نفسه، والجسم يقطع الشعاع العائد.",
          ),
        ],
        diffuse: [
          bi(
            "**Diffuse**: one housing and no reflector, so normally nothing comes back. The object's own surface **scatters** light back, which makes the range the **shortest** and dependent on the object's colour.",
            "**الانعكاس المنتشر (diffuse)**: غلاف واحد بلا عاكس، فلا يعود شيء في الحالة العادية. ويُ**بعثر** سطح الجسم نفسه الضوء عائدًا، فيكون المدى **الأقصر** ويعتمد على لون الجسم.",
          ),
        ],
      },
    },
    {
      id: "light-dark",
      pill: bi("Light-on or dark-on", "بالضوء أم بالظلام"),
      heading: bi("Which state energises the output?", "أي حالة تُنشِّط الخرج؟"),
      control: {
        label: bi("Operation", "التشغيل"),
        options: [
          { id: "light", label: bi("Light-on", "بالضوء") },
          { id: "dark", label: bi("Dark-on", "بالظلام") },
        ],
        initial: "light",
      },
      points: [
        bi(
          "**Light-on** energises the output when light **reaches** the receiver; **dark-on** energises it when the beam is **interrupted** and the receiver is in the dark.",
          "**التشغيل بالضوء (light-on)** يُنشِّط الخرج عندما **يصل** الضوء إلى المُستقبِل، و**التشغيل بالظلام (dark-on)** يُنشِّطه عندما **يُقطَع** الشعاع ويصبح المُستقبِل في الظلام.",
        ),
        bi(
          "For through-beam and retro-reflective switches an object means **dark**; for diffuse it means **light**, because the object reflects the beam back (slide 38).",
          "في مفاتيح الشعاع المباشر والعاكس الارتدادي يعني وجود الجسم **الظلام**، أما في الانعكاس المنتشر فيعني **الضوء**، لأن الجسم يعكس الشعاع عائدًا (الشريحة 38).",
        ),
      ],
      pointsFor: {
        light: [
          bi(
            "In **light-on** mode a through-beam output is on while the path is **clear**, and a diffuse output is on while an object is **present**.",
            "في وضع **التشغيل بالضوء** يعمل خرج الشعاع المباشر ما دام المسار **خاليًا**، ويعمل خرج الانعكاس المنتشر ما دام الجسم **موجودًا**.",
          ),
        ],
        dark: [
          bi(
            "In **dark-on** mode it flips: a through-beam or retro-reflective output is on while an object is **present**.",
            "في وضع **التشغيل بالظلام** ينقلب الأمر: يعمل خرج الشعاع المباشر أو العاكس الارتدادي ما دام الجسم **موجودًا**.",
          ),
        ],
      },
    },
    {
      id: "range",
      pill: bi("Range", "المدى"),
      heading: bi("Millimetres for proximity, metres for light", "مليمترات للتقارب وأمتار للضوء"),
      points: [
        bi(
          `Photoelectric switches reach from under **${photoMin / 10} cm** to about **${photoMax / 1000} m** (${photoMax / 10} cm on slide 37), far beyond the few tens of millimetres of a proximity switch.`,
          `يمتد مدى المفاتيح الكهروضوئية من أقل من **${photoMin / 10} سم** حتى نحو **${photoMax / 1000} م** (${photoMax / 10} سم في الشريحة 37)، وهو أبعد بكثير من بضع عشرات المليمترات لمفتاح التقارب.`,
        ),
        bi(
          "Of the three, **through-beam** reaches furthest, **retro-reflective** is medium to long, and **diffuse** is short to medium (book p. 106).",
          "ومن بين الأنواع الثلاثة يصل **الشعاع المباشر** إلى أبعد مدى، و**العاكس الارتدادي** متوسط إلى طويل، و**الانعكاس المنتشر** قصير إلى متوسط (الكتاب، ص 106).",
        ),
      ],
    },
    {
      id: "opto",
      pill: bi("Reflective opto-sensor", "المستشعر الضوئي العاكس"),
      heading: bi("An LED and a phototransistor side by side", "LED وترانزستور ضوئي جنبًا إلى جنب"),
      control: {
        label: bi("Surface below", "السطح تحته"),
        options: [
          { id: "white", label: bi("White floor", "أرضية بيضاء") },
          { id: "black", label: bi("Black tape", "شريط أسود") },
        ],
        initial: "white",
      },
      points: [
        bi(
          "A small **LED** emitter and a **photodiode or phototransistor** detector look at the same spot. Uses: object presence and distance, **line following**, wall tracking and **shaft encoding**.",
          "ينظر مُرسِل **LED** صغير وكاشف من نوع **الثنائي الضوئي (photodiode) أو الترانزستور الضوئي (phototransistor)** إلى البقعة نفسها. ومن استخداماته: اكتشاف وجود الأجسام ومسافتها، و**تتبّع الخطوط (line following)**، وتتبّع الجدران، و**ترميز دوران العمود (shaft encoding)**.",
        ),
        bi(
          "The reading depends on **surface colour, texture and ambient light**, so the threshold between line and floor has to be **calibrated** on the real surface.",
          "تعتمد القراءة على **لون السطح وملمسه والضوء المحيط**، لذا يجب **معايرة (calibration)** العتبة بين الخط والأرضية على السطح الحقيقي.",
        ),
      ],
      pointsFor: {
        white: [bi("Over the white floor most of the light comes back: a **high** reading.", "فوق الأرضية البيضاء يعود معظم الضوء: قراءة **مرتفعة**.")],
        black: [
          bi(
            "Over the black tape little light comes back: a **low** reading, below the threshold, so the robot knows it is on the line.",
            "فوق الشريط الأسود يعود قليل من الضوء: قراءة **منخفضة** دون العتبة، فيعرف الروبوت أنه فوق الخط.",
          ),
        ],
      },
    },
  ],
});

// ---------- Light sensors (LDR) ----------
export const ldr = defineWalkthrough({
  id: "rob3-ldr",
  title: bi("A resistance that follows the light", "مقاومة تتبع الضوء"),
  analogy: bi(
    "Window blinds for electric charge: the more light falls on the cell, the wider the blinds open and the easier current flows; in the dark they close and the resistance climbs.",
    "ستائر نافذة أمام الشحنة الكهربائية: كلما زاد الضوء الساقط على الخلية اتسعت فتحة الستائر وسهل مرور التيار، وفي الظلام تنغلق فترتفع المقاومة.",
  ),
  facts: { supply: SUPPLY, fixed: R_FIXED, bright: v.bright, dark: v.dark },
  panels: [
    {
      id: "resistance",
      pill: bi("Light and resistance", "الضوء والمقاومة"),
      heading: bi("Brighter light, lower resistance", "ضوء أشد، مقاومة أقل"),
      control: {
        label: bi("Light", "الضوء"),
        options: [
          { id: "bright", label: bi("Bright", "ساطع") },
          { id: "dim", label: bi("Dim", "خافت") },
          { id: "dark", label: bi("Dark", "مظلم") },
        ],
        initial: "bright",
      },
      points: [
        bi(
          "A **light-dependent resistor** is a variable resistor that changes with the light: brighter light gives a **lower** resistance, darker light a **higher** one (slide 43).",
          "**المقاومة المعتمدة على الضوء (light-dependent resistor)** مقاومة متغيرة تتغير مع الضوء: الضوء الأشد يعطي مقاومة **أقل**، والضوء الأخفت يعطي مقاومة **أعلى** (الشريحة 43).",
        ),
        bi(
          "Careful with the word **photocell**: slide 43 uses it for this resistor, while slide 29 uses it for a whole photoelectric switch.",
          "انتبه لكلمة **الخلية الضوئية (photocell)**: تستخدمها الشريحة 43 لهذه المقاومة، بينما تستخدمها الشريحة 29 لمفتاح كهروضوئي كامل.",
        ),
      ],
      pointsFor: {
        bright: [bi(`Bright: about **${LDR_K.bright} kΩ**, the page's bright value.`, `ساطع: نحو **${LDR_K.bright} kΩ**، وهي قيمة الضوء الساطع في الصفحة.`)],
        dim: [
          bi(
            `Dim: take a value in between, say **${LDR_K.dim} kΩ**. The range is so wide that it is drawn on a **log scale**, where ${LDR_K.dim} kΩ sits halfway.`,
            `خافت: خذ قيمة بين القيمتين، ولتكن **${LDR_K.dim} kΩ**. والمدى واسع جدًا لدرجة أنه يُرسم على **مقياس لوغاريتمي (log scale)**، تقع فيه القيمة ${LDR_K.dim} kΩ في المنتصف.`,
          ),
        ],
        dark: [bi(`Dark: about **${LDR_K.dark} kΩ**, a hundred times the bright value.`, `مظلم: نحو **${LDR_K.dark} kΩ**، أي مئة ضعف قيمة الضوء الساطع.`)],
      },
    },
    {
      id: "reading",
      pill: bi("Reading it", "قراءتها"),
      heading: bi("A voltage divider turns the resistance into a voltage", "مقسِّم الجهد يحوّل المقاومة إلى جهد"),
      control: {
        label: bi("Light", "الضوء"),
        options: [
          { id: "bright", label: bi("Bright", "ساطع") },
          { id: "dim", label: bi("Dim", "خافت") },
          { id: "dark", label: bi("Dark", "مظلم") },
        ],
        initial: "bright",
      },
      points: [
        bi(
          `Put the LDR (R₂) in series with a fixed **R₁ = ${R_FIXED} kΩ** across **${SUPPLY} V**: V_out = ${SUPPLY} · R₂ / (${R_FIXED} + R₂), read on an analog pin with analogRead (0–${ADC_MAX}).`,
          `ضع المقاومة الضوئية (R₂) على التوالي مع مقاومة ثابتة **R₁ = ${R_FIXED} kΩ** عبر **${SUPPLY} V**: V_out = ${SUPPLY} · R₂ / (${R_FIXED} + R₂)، وتُقرأ على طرف تناظري بالدالة analogRead (0–${ADC_MAX}).`,
        ),
      ],
      pointsFor: {
        bright: [
          bi(
            `Bright, R₂ = ${LDR_K.bright} kΩ: ${SUPPLY} · ${LDR_K.bright}/${R_FIXED + LDR_K.bright} ≈ **${v.bright} V**, so analogRead ≈ ${count.bright}.`,
            `ساطع، R₂ = ${LDR_K.bright} kΩ: ${SUPPLY} · ${LDR_K.bright}/${R_FIXED + LDR_K.bright} ≈ **${v.bright} V**، فتكون analogRead ≈ ${count.bright}.`,
          ),
        ],
        dim: [
          bi(
            `Dim, R₂ = ${LDR_K.dim} kΩ: two equal resistors split the supply in half, **${v.dim} V** (≈ ${count.dim}). The divider is most sensitive where the fixed resistor matches the sensor (book p. 98).`,
            `خافت، R₂ = ${LDR_K.dim} kΩ: مقاومتان متساويتان تقسمان جهد التغذية نصفين، **${v.dim} V** (≈ ${count.dim}). ويكون المقسِّم في أعلى حساسية حين تساوي المقاومة الثابتة مقاومة المستشعر تقريبًا (الكتاب، ص 98).`,
          ),
        ],
        dark: [
          bi(
            `Dark, R₂ = ${LDR_K.dark} kΩ: ${SUPPLY} · ${LDR_K.dark}/${R_FIXED + LDR_K.dark} ≈ **${v.dark} V** (≈ ${count.dark}). The output **rises** as it gets darker.`,
            `مظلم، R₂ = ${LDR_K.dark} kΩ: ${SUPPLY} · ${LDR_K.dark}/${R_FIXED + LDR_K.dark} ≈ **${v.dark} V** (≈ ${count.dark}). فـ**يرتفع** الخرج كلما ازداد الظلام.`,
          ),
        ],
      },
    },
    {
      id: "swap",
      pill: bi("Swap the resistors", "بدّل المقاومتين"),
      heading: bi("The resistor you measure across sets the direction", "المقاومة التي تقيس عبرها تحدد الاتجاه"),
      control: {
        label: bi("Output across", "الخرج عبر"),
        options: [
          { id: "ldr", label: bi("The LDR", "المقاومة الضوئية") },
          { id: "fixed", label: bi("The fixed resistor", "المقاومة الثابتة") },
        ],
        initial: "ldr",
      },
      points: [
        bi(
          `Both resistors carry the same current, so their two voltages always add up to the ${SUPPLY} V supply.`,
          `تمر في المقاومتين شدة التيار نفسها، لذا يكون مجموع جهديهما دائمًا مساويًا لجهد التغذية ${SUPPLY} V.`,
        ),
      ],
      pointsFor: {
        ldr: [
          bi(
            `Across the LDR: **${v.bright} V** bright, **${v.dark} V** dark. The reading rises in the dark.`,
            `عبر المقاومة الضوئية: **${v.bright} V** في الضوء الساطع، و **${v.dark} V** في الظلام. فترتفع القراءة في الظلام.`,
          ),
        ],
        fixed: [
          bi(
            `Across the fixed resistor: **${v.brightFixed} V** bright, **${v.darkFixed} V** dark. The reading rises with light, as in the book's Example 5.1, where ${BOOK_LDR_K.bright} kΩ and ${BOOK_LDR_K.dark} kΩ give ${v.bookBright} V and ${v.bookDark} V.`,
            `عبر المقاومة الثابتة: **${v.brightFixed} V** في الضوء الساطع، و **${v.darkFixed} V** في الظلام. فترتفع القراءة مع الضوء، كما في المثال 5.1 في الكتاب، حيث تعطي ${BOOK_LDR_K.bright} kΩ و ${BOOK_LDR_K.dark} kΩ القيمتين ${v.bookBright} V و ${v.bookDark} V.`,
          ),
        ],
      },
    },
    {
      id: "shielding",
      pill: bi("Shielding and direction", "التدريع والاتجاه"),
      heading: bi("An LDR sees every light in the room", "المقاومة الضوئية ترى كل ضوء في الغرفة"),
      control: {
        label: bi("Mounting", "التركيب"),
        options: [
          { id: "bare", label: bi("Bare", "مكشوفة") },
          { id: "tube", label: bi("In a tube", "داخل أنبوب") },
          { id: "pair", label: bi("Two cells", "خليتان") },
        ],
        initial: "bare",
      },
      points: [
        bi(
          "An LDR reports only **how much** light arrives, not where it came from, so **shielding, position and direction** matter a lot (slide 43).",
          "لا تُبلغ المقاومة الضوئية إلا عن **كمية** الضوء الواصل، لا عن مصدره، لذا فإن **تدريع الخلية وموضعها واتجاهها** أمور مهمة جدًا (الشريحة 43).",
        ),
      ],
      pointsFor: {
        bare: [
          bi(
            "Bare and flush-mounted, it responds to the lamp it should track, but also to the ceiling lights, a window and people's shadows.",
            "إذا كانت مكشوفة ومثبتة على السطح فإنها تستجيب للمصباح الذي يجب أن تتتبعه، ولكن أيضًا لأضواء السقف والنافذة وظلال الأشخاص.",
          ),
        ],
        tube: [
          bi(
            "Recessed in a **tube**, its field of view narrows to the lamp in front, and light from above is rejected.",
            "إذا غُرست داخل **أنبوب** ضاق مجال رؤيتها إلى المصباح الذي أمامها، ورُفض الضوء القادم من أعلى.",
          ),
        ],
        pair: [
          bi(
            "**Two cells**, compared: room light changes both equally and cancels in the difference, so a light-seeking robot turns toward the brighter side (book p. 109).",
            "**خليتان** تُقارَن قراءتاهما: يغيّر ضوء الغرفة القراءتين بالقدر نفسه فيُلغى في الفرق، فيستدير الروبوت الباحث عن الضوء نحو الجانب الأسطع (الكتاب، ص 109).",
          ),
        ],
      },
    },
  ],
});

// ---------- Potentiometers ----------
const p90 = pot(90);
const p180 = pot(180);
const p270 = pot(THETA_MAX);
export const potentiometer = defineWalkthrough({
  id: "rob3-potentiometer",
  title: bi("A wiper on a resistive track", "ماسحة على مسار مقاومي"),
  analogy: bi(
    "The volume knob on a stereo: turn it and the wiper slides along the track, and the voltage it picks up tells you exactly where the knob is.",
    "مقبض الصوت في جهاز الاستريو: أدِره فتنزلق الماسحة على المسار، والجهد الذي تلتقطه يخبرك بموضع المقبض بالضبط.",
  ),
  facts: { max: THETA_MAX, adc: ADC_MAX, step: show(POT_STEP) },
  panels: [
    {
      id: "track",
      pill: bi("Track and wiper", "المسار والماسحة"),
      heading: bi("Three terminals: two ends and a wiper", "ثلاثة أطراف: طرفان وماسحة"),
      control: {
        label: bi("Form", "الشكل"),
        options: [
          { id: "rotary", label: bi("Rotary", "دوّار") },
          { id: "linear", label: bi("Linear", "خطي") },
        ],
        initial: "rotary",
      },
      points: [
        bi(
          "A **potentiometer** (pot) is a resistive track with a sliding **wiper**, like a stereo's volume knob. The two ends go across the supply, and the wiper (the centre tap on slide 45) picks off part of it.",
          "**مقياس الجهد (potentiometer)** («pot») مسار مقاومي عليه **ماسحة (wiper)** منزلقة، مثل مقبض الصوت في جهاز الاستريو. يُوصَل الطرفان بين طرفَي التغذية، وتلتقط الماسحة (الطرف الأوسط في الشريحة 45) جزءًا منها.",
        ),
        bi(
          "The track from one end to the wiper is a fraction of the whole, so the wiper voltage is that same fraction of the supply: a voltage divider whose ratio is the **position**.",
          "المسار من أحد الطرفين حتى الماسحة جزء من المسار كله، لذا يكون جهد الماسحة الجزء نفسه من جهد التغذية: فهو مقسِّم جهد نسبته هي **الموضع**.",
        ),
      ],
      pointsFor: {
        rotary: [bi(`**Rotary**: the wiper follows the shaft angle, here over **${THETA_MAX}°**.`, `**الدوّار (rotary)**: تتبع الماسحة زاوية العمود، وهي هنا على مدى **${THETA_MAX}°**.`)],
        linear: [bi("**Linear**: the wiper follows the straight-line position of a slider.", "**الخطي (linear)**: تتبع الماسحة موضع منزلق على خط مستقيم.")],
      },
    },
    {
      id: "angle",
      pill: bi("Angle → voltage", "الزاوية ← الجهد"),
      heading: bi("The wiper voltage is proportional to the angle", "جهد الماسحة يتناسب مع الزاوية"),
      control: {
        label: bi("Shaft angle", "زاوية العمود"),
        options: [
          { id: "a0", label: bi("0°", "0°") },
          { id: "a90", label: bi("90°", "90°") },
          { id: "a180", label: bi("180°", "180°") },
          { id: "a270", label: bi(`${THETA_MAX}°`, `${THETA_MAX}°`) },
        ],
        initial: "a180",
      },
      points: [
        bi(
          `With ${SUPPLY} V across the track, V_wiper = ${SUPPLY} V · θ / ${THETA_MAX}°: a straight line from 0 V to ${SUPPLY} V.`,
          `مع ${SUPPLY} V على المسار: V_wiper = ${SUPPLY} V · θ / ${THETA_MAX}°، أي خط مستقيم من 0 V إلى ${SUPPLY} V.`,
        ),
        bi(
          "The pot is **absolute**: at switch-on the voltage already says where the shaft is, with no homing (book p. 109).",
          "ومقياس الجهد **مطلق (absolute)**: فعند التشغيل يحدد الجهد موضع العمود مباشرةً، دون حاجة إلى العودة إلى الموضع المرجعي (homing) (الكتاب، ص 109).",
        ),
      ],
      pointsFor: {
        a0: [bi("θ = 0°: **0 V**, analogRead = 0.", "θ = 0°: **0 V**، و analogRead = 0.")],
        a90: [bi(`θ = 90°: ${SUPPLY} · 90/${THETA_MAX} ≈ **${p90.v} V**, analogRead ≈ ${p90.count}.`, `θ = 90°: ${SUPPLY} · 90/${THETA_MAX} ≈ **${p90.v} V**، و analogRead ≈ ${p90.count}.`)],
        a180: [bi(`θ = 180°: ≈ **${p180.v} V**, analogRead ≈ ${p180.count}.`, `θ = 180°: ≈ **${p180.v} V**، و analogRead ≈ ${p180.count}.`)],
        a270: [bi(`θ = ${THETA_MAX}°: the full **${p270.v} V**, analogRead = ${p270.count}.`, `θ = ${THETA_MAX}°: الجهد الكامل **${p270.v} V**، و analogRead = ${p270.count}.`)],
      },
    },
    {
      id: "resolution",
      pill: bi("Back to an angle", "العودة إلى الزاوية"),
      heading: bi("Software turns the count back into degrees", "البرنامج يعيد العدد إلى درجات"),
      points: [
        bi(
          `The page's sketch computes angle = analogRead × ${THETA_MAX} / ${ADC_MAX}, so a count of ${p180.count} becomes ${show(angleOf(p180.count), 1)}°.`,
          `يحسب برنامج الصفحة angle = analogRead × ${THETA_MAX} / ${ADC_MAX}، فيصبح العدد ${p180.count} زاوية ${show(angleOf(p180.count), 1)}°.`,
        ),
        bi(
          `One count is ${THETA_MAX}° / ${ADC_MAX} ≈ **${show(POT_STEP)}°**, so the converter limits the resolution. The sliding wiper also wears and gets noisy, and the travel is less than one turn (book p. 109).`,
          `العدد الواحد يساوي ${THETA_MAX}° / ${ADC_MAX} ≈ **${show(POT_STEP)}°**، فالمحوِّل هو ما يحدّ دقة التمييز (resolution). كما أن الماسحة المنزلقة تبلى وتصبح مصدرًا للضوضاء، والمشوار أقل من دورة واحدة (الكتاب، ص 109).`,
        ),
      ],
    },
    {
      id: "servo",
      pill: bi("Inside a servo", "داخل محرك السيرفو"),
      heading: bi("The pot closes the loop in a servo motor", "مقياس الجهد يُغلق الحلقة في محرك السيرفو"),
      points: [
        bi(
          "A hobby **servo** holds a motor, a gear train, a control circuit and a pot on the output shaft.",
          "يضم **محرك السيرفو (servo)** المستخدم في الهوايات محركًا، ومجموعة تروس، ودائرة تحكم، ومقياس جهد على عمود الخرج.",
        ),
        bi(
          "The pot reports the **actual** angle, the circuit compares it with the **commanded** angle, and the motor turns until the two agree: **closed-loop** control (book p. 109).",
          "يُبلغ مقياس الجهد عن الزاوية **الفعلية**، وتقارنها الدائرة بالزاوية **المطلوبة**، ويدور المحرك حتى تتطابقا: إنه تحكم **بالحلقة المغلقة (closed-loop)** (الكتاب، ص 109).",
        ),
      ],
    },
  ],
});

// ---------- Application: the GuideCane ----------
export const guideCane = defineWalkthrough({
  id: "rob3-guidecane",
  title: bi("Sense, decide, steer, follow", "استشعِر، قرِّر، وجِّه، اتبع"),
  analogy: bi(
    "A guide dog: it notices the obstacle and chooses a way round, and the person simply feels the harness turn and follows.",
    "الكلب المرشد: يلاحظ العائق ويختار طريقًا للالتفاف حوله، وما على الشخص إلا أن يشعر بانعطاف الحزام فيتبعه.",
  ),
  panels: [
    {
      id: "device",
      pill: bi("The device", "الجهاز"),
      heading: bi("A cane with a sensing, steering head", "عصا برأس يستشعر ويوجِّه"),
      points: [
        bi(
          "A wheeled **sensor head** rolls ahead of the user at the end of the cane. A fan of **ultrasonic (sonar)** sensors looks ahead, with more sonars facing up and to the sides (slide 47).",
          "يتدحرج **رأس استشعار** ذو عجلات أمام المستخدم في طرف العصا، وتنظر مجموعة مروحية من مستشعرات **فوق صوتية (sonar)** إلى الأمام، ومعها مستشعرات سونار أخرى موجهة إلى أعلى وإلى الجانبين (الشريحة 47).",
        ),
        bi(
          "A **steering servo** turns the guide wheels, a **fluxgate compass** and wheel **encoders** track heading and distance, and a thumb **joystick** on the handle sets the direction the user wants (slide 46).",
          "يدير **محرك سيرفو للتوجيه (steering servo)** عجلات التوجيه، وتتتبع **بوصلة فلكسغيت (fluxgate compass)** و**مُرمِّزات (encoders)** العجلات الاتجاهَ والمسافة، وتحدد **عصا تحكم (joystick)** يشغّلها الإبهام على المقبض الاتجاهَ الذي يريده المستخدم (الشريحة 46).",
        ),
      ],
    },
    {
      id: "loop",
      pill: bi("The loop", "الحلقة"),
      heading: bi("Sonar sees it, the servo steers, the user follows", "السونار يراه، والسيرفو يوجِّه، والمستخدم يتبع"),
      points: [
        bi(
          "**Step 1**: the sonars see an obstacle. **Step 2**: the controller chooses a way round and the servo steers the guide wheels. **Step 3**: the user feels the cane turn and follows (slide 47).",
          "**الخطوة 1**: ترى مستشعرات السونار عائقًا. **الخطوة 2**: يختار المتحكِّم طريقًا للالتفاف حوله ويوجّه السيرفو عجلات التوجيه. **الخطوة 3**: يشعر المستخدم بانعطاف العصا فيتبعها (الشريحة 47).",
        ),
        bi(
          "The decision reaches the user as a **steering motion** in the handle, not as a beep or a voice, so it needs no interpretation and no learning (book p. 110).",
          "يصل القرار إلى المستخدم في صورة **حركة توجيه** في المقبض، لا صفير ولا صوت، فلا يحتاج إلى تفسير ولا إلى تعلّم (الكتاب، ص 110).",
        ),
      ],
    },
    {
      id: "fan",
      pill: bi("A fan of simple sensors", "مجموعة من المستشعرات البسيطة"),
      heading: bi("Each sonar answers one question: how far, in this direction?", "كل سونار يجيب عن سؤال واحد: كم المسافة في هذا الاتجاه؟"),
      control: {
        label: bi("Obstacle", "العائق"),
        options: [
          { id: "clear", label: bi("None", "لا يوجد") },
          { id: "left", label: bi("Ahead-left", "أمامًا يسارًا") },
          { id: "right", label: bi("Ahead-right", "أمامًا يمينًا") },
        ],
        initial: "left",
      },
      points: [
        bi(
          "Each sonar reports only the **distance** to the nearest echo in its own direction; together they map the free space ahead, with no camera and no scene understanding.",
          "لا يُبلغ كل سونار إلا عن **المسافة** إلى أقرب صدى في اتجاهه، ومعًا ترسم المستشعرات الفضاء الخالي أمام المستخدم، دون كاميرا ودون فهمٍ للمشهد.",
        ),
        bi(
          "The controller uses them to compute a way around the obstacle (book p. 110). This drawing uses a simple rule for that: keep the user's direction while it is clear, otherwise take the nearest clear beam.",
          "ويستخدمها المتحكِّم لحساب طريق للالتفاف حول العائق (الكتاب، ص 110). ويستخدم هذا الرسم قاعدة بسيطة لذلك: حافظ على اتجاه المستخدم ما دام خاليًا، وإلا فاتبع أقرب شعاع خالٍ.",
        ),
      ],
      pointsFor: {
        clear: [bi("No obstacle: every echo comes back from far away, so the head keeps straight on.", "لا عائق: تعود كل الأصداء من مسافة بعيدة، فيواصل الرأس السير مستقيمًا.")],
        left: [bi("Obstacle ahead-left: the beams ahead and to the left come back short, so the head steers **right**.", "عائق أمامًا يسارًا: تعود الأشعة الأمامية واليسرى من مسافة قصيرة، فينعطف الرأس **يمينًا**.")],
        right: [bi("Obstacle ahead-right: the beams ahead and to the right come back short, so the head steers **left**.", "عائق أمامًا يمينًا: تعود الأشعة الأمامية واليمنى من مسافة قصيرة، فينعطف الرأس **يسارًا**.")],
      },
    },
    {
      id: "inference",
      pill: bi("What was the world like?", "كيف كان العالم؟"),
      heading: bi("An echo, or the lack of one, can mislead", "الصدى، أو غيابه، قد يضلِّل"),
      control: {
        label: bi("In front", "في الأمام"),
        options: [
          { id: "wall", label: bi("A wall", "جدار") },
          { id: "angled", label: bi("A smooth slanted surface", "سطح أملس مائل") },
          { id: "branch", label: bi("A low branch", "غصن منخفض") },
        ],
        initial: "wall",
      },
      points: [
        bi(
          "The general question comes back: a reading may be a wall, a parked car, a branch the sonars cannot see, or a **specular** reflection that reports nothing where a smooth surface exists (book p. 110).",
          "يعود السؤال العام: فقد تكون القراءة جدارًا، أو سيارة متوقفة، أو غصنًا لا تراه مستشعرات السونار، أو **انعكاسًا مرآويًا (specular)** لا يُبلغ عن شيء مع وجود سطح أملس (الكتاب، ص 110).",
        ),
      ],
      pointsFor: {
        wall: [bi("A wall facing the beam sends the echo straight back: the reading is right.", "الجدار المواجه للشعاع يعيد الصدى مباشرةً: فالقراءة صحيحة.")],
        angled: [
          bi(
            "A smooth surface at an angle reflects the sound away, like a mirror. No echo returns, and the sonar reports **open space** where there is an obstacle.",
            "السطح الأملس المائل يعكس الصوت بعيدًا مثل المرآة، فلا يعود صدى، ويُبلغ السونار عن **فضاء خالٍ** حيث يوجد عائق.",
          ),
        ],
        branch: [
          bi(
            "A branch above the forward beams reflects nothing back to them, so the path looks clear at their height. The book counts a low branch among the obstacles the sensors **cannot see** (p. 110).",
            "الغصن الواقع فوق الأشعة الأمامية لا يعكس إليها شيئًا، فيبدو المسار خاليًا عند ارتفاعها. ويعدّ الكتاب الغصن المنخفض من العوائق التي **لا تراها** المستشعرات (ص 110).",
          ),
        ],
      },
    },
  ],
});

/** Every walkthrough in this lecture, registered in lib/walkthroughs/index.ts. */
export const all = [whatIsSensor, limitSwitch, proximity, photoelectric, ldr, potentiometer, guideCane] as const;

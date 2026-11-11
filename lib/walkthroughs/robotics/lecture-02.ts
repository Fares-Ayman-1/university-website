import { bi } from "@/components/widgets/types";
import { defineWalkthrough } from "@/lib/widgets/walkthrough";
import {
  AXIS_MM,
  DATASHEET,
  FREE_BODY,
  GEARED,
  PLANAR,
  RAIL,
  REVOLUTE,
  SCARA_WRIST,
  SIX_AXIS,
  TCP,
  codeOf,
  configOf,
  dofOf,
  encoder,
  linearVsRotary,
  movingJoints,
  reach,
} from "@/lib/widgets/rob-lecture-02";

/*
 * Robotics · Lecture 2 (content/subjects/robotics/lectures/02-industrial-robotic-arm.mdx).
 * One walkthrough per heading; the scenes are in
 * components/widgets/walkthrough/scenes/robotics/lecture-02/. Every number in the text is
 * computed in lib/widgets/rob-lecture-02.ts, and the page's `expect` checks the facts.
 */

// ---------- The industrial robotic arm ----------
export const arm = defineWalkthrough({
  id: "rob2-arm",
  title: bi("From a black box to a robotic system", "من الصندوق الأسود إلى النظام الروبوتي"),
  analogy: bi(
    "A workshop with one skilled worker: the order comes in, the worker reads the job sheet, the hands do the work with whichever tool fits, and the eyes check the result. Hand the worker a different tool and the same hands do a different job.",
    "ورشة فيها عامل ماهر واحد: يصل الطلب، فيقرأ العامل ورقة العمل، وتنجز يداه العمل بالأداة المناسبة، وتتحقق عيناه من النتيجة. وإذا أعطيته أداة أخرى أنجزت اليدان نفسهما عملًا مختلفًا.",
  ),
  panels: [
    {
      id: "black-box",
      pill: bi("A black box", "صندوق أسود"),
      heading: bi("Directions in, work out", "توجيهات تدخل، وعمل يخرج"),
      points: [
        bi(
          "Seen from outside, a robot system takes **human directions** as its input and turns them into **many types of work done automatically**.",
          "من الخارج، يأخذ النظام الروبوتي **توجيهات البشر** مدخلاتٍ له، ويحوّلها إلى **أنواع كثيرة من العمل تُنجَز آليًا**.",
        ),
        bi(
          "The book adds two more inputs: the **state of the environment**, reported by the sensors, and **energy** from the power supply.",
          "ويضيف الكتاب مدخلين آخرين: **حالة البيئة** التي تنقلها المستشعرات (sensors)، و**الطاقة** القادمة من مصدر الطاقة.",
        ),
      ],
    },
    {
      id: "system",
      pill: bi("Open the box", "افتح الصندوق"),
      heading: bi("The parts of a robotic system", "أجزاء النظام الروبوتي"),
      points: [
        bi(
          "The **controller** sits in the middle: it takes the program from the **teach pendant** or **program storage**, reads the **sensors**, and commands the **mechanical arm**.",
          "يقع **المتحكِّم (controller)** في المنتصف: يأخذ البرنامج من **لوحة التعليم (teach pendant)** أو من **تخزين البرامج**، ويقرأ **المستشعرات (sensors)**، ويصدر الأوامر إلى **الذراع الميكانيكية**.",
        ),
        bi(
          "The **power supply** feeds the arm, and the **end-of-arm tooling** is the only part that touches the work.",
          "يغذّي **مصدر الطاقة** الذراع، و**أدوات نهاية الذراع (end-of-arm tooling)** هي الجزء الوحيد الذي يلامس العمل.",
        ),
      ],
    },
    {
      id: "jobs",
      pill: bi("One arm, many jobs", "ذراع واحدة لأعمال كثيرة"),
      heading: bi("The tool decides the job", "الأداة تحدد العمل"),
      control: {
        label: bi("Job", "العمل"),
        options: [
          { id: "weld", label: bi("Weld", "لحام") },
          { id: "paint", label: bi("Paint", "طلاء") },
          { id: "assemble", label: bi("Assemble", "تجميع") },
          { id: "palletise", label: bi("Palletise", "رصّ المنصات") },
        ],
        initial: "weld",
      },
      points: [
        bi(
          "An industrial robot (a **manipulator** or **robotic arm**) is a fixed base, a chain of rigid links joined by powered joints, and a wrist that carries a tool.",
          "الروبوت الصناعي (ويُسمّى **الذراع الآلية (manipulator)** أو **الذراع الروبوتية (robotic arm)**) قاعدة ثابتة، وسلسلة من الوصلات (links) الصلبة تربطها مفاصل (joints) تُديرها محركات، ومعصم (wrist) يحمل أداة.",
        ),
      ],
      pointsFor: {
        weld: [
          bi(
            "**Welding**: a torch on the wrist follows the seam. Spot welding drove the first large-scale use of robots in car factories.",
            "**اللحام**: يتتبع مشعل لحام مثبّت على المعصم خطَّ اللحام. وقد كان اللحام النقطي (spot welding) وراء أول استخدام واسع للروبوتات في مصانع السيارات.",
          ),
        ],
        paint: [bi("**Painting**: a spray gun sweeps a smooth, continuous path over the panel.", "**الطلاء**: يمرّ مسدس رش على مسار متصل وسلس فوق اللوح.")],
        assemble: [bi("**Assembly**: a gripper picks a part and inserts it into another.", "**التجميع**: يلتقط قابض (gripper) قطعة ويُدخلها في قطعة أخرى.")],
        palletise: [
          bi(
            "**Palletising**: boxes are lifted off a conveyor and stacked in layers on a pallet.",
            "**رصّ المنصات (palletising)**: تُرفع الصناديق عن سير ناقل وتُرصّ في طبقات على منصة.",
          ),
        ],
      },
    },
    {
      id: "network",
      pill: bi("Networked robots", "الروبوتات الشبكية"),
      heading: bi("A robot on a network", "روبوت على شبكة"),
      control: {
        label: bi("Protocol", "البروتوكول"),
        options: [
          { id: "tcp", label: bi("TCP", "TCP") },
          { id: "udp", label: bi("UDP", "UDP") },
        ],
        initial: "tcp",
      },
      points: [
        bi(
          "A **networked robot** is connected to a wired or wireless network (a LAN or the Internet), so it can be supervised remotely, coordinated with other machines, and its data (cycle times, faults) collected centrally.",
          "**الروبوت الشبكي (networked robot)** متصل بشبكة سلكية أو لاسلكية (LAN أو الإنترنت)، فيمكن الإشراف عليه عن بُعد، وتنسيق عمله مع الآلات الأخرى، وجمع بياناته (أزمنة الدورات والأعطال) مركزيًا.",
        ),
        bi(
          "The **emergency stop** never depends on the network: safety circuits are hard-wired or use a certified safety bus.",
          "**إيقاف الطوارئ (emergency stop)** لا يعتمد على الشبكة أبدًا: فدوائر السلامة موصولة بأسلاك مباشرة (hard-wired) أو تستخدم ناقل سلامة معتمدًا (certified safety bus).",
        ),
      ],
      pointsFor: {
        tcp: [
          bi(
            "**TCP** delivers every packet, in order: a lost packet is sent again, so it arrives **late**. That suits program downloads and logs.",
            "يوصل **TCP** كل حزمة وبالترتيب: فالحزمة المفقودة تُرسَل مرة أخرى، فتصل **متأخرة**. وهذا يناسب تنزيل البرامج والسجلات.",
          ),
        ],
        udp: [
          bi(
            "**UDP** never waits: a lost packet is simply gone and the next one is used. For live joint commands, late data can be worse than missing data.",
            "لا ينتظر **UDP** أبدًا: فالحزمة المفقودة تضيع ببساطة وتُستخدم الحزمة التالية. وفي أوامر المفاصل الحية قد تكون البيانات المتأخرة أسوأ من البيانات المفقودة.",
          ),
        ],
      },
    },
  ],
});

// ---------- Specifying performance ----------
const enc = { b8: encoder("b8"), b12: encoder("b12"), b16: encoder("b16") };

export const performance = defineWalkthrough({
  id: "rob2-performance",
  title: bi("Accuracy, repeatability and resolution", "الدقة والتكرارية والاستبانة"),
  analogy: bi(
    "A darts player: accuracy is how close the darts land to the bullseye, repeatability is how tightly they group, and resolution is the finest mark on the ruler used to aim.",
    "لاعب سهام: الدقة هي مدى قرب السهام من مركز الهدف، والتكرارية هي مدى تقارب السهام بعضها من بعض، والاستبانة هي أدق علامة على المسطرة المستخدمة في التصويب.",
  ),
  facts: {
    res8: enc.b8.label,
    res12: enc.b12.label,
    res16: enc.b16.label,
    states12: enc.b12.states,
    states16: enc.b16.states,
    repeat: DATASHEET.repeatability,
    accuracy: DATASHEET.accuracy,
  },
  panels: [
    {
      id: "dartboard",
      pill: bi("Two different questions", "سؤالان مختلفان"),
      heading: bi("Where does the tool land?", "أين يستقر طرف الأداة؟"),
      control: {
        label: bi("Robot", "الروبوت"),
        options: [
          { id: "tight-off", label: bi("Repeatable, not accurate", "متكرر لكنه غير دقيق") },
          { id: "wide-on", label: bi("Accurate on average", "دقيق في المتوسط") },
          { id: "tight-on", label: bi("Both", "الاثنان معًا") },
          { id: "wide-off", label: bi("Neither", "لا هذا ولا ذاك") },
        ],
        initial: "tight-off",
      },
      points: [
        bi(
          "Send the tool to the same point ten times and mark each landing. **Accuracy** is how close the landings come to the **given point**; **repeatability** is how close the robot can return to a **previously taught point**, so how tightly the landings group.",
          "أرسل الأداة إلى النقطة نفسها عشر مرات وعلِّم موضع كل وصول. **الدقة (accuracy)** هي مدى اقتراب نقاط الوصول من **النقطة المعيّنة**، و**التكرارية (repeatability)** هي مدى قدرة الروبوت على العودة إلى **نقطة سبق تعليمها**، أي مدى تقارب نقاط الوصول بعضها من بعض.",
        ),
      ],
      pointsFor: {
        "tight-off": [
          bi(
            "A tight group away from the target: **high repeatability, low accuracy**. This is the usual state of an industrial robot.",
            "مجموعة متقاربة بعيدة عن الهدف: **تكرارية عالية ودقة منخفضة**. وهذه هي الحالة المعتادة للروبوت الصناعي.",
          ),
        ],
        "wide-on": [
          bi(
            "Centred on the target but scattered: the average is right, but **repeatability is poor**, so no single landing can be trusted.",
            "متمركزة حول الهدف لكنها متشتتة: المتوسط صحيح، لكن **التكرارية ضعيفة**، فلا يمكن الوثوق بأي وصول بمفرده.",
          ),
        ],
        "tight-on": [bi("Tight and on target: **accurate and repeatable**.", "متقاربة وعلى الهدف: **دقيق ومتكرر**.")],
        "wide-off": [bi("Scattered and off target: **neither** accurate nor repeatable.", "متشتتة وبعيدة عن الهدف: **لا دقيق ولا متكرر**.")],
      },
    },
    {
      id: "errors",
      pill: bi("Why repeatability is better", "لماذا التكرارية أفضل"),
      heading: bi("A calculated point or a taught one", "نقطة محسوبة أم نقطة مُعلَّمة"),
      control: {
        label: bi("Go to", "الذهاب إلى"),
        options: [
          { id: "cad", label: bi("A CAD coordinate", "إحداثي من CAD") },
          { id: "taught", label: bi("A taught point", "نقطة مُعلَّمة") },
        ],
        initial: "cad",
      },
      points: [
        bi(
          "Accuracy is limited by **computational errors**, **machining accuracy**, **flexibility** of the links, **gear backlash** and **static and dynamic effects** (friction, gravity, heat, inertia).",
          "تحدّ الدقةَ **أخطاءُ الحساب**، و**دقةُ التشغيل الآلي (machining)**، و**مرونةُ** الوصلات، و**الخلوصُ في التروس (gear backlash)**، و**التأثيراتُ الساكنة والديناميكية** (الاحتكاك والجاذبية والحرارة والقصور الذاتي).",
        ),
      ],
      pointsFor: {
        cad: [
          bi(
            "Sent to a coordinate calculated from a drawing, the robot carries every one of these errors to the tool. Robots programmed **offline** from CAD need **accuracy**.",
            "عند إرسال الروبوت إلى إحداثي محسوب من رسم هندسي، تنتقل كل هذه الأخطاء إلى الأداة. لذا تحتاج الروبوتات المبرمجة **دون اتصال (offline)** انطلاقًا من CAD إلى **الدقة**.",
          ),
        ],
        taught: [
          bi(
            `Sent back to the joint values stored when it was taught, the robot meets the same errors on every visit, so they cancel; what remains is mainly the **controller's resolution**. That is why repeatability is usually far better: ±${DATASHEET.repeatability} mm repeatability may come with only ±${DATASHEET.accuracy} mm accuracy.`,
            `عند إعادة الروبوت إلى قيم المفاصل التي خُزّنت أثناء التعليم، يواجه الأخطاء نفسها في كل زيارة فتلغي بعضها؛ ولا يبقى أساسًا إلا **استبانة المتحكِّم (controller)**. ولهذا تكون التكرارية عادةً أفضل بكثير: فتكرارية ±${DATASHEET.repeatability} مم قد تصاحبها دقة ±${DATASHEET.accuracy} مم فقط.`,
          ),
        ],
      },
    },
    {
      id: "calibrate",
      pill: bi("Calibration", "المعايرة"),
      heading: bi("An offset can be calibrated out; scatter cannot", "الإزاحة تُزال بالمعايرة، أما التشتت فلا"),
      control: {
        label: bi("Robot", "الروبوت"),
        options: [
          { id: "tight", label: bi("Tight group", "مجموعة متقاربة") },
          { id: "wide", label: bi("Wide scatter", "تشتت واسع") },
        ],
        initial: "tight",
      },
      points: [
        bi(
          "**Calibration** corrects the robot's model of itself, which shifts every landing by the same amount.",
          "**المعايرة (calibration)** تصحح النموذج الذي يحمله الروبوت عن نفسه، فتُزيح كل نقاط الوصول بالمقدار نفسه.",
        ),
      ],
      pointsFor: {
        tight: [
          bi(
            "The tight group moves onto the target: calibration turns a **repeatable** robot into an **accurate** one.",
            "تنتقل المجموعة المتقاربة إلى الهدف: فالمعايرة تحوّل الروبوت **المتكرر** إلى روبوت **دقيق**.",
          ),
        ],
        wide: [
          bi(
            "The scatter moves too, but stays just as wide: calibration cannot rescue a robot whose **repeatability** is poor.",
            "ينتقل التشتت أيضًا لكنه يبقى بالاتساع نفسه: فالمعايرة لا تنقذ روبوتًا **تكراريته** ضعيفة.",
          ),
        ],
      },
    },
    {
      id: "resolution",
      pill: bi("Resolution", "الاستبانة"),
      heading: bi("Total distance ÷ 2ⁿ", "المسافة الكلية ÷ 2ⁿ"),
      control: {
        label: bi("Encoder", "المُرمِّز"),
        options: [
          { id: "b8", label: bi("8-bit", "8 بت") },
          { id: "b12", label: bi("12-bit", "12 بت") },
          { id: "b16", label: bi("16-bit", "16 بت") },
        ],
        initial: "b12",
      },
      points: [
        bi(
          "**Resolution** is the smallest increment of motion the controller can sense. An n-bit encoder tells apart 2ⁿ positions over the total distance travelled, so resolution = distance ÷ 2ⁿ.",
          "**الاستبانة (resolution)** هي أصغر زيادة في الحركة يستطيع المتحكِّم استشعارها. فالمُرمِّز (encoder) ذو n بت يميّز 2ⁿ موضعًا على المسافة الكلية المقطوعة، لذا فإن الاستبانة = المسافة ÷ 2ⁿ.",
        ),
        bi(
          "The plot shows what the controller senses over the first 1 mm of travel: the sensed position only rises in whole steps.",
          "يوضح الرسم ما يستشعره المتحكِّم خلال أول 1 مم من الحركة: فالموضع المُستشعَر لا يرتفع إلا بخطوات كاملة.",
        ),
      ],
      pointsFor: {
        b8: [
          bi(
            `${AXIS_MM} mm ÷ 2⁸ = ${AXIS_MM} ÷ ${enc.b8.states} ≈ **${enc.b8.label} mm**: a whole millimetre of motion goes unseen.`,
            `${AXIS_MM} مم ÷ 2⁸ = ${AXIS_MM} ÷ ${enc.b8.states} ≈ **${enc.b8.label} مم**: فلا يُرى مليمتر كامل من الحركة.`,
          ),
        ],
        b12: [
          bi(
            `${AXIS_MM} mm ÷ 2¹² = ${AXIS_MM} ÷ ${enc.b12.states} ≈ **${enc.b12.label} mm**, the worked example. Resolution is a floor under repeatability: this axis could never honestly be quoted at ±${DATASHEET.repeatability} mm.`,
            `${AXIS_MM} مم ÷ 2¹² = ${AXIS_MM} ÷ ${enc.b12.states} ≈ **${enc.b12.label} مم**، وهو المثال المحلول. والاستبانة حدٌّ أدنى للتكرارية: فلا يصح أبدًا أن تُذكر لهذا المحور تكرارية ±${DATASHEET.repeatability} مم.`,
          ),
        ],
        b16: [
          bi(
            `${AXIS_MM} mm ÷ 2¹⁶ = ${AXIS_MM} ÷ ${enc.b16.states} ≈ **${enc.b16.label} mm**: the staircase is almost a straight line.`,
            `${AXIS_MM} مم ÷ 2¹⁶ = ${AXIS_MM} ÷ ${enc.b16.states} ≈ **${enc.b16.label} مم**: فيكاد الدرج يصبح خطًا مستقيمًا.`,
          ),
        ],
      },
    },
  ],
});

// ---------- Robot components ----------
export const components = defineWalkthrough({
  id: "rob2-components",
  title: bi("The parts of an industrial robot", "أجزاء الروبوت الصناعي"),
  analogy: bi(
    "A human worker: the pedestal is the waist, the gripper is the hand, the actuators are the muscles, the controller is the brain, and electricity, compressed air or pressurised fluid is the food.",
    "عامل بشري: القاعدة الحاملة هي الخصر، والقابض هو اليد، والمشغِّلات هي العضلات، والمتحكِّم هو الدماغ، والكهرباء أو الهواء المضغوط أو السائل المضغوط هي الغذاء.",
  ),
  panels: [
    {
      id: "anatomy",
      pill: bi("Body parts", "أعضاء الجسم"),
      heading: bi("The manipulator, from the floor up", "الذراع الآلية من الأرض إلى الأعلى"),
      points: [
        bi(
          "The **pedestal** (the waist) supports the manipulator and acts as a **counterbalance** when the arm swings.",
          "**القاعدة الحاملة (pedestal)** (الخصر) تحمل الذراع الآلية وتعمل **ثقلًا موازنًا** عندما تتأرجح الذراع.",
        ),
        bi(
          "The **manipulator** is the base plus its appendages: the **shoulder**, the **arm** and the **gripper**. The wrist orients the tool, and the **end effector** (the hand), on the last joint, holds the part or the tool.",
          "**الذراع الآلية (manipulator)** هي القاعدة مع ملحقاتها: **الكتف** و**الذراع** و**القابض (gripper)**. ويوجّه المعصم (wrist) الأداة، أما **المؤثِّر النهائي (end effector)** (اليد) المثبّت على آخر مفصل فيمسك القطعة أو الأداة.",
        ),
      ],
    },
    {
      id: "brain",
      pill: bi("Muscles, senses, brain", "العضلات والحواس والدماغ"),
      heading: bi("Where the joints should be, and getting them there", "أين يجب أن تكون المفاصل، وكيف تصل إلى هناك"),
      control: {
        label: bi("Who answers?", "من يجيب؟"),
        options: [
          { id: "processor", label: bi("Processor", "المعالج") },
          { id: "controller", label: bi("Controller", "المتحكِّم") },
        ],
        initial: "processor",
      },
      points: [
        bi(
          "**Actuators** (servo motors, stepper motors, pneumatic or hydraulic cylinders) are the muscles: one drives each joint. **Sensors** report the joints' positions and the world back to the controller.",
          "**المشغِّلات (actuators)** (محركات السيرفو، والمحركات الخطوية (stepper)، والأسطوانات الهوائية أو الهيدروليكية) هي العضلات: يُدير كلٌّ منها مفصلًا واحدًا. أما **المستشعرات (sensors)** فتنقل إلى المتحكِّم مواضع المفاصل وحالة العالم المحيط.",
        ),
      ],
      pointsFor: {
        processor: [
          bi(
            "The **processor** answers a geometric question: which joint values put the tool here, and through which values should the joints pass? A processor error puts the tool in the **wrong place**.",
            "يجيب **المعالج (processor)** عن سؤال هندسي: ما قيم المفاصل التي تضع الأداة هنا، وعبر أي قيم يجب أن تمر المفاصل؟ وخطأ المعالج يضع الأداة في **المكان الخطأ**.",
          ),
        ],
        controller: [
          bi(
            "The **controller** (the brain) answers a dynamic question: what current must flow **now** so this joint reaches its setpoint against gravity and load? It also issues instructions, controls peripheral devices, and interfaces with the robot and with humans. A controller error makes an axis **oscillate, lag or overshoot**.",
            "يجيب **المتحكِّم (controller)** (الدماغ) عن سؤال ديناميكي: ما التيار الذي يجب أن يمر **الآن** كي يصل هذا المفصل إلى قيمته المطلوبة (setpoint) رغم الجاذبية والحمل؟ وهو أيضًا يُصدر التعليمات، ويتحكم في الأجهزة الطرفية، ويتواصل مع الروبوت ومع البشر. وخطأ المتحكِّم يجعل المحور **يتذبذب أو يتأخر أو يتجاوز هدفه**.",
          ),
        ],
      },
    },
    {
      id: "power",
      pill: bi("The food", "الغذاء"),
      heading: bi("Three power sources", "ثلاثة مصادر للطاقة"),
      control: {
        label: bi("Power", "الطاقة"),
        options: [
          { id: "electric", label: bi("Electric", "كهربائية") },
          { id: "pneumatic", label: bi("Pneumatic", "هوائية") },
          { id: "hydraulic", label: bi("Hydraulic", "هيدروليكية") },
        ],
        initial: "electric",
      },
      points: [
        bi(
          "The power source is the robot's food: **electric**, **pneumatic** (compressed air) or **hydraulic** (pressurised fluid).",
          "مصدر الطاقة هو غذاء الروبوت: **كهربائي**، أو **هوائي (pneumatic)** (هواء مضغوط)، أو **هيدروليكي** (سائل مضغوط).",
        ),
      ],
      pointsFor: {
        electric: [
          bi(
            "**Electric** motors are clean, efficient and precise, and easy to control with feedback: they drive most robot joints.",
            "المحركات **الكهربائية** نظيفة وكفؤة ودقيقة، ويسهل التحكم فيها بالتغذية الراجعة (feedback): لذا تُدير معظم مفاصل الروبوتات.",
          ),
        ],
        pneumatic: [
          bi(
            "**Pneumatic** air is simple, fast and cheap, but air compresses, so stopping at an arbitrary position is hard. It suits grippers that are just open or closed.",
            "الهواء **المضغوط (pneumatic)** بسيط وسريع ورخيص، لكن الهواء ينضغط، فيصعب التوقف عند موضع اعتباطي. لذا يناسب القوابض (grippers) التي تكون إما مفتوحة وإما مغلقة.",
          ),
        ],
        hydraulic: [
          bi(
            "**Hydraulic** fluid gives very high force for its size, at the cost of leaks, noise and heat: it drives heavy-payload arms.",
            "السائل **الهيدروليكي** يعطي قوة عالية جدًا بالنسبة إلى حجمه، لكن على حساب التسرّب والضوضاء والحرارة: لذا يُدير الأذرع ذات الحمولة (payload) الثقيلة.",
          ),
        ],
      },
    },
    {
      id: "hand",
      pill: bi("The hand", "اليد"),
      heading: bi("End effectors hold the part, or hold the tool", "المؤثِّرات النهائية تمسك القطعة أو تمسك الأداة"),
      control: {
        label: bi("End effector", "المؤثِّر النهائي"),
        options: [
          { id: "gripper", label: bi("Gripper", "قابض") },
          { id: "vacuum", label: bi("Vacuum head", "رأس شفط") },
          { id: "welding", label: bi("Welding torch", "مشعل لحام") },
          { id: "spray", label: bi("Spray gun", "مسدس رش") },
        ],
        initial: "gripper",
      },
      points: [
        bi(
          "The end effector is attached to the **last joint**. It either **holds the part** while work is done on it, or **holds the tool** that does the work.",
          "يُثبَّت المؤثِّر النهائي (end effector) على **آخر مفصل**. وهو إما **يمسك القطعة** أثناء العمل عليها، وإما **يمسك الأداة** التي تؤدي العمل.",
        ),
      ],
      pointsFor: {
        gripper: [
          bi(
            "**Mechanical gripper**: two or more fingers close on the part. General-purpose and strong, but the fingers are usually shaped for one part.",
            "**القابض الميكانيكي (gripper)**: يُطبق إصبعان أو أكثر على القطعة. وهو متعدد الأغراض وقوي، لكن أصابعه تُصمَّم عادةً لقطعة بعينها.",
          ),
        ],
        vacuum: [
          bi(
            "**Vacuum head**: a suction cup on a smooth, clean, flat face. Fast and light, but it fails on porous or lattice surfaces and drops the load if the air fails.",
            "**رأس الشفط (vacuum head)**: كأس شفط على وجه أملس ونظيف ومستوٍ. وهو سريع وخفيف، لكنه يفشل مع الأسطح المسامية أو الشبكية، ويُسقط الحمل إذا انقطع الهواء.",
          ),
        ],
        welding: [
          bi(
            "**Welding attachment**: the robot holds a torch and presents it along the seam; the end effector is a tool, not a hand.",
            "**ملحق اللحام**: يمسك الروبوت مشعلًا ويمرّره على خط اللحام؛ فالمؤثِّر النهائي هنا أداة وليس يدًا.",
          ),
        ],
        spray: [
          bi(
            "**Spray-paint attachment**: the path must be smooth and continuous, in an atmosphere that can catch fire.",
            "**ملحق الطلاء بالرش**: يجب أن يكون المسار سلسًا ومتصلًا، في جوٍّ قابل للاشتعال.",
          ),
        ],
      },
    },
  ],
});

// ---------- Degrees of freedom (DOF) ----------
const dof = {
  rail: dofOf(RAIL.slide),
  railTurn: dofOf(RAIL.slideTurn),
  freeBody: FREE_BODY.length,
  six: dofOf(SIX_AXIS),
  scara: dofOf(SCARA_WRIST),
};

export const degrees = defineWalkthrough({
  id: "rob2-dof",
  title: bi("Counting degrees of freedom", "عدّ درجات الحرية"),
  analogy: bi(
    "Telling a friend where to hold a picture on the wall: two numbers say where, a third says how far from the wall, and three more say how it is tilted. Every number you have to give is one degree of freedom.",
    "أن تخبر صديقًا أين يمسك لوحة على الجدار: رقمان يحددان المكان، وثالث يحدد بُعدها عن الجدار، وثلاثة أخرى تحدد ميلها. وكل رقم تضطر إلى ذكره درجة حرية واحدة.",
  ),
  facts: { rail: dof.rail, railTurn: dof.railTurn, freeBody: dof.freeBody, six: dof.six, scara: dof.scara, geared: GEARED.independent },
  panels: [
    {
      id: "rail",
      pill: bi("Count the motions", "عُدّ الحركات"),
      heading: bi("A block on a rail", "كتلة على قضيب"),
      control: {
        label: bi("Allowed", "المسموح"),
        options: [
          { id: "slide", label: bi("Slide", "انزلاق") },
          { id: "slide-turn", label: bi("Slide + turn", "انزلاق + دوران") },
        ],
        initial: "slide",
      },
      points: [
        bi(
          "**Degrees of freedom (DOF)** are the number of independent position variables needed to locate every part of a mechanism, that is, the number of independent motions it can make.",
          "**درجات الحرية (DOF)** هي عدد متغيرات الموضع المستقلة اللازمة لتعيين موضع كل جزء من أجزاء الآلية، أي عدد الحركات المستقلة التي تستطيع القيام بها.",
        ),
      ],
      pointsFor: {
        slide: [bi(`Sliding along the rail: one number, the distance d, fixes the block: **${dof.rail} DOF**.`, `الانزلاق على القضيب: رقم واحد، هو المسافة d، يحدد موضع الكتلة: **درجة حرية واحدة (${dof.rail} DOF)**.`)],
        "slide-turn": [
          bi(
            `Sliding and turning about the rail: a distance d and an angle θ, two independent numbers, so **${dof.railTurn} DOF**, like a drill that turns while it advances.`,
            `الانزلاق مع الدوران حول القضيب: مسافة d وزاوية θ، أي رقمان مستقلان، فتكون **درجتا حرية (${dof.railTurn} DOF)**، مثل المثقاب الذي يدور وهو يتقدم.`,
          ),
        ],
      },
    },
    {
      id: "free-body",
      pill: bi("A free body", "جسم حر"),
      heading: bi("Six numbers place a body in space", "ستة أرقام تحدد موضع جسم في الفضاء"),
      points: [
        bi(
          `A free rigid body in space has **${dof.freeBody} DOF**: three **translations** along x, y and z, and three **rotations** about x, y and z.`,
          `للجسم الصلب الحر في الفضاء **${dof.freeBody} درجات حرية**: ثلاث **إزاحات (translations)** على امتداد x و y و z، وثلاثة **دورانات** حول x و y و z.`,
        ),
        bi(
          "The three translations say **where** the body is (its position); the three rotations say **which way it faces** (its orientation).",
          "تحدد الإزاحات الثلاث **أين** يقع الجسم (موضعه)، وتحدد الدورانات الثلاثة **إلى أين يتجه** (اتجاهه (orientation)).",
        ),
      ],
    },
    {
      id: "arm",
      pill: bi("One DOF per joint", "درجة حرية لكل مفصل"),
      heading: bi("Position from the arm, orientation from the wrist", "الموضع من الذراع، والاتجاه من المعصم"),
      control: {
        label: bi("Robot", "الروبوت"),
        options: [
          { id: "six", label: bi("6-axis arm", "ذراع بستة محاور") },
          { id: "scara", label: bi("SCARA + wrist", "SCARA مع معصم") },
        ],
        initial: "six",
      },
      points: [
        bi(
          "In most manipulators the DOF equal the **number of joints**: each joint adds one independent motion.",
          "في معظم الأذرع الآلية (manipulators) تساوي درجات الحرية **عدد المفاصل**: فكل مفصل يضيف حركة مستقلة واحدة.",
        ),
      ],
      pointsFor: {
        six: [
          bi(
            `Count the joints as they light up: **${dof.six} DOF**. The first three (waist, shoulder, elbow) set the wrist's **position**; the last three (roll, pitch, yaw) set the tool's **orientation**, so the tool can take any position with any orientation.`,
            `عُدّ المفاصل وهي تضيء: **${dof.six} درجات حرية**. تحدد المفاصل الثلاثة الأولى (الخصر والكتف والمرفق) **موضع** المعصم، وتحدد الثلاثة الأخيرة (اللفّ والميل والانعراج) **اتجاه** الأداة، فتستطيع الأداة أن تأخذ أي موضع بأي اتجاه.`,
          ),
        ],
        scara: [
          bi(
            `2 revolute + 1 prismatic + 1 wrist roll = **${dof.scara} DOF**. With no pitch or yaw the tool can only turn about the vertical, which is all that pick-and-place on a flat surface needs.`,
            `2 دوّار + 1 منزلق + 1 لفّ للمعصم = **${dof.scara} درجات حرية**. ودون ميل (pitch) أو انعراج (yaw) لا تستطيع الأداة أن تدور إلا حول المحور الرأسي، وهذا كل ما يحتاجه الالتقاط والوضع (pick-and-place) على سطح مستوٍ.`,
          ),
        ],
      },
    },
    {
      id: "wrist",
      pill: bi("Roll, pitch, yaw", "اللفّ والميل والانعراج"),
      heading: bi("The wrist's three rotations", "دورانات المعصم الثلاثة"),
      control: {
        label: bi("Rotation", "الدوران"),
        options: [
          { id: "roll", label: bi("Roll", "اللفّ") },
          { id: "pitch", label: bi("Pitch", "الميل") },
          { id: "yaw", label: bi("Yaw", "الانعراج") },
        ],
        initial: "roll",
      },
      points: [
        bi(
          "Think of the tool as a screwdriver held in the hand: the wrist turns it about three perpendicular axes.",
          "تخيّل الأداة مفكًّا (screwdriver) في اليد: يديره المعصم (wrist) حول ثلاثة محاور متعامدة.",
        ),
      ],
      pointsFor: {
        roll: [bi("**Roll**: rotation of the wrist about the arm axis, like twisting the screwdriver to drive a screw.", "**اللفّ (roll)**: دوران المعصم حول محور الذراع، مثل لفّ المفك لربط برغي.")],
        pitch: [bi("**Pitch**: up–down rotation of the wrist, tipping the tip towards the ceiling.", "**الميل (pitch)**: دوران المعصم لأعلى ولأسفل، أي رفع طرف المفك نحو السقف.")],
        yaw: [bi("**Yaw**: left–right rotation of the wrist, swinging the tip sideways without tipping it.", "**الانعراج (yaw)**: دوران المعصم يمينًا ويسارًا، أي تحريك الطرف جانبيًا دون رفعه.")],
      },
    },
    {
      id: "independent",
      pill: bi("Independent motions", "حركات مستقلة"),
      heading: bi("Joints that must move together count once", "المفاصل التي يجب أن تتحرك معًا تُعدّ مرة واحدة"),
      control: {
        label: bi("Joints", "المفاصل"),
        options: [
          { id: "free", label: bi("Free", "حرة") },
          { id: "geared", label: bi("Geared together", "مربوطة بتروس") },
        ],
        initial: "free",
      },
      points: [
        bi(
          "The key word is **independent**: count the motions that can happen on their own, not the joints or the motors.",
          "الكلمة المفتاحية هي **مستقلة**: عُدّ الحركات التي يمكن أن تحدث وحدها، لا المفاصل ولا المحركات.",
        ),
      ],
      pointsFor: {
        free: [bi(`Each of the ${GEARED.joints} joints moves on its own, so two angles are needed: **${GEARED.joints} DOF**.`, `يتحرك كل مفصل من المفصلين وحده، فنحتاج إلى زاويتين: **درجتا حرية (${GEARED.joints} DOF)**.`)],
        geared: [
          bi(
            `Gear the second angle to be always ${GEARED.ratio} times the first: one angle now fixes everything, so **${GEARED.independent} DOF** even with ${GEARED.joints} joints.`,
            `اربط الزاوية الثانية بتروس لتكون دائمًا ${GEARED.ratio} أمثال الأولى: فتكفي الآن زاوية واحدة لتحديد كل شيء، أي **درجة حرية واحدة (${GEARED.independent} DOF)** رغم وجود مفصلين.`,
          ),
        ],
      },
    },
  ],
});

// ---------- Links and joints ----------
export const joints = defineWalkthrough({
  id: "rob2-joints",
  title: bi("Links, joints and how they move", "الوصلات والمفاصل وكيف تتحرك"),
  analogy: bi(
    "Your own arm: the bones are links, the elbow is a revolute joint, and a telescopic selfie stick would be a prismatic one.",
    "ذراعك أنت: العظام وصلات، والمرفق مفصل دوّار، أما عصا التصوير التلسكوبية فهي مفصل منزلق.",
  ),
  facts: { linear: linearVsRotary.linear, angle: linearVsRotary.angle, near: linearVsRotary.near, far: linearVsRotary.far },
  panels: [
    {
      id: "types",
      pill: bi("Joint types", "أنواع المفاصل"),
      heading: bi("Rotate, slide, or bend", "دوران أم انزلاق أم انثناء"),
      control: {
        label: bi("Joint", "المفصل"),
        options: [
          { id: "R", label: bi("Revolute (R)", "دوّار (R)") },
          { id: "P", label: bi("Prismatic (P)", "منزلق (P)") },
          { id: "U", label: bi("Universal", "عام (universal)") },
        ],
        initial: "R",
      },
      points: [
        bi(
          "A **joint** is the point of articulation between two **links** (rigid bodies): it lets the next link move relative to the one before it.",
          "**المفصل (joint)** هو نقطة التمفصل بين **وصلتين (links)** (جسمين صلبين): فهو يسمح للوصلة التالية بالحركة بالنسبة إلى الوصلة التي قبلها.",
        ),
      ],
      pointsFor: {
        R: [
          bi(
            "**Revolute (R)**: relative **rotation about a single axis**; its variable is an angle θ. It is usually driven electrically by a servo or stepper motor.",
            "**الدوّار (R)**: **دوران نسبي حول محور واحد**؛ ومتغيره زاوية θ. ويُدار عادةً كهربائيًا بمحرك سيرفو أو محرك خطوي (stepper).",
          ),
        ],
        P: [
          bi(
            "**Prismatic (P)**: relative **translation along a single axis**, with no rotation; its variable is a distance d. It is often driven by a hydraulic or pneumatic cylinder.",
            "**المنزلق (P)**: **إزاحة (translation) نسبية على امتداد محور واحد** دون دوران؛ ومتغيره مسافة d. وغالبًا ما تُديره أسطوانة هيدروليكية أو هوائية (pneumatic).",
          ),
        ],
        U: [
          bi(
            "**Universal joint**: lets a rigid rod bend in any direction, two rotations, so **2 DOF**. In robots it is usually **passive**: it carries drive to the wrist, or sits at the ends of a parallel robot's legs.",
            "**المفصل العام (universal joint)**: يتيح لقضيب صلب أن ينثني في أي اتجاه، بدورانين، أي **درجتا حرية**. وهو في الروبوتات **غير مُدار (passive)** عادةً: ينقل الحركة إلى المعصم، أو يوجد عند طرفي أرجل الروبوت المتوازي.",
          ),
        ],
      },
    },
    {
      id: "chain",
      pill: bi("Numbering", "الترقيم"),
      heading: bi("A chain of links, numbered from the base", "سلسلة من الوصلات مرقّمة من القاعدة"),
      points: [
        bi(
          "A manipulator is a **chain of rigid links** connected by joints, fixed to a base at one end and free to move at the other.",
          "الذراع الآلية (manipulator) **سلسلة من الوصلات الصلبة** تربطها مفاصل، مثبّتة بقاعدة من أحد طرفيها وحرّة الحركة من الطرف الآخر.",
        ),
        bi(
          "The base is **link 0**, and **joint i connects links i − 1 and i**. There is **no joint at the end effector**, and each joint–link pair adds **one DOF**.",
          "القاعدة هي **الوصلة 0**، و**المفصل i يربط الوصلتين i − 1 و i**. و**لا يوجد مفصل عند المؤثِّر النهائي (end effector)**، ويضيف كل زوج من مفصل ووصلة **درجة حرية واحدة**.",
        ),
      ],
    },
    {
      id: "resolution",
      pill: bi("Linear vs rotary resolution", "استبانة الحركة الخطية والدورانية"),
      heading: bi("An angle step grows with reach", "خطوة الزاوية تكبر مع طول الذراع"),
      control: {
        label: bi("Axis", "المحور"),
        options: [
          { id: "P", label: bi("Prismatic", "منزلق") },
          { id: "R-near", label: bi("Revolute, tool at 0.5 m", "دوّار، الأداة على بُعد 0.5 م") },
          { id: "R-far", label: bi("Revolute, tool at 1.2 m", "دوّار، الأداة على بُعد 1.2 م") },
        ],
        initial: "P",
      },
      points: [
        bi(
          `Give both axes the same **${REVOLUTE.bits}-bit** encoder: 2¹² = 4096 steps over the whole travel.`,
          `أعطِ المحورين المُرمِّز (encoder) نفسه ذا **${REVOLUTE.bits} بت**: أي 2¹² = 4096 خطوة على كامل المدى.`,
        ),
      ],
      pointsFor: {
        P: [
          bi(
            `A ${AXIS_MM} mm prismatic axis senses ${AXIS_MM} ÷ 4096 ≈ **${linearVsRotary.linear} mm**, the same at every point of its travel.`,
            `المحور المنزلق بطول ${AXIS_MM} مم يستشعر ${AXIS_MM} ÷ 4096 ≈ **${linearVsRotary.linear} مم**، وهي القيمة نفسها عند كل نقطة من مداه.`,
          ),
        ],
        "R-near": [
          bi(
            `A revolute joint turning ${REVOLUTE.sweep}° senses ${REVOLUTE.sweep}° ÷ 4096 ≈ ${linearVsRotary.angle}°. At the tool that angle is an arc s = rθ (θ in radians): at 0.5 m, **${linearVsRotary.near} mm**.`,
            `المفصل الدوّار الذي يدور ${REVOLUTE.sweep}° يستشعر ${REVOLUTE.sweep}° ÷ 4096 ≈ ${linearVsRotary.angle}°. وعند الأداة تصبح هذه الزاوية قوسًا s = rθ (حيث θ بالراديان): فعلى بُعد 0.5 م يساوي **${linearVsRotary.near} مم**.`,
          ),
        ],
        "R-far": [
          bi(
            `The same ${linearVsRotary.angle}° at 1.2 m sweeps **${linearVsRotary.far} mm**: a long arm magnifies its own measurement error, which is why prismatic axes typically have **higher resolution**.`,
            `والزاوية نفسها ${linearVsRotary.angle}° على بُعد 1.2 م تقطع **${linearVsRotary.far} مم**: فالذراع الطويلة تُكبّر خطأ قياسها، ولهذا تكون للمحاور المنزلقة عادةً **استبانة أعلى**.`,
          ),
        ],
      },
    },
    {
      id: "coupling",
      pill: bi("Coupling", "الاقتران"),
      heading: bi("One joint, how many tool coordinates?", "مفصل واحد، كم إحداثيًا للأداة يغيّر؟"),
      control: {
        label: bi("Move", "حرّك"),
        options: [
          { id: "P", label: bi("A prismatic x axis", "محور x منزلق") },
          { id: "R", label: bi("A revolute shoulder", "كتف دوّار") },
        ],
        initial: "P",
      },
      points: [
        bi(
          "Rotational axes cause strong **kinematic and dynamic coupling** between the links, so errors accumulate and control is harder.",
          "تسبب المحاور الدورانية **اقترانًا (coupling) حركيًا وديناميكيًا** قويًا بين الوصلات، فتتراكم الأخطاء ويصعب التحكم.",
        ),
      ],
      pointsFor: {
        P: [
          bi(
            "Move the x slide of a Cartesian robot: **only x changes**, and y stays put. Errors of the three axes simply add up.",
            "حرّك منزلق x في روبوت كارتيزي: **يتغير x وحده** ويبقى y ثابتًا. وأخطاء المحاور الثلاثة تُجمَع ببساطة.",
          ),
        ],
        R: [
          bi(
            "Turn the shoulder of an articulated arm: the tool moves in **x and y at once**, and any angle error is multiplied by the whole length of the arm.",
            "أدِر كتف ذراع مفصلية (articulated): تتحرك الأداة في **x و y معًا**، وأي خطأ في الزاوية يتضاعف بطول الذراع كله.",
          ),
        ],
      },
    },
  ],
});

// ---------- Reference frames ----------
const oneJoint = movingJoints("joint");

export const frames = defineWalkthrough({
  id: "rob2-frames",
  title: bi("Three frames for one jog key", "ثلاثة أطر لزر تحريك واحد"),
  analogy: bi(
    "Directions to a person: “walk north” is the world frame, “bend your left knee” is the joint frame, and “step forward”, whichever way you face, is the tool frame.",
    "توجيه شخص: «امشِ نحو الشمال» هو إطار العالم، و«اثنِ ركبتك اليسرى» هو إطار المفاصل، و«تقدّم خطوة إلى الأمام» أيًّا كان اتجاهك هو إطار الأداة.",
  ),
  facts: { oneJoint },
  panels: [
    {
      id: "frames",
      pill: bi("Three frames", "ثلاثة أطر"),
      heading: bi("World, joint and tool", "العالم والمفاصل والأداة"),
      points: [
        bi(
          "A position means nothing until you say which axes it is measured along. Robot controllers offer three **reference frames**.",
          "لا معنى للموضع ما لم تذكر المحاور التي يُقاس عليها. وتوفر متحكِّمات الروبوتات ثلاثة **أطر مرجعية (reference frames)**.",
        ),
        bi(
          "The **world frame** (x, y, z) is fixed to the base or the cell; the **joint frame** is each joint's own axis; the **tool frame** (x′, y′, z′) is attached to the hand and moves with it.",
          "**إطار العالم (world frame)** (x, y, z) مثبّت على القاعدة أو الخلية؛ و**إطار المفاصل (joint frame)** هو محور كل مفصل بعينه؛ و**إطار الأداة (tool frame)** (x′, y′, z′) مثبّت على اليد ويتحرك معها.",
        ),
      ],
    },
    {
      id: "jog",
      pill: bi("Jog in each frame", "التحريك في كل إطار"),
      heading: bi("Press “+” and watch the joints", "اضغط «+» وراقب المفاصل"),
      control: {
        label: bi("Frame", "الإطار"),
        options: [
          { id: "world", label: bi("World", "العالم") },
          { id: "joint", label: bi("Joint", "المفاصل") },
          { id: "tool", label: bi("Tool", "الأداة") },
        ],
        initial: "world",
      },
      points: [bi("The same jog key gives three different motions, depending on the frame.", "يعطي زر التحريك نفسه ثلاث حركات مختلفة بحسب الإطار المختار.")],
      pointsFor: {
        world: [
          bi(
            "**World +x**: the tool travels in a straight line along x, so the joints move **simultaneously**; the controller works out the mix from its model of the arm.",
            "**العالم +x**: تتحرك الأداة في خط مستقيم على امتداد x، لذا تتحرك المفاصل **في آنٍ واحد**؛ ويحسب المتحكِّم مقدار حركة كلٍّ منها من نموذجه الرياضي للذراع.",
          ),
        ],
        joint: [
          bi(
            "**Joint J2 +**: only **one joint** moves at a time. The tool swings along an arc, and no kinematic model is needed.",
            "**المفصل J2 +**: لا يتحرك إلا **مفصل واحد** في كل مرة. فتتأرجح الأداة على قوس، ولا حاجة إلى نموذج حركي (kinematic model).",
          ),
        ],
        tool: [
          bi(
            "**Tool +z′**: the tool advances along its own axis whatever the arm's pose, with **all joints** moving together: the natural way to approach a part straight on.",
            "**الأداة +z′**: تتقدم الأداة على امتداد محورها هي أيًّا كانت وضعية الذراع، مع تحرك **جميع المفاصل** معًا: وهي الطريقة الطبيعية للاقتراب من القطعة بشكل مستقيم مباشر.",
          ),
        ],
      },
    },
    {
      id: "uses",
      pill: bi("Which frame when?", "أي إطار ومتى؟"),
      heading: bi("Each frame has its jobs", "لكل إطار مهامه"),
      points: [
        bi(
          "**Joint** frame: the first jog on an unfamiliar robot, recovery after a collision, homing. It needs no model, so it cannot surprise you.",
          "إطار **المفاصل**: أول تحريك لروبوت غير مألوف، والاستعادة بعد تصادم، والعودة إلى الموضع المرجعي (homing). ولا يحتاج إلى نموذج رياضي، فلا يفاجئك أبدًا.",
        ),
        bi("**World** frame: positions in the cell, such as a fixture, the corner of a pallet or a conveyor.", "إطار **العالم**: المواضع داخل الخلية، مثل مثبّت (fixture)، أو ركن منصة، أو سير ناقل."),
        bi(
          "**Tool** frame: approach, retract, drilling, welding and insertion, all motions along the tool's own axis.",
          "إطار **الأداة**: الاقتراب، والتراجع، والثقب، واللحام، والإدخال، وكلها حركات على امتداد محور الأداة نفسها.",
        ),
      ],
    },
    {
      id: "tcp",
      pill: bi("Tool centre point", "نقطة مركز الأداة"),
      heading: bi("The tool frame's origin must be measured", "يجب قياس أصل إطار الأداة"),
      control: {
        label: bi("TCP setting", "ضبط TCP"),
        options: [
          { id: "right", label: bi("Correct", "صحيح") },
          { id: "wrong", label: bi(`${TCP.shortBy} mm too short`, `أقصر بمقدار ${TCP.shortBy} مم`) },
        ],
        initial: "right",
      },
      points: [
        bi(
          "The tool frame's origin, the **tool centre point (TCP)**, is entered into the controller: the tip of the torch, or the point between the gripper's fingers.",
          "يُدخَل أصل إطار الأداة، أي **نقطة مركز الأداة (TCP)**، إلى المتحكِّم: طرف المشعل، أو النقطة الواقعة بين أصابع القابض.",
        ),
      ],
      pointsFor: {
        right: [bi("Turn the wrist about the TCP: the tip **stays on the point** while the tool turns around it.", "أدِر المعصم حول نقطة TCP: يبقى الطرف **على النقطة** بينما تدور الأداة حولها.")],
        wrong: [
          bi(
            "With the TCP set short, the controller turns about the wrong point, so the real tip **swings along an arc** off the mark. Taught points still repeat; computed motions go wrong.",
            "إذا ضُبطت نقطة TCP أقصر من الحقيقة، يدور المتحكِّم حول نقطة خاطئة، فـ**يتأرجح** الطرف الحقيقي **على قوس** مبتعدًا عن العلامة. وتظل النقاط المُعلَّمة تتكرر، أما الحركات المحسوبة فتخطئ.",
          ),
        ],
      },
    },
  ],
});

// ---------- Workspace and configurations ----------
const code = (id: string) => codeOf(configOf(id).joints);

export const configurations = defineWalkthrough({
  id: "rob2-configurations",
  title: bi("Configurations and their workspaces", "التهيئات ومساحات عملها"),
  analogy: bi(
    "Coordinate systems built in metal: a Cartesian robot moves in x, y, z, a cylindrical one in θ, z, r, a spherical one in two angles and a distance, and the shape it can reach follows from them.",
    "أنظمة إحداثيات مصنوعة من المعدن: يتحرك الروبوت الكارتيزي في x و y و z، والأسطواني في θ و z و r، والكروي في زاويتين ومسافة، ويتبع ذلك شكلُ ما يستطيع الوصول إليه.",
  ),
  facts: {
    cartesian: code("cartesian"),
    cylindrical: code("cylindrical"),
    spherical: code("spherical"),
    articulated: code("articulated"),
    scara: code("scara"),
    outer: reach.outer,
    inner: reach.inner,
  },
  panels: [
    {
      id: "envelope",
      pill: bi("The workspace", "مساحة العمل"),
      heading: bi("Sweep every joint, keep what you reach", "حرّك كل مفصل عبر مداه، واحتفظ بما تصل إليه"),
      points: [
        bi(
          "The **workspace** (work envelope) is the collection of points the robot can reach. It depends on the configuration, the link sizes and the wrist joints.",
          "**مساحة العمل (workspace)** هي مجموعة النقاط التي يستطيع الروبوت الوصول إليها. وتعتمد على التهيئة (configuration)، وأطوال الوصلات، ومفاصل المعصم.",
        ),
        bi(
          `Found **empirically**: move each joint through its range, combine everything reached and **subtract** what cannot be reached. Seen from above, the two links of the book’s Laboratory 3 arm (about ${PLANAR.l1} and ${PLANAR.l2} mm) reach out to their sum, **${reach.outer} mm**, and in to their difference, **${reach.inner} mm**, around a dead zone.`,
          `ويمكن إيجادها **تجريبيًا**: حرّك كل مفصل عبر مداه، واجمع كل ما وصلت إليه، ثم **اطرح** ما لا يمكن الوصول إليه. فإذا نظرنا من أعلى، فإن وصلتي ذراع المعمل 3 في الكتاب (نحو ${PLANAR.l1} و ${PLANAR.l2} مم) تصلان إلى الخارج حتى مجموع طوليهما، **${reach.outer} مم**، وإلى الداخل حتى الفرق بينهما، **${reach.inner} مم**، حول منطقة ميتة (dead zone).`,
        ),
      ],
    },
    {
      id: "serial",
      pill: bi("Five serial configurations", "خمس تهيئات تسلسلية"),
      heading: bi("Named by the joints that position the wrist", "تُسمّى بالمفاصل التي تحدد موضع المعصم"),
      control: {
        label: bi("Configuration", "التهيئة"),
        options: [
          { id: "cartesian", label: bi("Cartesian", "كارتيزي") },
          { id: "cylindrical", label: bi("Cylindrical", "أسطواني") },
          { id: "spherical", label: bi("Spherical", "كروي") },
          { id: "articulated", label: bi("Articulated", "مفصلي") },
          { id: "scara", label: bi("SCARA", "SCARA") },
        ],
        initial: "cartesian",
      },
      points: [
        bi(
          "A configuration is named by its first three joints, read from the base: **P** for prismatic, **R** for revolute. The wrist joints that follow are left out of the name.",
          "تُسمّى التهيئة (configuration) بأول ثلاثة مفاصل فيها مقروءةً من القاعدة: **P** للمنزلق و**R** للدوّار. أما مفاصل المعصم التي تليها فلا تدخل في الاسم.",
        ),
      ],
      pointsFor: {
        cartesian: [
          bi(
            `**Cartesian / gantry (${code("cartesian")})**: three perpendicular slides along x, y and z. The workspace is a **rectangular box** with the same resolution everywhere; a gantry is a super-sized Cartesian robot with minimal deflection.`,
            `**الكارتيزي / الجسري (${code("cartesian")})**: ثلاثة منزلقات متعامدة على امتداد x و y و z. ومساحة العمل **صندوق مستطيل** له الاستبانة نفسها في كل مكان؛ والروبوت الجسري (gantry) روبوت كارتيزي ضخم جدًا ذو انحراف (deflection) ضئيل.`,
          ),
        ],
        cylindrical: [
          bi(
            `**Cylindrical (${code("cylindrical")})**: a base rotation θ, a vertical slide z and a radial slide r. The workspace is a **hollow cylinder**, with a dead zone around the column; the arm reaches straight into tight openings.`,
            `**الأسطواني (${code("cylindrical")})**: دوران للقاعدة θ، ومنزلق رأسي z، ومنزلق نصف قطري r. ومساحة العمل **أسطوانة مجوّفة** حول العمود منطقة ميتة؛ وتصل الذراع مباشرة إلى الفتحات الضيقة.`,
          ),
        ],
        spherical: [
          bi(
            `**Spherical / polar (${code("spherical")})**: a base rotation, an elevation and a telescoping link (polar coordinates). The workspace is a **thick spherical shell**, or a portion of one.`,
            `**الكروي / القطبي (${code("spherical")})**: دوران للقاعدة، وزاوية رفع، ووصلة تلسكوبية (إحداثيات قطبية). ومساحة العمل **قشرة كروية سميكة** أو جزء منها.`,
          ),
        ],
        articulated: [
          bi(
            `**Articulated / anthropomorphic (${code("articulated")})**: waist, shoulder and elbow, like a human arm. The workspace is **roughly spherical** with a hollow centre, the largest for its footprint, at the price of the most coupling.`,
            `**المفصلي / الشبيه بالإنسان (${code("articulated")})**: خصر وكتف ومرفق، مثل ذراع الإنسان. ومساحة العمل **كروية تقريبًا** ذات مركز مجوّف، وهي الأكبر مقارنةً بالمساحة التي يشغلها الروبوت، لكن ثمنها أكبر قدر من الاقتران (coupling).`,
          ),
        ],
        scara: [
          bi(
            `**SCARA (${code("scara")}, 2R1P)**: two parallel revolute joints move the arm in a horizontal plane and a prismatic joint moves vertically. The workspace is a **ring-shaped region pushed up into a cylinder**: stiff vertically, compliant horizontally, ideal for assembly.`,
            `**روبوت SCARA (${code("scara")}، 2R1P)**: مفصلان دوّاران متوازيان يحرّكان الذراع في مستوى أفقي، ومفصل منزلق يتحرك رأسيًا. ومساحة العمل **منطقة حلقية ممتدة رأسيًا على هيئة أسطوانة**: صلب رأسيًا ومَرِن أفقيًا (compliant)، ومثالي للتجميع.`,
          ),
        ],
      },
    },
    {
      id: "rrp",
      pill: bi("Same letters, two robots", "الحروف نفسها لروبوتين"),
      heading: bi("Spherical and SCARA are both RRP", "الكروي و SCARA كلاهما RRP"),
      control: {
        label: bi("Robot", "الروبوت"),
        options: [
          { id: "spherical", label: bi("Spherical", "كروي") },
          { id: "scara", label: bi("SCARA", "SCARA") },
        ],
        initial: "spherical",
      },
      points: [
        bi(
          "The letter code lists the joint **types**, not the directions of their axes, so two quite different robots can share it.",
          "يذكر الرمز الحرفي **أنواع** المفاصل لا اتجاهات محاورها، لذا قد يشترك فيه روبوتان مختلفان تمامًا.",
        ),
      ],
      pointsFor: {
        spherical: [
          bi(
            "**Spherical**: the second R axis is **horizontal**, perpendicular to the first, so it tilts the arm up and down, and the P slides **along the arm**.",
            "**الكروي**: محور المفصل R الثاني **أفقي** ومتعامد مع الأول، فهو يرفع الذراع ويخفضها، ويتحرك المفصل P **على امتداد الذراع**.",
          ),
        ],
        scara: [
          bi(
            "**SCARA**: both R axes are **vertical and parallel**, so the arm stays in a horizontal plane, and the P moves **up and down**.",
            "**روبوت SCARA**: محورا المفصلين R **رأسيان ومتوازيان**، فتبقى الذراع في مستوى أفقي، ويتحرك المفصل P **لأعلى ولأسفل**.",
          ),
        ],
      },
    },
    {
      id: "parallel",
      pill: bi("Parallel robots", "الروبوتات المتوازية"),
      heading: bi("Several legs share one platform", "عدة أرجل تتقاسم منصة واحدة"),
      control: {
        label: bi("Structure", "البنية"),
        options: [
          { id: "serial", label: bi("Serial arm", "ذراع تسلسلية") },
          { id: "parallel", label: bi("Parallel robot", "روبوت متوازٍ") },
        ],
        initial: "parallel",
      },
      points: [
        bi(
          "A **parallel robot** connects a platform to a fixed base by several legs that all act at once.",
          "**الروبوت المتوازي (parallel robot)** يصل منصة بقاعدة ثابتة عبر عدة أرجل تعمل كلها في آنٍ واحد.",
        ),
      ],
      pointsFor: {
        serial: [
          bi(
            "A **serial** arm is one chain: every joint carries all the links beyond it. That gives a large workspace, but the errors and the bending add up along the chain.",
            "الذراع **التسلسلية** سلسلة واحدة: يحمل كل مفصل جميع الوصلات التي بعده. وهذا يعطي مساحة عمل كبيرة، لكن الأخطاء والانحناء تتراكم على امتداد السلسلة.",
          ),
        ],
        parallel: [
          bi(
            "The legs share the load and push along their length, so a parallel robot is **very stiff and fast**, but its **workspace is small**: flight simulators and delta pick-and-place robots.",
            "تتقاسم الأرجل الحمل وتدفع على امتداد طولها، لذا يكون الروبوت المتوازي **صلبًا جدًا وسريعًا**، لكن **مساحة عمله صغيرة**: كأجهزة محاكاة الطيران وروبوتات الالتقاط والوضع من نوع delta.",
          ),
        ],
      },
    },
  ],
});

/** Every walkthrough in this lecture, registered in lib/walkthroughs/index.ts. */
export const all = [arm, performance, components, degrees, joints, frames, configurations] as const;

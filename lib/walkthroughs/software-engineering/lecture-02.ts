import { bi } from "@/components/widgets/types";
import { defineWalkthrough } from "@/lib/widgets/walkthrough";

/*
 * Software Engineering · Lecture 2 (content/subjects/software-engineering/lectures/02-software-processes.mdx).
 * One walkthrough per heading; the scenes are in
 * components/widgets/walkthrough/scenes/software-engineering/lecture-02/.
 */

// ---------- The software process ----------
export const softwareProcess = defineWalkthrough({
  id: "se2-process",
  title: bi("The software process", "عملية البرمجيات"),
  analogy: bi(
    "Cooking: every cook decides the dish, cooks it, tastes it and adjusts the recipe next time. A banquet caterer plans the whole menu weeks ahead; a home cook decides course by course.",
    "الطبخ: كل طاهٍ يحدد الطبق ويطهوه ويتذوقه ثم يعدّل الوصفة في المرة التالية. متعهد الولائم يخطط القائمة كلها قبل أسابيع، أما الطاهي في البيت فيقرر طبقًا بعد طبق.",
  ),
  panels: [
    {
      id: "activities",
      pill: bi("Four activities", "الأنشطة الأربعة"),
      heading: bi("Every process has the same four activities", "لكل عملية الأنشطة الأربعة نفسها"),
      points: [
        bi(
          "**Specification** defines what the software must do and the constraints on it; **design and implementation** produce software that meets it.",
          "**التوصيف (specification)** يحدد ما يجب أن تفعله البرمجيات والقيود المفروضة عليها، ثم يُنتج **التصميم والتنفيذ (design and implementation)** برمجيات تستوفيه.",
        ),
        bi(
          "**Validation** checks that it does what the customer wants, and **evolution** changes it as the customer's needs change.",
          "ويتأكد **التحقق من الصلاحية (validation)** من أنها تفعل ما يريده العميل، ويعدّلها **التطور (evolution)** كلما تغيرت احتياجات العميل.",
        ),
        bi("A changed need becomes a new specification, so the cycle repeats over the software's life.", "ويصبح كل احتياج متغيّر توصيفًا جديدًا، فتتكرر الدورة طوال عمر البرمجيات."),
      ],
    },
    {
      id: "description",
      pill: bi("Process description", "وصف العملية"),
      heading: bi("A description adds order, products, roles and conditions", "الوصف يضيف الترتيب والنواتج والأدوار والشروط"),
      points: [
        bi(
          "Take one activity, **architectural design**. Its description fixes its **order** (after specification, before implementation) and its **product**, a model of the architecture.",
          "خذ نشاطًا واحدًا هو **التصميم المعماري (architectural design)**: يحدد وصفه **ترتيبه** (بعد التوصيف وقبل التنفيذ) و**ناتجه (product)**، وهو نموذج للمعمارية.",
        ),
        bi("It names the **roles** responsible, such as project manager, configuration manager or programmer.", "ويسمّي **الأدوار (roles)** المسؤولة، مثل مدير المشروع ومدير التهيئة (configuration manager) والمبرمج."),
        bi(
          "**Pre- and post-conditions** are statements that are true before the activity starts and after it ends.",
          "و**الشروط المسبقة واللاحقة (pre- and post-conditions)** عبارات تكون صحيحة قبل بدء النشاط وبعد انتهائه.",
        ),
      ],
    },
    {
      id: "plan-agile",
      pill: bi("Plan-driven vs agile", "بالخطة أم رشيق"),
      heading: bi("When is the planning done?", "متى يتم التخطيط؟"),
      control: {
        label: bi("Process", "العملية"),
        options: [
          { id: "plan", label: bi("Plan-driven", "موجَّه بالخطة") },
          { id: "agile", label: bi("Agile", "رشيق") },
        ],
        initial: "plan",
      },
      points: [bi("Halfway through the project, the customer changes a requirement.", "في منتصف المشروع، يغيّر العميل أحد المتطلبات.")],
      pointsFor: {
        plan: [
          bi("**Plan-driven**: every activity is **planned in advance**, and progress is measured against that plan.", "**الموجَّه بالخطة (plan-driven)**: كل نشاط **مخطط له مسبقًا**، ويُقاس التقدم مقارنةً بتلك الخطة."),
          bi("The change falls outside the plan, so finished work must be revisited and the schedule slips.", "يقع التغيير خارج الخطة، فيجب الرجوع إلى العمل المنجَز، ويتأخر الجدول الزمني."),
        ],
        agile: [
          bi("**Agile**: planning is **incremental**; only the next short cycle is planned in detail.", "**الرشيق (agile)**: التخطيط **تزايدي (incremental)**، ولا تُخطَّط بالتفصيل إلا الدورة القصيرة التالية."),
          bi("The change simply goes into the next cycle's plan, so the process follows the requirements.", "فيدخل التغيير ببساطة في خطة الدورة التالية، وتتبع العملية المتطلبات."),
        ],
      },
    },
    {
      id: "balance",
      pill: bi("No single right process", "لا عملية واحدة صحيحة"),
      heading: bi("Choose the balance that fits the system", "اختر التوازن الذي يناسب النظام"),
      points: [
        bi("There is **no right or wrong process**: each approach suits different kinds of software.", "**لا توجد عملية صحيحة وأخرى خاطئة**: فكل نهج يناسب أنواعًا مختلفة من البرمجيات."),
        bi(
          "In practice you **balance** the two, and most large systems combine elements of the waterfall, incremental and reuse-oriented models.",
          "وعمليًا **توازن** بين الاثنين، ومعظم الأنظمة الكبيرة تجمع عناصر من نماذج الشلال (waterfall) والتزايدي (incremental) والموجَّه لإعادة الاستخدام (reuse-oriented).",
        ),
      ],
    },
  ],
});

// ---------- The waterfall model ----------
export const waterfall = defineWalkthrough({
  id: "se2-waterfall",
  title: bi("The waterfall model", "نموذج الشلال"),
  analogy: bi(
    "Building a house: the drawings are approved before the foundations are poured, and moving a wall once the roof is on means redoing drawings and work.",
    "بناء منزل: تُعتمد الرسومات قبل صبّ الأساسات، ونقل جدار بعد تركيب السقف يعني إعادة الرسومات والعمل.",
  ),
  panels: [
    {
      id: "cascade",
      pill: bi("Five phases", "خمس مراحل"),
      heading: bi("Each phase is signed off before the next one starts", "يُصادَق على كل مرحلة قبل أن تبدأ التالية"),
      points: [
        bi(
          "The waterfall is **plan-driven**: requirements, design, implementation, testing and operation are **separate, distinct phases**.",
          "نموذج الشلال **موجَّه بالخطة (plan-driven)**: المتطلبات والتصميم والتنفيذ والاختبار والتشغيل **مراحل منفصلة ومتمايزة**.",
        ),
        bi("Each phase produces **documents** that are approved (**signed off**), and the next phase builds on them.", "تُنتج كل مرحلة **وثائق** تُعتمد (**يُصادَق عليها (signed off)**)، وتبني المرحلة التالية عليها."),
        bi("It is **simple** to understand and use, and the phases are clearly defined and done one at a time.", "وهو **بسيط** الفهم والاستخدام، ومراحله محددة بوضوح وتُنفَّذ واحدة تلو الأخرى."),
      ],
    },
    {
      id: "feedback",
      pill: bi("Feedback", "التغذية الراجعة"),
      heading: bi("Strictly one-way only in principle", "أحادي الاتجاه من حيث المبدأ فقط"),
      control: {
        label: bi("View", "المنظور"),
        options: [
          { id: "principle", label: bi("In principle", "من حيث المبدأ") },
          { id: "practice", label: bi("In practice", "في الواقع") },
        ],
        initial: "principle",
      },
      points: [bi("The figure on the slide has arrows going **back up** as well as down.", "في شكل الشريحة أسهم تعود **إلى الأعلى** إلى جانب الأسهم النازلة.")],
      pointsFor: {
        principle: [bi("In principle, work flows **one way**: a phase starts only when the previous one has finished.", "من حيث المبدأ، يتدفق العمل **في اتجاه واحد**: لا تبدأ مرحلة إلا بعد انتهاء المرحلة السابقة.")],
        practice: [
          bi(
            "In practice the phases **overlap and feed back**: a problem found later can send you back to design or even to requirements.",
            "في الواقع **تتداخل** المراحل **وتغذّي بعضها راجعًا**: فمشكلة تُكتشف لاحقًا قد تعيدك إلى التصميم بل إلى المتطلبات.",
          ),
          bi(
            "Each step back means **re-approving documents**, which is costly, so after a few iterations parts of the work are **frozen**.",
            "وكل عودة تعني **إعادة اعتماد الوثائق**، وهذا مكلف، لذلك **تُجمَّد** أجزاء من العمل بعد عدد قليل من التكرارات.",
          ),
        ],
      },
    },
    {
      id: "visibility",
      pill: bi("Visible but late", "مرئي لكنه متأخر"),
      heading: bi("What each side sees during the project", "ما يراه كل طرف أثناء المشروع"),
      control: {
        label: bi("Seen by", "من منظور"),
        options: [
          { id: "manager", label: bi("The manager", "المدير") },
          { id: "customer", label: bi("The customer", "العميل") },
        ],
        initial: "manager",
      },
      points: [bi("Every phase ends with documents, but nothing runs until near the end.", "تنتهي كل مرحلة بوثائق، لكن لا شيء يعمل إلا قرب النهاية.")],
      pointsFor: {
        manager: [
          bi("**Easy to manage**: each phase's documents make the process **visible**, so progress can be checked against the plan.", "**سهل الإدارة**: وثائق كل مرحلة تجعل العملية **مرئية**، فيمكن مقارنة التقدم بالخطة."),
          bi("The price: producing and approving all those documents is **costly**.", "والثمن: إنتاج كل هذه الوثائق واعتمادها **مكلف**."),
        ],
        customer: [
          bi(
            "**No working software until late**: the customer has nothing to try until the final phases, so the product takes a long time to arrive.",
            "**لا برمجيات عاملة إلا في وقت متأخر**: لا يجد العميل ما يجرّبه حتى المراحل الأخيرة، لذا يستغرق وصول المنتج وقتًا طويلًا.",
          ),
          bi("Mistakes stay hidden until then, so the **risk** keeps growing until release.", "وتظل الأخطاء مخفية حتى ذلك الحين، فتتزايد **المخاطر (risk)** حتى الإصدار."),
        ],
      },
    },
    {
      id: "late-change",
      pill: bi("Changing requirements", "تغيير المتطلبات"),
      heading: bi("The later the change, the more there is to redo", "كلما تأخر التغيير زاد ما يجب إعادته"),
      control: {
        label: bi("The change arrives", "يصل التغيير"),
        options: [
          { id: "early", label: bi("During requirements", "أثناء المتطلبات") },
          { id: "late", label: bi("During testing", "أثناء الاختبار") },
        ],
        initial: "early",
      },
      points: [bi("The customer changes one requirement.", "يغيّر العميل متطلبًا واحدًا.")],
      pointsFor: {
        early: [bi("Only the requirements document is edited and re-approved; nothing has been built on it yet.", "لا يُعدَّل إلا مستند المتطلبات ويُعاد اعتماده، فلم يُبنَ عليه شيء بعد.")],
        late: [
          bi(
            "The requirements, the design and the code built on them must all be **redone and re-approved**.",
            "يجب **إعادة** المتطلبات والتصميم والشيفرة المبنية عليهما **واعتمادها من جديد**.",
          ),
          bi("This is why the waterfall is **inflexible** and **high-risk** when requirements change.", "ولهذا يكون نموذج الشلال **غير مرن** و**عالي المخاطر** عندما تتغير المتطلبات."),
        ],
      },
    },
    {
      id: "when",
      pill: bi("When to use it", "متى يُستخدم"),
      heading: bi("Where the waterfall fits", "أين يناسب نموذج الشلال"),
      points: [
        bi(
          "Use it only when the requirements are **well understood** from the start, **unlikely to change**, and delivery time is not critical.",
          "استخدمه فقط عندما تكون المتطلبات **مفهومة جيدًا** منذ البداية، و**من غير المرجح أن تتغير**، ولا يكون وقت التسليم حرجًا.",
        ),
        bi(
          "It is mostly used for **large systems-engineering projects** built at **several sites**, where the plan coordinates the work.",
          "ويُستخدم غالبًا في **مشاريع هندسة النظم الكبيرة** التي تُطوَّر في **عدة مواقع**، حيث تنسّق الخطة العمل.",
        ),
      ],
    },
  ],
});

// ---------- Incremental development ----------
export const incremental = defineWalkthrough({
  id: "se2-incremental",
  title: bi("Incremental development", "التطوير التزايدي"),
  analogy: bi(
    "Painting a portrait in layers: a rough sketch shown to the sitter first, then more detail at every session, instead of one finished painting unveiled at the end.",
    "رسم صورة شخصية على طبقات: مخطط أولي يُعرض على صاحب الصورة أولًا، ثم مزيد من التفاصيل في كل جلسة، بدلًا من لوحة مكتملة واحدة تُكشف في النهاية.",
  ),
  panels: [
    {
      id: "versions",
      pill: bi("A series of versions", "سلسلة من النسخ"),
      heading: bi("Specification, development and validation run together", "التوصيف والتطوير والتحقق تجري معًا"),
      points: [
        bi(
          "From an **outline description**, the three activities run **concurrently** and feed each other.",
          "انطلاقًا من **وصف مبدئي (outline description)**، تجري الأنشطة الثلاثة **بالتزامن** ويغذّي كل منها الآخر.",
        ),
        bi(
          "They produce an **initial version**, then **intermediate versions**, then the **final version**, each adding functionality to the one before.",
          "وتُنتج **نسخة أولية**، ثم **نسخًا وسيطة**، ثم **النسخة النهائية**، وتضيف كل نسخة وظائف إلى سابقتها.",
        ),
      ],
    },
    {
      id: "evolve",
      pill: bi("Show, comment, evolve", "اعرض واستمع وطوِّر"),
      heading: bi("Each version is exposed to user comment", "كل نسخة تُعرض على المستخدمين لإبداء ملاحظاتهم"),
      points: [
        bi(
          "Build an **initial implementation**, show it to users, and let their comments shape the next version.",
          "ابنِ **تنفيذًا أوليًا (initial implementation)**، واعرضه على المستخدمين، ودع ملاحظاتهم تشكّل النسخة التالية.",
        ),
        bi("Each **increment** adds functionality, until a suitable system has been developed.", "تضيف كل **زيادة (increment)** وظائف جديدة، حتى يُطوَّر نظام مناسب."),
        bi("The increments may be planned in advance (**plan-driven**) or decided as you go (**agile**).", "ويمكن أن تُخطَّط الزيادات مسبقًا بنهج **موجَّه بالخطة (plan-driven)**، أو أن تُحدَّد أثناء العمل بنهج **رشيق (agile)**."),
      ],
    },
    {
      id: "change-cost",
      pill: bi("Cheaper change", "تغيير أقل تكلفة"),
      heading: bi("A change request halfway through", "طلب تغيير في منتصف الطريق"),
      control: {
        label: bi("Process", "العملية"),
        options: [
          { id: "waterfall", label: bi("Waterfall", "الشلال") },
          { id: "incremental", label: bi("Incremental", "التزايدي") },
        ],
        initial: "waterfall",
      },
      points: [bi("Halfway through the project, the customer's needs change.", "في منتصف المشروع، تتغير احتياجات العميل.")],
      pointsFor: {
        waterfall: [
          bi(
            "The full requirements and design were written up front, so **much of the analysis and documentation must be redone**.",
            "كُتبت المتطلبات والتصميم كاملةً مسبقًا، لذا **يجب إعادة قدر كبير من التحليل والتوثيق**.",
          ),
        ],
        incremental: [
          bi(
            "Only the **current increment** changes, and new functionality goes into **later increments**, so far less has to be redone.",
            "لا تتغير إلا **الزيادة الحالية**، وتدخل الوظائف الجديدة في **الزيادات اللاحقة**، فيقل كثيرًا ما يجب إعادته.",
          ),
          bi("Customers see each increment early, so a wrong turn is caught **before** much is built on it.", "ويرى العملاء كل زيادة مبكرًا، فيُكتشف الخطأ في الاتجاه **قبل** أن يُبنى عليه الكثير."),
        ],
      },
    },
    {
      id: "value",
      pill: bi("Earlier value", "قيمة أبكر"),
      heading: bi("When does the customer get something useful?", "متى يحصل العميل على شيء مفيد؟"),
      control: {
        label: bi("Process", "العملية"),
        options: [
          { id: "waterfall", label: bi("Waterfall", "الشلال") },
          { id: "incremental", label: bi("Incremental", "التزايدي") },
        ],
        initial: "waterfall",
      },
      points: [bi("The same project over the same time, as on the slide's “risk and value” figure.", "المشروع نفسه في المدة نفسها، كما في شكل «المخاطر والقيمة» في الشريحة.")],
      pointsFor: {
        waterfall: [bi("Value arrives **once, at the end**, and the **risk** keeps rising until that release.", "تصل القيمة **مرة واحدة في النهاية**، وتظل **المخاطر** ترتفع حتى ذلك الإصدار.")],
        incremental: [
          bi(
            "Each release delivers **useful software**, even before all functions exist, so customers gain value **earlier**.",
            "كل إصدار يقدّم **برمجيات مفيدة**، حتى قبل اكتمال جميع الوظائف، فيحصل العملاء على القيمة **أبكر**.",
          ),
          bi("Each release is checked in real use, so the **risk stays low**.", "ويُختبر كل إصدار في الاستخدام الفعلي، فتبقى **المخاطر منخفضة**."),
        ],
      },
    },
    {
      id: "visibility",
      pill: bi("Progress is hard to see", "التقدم صعب الرؤية"),
      heading: bi("Problem 1: the process is not visible", "المشكلة 1: العملية غير مرئية"),
      points: [
        bi("Managers need **regular deliverables** to measure progress.", "يحتاج المديرون إلى **مُخرَجات منتظمة (deliverables)** لقياس التقدم."),
        bi(
          "When versions come out quickly, documenting **every version** is not cost-effective, so the documents fall behind.",
          "وعندما تصدر النسخ بسرعة، يصبح توثيق **كل نسخة** غير مجدٍ من حيث التكلفة، فتتأخر الوثائق عن النسخ.",
        ),
      ],
    },
    {
      id: "structure",
      pill: bi("Structure decays", "تدهور البنية"),
      heading: bi("Problem 2: every increment bends the structure", "المشكلة 2: كل زيادة تُضعف البنية"),
      control: {
        label: bi("After each increment", "بعد كل زيادة"),
        options: [
          { id: "none", label: bi("No refactoring", "دون إعادة هيكلة") },
          { id: "refactor", label: bi("Refactoring", "مع إعادة الهيكلة") },
        ],
        initial: "none",
      },
      points: [bi("Four increments add modules to the same system.", "تضيف أربع زيادات وحدات (modules) إلى النظام نفسه.")],
      pointsFor: {
        none: [
          bi(
            "Regular change **corrupts the structure**: modules get tangled, so each further change becomes harder and **more costly**.",
            "التغيير المتكرر **يُفسد البنية**: تتشابك الوحدات، فيصبح كل تغيير لاحق أصعب و**أعلى تكلفة**.",
          ),
        ],
        refactor: [
          bi(
            "Spending time and money on **refactoring** after each increment keeps the structure clean, so changes stay cheap.",
            "إنفاق الوقت والمال على **إعادة الهيكلة (refactoring)** بعد كل زيادة يحافظ على البنية نظيفة، فتبقى التغييرات قليلة التكلفة.",
          ),
        ],
      },
    },
  ],
});

// ---------- Reuse-oriented software engineering ----------
export const reuse = defineWalkthrough({
  id: "se2-reuse",
  title: bi("Reuse-oriented software engineering", "هندسة البرمجيات الموجَّهة لإعادة الاستخدام"),
  analogy: bi(
    "Furnishing a flat from a furniture store instead of a carpenter: quicker and cheaper, but you choose from what is in stock, and the store decides when a model changes.",
    "تأثيث شقة من متجر أثاث بدلًا من نجّار: أسرع وأرخص، لكنك تختار مما هو متوفر، والمتجر هو من يقرر متى يتغير الطراز.",
  ),
  panels: [
    {
      id: "assemble",
      pill: bi("Integrate, don't build", "ادمج ولا تبنِ"),
      heading: bi("Most of the system already exists", "معظم النظام موجود بالفعل"),
      control: {
        label: bi("Build the system", "ابنِ النظام"),
        options: [
          { id: "scratch", label: bi("From scratch", "من الصفر") },
          { id: "reuse", label: bi("From components", "من مكوّنات") },
        ],
        initial: "scratch",
      },
      points: [
        bi(
          "The approach assumes that a **significant number of reusable components** already exist.",
          "يفترض هذا النهج وجود **عدد كبير من المكوّنات القابلة لإعادة الاستخدام (reusable components)**.",
        ),
      ],
      pointsFor: {
        scratch: [bi("Without them, your own team designs, writes and tests every part of the system.", "ومن دونها، يصمم فريقك كل جزء من النظام ويكتبه ويختبره بنفسه.")],
        reuse: [
          bi(
            "Development focuses on **integrating** the existing components; only the business rules and the glue code are written.",
            "يركّز التطوير على **دمج (integrating)** المكوّنات الموجودة، ولا يُكتب إلا قواعد العمل وشيفرة الربط (glue code).",
          ),
        ],
      },
    },
    {
      id: "process",
      pill: bi("The process", "مراحل العملية"),
      heading: bi("Requirements bend to fit the components", "المتطلبات تتكيّف لتلائم المكوّنات"),
      points: [
        bi(
          "After the requirements are specified, **component analysis** searches for components that match them; usually none match exactly.",
          "بعد توصيف المتطلبات، يبحث **تحليل المكوّنات (component analysis)** عن مكوّنات تطابقها، وغالبًا لا يوجد تطابق تام.",
        ),
        bi(
          "**Requirements modification** adjusts the requirements to what the components provide; then the system is designed around them, integrated and validated.",
          "ويعدّل **تعديل المتطلبات (requirements modification)** المتطلبات لتلائم ما توفره المكوّنات، ثم يُصمَّم النظام حولها ويُدمج ويُتحقق من صلاحيته.",
        ),
      ],
    },
    {
      id: "kinds",
      pill: bi("Three kinds", "ثلاثة أنواع"),
      heading: bi("Where reusable components come from", "من أين تأتي المكوّنات القابلة لإعادة الاستخدام"),
      points: [
        bi(
          "**Stand-alone application systems** (COTS) are whole products, **configured** for a particular environment.",
          "**أنظمة التطبيقات المستقلة (stand-alone application systems)**، أي المكوّنات الجاهزة (COTS)، منتجات كاملة **تُهيَّأ** لبيئة معيّنة.",
        ),
        bi(
          "**Collections of objects** are packages built to plug into a **component framework** such as .NET or J2EE.",
          "**مجموعات الكائنات (collections of objects)** حزم مبنية لتُدمج في **إطار عمل مكوّنات (component framework)** مثل .NET أو J2EE.",
        ),
        bi("**Web services** follow service standards and are **invoked remotely** over the network.", "**خدمات الويب (web services)** تتبع معايير الخدمات و**تُستدعى عن بُعد** عبر الشبكة."),
      ],
    },
    {
      id: "tradeoffs",
      pill: bi("Gains and costs", "المكاسب والتكاليف"),
      heading: bi("Less to build, less control", "بناء أقل وتحكّم أقل"),
      control: {
        label: bi("Show", "اعرض"),
        options: [
          { id: "gains", label: bi("Advantages", "المزايا") },
          { id: "costs", label: bi("Disadvantages", "العيوب") },
        ],
        initial: "gains",
      },
      points: [bi("Reuse replaces most of the **building** with **integrating**.", "تستبدل إعادة الاستخدام **الدمجَ** بمعظم **البناء**.")],
      pointsFor: {
        gains: [
          bi("Less software to develop means **lower cost and risk**.", "برمجيات أقل يلزم تطويرها تعني **تكلفة ومخاطر أقل**."),
          bi("Assembling parts that already exist leads to **faster delivery**.", "وتجميع أجزاء موجودة بالفعل يؤدي إلى **تسليم أسرع**."),
        ],
        costs: [
          bi(
            "**Requirements compromises**: the components cover only part of what users asked for, so the system may not meet their real needs.",
            "**تنازلات في المتطلبات**: لا تغطي المكوّنات إلا جزءًا مما طلبه المستخدمون، فقد لا يلبي النظام احتياجاتهم الحقيقية.",
          ),
          bi("**Loss of control**: the vendor decides when and how a reused component evolves, and your system must follow.", "**فقدان السيطرة**: المورّد هو من يقرر متى يتطور المكوّن المُعاد استخدامه وكيف، وعلى نظامك أن يتبعه."),
        ],
      },
    },
  ],
});

// ---------- Coping with change ----------
export const change = defineWalkthrough({
  id: "se2-change",
  title: bi("Coping with change", "التعامل مع التغيير"),
  analogy: bi(
    "A tailor's fitting before the suit is sewn avoids changes; leaving extra seam allowance so it can be let out later tolerates them.",
    "قياس البدلة عند الخيّاط قبل خياطتها يتجنّب التغييرات، وترك هامش إضافي في الخياطة لتوسيعها لاحقًا يتحمّلها.",
  ),
  panels: [
    {
      id: "rework",
      pill: bi("Change is inevitable", "التغيير حتمي"),
      heading: bi("Every change costs rework plus new work", "كل تغيير يكلّف إعادة عمل وعملًا جديدًا"),
      points: [
        bi(
          "In large projects change is **inevitable**: the business changes, new technologies appear, and platforms change.",
          "التغيير **حتمي** في المشاريع الكبيرة: فبيئة العمل تتغير، وتظهر تقنيات جديدة، وتتغير المنصات.",
        ),
        bi(
          "Its cost is **rework** (such as re-analysing requirements) **plus** implementing the new functionality.",
          "وتكلفته هي **إعادة العمل (rework)** (مثل إعادة تحليل المتطلبات) **إضافةً إلى** تنفيذ الوظائف الجديدة.",
        ),
      ],
    },
    {
      id: "two-ways",
      pill: bi("Avoid or tolerate", "التجنّب أو التحمّل"),
      heading: bi("Two ways to cut the cost of rework", "طريقتان لخفض تكلفة إعادة العمل"),
      control: {
        label: bi("Approach", "النهج"),
        options: [
          { id: "avoid", label: bi("Change avoidance", "تجنّب التغيير") },
          { id: "tolerate", label: bi("Change tolerance", "تحمّل التغيير") },
        ],
        initial: "avoid",
      },
      points: [bi("Both keep **rework** small when the requirements change.", "كلاهما يُبقي **إعادة العمل (rework)** قليلة عندما تتغير المتطلبات.")],
      pointsFor: {
        avoid: [
          bi(
            "**Change avoidance**: the process predicts changes **before** significant rework is needed, for example by showing customers a **prototype**.",
            "**تجنّب التغيير (change avoidance)**: تتوقع العملية التغييرات **قبل** الحاجة إلى إعادة عمل كبيرة، مثلًا بعرض **نموذج أولي (prototype)** على العملاء.",
          ),
        ],
        tolerate: [
          bi(
            "**Change tolerance**: the process is designed so changes are **cheap** to absorb, usually through incremental development.",
            "**تحمّل التغيير (change tolerance)**: تُصمَّم العملية بحيث يكون استيعاب التغييرات **قليل التكلفة**، وعادةً عبر التطوير التزايدي.",
          ),
          bi("A late change goes into an increment that has **not been built yet**; finished increments stay as they are.", "يدخل التغيير المتأخر في زيادة **لم تُبنَ بعد**، وتبقى الزيادات المنتهية كما هي."),
        ],
      },
    },
    {
      id: "prototype",
      pill: bi("Prototyping", "النماذج الأولية"),
      heading: bi("Build a quick version to learn from", "ابنِ نسخة سريعة لتتعلّم منها"),
      points: [
        bi(
          "A **prototype** is an initial version built quickly to demonstrate concepts, try design options and learn more about the problem.",
          "**النموذج الأولي (prototype)** نسخة أولية تُبنى بسرعة لعرض المفاهيم، وتجربة خيارات التصميم، ومعرفة المزيد عن المشكلة.",
        ),
        bi(
          "It helps in **requirements engineering**, where users get new ideas, and in **design**, for example to check a user interface or a database design.",
          "ويساعد في **هندسة المتطلبات (requirements engineering)** إذ يكتسب المستخدمون أفكارًا جديدة، وفي **التصميم**، مثلًا لفحص واجهة المستخدم أو تصميم قاعدة البيانات.",
        ),
        bi(
          "To stay cheap it covers **poorly understood** areas and **functional** requirements, and leaves out error checking, reliability and security.",
          "ولتبقى تكلفته قليلة، يغطي الجوانب **غير المفهومة جيدًا** والمتطلبات **الوظيفية (functional)**، ويُغفل التحقق من الأخطاء والموثوقية والأمان.",
        ),
      ],
    },
    {
      id: "throwaway",
      pill: bi("Throw it away", "تخلَّص منه"),
      heading: bi("A prototype is not the product", "النموذج الأولي ليس المنتج"),
      control: {
        label: bi("After evaluation", "بعد التقييم"),
        options: [
          { id: "discard", label: bi("Discard it", "تخلَّص منه") },
          { id: "ship", label: bi("Ship it", "سلِّمه") },
        ],
        initial: "discard",
      },
      points: [bi("The prototype has done its job: the evaluation report says what users really need.", "أدّى النموذج الأولي مهمته: فتقرير التقييم يبيّن ما يحتاجه المستخدمون فعلًا.")],
      pointsFor: {
        discard: [
          bi(
            "Keep the **lessons**, discard the code: the production system is engineered properly, with documentation and quality checks.",
            "احتفظ **بالدروس** وتخلَّص من الشيفرة: يُهندَس نظام الإنتاج كما ينبغي، مع التوثيق وفحوص الجودة.",
          ),
        ],
        ship: [
          bi(
            "Shipped as is, it may be impossible to tune for **non-functional** requirements, and it is usually **undocumented**.",
            "إذا سُلِّم كما هو، فقد يستحيل ضبطه ليستوفي المتطلبات **غير الوظيفية (non-functional)**، وهو عادةً **غير موثَّق**.",
          ),
          bi("Its structure has **degraded** through rapid change, and it won't meet the organization's **quality standards**.", "وبنيته **متدهورة** بسبب التغييرات السريعة، ولن يستوفي **معايير الجودة** في المؤسسة."),
        ],
      },
    },
    {
      id: "delivery",
      pill: bi("Incremental delivery", "التسليم التزايدي"),
      heading: bi("Deliver the most important requirements first", "سلِّم المتطلبات الأهم أولًا"),
      control: {
        label: bi("Show", "اعرض"),
        options: [
          { id: "benefits", label: bi("Benefits", "الفوائد") },
          { id: "problems", label: bi("Problems", "المشكلات") },
        ],
        initial: "benefits",
      },
      points: [
        bi(
          "Requirements are **prioritized**; each increment is developed, **integrated** with the earlier ones and deployed.",
          "**تُرتَّب المتطلبات حسب الأولوية**، وتُطوَّر كل زيادة وتُدمَج مع الزيادات السابقة وتُنشَر.",
        ),
      ],
      pointsFor: {
        benefits: [
          bi("Customers get **value from the first release**, which meets their most critical needs.", "يحصل العملاء على **قيمة من الإصدار الأول** الذي يلبي أهم احتياجاتهم."),
          bi(
            "Earlier parts are tested again in every release, so the most important services are **tested the most** and the risk of failure is lower.",
            "تُختبر الأجزاء الأقدم من جديد في كل إصدار، فتكون الخدمات الأهم **الأكثر اختبارًا** ويقل خطر الإخفاق.",
          ),
        ],
        problems: [
          bi(
            "Most systems need **common facilities** used by every part, but they are hard to identify while later requirements are not yet detailed.",
            "تحتاج معظم الأنظمة إلى **مرافق مشتركة (common facilities)** تستخدمها كل الأجزاء، لكن يصعب تحديدها ما دامت المتطلبات اللاحقة غير مفصَّلة بعد.",
          ),
          bi(
            "There is **no complete specification** until the last increment, which conflicts with contracts that require one up front.",
            "لا يوجد **توصيف كامل** حتى الزيادة الأخيرة، وهذا يتعارض مع العقود التي تشترط توصيفًا كاملًا مسبقًا.",
          ),
        ],
      },
    },
    {
      id: "deploy",
      pill: bi("Development vs delivery", "التطوير أم التسليم"),
      heading: bi("Where does a finished increment go?", "أين تذهب الزيادة المنتهية؟"),
      control: {
        label: bi("Incremental", "التزايدي"),
        options: [
          { id: "development", label: bi("Development", "التطوير") },
          { id: "delivery", label: bi("Delivery", "التسليم") },
        ],
        initial: "development",
      },
      points: [bi("Both build the system in increments; they differ in what happens to each one.", "كلاهما يبني النظام على زيادات، ويختلفان فيما يحدث لكل زيادة.")],
      pointsFor: {
        development: [
          bi(
            "Incremental **development** shows each increment to customers for comment **without deploying** it in their environment. It is the normal approach in agile methods.",
            "**التطوير** التزايدي يعرض كل زيادة على العملاء لإبداء ملاحظاتهم **دون نشرها** في بيئتهم، وهو النهج المعتاد في الأساليب الرشيقة (agile).",
          ),
        ],
        delivery: [
          bi("Incremental **delivery** **deploys** each increment for real use by end users, a **more realistic** evaluation.", "**التسليم** التزايدي **ينشر (deploys)** كل زيادة للاستخدام الفعلي من قِبل المستخدمين النهائيين، وهذا تقييم **أكثر واقعية**."),
          bi(
            "It is hard for **replacement systems**: early increments do less than the old system, so users can't drop it yet.",
            "وهو صعب في **الأنظمة البديلة (replacement systems)**: فالزيادات الأولى تؤدي أقل مما يؤديه النظام القديم، فلا يستطيع المستخدمون الاستغناء عنه بعد.",
          ),
        ],
      },
    },
  ],
});

/** Every walkthrough in this lecture, registered in lib/walkthroughs/index.ts. */
export const all = [softwareProcess, waterfall, incremental, reuse, change] as const;

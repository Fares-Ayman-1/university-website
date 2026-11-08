import { bi } from "@/components/widgets/types";
import { defineWalkthrough } from "@/lib/widgets/walkthrough";
import { DOWNTIME_LIMIT, TEST_WEEK, checkDowntime } from "@/lib/widgets/se-lecture-04";

/*
 * Software Engineering · Lecture 4 (content/subjects/software-engineering/lectures/04-requirements-engineering.mdx).
 * One walkthrough per heading; the scenes are in
 * components/widgets/walkthrough/scenes/software-engineering/lecture-04/.
 */

// ---------- Requirements and requirements engineering ----------
export const requirements = defineWalkthrough({
  id: "se4-requirements",
  title: bi("Requirements and the people they serve", "المتطلبات والأشخاص الذين تخدمهم"),
  analogy: bi(
    "Commissioning a house: before anyone pours concrete, the brief lists the rooms the family needs (services) and what the budget and building code allow (constraints), and the family, the bank and the city all have a say.",
    "التكليف ببناء منزل: قبل صبّ أي خرسانة، يحدد التكليف الغرف التي تحتاجها الأسرة (الخدمات) وما تسمح به الميزانية وقوانين البناء (القيود)، ويكون للأسرة والبنك والبلدية جميعًا رأي فيه.",
  ),
  panels: [
    {
      id: "requirement",
      pill: bi("Requirement", "المتطلب"),
      heading: bi("A requirement: a function, a constraint or a property", "المتطلب: وظيفة أو قيد أو خاصية"),
      points: [
        bi(
          "A **requirement** is a function, constraint or other property that the system must provide to meet the needs of its intended users.",
          "**المتطلب (requirement)** وظيفة أو قيد أو خاصية أخرى يجب أن يوفرها النظام لتلبية احتياجات مستخدميه المستهدفين.",
        ),
        bi(
          "For Mentcare's staff, a daily patient list is a **function**, at most 5 seconds of downtime a day is a **constraint**, and keeping records private is a **property**.",
          "لطاقم Mentcare: القائمة اليومية للمرضى **وظيفة (function)**، وألا يتجاوز التوقف 5 ثوانٍ في اليوم **قيد (constraint)**، والحفاظ على سرية السجلات **خاصية (property)**.",
        ),
      ],
    },
    {
      id: "re",
      pill: bi("Engineering", "الهندسة"),
      heading: bi("Requirements engineering is systematic", "هندسة المتطلبات عمل منهجي"),
      control: {
        label: bi("Requirements handled", "التعامل مع المتطلبات"),
        options: [
          { id: "adhoc", label: bi("Ad hoc", "عشوائيًا") },
          { id: "engineered", label: bi("Engineered", "هندسيًا") },
        ],
        initial: "engineered",
      },
      points: [
        bi(
          "**Requirements engineering (RE)** establishes the **services** a customer requires from a system and the **constraints** under which it operates and is developed.",
          "**هندسة المتطلبات (requirements engineering)** تحدد **الخدمات** التي يطلبها العميل من النظام و**القيود** التي يعمل النظام ويُطوَّر في ظلها.",
        ),
      ],
      pointsFor: {
        adhoc: [
          bi(
            "Passed on by word of mouth, needs get lost or misheard, and nobody can check the finished system against them.",
            "عندما تُنقل الاحتياجات شفهيًا تضيع أو يُساء فهمها، ولا يستطيع أحد مطابقة النظام النهائي بها.",
          ),
        ],
        engineered: [
          bi(
            "**Engineering** means systematic, well-defined techniques: every requirement is **defined**, **managed** as it changes, and **tested**.",
            "**الهندسة (engineering)** تعني تقنيات منهجية محددة جيدًا: فكل متطلب **يُعرَّف**، و**يُدار** كلما تغيّر، و**يُختبر**.",
          ),
        ],
      },
    },
    {
      id: "complete-consistent",
      pill: bi("Complete, consistent", "الاكتمال والاتساق"),
      heading: bi("A specification should be complete and consistent", "يجب أن يكون التوصيف مكتملًا ومتسقًا"),
      control: {
        label: bi("Check for", "افحص"),
        options: [
          { id: "completeness", label: bi("Completeness", "الاكتمال") },
          { id: "consistency", label: bi("Consistency", "الاتساق") },
        ],
        initial: "completeness",
      },
      points: [
        bi(
          "**Complete**: every service the users require is defined. **Consistent**: no two requirements contradict each other.",
          "**مكتمل (complete)**: كل خدمة يحتاجها المستخدمون معرَّفة. **متسق (consistent)**: لا يتعارض متطلبان فيما بينهما.",
        ),
        bi(
          "For a large, complex system, reaching both fully is practically **impossible**: mistakes and omissions are easy to make, and there are many stakeholders.",
          "وفي النظام الكبير المعقد يكاد يكون تحقيق الاثنين بالكامل **مستحيلًا** عمليًا: فالأخطاء والإغفالات سهلة الوقوع، وأصحاب المصلحة (stakeholders) كثيرون.",
        ),
      ],
      pointsFor: {
        completeness: [
          bi(
            "Here the users need monthly cost reports, but no requirement mentions them: the specification is **incomplete**.",
            "هنا يحتاج المستخدمون إلى تقارير تكلفة شهرية، لكن لا يذكرها أي متطلب: فالتوصيف **غير مكتمل**.",
          ),
        ],
        consistency: [
          bi(
            "Here R2 lets only doctors open a patient record, while R4 asks nurses to update one: the specification is **inconsistent**.",
            "هنا يسمح R2 للأطباء وحدهم بفتح سجل المريض، بينما يطلب R4 من الممرضين تحديثه: فالتوصيف **غير متسق**.",
          ),
        ],
      },
    },
    {
      id: "stakeholders",
      pill: bi("Stakeholders", "أصحاب المصلحة"),
      heading: bi("Everyone the system affects", "كل من يتأثر بالنظام"),
      points: [
        bi(
          "A **stakeholder** is any person or organization affected by the system, not only the people who use it.",
          "**صاحب المصلحة (stakeholder)** أي شخص أو جهة تتأثر بالنظام، لا مستخدموه فقط.",
        ),
        bi(
          "**Owners** pay for it, **end users** use it, **system managers** run it, **project groups** build, test and train, and **external** stakeholders such as marketing or government set conditions from outside.",
          "**المالكون** يدفعون تكلفته، و**المستخدمون النهائيون** يستخدمونه، و**مديرو النظام** يشغّلونه، و**فرق المشروع** تبنيه وتختبره وتدرّب عليه، وأصحاب المصلحة **الخارجيون** مثل التسويق أو الحكومة يفرضون شروطًا من الخارج.",
        ),
        bi(
          "Each group wants different things: one reason a large specification is never fully complete and consistent.",
          "ولكل فئة مطالب مختلفة، وهذا أحد أسباب ألا يكون توصيف النظام الكبير مكتملًا ومتسقًا تمامًا أبدًا.",
        ),
      ],
    },
    {
      id: "mentcare",
      pill: bi("Mentcare", "Mentcare"),
      heading: bi("Mentcare's stakeholders: users and the affected", "أصحاب المصلحة في Mentcare: المستخدمون والمتأثرون"),
      control: {
        label: bi("Show", "اعرض"),
        options: [
          { id: "uses", label: bi("Who uses it", "من يستخدمه") },
          { id: "affected", label: bi("Who it affects", "من يتأثر به") },
        ],
        initial: "uses",
      },
      points: [
        bi(
          "**Mentcare** (the MHC-PMS) manages patients receiving treatment for mental health problems. It has six groups of stakeholders.",
          "يدير نظام **Mentcare** (MHC-PMS) بيانات المرضى الذين يتلقون علاجًا لمشكلات الصحة النفسية، وله ست فئات من أصحاب المصلحة (stakeholders).",
        ),
      ],
      pointsFor: {
        uses: [
          bi(
            "**Doctors**, **nurses**, **medical receptionists** and **IT staff** work with the system directly.",
            "يتعامل **الأطباء** و**الممرضون** و**موظفو الاستقبال الطبي** و**موظفو تقنية المعلومات (IT)** مع النظام مباشرةً.",
          ),
        ],
        affected: [
          bi(
            "**Patients** never log in, but their information is recorded in it, and the **medical ethics manager** makes sure it meets ethical guidelines. Both are stakeholders too.",
            "لا يسجّل **المرضى** الدخول أبدًا، لكن معلوماتهم مسجَّلة فيه، ويتأكد **مدير الأخلاقيات الطبية** من التزامه بالإرشادات الأخلاقية. وكلاهما من أصحاب المصلحة أيضًا.",
          ),
        ],
      },
    },
  ],
});

// ---------- User and system requirements ----------
export const userSystem = defineWalkthrough({
  id: "se4-user-system",
  title: bi("From a user requirement to system requirements", "من متطلب المستخدم إلى متطلبات النظام"),
  analogy: bi(
    "Ordering a wedding cake: you ask for three chocolate tiers for 150 guests, and the baker's order sheet turns that into tier sizes, recipes, quantities and a delivery time.",
    "طلب كعكة زفاف: تطلب ثلاث طبقات بالشوكولاتة لـ 150 ضيفًا، فتحوّل ورقة طلب الخبّاز ذلك إلى مقاسات الطبقات والوصفات والكميات وموعد التسليم.",
  ),
  panels: [
    {
      id: "refine",
      pill: bi("Refine", "التفصيل"),
      heading: bi("One user requirement becomes five system requirements", "متطلب مستخدم واحد يصبح خمسة متطلبات نظام"),
      control: {
        label: bi("Written as", "مكتوب بوصفه"),
        options: [
          { id: "user", label: bi("User requirement", "متطلب مستخدم") },
          { id: "system", label: bi("System requirements", "متطلبات نظام") },
        ],
        initial: "user",
      },
      points: [
        bi(
          "A **user requirement** states a need in natural language for the customer: Mentcare shall generate monthly reports of the cost of the drugs each clinic prescribed.",
          "**متطلب المستخدم (user requirement)** يعبّر عن حاجة بلغة طبيعية موجَّهة إلى العميل: يجب أن يُنتج Mentcare تقارير شهرية بتكلفة الأدوية التي وصفتها كل عيادة.",
        ),
      ],
      pointsFor: {
        user: [
          bi(
            "Read alone, it leaves questions open: on which day, made how, listing what, for which doses, and read by whom?",
            "وحده يترك أسئلة مفتوحة: في أي يوم، وكيف يُنتَج، وماذا يتضمن، ولأي جرعات، ومن يقرؤه؟",
          ),
        ],
        system: [
          bi(
            "**System requirements** 1.1 to 1.5 answer each question precisely, so the developers have nothing left to guess.",
            "تجيب **متطلبات النظام (system requirements)** من 1.1 إلى 1.5 عن كل سؤال بدقة، فلا يبقى للمطورين ما يخمّنونه.",
          ),
        ],
      },
    },
    {
      id: "what-how",
      pill: bi("Three levels", "ثلاثة مستويات"),
      heading: bi("Business need, then system behaviour, then design", "حاجة العمل، ثم سلوك النظام، ثم التصميم"),
      points: [
        bi(
          "**User requirements**, collected in the **BRS**, state the business need in the customer's words.",
          "**متطلبات المستخدم**، وتُجمع في **وثيقة BRS**، تعبّر عن حاجة العمل بلغة العميل.",
        ),
        bi(
          "**System requirements**, in the **SRS**, add the detail: exactly how the system must behave, seen from outside, so that it can be built and tested.",
          "**متطلبات النظام**، في **وثيقة SRS**، تضيف التفاصيل: كيف يجب أن يتصرف النظام بالضبط كما يُرى من الخارج، بحيث يمكن بناؤه واختباره.",
        ),
        bi(
          "How it works inside, with which jobs and tables, is **design**: the step that comes after the requirements.",
          "أما كيف يعمل من الداخل، وبأي مهام وجداول، فهو **التصميم (design)**: الخطوة التي تأتي بعد المتطلبات.",
        ),
      ],
    },
    {
      id: "readers",
      pill: bi("Readers", "القرّاء"),
      heading: bi("Each kind is written for different readers", "كل نوع يُكتب لقرّاء مختلفين"),
      control: {
        label: bi("Readers of", "قرّاء"),
        options: [
          { id: "user", label: bi("User requirements", "متطلبات المستخدم") },
          { id: "system", label: bi("System requirements", "متطلبات النظام") },
        ],
        initial: "user",
      },
      points: [
        bi(
          "The readers decide the language and the level of detail. **End users**, **client engineers** and **system architects** read both kinds.",
          "القرّاء هم من يحددون اللغة ومستوى التفصيل. ويقرأ **المستخدمون النهائيون** و**مهندسو العميل** و**معماريو النظام** النوعين كليهما.",
        ),
      ],
      pointsFor: {
        user: [
          bi(
            "**Client managers** and **contractor managers** read only the user requirements: they need the services, not the details.",
            "يقرأ **مديرو العميل** و**مديرو المقاول** متطلبات المستخدم فقط: فهم يحتاجون إلى الخدمات لا إلى التفاصيل.",
          ),
        ],
        system: [
          bi(
            "**Software developers** read only the system requirements: they need every detail to implement the system.",
            "يقرأ **مطورو البرمجيات** متطلبات النظام فقط: فهم يحتاجون إلى كل التفاصيل لتنفيذ النظام.",
          ),
        ],
      },
    },
  ],
});

// ---------- Functional and non-functional requirements ----------
const week = checkDowntime(TEST_WEEK, DOWNTIME_LIMIT);
const failDay = week.failing[0];

export const frNfr = defineWalkthrough({
  id: "se4-fr-nfr",
  title: bi("What the system does, and how well", "ما يفعله النظام ومدى جودة أدائه"),
  analogy: bi(
    "A car: \"it has brakes\" is functional; \"it stops from 100 km/h within 40 m\" is non-functional, and a test track can check it.",
    "سيارة: «لها مكابح» متطلب وظيفي، أما «تتوقف من سرعة 100 km/h خلال 40 m» فمتطلب غير وظيفي، ويستطيع مضمار اختبار التحقق منه.",
  ),
  facts: { limit: DOWNTIME_LIMIT, worst: week.worst.downtime, failing: week.failing.length },
  panels: [
    {
      id: "fr-vs-nfr",
      pill: bi("Does vs. how well", "يفعل أم بأي جودة"),
      heading: bi("A service, or a quality of the service", "خدمة أم خاصية للخدمة"),
      control: {
        label: bi("Requirement", "المتطلب"),
        options: [
          { id: "functional", label: bi("Functional", "وظيفي") },
          { id: "nfr", label: bi("Non-functional", "غير وظيفي") },
        ],
        initial: "functional",
      },
      points: [
        bi(
          "A **functional** requirement is something the system must do; a **non-functional** one is a quality or constraint on how it does it.",
          "**المتطلب الوظيفي (functional)** شيء يجب أن يفعله النظام؛ أما **غير الوظيفي (non-functional)** فخاصية جودة أو قيد على طريقة فعله.",
        ),
      ],
      pointsFor: {
        functional: [
          bi(
            "\"The system prints an invoice\": a noun and a verb name a **service**, and a test simply checks whether it happens.",
            "«يطبع النظام فاتورة»: اسم وفعل يسمّيان **خدمة**، ويكفي أن يتحقق الاختبار من حدوثها.",
          ),
        ],
        nfr: [
          bi(
            "\"Prints invoices **quickly**\": the adverb describes how well. But \"quickly\" is still vague; the last panel makes it measurable.",
            "«يطبع الفواتير **بسرعة**»: الظرف (adverb) يصف مدى الجودة. لكن «بسرعة» ما زالت مبهمة؛ واللوحة الأخيرة تجعلها قابلة للقياس.",
          ),
        ],
      },
    },
    {
      id: "fr-behaviour",
      pill: bi("Behaviour", "السلوك"),
      heading: bi("Functional requirements map inputs to outputs", "المتطلبات الوظيفية تربط المدخلات بالمخرجات"),
      points: [
        bi(
          "Functional requirements are also called **behavioural**: they define the output for each input and how the system reacts in particular situations.",
          "تُسمى المتطلبات الوظيفية أيضًا **السلوكية (behavioural)**: فهي تحدد المخرجات المقابلة لكل مدخل، وكيف يتصرف النظام في مواقف محددة.",
        ),
        bi(
          "Mentcare's requirement 3 identifies staff by an **eight-digit** employee number, so a four-digit one is rejected: a requirement can also say what the system must **not** do.",
          "يحدد المتطلب 3 في Mentcare هوية الموظفين برقم وظيفي من **ثمانية أرقام**، لذا يُرفض رقم من أربعة أرقام: فالمتطلب قد يذكر أيضًا ما **لا** يجب أن يفعله النظام.",
        ),
        bi(
          "Requirement 2 turns each day's appointments into a list of the patients expected at each clinic.",
          "ويحوّل المتطلب 2 مواعيد كل يوم إلى قائمة بالمرضى المتوقَّعين في كل عيادة.",
        ),
      ],
    },
    {
      id: "ambiguity",
      pill: bi("Ambiguity", "الغموض"),
      heading: bi("One word, two readings: \"search\"", "كلمة واحدة وقراءتان: «search»"),
      control: {
        label: bi("Read by", "بقراءة"),
        options: [
          { id: "user", label: bi("The user", "المستخدم") },
          { id: "developer", label: bi("The developer", "المطوّر") },
        ],
        initial: "user",
      },
      points: [
        bi(
          "Requirement 1 says a user can **search** the appointment lists for all clinics, but not how.",
          "يقول المتطلب 1 إن المستخدم يستطيع **البحث (search)** في قوائم المواعيد لجميع العيادات، لكنه لا يقول كيف.",
        ),
      ],
      pointsFor: {
        user: [
          bi(
            "The **user** means: type a patient's name once and search the appointments of every clinic.",
            "يقصد **المستخدم**: كتابة اسم المريض مرة واحدة والبحث في مواعيد كل العيادات.",
          ),
        ],
        developer: [
          bi(
            "The **developer** builds: choose a clinic, then search inside it. The patient booked in Clinic C is never found.",
            "وينفّذ **المطوّر**: اختيار عيادة ثم البحث داخلها، فلا يُعثر أبدًا على المريض المحجوز في العيادة C.",
          ),
          bi(
            "An **ambiguous** requirement is read differently by users and developers, and the gap often shows only once the system is in use.",
            "المتطلب **الغامض (ambiguous)** يقرؤه المستخدمون والمطورون بطرق مختلفة، وكثيرًا لا تظهر الفجوة إلا بعد بدء استخدام النظام.",
          ),
        ],
      },
    },
    {
      id: "nfr-critical",
      pill: bi("Whole system", "النظام كله"),
      heading: bi("Non-functional requirements apply to the whole system", "المتطلبات غير الوظيفية تنطبق على النظام كله"),
      control: {
        label: bi("Availability requirement", "متطلب التوافر"),
        options: [
          { id: "met", label: bi("Met", "مُستوفى") },
          { id: "missed", label: bi("Not met", "غير مُستوفى") },
        ],
        initial: "met",
      },
      points: [
        bi(
          "**Non-functional requirements** (NFRs) define properties such as reliability, safety and response time, and constraints on devices, standards and the development process.",
          "**المتطلبات غير الوظيفية (NFRs)** تحدد خصائص مثل الموثوقية والسلامة وزمن الاستجابة، وقيودًا على الأجهزة والمعايير وعملية التطوير.",
        ),
      ],
      pointsFor: {
        met: [
          bi(
            "They usually apply to the **whole system**: Mentcare's availability covers every one of its functions at once.",
            "وهي تنطبق عادةً على **النظام كله**: فتوافر Mentcare يشمل كل وظائفه معًا.",
          ),
        ],
        missed: [
          bi(
            "Miss it and every function still works, yet the clinic can use none of them: an NFR can be **more critical** than a functional requirement.",
            "وإذا لم يُستوفَ بقيت كل وظيفة تعمل، لكن العيادة لا تستطيع استخدام أي منها: فقد يكون المتطلب غير الوظيفي **أهم** من المتطلب الوظيفي.",
          ),
        ],
      },
    },
    {
      id: "nfr-types",
      pill: bi("Three classes", "ثلاث فئات"),
      heading: bi("Where a non-functional requirement comes from", "من أين يأتي المتطلب غير الوظيفي"),
      control: {
        label: bi("Class", "الفئة"),
        options: [
          { id: "product", label: bi("Product", "المنتج") },
          { id: "organizational", label: bi("Organizational", "تنظيمي") },
          { id: "external", label: bi("External", "خارجي") },
        ],
        initial: "product",
      },
      points: [
        bi(
          "NFRs fall into three classes by where they come from: the **product**, the **organizations** involved, or factors **external** to both.",
          "تنقسم المتطلبات غير الوظيفية (NFRs) إلى ثلاث فئات بحسب مصدرها: **المنتج**، أو **المؤسسات** المعنية، أو عوامل **خارجية** عنهما.",
        ),
      ],
      pointsFor: {
        product: [
          bi(
            "**Product** requirements constrain how the delivered software behaves: usability, efficiency (speed and space), dependability and security.",
            "**متطلبات المنتج (product)** تقيّد سلوك البرمجيات المُسلَّمة: سهولة الاستخدام، والكفاءة (السرعة والمساحة)، والاعتمادية (dependability)، والأمان.",
          ),
        ],
        organizational: [
          bi(
            "**Organizational** requirements come from the policies and procedures of the customer's and developer's organizations: how the system is used, developed and run.",
            "**المتطلبات التنظيمية (organizational)** تأتي من سياسات وإجراءات مؤسستَي العميل والمطوّر: كيف يُستخدم النظام ويُطوَّر ويُشغَّل.",
          ),
        ],
        external: [
          bi(
            "**External** requirements come from outside the system and its development: regulators, laws and ethics.",
            "**المتطلبات الخارجية (external)** تأتي من خارج النظام وعملية تطويره: الجهات الرقابية، والقوانين، والأخلاقيات.",
          ),
        ],
      },
    },
    {
      id: "measurable",
      pill: bi("Measurable", "قابل للقياس"),
      heading: bi("A vague NFR can't be tested; a measurable one can", "المتطلب المبهم لا يُختبر، والقابل للقياس يُختبر"),
      control: {
        label: bi("Requirement", "المتطلب"),
        options: [
          { id: "vague", label: bi("Vague", "مبهم") },
          { id: "measurable", label: bi("Measurable", "قابل للقياس") },
        ],
        initial: "vague",
      },
      points: [
        bi(
          "Write an NFR with a **metric** and a number, so that a test can decide it: response time for speed, downtime or mean time to failure for reliability, training time for ease of use.",
          "اكتب المتطلب غير الوظيفي بـ**مقياس (metric)** ورقم حتى يستطيع الاختبار الحكم عليه: زمن الاستجابة للسرعة، وزمن التوقف أو متوسط الزمن حتى الإخفاق للموثوقية، وزمن التدريب لسهولة الاستخدام.",
        ),
      ],
      pointsFor: {
        vague: [
          bi(
            `"Highly available" gives the tester nothing to compare with: is ${week.worst.downtime} seconds of downtime in one day a failure? Nobody can say.`,
            `عبارة «عالي التوافر» لا تعطي المختبِر شيئًا يقارن به: هل التوقف ${week.worst.downtime} ثوانٍ في يوم واحد إخفاق؟ لا أحد يستطيع الجزم.`,
          ),
        ],
        measurable: [
          bi(
            `With a limit of ${DOWNTIME_LIMIT} seconds a day, the same week of measurements gives a clear verdict: ${failDay.day.en} fails with ${failDay.downtime} seconds.`,
            `مع حد قدره ${DOWNTIME_LIMIT} ثوانٍ في اليوم، تعطي قياسات الأسبوع نفسه حكمًا واضحًا: يوم ${failDay.day.ar} يُخفق بـ ${failDay.downtime} ثوانٍ.`,
          ),
        ],
      },
    },
  ],
});

// ---------- The requirements engineering process ----------
export const reProcess = defineWalkthrough({
  id: "se4-re-process",
  title: bi("How requirements are found, written and checked", "كيف تُكتشف المتطلبات وتُكتب وتُفحص"),
  analogy: bi(
    "Planning a group trip: check you can afford it, ask everyone what they want, write the plan down, then read it back together; every surprise sends you back to asking.",
    "التخطيط لرحلة جماعية: تتأكد أنك تستطيع تحمّل تكلفتها، وتسأل الجميع عمّا يريدون، وتكتب الخطة، ثم تقرؤونها معًا؛ وكل مفاجأة تعيدك إلى السؤال من جديد.",
  ),
  panels: [
    {
      id: "process",
      pill: bi("Four activities", "أربعة أنشطة"),
      heading: bi("Four activities, interleaved", "أربعة أنشطة متداخلة"),
      control: {
        label: bi("View", "العرض"),
        options: [
          { id: "order", label: bi("In order", "بالترتيب") },
          { id: "iterative", label: bi("Interleaved", "متداخلة") },
        ],
        initial: "order",
      },
      points: [
        bi(
          "The RE process has four activities: **feasibility study**, **elicitation and analysis**, **specification** and **validation**.",
          "لعملية هندسة المتطلبات (RE) أربعة أنشطة: **دراسة الجدوى (feasibility study)**، و**الاستنباط والتحليل (elicitation and analysis)**، و**التوصيف (specification)**، و**التحقق من الصلاحية (validation)**.",
        ),
        bi(
          "The **feasibility study** comes first and should be quick and cheap: is the system worthwhile, buildable with current technology and budget, and able to work with existing systems?",
          "تأتي **دراسة الجدوى** أولًا، ويجب أن تكون سريعة وقليلة التكلفة: هل يستحق النظام البناء، وهل يمكن بناؤه بالتقنيات والميزانية الحالية، وهل يمكنه العمل مع الأنظمة الموجودة؟",
        ),
      ],
      pointsFor: {
        order: [
          bi(
            "Each activity produces something: a feasibility report, system models, the user and system requirements, and finally the **requirements document**.",
            "ينتج كل نشاط شيئًا: تقرير الجدوى، ونماذج النظام، ومتطلبات المستخدم والنظام، وأخيرًا **وثيقة المتطلبات**.",
          ),
        ],
        iterative: [
          bi(
            "In practice the activities are **interleaved**: validation finds a gap, you go back to elicitation, and each round improves the document.",
            "في الواقع تكون الأنشطة **متداخلة (interleaved)**: يكشف التحقق فجوة فتعود إلى الاستنباط، وكل جولة تحسّن الوثيقة.",
          ),
        ],
      },
    },
    {
      id: "elicitation",
      pill: bi("Elicitation", "الاستنباط"),
      heading: bi("Elicitation and analysis: a cycle of four steps", "الاستنباط والتحليل: دورة من أربع خطوات"),
      points: [
        bi(
          "Technical staff work with stakeholders to learn the application domain, the services needed, the required performance and the hardware constraints.",
          "يعمل الفريق التقني مع أصحاب المصلحة (stakeholders) للتعرّف على مجال التطبيق، والخدمات المطلوبة، والأداء المطلوب، وقيود العتاد (hardware).",
        ),
        bi(
          "Each round **discovers** requirements (domain ones too), **groups** related ones into clusters, **prioritizes** them and **negotiates** conflicts, cost and timeline, then **documents** them.",
          "في كل جولة **تُكتشف** المتطلبات (ومنها متطلبات المجال)، و**تُجمَّع** المترابطة منها في مجموعات، و**تُرتَّب** حسب الأولوية و**يُتفاوض** على التعارضات والتكلفة والجدول الزمني، ثم **تُوثَّق**.",
        ),
        bi("The analyst's understanding of the requirements improves with every round.", "ويتحسّن فهم المحلل للمتطلبات مع كل جولة."),
      ],
    },
    {
      id: "discovery",
      pill: bi("Discovery", "الاكتشاف"),
      heading: bi("Three ways to discover requirements", "ثلاث طرق لاكتشاف المتطلبات"),
      control: {
        label: bi("Technique", "التقنية"),
        options: [
          { id: "interviews", label: bi("Interviews", "المقابلات") },
          { id: "scenarios", label: bi("Scenarios", "السيناريوهات") },
          { id: "ethnography", label: bi("Ethnography", "الإثنوغرافيا") },
        ],
        initial: "interviews",
      },
      points: [
        bi(
          "**Requirements discovery** draws requirements out of stakeholders: by asking them, by walking through stories of use, or by watching them work.",
          "**اكتشاف المتطلبات (requirements discovery)** يستخرج المتطلبات من أصحاب المصلحة: بسؤالهم، أو بتتبّع قصص الاستخدام، أو بمراقبتهم أثناء العمل.",
        ),
      ],
      pointsFor: {
        interviews: [
          bi(
            "**Interviews** are **closed** (a fixed list of questions) or **open** (issues explored freely), usually a mix. Listen without preconceptions, and prompt with questions, a proposal or a prototype.",
            "**المقابلات (interviews)** إما **مغلقة** (قائمة ثابتة من الأسئلة) وإما **مفتوحة** (استكشاف القضايا بحرية)، وعادةً يُمزج بينهما. استمع دون أفكار مسبقة، وحفّز النقاش بالأسئلة أو بمقترح أو بنموذج أولي (prototype).",
          ),
        ],
        scenarios: [
          bi(
            "A **scenario** is a real-life story of one task: the start, the normal flow, what can go wrong, other activities, and the end state. Here a nurse collects a patient's medical history.",
            "**السيناريو (scenario)** قصة واقعية لمهمة واحدة: البداية، والمسار الطبيعي، وما قد يحدث من خطأ، والأنشطة الأخرى، والحالة النهائية. وهنا تجمع ممرضة التاريخ الطبي لمريض.",
          ),
        ],
        ethnography: [
          bi(
            "In **ethnography** the analyst watches people at work and finds **implicit** requirements they would never mention. It suits existing processes, but it can't come up with new features.",
            "في **الإثنوغرافيا (ethnography)** يراقب المحلل الأشخاص أثناء عملهم، فيكتشف متطلبات **ضمنية** لن يذكروها أبدًا. وهي تناسب العمليات القائمة، لكنها لا تستطيع اقتراح ميزات جديدة.",
          ),
        ],
      },
    },
    {
      id: "srs",
      pill: bi("The SRS", "وثيقة SRS"),
      heading: bi("The SRS: one document, many readers", "وثيقة SRS: وثيقة واحدة وقرّاء كثيرون"),
      points: [
        bi(
          "**Specification** writes the user and system requirements into a **requirements document**, ideally clear, unambiguous, complete and consistent.",
          "**التوصيف (specification)** يكتب متطلبات المستخدم والنظام في **وثيقة المتطلبات**، ومن المثالي أن تكون واضحة وخالية من الغموض ومكتملة ومتسقة.",
        ),
        bi(
          "The **SRS** is the official statement of what the developers must build, and it can be part of the **contract**. Detailed system requirements may go in a separate document.",
          "**وثيقة SRS** هي البيان الرسمي لما يجب على المطورين بناؤه، وقد تكون جزءًا من **العقد**. وقد توضع متطلبات النظام التفصيلية في وثيقة منفصلة.",
        ),
        bi(
          "Its readers range from customers checking their needs to test engineers deriving tests, so it must serve them all.",
          "ويتنوع قرّاؤها من العملاء الذين يتحققون من احتياجاتهم إلى مهندسي الاختبار الذين يشتقون الاختبارات منها، لذا يجب أن تخدمهم جميعًا.",
        ),
      ],
    },
    {
      id: "validation",
      pill: bi("Validation", "التحقق من الصلاحية"),
      heading: bi("Four checks on the requirements document", "أربعة فحوص لوثيقة المتطلبات"),
      control: {
        label: bi("Document", "الوثيقة"),
        options: [
          { id: "draft", label: bi("First draft", "المسودة الأولى") },
          { id: "fixed", label: bi("After fixes", "بعد التصحيح") },
        ],
        initial: "draft",
      },
      points: [
        bi(
          "In **validation**, customers and developers read the document in detail, check its **validity**, **consistency**, **completeness** and **realism**, and agree how to fix what they find.",
          "في **التحقق من الصلاحية (validation)** يقرأ العملاء والمطورون الوثيقة بالتفصيل، ويفحصون **صلاحيتها** و**اتساقها** و**اكتمالها** و**واقعيتها**، ثم يتفقون على طريقة تصحيح ما يجدونه.",
        ),
      ],
      pointsFor: {
        draft: [
          bi(
            "This draft fails all four: reports nobody asked for, a conflict, a missing function and an impossible target.",
            "هذه المسودة تُخفق في الفحوص الأربعة: تقارير لم يطلبها أحد، وتعارض، ووظيفة ناقصة، وهدف مستحيل.",
          ),
        ],
        fixed: [bi("After negotiation each problem is fixed, and the same four checks pass.", "بعد التفاوض يُصحَّح كل خلل، فتنجح الفحوص الأربعة نفسها.")],
      },
    },
    {
      id: "techniques",
      pill: bi("Techniques", "التقنيات"),
      heading: bi("Reviews and prototypes", "المراجعات والنماذج الأولية"),
      control: {
        label: bi("Technique", "التقنية"),
        options: [
          { id: "review", label: bi("Review", "المراجعة") },
          { id: "prototype", label: bi("Prototype", "النموذج الأولي") },
        ],
        initial: "review",
      },
      points: [bi("Validation techniques can be used on their own or together.", "يمكن استخدام تقنيات التحقق من الصلاحية منفردة أو مجتمعة.")],
      pointsFor: {
        review: [
          bi(
            "**Requirements reviews**: a team reads the document systematically and lists every problem it finds.",
            "**مراجعات المتطلبات (requirements reviews)**: يقرأ فريق الوثيقة بصورة منهجية ويسجّل كل مشكلة يجدها.",
          ),
        ],
        prototype: [
          bi(
            "**Prototyping**: users try an executable model of the system, and a wrong requirement shows up as soon as they use it. Here it catches the one-clinic search from requirement 1.",
            "**بناء النماذج الأولية (prototyping)**: يجرّب المستخدمون نموذجًا قابلًا للتنفيذ من النظام، فيظهر المتطلب الخاطئ بمجرد استخدامه. وهنا يكشف البحث المقيَّد بعيادة واحدة في المتطلب 1.",
          ),
        ],
      },
    },
  ],
});

/** Every walkthrough in this lecture, registered in lib/walkthroughs/index.ts. */
export const all = [requirements, userSystem, frNfr, reProcess] as const;

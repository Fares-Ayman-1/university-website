import { bi } from "@/components/widgets/types";
import { defineWalkthrough } from "@/lib/widgets/walkthrough";

/*
 * Software Engineering · Lecture 3 (content/subjects/software-engineering/lectures/03-agile-methods.mdx).
 * One walkthrough per heading; the scenes are in
 * components/widgets/walkthrough/scenes/software-engineering/lecture-03/.
 */

// ---------- Why agile? ----------
export const why = defineWalkthrough({
  id: "se3-why",
  title: bi("Why plan-driven development struggles", "لماذا يتعثر التطوير الموجَّه بالخطة"),
  analogy: bi(
    "Planning a road trip by fixing every turn before you leave, then finding roads closed on the way. Agile checks the map at every junction.",
    "التخطيط لرحلة بالسيارة بتحديد كل منعطف قبل الانطلاق، ثم اكتشاف طرق مغلقة في الطريق؛ أما الأسلوب الرشيق فيراجع الخريطة عند كل تقاطع.",
  ),
  panels: [
    {
      id: "unclear",
      pill: bi("Unclear requirements", "متطلبات غير واضحة"),
      heading: bi("Requirements are discovered, not known up front", "المتطلبات تُكتشف ولا تُعرف مسبقًا"),
      points: [
        bi(
          "Customers often **don't know exactly what they want**, so not every requirement can be found at the start.",
          "كثيرًا ما **لا يعرف العملاء بالضبط ما يريدون**، لذلك لا يمكن اكتشاف كل المتطلبات (requirements) في البداية.",
        ),
        bi(
          "As the project runs, new requirements are **discovered** and old ones **change** with the business priorities.",
          "ومع سير المشروع **تُكتشف** متطلبات جديدة و**تتغير** متطلبات قديمة تبعًا لأولويات العمل.",
        ),
      ],
    },
    {
      id: "rework",
      pill: bi("Costly change", "تغيير مكلف"),
      heading: bi("In a plan-driven project, a late change means rework", "في المشروع الموجَّه بالخطة يعني التغيير المتأخر إعادة العمل"),
      control: {
        label: bi("A change arrives during", "يصل التغيير أثناء"),
        options: [
          { id: "late", label: bi("Testing", "الاختبار") },
          { id: "early", label: bi("Requirements", "المتطلبات") },
        ],
        initial: "late",
      },
      points: [
        bi(
          "**Plan-driven** development fixes the requirements first, then designs, codes and tests in sequence.",
          "يثبّت التطوير **الموجَّه بالخطة (plan-driven)** المتطلبات أولًا، ثم يصمّم ويكتب الشيفرة ويختبر بالتتابع.",
        ),
      ],
      pointsFor: {
        late: [
          bi(
            "A change found **during testing** sends the work back through requirements, design and code: **costly rework**, and the delivery slips.",
            "التغيير الذي يُكتشف **أثناء الاختبار** يعيد العمل عبر المتطلبات والتصميم والشيفرة: **إعادة عمل (rework) مكلفة**، ويتأخر التسليم.",
          ),
        ],
        early: [
          bi(
            "The same change found **during requirements** only edits the requirements document.",
            "أما التغيير نفسه إذا اكتُشف **أثناء المتطلبات** فلا يعدّل إلا وثيقة المتطلبات (requirements document).",
          ),
        ],
      },
    },
    {
      id: "feedback",
      pill: bi("Late feedback", "ملاحظات متأخرة"),
      heading: bi("Feedback and value: once at the end, or every few weeks", "الملاحظات والقيمة: مرة في النهاية أم كل بضعة أسابيع"),
      control: {
        label: bi("Deliver", "التسليم"),
        options: [
          { id: "once", label: bi("Once, at the end", "مرة واحدة في النهاية") },
          { id: "often", label: bi("Every 2 weeks", "كل أسبوعين") },
        ],
        initial: "once",
      },
      points: [
        bi(
          "Long plan-driven cycles mean customer **feedback comes late** and business value waits until the end.",
          "تعني الدورات الطويلة في التطوير الموجَّه بالخطة (plan-driven) أن **ملاحظات العميل تأتي متأخرة**، وأن القيمة للعمل تنتظر حتى النهاية.",
        ),
      ],
      pointsFor: {
        once: [
          bi(
            "If the customer first sees the system in week 12, every misunderstanding is found in week 12.",
            "إذا لم يرَ العميل النظام لأول مرة إلا في الأسبوع 12، فكل سوء فهم يُكتشف في الأسبوع 12.",
          ),
        ],
        often: [
          bi(
            "Agile delivers a working **increment** every couple of weeks, so the customer uses it early and steers the next one. **Rapid delivery** is now a basic requirement.",
            "أما الأسلوب الرشيق (agile) فيسلّم **زيادة (increment)** عاملة كل بضعة أسابيع، فيستخدمها العميل مبكرًا ويوجّه الزيادة التالية. وقد أصبح **التسليم السريع** متطلبًا أساسيًا.",
          ),
        ],
      },
    },
  ],
});

// ---------- The Agile Manifesto ----------
export const manifesto = defineWalkthrough({
  id: "se3-manifesto",
  title: bi("The four values of the Agile Manifesto", "القيم الأربع في البيان الرشيق"),
  analogy: bi(
    "A cook who tastes the soup while cooking instead of following the recipe to the letter. The recipe still matters; the tasting matters more.",
    "طاهٍ يتذوّق الحساء أثناء الطهي بدلًا من اتباع الوصفة حرفيًا؛ فالوصفة ما زالت مهمة، لكن التذوّق أهم.",
  ),
  panels: [
    {
      id: "over",
      pill: bi("Left over right", "الأيسر أكثر من الأيمن"),
      heading: bi("Four pairs, and the left side weighs more", "أربعة أزواج، والجانب الأيسر أثقل"),
      points: [
        bi(
          "The **Agile Manifesto** lists four pairs. In each, the item on the left is valued **more** than the item on the right.",
          "يضع **البيان الرشيق (Agile Manifesto)** أربعة أزواج، وفي كل زوج يُقدَّر العنصر الأيسر **أكثر** من العنصر الأيمن.",
        ),
        bi(
          "The right-hand items **still have value**: agile teams still use processes, documents, contracts and plans.",
          "ولا تزال للعناصر اليمنى **قيمة**: فالفرق الرشيقة ما زالت تستخدم العمليات والوثائق والعقود والخطط.",
        ),
      ],
    },
    {
      id: "people",
      pill: bi("People", "الأفراد"),
      heading: bi("Individuals and interactions over processes and tools", "الأفراد والتفاعلات أكثر من العمليات والأدوات"),
      control: {
        label: bi("A developer's question goes through", "يمر سؤال المطوّر عبر"),
        options: [
          { id: "process", label: bi("The process", "العملية") },
          { id: "talk", label: bi("A conversation", "محادثة") },
        ],
        initial: "process",
      },
      points: [
        bi(
          "Skilled people talking directly solve problems faster than a process or a tool can route them.",
          "الأشخاص المهرة الذين يتحدثون مباشرة يحلّون المشكلات أسرع مما تستطيع عملية أو أداة توجيهها.",
        ),
      ],
      pointsFor: {
        process: [
          bi(
            "Routed through a formal **process**, a simple question waits in forms, tools and queues.",
            "عند توجيهه عبر **عملية (process)** رسمية، ينتظر السؤال البسيط في النماذج والأدوات وقوائم الانتظار.",
          ),
        ],
        talk: [
          bi(
            "Asked **face to face**, it is answered at once. The tool still records the answer, but it no longer stands in the way.",
            "وعند طرحه **وجهًا لوجه** يُجاب عنه فورًا، وما زالت الأداة تسجّل الإجابة لكنها لم تعد عائقًا.",
          ),
        ],
      },
    },
    {
      id: "software",
      pill: bi("Working software", "البرمجيات العاملة"),
      heading: bi("Working software over comprehensive documentation", "البرمجيات العاملة أكثر من التوثيق الشامل"),
      control: {
        label: bi("After 6 weeks the team has", "بعد 6 أسابيع يملك الفريق"),
        options: [
          { id: "docs", label: bi("A full specification", "توصيفًا كاملًا") },
          { id: "running", label: bi("A running increment", "زيادة تعمل") },
        ],
        initial: "docs",
      },
      points: [
        bi(
          "Progress is measured by software that **runs**, not by pages written about it.",
          "يُقاس التقدم بالبرمجيات التي **تعمل** فعلًا، لا بعدد الصفحات المكتوبة عنها.",
        ),
      ],
      pointsFor: {
        docs: [
          bi(
            "A complete **specification** is useful, but the customer can't **try** a document.",
            "**التوصيف (specification)** الكامل مفيد، لكن العميل لا يستطيع **تجربة** وثيقة.",
          ),
        ],
        running: [
          bi(
            "A small increment that runs lets the customer try it and say what's wrong **now**. Light notes are kept alongside it.",
            "أما الزيادة (increment) الصغيرة التي تعمل فتسمح للعميل بتجربتها وقول ما هو خاطئ **الآن**، مع الاحتفاظ بملاحظات خفيفة بجانبها.",
          ),
        ],
      },
    },
    {
      id: "customer",
      pill: bi("Collaboration", "التعاون"),
      heading: bi("Customer collaboration over contract negotiation", "التعاون مع العميل أكثر من التفاوض على العقود"),
      control: {
        label: bi("When the customer wants a change", "عندما يريد العميل تغييرًا"),
        options: [
          { id: "contract", label: bi("Renegotiate the contract", "يُعاد التفاوض على العقد") },
          { id: "together", label: bi("Work it out together", "يُتفق عليه معًا") },
        ],
        initial: "contract",
      },
      points: [
        bi(
          "The customer works **with** the team throughout the project, not across a negotiating table from it.",
          "يعمل العميل **مع** الفريق طوال المشروع، لا في مواجهته على طاولة التفاوض.",
        ),
      ],
      pointsFor: {
        contract: [
          bi(
            "With a fixed contract, every change outside the agreed scope becomes a **negotiation** before any work starts.",
            "مع عقد ثابت، يتحول كل تغيير خارج النطاق المتفق عليه إلى **تفاوض (negotiation)** قبل أن يبدأ أي عمل.",
          ),
        ],
        together: [
          bi(
            "Working together, the change is agreed and planned into the **next increment**. A contract still exists, but it isn't the main channel.",
            "وعند العمل معًا يُتفق على التغيير ويُخطَّط له في **الزيادة (increment) التالية**؛ وما زال هناك عقد، لكنه لم يعد قناة التواصل الرئيسية.",
          ),
        ],
      },
    },
    {
      id: "change",
      pill: bi("Change", "التغيير"),
      heading: bi("Responding to change over following a plan", "الاستجابة للتغيير أكثر من اتباع خطة"),
      control: {
        label: bi("The goal moves. The team", "يتحرك الهدف، والفريق"),
        options: [
          { id: "plan", label: bi("Follows the plan", "يتبع الخطة") },
          { id: "respond", label: bi("Responds", "يستجيب") },
        ],
        initial: "plan",
      },
      points: [
        bi(
          "Agile teams still plan, but each plan is **revised** as soon as the needs change.",
          "ما زالت الفرق الرشيقة تخطط، لكن كل خطة **تُراجَع** بمجرد أن تتغير الاحتياجات.",
        ),
      ],
      pointsFor: {
        plan: [
          bi(
            "Following the original plan to the letter delivers what was asked for months ago, not what is needed now.",
            "اتباع الخطة الأصلية حرفيًا يسلّم ما طُلب قبل أشهر، لا ما هو مطلوب الآن.",
          ),
        ],
        respond: [
          bi(
            "Checking the direction at short intervals lets the team **steer toward the new goal** at little cost.",
            "مراجعة الاتجاه على فترات قصيرة تتيح للفريق **التوجّه نحو الهدف الجديد** بتكلفة قليلة.",
          ),
        ],
      },
    },
  ],
});

// ---------- Key agile principles ----------
export const principles = defineWalkthrough({
  id: "se3-principles",
  title: bi("Five principles behind agile methods", "خمسة مبادئ وراء الأساليب الرشيقة"),
  analogy: bi(
    "A tailor who fits the suit on you at every visit, sews one piece at a time, and lets you change your mind about the buttons.",
    "خيّاط يقيس البدلة عليك في كل زيارة، ويخيط قطعة في كل مرة، ويسمح لك بتغيير رأيك في الأزرار.",
  ),
  panels: [
    {
      id: "involvement",
      pill: bi("Customer involvement", "مشاركة العميل"),
      heading: bi("The customer is involved all the way through", "العميل مشارك طوال الطريق"),
      points: [
        bi(
          "Customers are **closely involved** throughout development, not only at the start and the end.",
          "يشارك العملاء **عن قرب** طوال مدة التطوير، لا في البداية والنهاية فقط.",
        ),
        bi(
          "They supply and **prioritize** the requirements, and **evaluate** each new increment.",
          "فهم يقدّمون المتطلبات و**يرتّبون أولوياتها**، و**يقيّمون** كل زيادة (increment) جديدة.",
        ),
      ],
    },
    {
      id: "incremental",
      pill: bi("Incremental delivery", "التسليم التزايدي"),
      heading: bi("Deliver in increments, most valuable first", "سلّم على زيادات، الأعلى قيمة أولًا"),
      points: [
        bi(
          "The software is developed in **increments**; each one adds a few features to a system the customer already uses.",
          "تُطوَّر البرمجيات على **زيادات (increments)**، تضيف كل منها بضع ميزات إلى نظام يستخدمه العميل بالفعل.",
        ),
        bi(
          "The customer's **priorities** decide what goes into each increment, so the most valuable features arrive first.",
          "و**أولويات** العميل هي التي تحدد محتوى كل زيادة، فتصل الميزات الأعلى قيمة أولًا.",
        ),
      ],
    },
    {
      id: "people",
      pill: bi("People, not process", "الأشخاص لا العملية"),
      heading: bi("The team chooses how it works", "الفريق يختار طريقة عمله"),
      control: {
        label: bi("Ways of working are", "طرق العمل"),
        options: [
          { id: "prescribed", label: bi("Prescribed", "مفروضة") },
          { id: "chosen", label: bi("Chosen by the team", "يختارها الفريق") },
        ],
        initial: "prescribed",
      },
      points: [
        bi(
          "Agile trusts the **skills of the team** more than a fixed, prescriptive process.",
          "تثق الأساليب الرشيقة في **مهارات الفريق** أكثر من ثقتها في عملية ثابتة مفروضة.",
        ),
      ],
      pointsFor: {
        prescribed: [
          bi(
            "A prescribed process gives everyone the same steps, whatever each person is good at.",
            "العملية المفروضة تعطي الجميع الخطوات نفسها، أيًّا كان ما يُتقنه كل فرد.",
          ),
        ],
        chosen: [
          bi(
            "The team members are left to **develop their own ways of working**, and they keep what helps.",
            "ويُترك لأعضاء الفريق أن **يطوّروا طرق عملهم الخاصة**، فيحتفظون بما يساعدهم.",
          ),
        ],
      },
    },
    {
      id: "change",
      pill: bi("Embrace change", "تقبُّل التغيير"),
      heading: bi("Expect requirements to change, and design for it", "توقّع تغيّر المتطلبات وصمّم لذلك"),
      control: {
        label: bi("A new way to pay is needed. The design is", "مطلوب طريقة دفع جديدة، والتصميم"),
        options: [
          { id: "rigid", label: bi("Rigid", "جامد") },
          { id: "ready", label: bi("Ready for change", "مستعد للتغيير") },
        ],
        initial: "rigid",
      },
      points: [
        bi(
          "Agile teams **expect** the requirements to change, so they design the system to **accommodate** change.",
          "تتوقع الفرق الرشيقة **أن تتغير** المتطلبات، لذلك تصمّم النظام بحيث **يستوعب** التغيير.",
        ),
      ],
      pointsFor: {
        rigid: [
          bi(
            "When card-payment logic is copied into every module, a new payment method means editing all of them.",
            "عندما يُنسخ منطق الدفع بالبطاقة في كل وحدة (module)، تعني طريقة الدفع الجديدة تعديل الوحدات كلها.",
          ),
        ],
        ready: [
          bi(
            "Behind one payment **interface**, the new method is **one new module**, and nothing else changes.",
            "أما خلف **واجهة (interface)** دفع واحدة، فتصبح الطريقة الجديدة **وحدة جديدة واحدة**، ولا يتغير شيء آخر.",
          ),
        ],
      },
    },
    {
      id: "simplicity",
      pill: bi("Maintain simplicity", "الحفاظ على البساطة"),
      heading: bi("Keep the software and the process simple", "أبقِ البرمجيات والعملية بسيطتين"),
      control: {
        label: bi("Simplify", "بسّط"),
        options: [
          { id: "software", label: bi("The software", "البرمجيات") },
          { id: "process", label: bi("The process", "العملية") },
        ],
        initial: "software",
      },
      points: [
        bi(
          "Simplicity applies to **both** the software being built and the way it is built.",
          "تنطبق البساطة على **كلٍّ من** البرمجيات التي تُبنى وطريقة بنائها.",
        ),
      ],
      pointsFor: {
        software: [
          bi(
            "Code written **just in case** must still be read, tested and changed. Simple software is cheaper to change.",
            "الشيفرة المكتوبة **احتياطًا** لا بد أن تُقرأ وتُختبر وتُعدَّل، أما البرمجيات البسيطة فتعديلها أرخص.",
          ),
        ],
        process: [
          bi(
            "Every report or approval that adds nothing takes time away from **building the software**.",
            "كل تقرير أو موافقة لا تضيف شيئًا تأخذ وقتًا من **بناء البرمجيات**.",
          ),
        ],
      },
    },
  ],
});

// ---------- Extreme Programming (XP) ----------
export const xp = defineWalkthrough({
  id: "se3-xp",
  title: bi("Extreme Programming in practice", "البرمجة القصوى في التطبيق"),
  analogy: bi(
    "A restaurant kitchen: the order ticket says what the dish must be before cooking starts, cooks work in pairs, they clean as they go, and small plates leave the kitchen all evening.",
    "مطبخ مطعم: تحدد ورقة الطلب ما يجب أن يكون عليه الطبق قبل بدء الطهي، ويعمل الطهاة في أزواج، وينظّفون أولًا بأول، وتخرج أطباق صغيرة من المطبخ طوال المساء.",
  ),
  panels: [
    {
      id: "release-cycle",
      pill: bi("Release cycle", "دورة الإصدار"),
      heading: bi("The XP release cycle", "دورة الإصدار في XP"),
      points: [
        bi(
          "Each release starts from the **user stories** the customer selects, which are broken into **tasks** and planned.",
          "يبدأ كل إصدار من **قصص المستخدم (user stories)** التي يختارها العميل، ثم تُقسَّم إلى **مهام (tasks)** ويُخطَّط لها.",
        ),
        bi(
          "New builds happen **several times a day**, an increment reaches the customer about **every 2 weeks**, and a build is accepted only if **all tests pass**.",
          "يتم بناء (build) نسخ جديدة **عدة مرات في اليوم**، وتصل زيادة إلى العميل **كل أسبوعين** تقريبًا، ولا يُقبل البناء إلا إذا **نجحت كل الاختبارات**.",
        ),
      ],
    },
    {
      id: "stories",
      pill: bi("User stories", "قصص المستخدم"),
      heading: bi("A story card becomes tasks and estimates", "بطاقة القصة تصبح مهام وتقديرات"),
      points: [
        bi(
          "The customer, who is **part of the XP team**, writes the requirements as **user stories** on cards.",
          "يكتب العميل، وهو **جزء من فريق XP**، المتطلبات في صورة **قصص مستخدم (user stories)** على بطاقات.",
        ),
        bi(
          "The developers break each story into **tasks** and estimate them; the estimates are the basis of the schedule and the cost.",
          "يقسّم المطورون كل قصة إلى **مهام (tasks)** ويقدّرونها، وتكون هذه التقديرات أساس الجدول الزمني والتكلفة.",
        ),
        bi(
          "The customer then **chooses** the stories for the next release by priority. The weak spot: no one can be sure the stories are **complete**.",
          "ثم **يختار** العميل القصص للإصدار التالي حسب الأولوية. ونقطة الضعف: لا يمكن لأحد أن يتأكد من **اكتمال (completeness)** القصص.",
        ),
      ],
    },
    {
      id: "practices",
      pill: bi("XP practices", "ممارسات XP"),
      heading: bi("Each agile principle, backed by XP practices", "كل مبدأ رشيق تدعمه ممارسات XP"),
      control: {
        label: bi("Practices about", "ممارسات تخص"),
        options: [
          { id: "planning", label: bi("Planning", "التخطيط") },
          { id: "team", label: bi("The team", "الفريق") },
          { id: "code", label: bi("The code", "الشيفرة") },
        ],
        initial: "planning",
      },
      points: [
        bi(
          "XP turns the agile principles into concrete **practices**, and several practices support more than one principle.",
          "تحوّل XP المبادئ الرشيقة إلى **ممارسات (practices)** ملموسة، وتدعم عدة ممارسات أكثر من مبدأ واحد.",
        ),
      ],
      pointsFor: {
        planning: [
          bi(
            "**Incremental delivery**: releases are planned from story cards, and the system ships in small, frequent releases.",
            "**التسليم التزايدي (Incremental delivery)**: يُخطَّط للإصدارات انطلاقًا من بطاقات القصص، ويُطرح النظام في إصدارات صغيرة ومتكررة.",
          ),
          bi(
            "**Customer involvement**: a customer representative works in the team and defines the **acceptance tests**.",
            "**مشاركة العميل (Customer involvement)**: يعمل ممثل للعميل ضمن الفريق ويحدد **اختبارات القبول (acceptance tests)**.",
          ),
        ],
        team: [
          bi(
            "**People, not process**: pair programming, **collective ownership** of the code, and a **sustainable pace** without excessive overtime.",
            "**الأشخاص لا العملية (People, not process)**: البرمجة الثنائية (pair programming)، و**الملكية الجماعية (collective ownership)** للشيفرة، و**إيقاع مستدام (sustainable pace)** دون عمل إضافي مفرط.",
          ),
        ],
        code: [
          bi(
            "**Embrace change**: regular releases, test-first development, refactoring and **continuous integration**.",
            "**تقبُّل التغيير (Embrace change)**: إصدارات منتظمة، والتطوير بالاختبار أولًا (test-first)، وإعادة الهيكلة (refactoring)، و**التكامل المستمر (continuous integration)**.",
          ),
          bi(
            "**Maintain simplicity**: constant refactoring, and **simple designs** that don't try to anticipate future changes.",
            "**الحفاظ على البساطة (Maintain simplicity)**: إعادة هيكلة (refactoring) مستمرة، و**تصميمات بسيطة** لا تحاول توقّع التغييرات المستقبلية.",
          ),
        ],
      },
    },
    {
      id: "refactoring",
      pill: bi("Refactoring", "إعادة الهيكلة"),
      heading: bi("Refactoring: better structure, same behaviour", "إعادة الهيكلة: بنية أفضل والسلوك نفسه"),
      control: {
        label: bi("Over five increments, the team", "على مدى خمس زيادات، الفريق"),
        options: [
          { id: "patch", label: bi("Only patches", "يرقّع فقط") },
          { id: "refactor", label: bi("Refactors constantly", "يعيد الهيكلة باستمرار") },
        ],
        initial: "patch",
      },
      points: [
        bi(
          "Incremental development tends to **degrade the structure**: quick fixes add duplicated code and inappropriate reuse.",
          "يميل التطوير التزايدي (incremental) إلى **تدهور البنية**: إذ تضيف الحلول السريعة شيفرة مكررة وإعادة استخدام غير ملائمة.",
        ),
        bi(
          "**Refactoring** improves the **internal structure** of code **without changing its external behaviour**.",
          "**إعادة الهيكلة (refactoring)** تحسّن **البنية الداخلية** للشيفرة **دون تغيير سلوكها الخارجي**.",
        ),
      ],
      pointsFor: {
        patch: [
          bi(
            "With patches only, the same code is copied around and the effort for each new change keeps growing.",
            "مع الترقيع فقط تُنسخ الشيفرة نفسها في أماكن عدة، ويظل الجهد اللازم لكل تغيير جديد في ازدياد.",
          ),
        ],
        refactor: [
          bi(
            "Moving the duplicated code into one shared parent class keeps changes cheap, and the automated tests show the behaviour is unchanged.",
            "نقل الشيفرة المكررة إلى صنف أب (parent class) مشترك واحد يُبقي التغييرات رخيصة، وتُثبت الاختبارات المؤتمتة أن السلوك لم يتغير.",
          ),
        ],
      },
    },
    {
      id: "test-first",
      pill: bi("Test-first", "الاختبار أولًا"),
      heading: bi("Write the test, watch it fail, then write the code", "اكتب الاختبار وشاهده يفشل، ثم اكتب الشيفرة"),
      control: {
        label: bi("Tests are written", "تُكتب الاختبارات"),
        options: [
          { id: "after", label: bi("After the code", "بعد الشيفرة") },
          { id: "first", label: bi("Before the code", "قبل الشيفرة") },
        ],
        initial: "after",
      },
      points: [
        bi(
          "In XP the tests are written **before** the code and are **automated**; development moves on only when all of them pass.",
          "في XP تُكتب الاختبارات **قبل** الشيفرة وتكون **مؤتمتة**، ولا يتقدم التطوير إلا عندما تنجح كلها.",
        ),
      ],
      pointsFor: {
        after: [
          bi(
            "Written after the code, tests fall behind the implementation (**test lag**), and some are never written at all.",
            "عندما تُكتب الاختبارات بعد الشيفرة تتخلف عن التنفيذ (**تأخر الاختبار test lag**)، وبعضها لا يُكتب أبدًا.",
          ),
        ],
        first: [
          bi(
            "The new test **fails** first, the code is written until it **passes**, then it is tidied while every test stays green.",
            "يفشل الاختبار الجديد **أولًا**، ثم تُكتب الشيفرة حتى **ينجح**، ثم تُرتَّب الشيفرة مع بقاء كل الاختبارات ناجحة.",
          ),
          bi(
            "Writing the test first fixes the **interface** and the expected **behaviour**, and forces unclear requirements to be settled early.",
            "كتابة الاختبار أولًا تحدد **الواجهة (interface)** و**السلوك** المتوقع، وتفرض حسم المتطلبات الغامضة مبكرًا.",
          ),
        ],
      },
    },
    {
      id: "pairs",
      pill: bi("Pair programming", "البرمجة الثنائية"),
      heading: bi("Two people, one computer, changing partners", "شخصان وحاسوب واحد، مع تبديل الشركاء"),
      control: {
        label: bi("Look at", "انظر إلى"),
        options: [
          { id: "pair", label: bi("One pair", "زوج واحد") },
          { id: "team", label: bi("The whole team", "الفريق كله") },
        ],
        initial: "pair",
      },
      points: [
        bi("**Two developers work together at one computer** on the same code.", "**يعمل مطوّران معًا على حاسوب واحد** على الشيفرة نفسها."),
      ],
      pointsFor: {
        pair: [
          bi(
            "Every line is checked by a second person as it is written: an informal, continuous **review** that is much cheaper than a formal inspection.",
            "كل سطر يفحصه شخص ثانٍ أثناء كتابته: **مراجعة (review)** مستمرة وغير رسمية، أرخص بكثير من الفحص الرسمي (formal inspection).",
          ),
        ],
        team: [
          bi(
            "Pairs change **dynamically**, so everyone works with everyone. Knowledge spreads, the whole team **owns** the code, and refactoring pays off for all.",
            "تتغير الأزواج **ديناميكيًا**، فيعمل الجميع مع الجميع؛ فتنتشر المعرفة، ويصبح الفريق كله **مالكًا** للشيفرة، وتعود إعادة الهيكلة (refactoring) بالنفع على الجميع.",
          ),
        ],
      },
    },
  ],
});

// ---------- Scrum ----------
export const scrum = defineWalkthrough({
  id: "se3-scrum",
  title: bi("How a Scrum project runs", "كيف يسير مشروع Scrum"),
  analogy: bi(
    "A season of fixed-length matches: before each one the team picks its goals from a long list, after it they watch the replay with the fans, and the Scrum master keeps reporters off the pitch while they play.",
    "موسم من مباريات ثابتة المدة: قبل كل مباراة يختار الفريق أهدافه من قائمة طويلة، وبعدها يشاهد الإعادة مع الجمهور، ويُبعد Scrum master الصحفيين عن الملعب أثناء اللعب.",
  ),
  panels: [
    {
      id: "phases",
      pill: bi("Three phases", "ثلاث مراحل"),
      heading: bi("Outline planning, sprint cycles, project closure", "التخطيط المبدئي ودورات السبرنت وإغلاق المشروع"),
      points: [
        bi(
          "Scrum manages iterative development in **three phases**: outline planning, a series of **sprint cycles**, then project closure.",
          "يدير Scrum التطوير التكراري في **ثلاث مراحل**: التخطيط المبدئي، ثم سلسلة من **دورات السبرنت (sprint cycles)**، ثم إغلاق المشروع.",
        ),
        bi(
          "Planning sets the general objectives and the **architecture**. Each sprint, normally 2–4 weeks, develops one **increment** of the system.",
          "يحدد التخطيط الأهداف العامة و**المعمارية (architecture)**، ويطوّر كل سبرنت، ومدته عادةً من 2 إلى 4 أسابيع، **زيادة (increment)** واحدة من النظام.",
        ),
        bi(
          "Closure completes the documentation, such as user manuals, and assesses the **lessons learned**.",
          "ويستكمل الإغلاق التوثيق، مثل أدلة المستخدم، ويقيّم **الدروس المستفادة**.",
        ),
      ],
    },
    {
      id: "select",
      pill: bi("Assess and select", "التقييم والاختيار"),
      heading: bi("From the product backlog to this sprint's work", "من قائمة أعمال المنتج إلى عمل هذا السبرنت"),
      points: [
        bi(
          "**Assess**: planning starts from the **product backlog**, the list of work to be done. Priorities and risks are reviewed, and the customer can add new requirements.",
          "**التقييم (Assess)**: يبدأ التخطيط من **قائمة أعمال المنتج (product backlog)**، وهي قائمة العمل المطلوب إنجازه. وتُراجَع الأولويات والمخاطر، ويمكن للعميل إضافة متطلبات جديدة.",
        ),
        bi(
          "**Select**: the whole team works with the customer to choose the features for this sprint, as much as fits in its fixed length.",
          "**الاختيار (Select)**: يعمل الفريق بأكمله مع العميل لاختيار ميزات هذا السبرنت، بقدر ما تتسع له مدته الثابتة.",
        ),
      ],
    },
    {
      id: "develop",
      pill: bi("Develop", "التطوير"),
      heading: bi("The team organizes itself; daily scrums keep it on track", "الفريق ينظّم نفسه، واجتماعات Scrum اليومية تبقيه على المسار"),
      points: [
        bi("**Develop**: the team **organizes itself** to build the selected features.", "**التطوير (Develop)**: **ينظّم الفريق نفسه** لبناء الميزات المختارة."),
        bi(
          "A short **daily scrum** reviews progress and re-prioritizes if needed, and the **Scrum board** shows everyone what the others are doing.",
          "يراجع **اجتماع Scrum اليومي (daily scrum)** القصير التقدم ويعيد ترتيب الأولويات عند الحاجة، وتُظهر **لوحة Scrum (Scrum board)** للجميع ما يفعله الآخرون.",
        ),
      ],
    },
    {
      id: "review",
      pill: bi("Review", "المراجعة"),
      heading: bi("Show the increment, then start the next sprint", "اعرض الزيادة ثم ابدأ السبرنت التالي"),
      points: [
        bi(
          "At the end of the sprint the work is **reviewed** and the increment is shown to the **stakeholders**.",
          "في نهاية السبرنت **يُراجَع** العمل وتُعرض الزيادة (increment) على **أصحاب المصلحة (stakeholders)**.",
        ),
        bi(
          "What they say goes back into the **product backlog**, and the **next sprint** starts from there.",
          "وما يقولونه يعود إلى **قائمة أعمال المنتج (product backlog)**، ومنها يبدأ **السبرنت التالي**.",
        ),
      ],
    },
    {
      id: "master",
      pill: bi("Scrum master", "Scrum master"),
      heading: bi("The Scrum master protects the team and facilitates", "Scrum master يحمي الفريق ويُيسِّر العمل"),
      control: {
        label: bi("Outside requests go", "تذهب الطلبات الخارجية"),
        options: [
          { id: "direct", label: bi("Straight to developers", "إلى المطورين مباشرة") },
          { id: "master", label: bi("Through the Scrum master", "عبر Scrum master") },
        ],
        initial: "direct",
      },
      points: [
        bi(
          "Scrum avoids the title **project manager**: the whole team makes decisions, and the **Scrum master** is a **facilitator**.",
          "يتجنب Scrum لقب **مدير المشروع (project manager)**: فالفريق كله يتخذ القرارات، و**Scrum master** هو **مُيسِّر (facilitator)**.",
        ),
        bi(
          "The Scrum master arranges the daily meetings, tracks the backlog, records decisions and measures progress against the backlog.",
          "ينظّم Scrum master الاجتماعات اليومية، ويتابع قائمة الأعمال (backlog)، ويسجّل القرارات، ويقيس التقدم مقارنةً بقائمة الأعمال.",
        ),
      ],
      pointsFor: {
        direct: [
          bi(
            "Without that buffer, requests from management and customers reach developers mid-task and break their focus.",
            "من دون هذا الحاجز تصل طلبات الإدارة والعملاء إلى المطورين في منتصف مهامهم فتقطع تركيزهم.",
          ),
        ],
        master: [
          bi(
            "Communication with customers and management goes **through the Scrum master**, who **protects the team from distractions**.",
            "يمر التواصل مع العملاء والإدارة **عبر Scrum master**، الذي **يحمي الفريق من المشتتات**.",
          ),
        ],
      },
    },
  ],
});

/** Every walkthrough in this lecture, registered in lib/walkthroughs/index.ts. */
export const all = [why, manifesto, principles, xp, scrum] as const;

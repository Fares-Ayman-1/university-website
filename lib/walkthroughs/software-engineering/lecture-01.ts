import { bi } from "@/components/widgets/types";
import { defineWalkthrough } from "@/lib/widgets/walkthrough";
import { BUILD_SPLIT } from "@/lib/widgets/se-lecture-01";

/*
 * Software Engineering · Lecture 1 (content/subjects/software-engineering/lectures/01-introduction.mdx).
 * One walkthrough per heading; the scenes are in
 * components/widgets/walkthrough/scenes/software-engineering/lecture-01/.
 */

// ---------- What is software? ----------
export const software = defineWalkthrough({
  id: "se1-what-is-software",
  title: bi("Software is more than a program", "البرمجيات أكثر من مجرد برنامج"),
  analogy: bi(
    "A new car. You get the engine, but also the manual, the service book and a garage that keeps it running for years. Software is the program plus all of that.",
    "سيارة جديدة: لا تحصل على المحرك وحده، بل على دليل الاستخدام ودفتر الصيانة ومركز خدمة يبقيها صالحة لسنوات. والبرمجيات كذلك هي البرنامج مع كل ذلك.",
  ),
  panels: [
    {
      id: "bundle",
      pill: bi("Programs + documentation", "البرامج + الوثائق"),
      heading: bi("Software = programs and their documentation", "البرمجيات = البرامج ووثائقها"),
      control: {
        label: bi("Deliver", "سلِّم"),
        options: [
          { id: "program", label: bi("The program alone", "البرنامج وحده") },
          { id: "software", label: bi("The whole software", "البرمجيات كاملة") },
        ],
        initial: "program",
      },
      points: [bi("**Software** is computer programs **and** their associated documentation, not just the code.", "**البرمجيات (Software)** هي برامج الحاسوب **و**الوثائق المرتبطة بها، لا الشيفرة وحدها.")],
      pointsFor: {
        program: [bi("A bare program leaves the user stuck: nothing says how to **install** it, set it up or use it.", "البرنامج المجرد يترك المستخدم عاجزًا: فلا شيء يوضح كيف **يثبّته (install)** أو يهيّئه أو يستخدمه.")],
        software: [
          bi(
            "The full product adds **configuration files** that set the programs up, **user documentation** on how to use the system, and a **website** for downloading new versions.",
            "يضيف المنتج الكامل **ملفات التهيئة (configuration files)** التي تُعِدّ البرامج، و**وثائق المستخدم (user documentation)** التي تشرح طريقة استخدام النظام، و**موقع ويب** لتنزيل الإصدارات الجديدة.",
          ),
        ],
      },
    },
    {
      id: "professional",
      pill: bi("Professional, not personal", "احترافية لا شخصية"),
      heading: bi("Who builds it, and who uses it", "من يبنيها، ومن يستخدمها"),
      control: {
        label: bi("Kind of development", "نوع التطوير"),
        options: [
          { id: "individual", label: bi("Individual programming", "البرمجة الفردية") },
          { id: "professional", label: bi("Professional software", "البرمجيات الاحترافية") },
        ],
        initial: "individual",
      },
      points: [bi("Software engineering is meant for **professional** software development, not individual programming.", "تهدف هندسة البرمجيات (Software Engineering) إلى دعم تطوير البرمجيات **الاحترافي**، لا البرمجة الفردية.")],
      pointsFor: {
        individual: [bi("One person writes a program **for their own use**. The developer is the only user, so nobody else has to understand it.", "يكتب شخص واحد برنامجًا **لاستخدامه الخاص**، فالمطوّر هو المستخدم الوحيد، ولا يحتاج أحد غيره إلى فهمه.")],
        professional: [bi("A **team** builds it for **other people** to use. They need documentation, and they depend on it working.", "يبنيها **فريق** ليستخدمها **أشخاص آخرون**، وهؤلاء يحتاجون إلى الوثائق ويعتمدون على عملها بشكل صحيح.")],
      },
    },
    {
      id: "lifetime",
      pill: bi("Changed throughout its life", "تتغير طوال عمرها"),
      heading: bi("Professional software is maintained for years", "البرمجيات الاحترافية تُصان لسنوات"),
      points: [
        bi("Professional software is **maintained and changed** throughout its life, long after the first release.", "تُصان البرمجيات الاحترافية **وتُعدَّل** طوال عمرها، وذلك بعد إصدارها الأول بوقت طويل."),
        bi("Bug reports and new needs keep arriving. Each batch becomes a new **version** that users download from the product's website.", "تصل تقارير الأخطاء والاحتياجات الجديدة باستمرار، وتتحول كل مجموعة منها إلى **إصدار (version)** جديد ينزّله المستخدمون من موقع المنتج."),
      ],
    },
  ],
});

// ---------- Attributes of good software ----------
export const attributes = defineWalkthrough({
  id: "se1-attributes",
  title: bi("Four attributes of good software", "الخصائص الأربع للبرمجيات الجيدة"),
  analogy: bi(
    "A good building. It must stand and do its job, but also be easy to renovate (maintainable), safe to live in (dependable), cheap to heat (efficient) and pleasant for the people inside (acceptable).",
    "مبنى جيد: يجب أن يقوم بوظيفته، لكن عليه أيضًا أن يكون سهل التجديد (قابلية الصيانة)، وآمنًا للسكن (الاعتمادية)، واقتصاديًا في التدفئة (الكفاءة)، ومريحًا لمن يسكنونه (القبول).",
  ),
  panels: [
    {
      id: "baseline",
      pill: bi("Beyond functionality", "ما بعد الوظائف"),
      heading: bi("Functionality first, then four attributes", "الوظائف أولًا، ثم أربع خصائص"),
      points: [
        bi("Good software must first deliver the required **functionality and performance** to the user.", "يجب أن تقدّم البرمجيات الجيدة أولًا **الوظائف والأداء (functionality and performance)** المطلوبين للمستخدم."),
        bi(
          "On top of that, professional software needs four attributes: **maintainability**, **dependability**, **efficiency** and **acceptability**.",
          "وفوق ذلك تحتاج البرمجيات الاحترافية إلى أربع خصائص: **قابلية الصيانة (maintainability)**، و**الاعتمادية (dependability)**، و**الكفاءة (efficiency)**، و**القبول (acceptability)**.",
        ),
      ],
    },
    {
      id: "maintainability",
      pill: bi("Maintainability", "قابلية الصيانة"),
      heading: bi("A change request arrives", "يصل طلب تغيير"),
      control: {
        label: bi("The code is", "الشيفرة"),
        options: [
          { id: "modular", label: bi("Well structured", "منظَّمة جيدًا") },
          { id: "tangled", label: bi("Tangled", "متشابكة") },
        ],
        initial: "modular",
      },
      points: [bi("**Maintainability**: the software can evolve to meet changing needs, and upgrades are easy, quick and cheap.", "**قابلية الصيانة (Maintainability)**: يمكن للبرمجيات أن تتطور لتلبية الاحتياجات المتغيرة، وتكون ترقياتها سهلة وسريعة ورخيصة.")],
      pointsFor: {
        modular: [bi("The new tax rule touches **one module**, so the upgrade is quick and cheap.", "تمسّ قاعدة الضريبة الجديدة **وحدة (module) واحدة**، فتكون الترقية سريعة ورخيصة.")],
        tangled: [bi("Every module depends on the others, so the change **ripples** through all of them: slow, costly and risky.", "كل وحدة تعتمد على الأخرى، لذلك **ينتشر** التغيير فيها جميعًا: بطيء ومكلف ومحفوف بالمخاطر.")],
      },
    },
    {
      id: "dependability",
      pill: bi("Dependability", "الاعتمادية"),
      heading: bi("Trustworthy, even when something goes wrong", "جديرة بالثقة حتى عند حدوث خلل"),
      points: [
        bi(
          "**Dependability** covers **reliability**, **security** and **safety**, so that users can trust the software.",
          "تشمل **الاعتمادية (Dependability)** **الموثوقية (reliability)** و**الأمن (security)** و**السلامة (safety)**، كي يستطيع المستخدمون الوثوق بالبرمجيات.",
        ),
        bi("When it does fail, it must not cause **physical or economic damage**.", "وعندما تتعطل فعلًا، يجب ألا تسبب **أضرارًا مادية أو اقتصادية**."),
      ],
    },
    {
      id: "efficiency",
      pill: bi("Efficiency", "الكفاءة"),
      heading: bi("No wasted memory or processor time", "لا هدر للذاكرة ولا لوقت المعالج"),
      control: {
        label: bi("The program is", "البرنامج"),
        options: [
          { id: "wasteful", label: bi("Wasteful", "مُهدِر") },
          { id: "efficient", label: bi("Efficient", "كفء") },
        ],
        initial: "wasteful",
      },
      points: [bi("**Efficiency**: software should not waste system resources such as **memory** and **processor time**.", "**الكفاءة (Efficiency)**: يجب ألا تهدر البرمجيات موارد النظام مثل **الذاكرة (memory)** و**وقت المعالج (processor time)**.")],
      pointsFor: {
        wasteful: [bi("It holds memory it no longer needs and repeats work, so the machine slows down and every response takes longer.", "يحتفظ بذاكرة لم يعد يحتاج إليها ويكرر العمل نفسه، فيتباطأ الجهاز ويطول زمن كل استجابة.")],
        efficient: [bi("The same job uses a fraction of the resources, leaving room for other programs and keeping it **responsive**.", "ينجز العمل نفسه بجزء من الموارد، فيترك مجالًا للبرامج الأخرى ويظل **سريع الاستجابة (responsive)**.")],
      },
    },
    {
      id: "acceptability",
      pill: bi("Acceptability", "القبول"),
      heading: bi("Accepted by the users it was built for", "يتقبّلها المستخدمون الذين بُنيت لهم"),
      points: [
        bi("**Acceptability**: the software is accepted by the users it was designed for.", "**القبول (Acceptability)**: أن يتقبّل البرمجياتِ المستخدمون الذين صُمِّمت لهم."),
        bi(
          "That means it is **understandable**, **usable** and **compatible** with the other systems they already use.",
          "وهذا يعني أن تكون **مفهومة** و**سهلة الاستخدام (usable)** و**متوافقة (compatible)** مع الأنظمة الأخرى التي يستخدمونها بالفعل.",
        ),
      ],
    },
  ],
});

// ---------- Software engineering ----------
export const engineering = defineWalkthrough({
  id: "se1-engineering",
  title: bi("What software engineering covers", "ما الذي تغطيه هندسة البرمجيات"),
  analogy: bi(
    "A bridge, not a garden shed. One person can put up a shed, but a bridge needs a team, a plan, materials chosen for the site and inspections for decades.",
    "جسر لا كوخ في حديقة: يستطيع شخص واحد أن يبني كوخًا، أما الجسر فيحتاج إلى فريق وخطة ومواد تُختار لموقعه وفحوص دورية لعقود.",
  ),
  panels: [
    {
      id: "all-aspects",
      pill: bi("All aspects", "جميع الجوانب"),
      heading: bi("From the first idea to the last update", "من الفكرة الأولى إلى آخر تحديث"),
      control: {
        label: bi("Covers", "يغطي"),
        options: [
          { id: "programming", label: bi("Programming", "البرمجة") },
          { id: "se", label: bi("Software engineering", "هندسة البرمجيات") },
        ],
        initial: "programming",
      },
      points: [bi("**Software engineering** is an engineering discipline concerned with **all aspects** of software production.", "**هندسة البرمجيات (Software Engineering)** تخصص هندسي يهتم **بجميع جوانب** إنتاج البرمجيات.")],
      pointsFor: {
        programming: [bi("Writing code is only **one stage** in the life of a system.", "كتابة الشيفرة ليست إلا **مرحلة واحدة** من عمر النظام.")],
        se: [bi("It runs from specifying the system, through building and testing it, to **maintaining it after it goes into use**.", "وهي تمتد من توصيف النظام، مرورًا ببنائه واختباره، وصولًا إلى **صيانته بعد دخوله الخدمة**.")],
      },
    },
    {
      id: "systematic",
      pill: bi("Systematic approach", "نهج منهجي"),
      heading: bi("Methods chosen to fit the problem", "أساليب تُختار لتناسب المشكلة"),
      points: [
        bi("Software engineers take a **systematic** approach, using well-defined techniques rather than trial and error.", "يتبع مهندسو البرمجيات نهجًا **منهجيًا (systematic)**، بتقنيات محددة جيدًا لا بالتجربة والخطأ."),
        bi(
          "They choose tools and techniques to fit the **problem**, the **constraints** and the **resources**. The result is an **effective and reliable** product.",
          "ويختارون الأدوات والتقنيات بما يناسب **المشكلة** و**القيود (constraints)** و**الموارد**، فتكون النتيجة منتجًا **فعّالًا وموثوقًا**.",
        ),
      ],
    },
    {
      id: "engineer-developer",
      pill: bi("Engineer vs developer", "المهندس والمطوّر"),
      heading: bi("Software developer and software engineer", "مطوّر البرمجيات ومهندس البرمجيات"),
      control: {
        label: bi("Role", "الدور"),
        options: [
          { id: "developer", label: bi("Software developer", "مطوّر البرمجيات") },
          { id: "engineer", label: bi("Software engineer", "مهندس البرمجيات") },
        ],
        initial: "developer",
      },
      points: [bi("The slides contrast the two roles by how they work and the scale they work at.", "تقارن الشرائح بين الدورين من حيث طريقة العمل والنطاق الذي يعمل عليه كل منهما.")],
      pointsFor: {
        developer: [
          bi(
            "A **developer** builds software that runs on various computers: mostly **solitary** work, writing complete programs with **ready-made tools**, on a limited scale.",
            "يبني **المطوّر (developer)** برمجيات تعمل على حواسيب مختلفة: عمل **فردي** في الغالب، يكتب فيه برامج كاملة **بأدوات جاهزة**، على نطاق محدود.",
          ),
        ],
        engineer: [
          bi(
            "An **engineer** applies engineering principles to design, develop, maintain and test software: **team** work that also involves the hardware, **creates the tools** others use and solves much **larger** problems.",
            "يطبّق **المهندس (engineer)** المبادئ الهندسية لتصميم البرمجيات وتطويرها وصيانتها واختبارها: عمل **جماعي** يشمل العتاد (hardware) أيضًا، و**ينشئ الأدوات** التي يستخدمها الآخرون، ويحل مشكلات **أكبر** بكثير.",
          ),
        ],
      },
    },
    {
      id: "where-it-fits",
      pill: bi("Where it fits", "موقعها بين التخصصات"),
      heading: bi("Next to computer science and system engineering", "بجوار علوم الحاسب وهندسة النظم"),
      control: {
        label: bi("Compare with", "قارِن مع"),
        options: [
          { id: "cs", label: bi("Computer science", "علوم الحاسب") },
          { id: "systems", label: bi("System engineering", "هندسة النظم") },
        ],
        initial: "cs",
      },
      points: [bi("Software engineering takes its foundations from one field and is itself part of a larger one.", "تستمد هندسة البرمجيات أسسها من مجال، وهي نفسها جزء من مجال أوسع.")],
      pointsFor: {
        cs: [
          bi(
            "**Computer science** studies theory and fundamentals. Software engineering handles the **practicalities** of developing and delivering useful software, as electrical engineering builds on physics.",
            "تدرس **علوم الحاسب (Computer science)** النظرية والأساسيات، وتتولى هندسة البرمجيات **الجوانب العملية** لتطوير البرمجيات المفيدة وتسليمها، كما تقوم الهندسة الكهربائية على الفيزياء.",
          ),
        ],
        systems: [
          bi(
            "**System engineering** covers every part of a computer-based system: hardware, software, people and procedures. Software engineering is the **part** that develops the software.",
            "تغطي **هندسة النظم (System engineering)** كل أجزاء النظام القائم على الحاسوب: العتاد (hardware) والبرمجيات والأشخاص والإجراءات، وهندسة البرمجيات هي **الجزء** الذي يطوّر البرمجيات.",
          ),
        ],
      },
    },
  ],
});

// ---------- Software products ----------
const productToggle = {
  label: bi("Product", "المنتج"),
  options: [
    { id: "generic", label: bi("Generic", "عام") },
    { id: "custom", label: bi("Customized", "مخصص") },
  ],
  initial: "generic",
} as const;

export const products = defineWalkthrough({
  id: "se1-products",
  title: bi("Generic and customized products", "المنتجات العامة والمخصصة"),
  analogy: bi(
    "Clothes off the rack versus a tailored suit. The shop designs for everyone and spreads the cost over thousands of buyers; the tailor follows one client's measurements, and that client pays for all of it.",
    "ملابس جاهزة مقابل بدلة مفصَّلة: يصمم المتجر للجميع ويوزّع التكلفة على آلاف المشترين، أما الخيّاط فيتبع مقاسات عميل واحد، ويدفع ذلك العميل التكلفة كلها.",
  ),
  panels: [
    {
      id: "two-kinds",
      pill: bi("Two kinds", "نوعان"),
      heading: bi("Who the product is built for", "لمن يُبنى المنتج"),
      control: productToggle,
      points: [bi("A **software product** is a system delivered to a customer with the documentation that explains how to install and use it.", "**المنتج البرمجي (software product)** نظام يُسلَّم إلى العميل مع الوثائق التي تشرح طريقة تثبيته واستخدامه.")],
      pointsFor: {
        generic: [bi("A **generic** product is a stand-alone system sold on the **open market** to any customer who can buy it, such as a word processor.", "**المنتج العام (generic)** نظام مستقل يُباع في **السوق المفتوحة** لأي عميل يستطيع شراءه، مثل معالج النصوص.")],
        custom: [bi("A **customized** product is built **for one particular customer**, such as a university's admission and registration system.", "**المنتج المخصص (customized)** يُبنى **لعميل معيّن واحد**، مثل نظام القبول والتسجيل في جامعة.")],
      },
    },
    {
      id: "specification",
      pill: bi("Specification", "التوصيف"),
      heading: bi("Who decides what it should do", "من يقرر ما يجب أن يفعله"),
      control: productToggle,
      points: [bi("The **specification** says what the software must do. The two kinds differ in who writes it.", "يحدد **التوصيف (specification)** ما يجب أن تفعله البرمجيات، ويختلف النوعان في من يكتبه.")],
      pointsFor: {
        generic: [bi("The company's **marketing department** writes it internally, from what it learns about the market.", "يكتبه **قسم التسويق** في الشركة داخليًا، بناءً على ما يعرفه عن السوق.")],
        custom: [bi("It is agreed in a **contract** between the customer and the developer.", "يُتفق عليه في **عقد (contract)** بين العميل والمطوّر.")],
      },
    },
    {
      id: "users-cost",
      pill: bi("Users and cost", "المستخدمون والتكلفة"),
      heading: bi("Who pays for the development", "من يدفع تكلفة التطوير"),
      control: productToggle,
      points: [bi("The difference is how many buyers share the cost of development.", "الفرق هو عدد المشترين الذين يتقاسمون تكلفة التطوير.")],
      pointsFor: {
        generic: [bi("**Many** users share it, so each pays a small price, but the product must be **marketed** to reach them.", "يتقاسمها مستخدمون **كثيرون**، فيدفع كل منهم سعرًا صغيرًا، لكن المنتج يحتاج إلى **تسويق (marketing)** كي يصل إليهم.")],
        custom: [bi("**One** customer pays the whole development cost, so it is **high**, and no marketing is needed.", "يدفع عميل **واحد** تكلفة التطوير كلها، فتكون **مرتفعة**، ولا حاجة إلى التسويق.")],
      },
    },
    {
      id: "changes",
      pill: bi("Changes", "التغييرات"),
      heading: bi("What drives the next change", "ما الذي يدفع التغيير التالي"),
      control: productToggle,
      points: [bi("Both kinds keep changing after release, but for different reasons.", "يستمر النوعان في التغيّر بعد الإصدار، لكن لأسباب مختلفة.")],
      pointsFor: {
        generic: [bi("**Market demand** and planned **future updates** decide what goes into the next version.", "يحدد **طلب السوق** و**التحديثات المستقبلية** المخطط لها ما يدخل في الإصدار التالي.")],
        custom: [bi("The **customer** decides, within their own **time, budget and needs**.", "يقرر **العميل** ذلك، في حدود **وقته وميزانيته واحتياجاته**.")],
      },
    },
  ],
});

// ---------- The software process ----------
export const softwareProcess = defineWalkthrough({
  id: "se1-process",
  title: bi("Four activities in every software process", "أربعة أنشطة في كل عملية برمجيات"),
  analogy: bi(
    "Building a house. Agree the plans with the owner (specification), build it (development), inspect it against the plans (validation), and extend it when the family grows (evolution).",
    "بناء منزل: تتفق على المخططات مع المالك (التوصيف)، ثم تبنيه (التطوير)، ثم تفحصه مقارنةً بالمخططات (التحقق من الصلاحية)، ثم توسّعه حين تكبر العائلة (التطور).",
  ),
  panels: [
    {
      id: "sequence",
      pill: bi("A sequence of activities", "سلسلة أنشطة"),
      heading: bi("A process turns needs into a product", "العملية تحوّل الاحتياجات إلى منتج"),
      points: [
        bi("A **software process** is a sequence of activities that leads to a software product.", "**عملية البرمجيات (software process)** سلسلة من الأنشطة تؤدي إلى إنتاج منتج برمجي."),
        bi(
          "Different systems need different processes, but every one includes **specification**, **development**, **validation** and **evolution**.",
          "تحتاج الأنظمة المختلفة إلى عمليات مختلفة، لكن كل عملية تتضمن **التوصيف (specification)** و**التطوير (development)** و**التحقق من الصلاحية (validation)** و**التطور (evolution)**.",
        ),
      ],
    },
    {
      id: "specification",
      pill: bi("Specification", "التوصيف"),
      heading: bi("Agree what to build, and its limits", "الاتفاق على ما سيُبنى وحدوده"),
      points: [
        bi("In **specification**, customers and engineers define the software to be produced: **what** it should do.", "في **التوصيف (specification)** يحدد العملاء والمهندسون البرمجيات المطلوب إنتاجها: **ماذا** يجب أن تفعل."),
        bi("They also fix the **constraints** on its operation and development, such as the platform it runs on or a deadline.", "ويحددون أيضًا **القيود (constraints)** على تشغيلها وتطويرها، مثل المنصة التي تعمل عليها أو موعد التسليم."),
      ],
    },
    {
      id: "development",
      pill: bi("Development", "التطوير"),
      heading: bi("Design it, then program it", "صمّمها ثم برمجها"),
      points: [
        bi("In **development** the software is **designed** and **programmed** (implemented) from the specification.", "في **التطوير (development)** تُصمَّم البرمجيات وتُبرمَج (implementation) بناءً على التوصيف."),
        bi("The design splits the system into parts, and programming turns each part into working code.", "يقسّم التصميم النظام إلى أجزاء، وتحوّل البرمجة كل جزء إلى شيفرة تعمل."),
      ],
    },
    {
      id: "validation",
      pill: bi("Validation", "التحقق من الصلاحية"),
      heading: bi("Check it against what the customer wants", "افحصها مقارنةً بما يريده العميل"),
      control: {
        label: bi("Test result", "نتيجة الاختبار"),
        options: [
          { id: "pass", label: bi("All pass", "نجاح الكل") },
          { id: "fail", label: bi("One fails", "فشل أحدها") },
        ],
        initial: "pass",
      },
      points: [bi("In **validation** the software is evaluated to confirm that it meets the **customer's requirements**.", "في **التحقق من الصلاحية (validation)** تُقيَّم البرمجيات للتأكد من أنها تلبي **متطلبات العميل (requirements)**.")],
      pointsFor: {
        pass: [bi("Every requirement in the specification is checked and passes, so the software can be delivered.", "يُفحص كل متطلب في التوصيف وينجح، فيمكن تسليم البرمجيات.")],
        fail: [bi("One requirement fails, so the work goes **back to development** before anything is delivered.", "يفشل أحد المتطلبات، فيعود العمل **إلى التطوير** قبل تسليم أي شيء.")],
      },
    },
    {
      id: "evolution",
      pill: bi("Evolution", "التطور"),
      heading: bi("Change it as needs change", "عدّلها كلما تغيرت الاحتياجات"),
      points: [
        bi("In **evolution** the software is updated to reflect changing customer and market demands.", "في **التطور (evolution)** تُحدَّث البرمجيات لتعكس تغيّر متطلبات العميل والسوق."),
        bi("Each new need runs the cycle again: a changed specification, new development and new validation, then a new version.", "وكل حاجة جديدة تشغّل الدورة من جديد: توصيف معدَّل، وتطوير جديد، وتحقق جديد، ثم إصدار جديد."),
      ],
    },
  ],
});

// ---------- Challenges and costs ----------
export const challenges = defineWalkthrough({
  id: "se1-challenges",
  title: bi("Three challenges, and where the money goes", "ثلاثة تحديات، وأين يذهب المال"),
  analogy: bi(
    "A restaurant that must serve diners on every kind of diet (heterogeneity), faster than ever (delivery), without ever making anyone ill (trust).",
    "مطعم يجب أن يخدم روادًا بكل أنواع الأنظمة الغذائية (عدم التجانس)، وبسرعة أكبر من أي وقت مضى (التسليم)، دون أن يمرض أحد أبدًا (الثقة).",
  ),
  facts: { development: BUILD_SPLIT.development, testing: BUILD_SPLIT.testing },
  panels: [
    {
      id: "heterogeneity",
      pill: bi("Heterogeneity", "عدم التجانس"),
      heading: bi("One system, many platforms", "نظام واحد ومنصات كثيرة"),
      points: [
        bi(
          "**Heterogeneity**: software must cope with a growing diversity of hardware and software platforms, from phones and PCs to the web.",
          "**عدم التجانس (Heterogeneity)**: يجب أن تتعامل البرمجيات مع تنوّع متزايد في منصات العتاد والبرمجيات، من الهواتف والحواسيب الشخصية إلى الويب.",
        ),
        bi("Technology changes fast, and that should not break the software being developed.", "والتقنية تتغير بسرعة، ويجب ألا يعطّل ذلك البرمجيات التي يجري تطويرها."),
      ],
    },
    {
      id: "delivery",
      pill: bi("Delivery", "التسليم"),
      heading: bi("Ever shorter delivery times", "أوقات تسليم أقصر باستمرار"),
      control: {
        label: bi("Deliver as", "سلِّم في صورة"),
        options: [
          { id: "once", label: bi("One big release", "إصدار واحد كبير") },
          { id: "often", label: bi("Faster releases", "إصدارات أسرع") },
        ],
        initial: "once",
      },
      points: [bi("**Delivery**: customers demand software in ever shorter times, so engineers need techniques that lead to **faster delivery**.", "**التسليم (Delivery)**: يطلب العملاء البرمجيات في أوقات أقصر باستمرار، لذلك يحتاج المهندسون إلى تقنيات تؤدي إلى **تسليم أسرع**.")],
      pointsFor: {
        once: [bi("After a year of waiting, the customer's needs may have changed before the software arrives.", "بعد عام من الانتظار، قد تكون احتياجات العميل قد تغيرت قبل وصول البرمجيات.")],
        often: [bi("Faster techniques put working software in users' hands much sooner, then keep adding to it.", "أما التقنيات الأسرع فتضع برمجيات تعمل بين أيدي المستخدمين في وقت أقرب بكثير، ثم تواصل الإضافة إليها.")],
      },
    },
    {
      id: "trust",
      pill: bi("Trust", "الثقة"),
      heading: bi("Show users the software can be trusted", "أثبِت للمستخدمين أن البرمجيات جديرة بالثقة"),
      points: [
        bi("**Trust**: as software runs more of daily life, users must be able to rely on it.", "**الثقة (Trust)**: مع ازدياد اعتماد الحياة اليومية على البرمجيات، يجب أن يستطيع المستخدمون الاعتماد عليها."),
        bi("The challenge is developing techniques that **demonstrate** that the software can be trusted, not just claiming it.", "والتحدي هو تطوير تقنيات **تُثبت** أن البرمجيات جديرة بالثقة، لا مجرد الادعاء بذلك."),
      ],
    },
    {
      id: "costs",
      pill: bi("Costs", "التكاليف"),
      heading: bi("Where the money goes", "أين يذهب المال"),
      control: {
        label: bi("Look at", "انظر إلى"),
        options: [
          { id: "build", label: bi("Building the system", "بناء النظام") },
          { id: "life", label: bi("Its whole life", "عمره كله") },
        ],
        initial: "build",
      },
      points: [bi("Software engineering is concerned with **cost-effective** software development.", "تهتم هندسة البرمجيات بتطوير البرمجيات **بتكلفة فعّالة (cost-effective)**.")],
      pointsFor: {
        build: [
          bi(
            `Building it costs roughly **${BUILD_SPLIT.development} %** development and **${BUILD_SPLIT.testing} %** testing. The split depends on the type of system and the development model.`,
            `تتوزع تكلفة بنائه تقريبًا بين **${BUILD_SPLIT.development} %** للتطوير و**${BUILD_SPLIT.testing} %** للاختبار، ويعتمد هذا التوزيع على نوع النظام ونموذج التطوير.`,
          ),
        ],
        life: [bi("For custom software, **evolution** after delivery often costs **more than development**.", "وفي البرمجيات المخصصة، كثيرًا ما تتجاوز تكلفة **التطور (evolution)** بعد التسليم **تكلفة التطوير**.")],
      },
    },
    {
      id: "no-universal",
      pill: bi("No universal method", "لا طريقة تناسب الجميع"),
      heading: bi("The type of application picks the method", "نوع التطبيق يحدد الأسلوب"),
      control: {
        label: bi("Application", "التطبيق"),
        options: [
          { id: "brakes", label: bi("Car braking", "مكابح سيارة") },
          { id: "game", label: bi("A game", "لعبة") },
        ],
        initial: "brakes",
      },
      points: [
        bi(
          "Different kinds of system need different techniques, so no method is best for every system. The key factor is the **type of application**.",
          "تحتاج أنواع الأنظمة المختلفة إلى تقنيات مختلفة، فلا توجد طريقة هي الأفضل لكل نظام، والعامل الأهم هو **نوع التطبيق (type of application)**.",
        ),
      ],
      pointsFor: {
        brakes: [
          bi(
            "A safety-critical controller such as anti-lock braking needs a **complete, analyzable specification** and extensive validation before it ships.",
            "تحتاج وحدة تحكم حرجة من حيث السلامة (safety-critical)، مثل منع انغلاق المكابح، إلى **توصيف كامل قابل للتحليل** وتحقق مكثف قبل طرحها.",
          ),
        ],
        game: [bi("A game is best built through a **series of prototypes**, trying ideas on players and refining them.", "أما اللعبة فالأفضل بناؤها عبر **سلسلة من النماذج الأولية (prototypes)**، تُجرَّب أفكارها على اللاعبين ثم تُحسَّن.")],
      },
    },
  ],
});

// ---------- Types of application ----------
export const appTypes = defineWalkthrough({
  id: "se1-app-types",
  title: bi("Eight types of application", "ثمانية أنواع من التطبيقات"),
  analogy: bi(
    "Vehicles. A bicycle, an ambulance and a freight train all move things, but nobody would design or test them the same way.",
    "المركبات: الدراجة وسيارة الإسعاف وقطار البضائع كلها تنقل الأشياء، لكن لا أحد يصممها أو يختبرها بالطريقة نفسها.",
  ),
  panels: [
    {
      id: "local-remote",
      pill: bi("Stand-alone or interactive", "مستقل أم تفاعلي"),
      heading: bi("Where the program and its data live", "أين يوجد البرنامج وبياناته"),
      control: {
        label: bi("Type", "النوع"),
        options: [
          { id: "standalone", label: bi("Stand-alone", "مستقل") },
          { id: "interactive", label: bi("Transaction-based", "قائم على المعاملات") },
        ],
        initial: "standalone",
      },
      points: [bi("The first question is whether the application needs a network at all.", "السؤال الأول هو: هل يحتاج التطبيق إلى شبكة أصلًا؟")],
      pointsFor: {
        standalone: [
          bi(
            "A **stand-alone** application runs on a local computer and contains everything it needs, with **no network**: office software, a photo editor.",
            "يعمل **التطبيق المستقل (stand-alone)** على حاسوب محلي ويحتوي على كل ما يحتاج إليه، **دون شبكة**: مثل البرمجيات المكتبية وبرامج تحرير الصور.",
          ),
        ],
        interactive: [
          bi(
            "An **interactive transaction-based** application runs on a **remote** system. Users send requests from their own PCs and get responses in real time: Amazon, online banking.",
            "يعمل **التطبيق التفاعلي القائم على المعاملات (interactive transaction-based)** على نظام **بعيد**، يرسل إليه المستخدمون الطلبات من حواسيبهم ويتلقون الردود في الوقت الفعلي: مثل Amazon والخدمات المصرفية عبر الإنترنت.",
          ),
        ],
      },
    },
    {
      id: "embedded",
      pill: bi("Embedded control", "التحكم المدمج"),
      heading: bi("Software that controls a device", "برمجيات تتحكم في جهاز"),
      points: [
        bi("An **embedded control system** controls and manages a hardware device, and is tailored to that hardware.", "يتحكم **نظام التحكم المدمج (embedded control system)** في جهاز (hardware) ويديره، وهو مصمَّم خصيصًا لذلك الجهاز."),
        bi("In **anti-lock braking**, it reads the wheel speed, detects a wheel about to lock, and eases that brake, many times a second.", "في نظام **منع انغلاق المكابح (anti-lock braking)** يقرأ سرعة العجلة، ويكتشف أنها توشك أن تنغلق، فيخفف مكبحها، مرات كثيرة في الثانية."),
      ],
    },
    {
      id: "batch",
      pill: bi("Batch processing", "المعالجة الدفعية"),
      heading: bi("Collect the inputs, then process them all at once", "اجمع المدخلات ثم عالجها دفعة واحدة"),
      points: [
        bi(
          "A **batch processing** system processes large batches of individual inputs to create the matching outputs, **not in real time**.",
          "يعالج **نظام المعالجة الدفعية (batch processing)** دفعات كبيرة من المدخلات الفردية لينتج المخرجات المقابلة لها، **لا في الوقت الفعلي**.",
        ),
        bi("A phone company collects a month of call records, then one billing run turns them into every customer's bill.", "تجمع شركة الهاتف سجلات المكالمات لمدة شهر، ثم تحوّلها عملية فوترة واحدة إلى فاتورة لكل عميل."),
      ],
    },
    {
      id: "data-collection",
      pill: bi("Data collection", "جمع البيانات"),
      heading: bi("Sensors gather data and pass it on", "المستشعرات تجمع البيانات وتمررها"),
      points: [
        bi("A **data collection** system gathers data through **sensors** and sends it to other systems for processing or analysis.", "يجمع **نظام جمع البيانات (data collection)** البيانات عبر **المستشعرات (sensors)** ويرسلها إلى أنظمة أخرى لمعالجتها أو تحليلها."),
        bi("It often runs in **harsh** places, out in a field or inside an engine, so its software must be robust.", "وكثيرًا ما يعمل في أماكن **قاسية**، في حقل مفتوح أو داخل محرك، لذلك يجب أن تكون برمجياته متينة (robust)."),
      ],
    },
    {
      id: "others",
      pill: bi("Three more types", "ثلاثة أنواع أخرى"),
      heading: bi("Entertainment, simulation and systems of systems", "الترفيه والمحاكاة وأنظمة الأنظمة"),
      control: {
        label: bi("Type", "النوع"),
        options: [
          { id: "entertainment", label: bi("Entertainment", "الترفيه") },
          { id: "simulation", label: bi("Simulation", "المحاكاة") },
          { id: "sos", label: bi("Systems of systems", "أنظمة الأنظمة") },
        ],
        initial: "entertainment",
      },
      points: [bi("These three complete the eight types.", "تُكمل هذه الأنواع الثلاثة الأنواع الثمانية.")],
      pointsFor: {
        entertainment: [bi("**Entertainment** systems are mainly for personal use and are meant to entertain the user, like games.", "**أنظمة الترفيه (Entertainment)** للاستخدام الشخصي أساسًا وهدفها إمتاع المستخدم، مثل الألعاب.")],
        simulation: [
          bi(
            "**Modelling and simulation** systems are built by scientists and engineers to model physical processes with many separate, interacting objects, such as the weather.",
            "**أنظمة النمذجة والمحاكاة (Modelling and simulation)** يطوّرها العلماء والمهندسون لنمذجة عمليات فيزيائية تضم كائنات كثيرة منفصلة ومتفاعلة، مثل الطقس.",
          ),
        ],
        sos: [
          bi(
            "A **system of systems** is composed of several other software systems working together, such as an enterprise built from many integrated systems.",
            "**نظام الأنظمة (system of systems)** يتكون من عدة أنظمة برمجية أخرى تعمل معًا، مثل مؤسسة مبنية من أنظمة متكاملة كثيرة.",
          ),
        ],
      },
    },
    {
      id: "web",
      pill: bi("The web", "الويب"),
      heading: bi("The web as the platform", "الويب منصةً للتطبيقات"),
      control: {
        label: bi("Users get software by", "يحصل المستخدمون على البرمجيات"),
        options: [
          { id: "install", label: bi("Buying and installing", "بالشراء والتثبيت") },
          { id: "cloud", label: bi("The cloud", "عبر السحابة") },
        ],
        initial: "install",
      },
      points: [
        bi(
          "Organizations increasingly build **web-based** systems instead of local ones, and **web services** let functionality be used over the web.",
          "تبني المؤسسات بشكل متزايد أنظمة **قائمة على الويب (web-based)** بدلًا من الأنظمة المحلية، و**خدمات الويب (web services)** تتيح استخدام الوظائف عبر الويب.",
        ),
      ],
      pointsFor: {
        install: [bi("Traditionally, each user **buys** a copy and installs it on their own machine.", "تقليديًا، **يشتري** كل مستخدم نسخة ويثبّتها على جهازه.")],
        cloud: [bi("With **cloud computing** the application runs remotely. Users don't buy the software; they **pay according to use**.", "مع **الحوسبة السحابية (cloud computing)** يعمل التطبيق عن بُعد، فلا يشتري المستخدمون البرمجيات، بل **يدفعون حسب الاستخدام**.")],
      },
    },
  ],
});

// ---------- Ethics and professional responsibility ----------
export const ethics = defineWalkthrough({
  id: "se1-ethics",
  title: bi("Behaving as a professional", "التصرف بوصفك محترفًا"),
  analogy: bi(
    "A doctor. The law sets the floor, but patients trust doctors because they keep secrets, admit what they can't treat and put the patient first.",
    "الطبيب: يضع القانون الحد الأدنى، لكن المرضى يثقون بالأطباء لأنهم يحفظون الأسرار، ويعترفون بما لا يستطيعون علاجه، ويضعون المريض أولًا.",
  ),
  panels: [
    {
      id: "beyond-law",
      pill: bi("More than the law", "أكثر من القانون"),
      heading: bi("Professional behaviour goes beyond what is legal", "السلوك المهني يتجاوز ما هو قانوني"),
      points: [
        bi("Software engineering happens within a **social and legal framework**.", "تُمارَس هندسة البرمجيات ضمن **إطار اجتماعي وقانوني**."),
        bi("A professional behaves **honestly and ethically**, which is more than obeying the law: some legal choices are still wrong.", "يتصرف المحترف **بأمانة وأخلاقية**، وهذا أكثر من مجرد الالتزام بالقانون: فبعض الخيارات القانونية تظل خاطئة."),
      ],
    },
    {
      id: "trust-issues",
      pill: bi("Confidentiality, competence", "السرية والكفاءة"),
      heading: bi("Keep secrets, and be honest about your skills", "احفظ الأسرار، وكن صادقًا بشأن مهاراتك"),
      control: {
        label: bi("Issue", "القضية"),
        options: [
          { id: "confidentiality", label: bi("Confidentiality", "السرية") },
          { id: "competence", label: bi("Competence", "الكفاءة المهنية") },
        ],
        initial: "confidentiality",
      },
      points: [bi("The first two issues are about the trust between you and the people you work for.", "تتعلق القضيتان الأوليان بالثقة بينك وبين من تعمل لصالحهم.")],
      pointsFor: {
        confidentiality: [
          bi(
            "**Confidentiality**: respect the confidentiality of employers and clients, **whether or not** a formal agreement was signed.",
            "**السرية (Confidentiality)**: احترم سرية أصحاب العمل والعملاء، **سواء وُقِّعت** اتفاقية رسمية أم لا.",
          ),
        ],
        competence: [
          bi(
            "**Competence**: don't misrepresent your level of competence, and don't knowingly accept work beyond it. It can lead to errors and harm.",
            "**الكفاءة المهنية (Competence)**: لا تُسئ تمثيل مستوى كفاءتك، ولا تقبل عن علم عملًا يتجاوزها، فقد يؤدي ذلك إلى أخطاء وأضرار.",
          ),
        ],
      },
    },
    {
      id: "property-issues",
      pill: bi("IP rights, misuse", "الملكية والإساءة"),
      heading: bi("Respect what belongs to others", "احترم ما يملكه الآخرون"),
      control: {
        label: bi("Issue", "القضية"),
        options: [
          { id: "ip", label: bi("IP rights", "الملكية الفكرية") },
          { id: "misuse", label: bi("Computer misuse", "إساءة الاستخدام") },
        ],
        initial: "ip",
      },
      points: [bi("The other two issues are about property: ideas, code and machines that belong to someone else.", "تتعلق القضيتان الأخريان بالملكية: الأفكار والشيفرة والأجهزة التي تخص غيرك.")],
      pointsFor: {
        ip: [
          bi(
            "**Intellectual property rights**: know the local laws on **patents** and **copyright**, and make sure your employers' and clients' IP is protected.",
            "**حقوق الملكية الفكرية (Intellectual property rights)**: اعرف القوانين المحلية الخاصة **ببراءات الاختراع (patents)** و**حقوق النشر (copyright)**، واحرص على حماية الملكية الفكرية لأصحاب العمل والعملاء.",
          ),
        ],
        misuse: [
          bi(
            "**Computer misuse**: don't use your skills to misuse other people's computers, from the trivial (games on an employer's machine) to the very serious (spreading viruses).",
            "**إساءة استخدام الحاسوب (Computer misuse)**: لا تستخدم مهاراتك لإساءة استخدام حواسيب الآخرين، من الأمور البسيطة (اللعب على جهاز صاحب العمل) إلى الخطيرة جدًا (نشر الفيروسات).",
          ),
        ],
      },
    },
    {
      id: "code",
      pill: bi("ACM/IEEE code", "ميثاق ACM/IEEE"),
      heading: bi("Eight principles", "ثمانية مبادئ"),
      points: [
        bi("The US professional societies, ACM and IEEE, produced a **code of ethics** with **eight principles** for software engineers.", "أعدّت الجمعيتان المهنيتان الأمريكيتان ACM و IEEE **ميثاق أخلاقيات (code of ethics)** يضم **ثمانية مبادئ** لمهندسي البرمجيات."),
        bi("It covers practitioners, educators, managers and policy makers, and also the profession's trainees and **students**.", "ويشمل الممارسين والمعلمين والمديرين وصانعي السياسات، وكذلك المتدربين في المهنة و**طلابها**."),
      ],
    },
    {
      id: "dilemma",
      pill: bi("Ethical dilemmas", "المعضلات الأخلاقية"),
      heading: bi("Falsified safety records: what do you do?", "سجلات سلامة مزوّرة: ماذا تفعل؟"),
      control: {
        label: bi("The danger is", "الخطر"),
        options: [
          { id: "limited", label: bi("Limited", "محدود") },
          { id: "severe", label: bi("Very serious", "بالغ الخطورة") },
        ],
        initial: "limited",
      },
      points: [bi("There are no absolutes. Weigh the **potential damage**, how **severe** it is and **who** would be affected.", "لا توجد إجابات مطلقة: وازن بين **الضرر المحتمل**، ومدى **خطورته**، و**من** سيتأثر به.")],
      pointsFor: {
        limited: [bi("Try to resolve it **inside the company**, while respecting your employer's rights.", "حاول حل المسألة **داخل الشركة**، مع احترام حقوق صاحب العمل.")],
        severe: [bi("If lives are at risk and raising it inside gets nowhere, **going public** may be justified.", "إذا كانت الأرواح في خطر ولم يُجدِ طرح الأمر داخليًا، فقد يكون **الإعلان للعامة** مبررًا.")],
      },
    },
    {
      id: "mentcare",
      pill: bi("Case study: Mentcare", "دراسة حالة: Mentcare"),
      heading: bi("A patient information system for mental-health care", "نظام معلومات للمرضى في رعاية الصحة النفسية"),
      control: {
        label: bi("Purpose", "الغرض"),
        options: [
          { id: "care", label: bi("Treating patients", "علاج المرضى") },
          { id: "management", label: bi("Managing the service", "إدارة الخدمة") },
        ],
        initial: "care",
      },
      points: [
        bi("**Mentcare** records patients, consultations, conditions and treatments. It is the case study used throughout the course.", "يسجّل نظام **Mentcare** المرضى والاستشارات والحالات المرضية والعلاجات، وهو دراسة الحالة المستخدمة طوال المقرر."),
        bi("Mental-health records are highly sensitive, so **confidentiality** is central to the system.", "سجلات الصحة النفسية شديدة الحساسية، لذلك تُعد **السرية (confidentiality)** أمرًا محوريًا في هذا النظام."),
      ],
      pointsFor: {
        care: [
          bi(
            "Clinical staff (doctors, nurses, health visitors) get **timely information** for **individual care management** and **patient monitoring**.",
            "يحصل الطاقم السريري (الأطباء والممرضون والزائرون الصحيون) على **معلومات في الوقت المناسب** من أجل **إدارة الرعاية الفردية** و**متابعة المرضى**.",
          ),
        ],
        management: [
          bi(
            "Health managers get **administrative reports** to assess performance. Non-medical staff (receptionists, medical-records staff, administrators) use it too.",
            "يحصل مديرو الرعاية الصحية على **تقارير إدارية** لتقييم الأداء، ويستخدمه أيضًا الطاقم غير الطبي (موظفو الاستقبال، وموظفو السجلات الطبية، والإداريون).",
          ),
        ],
      },
    },
  ],
});

/** Every walkthrough in this lecture, registered in lib/walkthroughs/index.ts. */
export const all = [software, attributes, engineering, products, softwareProcess, challenges, appTypes, ethics] as const;

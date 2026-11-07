import { bi } from "@/components/widgets/types";
import { defineWalkthrough } from "@/lib/widgets/walkthrough";
import { AMOUNT, START, deposits, total, transfer } from "@/lib/widgets/transactions";

/*
 * Databases · Lecture 1 (content/subjects/databases/lectures/01-databases-and-users.mdx).
 * One walkthrough per heading; the scenes are in
 * components/widgets/walkthrough/scenes/databases/.
 */

// ---------- Basic concepts ----------
export const basics = defineWalkthrough({
  id: "db-basics",
  title: bi("From recorded facts to a database system", "من الحقائق المسجَّلة إلى نظام قاعدة البيانات"),
  analogy: bi(
    "A library. The books are the data, the card catalogue is the metadata, and the librarian who shelves, lends and protects the books is the DBMS.",
    "مكتبة: الكتب هي البيانات، وفهرس البطاقات هو البيانات الوصفية، وأمين المكتبة الذي يرتّب الكتب ويعيرها ويحميها هو نظام إدارة قواعد البيانات.",
  ),
  panels: [
    {
      id: "data-info",
      pill: bi("Data → information", "من البيانات إلى المعلومات"),
      heading: bi("Information is data that has been processed", "المعلومات بيانات عولِجت"),
      control: {
        label: bi("Process the facts by", "عالِج الحقائق عن طريق"),
        options: [
          { id: "context", label: bi("Putting them in context", "وضعها في سياق") },
          { id: "summary", label: bi("Summarizing them", "تلخيصها") },
        ],
        initial: "context",
      },
      points: [
        bi("**Data** are recorded facts: a name, a course code, a grade. On their own they answer no question.", "**البيانات (Data)** حقائق مسجَّلة: اسم، ورمز مقرر، ودرجة، وهي وحدها لا تجيب عن أي سؤال."),
        bi("**Information** is the same data processed so that it helps a decision.", "**المعلومات (Information)** هي البيانات نفسها بعد معالجتها بحيث تساعد على اتخاذ قرار."),
      ],
      pointsFor: {
        context: [bi("Put in **context**, the facts become a class roster: who is enrolled in which course.", "عند وضعها في **سياق**، تصبح الحقائق كشف أسماء للفصل: من المسجَّل في أي مقرر.")],
        summary: [bi("**Summarized**, the same facts become a chart: how many students got each grade.", "وعند **تلخيصها**، تصبح الحقائق نفسها رسمًا بيانيًا: كم طالبًا حصل على كل تقدير.")],
      },
    },
    {
      id: "metadata",
      pill: bi("Metadata", "البيانات الوصفية"),
      heading: bi("Metadata is data that describes data", "البيانات الوصفية بيانات تصف البيانات"),
      points: [
        bi("Each field of a record has a description: its **type**, its **size** and its **allowed values**.", "لكل حقل في السجل وصف: **نوعه (type)** و**حجمه (size)** و**القيم المسموح بها (allowed values)**."),
        bi("The DBMS keeps these descriptions in its **catalog** (data dictionary), apart from the data itself.", "ويحتفظ نظام إدارة قواعد البيانات (DBMS) بهذه الأوصاف في **الكتالوج (catalog)** (قاموس البيانات)، منفصلةً عن البيانات نفسها."),
      ],
    },
    {
      id: "mini-world",
      pill: bi("Mini-world", "العالم المصغَّر"),
      heading: bi("A database describes a mini-world", "قاعدة البيانات تصف عالمًا مصغَّرًا"),
      points: [
        bi("The **mini-world** is the part of reality the database records, here a university.", "**العالم المصغَّر (mini-world)** هو جزء الواقع الذي تسجّله قاعدة البيانات، وهو هنا جامعة."),
        bi("Its **entities** are students, professors, courses and classrooms.", "**كياناته (entities)** هي الطلاب والأساتذة والمقررات وقاعات الدراسة."),
        bi("Its **relationships** link them: a student takes a course, a professor teaches it, it meets in a room.", "و**علاقاته (relationships)** تربط بينها: طالب يدرس مقررًا، وأستاذ يدرّسه، ويُعقد في قاعة."),
      ],
    },
    {
      id: "layers",
      pill: bi("Database, DBMS, system", "القاعدة والنظام"),
      heading: bi("Database, DBMS and database system", "قاعدة البيانات ونظام إدارتها ونظام قاعدة البيانات"),
      points: [
        bi("The **database** is the stored, logically related data.", "**قاعدة البيانات (database)** هي البيانات المخزَّنة المترابطة منطقيًا."),
        bi("The **DBMS** is the software around it that creates and maintains it and controls every access to it.", "**نظام إدارة قواعد البيانات (DBMS)** هو البرمجيات المحيطة بها التي تنشئها وتصونها وتتحكم في كل وصول إليها."),
        bi("The **database system** is both together, usually with the applications that use them.", "**نظام قاعدة البيانات (database system)** هو الاثنان معًا، وغالبًا مع التطبيقات التي تستخدمهما."),
      ],
    },
    {
      id: "dbms-jobs",
      pill: bi("What a DBMS does", "وظائف النظام"),
      heading: bi("Five jobs of a DBMS", "خمس وظائف لنظام إدارة قواعد البيانات"),
      points: [
        bi("**Define** the types, structures and constraints, then **construct** (load) the data onto disk.", "**يعرّف** الأنواع والبُنى والقيود (constraints)، ثم **ينشئ** البيانات (يحمّلها) على القرص."),
        bi("**Manipulate** it with queries and updates, and **share** it among many users at once.", "**يعالجها (Manipulate)** بالاستعلامات والتحديثات، و**يشاركها** بين مستخدمين كثيرين في وقت واحد."),
        bi("**Protect** it with security, backup and recovery, and **maintain** it as needs change.", "**يحميها** بالأمان والنسخ الاحتياطي والاسترداد، و**يصونها** مع تغيّر الاحتياجات."),
      ],
    },
  ],
});

// ---------- Why not just use files? ----------
export const files = defineWalkthrough({
  id: "db-files",
  title: bi("Why file processing breaks down", "لماذا تتعثر معالجة الملفات"),
  analogy: bi(
    "Three offices that each keep their own paper copy of your address. Move house, tell one office, and the other two keep posting letters to the old one.",
    "ثلاثة مكاتب يحتفظ كل منها بنسخة ورقية من عنوانك؛ فإذا انتقلت وأبلغت مكتبًا واحدًا، ظل المكتبان الآخران يرسلان الخطابات إلى العنوان القديم.",
  ),
  panels: [
    {
      id: "silos",
      pill: bi("A file per department", "ملف لكل قسم"),
      heading: bi("Every department, its own programs and files", "لكل قسم برامجه وملفاته"),
      points: [
        bi("Before DBMSs, each department wrote programs over files that only those programs could read.", "قبل أنظمة إدارة قواعد البيانات، كان كل قسم يكتب برامج تعمل على ملفات لا تقرؤها إلا تلك البرامج."),
        bi("At Pine Valley Furniture, order filling and invoicing both need customers, so the **customer file** exists twice.", "في شركة Pine Valley Furniture يحتاج نظاما تنفيذ الطلبات والفوترة كلاهما إلى العملاء، لذلك يوجد **ملف العملاء** مرتين."),
      ],
    },
    {
      id: "inconsistency",
      pill: bi("Duplication", "التكرار"),
      heading: bi("Three copies of one address", "ثلاث نسخ من عنوان واحد"),
      control: {
        label: bi("Event", "الحدث"),
        options: [
          { id: "before", label: bi("Before the move", "قبل الانتقال") },
          { id: "after", label: bi("The student moves", "الطالب ينتقل") },
        ],
        initial: "before",
      },
      points: [bi("A student's address is stored three times: by the registrar, the library and the housing office.", "عنوان الطالب مخزَّن ثلاث مرات: لدى شؤون الطلاب والمكتبة ومكتب السكن.")],
      pointsFor: {
        before: [bi("All three copies agree, but one fact takes three times the space. That is **redundancy**.", "تتطابق النسخ الثلاث، لكن حقيقة واحدة تشغل ثلاثة أضعاف المساحة، وهذا هو **التكرار (redundancy)**.")],
        after: [
          bi(
            "The student tells only the registrar. The library and housing copies are now wrong: the data is **inconsistent** and has lost its **integrity**.",
            "يُبلغ الطالب شؤون الطلاب فقط، فتصبح نسختا المكتبة والسكن خاطئتين: البيانات الآن **غير متسقة (inconsistent)** وقد فقدت **سلامتها (integrity)**.",
          ),
        ],
      },
    },
    {
      id: "dependence",
      pill: bi("Program–data dependence", "اعتماد البرامج"),
      heading: bi("Change the file format, and the programs break", "غيّر صيغة الملف فتتعطل البرامج"),
      control: {
        label: bi("Who manages the file", "من يدير الملف"),
        options: [
          { id: "files", label: bi("Plain files", "ملفات عادية") },
          { id: "dbms", label: bi("A DBMS", "نظام DBMS") },
        ],
        initial: "files",
      },
      points: [bi("The student file gets a new field, an email address, so its record layout changes.", "يُضاف إلى ملف الطلاب حقل جديد هو البريد الإلكتروني، فتتغير بنية السجل فيه.")],
      pointsFor: {
        files: [bi("Each program hard-codes the old layout in its own read and write routines, so **every program** must be rewritten.", "كل برنامج يثبّت البنية القديمة في إجراءات القراءة والكتابة الخاصة به، لذلك يجب إعادة كتابة **كل البرامج**.")],
        dbms: [
          bi(
            "With a DBMS the layout lives in the **catalog**. Only the catalog changes, and programs that don't use the new field keep working.",
            "مع نظام إدارة قواعد البيانات تكون البنية في **الكتالوج (catalog)**، فلا يتغير إلا الكتالوج، وتستمر البرامج التي لا تستخدم الحقل الجديد في العمل.",
          ),
        ],
      },
    },
    {
      id: "os",
      pill: bi("Why not the OS?", "لماذا لا نظام التشغيل؟"),
      heading: bi("An operating system manages files, not data", "نظام التشغيل يدير الملفات لا البيانات"),
      control: {
        label: bi("Compare", "قارن"),
        options: [
          { id: "load", label: bi("Reading one record", "قراءة سجل واحد") },
          { id: "security", label: bi("Security", "الأمان") },
        ],
        initial: "load",
      },
      points: [
        bi(
          "To the OS a file is a **string of characters**. To a DBMS it is **pages of records** that it can find and lock one by one.",
          "الملف بالنسبة إلى نظام التشغيل **سلسلة من الحروف**، أما بالنسبة إلى نظام إدارة قواعد البيانات فهو **صفحات من السجلات** يستطيع أن يعثر عليها ويقفلها واحدًا واحدًا.",
        ),
      ],
      pointsFor: {
        load: [
          bi(
            "The slides say the OS loads the **whole file** to read one record. A DBMS uses an **index** to fetch only the page that holds it.",
            "تقول الشرائح إن نظام التشغيل يحمّل **الملف كاملًا** لقراءة سجل واحد، أما نظام إدارة قواعد البيانات فيستخدم **فهرسًا (index)** ليجلب الصفحة التي تحتويه فقط.",
          ),
        ],
        security: [
          bi(
            "OS security works per **file**: you can open it or you can't. A DBMS gives each user a **view** with only the rows and columns they may see.",
            "الأمان في نظام التشغيل يعمل على مستوى **الملف**: إما أن تفتحه أو لا. أما نظام إدارة قواعد البيانات فيعطي كل مستخدم **عرضًا (view)** لا يحتوي إلا على الصفوف والأعمدة المسموح له برؤيتها.",
          ),
        ],
      },
    },
    {
      id: "sql",
      pill: bi("A program per question", "برنامج لكل سؤال"),
      heading: bi("One query language instead of a program per question", "لغة استعلام واحدة بدلًا من برنامج لكل سؤال"),
      control: {
        label: bi("Answer questions with", "أجب عن الأسئلة باستخدام"),
        options: [
          { id: "programs", label: bi("New programs", "برامج جديدة") },
          { id: "sql", label: bi("SQL", "SQL") },
        ],
        initial: "programs",
      },
      points: [
        bi("With files, every new question needs a programmer to write, test and run a **new program**.", "مع الملفات، يحتاج كل سؤال جديد إلى مبرمج يكتب **برنامجًا جديدًا** ويختبره ويشغّله."),
        bi("A DBMS answers any question written in **SQL**, its standard query language, with no new program.", "أما نظام إدارة قواعد البيانات فيجيب عن أي سؤال مكتوب بلغة **SQL**، وهي لغة الاستعلام القياسية فيه، دون برنامج جديد."),
      ],
    },
  ],
});

// ---------- The database approach ----------
export const approach = defineWalkthrough({
  id: "db-approach",
  title: bi("The database approach", "منهج قواعد البيانات"),
  analogy: bi(
    "One shared online document instead of copies sent by email: a single version that everyone works on, with permissions deciding who may read or change each part.",
    "مستند واحد مشترك على الإنترنت بدلًا من نسخ تُرسل بالبريد: نسخة واحدة يعمل عليها الجميع، وتحدد الصلاحيات من يستطيع قراءة كل جزء أو تعديله.",
  ),
  panels: [
    {
      id: "central",
      pill: bi("Central repository", "مستودع مركزي"),
      heading: bi("One shared store, managed by the DBMS", "مخزن مشترك واحد يديره نظام إدارة قواعد البيانات"),
      points: [
        bi("The departments' separate files are replaced by **one central repository** of shared data.", "يحل محل ملفات الأقسام المنفصلة **مستودعٌ مركزي واحد (central repository)** للبيانات المشتركة."),
        bi("Every program and user goes through the **DBMS**, which stores each fact once, in a standard form.", "يمر كل برنامج وكل مستخدم عبر **نظام إدارة قواعد البيانات (DBMS)**، الذي يخزّن كل حقيقة مرة واحدة وبصيغة قياسية."),
      ],
    },
    {
      id: "catalog",
      pill: bi("Self-describing", "الوصف الذاتي"),
      heading: bi("The database describes itself", "قاعدة البيانات تصف نفسها"),
      points: [
        bi("Before touching the data, the DBMS reads the **catalog** to learn the tables, columns, types and constraints.", "قبل أن يصل نظام إدارة قواعد البيانات إلى البيانات، يقرأ **الكتالوج (catalog)** ليعرف الجداول والأعمدة والأنواع والقيود."),
        bi("Because the description is stored with the data, one DBMS can serve many different databases.", "ولأن الوصف مخزَّن مع البيانات، يستطيع نظام واحد أن يخدم قواعد بيانات كثيرة مختلفة."),
      ],
    },
    {
      id: "independence",
      pill: bi("Program–data independence", "استقلال البرامج"),
      heading: bi("Storage can change without the programs noticing", "يتغير التخزين دون أن تلاحظ البرامج"),
      control: {
        label: bi("Storage", "التخزين"),
        options: [
          { id: "before", label: bi("Original layout", "التخطيط الأصلي") },
          { id: "after", label: bi("Reorganized", "بعد إعادة التنظيم") },
        ],
        initial: "before",
      },
      points: [
        bi("The program asks the DBMS for a student by name. It never sees how the records are stored.", "يطلب البرنامج من نظام إدارة قواعد البيانات طالبًا باسمه، ولا يرى أبدًا كيف تُخزَّن السجلات."),
        bi("This works because a **data model** hides storage details behind a conceptual view: **data abstraction**.", "ويتحقق ذلك لأن **نموذج البيانات (data model)** يُخفي تفاصيل التخزين خلف رؤية مفاهيمية، وهذا هو **تجريد البيانات (data abstraction)**."),
      ],
      pointsFor: {
        after: [bi("The DBA reorders the records and adds an **index**. The DBMS updates the catalog, and the program runs unchanged.", "يعيد مدير قاعدة البيانات (DBA) ترتيب السجلات ويضيف **فهرسًا (index)**، فيحدّث نظام إدارة قواعد البيانات الكتالوج، ويعمل البرنامج دون تغيير.")],
      },
    },
    {
      id: "views",
      pill: bi("Multiple views", "العروض المتعددة"),
      heading: bi("Each user sees only what they need", "كل مستخدم يرى ما يحتاجه فقط"),
      control: {
        label: bi("Signed in as", "المستخدم الحالي"),
        options: [
          { id: "registrar", label: bi("Registrar", "شؤون الطلاب") },
          { id: "library", label: bi("Library", "المكتبة") },
        ],
        initial: "registrar",
      },
      points: [bi("The STUDENT table is stored once, with all its columns.", "يُخزَّن جدول STUDENT مرة واحدة بكل أعمدته.")],
      pointsFor: {
        registrar: [bi("The registrar's **view** shows names, majors and GPAs, and hides addresses.", "يعرض **عرض (view)** شؤون الطلاب الأسماء والتخصصات والمعدلات، ويُخفي العناوين.")],
        library: [bi("The library's view shows names and addresses, and hides grades.", "ويعرض عرض المكتبة الأسماء والعناوين، ويُخفي الدرجات.")],
      },
    },
    {
      id: "sharing",
      pill: bi("Shared transactions", "المعاملات المشتركة"),
      heading: bi("Many users, one database, at the same time", "مستخدمون كثيرون وقاعدة بيانات واحدة في الوقت نفسه"),
      points: [
        bi("Two clerks try to book the last seat on a flight at the same moment (OLTP).", "يحاول موظفان حجز المقعد الأخير على رحلة في اللحظة نفسها (OLTP)."),
        bi("**Concurrency control** makes the second booking wait for the first, so the seat is sold only once.", "يجعل **التحكم في التزامن (concurrency control)** الحجز الثاني ينتظر الأول، فيُباع المقعد مرة واحدة فقط."),
        bi("**Recovery** makes sure a booking cut off by a failure leaves no half-written data.", "ويضمن **الاسترداد (recovery)** ألا يترك حجزٌ قطعه عطلٌ بياناتٍ مكتوبةً جزئيًا."),
      ],
    },
    {
      id: "tradeoffs",
      pill: bi("Advantages and costs", "المزايا والتكاليف"),
      heading: bi("Advantages, and when a DBMS isn't worth it", "المزايا، ومتى لا يستحق نظام إدارة قواعد البيانات تكلفته"),
      control: {
        label: bi("Show", "اعرض"),
        options: [
          { id: "pros", label: bi("Advantages", "المزايا") },
          { id: "costs", label: bi("When not to use one", "متى لا نستخدمه") },
        ],
        initial: "pros",
      },
      points: [bi("A DBMS brings real advantages, but it also costs money and processing time.", "يقدّم نظام إدارة قواعد البيانات مزايا حقيقية، لكنه يكلّف مالًا ووقت معالجة أيضًا.")],
      pointsFor: {
        pros: [bi("Less redundancy, enforced standards and quality, security and recovery, and faster development with SQL.", "تكرار أقل، ومعايير وجودة مفروضة، وأمان واسترداد، وتطوير أسرع باستخدام SQL.")],
        costs: [
          bi(
            "It may be unnecessary for a small application that won't change, for a single user, or for **hard real-time** work that can't afford its overhead.",
            "وقد يكون غير ضروري لتطبيق صغير لن يتغير، أو لمستخدم واحد، أو لعمل في **الزمن الحقيقي الصارم (hard real-time)** لا يحتمل عبئه الإضافي.",
          ),
        ],
      },
    },
  ],
});

// ---------- Database users ----------
export const users = defineWalkthrough({
  id: "db-users",
  title: bi("Who works with a database", "من يعمل مع قاعدة البيانات"),
  analogy: bi(
    "A theatre: the cast and crew you see (DBA, designers, programmers, end users) depend on the people who built the stage and the lights (DBMS and tool developers).",
    "مسرح: الممثلون وطاقم العرض الذين تراهم (مدير قاعدة البيانات والمصممون والمبرمجون والمستخدمون النهائيون) يعتمدون على من بنوا خشبة المسرح والإضاءة (مطوّرو نظام إدارة قواعد البيانات وأدواته).",
  ),
  panels: [
    {
      id: "stage",
      pill: bi("On and behind the scene", "على المسرح وخلفه"),
      heading: bi("Actors on the scene, workers behind it", "ممثلون على المسرح وعاملون خلفه"),
      points: [
        bi(
          "**Actors on the scene** use or run the database every day: the DBA, the designers, the application programmers and the end users.",
          "**الممثلون على المسرح (actors on the scene)** يستخدمون قاعدة البيانات أو يديرونها كل يوم: مدير قاعدة البيانات (DBA) والمصممون ومبرمجو التطبيقات والمستخدمون النهائيون.",
        ),
        bi(
          "**Workers behind the scene** never touch your data: they build the DBMS software and tools, and keep the system running.",
          "**العاملون خلف الكواليس (workers behind the scene)** لا يتعاملون مع بياناتك أبدًا: فهم يبنون برمجيات نظام إدارة قواعد البيانات وأدواته، ويحافظون على تشغيل النظام.",
        ),
      ],
    },
    {
      id: "handoff",
      pill: bi("Who does what", "من يفعل ماذا"),
      heading: bi("From design to daily use", "من التصميم إلى الاستخدام اليومي"),
      points: [
        bi("**Designers** decide the content, structure and constraints after talking to the users.", "يحدد **المصممون** المحتوى والبنية والقيود بعد التحاور مع المستخدمين."),
        bi("**Application programmers** write and test the canned transactions.", "يكتب **مبرمجو التطبيقات** المعاملات الجاهزة (canned transactions) ويختبرونها."),
        bi("The **DBA** grants access, monitors use and tunes performance while the **end users** work.", "ويمنح **مدير قاعدة البيانات (DBA)** صلاحيات الوصول، ويراقب الاستخدام، ويضبط الأداء، بينما يعمل **المستخدمون النهائيون**."),
      ],
    },
    {
      id: "end-users",
      pill: bi("Four kinds of end user", "أنواع المستخدمين النهائيين"),
      heading: bi("How each kind of end user reaches the data", "كيف يصل كل نوع من المستخدمين النهائيين إلى البيانات"),
      control: {
        label: bi("End user", "المستخدم النهائي"),
        options: [
          { id: "casual", label: bi("Casual", "العَرَضي") },
          { id: "parametric", label: bi("Parametric", "البارامتري") },
          { id: "sophisticated", label: bi("Sophisticated", "المتمرّس") },
          { id: "standalone", label: bi("Stand-alone", "المستقل") },
        ],
        initial: "parametric",
      },
      points: [bi("End users differ in how often they use the database and how much they know about it.", "يختلف المستخدمون النهائيون في عدد مرات استخدامهم لقاعدة البيانات ومقدار معرفتهم بها.")],
      pointsFor: {
        casual: [bi("**Casual**: an occasional ad-hoc query, with a different need each time, like a manager asking for this month's sales.", "**العَرَضي (Casual)**: استعلام مخصص (ad-hoc query) من حين لآخر باحتياج مختلف كل مرة، مثل مدير يطلب مبيعات هذا الشهر.")],
        parametric: [
          bi(
            "**Naïve / parametric**, the largest group: a bank teller fills in the same fixed screen all day, and the screen runs a canned transaction.",
            "**المبتدئ / البارامتري (parametric)**، وهو أكبر فئة: صرّاف بنك يملأ الشاشة الثابتة نفسها طوال اليوم، وتشغّل الشاشة معاملة جاهزة (canned transaction).",
          ),
        ],
        sophisticated: [bi("**Sophisticated**: analysts and engineers who write their own complex queries with advanced tools.", "**المتمرّس (Sophisticated)**: محللون ومهندسون يكتبون استعلاماتهم المعقدة بأنفسهم باستخدام أدوات متقدمة.")],
        standalone: [bi("**Stand-alone**: one person with a personal database inside packaged software, such as a tax program.", "**المستقل (Stand-alone)**: شخص واحد لديه قاعدة بيانات شخصية داخل برمجيات جاهزة، مثل برنامج لحساب الضرائب.")],
      },
    },
  ],
});

// ---------- Applications and the evolution of data models ----------
export const evolution = defineWalkthrough({
  id: "db-evolution",
  title: bi("How data models evolved", "كيف تطورت نماذج البيانات"),
  analogy: bi(
    "Directions to a friend's house. The navigational models are turn-by-turn instructions from your front door; the relational model is an address you hand to a taxi driver.",
    "الوصول إلى بيت صديق: النماذج التنقلية تعليمات منعطفًا بعد منعطف تبدأ من باب بيتك، أما النموذج العلائقي فعنوان تعطيه لسائق سيارة أجرة.",
  ),
  panels: [
    {
      id: "timeline",
      pill: bi("Timeline", "الخط الزمني"),
      heading: bi("Fifty years of data models", "خمسون عامًا من نماذج البيانات"),
      points: [
        bi("A **data model** is a set of concepts for describing data that hides how it is stored.", "**نموذج البيانات (data model)** مجموعة من المفاهيم لوصف البيانات تُخفي طريقة تخزينها."),
        bi("Each new model fixed a weakness of the one before: duplication, rigid pointers, no objects, a fixed structure.", "عالج كل نموذج جديد نقطة ضعف في النموذج السابق: التكرار، ثم المؤشرات الجامدة، ثم غياب الكائنات، ثم البنية الثابتة."),
      ],
    },
    {
      id: "flat",
      pill: bi("1960s · Flat files", "الملفات المسطحة"),
      heading: bi("Flat files: one big table per file", "الملفات المسطحة: جدول كبير واحد لكل ملف"),
      points: [
        bi("Each file is a single table, so a customer with three orders is written out three times.", "كل ملف جدول واحد، لذلك يُكتب العميل الذي له ثلاثة طلبات ثلاث مرات."),
        bi("The repeated name and address are the duplication the later models set out to remove.", "والاسم والعنوان المكرران هما التكرار الذي سعت النماذج اللاحقة إلى إزالته."),
      ],
    },
    {
      id: "navigational",
      pill: bi("1960s–70s · Hierarchical, network", "الهرمي والشبكي"),
      heading: bi("Records linked by pointers", "سجلات تربطها المؤشرات"),
      control: {
        label: bi("Model", "النموذج"),
        options: [
          { id: "hierarchical", label: bi("Hierarchical", "الهرمي") },
          { id: "network", label: bi("Network", "الشبكي") },
        ],
        initial: "hierarchical",
      },
      points: [bi("Records are linked by **pointers**, and a program reaches data by **navigating** from record to record.", "ترتبط السجلات **بمؤشرات (pointers)**، ويصل البرنامج إلى البيانات **بالتنقل (navigating)** من سجل إلى آخر.")],
      pointsFor: {
        hierarchical: [
          bi(
            "**Hierarchical**: a parent–child tree. Each record has exactly one parent, so a course offered by two departments must be stored twice.",
            "**الهرمي (Hierarchical)**: شجرة أب–ابن (parent–child)؛ لكل سجل أب واحد فقط، لذلك يجب تخزين المقرر الذي يقدّمه قسمان مرتين.",
          ),
        ],
        network: [
          bi(
            "**Network**: a general graph. A record can have several owners, so the course is stored once, but the access paths are fixed in the program.",
            "**الشبكي (Network)**: مخطط بياني عام (graph)؛ يمكن أن يكون للسجل عدة مالكين، فيُخزَّن المقرر مرة واحدة، لكن مسارات الوصول مثبتة في البرنامج.",
          ),
        ],
      },
    },
    {
      id: "relational",
      pill: bi("1970s–80s · Relational", "العلائقي"),
      heading: bi("Relational: tables linked by values", "العلائقي: جداول تربطها القيم"),
      points: [
        bi("Codd (1970) put all data in **tables** (relations). Rows refer to each other by **key values**, not pointers.", "وضع Codd عام 1970 كل البيانات في **جداول** (علاقات relations)، وتشير الصفوف بعضها إلى بعض **بقيم المفاتيح (key values)** لا بالمؤشرات."),
        bi("You state in **SQL** what you want, and the DBMS finds the path. It is still the dominant model.", "تذكر بلغة **SQL** ما تريد، ويجد نظام إدارة قواعد البيانات الطريق بنفسه، وما زال هذا النموذج هو السائد."),
      ],
    },
    {
      id: "object",
      pill: bi("1990s · Object", "الكائني"),
      heading: bi("Objects: data with behaviour", "الكائنات: بيانات لها سلوك"),
      points: [
        bi("An **object** keeps its attributes together with its **methods**, as in object-oriented programming.", "يحتفظ **الكائن (object)** بسماته مع **دواله (methods)**، كما في البرمجة الكائنية."),
        bi("Relational DBMSs adopted object features, which gave the **object-relational** model.", "وتبنّت أنظمة إدارة قواعد البيانات العلائقية خصائص كائنية، فنشأ النموذج **الكائني العلائقي (object-relational)**."),
      ],
    },
    {
      id: "semi",
      pill: bi("2000s · XML, RDF", "XML و RDF"),
      heading: bi("Semi-structured data", "البيانات شبه المهيكلة"),
      control: {
        label: bi("Format", "الصيغة"),
        options: [
          { id: "xml", label: bi("XML", "XML") },
          { id: "rdf", label: bi("RDF", "RDF") },
        ],
        initial: "xml",
      },
      points: [bi("Items of the same type may have **different attributes**, so the structure travels with the data.", "قد تكون لعناصر النوع نفسه **سمات مختلفة**، لذلك تنتقل البنية مع البيانات.")],
      pointsFor: {
        xml: [bi("**XML** nests tagged elements: one book lists two authors, another lists an edition instead.", "في **XML** تتداخل عناصر موسومة: كتاب يذكر مؤلفَين، وكتاب آخر يذكر رقم الطبعة بدلًا من ذلك.")],
        rdf: [
          bi(
            "**RDF** stores facts as subject–predicate–object **triples** that link up into a graph, the basis of knowledge graphs.",
            "تخزّن **RDF** الحقائق على هيئة **ثلاثيات (triples)** من فاعل ومحمول ومفعول ترتبط معًا في مخطط بياني، وهي أساس رسوم المعرفة البيانية (knowledge graphs).",
          ),
        ],
      },
    },
  ],
});

// ---------- Inside a DBMS: query answering ----------
export const queryPath = defineWalkthrough({
  id: "db-query-path",
  title: bi("How a DBMS answers a command", "كيف يجيب نظام إدارة قواعد البيانات عن أمر"),
  analogy: bi(
    "A restaurant kitchen. The order is read and planned, the cook works from the shelf beside the stove (the buffer), and only what's missing is fetched from the storeroom (the disk).",
    "مطبخ مطعم: يُقرأ الطلب وتوضع خطته، ويعمل الطاهي من الرف المجاور للموقد (المخزن المؤقت)، ولا يُجلب من المخزن الكبير (القرص) إلا ما ينقص.",
  ),
  panels: [
    {
      id: "ddl-dml",
      pill: bi("DDL and DML", "DDL و DML"),
      heading: bi("Two kinds of command, two paths", "نوعان من الأوامر ومساران"),
      control: {
        label: bi("Command", "الأمر"),
        options: [
          { id: "ddl", label: bi("DDL, from the DBA", "DDL من مدير القاعدة") },
          { id: "dml", label: bi("DML, from users", "DML من المستخدمين") },
        ],
        initial: "dml",
      },
      points: [bi("Commands reach the DBMS from **two sources**, and they take different paths inside it.", "تصل الأوامر إلى نظام إدارة قواعد البيانات من **مصدرين**، وتسلك داخله مسارين مختلفين.")],
      pointsFor: {
        ddl: [
          bi(
            "**DDL** (CREATE, ALTER) comes from the DBA, needs special authority and changes the **schema**: the DDL processor updates the **metadata**.",
            "تأتي أوامر **DDL** (CREATE و ALTER) من مدير قاعدة البيانات (DBA)، وتحتاج إلى صلاحية خاصة، وتغيّر **المخطط (schema)**: إذ يحدّث معالج DDL **البيانات الوصفية (metadata)**.",
          ),
        ],
        dml: [
          bi(
            "**DML** (SELECT, INSERT, UPDATE, DELETE) comes from users and programs, leaves the schema alone, and reads or changes the **data**.",
            "تأتي أوامر **DML** (SELECT و INSERT و UPDATE و DELETE) من المستخدمين والبرامج، ولا تمس المخطط، بل تقرأ **البيانات** أو تغيّرها.",
          ),
        ],
      },
    },
    {
      id: "query",
      pill: bi("Query answering", "الإجابة عن الاستعلام"),
      heading: bi("A query's trip through the DBMS", "رحلة الاستعلام داخل نظام إدارة قواعد البيانات"),
      control: {
        label: bi("The page it needs is", "الصفحة المطلوبة"),
        options: [
          { id: "hit", label: bi("Already in a buffer", "في مخزن مؤقت") },
          { id: "miss", label: bi("Only on disk", "على القرص فقط") },
        ],
        initial: "miss",
      },
      points: [
        bi("The **query compiler** parses the SQL and optimizes it into a **query plan**.", "يحلّل **مترجم الاستعلامات (query compiler)** عبارة SQL ويحسّنها ليحوّلها إلى **خطة استعلام (query plan)**."),
        bi("The **execution engine** runs the plan and asks the **index/file/record manager** for the records.", "ينفّذ **محرك التنفيذ (execution engine)** الخطة، ويطلب السجلات من **مدير الفهارس والملفات والسجلات (index/file/record manager)**."),
      ],
      pointsFor: {
        hit: [bi("The page is already in a memory **buffer**, so the answer comes back without touching the disk.", "الصفحة موجودة بالفعل في **مخزن مؤقت (buffer)** في الذاكرة، فتعود الإجابة دون الوصول إلى القرص.")],
        miss: [
          bi(
            "The **buffer manager** doesn't have the page, so the **storage manager** first reads the block from disk into a buffer.",
            "لا يملك **مدير المخازن المؤقتة (buffer manager)** الصفحة، فيقرأ **مدير التخزين (storage manager)** الكتلة من القرص إلى مخزن مؤقت أولًا.",
          ),
        ],
      },
    },
    {
      id: "info",
      pill: bi("Five kinds of information", "خمسة أنواع من المعلومات"),
      heading: bi("What the components consult along the way", "ما تستعين به المكوّنات في الطريق"),
      points: [
        bi("**Data** and **metadata**: the records themselves and the catalog that describes them.", "**البيانات** و**البيانات الوصفية (metadata)**: السجلات نفسها والكتالوج الذي يصفها."),
        bi("**Statistics** (table sizes, value counts) help the optimizer choose a good plan, and **indexes** find records fast.", "تساعد **الإحصاءات (statistics)** (أحجام الجداول وأعداد القيم) المُحسِّنَ على اختيار خطة جيدة، وتعثر **الفهارس (indexes)** على السجلات بسرعة."),
        bi("The **log** records every change, so transactions can be undone or redone.", "ويسجّل **السجل (log)** كل تغيير، ليمكن التراجع عن المعاملات أو إعادة تنفيذها."),
      ],
    },
  ],
});

// ---------- Inside a DBMS: transaction processing ----------
const ok = transfer(START, AMOUNT);
const crashed = transfer(START, AMOUNT, true);
const noLock = deposits(START.A, AMOUNT, AMOUNT, false);
const withLock = deposits(START.A, AMOUNT, AMOUNT, true);

export const transactions = defineWalkthrough({
  id: "db-transactions",
  title: bi("Transactions: all or nothing, as if alone", "المعاملات: كلها أو لا شيء، وكأن كلًّا منها وحدها"),
  analogy: bi(
    "A vending machine: either you get the snack and it keeps your coin, or the coin comes back. It never keeps the coin and leaves the snack stuck halfway.",
    "آلة بيع: إما أن تحصل على الوجبة وتحتفظ الآلة بعملتك، وإما أن تعود إليك العملة؛ ولا تحتفظ أبدًا بالعملة وتترك الوجبة عالقة في منتصف الطريق.",
  ),
  facts: {
    transfer: AMOUNT,
    total: total(START),
    drop: total(START) - total(crashed.beforeRecovery),
    lost: noLock.lost,
  },
  panels: [
    {
      id: "acid",
      pill: bi("ACID", "ACID"),
      heading: bi("A transaction is one unit of work", "المعاملة وحدة عمل واحدة"),
      points: [
        bi(`Moving ${AMOUNT} from A to B is two updates, a debit and a credit. Together they form one **transaction**.`, `نقل ${AMOUNT} من A إلى B تحديثان، خصم وإيداع، ويشكّلان معًا **معاملة (transaction)** واحدة.`),
        bi(`**Atomicity**: both happen or neither does. **Consistency**: A + B stays ${total(START)}.`, `**الذرّية (Atomicity)**: يحدث الاثنان أو لا يحدث أي منهما. **الاتساق (Consistency)**: يبقى مجموع A + B مساويًا ${total(START)}.`),
        bi("**Isolation**: no one else sees the halfway state. **Durability**: after COMMIT the transfer survives a crash.", "**العزل (Isolation)**: لا يرى أحد غيرها الحالة الوسيطة. **الديمومة (Durability)**: بعد COMMIT تبقى عملية التحويل حتى لو تعطّل النظام."),
      ],
    },
    {
      id: "crash",
      pill: bi("Crash before COMMIT", "تعطّل قبل COMMIT"),
      heading: bi("The log lets the DBMS undo half a transaction", "السجل يتيح التراجع عن نصف معاملة"),
      control: {
        label: bi("The server", "الخادم"),
        options: [
          { id: "ok", label: bi("Runs normally", "يعمل طبيعيًا") },
          { id: "crash", label: bi("Crashes after the debit", "يتعطل بعد الخصم") },
        ],
        initial: "crash",
      },
      points: [bi("Before changing a record, the DBMS writes the change to the **log** on disk.", "قبل تغيير أي سجل، يكتب نظام إدارة قواعد البيانات التغيير في **السجل (log)** على القرص.")],
      pointsFor: {
        ok: [bi(`Both updates run and COMMIT is logged: A = ${ok.final.A}, B = ${ok.final.B}.`, `يُنفَّذ التحديثان وتُسجَّل COMMIT، فيصبح A = ${ok.final.A} و B = ${ok.final.B}.`)],
        crash: [
          bi(
            `The server dies after the debit: A = ${crashed.beforeRecovery.A}, B = ${crashed.beforeRecovery.B}, and ${AMOUNT} has vanished. On restart the **recovery manager** finds no COMMIT in the log and **undoes** the debit.`,
            `يتعطل الخادم بعد الخصم: A = ${crashed.beforeRecovery.A} و B = ${crashed.beforeRecovery.B}، واختفت ${AMOUNT}. وعند إعادة التشغيل لا يجد **مدير الاسترداد (recovery manager)** عبارة COMMIT في السجل، فيتراجع (undo) عن الخصم.`,
          ),
        ],
      },
    },
    {
      id: "lost-update",
      pill: bi("Locks", "الأقفال"),
      heading: bi("Two deposits at the same moment", "إيداعان في اللحظة نفسها"),
      control: {
        label: bi("Concurrency control", "التحكم في التزامن"),
        options: [
          { id: "none", label: bi("No lock", "بلا قفل") },
          { id: "lock", label: bi("With a lock", "مع قفل") },
        ],
        initial: "none",
      },
      points: [bi(`T1 and T2 each deposit ${AMOUNT} into account A, which holds ${START.A}, at the same moment.`, `تودع المعاملتان T1 و T2 كلٌّ منهما ${AMOUNT} في الحساب A، الذي يحتوي على ${START.A}، في اللحظة نفسها.`)],
      pointsFor: {
        none: [
          bi(
            `Both read ${START.A} and both write ${noLock.final}: one deposit is **lost**, and A ends at ${noLock.final} instead of ${noLock.correct}.`,
            `تقرأ كلتاهما ${START.A} وتكتب كلتاهما ${noLock.final}، فيضيع أحد الإيداعين (**lost update**)، وينتهي A عند ${noLock.final} بدلًا من ${noLock.correct}.`,
          ),
        ],
        lock: [
          bi(
            `T1 **locks** A first. T2 waits, then reads ${withLock.events.find((e) => e.who === "T2" && e.op === "read")!.value} and writes ${withLock.final}. The scheduler keeps locks in a lock table in memory.`,
            `تقفل T1 الحساب A أولًا (**lock**)، فتنتظر T2، ثم تقرأ ${withLock.events.find((e) => e.who === "T2" && e.op === "read")!.value} وتكتب ${withLock.final}. ويحتفظ المُجدوِل (scheduler) بالأقفال في جدول أقفال (lock table) في الذاكرة.`,
          ),
        ],
      },
    },
    {
      id: "deadlock",
      pill: bi("Deadlock", "الجمود"),
      heading: bi("Waiting for each other forever", "انتظار متبادل إلى الأبد"),
      control: {
        label: bi("Stage", "المرحلة"),
        options: [
          { id: "stuck", label: bi("Both waiting", "كلتاهما تنتظر") },
          { id: "resolved", label: bi("Victim rolled back", "التراجع عن الضحية") },
        ],
        initial: "stuck",
      },
      points: [bi("T1 (A → B) locks A, and T2 (B → A) locks B. Now T1 needs B and T2 needs A.", "تقفل T1 (من A إلى B) الحساب A، وتقفل T2 (من B إلى A) الحساب B؛ والآن تحتاج T1 إلى B وتحتاج T2 إلى A.")],
      pointsFor: {
        stuck: [bi("The wait-for graph has a **cycle**: neither transaction can ever continue.", "في مخطط الانتظار (wait-for graph) **دورة (cycle)**: لا تستطيع أي من المعاملتين المتابعة أبدًا.")],
        resolved: [
          bi(
            "The DBMS picks a **victim**, the one that has done less work (T2), and **rolls it back**. Its lock on B is released, T1 commits, and T2 restarts later.",
            "يختار نظام إدارة قواعد البيانات **ضحية (victim)**، وهي المعاملة التي أنجزت عملًا أقل (T2)، ويتراجع عنها (**rolls it back**)، فيتحرر قفلها على B، وتُؤكَّد T1، ثم يُعاد تشغيل T2 لاحقًا.",
          ),
        ],
      },
    },
    {
      id: "durable",
      pill: bi("After COMMIT", "بعد COMMIT"),
      heading: bi("Committed means it survives", "ما أُكِّد يبقى"),
      points: [
        bi("Once COMMIT is in the log, the transfer is **durable**, even if the new balances were still only in memory.", "بمجرد أن تصل COMMIT إلى السجل تصبح عملية التحويل **دائمة (durable)**، حتى لو كانت الأرصدة الجديدة ما زالت في الذاكرة فقط."),
        bi("After a crash the recovery manager **redoes** committed work from the log and **undoes** uncommitted work.", "وبعد التعطل يعيد مدير الاسترداد تنفيذ العمل المؤكَّد من السجل (**redo**)، ويتراجع عن العمل غير المؤكَّد (**undo**)."),
      ],
    },
  ],
});

// ---------- Accessing a database from programs ----------
export const programs = defineWalkthrough({
  id: "db-programs",
  title: bi("Talking to a database from a program", "التخاطب مع قاعدة البيانات من برنامج"),
  analogy: bi(
    "Sending a letter for every question (API calls), compared with handing a trusted clerk inside the office a list of tasks to do there (PL/SQL).",
    "إرسال خطاب مع كل سؤال (استدعاءات API)، مقارنةً بتسليم موظف موثوق داخل المكتب قائمة مهام ينجزها هناك (PL/SQL).",
  ),
  panels: [
    {
      id: "declarative",
      pill: bi("What, not how", "ماذا لا كيف"),
      heading: bi("SQL says what you want", "SQL تقول ما تريد"),
      control: {
        label: bi("Style", "الأسلوب"),
        options: [
          { id: "sql", label: bi("SQL (declarative)", "SQL (تصريحية)") },
          { id: "loop", label: bi("Hand-written loop", "حلقة مكتوبة يدويًا") },
        ],
        initial: "sql",
      },
      points: [
        bi("SQL is **declarative**: you describe the result, and the DBMS decides how to get it.", "لغة SQL **تصريحية (declarative)**: تصف النتيجة، ويقرر نظام إدارة قواعد البيانات كيف يحصل عليها."),
        bi("SQL can't read input, draw screens or use the network, so applications are written in a **host language** that sends SQL to the DBMS.", "ولا تستطيع SQL قراءة المدخلات أو رسم الشاشات أو استخدام الشبكة، لذلك تُكتب التطبيقات بـ**لغة مضيفة (host language)** ترسل عبارات SQL إلى نظام إدارة قواعد البيانات."),
      ],
      pointsFor: {
        loop: [bi("Without SQL the program spells out the **how**: open the file, read every record, test the GPA, print the name.", "ومن دون SQL يشرح البرنامج **الكيفية**: يفتح الملف، ويقرأ كل سجل، ويختبر المعدل، ويطبع الاسم.")],
      },
    },
    {
      id: "api",
      pill: bi("Procedure-call API", "واجهة API"),
      heading: bi("The API approach: send SQL, fetch rows", "منهج API: أرسل SQL واجلب الصفوف"),
      points: [
        bi("A library (ODBC, JDBC, Python DB-API) **connects**, sends the SQL as a **string**, and gets back a **cursor**.", "تتصل مكتبة (ODBC أو JDBC أو Python DB-API) بقاعدة البيانات، وترسل عبارة SQL على هيئة **نص (string)**، وتحصل على **مؤشر (cursor)**."),
        bi("The program pulls the result rows through the cursor one at a time, as in api_approach.py.", "ويسحب البرنامج صفوف النتيجة عبر المؤشر واحدًا تلو الآخر، كما في api_approach.py."),
      ],
    },
    {
      id: "embedded",
      pill: bi("Embedded SQL", "SQL المضمَّنة"),
      heading: bi("Embedded SQL: a precompiler rewrites it", "SQL المضمَّنة: يعيد مترجم أولي كتابتها"),
      points: [
        bi("SQL is written straight into the C or Java source, marked with EXEC SQL.", "تُكتب عبارات SQL مباشرة داخل شيفرة C أو Java، وتُميَّز بالكلمة EXEC SQL."),
        bi("A **precompiler** replaces each EXEC SQL with API calls, then the normal compiler builds the program.", "يستبدل **مترجم أولي (precompiler)** كل EXEC SQL باستدعاءات API، ثم يبني المترجم العادي البرنامج."),
      ],
    },
    {
      id: "plsql",
      pill: bi("PL/SQL", "PL/SQL"),
      heading: bi("A database programming language", "لغة برمجة قواعد البيانات"),
      control: {
        label: bi("The loop runs", "تعمل الحلقة"),
        options: [
          { id: "client", label: bi("In the app (API)", "في التطبيق (API)") },
          { id: "server", label: bi("In the DBMS (PL/SQL)", "داخل النظام (PL/SQL)") },
        ],
        initial: "client",
      },
      points: [bi("**PL/SQL** adds variables, loops and procedures around SQL, and its code runs **inside the DBMS server**.", "تضيف **PL/SQL** المتغيرات والحلقات والإجراءات حول SQL، وتعمل شيفرتها **داخل خادم نظام إدارة قواعد البيانات**.")],
      pointsFor: {
        client: [bi("Updating 3 rows one by one from the app costs one network **round trip** per statement: 3 trips.", "تحديث 3 صفوف واحدًا تلو الآخر من التطبيق يكلّف **رحلة ذهاب وإياب (round trip)** عبر الشبكة لكل عبارة: 3 رحلات.")],
        server: [bi("Calling one stored PL/SQL procedure does the same work in **1 round trip**, because the loop runs next to the data.", "واستدعاء إجراء PL/SQL مخزَّن واحد ينجز العمل نفسه في **رحلة واحدة**، لأن الحلقة تعمل بجوار البيانات.")],
      },
    },
  ],
});

# Arabic translation guide and glossary

This file is the reference for every Arabic translation on the site. It is not rendered as a page.
The worked example that follows every rule is
`content/subjects/operating-systems/sections/02-getting-help.mdx`.

## 1 · Style

- **Modern Standard Arabic**, clear and concise, as in a good Egyptian faculty textbook. Translate
  the meaning faithfully: don't add explanations, don't drop details, don't summarize.
- **Technical terms:** Arabic term followed by the English term in brackets, at its **first use in
  each block** (paragraph, list item, cell, quiz question…): «العملية (Process)». After that, Arabic only.
  Very common words (file, page, command, user, system) need no English.
- **Keep in English, never translate:** code, commands, options, file names and paths, identifiers,
  function and class names, SQL keywords, URLs, math, product names (Linux, Python, Oracle, ROS 2,
  Arduino, GNU), people's names, and protocol names (SSH, TCP).
- **Inside `<Ar>` body text, put every command, option, path, file name, keyword or code token in
  backticks**, even if the English sentence wrote it plainly. Right-to-left text moves a leading dash
  or slash to the wrong end (`--help` shows as `help--`); backticks isolate it. The checker enforces
  this. Never use invisible direction marks (U+200E, U+200F…).
- **Numbers and digits:** Western digits (1, 2, 3), exactly as in the English.
- **Punctuation:** Arabic comma «،», semicolon «؛» and question mark «؟». Quotation marks «…».
  Keep the English sentence's colon when it introduces a code block or a table.
- **Formatting mirrors the English:** bold stays bold, a list item stays a list item. Emphasised
  English words (`*word*`) may be bold or plain in Arabic.
- **Headings:** translate the meaning; keep a product or command name as is («الأمر locate»).

## 2 · Syntax (MDX)

| English block | Arabic goes |
|---|---|
| Paragraph | On its own line after a blank line: `<Ar>…</Ar>` |
| Heading (`##`, `###`) | On its own line after a blank line, short: `<Ar>…</Ar>` |
| List item (`-`, `1.`) | On the next line, indented like the item's text: `  <Ar>…</Ar>` (3 spaces for `1.`) |
| Table cell (header cells too) | Inside the cell after the English: `English <Ar>عربي</Ar>`. Cells that are only code or numbers need nothing |
| Text inside `<Callout>`, `<Card>`, `<Definition>`, `<Exercise>`, `<Solution>` | Same rules; inside JSX bodies that use `<strong>`/`<code>`/`<em>`, use the same HTML tags in the Arabic |
| `title="…"` on `Callout`, `Card`, `Exercise` | Add `titleAr="…"` right after it |
| `term="…"` on `Definition` | Add `termAr="…"` |
| `caption="…"` on `SlideFigure` | Add `captionAr="…"` |
| `caption="…"` / `title="…"` on an interactive widget (`ConvolutionStepper`, `StateMachine`, `SearchStepper`, `RelationalAlgebra`, `EncoderSim`) | Add `captionAr="…"` / `titleAr="…"`. Everything else a widget shows (buttons, labels, step explanations) is written in both languages in its code under `components/widgets/`, typed `Bi = { en, ar }`, so nothing else is needed in the MDX. A widget's data props (matrices, node lists, event paths) stay as they are |
| Quiz question | Add `qAr` after `q`, `optionsAr` (same number of entries) after `options`, `explainAr` after `explain`, each on its own line. An option that is pure code (`"ls -a"`, `"/recursive"`) is copied unchanged |
| Frontmatter | `titleAr: "…"` after `title`, `summaryAr: "…"` after `summary`, always in double quotes |
| `subject.json` | `titleAr`, `taglineAr`, `descriptionAr`, `objectivesAr` (one entry per objective), and `labelAr` in each grading entry |

Code blocks, math blocks, `<SlideFigure>` page numbers, `<Tree>`/`<WeightedGraph>`/`<AgentLoop>`
diagrams and `topics:` chips stay as they are. **Never change a single character of the English**:
`npm run check:arabic <file>` compares the file with git and fails if you do.

Plain strings (frontmatter, props, quiz) can't use backticks; there the site isolates English runs
automatically, so write commands and paths plainly: `"…باستخدام man -k و apropos"`.

## 3 · Glossary

### General and course words

| English | Arabic |
|---|---|
| lecture / section (lab) | المحاضرة / السكشن (Section) |
| objectives / takeaways | الأهداف / أهم النقاط |
| exercise / solution / quiz | تمرين / الحل / اختبار |
| example / note / tip | مثال / ملاحظة / نصيحة |
| definition | تعريف |
| algorithm | الخوارزمية |
| function (programming) | الدالة (function) |
| variable / constant | المتغير / الثابت |
| input / output | المدخلات / المخرجات |
| performance / efficiency | الأداء / الكفاءة |
| implementation | التنفيذ (implementation) |
| model / modelling | النموذج / النمذجة |
| design | التصميم |
| interface | الواجهة (interface) |
| component / module | المكوّن (component) / الوحدة (module) |
| user / administrator | المستخدم / مدير النظام |
| data / information | البيانات / المعلومات |
| hardware / software | العتاد (hardware) / البرمجيات (software) |
| network / server / client | الشبكة / الخادم (server) / العميل (client) |
| file / directory (folder) / path | الملف / المجلد (directory) / المسار (path) |
| command / option / argument | الأمر / الخيار (option) / الوسيط (argument) |
| syntax | الصيغة (syntax) |
| error / bug | الخطأ / الخلل (bug) |
| memory / storage | الذاكرة / التخزين |

### Artificial intelligence

| English | Arabic |
|---|---|
| artificial intelligence | الذكاء الاصطناعي (Artificial Intelligence) |
| agent / rational agent | الوكيل (agent) / الوكيل العقلاني (rational agent) |
| environment / task environment | البيئة / بيئة المهمة (task environment) |
| percept / percept sequence | الإدراك (percept) / تسلسل الإدراكات |
| sensor / actuator | المستشعر (sensor) / المشغِّل (actuator) |
| performance measure | مقياس الأداء (performance measure) |
| PEAS | PEAS (مقياس الأداء، البيئة، المشغِّلات، المستشعرات) |
| fully / partially observable | قابلة للملاحظة كليًا / جزئيًا (fully / partially observable) |
| deterministic / stochastic | حتمية (deterministic) / عشوائية (stochastic) |
| episodic / sequential | عَرَضية (episodic) / تتابعية (sequential) |
| static / dynamic | ساكنة (static) / ديناميكية (dynamic) |
| discrete / continuous | منفصلة (discrete) / متصلة (continuous) |
| single-agent / multi-agent | وكيل واحد / متعددة الوكلاء (multi-agent) |
| simple reflex / model-based / goal-based / utility-based agent | وكيل الانعكاس البسيط / القائم على النموذج / القائم على الهدف / القائم على المنفعة |
| learning agent | الوكيل المتعلِّم (learning agent) |
| problem formulation | صياغة المسألة (problem formulation) |
| state / initial state / goal state | الحالة (state) / الحالة الابتدائية / الحالة الهدف |
| state space | فضاء الحالات (state space) |
| action / transition model | الفعل (action) / نموذج الانتقال (transition model) |
| goal test / path cost / step cost | اختبار الهدف (goal test) / تكلفة المسار (path cost) / تكلفة الخطوة |
| search tree / node / frontier | شجرة البحث (search tree) / العقدة (node) / الحافة (frontier) |
| explored set | المجموعة المستكشفة (explored set) |
| uninformed (blind) search | البحث غير المُوجَّه (uninformed search) |
| informed (heuristic) search | البحث المُوجَّه (informed search) |
| breadth-first search (BFS) | البحث بالعرض أولًا (BFS) |
| depth-first search (DFS) | البحث بالعمق أولًا (DFS) |
| uniform-cost search (UCS) | البحث بالتكلفة الموحدة (UCS) |
| depth-limited / iterative deepening search | البحث محدود العمق / البحث بالتعميق التكراري (iterative deepening) |
| heuristic function | الدالة الاستدلالية (heuristic) |
| admissible / consistent heuristic | استدلال مقبول (admissible) / متّسق (consistent) |
| greedy best-first search | البحث الجشع الأفضل أولًا (greedy best-first) |
| A* search | البحث A* |
| completeness / optimality | الاكتمال (completeness) / الأمثلية (optimality) |
| time / space complexity | التعقيد الزمني / التعقيد المكاني |
| branching factor | معامل التفرّع (branching factor) |
| priority queue / queue / stack | طابور الأولوية (priority queue) / الطابور (queue) / المكدس (stack) |
| adversarial search / game tree | البحث التنافسي (adversarial search) / شجرة اللعبة |
| minimax / alpha-beta pruning | خوارزمية minimax / التقليم ألفا-بيتا (alpha-beta pruning) |
| utility | المنفعة (utility) |
| optimization / cost function | التحسين (optimization) / دالة التكلفة (cost function) |
| genetic algorithm / fitness / crossover / mutation | الخوارزمية الجينية / اللياقة (fitness) / التهجين (crossover) / الطفرة (mutation) |
| knowledge representation / knowledge base | تمثيل المعرفة / قاعدة المعرفة (knowledge base) |
| propositional / first-order logic | منطق القضايا (propositional logic) / منطق الرتبة الأولى (first-order logic) |
| inference / rule | الاستدلال (inference) / القاعدة |
| expert system / inference engine | النظام الخبير (expert system) / محرك الاستدلال (inference engine) |
| forward / backward chaining | التسلسل الأمامي / الخلفي (forward / backward chaining) |
| machine learning / supervised / unsupervised | تعلم الآلة / التعلم الموجَّه (supervised) / غير الموجَّه (unsupervised) |
| list / dictionary / set / tuple (Python) | القائمة (list) / القاموس (dict) / المجموعة (set) / الصف (tuple) |
| slicing / comprehension | التقطيع (slicing) / الصياغة المختصرة (comprehension) |
| class / object / method / inheritance | الصنف (class) / الكائن (object) / الدالة العضو (method) / الوراثة (inheritance) |
| graph / tree / edge / weighted graph | الرسم البياني (graph) / الشجرة (tree) / الحافة (edge) / الرسم البياني الموزون |

### Robotics

| English | Arabic |
|---|---|
| robot / robotics | الروبوت / علم الروبوتات (Robotics) |
| manipulator (robot arm) | الذراع الآلية (manipulator) |
| link / joint | الوصلة (link) / المفصل (joint) |
| revolute / prismatic joint | مفصل دوّار (revolute) / مفصل منزلق (prismatic) |
| degrees of freedom (DOF) | درجات الحرية (DOF) |
| end effector / gripper | المؤثِّر النهائي (end effector) / القابض (gripper) |
| base / wrist | القاعدة / المعصم (wrist) |
| workspace / work envelope | مساحة العمل (workspace) |
| reference frame / world frame | إطار مرجعي (reference frame) / إطار العالم |
| accuracy / repeatability / resolution | الدقة (accuracy) / التكرارية (repeatability) / الاستبانة (resolution) |
| Cartesian / cylindrical / spherical / SCARA / articulated | كارتيزي / أسطواني / كروي / SCARA / مفصلي (articulated) |
| payload | الحمولة (payload) |
| controller / drive system | المتحكِّم (controller) / نظام الإدارة (drive system) |
| actuator / servo motor / stepper motor | المشغِّل (actuator) / محرك سيرفو / محرك خطوي (stepper) |
| hydraulic / pneumatic / electric | هيدروليكي / هوائي (pneumatic) / كهربائي |
| sensor / transducer | المستشعر (sensor) / المحوِّل (transducer) |
| limit switch / proximity switch | مفتاح حدّي (limit switch) / مفتاح تقارب (proximity switch) |
| photoelectric / light sensor / potentiometer | كهروضوئي (photoelectric) / مستشعر ضوئي / مقياس الجهد (potentiometer) |
| encoder (incremental / absolute) | المُرمِّز (encoder) التزايدي / المطلق |
| Gray code | شفرة جراي (Gray code) |
| sonar / LiDAR / infrared / tachometer / tactile | السونار / الليدار (LiDAR) / الأشعة تحت الحمراء / مقياس سرعة الدوران (tachometer) / لمسي (tactile) |
| kinematics / forward / inverse kinematics | علم الحركة (kinematics) / الحركيات الأمامية / العكسية |
| rotation / translation / transformation matrix | الدوران / الإزاحة (translation) / مصفوفة التحويل |
| homogeneous transformation | التحويل المتجانس (homogeneous transformation) |
| Denavit–Hartenberg parameters | معاملات دينافيت–هارتنبرغ (D-H) |
| node / topic / publisher / subscriber (ROS 2) | العقدة (node) / الموضوع (topic) / الناشر (publisher) / المشترك (subscriber) |
| package / workspace / launch file (ROS 2) | الحزمة (package) / مساحة العمل (workspace) / ملف الإطلاق (launch file) |
| timer / callback / message / interface | المؤقِّت (timer) / دالة الاستدعاء (callback) / الرسالة (message) / الواجهة (interface) |

### Databases

| English | Arabic |
|---|---|
| database / DBMS | قاعدة البيانات / نظام إدارة قواعد البيانات (DBMS) |
| data model / schema / instance | نموذج البيانات / المخطط (schema) / الحالة (instance) |
| three-schema architecture | معمارية المستويات الثلاثة (three-schema architecture) |
| data independence (logical / physical) | استقلالية البيانات المنطقية / الفيزيائية |
| DDL / DML / query | لغة تعريف البيانات (DDL) / لغة معالجة البيانات (DML) / الاستعلام (query) |
| relation / table / tuple / row | العلاقة (relation) / الجدول / الصف (tuple) |
| attribute / column / domain | السمة (attribute) / العمود / النطاق (domain) |
| key / superkey / candidate key | المفتاح / المفتاح الأعلى (superkey) / المفتاح المرشَّح (candidate key) |
| primary key / foreign key | المفتاح الأساسي (primary key) / المفتاح الأجنبي (foreign key) |
| integrity constraint / referential integrity | قيد السلامة (integrity constraint) / السلامة المرجعية (referential integrity) |
| entity / entity type / entity set | الكيان (entity) / نوع الكيان / مجموعة الكيانات |
| relationship / cardinality ratio / participation | العلاقة (relationship) / نسبة التعدد (cardinality) / المشاركة (participation) |
| weak entity / identifying relationship | الكيان الضعيف (weak entity) / العلاقة المُعرِّفة |
| composite / multivalued / derived attribute | سمة مركبة / متعددة القيم / مشتقة (derived) |
| ER diagram / EER | مخطط الكيان والعلاقة (ER) / النموذج الموسَّع (EER) |
| specialization / generalization / subclass / superclass | التخصيص / التعميم / الصنف الفرعي (subclass) / الصنف الأعلى (superclass) |
| disjoint / overlapping / total / partial | منفصل (disjoint) / متداخل (overlapping) / كلي / جزئي |
| relational algebra | الجبر العلائقي (relational algebra) |
| selection / projection / rename | الاختيار (selection) / الإسقاط (projection) / إعادة التسمية (rename) |
| union / intersection / difference / Cartesian product | الاتحاد / التقاطع / الفرق / الضرب الديكارتي |
| join / natural join / theta join / outer join | الربط (join) / الربط الطبيعي / ربط ثيتا / الربط الخارجي (outer join) |
| division | القسمة (division) |
| functional dependency | الاعتماد الوظيفي (functional dependency) |
| closure / minimal cover | الإغلاق (closure) / الغطاء الأدنى (minimal cover) |
| normalization / normal form (1NF, 2NF, 3NF, BCNF) | التطبيع (normalization) / الصيغة العادية (1NF…) |
| partial / transitive dependency | الاعتماد الجزئي / الاعتماد المتعدّي (transitive) |
| redundancy / anomaly (insert, delete, update) | التكرار (redundancy) / الشذوذ (anomaly) في الإدراج والحذف والتحديث |
| decomposition / lossless join | التفكيك (decomposition) / ربط بلا فقدان (lossless join) |
| single-row / group (aggregate) function | دالة الصف الواحد / دالة التجميع (aggregate) |
| NULL value | القيمة الفارغة (NULL) |
| alias / sort / filter | الاسم المستعار (alias) / الترتيب / التصفية |
| view / index / transaction | العرض (view) / الفهرس (index) / المعاملة (transaction) |

### Operating systems

| English | Arabic |
|---|---|
| operating system / kernel | نظام التشغيل / النواة (kernel) |
| system call / API | استدعاء النظام (system call) / واجهة البرمجة (API) |
| interrupt / trap | المقاطعة (interrupt) / المصيدة (trap) |
| dual mode / user mode / kernel mode | الوضع المزدوج / وضع المستخدم / وضع النواة |
| process / program | العملية (process) / البرنامج |
| process state (new, ready, running, waiting, terminated) | حالة العملية (جديدة، جاهزة، قيد التشغيل، منتظرة، منتهية) |
| process control block (PCB) | كتلة التحكم بالعملية (PCB) |
| context switch | تبديل السياق (context switch) |
| scheduler / scheduling queue | المُجدوِل (scheduler) / طابور الجدولة |
| CPU scheduling | جدولة المعالج (CPU scheduling) |
| fork / exec / wait / exit | `fork` / `exec` / `wait` / `exit` (تبقى كما هي) |
| parent / child process | العملية الأم (parent) / العملية الابن (child) |
| zombie / orphan process | العملية الزومبي (zombie) / العملية اليتيمة (orphan) |
| interprocess communication (IPC) | الاتصال بين العمليات (IPC) |
| shared memory / message passing | الذاكرة المشتركة (shared memory) / تمرير الرسائل (message passing) |
| race condition / critical section | حالة السباق (race condition) / المقطع الحرج (critical section) |
| synchronization / semaphore / mutex | التزامن (synchronization) / السيمافور (semaphore) / القفل (mutex) |
| thread / multithreading | الخيط (thread) / تعدد الخيوط (multithreading) |
| concurrency / parallelism | التزامن في التنفيذ (concurrency) / التوازي (parallelism) |
| multicore / multiprocessor | متعدد الأنوية (multicore) / متعدد المعالجات (multiprocessor) |
| user thread / kernel thread | خيط المستخدم / خيط النواة |
| many-to-one / one-to-one / many-to-many | متعدد إلى واحد / واحد إلى واحد / متعدد إلى متعدد |
| Amdahl's law | قانون أمدال (Amdahl's law) |
| storage hierarchy / cache / main memory | هرم التخزين / الذاكرة المخبئية (cache) / الذاكرة الرئيسية |
| DMA / device driver / controller | الوصول المباشر للذاكرة (DMA) / مشغّل الجهاز (device driver) / المتحكِّم |
| bootstrap program | برنامج الإقلاع (bootstrap) |
| shell / terminal / prompt | الصدفة (shell) / الطرفية (terminal) / المحث (prompt) |
| command line (CLI) / GUI | سطر الأوامر (CLI) / الواجهة الرسومية (GUI) |
| distribution (Linux) | التوزيعة (distribution) |
| virtual machine | الآلة الافتراضية (virtual machine) |
| environment variable | متغير البيئة (environment variable) |
| globbing / wildcard | التوسيع بالأنماط (globbing) / الرمز البديل (wildcard) |
| quoting / escaping | الاقتباس (quoting) / التهريب (escaping) |
| home / root / current / parent directory | المجلد الرئيسي (home) / الجذر (root) / المجلد الحالي / المجلد الأب |
| absolute / relative path | المسار المطلق / المسار النسبي |
| hidden file | ملف مخفي |
| permission / owner / group | الصلاحية (permission) / المالك / المجموعة |
| archive / compression | الأرشفة (archive) / الضغط (compression) |
| man page / info page | صفحة الدليل (man page) / صفحة info |

### Software engineering

| English | Arabic |
|---|---|
| software engineering | هندسة البرمجيات (Software Engineering) |
| software process / process model | عملية البرمجيات (software process) / نموذج العملية |
| specification / development / validation / evolution | التوصيف (specification) / التطوير / التحقق من الصلاحية (validation) / التطور (evolution) |
| maintainability / dependability / efficiency / acceptability | قابلية الصيانة / الاعتمادية (dependability) / الكفاءة / القبول (acceptability) |
| generic / customized (bespoke) product | منتج عام (generic) / منتج مخصص (customized) |
| stakeholder / customer / end user | صاحب المصلحة (stakeholder) / العميل / المستخدم النهائي |
| waterfall model | نموذج الشلال (waterfall) |
| incremental development / delivery | التطوير التزايدي (incremental) / التسليم التزايدي |
| reuse-oriented | الموجَّه لإعادة الاستخدام (reuse-oriented) |
| COTS | المكوّنات الجاهزة (COTS) |
| prototype / prototyping | النموذج الأولي (prototype) / بناء النماذج الأولية |
| plan-driven / agile | الموجَّه بالخطة (plan-driven) / الرشيق (agile) |
| change avoidance / change tolerance | تجنّب التغيير / تحمّل التغيير |
| Agile Manifesto | البيان الرشيق (Agile Manifesto) |
| Extreme Programming (XP) | البرمجة القصوى (XP) |
| user story / story card / task | قصة المستخدم (user story) / بطاقة القصة / المهمة |
| refactoring | إعادة الهيكلة (refactoring) |
| test-first / test-driven development | التطوير بالاختبار أولًا (test-first) / المدفوع بالاختبارات (TDD) |
| pair programming | البرمجة الثنائية (pair programming) |
| continuous integration | التكامل المستمر (continuous integration) |
| Scrum / sprint / product backlog / Scrum master | Scrum / السبرنت (sprint) / قائمة أعمال المنتج (product backlog) / Scrum master |
| requirement / requirements engineering | المتطلب (requirement) / هندسة المتطلبات (requirements engineering) |
| user / system requirements | متطلبات المستخدم / متطلبات النظام |
| functional / non-functional requirement | متطلب وظيفي (functional) / غير وظيفي (non-functional) |
| product / organizational / external requirement | متطلب المنتج / تنظيمي / خارجي |
| feasibility study | دراسة الجدوى (feasibility study) |
| elicitation and analysis | الاستنباط والتحليل (elicitation and analysis) |
| interview / scenario / ethnography | المقابلة (interview) / السيناريو (scenario) / الإثنوغرافيا (ethnography) |
| SRS (requirements document) | وثيقة توصيف المتطلبات (SRS) |
| validity / consistency / completeness / realism | الصلاحية / الاتساق / الاكتمال / الواقعية |
| system modelling / UML | نمذجة النظام / لغة النمذجة الموحَّدة (UML) |
| structural / behavioural diagram | مخطط هيكلي (structural) / سلوكي (behavioural) |
| use case / use case diagram | حالة الاستخدام (use case) / مخطط حالات الاستخدام |
| actor (primary / secondary) | الفاعل (actor) الأساسي / الثانوي |
| system boundary | حدود النظام (system boundary) |
| include / extend / generalization | علاقة التضمين «include» / علاقة التوسيع «extend» / التعميم (generalization) |
| extension point | نقطة التوسيع (extension point) |
| pre-condition / post-condition | الشرط المسبق (pre-condition) / الشرط اللاحق (post-condition) |
| main success scenario / alternative flow | سيناريو النجاح الرئيسي / المسار البديل (alternative flow) |
| activity diagram / action / activity | مخطط النشاط (activity diagram) / الإجراء / النشاط |
| decision / merge / fork / join | نقطة القرار (decision) / الدمج (merge) / التفرّع (fork) / الالتقاء (join) |
| guard condition | شرط الحراسة (guard) |
| swimlane | حارة السباحة (swimlane) |
| initial / final / flow final node | العقدة الابتدائية / النهائية / عقدة نهاية المسار (flow final) |
| state machine (state) diagram | مخطط آلة الحالات (state machine diagram) |
| state / transition / event | الحالة (state) / الانتقال (transition) / الحدث (event) |
| entry / do / exit activity | نشاط الدخول (entry) / أثناء الحالة (do) / الخروج (exit) |
| sequence diagram / lifeline / activation | مخطط التتابع (sequence diagram) / خط الحياة (lifeline) / التنشيط (activation) |
| synchronous / asynchronous message / reply | رسالة متزامنة (synchronous) / غير متزامنة (asynchronous) / الرد (reply) |
| combined fragment (alt, opt, loop) | المقطع المركّب (combined fragment) |
| system sequence diagram (SSD) | مخطط تتابع النظام (SSD) |
| class diagram / class / object | مخطط الأصناف (class diagram) / الصنف (class) / الكائن (object) |
| attribute / operation / visibility | السمة (attribute) / العملية (operation) / مستوى الظهور (visibility) |
| association / multiplicity / role name | الارتباط (association) / التعددية (multiplicity) / اسم الدور |
| aggregation / composition | التجميع (aggregation) / التركيب (composition) |
| dependency / realization | الاعتمادية (dependency) / التحقيق (realization) |
| data flow diagram (DFD) | مخطط تدفق البيانات (DFD) |
| process / data store / data flow / external entity (DFD) | العملية (process) / مخزن البيانات (data store) / تدفق البيانات (data flow) / الكيان الخارجي (external entity) |
| context diagram / level-0 diagram | مخطط السياق (context diagram) / مخطط المستوى 0 |
| balancing | التوازن (balancing) |
| software testing / test case | اختبار البرمجيات / حالة الاختبار (test case) |
| verification / validation | التحقق (verification) / التحقق من الصلاحية (validation) |
| static / dynamic testing | الاختبار الساكن (static) / الديناميكي (dynamic) |
| development / release / user testing | اختبار التطوير / اختبار الإصدار (release) / اختبار المستخدم |
| unit / integration / system testing | اختبار الوحدة (unit) / التكامل (integration) / النظام (system) |
| white-box / black-box testing | اختبار الصندوق الأبيض (white-box) / الأسود (black-box) |
| basis path testing | اختبار المسار الأساسي (basis path testing) |
| control flow graph (CFG) | مخطط تدفق التحكم (CFG) |
| predicate node / region | عقدة الشرط (predicate node) / المنطقة (region) |
| cyclomatic complexity | التعقيد الدوري (cyclomatic complexity) |
| independent path / basis set | المسار المستقل (independent path) / المجموعة الأساسية (basis set) |
| scenario / recovery / security testing | اختبار السيناريو / الاسترداد (recovery) / الأمان (security) |
| alpha / beta / acceptance testing | اختبار ألفا / بيتا / القبول (acceptance) |
| regression testing | اختبار الانحدار (regression testing) |
| defect / failure | العيب (defect) / الإخفاق (failure) |

### Image processing

| English | Arabic |
|---|---|
| image processing / computer vision | معالجة الصور (Image Processing) / الرؤية الحاسوبية (Computer Vision) |
| digital image / pixel | الصورة الرقمية / البكسل (pixel) |
| image acquisition / sampling / quantization | التقاط الصورة (image acquisition) / المعاينة (sampling) / التكميم (quantization) |
| resolution / spatial resolution | الدقة (resolution) / الدقة المكانية (spatial resolution) |
| bit depth / grey (gray) level / intensity | عمق البت (bit depth) / مستوى الرمادي (grey level) / الشدة (intensity) |
| binary / grayscale / RGB (true-color) / indexed image | صورة ثنائية (binary) / رمادية (grayscale) / ملونة RGB (true-color) / مفهرسة (indexed) |
| color map (palette) / channel | خريطة الألوان (color map) / القناة (channel) |
| raster (bitmap) / vector graphics | الصور النقطية (raster / bitmap) / الرسوم المتجهية (vector graphics) |
| CCD / CMOS sensor | مستشعر CCD / مستشعر CMOS |
| image enhancement / restoration / segmentation | تحسين الصورة (enhancement) / استعادة الصورة (restoration) / تقطيع الصورة (segmentation) |
| point processing (point operation) | المعالجة النقطية (point processing) |
| neighbourhood (neighborhood) processing | معالجة الجوار (neighbourhood processing) |
| transform / spatial domain / frequency domain | التحويل (transform) / المجال المكاني (spatial domain) / المجال الترددي (frequency domain) |
| complement (negative) | المتمِّم (complement) / الصورة السالبة (negative) |
| clipping | القصّ (clipping) |
| histogram / normalized histogram | المدرج التكراري (histogram) / المدرج التكراري المُطبَّع (normalized histogram) |
| PDF / CDF (cumulative distribution) | دالة الكثافة الاحتمالية (PDF) / دالة التوزيع التراكمي (CDF) |
| contrast / brightness | التباين (contrast) / السطوع (brightness) |
| contrast (histogram) stretching | مط التباين (contrast stretching) |
| gamma correction / power-law transformation | تصحيح غاما (gamma correction) / تحويل القوة (power-law) |
| log transformation / piecewise-linear function | التحويل اللوغاريتمي / الدالة الخطية المجزأة (piecewise-linear) |
| histogram equalization / histogram matching (specification) | تسوية المدرج التكراري (histogram equalization) / مطابقة المدرج التكراري (histogram matching) |
| intensity level slicing / bit-plane slicing | تقطيع مستويات الشدة (intensity level slicing) / تقطيع مستويات البت (bit-plane slicing) |
| local histogram processing | المعالجة المحلية للمدرج التكراري (local histogram processing) |
| filter / mask / kernel | المرشح (filter) / القناع (mask) / النواة (kernel) |
| spatial filtering / linear / non-linear filter | الترشيح المكاني (spatial filtering) / مرشح خطي (linear) / غير خطي (non-linear) |
| convolution / correlation | الالتفاف (convolution) / الارتباط (correlation) |
| padding (zero, replicate, symmetric) | الحشو (padding): بالأصفار / بالتكرار (replicate) / بالانعكاس (symmetric) |
| separable filter | مرشح قابل للفصل (separable) |
| impulse (delta) function / sifting property | دالة النبضة (دالة دلتا) (impulse) / خاصية الغربلة (sifting property) |
| smoothing / averaging (mean) filter | التنعيم (smoothing) / مرشح المتوسط (averaging / mean filter) |
| sharpening / edge / edge detection | الإبراز (sharpening) / الحافة (edge) / كشف الحواف (edge detection) |
| low-pass / high-pass / band-reject / band-pass filter | مرشح تمرير منخفض (low-pass) / تمرير مرتفع (high-pass) / رفض نطاق (band-reject) / تمرير نطاق (band-pass) |
| Laplacian / gradient / Sobel | لابلاسيان (Laplacian) / التدرج (gradient) / مرشح سوبل (Sobel) |
| unsharp masking / high-boost filtering | الإبراز بالقناع غير الحاد (unsharp masking) / الترشيح عالي التعزيز (high-boost) |
| median / max / min / midpoint filter | مرشح الوسيط (median) / الأقصى (max) / الأدنى (min) / نقطة المنتصف (midpoint) |
| order-statistics (rank) filter | مرشح إحصاءات الترتيب (order-statistics) / مرشح الرتبة (rank filter) |
| alpha-trimmed mean filter | مرشح المتوسط المُشذَّب ألفا (alpha-trimmed mean) |
| arithmetic / geometric / harmonic mean | المتوسط الحسابي / الهندسي / التوافقي (harmonic) |
| adaptive filter | المرشح التكيفي (adaptive filter) |
| Gaussian smoothing / standard deviation (sigma) | التنعيم الغاوسي (Gaussian smoothing) / الانحراف المعياري (sigma) |
| Fourier transform / DFT / FFT / inverse DFT | تحويل فورييه (Fourier transform) / تحويل فورييه المتقطع (DFT) / تحويل فورييه السريع (FFT) / المعكوس (inverse DFT) |
| frequency / spectrum / magnitude / phase | التردد (frequency) / الطيف (spectrum) / المقدار (magnitude) / الطور (phase) |
| DC component (coefficient) | المركبة المستمرة (DC component) |
| linearity / conjugate symmetry / circular convolution | الخطية (linearity) / التناظر المرافق (conjugate symmetry) / الالتفاف الدائري (circular convolution) |
| convolution theorem / shifting (centring) | مبرهنة الالتفاف (convolution theorem) / الإزاحة (shifting) أي توسيط الطيف |
| transfer function / cutoff frequency | دالة النقل (transfer function) / تردد القطع (cutoff frequency) |
| ideal / Butterworth / Gaussian filter | مرشح مثالي (ideal) / مرشح بترورث (Butterworth) / مرشح غاوس (Gaussian) |
| ringing | التموج الحلقي (ringing) |
| notch filter | مرشح الثلم (notch filter) |
| noise / Gaussian / salt-and-pepper / uniform / periodic / speckle noise | الضوضاء (noise): الغاوسية / الملح والفلفل (salt-and-pepper) / المنتظمة (uniform) / الدورية (periodic) / المرقّطة (speckle) |
| additive / multiplicative noise | ضوضاء جمعية (additive) / ضوضاء ضربية (multiplicative) |
| degradation function / point spread function (PSF) | دالة التدهور (degradation function) / دالة انتشار النقطة (PSF) |
| motion blur / out-of-focus blur | تشويش الحركة (motion blur) / التشويش الناتج عن عدم التركيز (out-of-focus blur) |
| inverse filtering / Wiener filtering | الترشيح العكسي (inverse filtering) / ترشيح فينر (Wiener filtering) |
| mean square error (MSE) | متوسط مربع الخطأ (MSE) |
| segmentation / region / object / background | التقطيع (segmentation) / المنطقة (region) / الكائن (object) / الخلفية (background) |
| threshold / thresholding (single, double, adaptive) | العتبة (threshold) / التقطيع بالعتبة (thresholding): المفردة / المزدوجة / التكيفية (adaptive) |
| Otsu's method / within-class / between-class variance | طريقة أوتسو (Otsu) / التباين داخل الفئة (within-class) / التباين بين الفئات (between-class) |
| bimodal histogram | مدرج تكراري ثنائي القمة (bimodal) |
| morphology / morphological operation | المورفولوجيا (morphology) / العملية المورفولوجية (morphological operation) |
| structuring element (SE) / origin | العنصر البنائي (structuring element) / نقطة الأصل (origin) |
| erosion / dilation | التآكل (erosion) / التمدد (dilation) |
| opening / closing / duality | الفتح (opening) / الإغلاق (closing) / الثنائية (duality) |
| hit-and-miss transform | تحويل الإصابة والإخفاق (hit-and-miss) |
| thinning / thickening / skeleton | الترقيق (thinning) / التثخين (thickening) / الهيكل العظمي (skeleton) |
| foreground / background pixel | بكسل المقدمة (foreground) / بكسل الخلفية (background) |
| blob / connected component | الكتلة (blob) / المكوّن المتصل (connected component) |

### Terms added during the first translation pass

Coined by the translators while translating the pages; prefer these renderings for consistency.

#### Artificial intelligence

| English | Arabic |
|---|---|
| 8-puzzle | لغز الثمانية (8-puzzle) |
| abstraction / abstract state / abstract action | التجريد (abstraction) / الحالة المجردة / الفعل المجرد |
| adjacency list / adjacency matrix | قائمة التجاور (adjacency list) / مصفوفة التجاور (adjacency matrix) |
| agent function / agent program | دالة الوكيل (agent function) / برنامج الوكيل (agent program) |
| architecture (of an agent) | البنية (architecture) |
| autonomy / information gathering | الاستقلالية (autonomy) / جمع المعلومات (information gathering) |
| bidirectional search | البحث ثنائي الاتجاه (bidirectional) |
| binary heap | الكومة الثنائية (binary heap) |
| casting | التحويل بين الأنواع (casting) |
| closed set | المجموعة المغلقة (closed set) |
| condition–action rules | قواعد الشرط–الفعل (condition–action rules) |
| constructor / encapsulation / polymorphism | الباني (constructor) / التغليف (encapsulation) / تعدد الأشكال (polymorphism) |
| contingent plan / policy | خطة طوارئ (contingent plan) / سياسة (policy) |
| convex / meta-heuristic | محدّب (convex) / ما وراء الاستدلالي (meta-heuristic) |
| cumulative path cost | تكلفة المسار التراكمية (cumulative path cost) |
| depth limit / cutoff / failure | حد العمق (depth limit) / القطع (cutoff) / الإخفاق (failure) |
| directed / undirected / weighted / cyclic / acyclic | موجَّه / غير موجَّه / موزون / دوري (cyclic) / غير دوري (acyclic) |
| expand (a node) | توسيع / نوسّع (expand) |
| fringe | الحافة (fringe), following the glossary entry for frontier |
| function overloading / overriding | التحميل الزائد للدوال (function overloading) / إعادة التعريف (overriding) |
| indentation | الإزاحة (indentation) |
| internal state | الحالة الداخلية (internal state) |
| interpreted / dynamically typed | مُفسَّرة (interpreted) / ديناميكية الأنواع (dynamically typed) |
| iterable / iterator / generator | الكائن القابل للتكرار (iterable) / المُكرِّر (iterator) / المولِّد (generator) |
| laws of thought | قوانين التفكير (laws of thought) |
| multiple inheritance / Method Resolution Order (MRO) | الوراثة المتعددة (multiple inheritance) / ترتيب تحليل الدوال العضو (MRO) |
| mutable / immutable | قابل للتعديل (mutable) / غير قابل للتعديل (immutable) |
| omniscient / clairvoyant | كلي العلم (omniscient) / العالِم بالغيب (clairvoyant) |
| open-loop execution | التنفيذ بالحلقة المفتوحة (open-loop) |
| operators (state transitions) | العوامل (operators) |
| optimal solution | الحل الأمثل (optimal solution) |
| performance element / critic / learning element / problem generator | عنصر الأداء / الناقد (critic) / عنصر التعلّم / مولِّد المسائل |
| problem-solving agent | وكيل حل المسائل (problem-solving agent) |
| queuing function | دالة الاصطفاف (queuing function) |
| realism / reward structure / sparse / dense reward | الواقعية (realism) / بنية المكافأة (reward structure) / مكافأة متفرقة (sparse) / كثيفة (dense) |
| reinforcement learning | التعلم المعزز (reinforcement learning) |
| search space / exhaustive search | فضاء البحث (search space) / البحث الشامل |
| semi-dynamic | شبه ديناميكية (semi-dynamic) |
| sensorless | عديمة المستشعرات (sensorless) |
| shallow copy | نسخة سطحية (shallow copy) |
| single-state / conformant / contingency / exploration problem | مسألة الحالة الواحدة / المسألة المتوافقة (conformant) / مسألة الطوارئ (contingency) / مسألة الاستكشاف |
| state search space / space graph | فضاء البحث عن الحالات (state search space) / رسم فضاء الحالات (space graph) |
| successor function | دالة الحالات التالية (successor function) |
| tie-breaking | كسر التعادل (tie-breaking) |
| traversal: pre-order / in-order / post-order | الاجتياز (traversal): الترتيب القبلي / الوسطي / البعدي |
| tree search / graph search | البحث الشجري (tree search) / البحث في الرسم البياني (graph search) |
| Turing test / interrogator | اختبار تورنغ / المُحاوِر (interrogator) |
| vertex | الرأس (vertex) |

#### Robotics

| English | Arabic |
|---|---|
| actuator head (limit switch) | رأس التشغيل |
| analog-to-digital converter | محوِّل تناظري-رقمي |
| anthropomorphic | شبيه بالإنسان |
| bag (ROS 2) | ملف bag |
| baseline / focal length | خط الأساس / البعد البؤري |
| client library | مكتبة العميل |
| commutator / ripple | المبدِّل / التموّج |
| concentric tracks | مسارات متحدة المركز |
| configuration (robot) | التهيئة |
| constructor | المُنشئ |
| coupling | الاقتران |
| crosstalk | التداخل / التشويش المتبادل |
| decoupled | منفصلة عن بعضها |
| dependencies (package) | الاعتماديات |
| dielectric | العازل |
| emitter / receiver | المُرسِل / المُستقبِل |
| end-of-arm tooling | أدوات نهاية الذراع |
| entry point | نقطة الدخول |
| executor (ROS 2) | المُنفِّذ |
| feedback controller | متحكِّم بالتغذية الراجعة |
| fixed-sequence / variable-sequence robot | روبوت التسلسل الثابت / روبوت التسلسل المتغير |
| gantry | جسري |
| gear backlash | الخلوص في التروس |
| homing | العودة إلى الموضع المرجعي |
| humanoid | الروبوت الشبيه بالبشر |
| index pulse | نبضة الفهرسة |
| inductance / capacitance | المحاثّة / السعة |
| inductive / capacitive (switch) | حثّي / سعوي |
| introspection | الفحص |
| jogging | التحريك اليدوي |
| light-dependent resistor (LDR) | المقاومة الضوئية / المقاومة المعتمدة على الضوء |
| light-on / dark-on | التشغيل بالضوء / التشغيل بالظلام |
| locomotor | روبوت التنقّل |
| manual-handling device | جهاز المناولة اليدوية |
| motion generator | مولِّد الحركة |
| numerical differentiation | الاشتقاق العددي |
| numerical-control robot | روبوت التحكم الرقمي |
| Ohm's law | قانون أوم |
| palletiser | روبوت رصّ المنصات |
| pedestal | القاعدة الحاملة |
| phase shift / interferometry | إزاحة الطور / قياس التداخل |
| photodiode / phototransistor | الثنائي الضوئي / الترانزستور الضوئي |
| piezoelectric / electrostatic | كهروضغطي / كهروستاتيكي |
| playback robot | روبوت إعادة التشغيل |
| point cloud | سحابة النقاط |
| pulse train | قطار النبضات |
| QoS history depth | عمق سجل QoS |
| quadrature | الترميز التربيعي |
| roll / pitch / yaw | اللفّ / الميل / الانعراج |
| Schmitt trigger | قادح شميت |
| servo-controlled / non-servo | مُتحكَّم به بالمؤازرة / غير مؤازَر |
| sourcing (an environment) | تحميل البيئة |
| specular reflection | الانعكاس المرآوي |
| strain gauge | مقياس الانفعال |
| teach pendant | لوحة التعليم |
| telerobotics | التحكم الروبوتي عن بُعد |
| thermocouple | المزدوجة الحرارية |
| through-beam / retro-reflective / diffuse-reflective | الشعاع المباشر / العاكس الارتدادي / الانعكاس المنتشر |
| time of flight | زمن الطيران |
| triangulation | التثليث |
| universal joint | المفصل العام |
| voltage divider | مقسِّم الجهد |
| Wheatstone bridge | قنطرة ويتستون |
| wiper (potentiometer) | الماسحة |

#### Databases

| English | Arabic |
|---|---|
| 2-tier / 3-tier architecture | ثنائية الطبقات (2-tier) / ثلاثية الطبقات (3-tier) |
| access path | مسار الوصول (access path) |
| arithmetic expression | التعبير الحسابي (arithmetic expression) |
| ascending / descending | تصاعديًا / تنازليًا |
| atomicity / consistency / isolation / durability | الذرّية / الاتساق / العزل / الديمومة |
| binary / ternary / n-ary | ثنائية / ثلاثية / متعددة الأطراف (n-ary) |
| business logic | منطق العمل (business logic) |
| canned transactions | المعاملات الجاهزة (canned transactions) |
| CASCADE / RESTRICT (referential actions) | التتالي (CASCADE) / الرفض (RESTRICT) |
| case-sensitive / case-insensitive | حساس لحالة الأحرف (case-sensitive) / لا يتأثر بحالة الأحرف |
| casual / naive-parametric / sophisticated / stand-alone user | العَرَضي / المبتدئ-البارامتري / المتمرّس / المستقل |
| catalog (DBMS) | الكتالوج (catalog) |
| category (union type) | الفئة (نوع الاتحاد) |
| clause | العبارة (clause) |
| closure (algebraic property) | الانغلاق (closure) |
| column alias | الاسم المستعار للعمود (column alias) |
| combinations | التوافيق (combinations) |
| commit / roll back | تأكيد المعاملة (commit) / التراجع عن المعاملة (rolls it back) |
| commutative / associative | إبدالية / تجميعية |
| concatenation | الدمج (concatenation) |
| concurrency control | التحكم في التزامن (concurrency control) |
| cross join | الربط التقاطعي (cross join) |
| crow's foot | قدم الغراب (crow's foot) |
| data dictionary | قاموس البيانات (data dictionary) |
| data integrity | سلامة البيانات (data integrity) |
| date arithmetic | العمليات الحسابية على التواريخ (date arithmetic) |
| DCL (data control language) | لغة التحكم في البيانات (DCL) |
| deadlock | الجمود (deadlock) |
| declarative | تصريحية (declarative) |
| defining attribute | سمة التعريف (defining attribute) |
| degree / cardinality (of a relation) | الدرجة (degree) / التعداد (cardinality) |
| delimiter | المُحدِّد (delimiter) |
| determinant | المحدِّد (determinant) |
| dummy table | جدول وهمي (dummy table) |
| edge case | حالة حدّية (edge case) |
| equijoin | الربط بالتساوي (equijoin) |
| equijoin / theta join | ربط المساواة (Equijoin) / ربط ثيتا |
| field | الحقل (field) |
| full / trivial functional dependency | الاعتماد الكامل (full) / البديهي (trivial) |
| functionally complete | مكتملة وظيفيًا (functionally complete) |
| hierarchy / lattice | التسلسل الهرمي / الشبكة (lattice) |
| host language / embedded SQL / precompiler | اللغة المضيفة / SQL المضمَّنة / المترجم الأولي (precompiler) |
| inclusive (range) | شامل الحدّين (inclusive) |
| inference rules / Armstrong's axioms | قواعد الاستدلال / مسلّمات أرمسترونغ |
| inner join | الربط الداخلي (inner join) |
| intermediate result | النتيجة الوسيطة |
| leap year | سنة كبيسة |
| left-pad / right-pad | الحشو من اليسار (left-pad) / من اليمين (right-pad) |
| literal (string) | القيمة الحرفية (literal) / السلسلة الحرفية |
| log | السجل (log) |
| logical operators | المؤثرات المنطقية |
| mandatory / optional attribute | سمة إلزامية (mandatory) / اختيارية (optional) |
| materialized view | العرض المُجسَّد (materialized view) |
| metadata | البيانات الوصفية |
| nested (functions) | متداخلة (nested) |
| non-key column | عمود غير مفتاحي (non-key) |
| nonequijoin | الربط غير المتساوي (nonequijoin) |
| normalized (data) | المُطبَّعة (normalized) |
| object-relational DBMS (ORDBMS) | نظام إدارة قواعد بيانات علائقي كائني (ORDBMS) |
| ontology | الأنطولوجيا (Ontology) |
| operator (SQL / relational) | المؤثر (operator) |
| operator precedence / rules of precedence | أولوية المؤثرات (operator precedence) / قواعد الأولوية |
| partial key / owner entity | المفتاح الجزئي / الكيان المالك |
| pattern (LIKE) | النمط (pattern) |
| predicate-defined / attribute-defined / user-defined | المعرَّف بشرط / المعرَّف بسمة / المعرَّف من المستخدم |
| primary unique identifier (UID) | المعرّف الفريد الأساسي (UID) |
| prime / nonprime attribute | السمة الأولية (prime) / غير الأولية (nonprime) |
| program-data independence / dependence | استقلال البرامج عن البيانات / اعتماد البرامج على البيانات |
| qualify (a column) | تأهيل العمود (qualify) / أهِّله |
| query compiler / execution engine / buffer manager | مترجم الاستعلامات / محرك التنفيذ / مدير المخازن المؤقتة (buffer manager) |
| query plan / query optimizer | خطة الاستعلام / مُحسِّن الاستعلامات |
| recovery / recovery manager | الاسترداد / مدير الاسترداد (recovery manager) |
| recursive / self-referencing relationship | علاقة تكرارية ذاتية المرجع (recursive / self-referencing) |
| recursive relationship | العلاقة الذاتية (recursive) |
| reflexivity / augmentation / transitivity / pseudo-transitivity | الانعكاس / الزيادة / التعدّي / شبه التعدّي |
| selectivity | الانتقائية (selectivity) |
| self-join | الربط الذاتي (self-join) |
| shared subclass | الصنف الفرعي المشترك (shared subclass) |
| spurious tuples | الصفوف الزائفة (spurious tuples) |
| standard deviation / variance | الانحراف المعياري / التباين |
| substring | جزء من النص (substring) |
| table alias | الاسم المستعار للجدول (table alias) |
| three-way join | الربط الثلاثي (three-way join) |
| transaction control | التحكم في المعاملات (transaction control) |
| union compatibility | توافق الاتحاد (union compatibility) |

#### Operating systems

| English | Arabic |
|---|---|
| ABI (application binary interface) | الواجهة الثنائية للتطبيقات |
| blocking / non-blocking | حاجب / غير حاجب |
| boot loader | محمِّل الإقلاع |
| buffer / buffering | المخزن المؤقت / التخزين المؤقت |
| bus | الناقل |
| cache hit / miss | الإصابة / الإخفاق |
| caching | التخبئة |
| cascading termination | الإنهاء المتتالي |
| case-sensitive | حسّاس لحالة الأحرف |
| clustered system / cluster | النظام العنقودي / العنقود |
| coherence / cache coherency | الاتساق / اتساق الذاكرة المخبئية |
| command substitution | تعويض الأوامر |
| CPU burst | دفعة المعالجة |
| daemon | البرنامج الخفي |
| data / task parallelism | توازي البيانات / توازي المهام |
| deadlock | الجمود |
| dispatch (system call / scheduler) | التوجيه / الإيفاد |
| exception | الاستثناء |
| exit status / exit code | حالة الخروج / رمز الخروج |
| handler | المعالِج |
| heap | الكومة |
| inode | العقدة الفهرسية |
| interrupt service routine | روتين خدمة المقاطعة |
| interrupt vector | متجه المقاطعات |
| interrupt-driven | مدفوع بالمقاطعات |
| linker / loader | الرابط / المحمِّل |
| lossless | بلا فقدان |
| middleware | البرمجيات الوسيطة |
| mode bit | بت الوضع |
| NUMA | الوصول غير المنتظم للذاكرة |
| pipe / named pipe | الأنبوب / الأنبوب المسمّى |
| preempted | مُستبَق (الاستباق) |
| privilege escalation | رفع الصلاحيات |
| privileged instruction | التعليمة المميَّزة |
| producer / consumer | المنتِج / المستهلِك |
| program counter | عدّاد البرنامج |
| ready queue / wait queue | طابور الجاهزية / طابور الانتظار |
| recursive / recursion | تعاودي / العرض التعاودي |
| register | المسجل |
| relocatable / relocation | قابل لإعادة التوطين / إعادة التوطين |
| rendezvous | الموعد |
| replacement policy | سياسة الاستبدال |
| socket / port | المقبس / المنفذ |
| speed-up | التسريع |
| spooling | الصفّ المؤقت للمهام |
| standard output | المخرج القياسي |
| stub / marshal | النائب / التحزيم |
| swapping | التبديل |
| time-sharing | مشاركة الوقت |
| timestamp | الطابع الزمني |
| two-level model | النموذج ثنائي المستوى |
| virtual memory | الذاكرة الافتراضية |
| virtualization | المحاكاة الافتراضية |
| volatile / nonvolatile | متطاير / غير متطاير |
| word splitting | تقسيم الكلمات |

#### Software engineering

| English | Arabic |
|---|---|
| abstract actor / abstract use case | الفاعل المجرَّد / حالة الاستخدام المجرَّدة |
| abstract model | النموذج المجرَّد |
| acceptance testing / acceptance tests | اختبار القبول (acceptance testing) |
| acceptance tests | اختبارات القبول |
| activation bar | شريط التنشيط (activation bar) |
| adverb | الظرف |
| artifacts (UML) | نواتج (artifacts) |
| attribute (of good software) | الخاصية |
| availability | التوافر |
| base (root) class / leaf class | صنف أساسي (base) أو جذري (root) / صنف ورقي (leaf) |
| base / included / extending use case | الحالة الأساسية / المُضمَّنة / المُوسِّعة |
| batch processing | المعالجة الدفعية |
| behavioural requirement | المتطلب السلوكي |
| bidirectional | ثنائي الاتجاه (bidirectional) |
| black box (system as a black box) | الصندوق الأسود (black box) |
| black hole / miracle (DFD) | ثقب أسود / معجزة |
| boundary conditions | الشروط الحدّية (boundary conditions) |
| build (software build) | البناء (build) |
| business process / workflow | إجراءات العمل (business processes) / سير العمل (workflows) |
| Business Requirements Specification (BRS) | وثيقة توصيف متطلبات العمل (BRS) |
| certification | الاعتماد (certification) |
| class members (static) | أعضاء الصنف (class members)، الأعضاء الساكنة (static) |
| closed / open interview | المقابلة المغلقة / المفتوحة |
| cloud computing | الحوسبة السحابية |
| code of ethics | ميثاق الأخلاقيات |
| collective ownership | الملكية الجماعية |
| common facilities | المرافق المشتركة |
| compartment (of a class) | قسم (compartment) |
| competence | الكفاءة المهنية (Competence) |
| component framework | إطار عمل المكوّنات |
| composite state | الحالة المركّبة |
| composite structure / deployment / communication / interaction overview / timing diagram | البنية المركّبة / النشر / الاتصال / نظرة عامة على التفاعل / التوقيت |
| computer misuse | إساءة استخدام الحاسوب |
| computer science | علوم الحاسب |
| concurrent (states) | متزامنة (concurrent) |
| confidentiality | السرية (Confidentiality) |
| configuration manager | مدير التهيئة |
| connector (activity diagram) | الموصِّل (Connector) |
| control flow | تدفق التحكم |
| control structure | بنية التحكم (control structure) |
| credit hours | الساعات المعتمدة |
| customer involvement / people not process / embrace change / maintain simplicity | مشاركة العميل / الأشخاص لا العملية / تقبُّل التغيير / الحفاظ على البساطة |
| daily scrum | اجتماع Scrum اليومي |
| data collection system | نظام جمع البيانات |
| delivery (key challenge) | التسليم (Delivery) |
| deploy / deployment | النشر |
| embedded / safety-critical system | نظام مدمج (embedded) / حرج من حيث السلامة (safety-critical) |
| embedded control system | نظام التحكم المدمج |
| exceptions (use case template) | الاستثناءات |
| execution specification | مواصفة التنفيذ |
| explode (a process into a lower level) | تفجير / فجِّره (explode) |
| facilitator | المُيسِّر |
| filled / open arrowhead | رأس سهم مُصمَت / مفتوح |
| flow of control / control flow | تدفق التحكم (flow of control) |
| flowchart | المخطط الانسيابي (flowchart) |
| formal inspections | عمليات الفحص الرسمية |
| front-end / back-end | الواجهة الأمامية (front-end) / الواجهة الخلفية (back-end) |
| glass-box testing | الصندوق الزجاجي (glass-box) |
| heterogeneity | عدم التجانس (Heterogeneity) |
| increment | الزيادة (increment) |
| initial pseudo-state | الحالة الزائفة الابتدائية |
| initialization | التهيئة (initialization) |
| initiating actor | الفاعل المبادِر (initiating actor) |
| initiator (use case) | البادئ (Initiator) |
| input validation / output validation / error handling | التحقق من المدخلات / التحقق من المخرجات / معالجة الأخطاء (error handling) |
| instance (of a use case) | نسخة (instance) |
| intellectual property rights | حقوق الملكية الفكرية |
| interaction diagram | مخطط تفاعل |
| interactive transaction-based application | التطبيق التفاعلي القائم على المعاملات |
| interoperability | قابلية التشغيل البيني |
| is-a / has-a relationship | علاقة «هو نوع من» (is-a) / علاقة «يملك» (has-a) |
| iterative development | التطوير التكراري |
| lab manual | دليل السكشن (lab manual) |
| life-cycle models | نماذج دورة الحياة |
| logical operators | العوامل المنطقية (logical operators) |
| loop | حلقة التكرار (loop) |
| lowercase / uppercase letter | حرف صغير (lowercase) / حرف كبير (uppercase) |
| mean time to failure | متوسط الزمن حتى الإخفاق |
| metaphor (XP practice) | الاستعارة (metaphor) |
| minimal guarantees / success guarantees | الضمانات الدنيا (minimal guarantees) / ضمانات النجاح (success guarantees) |
| modelling and simulation | النمذجة والمحاكاة |
| multiple inheritance | الوراثة المتعددة |
| mutually exclusive | متنافية |
| navigation (association direction) | التنقّل (navigation) |
| normal flow (use case) | المسار العادي |
| notation | الترميز |
| notation (UML) | الترميز |
| note (UML symbol) | الملاحظة (Note) |
| note (UML) | الملاحظة |
| object-oriented | كائني التوجه (object-oriented) |
| operand (of a combined fragment) | المُعامَل (operand) |
| outline planning / project closure | التخطيط المبدئي / إغلاق المشروع |
| override | إعادة التعريف (override) |
| parameter | المعامل (parameter) |
| past participle | اسم المفعول |
| planar graph | مخطط مستوٍ (planar graph) |
| precedence (operator) | الأسبقية (precedence) |
| prerequisites | المتطلبات السابقة (prerequisites) |
| problem definition | تعريف المشكلة (Problem definition) |
| process description | وصف العملية |
| public / private / protected / package (visibility) | عام (public) / خاص (private) / محمي (protected) / الحزمة (package) |
| public / protected / private (visibility) | عامة (public) / محمية (protected) / خاصة (private) |
| QA team | فريق ضمان الجودة (QA) |
| references (Java object references) | المراجع (references) |
| regulatory / legislative (NFR) | رقابي / تشريعي |
| release cycle | دورة الإصدار |
| reliability / robustness / portability | الموثوقية / المتانة / قابلية النقل |
| replacement system | النظام البديل |
| requirements reviews / requirements discovery | مراجعات المتطلبات / اكتشاف المتطلبات |
| reusable component | المكوّن القابل لإعادة الاستخدام |
| rework | إعادة العمل (rework) |
| root class / leaf class | صنف جذر (root) / صنف ورقة (leaf) |
| safety-critical | حرج من حيث السلامة |
| scalability | قابلية التوسع |
| script | برنامج نصي (script) |
| Scrum board | لوحة Scrum |
| self message / self-transition | رسالة ذاتية / الانتقال الذاتي |
| self-message | الرسالة الذاتية (self-message) |
| sequential / branched / concurrent (flows) | تتابعي (sequential) / متفرع (branched) / متزامن (concurrent) |
| single / multiple inheritance | وراثة مفردة (single) / وراثة متعددة (multiple) |
| sink (DFD destination) | مَصَبّ |
| software metric | مقياس برمجي (software metric) |
| sprint backlog | قائمة أعمال السبرنت |
| stand-alone application | التطبيق المستقل (Stand-alone) |
| static | ساكن (static) |
| static structure | البنية الساكنة (static structure) |
| stick figure | شكل بشري مبسَّط |
| sub-actor / super-actor | الفاعل الفرعي / الفاعل الأعلى |
| sustainable pace | الإيقاع المستدام |
| synchronization bar | شريط التزامن (synchronization bar) |
| system engineering | هندسة النظم |
| system events | أحداث النظام (system events) |
| systems of systems | أنظمة الأنظمة |
| terminate node | عقدة الإنهاء (terminate node) |
| test lag | تأخر الاختبار |
| the Three Amigos | الأصدقاء الثلاثة (the Three Amigos) |
| throw-away prototype | النموذج الأولي المُعَد للتخلص منه |
| trigger (of a transition) | المُطلِق (trigger) |
| trust | الثقة (Trust) |
| validation testing / defect testing | اختبار التحقق من الصلاحية (validation testing) / اختبار العيوب (defect testing) |
| verb phrase | عبارة فعلية |
| web services | خدمات الويب |
| workarounds | الحلول الالتفافية |
| workflow | سير العمل (workflow) |

#### Image processing

| English | Arabic |
|---|---|
| 3-D mesh plot / cross-section | رسم شبكي ثلاثي الأبعاد (mesh) / المقطع العرضي |
| aliasing | التداخل الطيفي |
| ANPR / AFIS | التعرّف الآلي على لوحات أرقام السيارات / نظام التعرّف الآلي على بصمات الأصابع |
| antisymmetric | ضدّ المتماثل (antisymmetric) |
| artefacts | التشوّهات (artefacts) |
| atmospheric turbulence | الاضطراب الجوي (atmospheric turbulence) |
| background subtraction | طرح الخلفية (background subtraction) |
| Bessel function | دالة بيسل (Bessel) |
| binarization | التحويل الثنائي (binarization) |
| bit plane / LSB / MSB | مستوى البت (bit plane) / البت الأدنى أهمية (LSB) / البت الأعلى أهمية (MSB) |
| block (image block) | القطعة (block) |
| boost coefficient | معامل التعزيز (boost coefficient) |
| box / disc / cross (SE shapes) | مربع (box) / قرص (disc) / صليب (cross) |
| clustering | العنقدة (clustering) |
| coefficient (mask entry) | المعامل (coefficient) |
| coherent imaging | التصوير المترابط (coherent imaging) |
| color depth | عمق اللون |
| colour cast | الانحراف اللوني (color cast) |
| commutative / associative / distributive | إبدالي / تجميعي / توزيعي |
| complex number / complex conjugate | عدد مركب (complex) / المرافق المركب (complex conjugate) |
| contraharmonic mean | المتوسط التوافقي المضاد (contraharmonic) |
| convex hull | الغلاف المحدّب (convex hull) |
| corner detection / convex / concave corner | كشف الزوايا (corner detection) / زاوية محدّبة (convex) / مقعّرة (concave) |
| cumulative histogram | المدرج التكراري التراكمي |
| deep learning | التعلم العميق |
| degradation model | نموذج التدهور (degradation model) |
| difference of Gaussians | فرق الغاوسيات |
| Dirac delta / unit impulse | دالة دلتا لديراك (Dirac delta) / نبضة الوحدة |
| discontinuities | الانقطاعات (discontinuities) |
| display range / scaling (rescale) | مدى العرض / إعادة التحجيم (scaling) |
| dithering | التنقيط (dithering) |
| don't care (SE cell) | لا يهم (don't care) |
| dpi (dots per inch) | نقطة لكل بوصة |
| dynamic range | المدى الديناميكي (dynamic range) |
| edge detector / edge enhancement | كاشف الحواف (edge detector) / تحسين الحواف (edge enhancement) |
| electromagnetic spectrum | الطيف الكهرومغناطيسي |
| element-by-element product | حاصل الضرب عنصرًا بعنصر |
| Euler's formula | صيغة أويلر (Euler's formula) |
| exposure time | زمن التعريض |
| features / feature extraction | السمات / استخلاص السمات |
| fingerprint ridges | الخطوط البارزة (ridges) |
| flat structuring element | عنصر بنائي مسطّح (flat) |
| flatbed scanner | الماسح الضوئي المسطّح |
| full-scale (stretching) | على المدى الكامل (full-scale) |
| global / local threshold | العتبة الشاملة (global) / المحلية (local) |
| histogram bins | الفئات (bins) |
| idempotent | متساوي القوى (idempotent) |
| identity filter | مرشح الهوية (identity) |
| identity transformation | التحويل المطابق (identity) |
| impulse / shot / binary noise | الضوضاء النبضية / ضوضاء الطلقات / الضوضاء الثنائية |
| impulse response | الاستجابة النبضية (impulse response) |
| intensity transformation / inverse transform | تحويل الشدة / التحويل العكسي |
| isotropic | متماثل الاتجاهات (isotropic) |
| label | الوسم (label) |
| local mean / local variance / noise variance | المتوسط المحلي / التباين المحلي / تباين الضوضاء |
| lookup table | جدول البحث |
| luma / luminance | الإضاءة (luma) |
| mapping function | دالة التعيين |
| mid-tones | الدرجات المتوسطة |
| minutiae | النقاط الدقيقة |
| mode (Pillow image mode) | الوضع (mode) |
| modulation | التضمين (modulation) |
| morphological gradient | التدرج المورفولوجي (morphological gradient) |
| moving (sliding) window | النافذة المنزلقة (moving window) |
| notch reject / notch pass | رفض الثلم (notch reject) / تمرير الثلم (notch pass) |
| Nyquist criterion | معيار نايكويست |
| object recognition | التعرف على الكائنات (object recognition) |
| order (of a Butterworth filter) | رتبة المرشح (order) |
| outer product | الضرب الخارجي (outer product) |
| outlier | القيمة الشاذة (outlier) |
| overflow (uint8) | الفيضان (overflow) |
| overshoot | التجاوز (overshoot) |
| passband | نطاق التمرير (passband) |
| pattern matching | مطابقة الأنماط (pattern matching) |
| peak (mode) / valley | القمة (peak) / الوادي (valley) |
| periodic function / amplitude / square wave | الدالة الدورية (periodic function) / السعة (amplitude) / الموجة المربعة (square wave) |
| photosite | الخلية الحساسة للضوء |
| power spectrum | طيف القدرة (power spectrum) |
| preprocessing | المعالجة المسبقة |
| Prewitt masks | قناعا بريويت (Prewitt) |
| protrusion / plateau | النتوء / الهضبة (plateau) |
| quadrant | الربع (quadrant) |
| radial center / band width | المركز القُطري (radial center) / عرض النطاق |
| rank (of a matrix) | الرتبة (rank) |
| recognition and interpretation | التعرّف والتفسير |
| reflection (of an SE) | الانعكاس (reflection) |
| representation and description | التمثيل والوصف |
| running histogram | المدرج التكراري المتحرك |
| saturate (integer arithmetic) | التشبّع |
| scan lines | خطوط المسح (scan lines) |
| second-order derivative | المشتقة من الرتبة الثانية (second-order derivative) |
| semantic segmentation | التقطيع الدلالي |
| separability | قابلية الفصل (separability) |
| shift property | خاصية الإزاحة (shift property) |
| shift-invariant | ثابت مع الإزاحة (shift-invariant) |
| signal-to-noise ratio (SNR) | نسبة الإشارة إلى الضوضاء (SNR) |
| sinusoid / sinusoidal component | دالة جيبية / مركبة جيبية (sinusoidal component) |
| solarization | التشميس |
| spatial frequency | التردد المكاني (spatial frequency) |
| specified histogram | المدرج التكراري المُحدَّد (specified histogram) |
| spike (in a spectrum) | قمة حادة (spike) |
| stack of binary images | كومة من الصور الثنائية (stack of binary images) |
| step edge | الحافة الدرجية (step edge) |
| subset / superset | مجموعة جزئية / مجموعة شاملة |
| sum of squared differences | مجموع مربعات الفروق |
| symmetric mask | القناع المتماثل (symmetric) |
| template / window | القالب (template) / النافذة (window) |
| total variance | التباين الكلي (total variance) |
| trimodal | ثلاثي القمم (trimodal) |
| True-Color / indexed (palette) color | الألوان الحقيقية / الألوان المفهرسة (ألوان اللوحة) |
| truncate (a kernel) | الاقتطاع (truncate) |
| undersampling | المعاينة الناقصة |
| uneven illumination | الإضاءة غير المنتظمة |
| variance (statistics) | التباين (variance); write «التباين (contrast)» when contrast is meant |
| weighted average | المتوسط الموزون |
| white noise | الضوضاء البيضاء |
| wrap-around padding | الحشو الدائري (wrap around) |
| zero-crossing | نقطة عبور الصفر (zero-crossing) |

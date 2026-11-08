import { bi } from "@/components/widgets/types";
import { defineWalkthrough } from "@/lib/widgets/walkthrough";
import { BOXED_INDEX, PEPPERS_BYTES, STORAGE, TRUE_COLORS, binaryRows, centreValue, flowerSum, levels, mapRow, nyquistSpacing, threshold, toGray } from "@/lib/widgets/ip-lecture-01";

/*
 * Image Processing · Lecture 1 (content/subjects/image-processing/lectures/01-introduction-digital-images.mdx).
 * One walkthrough per heading; the scenes are in
 * components/widgets/walkthrough/scenes/image-processing/lecture-01/. The pixel values and
 * worked numbers come from lib/widgets/ip-lecture-01.ts.
 */

// ---------- Images and pictures ----------
export const images = defineWalkthrough({
  id: "ip1-images",
  title: bi("What an image is", "ما الصورة"),
  analogy: bi(
    "A page of handwriting seen from across the room: you may not read the words, but you can tell it is writing and not spilled ink.",
    "صفحة مكتوبة بخط اليد تراها من طرف الغرفة الآخر: قد لا تقرأ كلماتها، لكنك تدرك أنها كتابة لا حبر مسكوب.",
  ),
  panels: [
    {
      id: "subjects",
      pill: bi("One picture", "لقطة واحدة"),
      heading: bi("An image is a single picture of something", "الصورة لقطة واحدة لشيء ما"),
      points: [
        bi("Humans are predominantly **visual** creatures: we rely on sight more than on any other sense.", "البشر كائنات **بصرية** في المقام الأول: فنحن نعتمد على البصر أكثر من أي حاسة أخرى."),
        bi(
          "An **image** is a single picture that represents something: a person, people or animals, an outdoor scene, a microphotograph or a medical scan.",
          "**الصورة (image)** لقطة واحدة تمثّل شيئًا ما: شخصًا، أو مجموعة من الناس أو الحيوانات، أو مشهدًا خارجيًا، أو صورة مجهرية، أو صورة طبية.",
        ),
      ],
    },
    {
      id: "structure",
      pill: bi("Structure, not blur", "بنية لا تشويش"),
      heading: bi("Even an unclear image has structure", "حتى الصورة غير الواضحة لها بنية"),
      control: {
        label: bi("Show", "اعرض"),
        options: [
          { id: "random", label: bi("A random blur", "تشويش عشوائي") },
          { id: "picture", label: bi("A picture", "صورة") },
        ],
        initial: "random",
      },
      points: [bi("Even when a picture is not immediately recognizable, it is not just a **random blur**.", "حتى إن لم تكن الصورة مفهومة من النظرة الأولى، فهي ليست مجرد **تشويش عشوائي**.")],
      pointsFor: {
        random: [bi("Random values have no **structure**: neighbouring pixels have nothing to do with each other, so there is nothing to improve or analyse.", "القيم العشوائية لا **بنية (structure)** لها: فلا علاقة بين البكسلات المتجاورة، ولذلك لا يوجد ما يمكن تحسينه أو تحليله.")],
        picture: [
          bi(
            "In a real picture neighbouring pixels belong together and form shapes, here the eyes of a face. That **structure** is what image processing improves or analyses.",
            "في الصورة الحقيقية تترابط البكسلات المتجاورة وتكوّن أشكالًا، وهي هنا عينا وجه. وهذه **البنية (structure)** هي ما تحسّنه معالجة الصور أو تحلّله.",
          ),
        ],
      },
    },
  ],
});

// ---------- Image processing and computer vision ----------
export const ipVsCv = defineWalkthrough({
  id: "ip1-ip-vs-cv",
  title: bi("Image processing and computer vision", "معالجة الصور والرؤية الحاسوبية"),
  analogy: bi(
    "A photo lab and a detective. The lab hands back a cleaner photograph; the detective hands back a statement about who is in it.",
    "معمل تحميض ومحقق: يعيد إليك المعمل صورة أنظف، أما المحقق فيعيد إليك إفادة عمّن يظهر فيها.",
  ),
  panels: [
    {
      id: "outputs",
      pill: bi("Different outputs", "مخرجات مختلفة"),
      heading: bi("An image goes in, but what comes out?", "تدخل صورة، فماذا يخرج؟"),
      control: {
        label: bi("Send the image to", "أرسل الصورة إلى"),
        options: [
          { id: "ip", label: bi("Image processing", "معالجة الصور") },
          { id: "cv", label: bi("Computer vision", "الرؤية الحاسوبية") },
        ],
        initial: "ip",
      },
      points: [bi("Both start from an **image**. They differ in their **goal**, and therefore in their **output**.", "يبدأ كلاهما من **صورة**، لكنهما يختلفان في **الهدف**، ومن ثَمّ في **المخرجات**.")],
      pointsFor: {
        ip: [bi("**Image processing** returns the image in a different, usually better, form: here the noise spikes (0 and 255) are gone.", "تُعيد **معالجة الصور (Image Processing)** الصورة نفسها في شكل مختلف، وأفضل عادةً: وهنا اختفت نبضات الضوضاء (0 و255).")],
        cv: [
          bi(
            '**Computer vision** returns **knowledge** of the scene, such as "smiling kid", and it uses image processing algorithms as building blocks.',
            "تُعيد **الرؤية الحاسوبية (Computer Vision)** **معرفة** بمحتوى المشهد، مثل «طفل مبتسم»، وهي تستخدم خوارزميات معالجة الصور لبناتٍ أساسية.",
          ),
        ],
      },
    },
    {
      id: "chain",
      pill: bi("Chained steps", "خطوات متسلسلة"),
      heading: bi("One step's output is the next step's input", "مخرجات خطوة هي مدخلات الخطوة التالية"),
      points: [
        bi("Image processing is usually described as a **subset of computer vision**: a vision system is built from processing steps.", "تُوصف معالجة الصور عادةً بأنها **جزء من الرؤية الحاسوبية (Computer Vision)**: فنظام الرؤية يُبنى من خطوات معالجة."),
        bi(
          "A denoised, sharpened or segmented image often feeds another processing step, or a computer vision system that then extracts the meaning.",
          "فالصورة التي أُزيلت ضوضاؤها أو أُبرزت تفاصيلها أو قُطِّعت تغذّي في الغالب خطوة معالجة أخرى، أو نظام رؤية حاسوبية يستخلص منها المعنى.",
        ),
      ],
    },
    {
      id: "human-computer",
      pill: bi("Human vs computer", "الإنسان والحاسوب"),
      heading: bi("How a computer sees", "كيف يرى الحاسوب"),
      control: {
        label: bi("Who is looking", "من ينظر"),
        options: [
          { id: "human", label: bi("A human", "الإنسان") },
          { id: "computer", label: bi("A computer", "الحاسوب") },
        ],
        initial: "human",
      },
      points: [bi("Both turn the light from a scene into **labels**: mountain, sun, cloud, grass, flower.", "كلاهما يحوّل الضوء القادم من المشهد إلى **تسميات (labels)**: جبل، وشمس، وسحابة، وعشب، وزهرة.")],
      pointsFor: {
        human: [bi("The **eye** forms the image and the **brain** interprets it.", "تكوّن **العين** الصورة، ويفسّرها **الدماغ**.")],
        computer: [
          bi(
            "**Sensors** (a camera) replace the eye, and an **inference system** replaces the brain: **pre-processing**, **feature extraction**, then a **machine learning model** that outputs the labels.",
            "تحلّ **المستشعرات (sensors)** (الكاميرا) محل العين، ويحلّ **نظام استدلال (inference system)** محل الدماغ: **معالجة مسبقة (preprocessing)**، ثم **استخلاص السمات (feature extraction)**، ثم **نموذج تعلم آلة (machine learning model)** يُخرج التسميات.",
          ),
        ],
      },
    },
  ],
});

// ---------- Where it is used ----------
export const applications = defineWalkthrough({
  id: "ip1-applications",
  title: bi("Where vision is used", "أين تُستخدم الرؤية الحاسوبية"),
  analogy: bi("A tireless guard who watches a thousand screens at once and never blinks.", "حارس لا يتعب، يراقب ألف شاشة في وقت واحد ولا يرمش."),
  panels: [
    {
      id: "cctv",
      pill: bi("Surveillance", "المراقبة"),
      heading: bi("Watching CCTV around the clock", "مراقبة كاميرات CCTV على مدار الساعة"),
      points: [
        bi("CCTV cameras are everywhere, and watching them **24/7** is hard for people.", "كاميرات المراقبة (CCTV) في كل مكان، ومراقبتها **على مدار الساعة** أمر صعب على البشر."),
        bi("Vision monitors the feed in **real time**: it counts people, detects crowds and flags **abnormal behaviour**.", "أما الرؤية الحاسوبية فتراقب البث في **الزمن الحقيقي (real time)**: فتعدّ الأشخاص، وتكتشف الحشود، وتنبّه إلى **السلوك غير الطبيعي**."),
      ],
    },
    {
      id: "roads",
      pill: bi("Traffic and driving", "المرور والقيادة"),
      heading: bi("Reading plates and finding the road", "قراءة اللوحات وإيجاد الطريق"),
      control: {
        label: bi("Task", "المهمة"),
        options: [
          { id: "anpr", label: bi("Number plates (ANPR)", "لوحات الأرقام (ANPR)") },
          { id: "driving", label: bi("Self-driving", "القيادة الذاتية") },
        ],
        initial: "anpr",
      },
      points: [bi("On the road, vision turns camera frames into decisions.", "على الطريق، تحوّل الرؤية الحاسوبية لقطات الكاميرا إلى قرارات.")],
      pointsFor: {
        anpr: [bi("**Automatic Number Plate Recognition** reads the plate's characters, then opens a gate or tracks the vehicle.", "يقرأ **التعرّف الآلي على لوحات الأرقام (ANPR)** حروف اللوحة، ثم يفتح بوابة أو يتتبع المركبة.")],
        driving: [bi("A self-driving car detects **lanes**, **traffic lights**, **signs** and **obstacles**, even in fog, and decides what to do next.", "تكتشف السيارة ذاتية القيادة **حارات الطريق** و**إشارات المرور** و**اللافتات** و**العوائق**، حتى في الضباب، ثم تقرر ما تفعله.")],
      },
    },
    {
      id: "health-industry",
      pill: bi("Medicine and industry", "الطب والصناعة"),
      heading: bi("Reading scans and inspecting products", "قراءة الصور الطبية وفحص المنتجات"),
      control: {
        label: bi("Field", "المجال"),
        options: [
          { id: "medical", label: bi("Medical imaging", "التصوير الطبي") },
          { id: "inspection", label: bi("Industrial inspection", "الفحص الصناعي") },
        ],
        initial: "medical",
      },
      points: [bi("The same methods help a doctor read a scan and a robot sort products.", "الأساليب نفسها تساعد الطبيب على قراءة صورة طبية، والروبوت على فرز المنتجات.")],
      pointsFor: {
        medical: [
          bi(
            "Vision detects **tumours**, measures organs, enhances X-ray and ultrasound images, and can classify a chest X-ray for COVID-19 pneumonia.",
            "تكتشف الرؤية الحاسوبية **الأورام**، وتقيس الأعضاء، وتحسّن صور الأشعة السينية والموجات فوق الصوتية، ويمكنها تصنيف صورة أشعة الصدر لاكتشاف الالتهاب الرئوي الناتج عن COVID-19.",
          ),
        ],
        inspection: [bi("On a **conveyor belt**, a camera checks every bottle and rejects the ones without a label.", "على **السير الناقل (conveyor belt)** تفحص الكاميرا كل زجاجة وترفض الزجاجات التي لا تحمل بطاقة.")],
      },
    },
  ],
});

// ---------- What is image processing? ----------
export const whatIsIp = defineWalkthrough({
  id: "ip1-what-is-ip",
  title: bi("What image processing does", "ماذا تفعل معالجة الصور"),
  analogy: bi(
    "Editing a photo for a friend versus preparing it for a scanner: the friend wants it beautiful, the machine wants it simple.",
    "تعديل صورة لصديق مقابل تجهيزها لجهاز آلي: الصديق يريدها جميلة، والآلة تريدها بسيطة.",
  ),
  panels: [
    {
      id: "two-goals",
      pill: bi("Two goals", "هدفان"),
      heading: bi("Change an image for a person or for a machine", "تغيير الصورة من أجل إنسان أو من أجل آلة"),
      points: [
        bi(
          "**Image processing** changes the nature of an image either to **(1)** improve its pictorial information for **human interpretation**, or **(2)** make it more suitable for **autonomous machine perception**.",
          "**معالجة الصور (Image Processing)** تغيّر طبيعة الصورة إما **(1)** لتحسين محتواها المرئي **ليفسّره الإنسان**، وإما **(2)** لجعلها أنسب **لكي تدركها الآلة بصورة مستقلة**.",
        ),
        bi("The two goals can pull in different directions: what looks best to us is not always what a program needs.", "وقد يتعارض الهدفان: فما يبدو لنا أفضل ليس دائمًا ما يحتاجه البرنامج."),
      ],
    },
    {
      id: "for-humans",
      pill: bi("For people", "من أجل الإنسان"),
      heading: bi("Making the image clearer for a viewer", "جعل الصورة أوضح للمشاهد"),
      control: {
        label: bi("Operation", "العملية"),
        options: [
          { id: "sharpen", label: bi("Sharpen the edges", "إبراز الحواف") },
          { id: "denoise", label: bi("Remove noise", "إزالة الضوضاء") },
        ],
        initial: "sharpen",
      },
      points: [bi("For a human viewer we want a crisp, clean picture.", "المشاهد البشري يريد صورة حادة ونظيفة.")],
      pointsFor: {
        sharpen: [
          bi(
            "**Sharpening** exaggerates the change across an edge: the values just before it drop (80 → 60) and those just after it rise (160 → 180), so the edge looks crisper.",
            "يضخّم **الإبراز (sharpening)** التغيّر عبر الحافة: فتنخفض القيم التي تسبقها مباشرةً (80 → 60) وترتفع التي تليها (160 → 180)، فتبدو الحافة أحدّ.",
          ),
        ],
        denoise: [
          bi(
            "**Noise** is random errors in pixel values. Replacing each pixel by the **median** of its 3 × 3 neighbourhood removes the 0 and 255 spikes.",
            "**الضوضاء (noise)** أخطاء عشوائية في قيم البكسلات. واستبدال كل بكسل **بوسيط (median)** جواره 3 × 3 يزيل نبضات 0 و255.",
          ),
        ],
      },
    },
    {
      id: "for-machines",
      pill: bi("For machines", "من أجل الآلة"),
      heading: bi("Simplifying the image for a program", "تبسيط الصورة من أجل البرنامج"),
      control: {
        label: bi("Operation", "العملية"),
        options: [
          { id: "edges", label: bi("Obtain the edges", "استخراج الحواف") },
          { id: "blur", label: bi("Remove detail", "إزالة التفاصيل") },
        ],
        initial: "edges",
      },
      points: [bi("A program is often better served by an image that would look strange to us.", "يكون البرنامج في الغالب أحسن حالًا مع صورة قد تبدو لنا غريبة.")],
      pointsFor: {
        edges: [
          bi(
            "The **edge image** keeps only the outline of the block, 1 on the boundary and 0 elsewhere: exactly what a program needs to find and measure the shape.",
            "تحتفظ **صورة الحواف (edge image)** بحدود المكعب فقط، 1 على الحدود و0 في غيرها: وهذا بالضبط ما يحتاجه البرنامج لإيجاد الشكل وقياسه.",
          ),
        ],
        blur: [
          bi(
            "**Blurring** replaces each pixel by the mean of its 3 × 3 neighbourhood. The fine texture disappears, and the large-scale content is easier to analyse.",
            "يستبدل **التمويه (blurring)** كل بكسل بمتوسط جواره 3 × 3، فيختفي النسيج الدقيق ويصبح المحتوى العام أسهل في التحليل.",
          ),
        ],
      },
    },
  ],
});

// ---------- Image acquisition and sampling ----------
export const acquisition = defineWalkthrough({
  id: "ip1-acquisition",
  title: bi("From a continuous scene to numbers", "من مشهد متصل إلى أرقام"),
  analogy: bi(
    "Filming a spinning wheel: with too few frames per second the wheel seems to turn slowly, or even backwards. Too few samples invent a pattern that was never there.",
    "تصوير عجلة تدور: مع عدد قليل جدًا من اللقطات في الثانية تبدو العجلة كأنها تدور ببطء، أو حتى إلى الخلف. فالعيّنات القليلة جدًا تخترع نمطًا لم يكن موجودًا قط.",
  ),
  facts: { spacing: nyquistSpacing },
  panels: [
    {
      id: "digitize",
      pill: bi("Sample, then quantize", "عايِن ثم كمِّم"),
      heading: bi("Two steps turn brightness into numbers", "خطوتان تحوّلان السطوع إلى أرقام"),
      control: {
        label: bi("Step", "الخطوة"),
        options: [
          { id: "sample", label: bi("Sampling", "المعاينة") },
          { id: "quantize", label: bi("Quantization", "التكميم") },
        ],
        initial: "sample",
      },
      points: [bi("A real scene is **continuous**: brightness changes smoothly along this row, but a computer can store only a finite list of numbers.", "المشهد الحقيقي **متصل (continuous)**: فالسطوع يتغير بسلاسة على امتداد هذا الصف، أما الحاسوب فلا يخزّن إلا قائمة محدودة من الأرقام.")],
      pointsFor: {
        sample: [
          bi(
            "**Sampling** measures the brightness only at a grid of points, the pixel positions. The measured values can still be any number, such as 131.2.",
            "**المعاينة (sampling)** تقيس السطوع عند شبكة من النقاط فقط، وهي مواضع البكسلات. وقد تظل القيم المَقيسة أي عدد، مثل 131.2.",
          ),
        ],
        quantize: [
          bi(
            "**Quantization** rounds each value to one of a finite set of levels. Only 4 levels (0, 85, 170, 255) are used here to make the steps visible; an 8-bit image has 256.",
            "**التكميم (quantization)** يقرّب كل قيمة إلى أحد عدد محدود من المستويات. واستُخدمت هنا 4 مستويات فقط (0 و85 و170 و255) لتظهر الدرجات بوضوح، أما الصورة ذات 8 بِتّات ففيها 256 مستوى.",
          ),
        ],
      },
    },
    {
      id: "undersample",
      pill: bi("Too few samples", "عيّنات قليلة جدًا"),
      heading: bi("Sampling y = sin(x) + (1/3)sin(3x)", "معاينة الدالة y = sin(x) + (1/3)sin(3x)"),
      control: {
        label: bi("Samples", "العيّنات"),
        options: [
          { id: "few", label: bi("Few (every π/2)", "قليلة (كل π/2)") },
          { id: "many", label: bi("Many (every π/16)", "كثيرة (كل π/16)") },
        ],
        initial: "few",
      },
      points: [bi("**Sampling** a continuous function keeps its values at separate points only.", "**معاينة (sampling)** دالة متصلة تعني الاحتفاظ بقيمها عند نقاط منفصلة فقط.")],
      pointsFor: {
        few: [bi("With a point only every π/2, the dots trace a plain zig-zag: the shape and the ripples are lost. This is **undersampling**.", "مع نقطة واحدة كل π/2 ترسم النقاط خطًا متعرجًا بسيطًا، فيضيع الشكل والتموجات. وهذه هي **المعاينة الناقصة (undersampling)**.")],
        many: [bi("With many points the curve, ripples included, can be seen and **reconstructed**.", "ومع نقاط كثيرة يمكن رؤية المنحنى، بتموجاته، و**إعادة بنائه**.")],
      },
    },
    {
      id: "nyquist",
      pill: bi("Nyquist criterion", "معيار نايكويست"),
      heading: bi("How close must the samples be?", "ما مدى تقارب العيّنات المطلوب؟"),
      control: {
        label: bi("Sample spacing", "المسافة بين العيّنات"),
        options: [
          { id: "third", label: bi("π/3 (2 per cycle)", "π/3 (عيّنتان لكل دورة)") },
          { id: "sixth", label: bi("π/6 (4 per cycle)", "π/6 (4 عيّنات لكل دورة)") },
        ],
        initial: "third",
      },
      points: [
        bi(
          "**Nyquist criterion**: sample at least twice the highest frequency. The fastest part here is sin(3x), one cycle every 2π/3, so the spacing must be at most π/3 ≈ 1.05.",
          "**معيار نايكويست (Nyquist criterion)**: عايِن بتردد يساوي ضعف أعلى تردد على الأقل. والمركّبة الأسرع هنا هي sin(3x)، دورة كل 2π/3، فيجب ألا تتجاوز المسافة π/3 ≈ 1.05.",
        ),
      ],
      pointsFor: {
        third: [
          bi(
            "At exactly π/3 from 0, every sample lands where sin(3x) = 0, so the dots fit plain sin(x) and the ripple vanishes. Safe sampling must be **faster** than twice.",
            "عند π/3 بالضبط بدءًا من 0 تقع كل عيّنة حيث sin(3x) = 0، فتطابق النقاط الدالة sin(x) وحدها ويختفي التموج. فالمعاينة الآمنة يجب أن تكون **أسرع** من الضعف.",
          ),
        ],
        sixth: [bi("At π/6 there are 4 samples per cycle of sin(3x), and the dots follow the ripple.", "عند π/6 توجد 4 عيّنات لكل دورة من sin(3x)، فتتبع النقاط التموج.")],
      },
    },
    {
      id: "aliasing",
      pill: bi("Aliasing", "التداخل الطيفي"),
      heading: bi("Undersampled detail turns into a false pattern", "التفاصيل ناقصة المعاينة تتحول إلى نمط زائف"),
      control: {
        label: bi("Sampling", "المعاينة"),
        options: [
          { id: "fine", label: bi("32 pixels across", "32 بكسلًا بالعرض") },
          { id: "coarse", label: bi("8 pixels across", "8 بكسلات بالعرض") },
        ],
        initial: "fine",
      },
      points: [
        bi(
          "In an image, **frequency** is how fast brightness changes across space: fine stripes, sharp edges and texture are high frequencies.",
          "في الصورة، **التردد (frequency)** هو سرعة تغيّر السطوع عبر المكان: فالخطوط الدقيقة والحواف الحادة والنسيج ترددات عالية.",
        ),
      ],
      pointsFor: {
        fine: [bi("32 pixels across 7 stripes is more than 2 per stripe, so the stripes come through.", "32 بكسلًا لسبعة خطوط تعني أكثر من بكسلين لكل خط، فتظهر الخطوط كما هي.")],
        coarse: [
          bi(
            "8 pixels across 7 stripes is fewer than 2 per stripe. The pixels show **one** slow wave, dark at the ends and bright in the middle, that was never in the scene: **aliasing**.",
            "8 بكسلات لسبعة خطوط تعني أقل من بكسلين لكل خط، فتُظهر البكسلات موجة بطيئة **واحدة**، داكنة عند الطرفين وساطعة في الوسط، لم تكن في المشهد قط: وهذا هو **التداخل الطيفي (aliasing)**.",
          ),
        ],
      },
    },
    {
      id: "sensors",
      pill: bi("CCD, CMOS, scanner", "CCD و CMOS والماسح"),
      heading: bi("Capturing light with photosites", "التقاط الضوء بالخلايا الحساسة"),
      control: {
        label: bi("Device", "الجهاز"),
        options: [
          { id: "camera", label: bi("CCD / CMOS camera", "كاميرا CCD أو CMOS") },
          { id: "scanner", label: bi("Flatbed scanner", "الماسح المسطّح") },
        ],
        initial: "camera",
      },
      points: [bi("Each **photosite** produces a voltage proportional to the light falling on it; together they give the grid of pixels.", "تُنتج كل **خلية حساسة للضوء (photosite)** جهدًا يتناسب مع الضوء الساقط عليها، ومعًا تعطي شبكة البكسلات.")],
      pointsFor: {
        camera: [
          bi(
            "A camera's 2-D array captures the **whole image at once**. **CCD** gives high resolution and resists noise; **CMOS** is cheaper and needs less power but is more prone to noise.",
            "تلتقط مصفوفة الكاميرا ثنائية الأبعاد **الصورة كلها مرة واحدة**. ويعطي **CCD** دقة عالية ويقاوم الضوضاء، أما **CMOS** فأرخص ويحتاج إلى طاقة أقل لكنه أكثر تأثرًا بالضوضاء.",
          ),
        ],
        scanner: [
          bi(
            "A **flatbed scanner** moves a **single row** of photosites down the page, capturing it row by row: fewer sensors, but slower and only for flat, still objects.",
            "يحرّك **الماسح الضوئي المسطّح (flatbed scanner)** **صفًّا واحدًا** من الخلايا الحساسة على الصفحة، فيلتقطها صفًّا صفًّا: مستشعرات أقل، لكنه أبطأ ولا يصلح إلا للأجسام المسطّحة الثابتة.",
          ),
        ],
      },
    },
  ],
});

// ---------- Images as functions and pixels ----------
export const pixels = defineWalkthrough({
  id: "ip1-pixels",
  title: bi("An image is a function and a matrix", "الصورة دالة ومصفوفة"),
  analogy: bi(
    "A spreadsheet of brightness: every cell has an address (row, column) and a number, and the picture is what you see when each number is painted as a shade of grey.",
    "جدول بيانات للسطوع: لكل خلية عنوان (صف، عمود) ورقم، والصورة هي ما تراه حين يُلوَّن كل رقم بدرجة من الرمادي.",
  ),
  facts: { centre: centreValue },
  panels: [
    {
      id: "matrix",
      pill: bi("A matrix of pixels", "مصفوفة من البكسلات"),
      heading: bi("What the computer actually stores", "ما يخزّنه الحاسوب فعليًا"),
      control: {
        label: bi("Index like", "الفهرسة كما في"),
        options: [
          { id: "matlab", label: bi("MATLAB f(r,c)", "MATLAB f(r,c)") },
          { id: "numpy", label: bi("NumPy f[r, c]", "NumPy f[r, c]") },
        ],
        initial: "matlab",
      },
      points: [
        bi(
          "A digital image has **discrete** coordinates and values: an M × N **matrix** of **pixels**, from 0 (black) to 255 (white).",
          "إحداثيات الصورة الرقمية وقيمها **منفصلة (discrete)**: فهي **مصفوفة** من **البكسلات (pixels)** أبعادها M × N، قيمها من 0 (أسود) إلى 255 (أبيض).",
        ),
      ],
      pointsFor: {
        matlab: [bi("In MATLAB indices start at **1**: the ringed pixel is f(4,3) = 5.", "في MATLAB تبدأ الفهارس من **1**: فالبكسل المُحاط بإطار هو f(4,3) = 5.")],
        numpy: [bi("In NumPy indices start at **0**: the same pixel is f[3, 2] = 5.", "في NumPy تبدأ الفهارس من **0**: فالبكسل نفسه هو f[3, 2] = 5.")],
      },
    },
    {
      id: "function",
      pill: bi("A function f(x, y)", "الدالة f(x, y)"),
      heading: bi("Brightness as height", "السطوع ارتفاعًا"),
      points: [
        bi("An image is a two-dimensional function **f(x, y)**: its value at each point is the **intensity**, or **grey level**, there.", "الصورة دالة ثنائية الأبعاد **f(x, y)**: قيمتها عند كل نقطة هي **الشدة (intensity)** أو **مستوى الرمادي (grey level)** عندها."),
        bi("Plotting one row as heights shows the function: bright pixels stand high and dark ones low.", "ورسم صف واحد على هيئة ارتفاعات يُظهر الدالة: فالبكسلات الساطعة مرتفعة والداكنة منخفضة."),
      ],
    },
    {
      id: "neighbourhood",
      pill: bi("Neighbourhoods", "الجوار"),
      heading: bi("A pixel and the pixels around it", "البكسل والبكسلات المحيطة به"),
      control: {
        label: bi("Neighbourhood", "الجوار"),
        options: [
          { id: "n35", label: bi("3 × 5", "3 × 5") },
          { id: "n8", label: bi("8 neighbours", "8 جيران") },
          { id: "n4", label: bi("4 neighbours", "4 جيران") },
        ],
        initial: "n35",
      },
      points: [bi("Many operations look at a pixel together with its **neighbourhood**. In McAndrew's example the current pixel is 113.", "كثير من العمليات تنظر إلى البكسل مع **جواره (neighbourhood)**. وفي مثال McAndrew قيمة البكسل الحالي 113.")],
      pointsFor: {
        n35: [bi("The **3 × 5** neighbourhood: 3 rows and 5 columns centred on 113, 15 pixels in all.", "الجوار **3 × 5**: ثلاثة صفوف وخمسة أعمدة متمركزة حول 113، أي 15 بكسلًا في المجموع.")],
        n8: [bi("The 3 × 3 square around it holds its **8 neighbours**: the pixels that share an edge or a corner with it.", "يضم المربع 3 × 3 حوله **جيرانه الثمانية (8-neighbours)**: البكسلات التي تشاركه ضلعًا أو ركنًا.")],
        n4: [bi("Its **4 neighbours** share an edge only: up 139, down 177, left 136, right 250.", "أما **جيرانه الأربعة (4-neighbours)** فتشاركه ضلعًا فقط: أعلاه 139، وأسفله 177، ويساره 136، ويمينه 250.")],
      },
    },
    {
      id: "operations",
      pill: bi("Point vs neighbourhood", "نقطية أم جوارية"),
      heading: bi("Which pixels does an operation read?", "ما البكسلات التي تقرؤها العملية؟"),
      control: {
        label: bi("Operation", "العملية"),
        options: [
          { id: "point", label: bi("Point: add 50", "نقطية: أضف 50") },
          { id: "neigh", label: bi("Neighbourhood: 3 × 3 mean", "جوارية: متوسط 3 × 3") },
        ],
        initial: "point",
      },
      points: [bi("Operations differ in how many input pixels each output pixel uses.", "تختلف العمليات في عدد بكسلات الدخل التي يستخدمها كل بكسل في الخرج.")],
      pointsFor: {
        point: [bi("A **point operation** uses only the pixel's own value: 113 + 50 = 163. Lecture 2 is about these.", "تستخدم **العملية النقطية (point operation)** قيمة البكسل نفسه فقط: 113 + 50 = 163. والمحاضرة 2 مخصصة لها.")],
        neigh: [bi("A **neighbourhood operation** reads the pixels around it too: the mean of the 3 × 3 block around 113 is 1200 / 9 ≈ 133.", "تقرأ **عملية الجوار (neighbourhood operation)** البكسلات المحيطة أيضًا: فمتوسط الكتلة 3 × 3 حول 113 هو 1200 / 9 ≈ 133.")],
      },
    },
  ],
});

// ---------- Storing images: raster vs vector ----------
export const rasterVector = defineWalkthrough({
  id: "ip1-raster-vector",
  title: bi("Raster and vector graphics", "الصور النقطية والرسوم المتجهية"),
  analogy: bi(
    "A mosaic and a recipe. Enlarge a mosaic and you see the tiles; follow the recipe for a bigger cake and it comes out just as smooth.",
    "فسيفساء ووصفة طعام: كبّر الفسيفساء فترى قطعها، أما الوصفة فاتبعها لكعكة أكبر فتخرج بالنعومة نفسها.",
  ),
  panels: [
    {
      id: "zoom",
      pill: bi("Zoom in", "التكبير"),
      heading: bi("Enlarging a raster and a vector image", "تكبير صورة نقطية وصورة متجهية"),
      control: {
        label: bi("Stored as", "مخزَّنة على هيئة"),
        options: [
          { id: "raster", label: bi("Raster (bitmap)", "نقطية (bitmap)") },
          { id: "vector", label: bi("Vector", "متجهية") },
        ],
        initial: "raster",
      },
      points: [bi("Zooming in on the same ring shows how each kind was stored.", "تكبير الحلقة نفسها يكشف كيف خُزِّن كل نوع.")],
      pointsFor: {
        raster: [
          bi(
            "A **raster** image is a grid of pixels. It is **resolution-specific**: enlarged beyond its resolution it **pixelates** into visible squares.",
            "الصورة **النقطية (raster)** شبكة من البكسلات، وهي **مرتبطة بالدقة (resolution-specific)**: فإذا كُبِّرت أكثر مما تسمح به دقتها **تتقطع إلى مربعات** ظاهرة.",
          ),
        ],
        vector: [bi("A **vector** image stores the shape as maths, so the ring is redrawn at the new size and stays smooth: it is **resolution-independent**.", "تخزّن الصورة **المتجهية (vector)** الشكل صيغةً رياضية، فتُعاد رسم الحلقة بالحجم الجديد وتبقى ناعمة: فهي **مستقلة عن الدقة (resolution-independent)**.")],
      },
    },
    {
      id: "instructions",
      pill: bi("Drawing instructions", "تعليمات الرسم"),
      heading: bi("A vector image stores how to draw", "الصورة المتجهية تخزّن طريقة الرسم"),
      points: [
        bi(
          "A **vector** file stores steps, not pixels: draw a dot at a, draw a dot at b, join them with a line of a set thickness, colour it red.",
          "يخزّن ملف **الرسم المتجهي (vector)** خطوات لا بكسلات: ارسم نقطة عند a، وارسم نقطة عند b، وصِلهما بخط ذي سُمك معيّن، ولوِّنه بالأحمر.",
        ),
        bi("To enlarge the image only the coordinates change. The same four instructions draw it, so the file does not grow.", "ولتكبير الصورة تتغير الإحداثيات فقط، فالتعليمات الأربع نفسها ترسمها، ولذلك لا يكبر الملف."),
      ],
    },
    {
      id: "trade-offs",
      pill: bi("Size and use", "الحجم والاستخدام"),
      heading: bi("What each kind costs, and what it suits", "تكلفة كل نوع، وما يناسبه"),
      control: {
        label: bi("Enlarge a", "كبِّر"),
        options: [
          { id: "raster", label: bi("Raster photo", "صورة نقطية") },
          { id: "vector", label: bi("Vector logo", "شعارًا متجهيًا") },
        ],
        initial: "raster",
      },
      points: [bi("A raster file grows with the **number of pixels**; a vector file grows with the number and complexity of **shapes**.", "يكبر الملف النقطي بزيادة **عدد البكسلات**، أما الملف المتجهي فيكبر بزيادة عدد **الأشكال** وتعقيدها.")],
      pointsFor: {
        raster: [
          bi(
            "A 100 × 100 True-Color image takes 30,000 bytes. Enlarged 2× it has 4 times the pixels (120,000 bytes), and 4× gives 480,000. Raster suits **photographs** (JPEG, PNG, BMP, TIFF).",
            "تشغل صورة بالألوان الحقيقية (True-Color) أبعادها 100 × 100 مساحة 30,000 بايت، وإذا كُبِّرت مرتين صار فيها 4 أضعاف البكسلات (120,000 بايت)، و4 مرات تعطي 480,000. والنقطية تناسب **الصور الفوتوغرافية** (JPEG و PNG و BMP و TIFF).",
          ),
        ],
        vector: [bi("Enlarging a vector logo only changes coordinates, so the file stays the same size. Vector suits **logos, fonts and diagrams** (SVG, EPS, AI, PDF).", "تكبير شعار متجهي لا يغيّر إلا الإحداثيات، فيبقى حجم الملف كما هو. والمتجهية تناسب **الشعارات والخطوط الطباعية والمخططات** (SVG و EPS و AI و PDF).")],
      },
    },
  ],
});

// ---------- Aspects of image processing ----------
export const aspects = defineWalkthrough({
  id: "ip1-aspects",
  title: bi("Enhancement, restoration and segmentation", "التحسين والاستعادة والتقطيع"),
  analogy: bi(
    "A photo editor, a repair technician and a map maker: one makes the picture nicer, one undoes known damage, one draws borders around what is in it.",
    "محرر صور، وفني إصلاح، ورسّام خرائط: الأول يجعل الصورة أجمل، والثاني يعكس ضررًا معروفًا، والثالث يرسم حدودًا حول ما فيها.",
  ),
  panels: [
    {
      id: "enhancement",
      pill: bi("Enhancement", "التحسين"),
      heading: bi("Make the image more suitable for a purpose", "جعل الصورة أنسب لغرض ما"),
      points: [
        bi(
          "**Image enhancement** processes an image so the result suits a particular application: sharpening, highlighting edges, improving contrast, brightening, removing noise.",
          "**تحسين الصورة (enhancement)** معالجتها بحيث تناسب النتيجة تطبيقًا معيّنًا: الإبراز، وإظهار الحواف، وتحسين التباين (contrast)، وزيادة السطوع، وإزالة الضوضاء.",
        ),
        bi("This dull patch uses only grey levels 104 to 143. **Stretching** that range onto 0 to 255 makes the same pattern far easier to see.", "تستخدم هذه الرقعة الباهتة مستويات الرمادي من 104 إلى 143 فقط، و**مطّ (stretching)** هذا المدى إلى 0 حتى 255 يجعل النمط نفسه أوضح بكثير."),
      ],
    },
    {
      id: "restoration",
      pill: bi("Restoration", "الاستعادة"),
      heading: bi("Undo damage that has a known cause", "عكس ضرر معروف السبب"),
      control: {
        label: bi("Fix the blur by", "عالِج التشويش عن طريق"),
        options: [
          { id: "enhance", label: bi("Sharpening (enhance)", "الإبراز (تحسين)") },
          { id: "restore", label: bi("Undoing the motion (restore)", "عكس الحركة (استعادة)") },
        ],
        initial: "restore",
      },
      points: [
        bi(
          "The camera slid one pixel during the shot, so every pixel became the mean of itself and its left neighbour: a **known cause**.",
          "انزلقت الكاميرا بكسلًا واحدًا أثناء الالتقاط، فصار كل بكسل متوسط قيمته وقيمة جاره الأيسر: وهذا **سبب معروف**.",
        ),
      ],
      pointsFor: {
        enhance: [bi("A generic **sharpen** makes the blurred row look crisper, but it invents 0s and 255s: it does not recover the scene.", "يجعل **الإبراز (sharpening)** العام الصف المشوَّش يبدو أحدّ، لكنه يخترع قيم 0 و255: فهو لا يسترجع المشهد.")],
        restore: [bi("**Restoration** models that damage and reverses it: f(i) = 2·b(i) − f(i−1) gives back the scene exactly.", "تنمذج **الاستعادة (restoration)** هذا الضرر وتعكسه: فالعلاقة f(i) = 2·b(i) − f(i−1) تعيد المشهد بالضبط.")],
      },
    },
    {
      id: "segmentation",
      pill: bi("Segmentation", "التقطيع"),
      heading: bi("Split the image into its parts", "تقسيم الصورة إلى أجزائها"),
      control: {
        label: bi("Show", "اعرض"),
        options: [
          { id: "image", label: bi("Aerial image", "الصورة الجوية") },
          { id: "classes", label: bi("Segmented", "بعد التقطيع") },
        ],
        initial: "image",
      },
      points: [bi("**Image segmentation** subdivides an image into its constituent parts, or isolates certain aspects such as lines, circles or particular shapes.", "**تقطيع الصورة (segmentation)** تقسيمها إلى الأجزاء المكوّنة لها، أو عزل جوانب معيّنة منها مثل الخطوط أو الدوائر أو أشكال بعينها.")],
      pointsFor: {
        image: [bi("In this aerial view the grey levels alone don't say what is a road, a tree, a building or a car.", "في هذه الصورة الجوية لا تكفي مستويات الرمادي وحدها لمعرفة ما هو طريق أو شجرة أو مبنى أو سيارة.")],
        classes: [bi("**Semantic segmentation** gives every pixel a class: road, tree, building or car.", "يعطي **التقطيع الدلالي (semantic segmentation)** كل بكسل فئة: طريق، أو شجرة، أو مبنى، أو سيارة.")],
      },
    },
  ],
});

// ---------- An image processing task ----------
export const task = defineWalkthrough({
  id: "ip1-task",
  title: bi("The steps of an image processing task", "خطوات مهمة معالجة الصور"),
  analogy: bi("An assembly line: each station works on what the previous one produced, from a raw photo to a decision.", "خط تجميع: كل محطة تعمل على ما أنتجته المحطة السابقة، من صورة خام إلى قرار."),
  panels: [
    {
      id: "steps",
      pill: bi("The steps", "الخطوات"),
      heading: bi("Reading a number plate, step by step", "قراءة لوحة أرقام خطوة بخطوة"),
      points: [
        bi(
          "A typical task passes through **acquiring the image**, **preprocessing**, **segmentation**, and **representation and description**.",
          "تمر المهمة النموذجية **بالتقاط الصورة**، ثم **المعالجة المسبقة (preprocessing)**، ثم **التقطيع (segmentation)**، ثم **التمثيل والوصف**.",
        ),
        bi("The course book adds **recognition and interpretation**: label the objects and draw a conclusion (the plate reads DS 8354, so open the gate).", "ويضيف كتاب المقرر **التعرّف والتفسير**: تسمية الأجسام واستخلاص نتيجة (اللوحة تُقرأ DS 8354، فافتح البوابة)."),
      ],
    },
    {
      id: "segment-coins",
      pill: bi("Counting coins: segment", "عدّ العملات: التقطيع"),
      heading: bi("Step 1: threshold the image", "الخطوة 1: تطبيق العتبة على الصورة"),
      control: {
        label: bi("Image", "الصورة"),
        options: [
          { id: "gray", label: bi("Grayscale", "رمادية") },
          { id: "binary", label: bi("After thresholding", "بعد العتبة") },
        ],
        initial: "gray",
      },
      points: [bi("To count coins, first **segment** them from the background.", "لعدّ العملات، نبدأ **بتقطيعها (segmentation)** عن الخلفية.")],
      pointsFor: {
        gray: [bi("The coins are dark (70 to 90) on a light background (196 to 220).", "العملات داكنة (من 70 إلى 90) على خلفية فاتحة (من 196 إلى 220).")],
        binary: [bi("Every pixel below T = 128 becomes 1 and the rest 0: the coins are now white **blobs** on black.", "كل بكسل أقل من T = 128 يصبح 1 والباقي 0: فصارت العملات **كتلًا (blobs)** بيضاء على أسود.")],
      },
    },
    {
      id: "erode-count",
      pill: bi("Erode and count", "التآكل والعدّ"),
      heading: bi("Steps 2 and 3: separate touching coins, then count", "الخطوتان 2 و3: فصل العملات المتلامسة، ثم العدّ"),
      control: {
        label: bi("Image", "الصورة"),
        options: [
          { id: "before", label: bi("Before erosion", "قبل التآكل") },
          { id: "after", label: bi("After erosion", "بعد التآكل") },
        ],
        initial: "before",
      },
      points: [bi("Counting the separate white regions (**connected components**) counts the coins.", "عدّ المناطق البيضاء المنفصلة (**المكوّنات المتصلة connected components**) يعني عدّ العملات.")],
      pointsFor: {
        before: [bi("Two coins touch, so they form one blob: the count is N = 2, one short.", "عملتان متلامستان تكوّنان كتلة واحدة، فيكون العدد N = 2، أي أقل بواحدة.")],
        after: [
          bi(
            "**Erosion** shrinks every white region until the touching coins come apart: now N = 3. On the slide's real image the same steps give N = 22.",
            "يُقلّص **التآكل (erosion)** كل منطقة بيضاء حتى تنفصل العملات المتلامسة، فيصبح N = 3. وعلى الصورة الحقيقية في الشريحة تعطي الخطوات نفسها N = 22.",
          ),
        ],
      },
    },
  ],
});

// ---------- Types of digital images ----------
export const types = defineWalkthrough({
  id: "ip1-types",
  title: bi("Four types of digital image", "أربعة أنواع من الصور الرقمية"),
  analogy: bi(
    "Four ways to tell a painter a colour: yes or no, how bright, how much red, green and blue, or a number on a shared colour chart.",
    "أربع طرق لتخبر رسّامًا باللون: نعم أو لا، أو درجة السطوع، أو مقدار الأحمر والأخضر والأزرق، أو رقم في دليل ألوان مشترك.",
  ),
  facts: { levels8: levels(8), colors: TRUE_COLORS, index: BOXED_INDEX, row: mapRow(BOXED_INDEX) },
  panels: [
    {
      id: "binary",
      pill: bi("Binary", "الثنائية"),
      heading: bi("Black or white: 1 bit per pixel", "أسود أو أبيض: بِت واحد لكل بكسل"),
      points: [
        bi("Each pixel of a **binary image** is 0 (black) or 1 (white), so it needs only **one bit**.", "كل بكسل في **الصورة الثنائية (binary)** إما 0 (أسود) أو 1 (أبيض)، ولذلك لا يحتاج إلا إلى **بِت واحد**."),
        bi(
          "Binary images suit text, fingerprints and plans, and they are the usual result of thresholding and **edge detection**, like this edge image of a block.",
          "تناسب الصور الثنائية النصوص والبصمات والمخططات، وهي النتيجة المعتادة للتقطيع بالعتبة و**كشف الحواف (edge detection)**، مثل صورة حواف المكعب هذه.",
        ),
      ],
    },
    {
      id: "grayscale",
      pill: bi("Grayscale", "الرمادية"),
      heading: bi("Shades of grey: bit depth sets the levels", "درجات الرمادي: عمق البت يحدد المستويات"),
      control: {
        label: bi("Bit depth k", "عمق البت k"),
        options: [
          { id: "k1", label: bi("1 bit", "بِت واحد") },
          { id: "k2", label: bi("2 bits", "بِتّان") },
          { id: "k4", label: bi("4 bits", "4 بِتّات") },
          { id: "k8", label: bi("8 bits", "8 بِتّات") },
        ],
        initial: "k8",
      },
      points: [bi("A **grayscale** image has one channel. With **bit depth** k it has L = 2^k grey levels.", "للصورة **الرمادية (grayscale)** قناة واحدة، وعند **عمق بت (bit depth)** يساوي k يكون فيها L = 2^k مستوى رمادي.")],
      pointsFor: {
        k1: [bi("1 bit: L = 2 levels, only black and white, and the face breaks up.", "بِت واحد: L = 2 مستوى، الأسود والأبيض فقط، فيتفكك الوجه.")],
        k2: [bi("2 bits: L = 4 levels. Smooth shading turns into visible **bands**.", "بِتّان: L = 4 مستويات، فتتحول الظلال الناعمة إلى **أشرطة** ظاهرة.")],
        k4: [bi("4 bits: L = 16 levels. Close to the original, but still slightly banded.", "4 بِتّات: L = 16 مستوى، قريبة من الأصل لكنها ما زالت مقسّمة إلى أشرطة قليلًا.")],
        k8: [bi("8 bits: L = 256 levels, 0 (black) to 255 (white): one byte per pixel and smooth-looking shading.", "8 بِتّات: L = 256 مستوى، من 0 (أسود) إلى 255 (أبيض): بايت واحد لكل بكسل وظلال تبدو ناعمة.")],
      },
    },
    {
      id: "rgb",
      pill: bi("RGB", "RGB"),
      heading: bi("Three numbers per pixel: red, green, blue", "ثلاثة أرقام لكل بكسل: أحمر وأخضر وأزرق"),
      points: [
        bi(
          "An **RGB** (true color) pixel has three values, the amounts of red, green and blue, each 0 to 255: three matrices, one per **channel**.",
          "لبكسل صورة **RGB** (الألوان الحقيقية) ثلاث قيم، هي مقادير الأحمر والأخضر والأزرق، كلٌّ منها من 0 إلى 255: أي ثلاث مصفوفات، واحدة لكل **قناة (channel)**.",
        ),
        bi("That is 3 × 8 = **24 bits** per pixel, and 2^24 = **16,777,216** possible colours.", "أي 3 × 8 = **24 بِتًّا** لكل بكسل، و 2^24 = **16,777,216** لونًا ممكنًا."),
      ],
    },
    {
      id: "indexed",
      pill: bi("Indexed", "المفهرسة"),
      heading: bi("Each pixel is a row number in a colour map", "كل بكسل رقم صف في خريطة الألوان"),
      points: [
        bi(
          "An **indexed** image stores an **index** per pixel plus a **colour map**: one row per colour, with red, green and blue between 0 and 1.",
          "تخزّن الصورة **المفهرسة (indexed)** **فهرسًا** لكل بكسل إضافةً إلى **خريطة ألوان (color map)**: صف لكل لون، فيه الأحمر والأخضر والأزرق بين 0 و1.",
        ),
        bi(
          "For a uint8 image index 0 is the first row, so the boxed value **6** picks **row 7**, the dark grey (0.2627, 0.2588, 0.2549). At 8 bits a pixel, that is a third of true color.",
          "في الصورة من النوع uint8 يشير الفهرس 0 إلى الصف الأول، ولذلك تختار القيمة **6** المحاطة بإطار **الصف 7**، وهو الرمادي الداكن (0.2627, 0.2588, 0.2549). وبثمانية بِتّات لكل بكسل يكون الحجم ثلث الألوان الحقيقية.",
        ),
      ],
    },
  ],
});

// ---------- Resolution, color depth and file size ----------
export const fileSize = defineWalkthrough({
  id: "ip1-file-size",
  title: bi("Resolution, colour depth and file size", "الدقة وعمق اللون وحجم الملف"),
  analogy: bi(
    "Tiling a floor: more tiles per metre (resolution) and more colours to choose from for each tile (colour depth) both make the order bigger.",
    "تبليط أرضية: زيادة عدد البلاطات في كل متر (الدقة) وزيادة الألوان المتاحة لكل بلاطة (عمق اللون) كلتاهما تكبّر الطلبية.",
  ),
  facts: { truecolor: STORAGE.trueColor.bytes, indexed: STORAGE.indexed.bytes },
  panels: [
    {
      id: "resolution",
      pill: bi("Resolution", "الدقة"),
      heading: bi("How many pixels per inch", "كم بكسلًا في كل بوصة"),
      control: {
        label: bi("Resolution", "الدقة"),
        options: [
          { id: "low", label: bi("Low (6 × 6)", "منخفضة (6 × 6)") },
          { id: "high", label: bi("High (16 × 16)", "عالية (16 × 16)") },
        ],
        initial: "low",
      },
      points: [
        bi(
          "**Resolution** is the scanning rate: how many pixels are recorded for each inch. It is also quoted as a pixel count, such as 1920 × 1080 for Full HD.",
          "**الدقة (resolution)** هي معدل المسح: عدد البكسلات المسجّلة لكل بوصة. وتُذكر أيضًا بعدد البكسلات، مثل 1920 × 1080 في Full HD.",
        ),
      ],
      pointsFor: {
        low: [bi("At 6 × 6 the ball is a few coarse blocks: the eye clearly sees the jumps between pixels.", "عند 6 × 6 تصبح الكرة بضع كتل خشنة: فترى العين القفزات بين البكسلات بوضوح.")],
        high: [bi("At 16 × 16 the same ball looks much smoother. High enough, and the eye no longer sees the **discontinuity** between pixels.", "عند 16 × 16 تبدو الكرة نفسها أنعم بكثير، وإذا كانت الدقة عالية بما يكفي لا تعود العين ترى **الانقطاع** بين البكسلات.")],
      },
    },
    {
      id: "color-depth",
      pill: bi("Colour depth", "عمق اللون"),
      heading: bi("True-Color: 8 bits for each primary", "الألوان الحقيقية: 8 بِتّات لكل لون أساسي"),
      points: [
        bi("**Colour depth** is the number of bits per pixel. **True-Color** uses 24: 8 each for red, green and blue.", "**عمق اللون (color depth)** هو عدد البِتّات لكل بكسل، ويستخدم نظام **الألوان الحقيقية (True-Color)** 24 بِتًّا: 8 لكلٍّ من الأحمر والأخضر والأزرق."),
        bi("Equal amounts of red, green and blue always give a **grey**, which is why a grayscale pixel needs only one number.", "المقادير المتساوية من الأحمر والأخضر والأزرق تعطي دائمًا لونًا **رماديًا**، ولهذا لا يحتاج البكسل الرمادي إلا إلى رقم واحد."),
      ],
    },
    {
      id: "file-size",
      pill: bi("File size", "حجم الملف"),
      heading: bi("Size = pixels × bits per pixel", "الحجم = البكسلات × البِتّات لكل بكسل"),
      control: {
        label: bi("Scheme", "النظام"),
        options: [
          { id: "true", label: bi("True-Color (24 bits)", "الألوان الحقيقية (24 بِتًّا)") },
          { id: "indexed", label: bi("Indexed (8 bits)", "المفهرسة (8 بِتّات)") },
        ],
        initial: "true",
      },
      points: [
        bi("An M × N image with b bits per pixel takes M × N × b bits, or M × N × b / 8 bytes. A good camera uses almost 3,000,000 pixels for a 3 × 5 inch photo.", "تشغل الصورة M × N بعمق b بِتًّا لكل بكسل M × N × b بِتًّا، أي M × N × b / 8 بايتًا. وتستخدم الكاميرا الجيدة نحو 3,000,000 بكسل لصورة مقاسها 3 × 5 بوصة."),
      ],
      pointsFor: {
        true: [bi("True-Color: 3,000,000 × 24 = 72,000,000 bits = **9,000,000 bytes** (about 9 MB). **JPEG** uses True-Color but compresses it.", "الألوان الحقيقية: 3,000,000 × 24 = 72,000,000 بِت = **9,000,000 بايت** (نحو 9 ميغابايت). ويستخدم **JPEG** الألوان الحقيقية لكنه يضغطها.")],
        indexed: [
          bi(
            "Indexed: 3,000,000 × 8 = 24,000,000 bits = **3,000,000 bytes** (about 3 MB), a third of True-Color. **GIF** uses indexed colour, so it holds at most 256 colours.",
            "المفهرسة: 3,000,000 × 8 = 24,000,000 بِت = **3,000,000 بايت** (نحو 3 ميغابايت)، أي ثلث الألوان الحقيقية. ويستخدم **GIF** الألوان المفهرسة، ولذلك لا يحمل أكثر من 256 لونًا.",
          ),
        ],
      },
    },
  ],
});

// ---------- Converting between image types ----------
const avg = toGray("average");
export const convert = defineWalkthrough({
  id: "ip1-convert",
  title: bi("Converting between image types", "التحويل بين أنواع الصور"),
  analogy: bi(
    "Photocopying a colour poster: a colour copy keeps everything, a black-and-white copy loses the colours, and you can't get them back from the copy.",
    "تصوير ملصق ملوّن: النسخة الملونة تحتفظ بكل شيء، والنسخة بالأبيض والأسود تفقد الألوان، ولا يمكنك استعادتها من النسخة.",
  ),
  facts: { sum: flowerSum(0, 0), gray: avg[0][0], binary: binaryRows(threshold(avg, 75)), rgb: PEPPERS_BYTES.rgb, double: PEPPERS_BYTES.double },
  panels: [
    {
      id: "functions",
      pill: bi("MATLAB functions", "دوال MATLAB"),
      heading: bi("Six functions link the three main types", "ست دوال تربط الأنواع الثلاثة الرئيسية"),
      points: [
        bi("MATLAB converts between grayscale, RGB and indexed images with rgb2gray, gray2rgb, rgb2ind, ind2rgb, gray2ind and ind2gray.", "يحوّل MATLAB بين الصور الرمادية و RGB والمفهرسة بالدوال rgb2gray و gray2rgb و rgb2ind و ind2rgb و gray2ind و ind2gray."),
        bi("A **threshold** turns grayscale into binary, as in bw = g >= 128. rgb2ind also needs the number of colours n.", "وتحوّل **العتبة (threshold)** الصورة الرمادية إلى ثنائية، كما في bw = g >= 128. وتحتاج rgb2ind أيضًا إلى عدد الألوان n."),
      ],
    },
    {
      id: "rgb-to-gray",
      pill: bi("RGB → grey", "من RGB إلى رمادي"),
      heading: bi("Three channels become one", "ثلاث قنوات تصبح قناة واحدة"),
      control: {
        label: bi("Method", "الطريقة"),
        options: [
          { id: "average", label: bi("Average", "المتوسط") },
          { id: "red", label: bi("One channel (R)", "قناة واحدة (R)") },
          { id: "weighted", label: bi("Weighted (rgb2gray)", "موزون (rgb2gray)") },
        ],
        initial: "average",
      },
      points: [bi("Each grey pixel is computed from the same pixel's R, G and B, here for the flower image's top-left 3 × 3 patch.", "يُحسب كل بكسل رمادي من قيم R و G و B للبكسل نفسه، وهنا للرقعة 3 × 3 في أعلى يسار صورة الزهور.")],
      pointsFor: {
        average: [bi("**Solution 1** averages: (49 + 64 + 66) / 3 = 179 / 3 = 59.67, which rounds to **60**.", "**الحل الأول** يحسب المتوسط: (49 + 64 + 66) / 3 = 179 / 3 = 59.67، وتقريبه **60**.")],
        red: [bi("**Solution 2** keeps one channel, here red: the first pixel is simply 49.", "**الحل الثاني** يحتفظ بقناة واحدة، وهي هنا الأحمر: فالبكسل الأول هو 49 ببساطة.")],
        weighted: [bi("rgb2gray weights green most, following the eye: 0.2989R + 0.5870G + 0.1140B = 59.74, also **60**.", "تعطي rgb2gray الأخضر الوزن الأكبر تبعًا لحساسية العين: 0.2989R + 0.5870G + 0.1140B = 59.74، وتقريبه **60** أيضًا.")],
      },
    },
    {
      id: "threshold",
      pill: bi("Grey → binary", "من رمادي إلى ثنائي"),
      heading: bi("Compare every pixel with a threshold T", "قارن كل بكسل بالعتبة T"),
      control: {
        label: bi("Threshold", "العتبة"),
        options: [
          { id: "t75", label: bi("T = 75", "T = 75") },
          { id: "t128", label: bi("T = 128", "T = 128") },
        ],
        initial: "t75",
      },
      points: [bi("**Binary(i, j)** is 1 where Gray(i, j) ≥ T, and 0 otherwise.", "تكون **Binary(i, j)** مساوية 1 حيث Gray(i, j) ≥ T، و0 فيما عدا ذلك.")],
      pointsFor: {
        t75: [bi("With T = 75 the averaged patch becomes 000 / 111 / 101: five pixels reach the threshold.", "مع T = 75 تصبح الرقعة المتوسطة 000 / 111 / 101: خمسة بكسلات تبلغ العتبة.")],
        t128: [bi("With T = 128, as in g >= 128, every pixel of this dark patch becomes 0: the choice of T decides what survives.", "مع T = 128، كما في g >= 128، يصبح كل بكسل في هذه الرقعة الداكنة 0: فاختيار T يحدد ما يبقى.")],
      },
    },
    {
      id: "sizes",
      pill: bi("Size and data type", "الحجم ونوع البيانات"),
      heading: bi("The same picture in different data types", "الصورة نفسها بأنواع بيانات مختلفة"),
      control: {
        label: bi("Measured with", "مَقيسة بـ"),
        options: [
          { id: "matlab", label: bi("MATLAB whos", "MATLAB whos") },
          { id: "python", label: bi("NumPy nbytes", "NumPy nbytes") },
        ],
        initial: "matlab",
      },
      points: [bi("peppers.png is 384 × 512 pixels; each conversion changes the size and the **data type**.", "أبعاد الصورة peppers.png هي 384 × 512 بكسلًا، وكل تحويل يغيّر الحجم و**نوع البيانات (data type)**.")],
      pointsFor: {
        matlab: [
          bi(
            "uint8 RGB takes 589,824 bytes, grayscale 196,608 and logical binary 196,608 (1 byte each). ind2rgb returns **double**, 8 bytes per value: 4,718,592 bytes, eight times the original.",
            "تشغل صورة RGB من النوع uint8 مساحة 589,824 بايت، والرمادية 196,608، والثنائية من النوع logical مساحة 196,608 (بايت لكل قيمة). أما ind2rgb فتعيد النوع **double**، بثمانية بايتات لكل قيمة: 4,718,592 بايت، أي ثمانية أضعاف الأصل.",
          ),
        ],
        python: [bi("NumPy reports the same sizes: rgb.nbytes is 589,824 for a uint8 (H, W, 3) array, gray_avg.nbytes is 196,608, and the binary array has dtype bool.", "يعطي NumPy الأحجام نفسها: rgb.nbytes يساوي 589,824 لمصفوفة uint8 أبعادها (H, W, 3)، و gray_avg.nbytes يساوي 196,608، ونوع المصفوفة الثنائية bool.")],
      },
    },
  ],
});

/** Every walkthrough in this lecture, registered in lib/walkthroughs/index.ts. */
export const all = [images, ipVsCv, applications, whatIsIp, acquisition, pixels, rasterVector, aspects, task, types, fileSize, convert] as const;

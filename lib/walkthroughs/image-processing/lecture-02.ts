import { bi } from "@/components/widgets/types";
import { defineWalkthrough } from "@/lib/widgets/walkthrough";
import {
  CLIPPED_BY_PLUS,
  EQ,
  EQ_SMALL,
  EQ_USED,
  F_HIST,
  F_USED,
  G,
  GAMMA_XS,
  LINEAR_SMALL,
  OPS,
  PW_COMPRESS,
  PW_STRETCH,
  STRETCH_BAND,
  STRETCH_HIST,
  STRETCH_MAP,
  STRETCH_POINTS,
  X,
  complement,
  countOverflow,
  fmt2,
  gamma8,
  linearStretch,
  list,
  pointOp,
  pw8,
  round,
  slopes,
  solarize,
  sum,
  wrap,
} from "@/lib/widgets/ip-lecture-02";

/*
 * Image Processing · Lecture 2 (content/subjects/image-processing/lectures/02-point-processing.mdx).
 * One walkthrough per heading; the scenes are in
 * components/widgets/walkthrough/scenes/image-processing/lecture-02/. Every number below is
 * computed in lib/widgets/ip-lecture-02.ts, and the page's `expect` checks the `facts`.
 */

// ---------- Three classes of image operations ----------
export const classes = defineWalkthrough({
  id: "ip2-classes",
  title: bi("Three classes of image operations", "الفئات الثلاث لعمليات الصور"),
  analogy: bi(
    "A mosaic: repaint one tile by its own colour (point), blend it with the tiles around it (neighbourhood), or redraw the whole mosaic from a plan of it (transform).",
    "فسيفساء: تعيد طلاء بلاطة بحسب لونها وحده (نقطية)، أو تمزجها بالبلاطات المحيطة بها (جوار)، أو تعيد رسم الفسيفساء كلها من مخطط لها (تحويل).",
  ),
  panels: [
    {
      id: "inputs",
      pill: bi("What each one reads", "ما تقرؤه كلٌّ منها"),
      heading: bi("Which pixels decide one new pixel?", "أي البكسلات تحدد بكسلًا جديدًا واحدًا؟"),
      control: {
        label: bi("Class", "الفئة"),
        options: [
          { id: "point", label: bi("Point", "نقطية") },
          { id: "neighbourhood", label: bi("Neighbourhood", "الجوار") },
          { id: "transform", label: bi("Transform", "التحويل") },
        ],
        initial: "point",
      },
      points: [bi("The three classes differ in the **information required** to compute a new pixel value.", "تختلف الفئات الثلاث في **المعلومات المطلوبة** لحساب القيمة الجديدة للبكسل.")],
      pointsFor: {
        point: [bi("A **point** operation reads only the pixel's own grey value, with no knowledge of its surroundings.", "العملية **النقطية (point)** لا تقرأ إلا قيمة الرمادي للبكسل نفسه، دون أي معرفة بما حوله.")],
        neighbourhood: [
          bi("A **neighbourhood** operation reads the grey levels in a small **mask** around the pixel, here 3 × 3 = 9 pixels.", "عملية **الجوار (neighbourhood)** تقرأ مستويات الرمادي في **قناع (mask)** صغير حول البكسل، وهو هنا 3 × 3 = 9 بكسلات."),
        ],
        transform: [bi("A **transform** processes the whole image as one large block: every output value depends on all 36 pixels.", "**التحويل (transform)** يعالج الصورة كلها كتلةً واحدة كبيرة: فكل قيمة ناتجة تعتمد على البكسلات الـ 36 كلها.")],
      },
    },
    {
      id: "transform",
      pill: bi("Transform processing", "المعالجة بالتحويل"),
      heading: bi("Transform, process, transform back", "حوِّل، ثم عالِج، ثم أعِد التحويل"),
      points: [
        bi("A **transform** represents the pixel values in another but **equivalent** form, such as frequencies (the Fourier transform).", "يمثّل **التحويل (transform)** قيم البكسلات في صورة أخرى **مكافئة** لها، مثل الترددات (تحويل فورييه Fourier transform)."),
        bi("The image is processed in that form, then the **inverse transform** brings it back as an image.", "تُعالَج الصورة في تلك الصيغة، ثم يعيدها **التحويل العكسي (inverse transform)** صورةً من جديد."),
      ],
    },
    {
      id: "uses",
      pill: bi("Typical uses", "الاستخدامات النموذجية"),
      heading: bi("What each class is used for", "فيمَ تُستخدم كل فئة"),
      points: [
        bi("Point operations adjust **brightness and contrast**, apply thresholds and equalize histograms.", "تضبط العمليات النقطية **السطوع والتباين (brightness and contrast)**، وتطبّق العتبات (thresholds)، وتسوّي المدرجات التكرارية."),
        bi("Neighbourhood operations smooth, sharpen and find edges; transforms serve frequency analysis, compression and restoration.", "وتنعّم عمليات الجوار الصورة وتبرزها وتكشف حوافها؛ أما التحويلات فتخدم تحليل الترددات والضغط والاستعادة."),
      ],
    },
  ],
});

// ---------- Point operations ----------
const PLUS60 = (v: number) => v + 60;
export const pointOps = defineWalkthrough({
  id: "ip2-point-ops",
  title: bi("Point operations: y = f(x)", "العمليات النقطية: y = f(x)"),
  analogy: bi(
    "A currency converter: every 100 pounds becomes the same amount of dollars, no matter which wallet it came from.",
    "محوّل العملات: كل 100 جنيه تصبح المبلغ نفسه من الدولارات، أيًّا كانت المحفظة التي جاءت منها.",
  ),
  panels: [
    {
      id: "function",
      pill: bi("One value in, one out", "قيمة تدخل وقيمة تخرج"),
      heading: bi("Each new value is a function of the old value alone", "كل قيمة جديدة دالة في القيمة القديمة وحدها"),
      points: [
        bi("A **point operation** applies one function **y = f(x)** to every pixel and ignores its neighbours.", "**العملية النقطية (point operation)** تطبّق دالة واحدة **y = f(x)** على كل بكسل وتتجاهل جيرانه."),
        bi(
          `Here f adds 60 and clips at 255: every 60 becomes ${pointOp([[60]], PLUS60)[0][0]} and every 180 becomes ${pointOp([[180]], PLUS60)[0][0]}, wherever it sits.`,
          `هنا تضيف f القيمة 60 وتقصّ عند 255: فتصبح كل 60 مساوية ${pointOp([[60]], PLUS60)[0][0]}، وكل 180 مساوية ${pointOp([[180]], PLUS60)[0][0]}، أينما كان موضعها.`,
        ),
      ],
    },
    {
      id: "lookup",
      pill: bi("Lookup table", "جدول البحث"),
      heading: bi("Compute f once, then look every pixel up", "احسب f مرة واحدة، ثم ابحث عن كل بكسل"),
      points: [
        bi("The output depends only on the input value, so f can be computed once for every possible level and stored in a **lookup table**.", "الناتج لا يعتمد إلا على قيمة المدخل، لذلك يمكن حساب f مرة واحدة لكل مستوى ممكن وتخزينها في **جدول بحث (lookup table)**."),
        bi("This 3-bit image needs 8 entries, y = min(x + 2, 7); an 8-bit image needs 256. Then each pixel costs one lookup.", "تحتاج هذه الصورة ذات 3 بِتّات إلى 8 مداخل، y = min(x + 2, 7)؛ وتحتاج صورة 8 بِتّات إلى 256. ثم يكلّف كل بكسل بحثًا واحدًا."),
      ],
    },
    {
      id: "family",
      pill: bi("The main point operations", "أهم العمليات النقطية"),
      heading: bi("Different operations, different curves", "عمليات مختلفة، منحنيات مختلفة"),
      points: [
        bi(
          "**Brightness**, **contrast**, **gamma correction** and **histogram equalization** are all point operations: each is just a different curve y = f(x).",
          "**السطوع (brightness)** و**التباين (contrast)** و**تصحيح غاما (gamma correction)** و**تسوية المدرج التكراري (histogram equalization)** كلها عمليات نقطية: فكلٌّ منها مجرد منحنى مختلف y = f(x).",
        ),
        bi("They are used mainly for **contrast enhancement**, often in **pre-processing** before the main job is attempted.", "وتُستخدم أساسًا **لتحسين التباين (contrast enhancement)**، وكثيرًا ما يكون ذلك في **المعالجة المسبقة (preprocessing)** قبل البدء في المهمة الرئيسية."),
      ],
    },
  ],
});

// ---------- Arithmetic operations ----------
const plusOut = pointOp(X, OPS.plus);
const minusOut = pointOp(X, OPS.minus);
const liftOut = pointOp(X, OPS.lift);
const halfOut = pointOp(X, OPS.half);
const nPlus = countOverflow(X, OPS.plus);
const nMinus = countOverflow(X, OPS.minus);
const nDouble = countOverflow(X, OPS.double);
const lo = CLIPPED_BY_PLUS[0];
const hi = CLIPPED_BY_PLUS[CLIPPED_BY_PLUS.length - 1];
const liftOf = (v: number) => round(OPS.lift(v));

export const arithmetic = defineWalkthrough({
  id: "ip2-arithmetic",
  title: bi("Arithmetic on pixels: round, then clip", "العمليات الحسابية على البكسلات: قرّب ثم قُصّ"),
  analogy: bi(
    "A glass that holds 255 ml: pour in more and the extra spills over, and afterwards nobody can tell how much was poured.",
    "كوب لا يتسع إلا لـ 255 ملّيلترًا: إذا صببت أكثر انسكب الفائض، ولا يستطيع أحد بعد ذلك أن يعرف كم صُبّ فيه.",
  ),
  facts: {
    clipped: CLIPPED_BY_PLUS.length,
    "plus-first": plusOut[0][0],
    "minus-last": minusOut[3][3],
    "lift-last": liftOut[3][3],
    wrap: wrap(140 + 128),
    wrap200: wrap(200 + 128),
  },
  panels: [
    {
      id: "add",
      pill: bi("Add or subtract", "الجمع والطرح"),
      heading: bi("y = x ± 128 on the example image", "y = x ± 128 على الصورة المثال"),
      control: {
        label: bi("Operation", "العملية"),
        options: [
          { id: "plus", label: bi("x + 128", "x + 128") },
          { id: "minus", label: bi("x − 128", "x − 128") },
        ],
        initial: "plus",
      },
      points: [bi("The result must again be a grey level from 0 to 255, so every value is **rounded**, then **clipped** to that range.", "يجب أن تكون النتيجة مرة أخرى مستوى رماديًا من 0 إلى 255، لذلك تُقرَّب كل قيمة، ثم **تُقصّ (clipping)** إلى هذا المدى.")],
      pointsFor: {
        plus: [
          bi(
            `Adding **brightens** the image: 20 becomes ${plusOut[0][0]}. But the ${nPlus} values from ${lo} up pass 255 and are all clipped to 255.`,
            `الجمع **يزيد سطوع** الصورة: فتصبح 20 مساوية ${plusOut[0][0]}. لكن القيم الـ ${nPlus} من ${lo} فما فوق تتجاوز 255، فتُقصّ كلها إلى 255.`,
          ),
        ],
        minus: [
          bi(
            `Subtracting **darkens** it: 250 becomes ${minusOut[3][3]}. But the ${nMinus} values below 128 go negative and are clipped to 0.`,
            `الطرح يجعل الصورة **أدكن**: فتصبح 250 مساوية ${minusOut[3][3]}. لكن القيم الـ ${nMinus} الأقل من 128 تصبح سالبة، فتُقصّ إلى 0.`,
          ),
        ],
      },
    },
    {
      id: "multiply",
      pill: bi("Multiply or divide", "الضرب والقسمة"),
      heading: bi("y = Cx, and y = x/2 + 128", "y = Cx، و y = x/2 + 128"),
      control: {
        label: bi("Function", "الدالة"),
        options: [
          { id: "half", label: bi("x / 2", "x / 2") },
          { id: "double", label: bi("2x", "2x") },
          { id: "lift", label: bi("x/2 + 128", "x/2 + 128") },
        ],
        initial: "half",
      },
      points: [bi("Multiplying by C > 1 brightens and spreads the grey levels apart; C < 1 darkens and squeezes them together.", "الضرب في C > 1 يزيد السطوع ويباعد بين مستويات الرمادي، أما C < 1 فيجعل الصورة أدكن ويقارب بينها.")],
      pointsFor: {
        half: [
          bi(
            `x / 2 halves every value: 20–250 becomes ${halfOut[0][0]}–${halfOut[3][3]}, darker and lower in contrast, with nothing clipped.`,
            `x / 2 تقسم كل قيمة على 2: فيصبح المدى 20–250 هو ${halfOut[0][0]}–${halfOut[3][3]}، أي أدكن وأقل تباينًا، دون قصّ أي قيمة.`,
          ),
        ],
        double: [bi(`2x doubles the steps between levels, but ${nDouble} values pass 255 and are clipped.`, `2x تضاعف الخطوات بين المستويات، لكن ${nDouble} قيم تتجاوز 255 فتُقصّ.`)],
        lift: [
          bi(
            `x/2 + 128 squeezes 0–255 into 128–255: brighter with no clipping, at the price of lower contrast (20 → ${liftOut[0][0]}, 250 → ${liftOut[3][3]}).`,
            `x/2 + 128 تضغط المدى 0–255 في 128–255: فتزيد السطوع دون قصّ، مقابل تباين أقل (20 → ${liftOut[0][0]}، و250 → ${liftOut[3][3]}).`,
          ),
        ],
      },
    },
    {
      id: "lost",
      pill: bi("Clipping loses information", "القصّ يُضيّع المعلومات"),
      heading: bi(`Brighten the ${CLIPPED_BY_PLUS.length} bright pixels, then undo it`, `زِد سطوع البكسلات الساطعة الـ ${CLIPPED_BY_PLUS.length}، ثم تراجع عن ذلك`),
      control: {
        label: bi("Brighten with", "زِد السطوع بـ"),
        options: [
          { id: "clip", label: bi("x + 128", "x + 128") },
          { id: "squeeze", label: bi("x/2 + 128", "x/2 + 128") },
        ],
        initial: "clip",
      },
      points: [bi("Undo each brightening and compare the result with the pixels you started from.", "تراجع عن كل زيادة في السطوع، وقارن الناتج بالبكسلات التي بدأت بها.")],
      pointsFor: {
        clip: [
          bi(
            `After adding 128, the ${CLIPPED_BY_PLUS.length} different values from ${lo} to ${hi} are all 255. Subtracting 128 gives 127 for every one: the originals are **destroyed**.`,
            `بعد جمع 128 تصبح القيم المختلفة الـ ${CLIPPED_BY_PLUS.length} من ${lo} إلى ${hi} كلها 255، وطرح 128 يعطي 127 لكل منها: فقد **أُتلفت** القيم الأصلية.`,
          ),
        ],
        squeeze: [
          bi(
            `x/2 + 128 keeps them apart (${liftOf(lo)} to ${liftOf(hi)}), so 2(y − 128) brings each of these values back exactly.`,
            `أما x/2 + 128 فتُبقيها متمايزة (من ${liftOf(lo)} إلى ${liftOf(hi)})، لذلك تعيد 2(y − 128) كل قيمة من هذه القيم كما كانت تمامًا.`,
          ),
        ],
      },
    },
    {
      id: "overflow",
      pill: bi("Clip or wrap around?", "قصّ أم التفاف؟"),
      heading: bi("What happens to 140 + 128 in uint8?", "ماذا يحدث لـ 140 + 128 في uint8؟"),
      control: {
        label: bi("Arithmetic", "الحساب"),
        options: [
          { id: "saturate", label: bi("Clip to 255 (the slides' rule)", "قصّ إلى 255 (قاعدة الشرائح)") },
          { id: "wrap", label: bi("Wrap around (NumPy uint8)", "التفاف (uint8 في NumPy)") },
        ],
        initial: "saturate",
      },
      points: [bi("An 8-bit (**uint8**) pixel cannot hold 268, so something has to give.", "لا يتسع بكسل بعمق 8 بِتّات (**uint8**) للقيمة 268، فلا بد أن يحدث شيء ما.")],
      pointsFor: {
        saturate: [
          bi("With **clipping**, 268 becomes 255, the largest value an 8-bit pixel can hold, as the slides require.", "مع **القصّ (clipping)** تصبح 268 مساوية 255، وهي أكبر قيمة يتسع لها بكسل بعمق 8 بِتّات، كما تشترط الشرائح."),
        ],
        wrap: [
          bi(
            `NumPy's uint8 **wraps around** modulo 256: 140 + 128 gives ${wrap(140 + 128)} and 200 + 128 gives ${wrap(200 + 128)}, dark pixels where white belongs.`,
            `أما uint8 في NumPy **فيلتفّ (wraps around)** بباقي القسمة على 256: فيعطي 140 + 128 القيمة ${wrap(140 + 128)}، ويعطي 200 + 128 القيمة ${wrap(200 + 128)}، أي بكسلات داكنة حيث يجب أن يكون الأبيض.`,
          ),
          bi("The fix: compute in a wider type, clip with np.clip, then convert back to uint8.", "والحل: احسب بنوع أوسع، ثم قُصّ بالدالة np.clip، ثم أعد التحويل إلى uint8."),
        ],
      },
    },
  ],
});

// ---------- Complements ----------
const NEG = X.map((row) => row.map((v) => complement(v)));
export const complements = defineWalkthrough({
  id: "ip2-complements",
  title: bi("Complements: the photographic negative", "المتمِّم: الصورة السالبة"),
  analogy: bi(
    "A film negative: the darkest part of the scene is the lightest part of the film, and printing the negative gives the photo back.",
    "السالبة في التصوير: أدكن جزء في المشهد هو أفتح جزء في الفيلم، وطباعة السالبة تعيد الصورة نفسها.",
  ),
  facts: {
    "neg-first": NEG[0][0],
    "neg-last": NEG[3][3],
    solar60: solarize(60, "dark"),
  },
  panels: [
    {
      id: "negative",
      pill: bi("y = 255 − x", "y = 255 − x"),
      heading: bi("Dark becomes light, light becomes dark", "يصبح الداكن فاتحًا والفاتح داكنًا"),
      points: [
        bi(`The **complement** y = 255 − x turns the image into its **negative**: 20 becomes ${NEG[0][0]} and 250 becomes ${NEG[3][3]}.`, `**المتمِّم (complement)** y = 255 − x يحوّل الصورة إلى **صورتها السالبة (negative)**: فتصبح 20 مساوية ${NEG[0][0]}، و250 مساوية ${NEG[3][3]}.`),
        bi("Every result stays inside 0–255, so no clipping is ever needed, and applying it twice gives the original back.", "تبقى كل نتيجة داخل المدى 0–255، فلا يلزم القصّ أبدًا، وتطبيقه مرتين يعيد الصورة الأصلية."),
      ],
    },
    {
      id: "types",
      pill: bi("Every image type", "كل أنواع الصور"),
      heading: bi("The complement of every image type", "متمِّم كل أنواع الصور"),
      points: [
        bi("The complement is always the largest value minus x: **255 − x** for an 8-bit image, **1 − x** for an image on a [0, 1] scale, and a swap of 0 and 1 in a **binary** image.", "المتمِّم دائمًا هو أكبر قيمة ناقص x: **255 − x** للصورة ذات 8 بِتّات، و**1 − x** للصورة على المقياس [0, 1]، وتبديل 0 و1 في الصورة **الثنائية (binary)**."),
      ],
    },
    {
      id: "solarize",
      pill: bi("Solarization", "التشميس"),
      heading: bi("Complement only part of the range", "المتمِّم لجزء من المدى فقط"),
      control: {
        label: bi("Complement", "أوجد المتمِّم لـ"),
        options: [
          { id: "dark", label: bi("x ≤ 128", "x ≤ 128") },
          { id: "light", label: bi("x ≥ 128", "x ≥ 128") },
        ],
        initial: "dark",
      },
      points: [bi("Complementing only some grey levels and leaving the others untouched gives the special effect called **solarization**.", "إيجاد المتمِّم لبعض مستويات الرمادي فقط وترك البقية دون تغيير يعطي المؤثر الخاص المسمّى **التشميس (solarization)**.")],
      pointsFor: {
        dark: [
          bi(
            `Only pixels of 128 or less flip: 20 → ${solarize(20, "dark")}, 60 → ${solarize(60, "dark")}, 40 → ${solarize(40, "dark")}, while 140, 180, 200 and the other bright pixels stay.`,
            `لا تنقلب إلا البكسلات التي قيمتها 128 أو أقل: 20 → ${solarize(20, "dark")}، و60 → ${solarize(60, "dark")}، و40 → ${solarize(40, "dark")}، بينما تبقى 140 و180 و200 وبقية البكسلات الساطعة.`,
          ),
        ],
        light: [
          bi(
            `Only pixels of 128 or more flip: 250 → ${solarize(250, "light")}, 200 → ${solarize(200, "light")}. The dark ones stay, so the whole image ends up dark.`,
            `لا تنقلب إلا البكسلات التي قيمتها 128 أو أكثر: 250 → ${solarize(250, "light")}، و200 → ${solarize(200, "light")}. وتبقى الداكنة كما هي، فتصبح الصورة كلها داكنة.`,
          ),
        ],
      },
    },
  ],
});

// ---------- Histograms ----------
const nF = sum(F_HIST);
export const histograms = defineWalkthrough({
  id: "ip2-histograms",
  title: bi("Histograms: how often each grey level occurs", "المدرج التكراري: كم مرة يظهر كل مستوى رمادي"),
  analogy: bi(
    "A class's grade distribution: it tells you how many students got each mark, but not who sat where.",
    "توزيع درجات فصل دراسي: يخبرك بعدد الطلاب الذين حصلوا على كل درجة، لكنه لا يخبرك بمن جلس أين.",
  ),
  facts: {
    hist: list(F_HIST),
    pixels: nF,
  },
  panels: [
    {
      id: "count",
      pill: bi("Counting", "العدّ"),
      heading: bi("One pass over the image", "مرور واحد على الصورة"),
      points: [
        bi("The **histogram** counts how many times each grey level occurs: an array hf with one element per level.", "**المدرج التكراري (histogram)** يعدّ مرات ظهور كل مستوى رمادي: مصفوفة hf فيها عنصر واحد لكل مستوى."),
        bi(`Set every hf[k] to 0, then add 1 to hf[f(x,y)] for each pixel. This 8-level image gives ${list(F_HIST)}.`, `أسنِد الصفر إلى كل hf[k]، ثم أضف 1 إلى hf[f(x,y)] لكل بكسل. وتعطي هذه الصورة ذات المستويات الثمانية ${list(F_HIST)}.`),
      ],
    },
    {
      id: "normalized",
      pill: bi("Normalized", "المُطبَّع"),
      heading: bi("From counts to probabilities", "من الأعداد إلى الاحتمالات"),
      points: [
        bi("Dividing by the number of pixels n gives the **normalized histogram** p(r_k) = n_k / n.", "القسمة على عدد البكسلات n تعطي **المدرج التكراري المُطبَّع (normalized histogram)** p(r_k) = n_k / n."),
        bi(
          `Each value is the probability that a random pixel has that level, so they add up to 1: here ${F_HIST.filter(Boolean).map((k) => `${k}/${nF}`).join(" + ")}.`,
          `كل قيمة هي احتمال أن يكون لبكسل عشوائي ذلك المستوى، لذلك مجموعها 1: وهو هنا ${F_HIST.filter(Boolean).map((k) => `${k}/${nF}`).join(" + ")}.`,
        ),
      ],
    },
    {
      id: "shape",
      pill: bi("Reading the shape", "قراءة الشكل"),
      heading: bi("The shape tells how the image looks", "الشكل يخبرنا بمظهر الصورة"),
      control: {
        label: bi("Image", "الصورة"),
        options: [
          { id: "dark", label: bi("Dark", "داكنة") },
          { id: "light", label: bi("Light", "فاتحة") },
          { id: "low", label: bi("Low contrast", "منخفضة التباين") },
          { id: "high", label: bi("High contrast", "عالية التباين") },
        ],
        initial: "dark",
      },
      points: [bi("A histogram forgets **where** the pixels are, but its shape still shows brightness and contrast at a glance.", "يتجاهل المدرج التكراري **مواضع** البكسلات، لكن شكله يكشف السطوع والتباين بنظرة واحدة.")],
      pointsFor: {
        dark: [bi("A **dark** image has its bars crowded at the low (left) end.", "الصورة **الداكنة** تتكدس أعمدتها عند الطرف المنخفض (الأيسر).")],
        light: [bi("A **light** image has its bars crowded at the high (right) end.", "الصورة **الفاتحة** تتكدس أعمدتها عند الطرف المرتفع (الأيمن).")],
        low: [bi("A **low-contrast** image, dull and washed out, has a narrow cluster, usually in the middle, like pout.tif.", "الصورة **منخفضة التباين (low contrast)**، الباهتة، يكون مدرجها تجمّعًا ضيقًا في المنتصف عادةً، مثل الصورة pout.tif.")],
        high: [bi("A **high-contrast** image has its bars spread over the whole range, roughly evenly.", "الصورة **عالية التباين (high contrast)** تنتشر أعمدتها على المدى كله، بانتظام تقريبًا.")],
      },
    },
  ],
});

// ---------- Histogram (contrast) stretching ----------
const nStretch = sum(STRETCH_HIST);
const nBand = sum(STRETCH_BAND.map((i) => STRETCH_HIST[i]));
const bandOut = STRETCH_BAND.map((i) => STRETCH_MAP[i]);
const POUT = [75, 160] as const;
const pout = (r: number) => round(linearStretch(r, POUT[0], POUT[1]));
export const stretching = defineWalkthrough({
  id: "ip2-stretching",
  title: bi("Contrast stretching", "مط التباين"),
  analogy: bi(
    "Spreading a crowd standing shoulder to shoulder across the whole hall: the same people, now easy to tell apart.",
    "توزيع جمع من الناس يقفون متلاصقين على القاعة كلها: هم الأشخاص أنفسهم، لكن صار التمييز بينهم سهلًا.",
  ),
  facts: {
    pixels: nStretch,
    band: nBand,
    stretched: list(bandOut),
    slope: slopes(STRETCH_POINTS)[1],
  },
  panels: [
    {
      id: "narrow",
      pill: bi("A narrow histogram", "مدرج ضيق"),
      heading: bi("Almost every pixel lies between 5 and 9", "تقع البكسلات كلها تقريبًا بين 5 و9"),
      points: [
        bi(`The slides' image has 16 grey levels and ${nStretch} pixels; ${nBand} of them have levels 5 to 9.`, `في صورة الشرائح 16 مستوى رماديًا و${nStretch} بكسلًا، منها ${nBand} بكسلًا مستوياتها من 5 إلى 9.`),
        bi("Using only 5 of the 16 levels makes the image **low in contrast**: neighbouring shades are hard to tell apart.", "استخدام 5 مستويات فقط من 16 يجعل الصورة **منخفضة التباين (low contrast)**: إذ يصعب التمييز بين الدرجات المتجاورة."),
      ],
    },
    {
      id: "mapping",
      pill: bi("The mapping function", "دالة التعيين"),
      heading: bi("j = 3(i − 5) + 2 sends 5–9 to 2–14", "j = 3(i − 5) + 2 ترسل 5–9 إلى 2–14"),
      points: [
        bi(`The straight line through (5, 2) and (9, 14) has slope (14 − 2)/(9 − 5) = ${slopes(STRETCH_POINTS)[1]}, so j = 3(i − 5) + 2.`, `الخط المستقيم المارّ بالنقطتين (5, 2) و(9, 14) ميله (14 − 2)/(9 − 5) = ${slopes(STRETCH_POINTS)[1]}، إذن j = 3(i − 5) + 2.`),
        bi(`Levels ${STRETCH_BAND.join(", ")} become ${bandOut.join(", ")}. The levels outside the band, 0 and 15, are left alone.`, `تصبح المستويات ${STRETCH_BAND.join("، ")} هي ${bandOut.join("، ")}. أما المستويان خارج النطاق، 0 و15، فيُتركان كما هما.`),
      ],
    },
    {
      id: "result",
      pill: bi("Bars move, heights stay", "الأعمدة تتحرك والارتفاعات ثابتة"),
      heading: bi("The histogram before and after stretching", "المدرج التكراري قبل المط وبعده"),
      points: [
        bi("The five crowded bars are now **three levels apart** instead of one, so neighbouring grey levels are easy to tell apart.", "أصبحت الأعمدة الخمسة المتكدسة **تفصل بينها ثلاثة مستويات** بدلًا من مستوى واحد، فصار التمييز بين المستويات المتجاورة سهلًا."),
        bi("Every bar keeps its **height**: stretching moves bars, it never splits or merges them.", "يحتفظ كل عمود **بارتفاعه**: فالمط ينقل الأعمدة، ولا يقسمها أو يدمجها أبدًا."),
      ],
    },
    {
      id: "general",
      pill: bi("On 8-bit images", "على صور 8 بِتّات"),
      heading: bi("Stretch [r_min, r_max] onto the full range", "مُطّ [r_min, r_max] إلى المدى الكامل"),
      points: [
        bi("Linear stretching maps the occupied range [r_min, r_max] onto a target range, usually [0, 255].", "يحوّل المط الخطي (linear stretching) المدى المستخدم [r_min, r_max] إلى مدى مستهدف، يكون عادةً [0, 255]."),
        bi(
          `pout.tif uses about 75–160: s = (r − 75)/(160 − 75) · 255 sends 75 → ${pout(75)}, 120 → ${pout(120)} and 160 → ${pout(160)}.`,
          `تستخدم الصورة pout.tif المدى 75–160 تقريبًا: فترسل s = (r − 75)/(160 − 75) · 255 القيمة 75 → ${pout(75)}، و120 → ${pout(120)}، و160 → ${pout(160)}.`,
        ),
      ],
    },
    {
      id: "range",
      pill: bi("Stretching a chosen range", "مط مدى مختار"),
      heading: bi("Stretch [a, b] onto [c, d], flat at both ends", "مُطّ [a, b] إلى [c, d]، مع طرفين ثابتين"),
      points: [
        bi("The same stretch on a chosen range, with all values on a [0, 1] scale: values up to a become c, values from b up become d, and a–b maps linearly onto c–d.", "المط نفسه على مدى مختار، مع اعتبار كل القيم على مقياس [0, 1]: فالقيم حتى a تصبح c، والقيم من b فما فوق تصبح d، ويُحوَّل المدى a–b خطيًا إلى المدى c–d."),
        bi("On this scale [0, 1] is the full range, so pout.tif is stretched from [a, b] = [75, 160]/255 onto [c, d] = [0, 1].", "وعلى هذا المقياس يمثّل [0, 1] المدى الكامل، لذلك تُمطّ الصورة pout.tif من [a, b] = [75, 160]/255 إلى [c, d] = [0, 1]."),
      ],
    },
  ],
});

// ---------- Gamma correction ----------
const TIRE_DARK = [12, 20, 30, 40];
export const gamma = defineWalkthrough({
  id: "ip2-gamma",
  title: bi("Gamma correction", "تصحيح غاما"),
  analogy: bi(
    "Adjusting the mid-tones of a photo: black stays black and white stays white, but everything in between is bent lighter or darker.",
    "ضبط الدرجات المتوسطة في صورة فوتوغرافية: يبقى الأسود أسود والأبيض أبيض، لكن كل ما بينهما ينحني نحو الفاتح أو الداكن.",
  ),
  facts: {
    half: list(GAMMA_XS.map((x) => gamma8(x, 0.5))),
    square: list(GAMMA_XS.map((x) => gamma8(x, 2))),
  },
  panels: [
    {
      id: "curves",
      pill: bi("The gamma curve", "منحنى غاما"),
      heading: bi("y = 255 · (x / 255)^γ", "y = 255 · (x / 255)^γ"),
      control: {
        label: bi("Gamma", "غاما"),
        options: [
          { id: "g05", label: bi("γ = 0.5", "γ = 0.5") },
          { id: "g1", label: bi("γ = 1", "γ = 1") },
          { id: "g2", label: bi("γ = 2", "γ = 2") },
        ],
        initial: "g05",
      },
      points: [bi("**Gamma** replaces the straight stretch with a power curve. Black (0) and white (255) never move.", "تستبدل **غاما (gamma)** بالمط المستقيم منحنى قوة (power-law)، ولا يتحرك الأسود (0) ولا الأبيض (255) أبدًا.")],
      pointsFor: {
        g05: [bi(`γ < 1 bends the curve **upward**: dark values are lifted the most and the image gets **brighter** (64 → ${gamma8(64, 0.5)}).`, `غاما الأقل من 1 تجعل المنحنى ينحني **إلى أعلى**: فتُرفع القيم الداكنة أكثر من غيرها وتصبح الصورة **أكثر سطوعًا** (64 → ${gamma8(64, 0.5)}).`)],
        g1: [bi("γ = 1 is the plain linear stretch: on the full range every value stays where it is.", "غاما = 1 هي المط الخطي العادي: فعلى المدى الكامل تبقى كل قيمة في مكانها.")],
        g2: [bi(`γ > 1 bends the curve **downward**: the image gets **darker** (64 → ${gamma8(64, 2)}) and the bright tones are spread apart.`, `غاما الأكبر من 1 تجعل المنحنى ينحني **إلى أسفل**: فتصبح الصورة **أدكن** (64 → ${gamma8(64, 2)})، وتتباعد الدرجات الساطعة.`)],
      },
    },
    {
      id: "dark-range",
      pill: bi("Where the levels go", "أين تذهب المستويات"),
      heading: bi("Nine evenly spaced greys through the curve", "تسعة مستويات رمادية متساوية التباعد عبر المنحنى"),
      control: {
        label: bi("Gamma", "غاما"),
        options: [
          { id: "g05", label: bi("γ = 0.5", "γ = 0.5") },
          { id: "g2", label: bi("γ = 2", "γ = 2") },
        ],
        initial: "g05",
      },
      points: [bi("Follow each grey through the curve and see how far apart they land: that spacing is the contrast in each range.", "تتبّع كل مستوى رمادي عبر المنحنى، وانظر كم تتباعد المستويات حيث تقع: فهذا التباعد هو التباين في كل مدى.")],
      pointsFor: {
        g05: [bi(`With γ = 0.5 the dark range 0–64 now spans 0–${gamma8(64, 0.5)}: twice as many output levels, so detail in the **shadows** shows.`, `مع γ = 0.5 أصبح المدى الداكن 0–64 يشغل 0–${gamma8(64, 0.5)}: أي ضعف عدد مستويات المخرجات، فتظهر التفاصيل في **الظلال**.`)],
        g2: [bi(`With γ = 2 the same range is squeezed into 0–${gamma8(64, 2)}, while the bright half 128–255 now spans ${gamma8(128, 2)}–255.`, `مع γ = 2 ينضغط المدى نفسه في 0–${gamma8(64, 2)}، بينما يشغل النصف الساطع 128–255 الآن المدى ${gamma8(128, 2)}–255.`)],
      },
    },
    {
      id: "tire",
      pill: bi("Brightening the tire", "زيادة سطوع الإطار"),
      heading: bi("γ = 0.5 on the dark tire", "γ = 0.5 على الإطار الداكن"),
      points: [
        bi("On a chosen range [a, b] → [c, d], gamma bends the straight stretch into y = ((x − a)/(b − a))^γ · (d − c) + c. The tire uses the full range.", "على مدى مختار [a, b] → [c, d] تحني غاما المط المستقيم إلى y = ((x − a)/(b − a))^γ · (d − c) + c. وتستخدم صورة الإطار المدى الكامل."),
        bi(
          `With γ = 0.5, the near-black values ${TIRE_DARK.join(", ")} become ${TIRE_DARK.map((v) => gamma8(v, 0.5)).join(", ")}: the gaps grow, and detail in the dark rubber appears.`,
          `مع γ = 0.5 تصبح القيم شبه السوداء ${TIRE_DARK.join("، ")} هي ${TIRE_DARK.map((v) => gamma8(v, 0.5)).join("، ")}: فتتسع الفجوات، وتظهر التفاصيل في المطاط الداكن.`,
        ),
      ],
    },
    {
      id: "large",
      pill: bi("Large gammas", "قيم غاما الكبيرة"),
      heading: bi("γ = 6, 8, 10: only the brightest areas survive", "γ = 6 و8 و10: لا يبقى إلا أسطع المناطق"),
      control: {
        label: bi("Gamma", "غاما"),
        options: [
          { id: "g6", label: bi("γ = 6", "γ = 6") },
          { id: "g8", label: bi("γ = 8", "γ = 8") },
          { id: "g10", label: bi("γ = 10", "γ = 10") },
        ],
        initial: "g6",
      },
      points: [
        bi("The slides correct a portrait with γ = 10, 8 and 6: the larger γ is, the more of the mid-tones are pushed toward **black**.", "تصحّح الشرائح صورة شخصية بقيم غاما 10 و8 و6: فكلما كبرت γ دُفع مزيد من الدرجات المتوسطة (mid-tones) نحو **الأسود**."),
        bi("The general power law s = c·r^γ follows the same rule, and the same correction adjusts images for display on **monitors**.", "ويتبع قانون القوة العام s = c·r^γ القاعدة نفسها، ويُستخدم التصحيح نفسه لضبط الصور لعرضها على **الشاشات (monitors)**."),
      ],
      pointsFor: {
        g6: [bi(`With γ = 6, 192 drops to ${gamma8(192, 6)} and 128 to ${gamma8(128, 6)}.`, `مع γ = 6 تنخفض 192 إلى ${gamma8(192, 6)}، و128 إلى ${gamma8(128, 6)}.`)],
        g8: [bi(`With γ = 8, 192 drops to ${gamma8(192, 8)} and 128 to ${gamma8(128, 8)}.`, `مع γ = 8 تنخفض 192 إلى ${gamma8(192, 8)}، و128 إلى ${gamma8(128, 8)}.`)],
        g10: [bi(`With γ = 10, 192 drops to ${gamma8(192, 10)} and 128 to ${gamma8(128, 10)}.`, `مع γ = 10 تنخفض 192 إلى ${gamma8(192, 10)}، و128 إلى ${gamma8(128, 10)}.`)],
      },
    },
  ],
});

// ---------- Piecewise linear stretching ----------
const [s1, s2, s3] = slopes(STRETCH_POINTS).map(fmt2);
export const piecewiseWt = defineWalkthrough({
  id: "ip2-piecewise",
  title: bi("Piecewise linear stretching", "المط الخطي المجزأ"),
  analogy: bi(
    "A map where each region gets its own scale: the busy city centre is drawn large and the empty desert small.",
    "خريطة لكل منطقة فيها مقياسها الخاص: يُرسم وسط المدينة المزدحم كبيرًا، وتُرسم الصحراء الخالية صغيرة.",
  ),
  facts: {
    a: list(PW_STRETCH.map((p) => p[0])),
    b: list(PW_STRETCH.map((p) => p[1])),
    "slope-mid": slopes(STRETCH_POINTS)[1],
  },
  panels: [
    {
      id: "pieces",
      pill: bi("Steep and shallow pieces", "قطع شديدة الميل وقليلة الميل"),
      heading: bi("Straight pieces through chosen points", "قطع مستقيمة تمر بنقاط مختارة"),
      control: {
        label: bi("Middle piece", "القطعة الوسطى"),
        options: [
          { id: "stretch", label: bi("Steep", "شديدة الميل") },
          { id: "compress", label: bi("Shallow", "قليلة الميل") },
        ],
        initial: "stretch",
      },
      points: [bi("Between two neighbouring breakpoints (a_i, b_i) the function is a straight line, so each piece has its own **slope**.", "بين كل نقطتي انكسار متجاورتين (a_i, b_i) تكون الدالة خطًا مستقيمًا، فلكل قطعة **ميلها (slope)** الخاص.")],
      pointsFor: {
        stretch: [
          bi(
            `A **steep** piece (slope > 1) spreads its grey levels apart and raises contrast: 64–192 becomes ${pw8(PW_STRETCH, 64)}–${pw8(PW_STRETCH, 192)}.`,
            `القطعة **شديدة الميل** (ميلها أكبر من 1) تباعد بين مستويات الرمادي فيها وترفع التباين: فيصبح المدى 64–192 هو ${pw8(PW_STRETCH, 64)}–${pw8(PW_STRETCH, 192)}.`,
          ),
        ],
        compress: [
          bi(
            `A **shallow** piece (slope < 1) squeezes them together: 64–192 becomes ${pw8(PW_COMPRESS, 64)}–${pw8(PW_COMPRESS, 192)}, and the contrast goes to the ends instead.`,
            `القطعة **قليلة الميل** (ميلها أقل من 1) تقارب بينها: فيصبح المدى 64–192 هو ${pw8(PW_COMPRESS, 64)}–${pw8(PW_COMPRESS, 192)}، ويذهب التباين إلى الطرفين بدلًا من ذلك.`,
          ),
        ],
      },
    },
    {
      id: "example16",
      pill: bi("The slides' stretch", "مط الشرائح"),
      heading: bi("Steep where the pixels are", "شديدة الميل حيث توجد البكسلات"),
      points: [
        bi("The 16-level stretching function is piecewise linear, through (0, 0), (5, 2), (9, 14) and (15, 15).", "دالة المط في مثال المستويات الستة عشر دالة خطية مجزأة (piecewise-linear) تمر بالنقاط (0, 0) و(5, 2) و(9, 14) و(15, 15)."),
        bi(`Its slopes are ${s1}, ${s2} and ${s3}: steep in the middle, where the pixels are, and shallow at the ends, where there are almost none.`, `ومَيولها ${s1} و${s2} و${s3}: شديدة الميل في المنتصف حيث توجد البكسلات، وقليلة الميل عند الطرفين حيث لا يكاد يوجد شيء.`),
      ],
    },
    {
      id: "lut",
      pill: bi("In code", "في الشيفرة"),
      heading: bi("Interpolation builds the lookup table", "الاستيفاء (interpolation) يبني جدول البحث"),
      points: [
        bi("With breakpoints a = [0, 64, 192, 255] and b = [0, 20, 235, 255], np.interp(range(256), a, b) gives y for all 256 levels at once; rounded, that is the lookup table.", "بنقاط الانكسار a = [0, 64, 192, 255] و b = [0, 20, 235, 255] تعطي np.interp(range(256), a, b) قيمة y للمستويات الـ 256 كلها دفعة واحدة؛ وبعد التقريب يكون هذا هو جدول البحث."),
        bi("Each pixel is then looked up with lut[img], one table read per pixel. Calling np.interp on the image itself, as piecewise.py does, gives the same result.", "ثم يُبحث عن كل بكسل بـ lut[img]، بقراءة واحدة من الجدول لكل بكسل. واستدعاء np.interp على الصورة نفسها، كما في piecewise.py، يعطي النتيجة نفسها."),
      ],
    },
  ],
});

// ---------- Histogram equalization ----------
const usedEq = EQ_USED.map((i) => EQ.map[i]);
const usedSmall = F_USED.map((i) => EQ_SMALL.map[i]);
const usedLinear = F_USED.map((i) => LINEAR_SMALL[i]);
const busy = F_HIST[3] + F_HIST[4];
const gaps = (xs: readonly number[]) => xs.slice(1).map((v, i) => v - xs[i]);
export const equalization = defineWalkthrough({
  id: "ip2-equalization",
  title: bi("Histogram equalization", "تسوية المدرج التكراري"),
  analogy: bi(
    "Grading on a curve: each mark is replaced by the share of the class that scored at or below it, so crowded marks are spread out.",
    "التقدير وفق المنحنى: تُستبدل بكل درجة نسبة طلاب الفصل الذين حصلوا عليها أو على أقل منها، فتتباعد الدرجات المزدحمة.",
  ),
  facts: {
    scaled9: fmt2(EQ.scaled[9]),
    j9: EQ.map[9],
    levels: list(usedEq),
    "small-map": list(usedSmall),
    "linear-map": list(usedLinear),
    "g-row1": list(G[0]),
  },
  panels: [
    {
      id: "idea",
      pill: bi("The goal", "الهدف"),
      heading: bi("Automatic: aim for a flat histogram", "آلية: الهدف مدرج مسطّح"),
      points: [
        bi("Stretching needs **user input**: a, b, γ or breakpoints. **Histogram equalization** is entirely **automatic**.", "يحتاج المط إلى **مدخلات من المستخدم**: a أو b أو γ أو نقاط الانكسار. أما **تسوية المدرج التكراري (histogram equalization)** فآلية **بالكامل**."),
        bi("The aim is a **uniform** histogram, with every grey level occurring equally often. In practice this is generally not possible exactly.", "والهدف مدرج **منتظم (uniform)** يظهر فيه كل مستوى رمادي بالتكرار نفسه، وهذا غير ممكن بدقة في التطبيق عمومًا."),
      ],
    },
    {
      id: "cdf",
      pill: bi("The cumulative histogram", "المدرج التراكمي"),
      heading: bi("j = round((L − 1) · CDF(i))", "j = round((L − 1) · CDF(i))"),
      points: [
        bi("Each level i goes through the **cumulative histogram** (pixels with level i or less), scaled to 0…L − 1 and rounded: j = (L − 1)·CDF(i).", "يمرّ كل مستوى i عبر **المدرج التكراري التراكمي (cumulative histogram)** (البكسلات ذات المستوى i أو أقل)، بعد تحجيمه إلى 0…L − 1 وتقريبه: j = (L − 1)·CDF(i)."),
        bi("Where bars are tall the curve climbs steeply and pushes crowded levels **apart**; where they are low it stays flat and squeezes rare levels **together**.", "حيث تكون الأعمدة طويلة يرتفع المنحنى بحدة فيُباعد بين المستويات المزدحمة؛ وحيث تكون قصيرة يبقى مسطّحًا فيُقارب بين المستويات النادرة."),
      ],
    },
    {
      id: "table",
      pill: bi("The slides' example", "مثال الشرائح"),
      heading: bi(`16 levels, ${EQ.n} pixels: multiply by 15/${EQ.n} = 1/24`, `16 مستوى و${EQ.n} بكسلًا: اضرب في 15/${EQ.n} = 1/24`),
      points: [
        bi(
          `Add the n_i up, divide by 24 and round. Level 9: ${EQ.cum[9]}/24 = ${fmt2(EQ.scaled[9])}, which rounds to ${EQ.map[9]}.`,
          `اجمع قيم n_i تراكميًا، ثم اقسم على 24 وقرّب. المستوى 9: ${EQ.cum[9]}/24 = ${fmt2(EQ.scaled[9])}، وتقريبها ${EQ.map[9]}.`,
        ),
        bi(`The slide prints 3.65 for level 9; the correct value is ${fmt2(EQ.scaled[9])}, which still rounds to ${EQ.map[9]}.`, `تطبع الشريحة القيمة 3.65 للمستوى 9، والقيمة الصحيحة ${fmt2(EQ.scaled[9])}، وتقريبها لا يزال ${EQ.map[9]}.`),
      ],
    },
    {
      id: "result",
      pill: bi("Before and after", "قبل وبعد"),
      heading: bi("The cluster 9–13 now covers 1–15", "التجمّع 9–13 يغطي الآن 1–15"),
      points: [
        bi(`The bars land at ${usedEq.join(", ")}, spread across almost the whole range.`, `تقع الأعمدة عند ${usedEq.join(" و")}، منتشرةً على المدى كله تقريبًا.`),
        bi("They keep their heights, so the result is **not perfectly flat**: bars can be spread apart or merged, but never split.", "وتحتفظ الأعمدة بارتفاعاتها، لذلك لا تكون النتيجة **مسطّحة تمامًا**: فقد تتباعد الأعمدة أو تندمج، لكنها لا تنقسم أبدًا."),
      ],
    },
    {
      id: "small",
      pill: bi("Image to image", "من صورة إلى صورة"),
      heading: bi("Equalize a 4 × 4 image with 8 levels", "تسوية صورة 4 × 4 ذات 8 مستويات"),
      control: {
        label: bi("Show", "اعرض"),
        options: [
          { id: "image", label: bi("Images", "الصورتين") },
          { id: "hist", label: bi("Histograms", "المدرجين التكراريين") },
        ],
        initial: "image",
      },
      points: [
        bi(
          `Here L = 8 and n = ${EQ_SMALL.n}, so each cumulative sum is multiplied by 7/16 and rounded: ${F_USED.map((r, k) => `${r} → ${usedSmall[k]}`).join(", ")}.`,
          `هنا L = 8 و n = ${EQ_SMALL.n}، لذلك يُضرب كل مجموع تراكمي في 7/16 ويُقرَّب: ${F_USED.map((r, k) => `${r} → ${usedSmall[k]}`).join("، ")}.`,
        ),
      ],
      pointsFor: {
        image: [bi("The mapping is a lookup table: every pixel of f is replaced by its new level, as lut[img] does in Python.", "التحويل جدول بحث: يُستبدل بكل بكسل في f مستواه الجديد، كما تفعل lut[img] في Python.")],
        hist: [
          bi(
            `The four bars move to ${usedSmall.join(", ")} with their heights ${F_USED.map((r) => F_HIST[r]).join(", ")} unchanged.`,
            `تنتقل الأعمدة الأربعة إلى ${usedSmall.join(" و")}، وتبقى ارتفاعاتها ${F_USED.map((r) => F_HIST[r]).join(" و")} دون تغيير.`,
          ),
        ],
      },
    },
    {
      id: "compare",
      pill: bi("Stretching or equalization?", "المط أم التسوية؟"),
      heading: bi("Same image, two mappings", "الصورة نفسها، وتحويلان"),
      control: {
        label: bi("Method", "الطريقة"),
        options: [
          { id: "stretch", label: bi("Linear stretching", "المط الخطي") },
          { id: "equalize", label: bi("Equalization", "التسوية") },
        ],
        initial: "stretch",
      },
      points: [bi("Both spread the occupied levels 2–5 over the 8-level range, but they space them differently.", "كلتاهما تنشر المستويات المستخدمة 2–5 على المدى ذي المستويات الثمانية، لكنهما تباعدان بينها بطريقة مختلفة.")],
      pointsFor: {
        stretch: [
          bi(
            `Linear stretching s = 7(r − 2)/3 gives ${F_USED.map((r, k) => `${r} → ${usedLinear[k]}`).join(", ")}: steps of about 2.3, whatever the bar heights.`,
            `المط الخطي s = 7(r − 2)/3 يعطي ${F_USED.map((r, k) => `${r} → ${usedLinear[k]}`).join("، ")}: أي خطوات تقارب 2.3، أيًّا كانت ارتفاعات الأعمدة.`,
          ),
        ],
        equalize: [
          bi(
            `Equalization gives the busy levels 3 and 4 (${busy} of the ${EQ_SMALL.n} pixels) the biggest gaps, ${gaps(usedSmall).slice(0, 2).join(" and ")}, and the rare level 5 a gap of ${gaps(usedSmall)[2]}.`,
            `أما التسوية فتعطي المستويين المزدحمين 3 و4 (${busy} بكسلًا من ${EQ_SMALL.n}) أكبر الفجوات، ${gaps(usedSmall).slice(0, 2).join(" و")}، وتعطي المستوى النادر 5 فجوة قدرها ${gaps(usedSmall)[2]}.`,
          ),
        ],
      },
    },
  ],
});

/** Every walkthrough in this lecture, registered in lib/walkthroughs/index.ts. */
export const all = [classes, pointOps, arithmetic, complements, histograms, stretching, gamma, piecewiseWt, equalization] as const;

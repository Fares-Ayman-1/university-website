import { bi } from "@/components/widgets/types";
import { defineWalkthrough } from "@/lib/widgets/walkthrough";
import {
  argDeg,
  BOX_HALF,
  boxWidth,
  centredSignal,
  circTerms,
  CONSTANT,
  CONV_LIN,
  CONV_X,
  CONV_Y,
  CONV_Z,
  COST_SIZE,
  dft,
  dftOps,
  dftTerms,
  directPerPixel,
  fftPerPixel,
  fmtC,
  fmtList,
  fmtNum,
  GAUSS_SIGMA,
  gaussian,
  halfWidth,
  idft,
  IMPULSE,
  MATLAB_B,
  naiveArgDeg,
  overshoot,
  PAIR_N,
  pretty,
  SHIFT_X1F,
  SHIFT_XF,
  showC,
  STRIPE_CYCLES,
  sumText,
  THEOREM_X,
  THEOREM_XY,
  THEOREM_Y,
  THEOREM_Z,
  WORKED,
  WORKED_F,
  WORKED_SUMS,
  abs,
  circShift,
} from "@/lib/widgets/ip-lecture-05";

/*
 * Image Processing · Lecture 5 (content/subjects/image-processing/lectures/05-fourier-transform.mdx).
 * One walkthrough per heading; the scenes are in
 * components/widgets/walkthrough/scenes/image-processing/lecture-05/. Every number the
 * points quote is computed in lib/widgets/ip-lecture-05.ts, the same code the scenes draw.
 */

const list = (xs: readonly number[]) => pretty(fmtList(xs));
const clist = (cs: Parameters<typeof showC>[0][]) => `[${cs.map((c) => showC(c)).join(", ")}]`;
const N4 = WORKED.length;

// ---------- Why the Fourier transform? ----------
export const why = defineWalkthrough({
  id: "ip5-why",
  title: bi("From pixels to frequencies", "من البكسلات إلى الترددات"),
  analogy: bi(
    "A prism. White light goes in and comes out as the colours it is made of; nothing is lost, and a second prism can join them back into white light.",
    "منشور زجاجي: يدخله الضوء الأبيض فيخرج على هيئة الألوان التي يتكوّن منها، ولا يضيع منه شيء، ويستطيع منشور ثانٍ أن يجمعها ضوءًا أبيض من جديد.",
  ),
  panels: [
    {
      id: "decompose",
      pill: bi("Signal → frequencies", "من الإشارة إلى الترددات"),
      heading: bi("A signal is a sum of sinusoids", "الإشارة مجموع دوال جيبية"),
      points: [
        bi(
          "The Fourier transform **decomposes a signal into sinusoidal components**: here, three sine waves of different frequencies and amplitudes.",
          "يُفكّك تحويل فورييه (Fourier transform) **الإشارةَ إلى مركبات جيبية (sinusoidal components)**: وهي هنا ثلاث موجات جيبية بترددات وسعات مختلفة.",
        ),
        bi(
          "In the **frequency domain** the same signal is three spikes: a spike's position is a frequency, its height that wave's amplitude.",
          "وفي **المجال الترددي (frequency domain)** تصبح الإشارة نفسها ثلاث نبضات: موضع النبضة تردد، وارتفاعها سعة تلك الموجة.",
        ),
      ],
    },
    {
      id: "image",
      pill: bi("Images too", "والصور كذلك"),
      heading: bi("Each point of the Fourier image is one frequency", "كل نقطة في صورة فورييه تردد واحد"),
      control: {
        label: bi("Stripes", "الخطوط"),
        options: [
          { id: "wide", label: bi(`Wide (${STRIPE_CYCLES.wide} cycle)`, `عريضة (دورة واحدة)`) },
          { id: "narrow", label: bi(`Narrow (${STRIPE_CYCLES.narrow} cycles)`, `ضيقة (${STRIPE_CYCLES.narrow} دورات)`) },
        ],
        initial: "wide",
      },
      points: [
        bi(
          "For an image the input is the picture in **spatial** space and the output is **frequency** space: each point stands for one frequency contained in the original.",
          "في حالة الصورة يكون الدخل هو الصورة في الفضاء **المكاني (spatial)**، ويكون الخرج فضاء **الترددات (frequency)**: فكل نقطة تمثّل ترددًا واحدًا موجودًا في الأصل.",
        ),
      ],
      pointsFor: {
        wide: [
          bi(
            "Wide stripes repeat **once** across the image, so besides the bright centre (the average) the spectrum has two dots right next to it.",
            "تتكرر الخطوط العريضة **مرة واحدة** عبر الصورة، لذا يظهر في الطيف (spectrum)، إلى جانب المركز الساطع (المتوسط)، نقطتان ملاصقتان له.",
          ),
        ],
        narrow: [
          bi(
            `Narrow stripes repeat **${STRIPE_CYCLES.narrow} times**: a higher frequency, so the two dots move **away from the centre**.`,
            `تتكرر الخطوط الضيقة **${STRIPE_CYCLES.narrow} مرات**: وهذا تردد أعلى، لذا تبتعد النقطتان **عن المركز**.`,
          ),
        ],
      },
    },
    {
      id: "isolate",
      pill: bi("Keep or remove frequencies", "إبقاء الترددات أو إزالتها"),
      heading: bi("Low-pass and high-pass, with precision", "تمرير منخفض وتمرير مرتفع بدقة"),
      control: {
        label: bi("Keep", "أبقِ"),
        options: [
          { id: "low", label: bi("Low frequencies", "الترددات المنخفضة") },
          { id: "high", label: bi("High frequencies", "الترددات المرتفعة") },
        ],
        initial: "low",
      },
      points: [
        bi(
          "In the frequency domain we can **pick** frequencies: keep some coefficients, set the rest to zero and transform back. For a **large** filter this is also faster than filtering in space.",
          "في المجال الترددي يمكننا **انتقاء** الترددات: نُبقي بعض المعاملات (coefficients)، ونجعل الباقي أصفارًا، ثم نعود بالتحويل العكسي. ومع المرشح **الكبير** يكون هذا أيضًا أسرع من الترشيح المكاني (spatial filtering).",
        ),
      ],
      pointsFor: {
        low: [bi("**Low-pass**: only the slow waves survive, so the result is the smooth outline of the signal.", "**التمرير المنخفض (low-pass)**: لا يبقى إلا الموجات البطيئة، فتكون النتيجة الشكل العام الأملس للإشارة.")],
        high: [bi("**High-pass**: only the fast ripples survive, the fine detail that edges are made of.", "**التمرير المرتفع (high-pass)**: لا يبقى إلا التموجات السريعة، أي التفاصيل الدقيقة التي تتكون منها الحواف.")],
      },
    },
  ],
});

// ---------- Intuition: sums of sines ----------
const gibbs = Math.round(overshoot(10) * 100);

export const sines = defineWalkthrough({
  id: "ip5-sines",
  title: bi("Building signals from sines", "بناء الإشارات من الدوال الجيبية"),
  analogy: bi(
    "Chords on a piano. A few notes played together make a rich sound, and the more notes you add, the more closely you can imitate any sound at all.",
    "الأوتار على البيانو: بضع نغمات تُعزف معًا تصنع صوتًا غنيًا، وكلما أضفت نغمات أكثر استطعت محاكاة أي صوت بدقة أكبر.",
  ),
  panels: [
    {
      id: "three",
      pill: bi("Three sines", "ثلاث دوال جيبية"),
      heading: bi("f(x) = sin x + (1/3) sin 2x + (1/5) sin 4x", "f(x) = sin x + (1/3) sin 2x + (1/5) sin 4x"),
      points: [
        bi(
          "A **periodic function** can be written as a sum of sines and cosines of different **amplitudes** and **frequencies**.",
          "يمكن كتابة **الدالة الدورية (periodic function)** على هيئة مجموع لدوال جيب وجيب تمام بـ**سعات (amplitudes)** و**ترددات (frequencies)** مختلفة.",
        ),
        bi("This wavy curve needs only **three** terms: frequencies 1, 2 and 4, with amplitudes 1, 1/3 and 1/5.", "هذا المنحنى المتموج لا يحتاج إلا إلى **ثلاثة** حدود: الترددات 1 و 2 و 4، بالسعات 1 و 1/3 و 1/5."),
      ],
    },
    {
      id: "square",
      pill: bi("A square wave", "الموجة المربعة"),
      heading: bi("Adding the odd harmonics one by one", "إضافة التوافقيات الفردية واحدة تلو الأخرى"),
      control: {
        label: bi("Terms", "عدد الحدود"),
        options: [
          { id: "1", label: bi("1 term", "حد واحد") },
          { id: "2", label: bi("2 terms", "حدّان") },
          { id: "4", label: bi("4 terms", "4 حدود") },
          { id: "10", label: bi("10 terms", "10 حدود") },
        ],
        initial: "1",
      },
      points: [
        bi(
          "A **square wave** needs infinitely many terms, sin x + (1/3) sin 3x + (1/5) sin 5x + …, and every extra term sharpens the corners.",
          "تحتاج **الموجة المربعة (square wave)** إلى عدد لا نهائي من الحدود، sin x + (1/3) sin 3x + (1/5) sin 5x + …، وكل حد إضافي يجعل زواياها أحدّ.",
        ),
        bi("As written, the series levels off at **π/4 ≈ 0.785**; multiplied by 4/π it is a square wave of height 1.", "تستقر المتسلسلة كما هي مكتوبة عند **π/4 ≈ 0.785**؛ وبضربها في 4/π تصبح موجة مربعة ارتفاعها 1."),
      ],
      pointsFor: {
        "1": [bi("One sine is only a rough outline: the flat tops and the sudden jumps are missing.", "دالة جيبية واحدة ليست إلا تقريبًا خشنًا: فالقمم المستوية والقفزات المفاجئة غائبة.")],
        "2": [bi("Adding (1/3) sin 3x flattens the tops and steepens the sides.", "إضافة (1/3) sin 3x تجعل القمم أكثر استواءً والجانبين أشد انحدارًا.")],
        "4": [bi("With four terms (the slide's picture) the shape is clearly square, with small ripples on top.", "مع أربعة حدود (صورة الشريحة) يصبح الشكل مربعًا بوضوح، مع تموجات صغيرة على قمته.")],
        "10": [
          bi(
            `With ten terms the ripples are narrow, but next to each jump the sum still overshoots by about **${gibbs} %** of the jump: the **Gibbs effect**, which more terms only squeeze closer to the jump.`,
            `مع عشرة حدود تضيق التموجات، لكن المجموع يظل يتجاوز المستوى بجوار كل قفزة بنحو **${gibbs} %** من حجم القفزة: إنها **ظاهرة Gibbs (Gibbs effect)**، ولا تفعل الحدود الإضافية سوى حصرها أقرب إلى القفزة.`,
          ),
        ],
      },
    },
    {
      id: "edges",
      pill: bi("Edges vs smooth areas", "الحواف مقابل المناطق الملساء"),
      heading: bi("Sharp edges need high frequencies", "الحواف الحادة تحتاج إلى ترددات مرتفعة"),
      control: {
        label: bi("Image row", "صف الصورة"),
        options: [
          { id: "edge", label: bi("A sharp edge", "حافة حادة") },
          { id: "smooth", label: bi("A smooth area", "منطقة ملساء") },
        ],
        initial: "edge",
      },
      points: [bi("Sharp edges are like the square wave's corners: they need many **high-frequency** terms.", "الحواف الحادة تشبه زوايا الموجة المربعة: فهي تحتاج إلى حدود كثيرة ذات **تردد مرتفع (high frequency)**.")],
      pointsFor: {
        edge: [bi("A jump from dark to bright spreads its energy over **many** frequencies, falling off only slowly.", "القفزة من الداكن إلى الساطع تنشر طاقتها على ترددات **كثيرة**، ولا تتناقص إلا ببطء.")],
        smooth: [bi("A gentle change is described by **one low-frequency** term; every higher bar is empty.", "التغيّر الهادئ يصفه **حد واحد ذو تردد منخفض (low frequency)**، أما الأعمدة الأعلى ترددًا فكلها خالية.")],
      },
    },
  ],
});

// ---------- The 1-D continuous Fourier transform ----------
export const continuous = defineWalkthrough({
  id: "ip5-continuous",
  title: bi("The continuous Fourier transform", "تحويل فورييه المتصل"),
  analogy: bi(
    "A radio tuner. Turning the dial to frequency u picks out how strongly that one station is on the air, and ignores all the others.",
    "موالف الراديو: إدارة المؤشر إلى التردد u تلتقط مدى قوة بث تلك المحطة وحدها، وتتجاهل المحطات الأخرى كلها.",
  ),
  panels: [
    {
      id: "pair",
      pill: bi("Forward and inverse", "الأمامي والعكسي"),
      heading: bi("Two formulas, one sign apart", "صيغتان تختلفان في الإشارة"),
      points: [
        bi(
          "The **Fourier transform** goes from f(x) to F(u) with a **minus** sign in the exponent; the **inverse** comes back with a **plus**.",
          "ينتقل **تحويل فورييه (Fourier transform)** من f(x) إلى F(u) بإشارة **سالبة** في الأُس، ويعود **التحويل العكسي (inverse)** بإشارة **موجبة**.",
        ),
        bi("Nothing is lost on the way: F(u) holds the same information as f(x), seen as frequencies.", "لا يضيع شيء في الطريق: تحمل F(u) المعلومات نفسها التي تحملها f(x)، ولكن في صورة ترددات."),
      ],
    },
    {
      id: "anatomy",
      pill: bi("Read the formula", "قراءة الصيغة"),
      heading: bi("f(x) is a weighted sum of periodic patterns", "الدالة f(x) مجموع موزون لأنماط دورية"),
      points: [
        bi(
          "The inverse transform rebuilds f(x) as a **linear combination** of simple periodic patterns e^(i2πxu), one for every frequency u.",
          "يعيد التحويل العكسي بناء f(x) على هيئة **تركيب خطي (linear combination)** من أنماط دورية بسيطة e^(i2πxu)، نمط لكل تردد u.",
        ),
        bi(
          "**F(u)** is the weight of each pattern, x is the image coordinate, and u is the **spatial frequency**, in whole cycles per unit of x.",
          "**F(u)** هو وزن كل نمط، و x إحداثي الصورة، و u هو **التردد المكاني (spatial frequency)** مقيسًا بالدورات الكاملة لكل وحدة من x.",
        ),
      ],
    },
    {
      id: "euler",
      pill: bi("Euler's formula", "صيغة أويلر"),
      heading: bi("e^(iθ) = cos θ + i sin θ", "e^(iθ) = cos θ + i sin θ"),
      control: {
        label: bi("Angle θ", "الزاوية θ"),
        options: [
          { id: "45", label: bi("45°", "45°") },
          { id: "135", label: bi("135°", "135°") },
          { id: "270", label: bi("270°", "270°") },
        ],
        initial: "45",
      },
      points: [
        bi(
          "By **Euler's formula** each pattern is a cosine plus i times a sine: a point going round the **unit circle** as θ grows.",
          "بحسب **صيغة أويلر (Euler's formula)** يكون كل نمط جيب تمام مضافًا إليه i مضروبًا في جيب: أي نقطة تدور على **دائرة الوحدة (unit circle)** كلما زادت θ.",
        ),
        bi("So F(u) is in general a **complex** number, with a real (cosine) part and an imaginary (sine) part.", "لذا فإن F(u) في العموم **عدد مركب (complex)**، له جزء حقيقي (جيب التمام) وجزء تخيلي (الجيب)."),
      ],
      pointsFor: {
        "270": [bi("At θ = 270° the point is at **−i**: the value ω takes in a 4-point DFT.", "عند θ = 270° تقع النقطة عند **−i**: وهي القيمة التي تأخذها ω في تحويل DFT ذي النقاط الأربع.")],
      },
    },
    {
      id: "measure",
      pill: bi("How F(u) is measured", "كيف تُقاس F(u)"),
      heading: bi("Multiply by a pattern, then add up", "اضرب في نمط، ثم اجمع"),
      control: {
        label: bi("Test frequency", "تردد الاختبار"),
        options: [
          { id: "2", label: bi("u = 2", "u = 2") },
          { id: "3", label: bi("u = 3", "u = 3") },
        ],
        initial: "2",
      },
      points: [
        bi(
          "F(u) = ∫ f(x)·e^(−i2πxu) dx multiplies f by the pattern of frequency u and adds up the result. Here f(x) = cos 2π·2x.",
          "تضرب الصيغة F(u) = ∫ f(x)·e^(−i2πxu) dx الدالة f في نمط التردد u ثم تجمع النتيجة. وهنا f(x) = cos 2π·2x.",
        ),
      ],
      pointsFor: {
        "2": [bi("The frequencies **match**: the product stays at or above zero, its average is 0.5, so F(2) is large.", "الترددان **متطابقان**: يبقى حاصل الضرب عند الصفر أو فوقه، ومتوسطه 0.5، لذا تكون F(2) كبيرة.")],
        "3": [bi("They **don't match**: the positive and negative lobes cancel, the average is **0**, and F(3) = 0.", "الترددان **غير متطابقين**: تُلغي الفصوص الموجبة والسالبة بعضها، فيكون المتوسط **0** وتكون F(3) = 0.")],
      },
    },
  ],
});

// ---------- The 1-D discrete Fourier transform (DFT) ----------
const termsPoint = (u: number) => {
  const s = sumText(dftTerms(WORKED, u));
  const F = showC(WORKED_F[u]);
  const tail: Record<number, [string, string]> = {
    0: ["nothing turns, so it is the **average**.", "لا يدور شيء، لذا فهي **المتوسط**."],
    1: ["each sample turns a quarter turn more than the one before.", "كل عينة تدور ربع دورة أكثر من سابقتها."],
    2: ["half turns, so the signs simply alternate.", "أنصاف دورات، لذا تتناوب الإشارات فحسب."],
    3: ["the mirror image of F1 (its conjugate).", "وهي صورة F1 في المرآة (مرافقها)."],
  };
  return bi(`**F${u}** = (${s})/4 = **${F}**: ${tail[u][0]}`, `**F${u}** = (${s})/4 = **${F}**: ${tail[u][1]}`);
};

const inversePoint = (x: number) => {
  const v = fmtNum(idft(WORKED_F)[x].re);
  return bi(`The four arrows end on the real axis at **f${x} = ${v}**: the imaginary parts cancel and the sample comes back.`, `تنتهي الأسهم الأربعة على المحور الحقيقي عند **f${x} = ${v}**: تُلغي الأجزاء التخيلية بعضها وتعود العينة.`);
};

const ops = dftOps(1024);

export const dftWalk = defineWalkthrough({
  id: "ip5-dft",
  title: bi("The DFT, by hand", "تحويل DFT يدويًا"),
  analogy: bi(
    "A rack of tuning forks. Each row of the DFT matrix is one fork; holding it against the samples tells you how strongly that frequency rings in them.",
    "مجموعة من الشوكات الرنانة: كل صف من مصفوفة DFT شوكة واحدة، وتقريبها من العينات يخبرك بمدى قوة رنين ذلك التردد فيها.",
  ),
  facts: {
    F0: fmtC(WORKED_F[0]),
    F1: fmtC(WORKED_F[1]),
    F2: fmtC(WORKED_F[2]),
    F3: fmtC(WORKED_F[3]),
    row1: fmtC(WORKED_SUMS[1]),
    f0: fmtNum(idft(WORKED_F)[0].re),
    b0: fmtC(MATLAB_B[0]),
    b1: fmtC(MATLAB_B[1], 2, true),
    fft1024: ops.fft,
  },
  panels: [
    {
      id: "samples",
      pill: bi("Finite samples", "عينات محدودة"),
      heading: bi("8 samples = 2 sampled sinusoids", "8 عينات = دالتان جيبيتان مأخوذتان عيناتٍ"),
      points: [
        bi(
          "Images are **discrete**: a row has a finite number of samples, so a finite number of sinusoids describes it exactly.",
          "الصور **متقطعة (discrete)**: فللصف عدد محدود من العينات، لذا يصفه عدد محدود من الدوال الجيبية وصفًا تامًا.",
        ),
        bi(
          "The square-wave samples 1 1 1 1 −1 −1 −1 −1 are exactly a **one-cycle** sinusoid plus a **three-cycle** one, added sample by sample.",
          "عينات الموجة المربعة 1 1 1 1 −1 −1 −1 −1 تساوي تمامًا دالة جيبية ذات **دورة واحدة** مضافًا إليها دالة ذات **ثلاث دورات**، عينةً بعينة.",
        ),
      ],
    },
    {
      id: "omega",
      pill: bi("ω = −i", "ω = −i"),
      heading: bi("For N = 4, ω = exp(−2πi/4) = −i", "مع N = 4 تكون ω = exp(−2πi/4) = −i"),
      points: [
        bi("The DFT uses **ω = exp(−2πi/N)**, one N-th of a turn **clockwise** round the unit circle.", "يستخدم تحويل DFT القيمة **ω = exp(−2πi/N)**، أي جزءًا من N من دورة **باتجاه عقارب الساعة** حول دائرة الوحدة (unit circle)."),
        bi("For N = 4 that is **−i**, and its powers repeat every four steps: 1, −i, −1, i, 1, …", "ومع N = 4 تساوي **−i**، وتتكرر قواها كل أربع خطوات: 1، −i، −1، i، 1، …"),
      ],
    },
    {
      id: "matrix",
      pill: bi("The DFT matrix", "مصفوفة DFT"),
      heading: bi("F = 𝓕f: one matrix product", "F = 𝓕f: ضرب مصفوفات واحد"),
      points: [
        bi(
          "The DFT is a **matrix multiplication**: entry (m, n) is ω^(mn)/N, so row u holds the powers of ω^u.",
          "تحويل DFT **ضرب مصفوفات (matrix multiplication)**: العنصر (m, n) هو ω^(mn)/N، لذا يحمل الصف u قوى ω^u.",
        ),
        bi(
          `Each row times f gives one coefficient. The **1/4** in front is the lecture's 1/N, so F = ${clist(WORKED_F)}.`,
          `كل صف مضروبًا في f يعطي معاملًا واحدًا. و**1/4** في المقدمة هي 1/N في اصطلاح المحاضرة، لذا F = ${clist(WORKED_F)}.`,
        ),
      ],
    },
    {
      id: "terms",
      pill: bi("F(u) term by term", "F(u) حدًّا حدًّا"),
      heading: bi("Each F(u) is four turned samples, added", "كل F(u) أربع عينات مُدارة مجموعة"),
      control: {
        label: bi("Coefficient", "المعامل"),
        options: WORKED.map((_, u) => ({ id: String(u), label: bi(`F${u}`, `F${u}`) })),
        initial: "0",
      },
      points: [
        bi(
          "Row u multiplies sample f_x by **ω^(xu)**, turning it by xu quarter turns. Adding the four arrows head to tail gives the sum.",
          "يضرب الصف u العينة f_x في **ω^(xu)**، فيديرها xu ربع دورة. وجمع الأسهم الأربعة رأسًا لذيل يعطي المجموع.",
        ),
      ],
      pointsFor: Object.fromEntries(WORKED.map((_, u) => [String(u), [termsPoint(u)]])),
    },
    {
      id: "inverse",
      pill: bi("Inverse DFT", "تحويل DFT العكسي"),
      heading: bi("Back from F to f: no 1/N, a plus sign", "العودة من F إلى f: دون 1/N وبإشارة موجبة"),
      control: {
        label: bi("Sample", "العينة"),
        options: WORKED.map((_, x) => ({ id: String(x), label: bi(`f${x}`, `f${x}`) })),
        initial: "0",
      },
      points: [
        bi(
          "The inverse f_x = Σ F_u·exp(2πixu/N) has **no 1/N** and a **positive** exponent, so the arrows turn the other way (by ω^(−xu)).",
          "التحويل العكسي f_x = Σ F_u·exp(2πixu/N) **لا يحتوي على 1/N** وأُسّه **موجب**، لذا تدور الأسهم في الاتجاه المعاكس (بمقدار ω^(−xu)).",
        ),
      ],
      pointsFor: Object.fromEntries(WORKED.map((_, x) => [String(x), [inversePoint(x)]])),
    },
    {
      id: "fft",
      pill: bi("MATLAB fft / ifft", "الدالتان fft و ifft"),
      heading: bi("The same transform, scaled differently and much faster", "التحويل نفسه، بتحجيم مختلف وأسرع بكثير"),
      control: {
        label: bi("Compare", "قارن"),
        options: [
          { id: "scale", label: bi("Scaling", "التحجيم") },
          { id: "speed", label: bi("Speed", "السرعة") },
        ],
        initial: "scale",
      },
      points: [
        bi("The **FFT** computes exactly the same DFT, but in about N log₂ N operations instead of N².", "يحسب **تحويل فورييه السريع (FFT)** تحويل DFT نفسه تمامًا، لكن بنحو N log₂ N عملية بدلًا من N²."),
      ],
      pointsFor: {
        scale: [
          bi(
            `MATLAB's fft leaves out the 1/N (its ifft divides by N instead), so its output is **N times** the lecture's: fft(1:9) starts with the **sum ${fmtC(MATLAB_B[0])}**.`,
            `تحذف الدالة fft في MATLAB المعامل 1/N (وتقسم ifft على N بدلًا من ذلك)، لذا تكون مخرجاتها **N مرة** قدر مخرجات المحاضرة: فأول قيمة في fft(1:9) هي **المجموع ${fmtC(MATLAB_B[0])}**.`,
          ),
        ],
        speed: [
          bi(
            `For N = 1024 that is about **${ops.fft.toLocaleString("en-US")}** operations instead of about a **million** (${ops.direct.toLocaleString("en-US")}).`,
            `مع N = 1024 يكون ذلك نحو **${ops.fft.toLocaleString("en-US")}** عملية بدلًا من نحو **مليون** (${ops.direct.toLocaleString("en-US")}).`,
          ),
        ],
      },
    },
  ],
});

// ---------- Properties of the 1-D DFT ----------
const pairPoint = (k: number) => bi(`X${k} = ${showC(SHIFT_XF[k])} and X${8 - k} = ${showC(SHIFT_XF[8 - k])}.`, `X${k} = ${showC(SHIFT_XF[k])} و X${8 - k} = ${showC(SHIFT_XF[8 - k])}.`);

const zPoint = (k: number) => {
  const t = circTerms(CONV_X, CONV_Y, k);
  const s = t.map((p) => `${CONV_X[p.n]}·${CONV_Y[p.m]}`).join(" + ");
  return bi(`z${k} = ${s} = **${CONV_Z[k]}**.`, `z${k} = ${s} = **${CONV_Z[k]}**.`);
};

const folds = CONV_Z.map((_, i) => (i + N4 < CONV_LIN.length ? `${CONV_LIN[i]} + ${CONV_LIN[i + N4]}` : `${CONV_LIN[i]}`)).join(", ");

export const properties = defineWalkthrough({
  id: "ip5-properties",
  title: bi("Properties of the DFT", "خواص تحويل DFT"),
  analogy: bi(
    "Rules of the road for frequencies: once you know them, you can predict what happens to a spectrum without computing it again.",
    "قواعد المرور للترددات: إذا عرفتها استطعت التنبؤ بما يحدث للطيف دون أن تحسبه من جديد.",
  ),
  facts: {
    X0: fmtC(SHIFT_XF[0]),
    X4: fmtC(SHIFT_XF[4]),
    X1: fmtC(SHIFT_XF[1]),
    X7: fmtC(SHIFT_XF[7]),
    x1X0: fmtC(SHIFT_X1F[0]),
    z: fmtList(CONV_Z),
    lin: fmtList(CONV_LIN),
    Z: fmtList(THEOREM_Z),
    XY: fmtList(THEOREM_XY),
  },
  panels: [
    {
      id: "linearity",
      pill: bi("Linearity", "الخطية"),
      heading: bi("H = pF + qG", "H = pF + qG"),
      points: [
        bi("If h = pf + qg, then **H = pF + qG**: the transform of a sum is the sum of the transforms.", "إذا كان h = pf + qg فإن **H = pF + qG**: تحويل المجموع يساوي مجموع التحويلات."),
        bi(
          "Here h = 2f + g with the constant g = [1, 1, 1, 1]. G is a single DC value, so adding g raises only **H0**; the other coefficients are just doubled.",
          "هنا h = 2f + g مع الثابت g = [1, 1, 1, 1]. و G قيمة مستمرة (DC) واحدة، لذا لا ترفع إضافة g إلا **H0**، أما بقية المعاملات فتتضاعف فحسب.",
        ),
      ],
    },
    {
      id: "shifting",
      pill: bi("Shifting", "الإزاحة"),
      heading: bi("Multiply by (−1)^n and the halves swap", "اضرب في (−1)^n فيتبادل النصفان"),
      control: {
        label: bi("Transform", "حوِّل"),
        options: [
          { id: "x", label: bi("x", "x") },
          { id: "x1", label: bi("(−1)^n · x", "(−1)^n · x") },
        ],
        initial: "x",
      },
      points: [
        bi(
          "Change the sign of every second element and the DFT's **left and right halves swap**. (−1)^n is a pure oscillation at frequency N/2, so every frequency moves by N/2.",
          "غيّر إشارة كل عنصر ثانٍ فيتبادل **النصفان الأيسر والأيمن** لتحويل DFT. فـ(−1)^n تذبذب خالص عند التردد N/2، لذا ينتقل كل تردد بمقدار N/2.",
        ),
      ],
      pointsFor: {
        x: [bi(`fft(x) starts with **${fmtC(SHIFT_XF[0])}**, the sum of x; the middle value X4 is ${fmtC(SHIFT_XF[4])}.`, `تبدأ fft(x) بالقيمة **${fmtC(SHIFT_XF[0])}**، وهي مجموع x؛ والقيمة الوسطى X4 تساوي ${fmtC(SHIFT_XF[4])}.`)],
        x1: [
          bi(
            `fft(x1) starts with **${fmtC(SHIFT_X1F[0])}**, the old middle value, and ${fmtC(SHIFT_XF[0])} has moved to the middle. In 2-D, (−1)^(x+y) puts the DC term in the **centre**.`,
            `تبدأ fft(x1) بالقيمة **${fmtC(SHIFT_X1F[0])}**، أي القيمة الوسطى القديمة، وانتقلت ${fmtC(SHIFT_XF[0])} إلى الوسط. وفي البُعدين يضع (−1)^(x+y) المركبة المستمرة (DC) في **المركز**.`,
          ),
        ],
      },
    },
    {
      id: "conjugate",
      pill: bi("Conjugate symmetry", "التناظر المرافق"),
      heading: bi("X_k and X_(N−k) are conjugates", "X_k و X_(N−k) مترافقان"),
      control: {
        label: bi("Pair", "الزوج"),
        options: [1, 2, 3].map((k) => ({ id: String(k), label: bi(`X${k} ↔ X${8 - k}`, `X${k} ↔ X${8 - k}`) })),
        initial: "1",
      },
      points: [
        bi(
          "For a **real** input, X_k is the complex conjugate of X_(N−k): the same real part, the opposite imaginary part.",
          "للمدخلات **الحقيقية** يكون X_k هو المرافق المركب (complex conjugate) للمعامل X_(N−k): الجزء الحقيقي نفسه والجزء التخيلي بإشارة معاكسة.",
        ),
        bi("So only about **half** the coefficients carry information, and the magnitude |X_k| is **mirror-symmetric**.", "لذا لا يحمل المعلومات إلا نحو **نصف** المعاملات، ويكون المقدار |X_k| **متناظرًا تناظر المرآة**."),
      ],
      pointsFor: Object.fromEntries([1, 2, 3].map((k) => [String(k), [pairPoint(k)]])),
    },
    {
      id: "wrap-index",
      pill: bi("Circular convolution", "الالتفاف الدائري"),
      heading: bi("Indices wrap around: y_(−1) = y_3", "الفهارس تلتف: y_(−1) = y_3"),
      control: {
        label: bi("Output", "المخرج"),
        options: CONV_Z.map((_, k) => ({ id: String(k), label: bi(`z${k}`, `z${k}`) })),
        initial: "0",
      },
      points: [
        bi(
          "**Circular convolution** z_k = Σ x_n·y_(k−n) treats both vectors as periodic, so an index below 0 wraps round to the end: y_(−1) = y_3, y_(−2) = y_2.",
          "يعامل **الالتفاف الدائري (circular convolution)** z_k = Σ x_n·y_(k−n) المتجهين على أنهما دوريان، لذا يلتف الفهرس الأصغر من 0 إلى النهاية: y_(−1) = y_3 و y_(−2) = y_2.",
        ),
      ],
      pointsFor: Object.fromEntries(CONV_Z.map((_, k) => [String(k), [zPoint(k)]])),
    },
    {
      id: "linear-circular",
      pill: bi("Linear vs circular", "الخطي مقابل الدائري"),
      heading: bi("The tail wraps onto the start", "الذيل يلتف على البداية"),
      control: {
        label: bi("Convolution", "الالتفاف"),
        options: [
          { id: "linear", label: bi(`Linear (${CONV_LIN.length} values)`, `خطي (${CONV_LIN.length} قيم)`) },
          { id: "circular", label: bi(`Circular (${CONV_Z.length} values)`, `دائري (${CONV_Z.length} قيم)`) },
        ],
        initial: "linear",
      },
      points: [
        bi(
          `The ordinary (**linear**) convolution of two length-4 vectors has ${CONV_LIN.length} values: the coefficients of p(u)·q(u).`,
          `الالتفاف العادي (**الخطي (linear)**) لمتجهين طول كل منهما 4 له ${CONV_LIN.length} قيم: وهي معاملات p(u)·q(u).`,
        ),
      ],
      pointsFor: {
        linear: [bi(`x * y = ${list(CONV_LIN)}: the last ${CONV_LIN.length - N4} values fall past the end of a length-4 vector.`, `x * y = ${list(CONV_LIN)}: تقع القيم الثلاث الأخيرة بعد نهاية متجه طوله 4.`)],
        circular: [
          bi(
            `**Circular**: they wrap round and add onto the first ones, ${folds}, giving **${list(CONV_Z)}**. The slides' p(u)q(u)(1 + u^N) does exactly this.`,
            `**الدائري**: تلتف وتُضاف إلى القيم الأولى، ${folds}، فتعطي **${list(CONV_Z)}**. وهذا بالضبط ما تفعله صيغة الشرائح p(u)q(u)(1 + u^N).`,
          ),
        ],
      },
    },
    {
      id: "theorem",
      pill: bi("Convolution theorem", "مبرهنة الالتفاف"),
      heading: bi("Two routes, one answer", "طريقان وجواب واحد"),
      control: {
        label: bi("Route", "الطريق"),
        options: [
          { id: "convolve", label: bi("Convolve, then DFT", "التفاف ثم DFT") },
          { id: "multiply", label: bi("DFT, then multiply", "DFT ثم ضرب") },
        ],
        initial: "convolve",
      },
      points: [
        bi(
          "The DFT of a circular convolution equals the **element-by-element product** of the DFTs: **Z = X · Y**.",
          "تحويل DFT للالتفاف الدائري يساوي **حاصل الضرب عنصرًا بعنصر** لتحويلات DFT: **Z = X · Y**.",
        ),
      ],
      pointsFor: {
        convolve: [bi(`Convolve first, z = ${list(CONV_Z)}, then transform: fft(z) = **${clist(THEOREM_Z)}**.`, `التفاف أولًا، z = ${list(CONV_Z)}، ثم التحويل: fft(z) = **${clist(THEOREM_Z)}**.`)],
        multiply: [
          bi(
            `Transform first, X = ${clist(THEOREM_X)} and Y = ${clist(THEOREM_Y)}, then multiply pair by pair: the same Z. A whole convolution became **4 multiplications**.`,
            `التحويل أولًا، X = ${clist(THEOREM_X)} و Y = ${clist(THEOREM_Y)}، ثم الضرب زوجًا بزوج: فنحصل على Z نفسها. لقد صار التفاف كامل **4 عمليات ضرب**.`,
          ),
        ],
      },
    },
  ],
});

// ---------- Magnitude, phase and the DC coefficient ----------
const polarPoint = (u: number) => {
  const F = WORKED_F[u];
  return bi(
    `F${u} = ${showC(F)}: |F${u}| = ${fmtNum(abs(F), 2)} and φ = **${argDeg(F)}°**, while tan⁻¹(imag/real) alone gives ${pretty(String(naiveArgDeg(F)))}°.`,
    `F${u} = ${showC(F)}: |F${u}| = ${fmtNum(abs(F), 2)} و φ = **${argDeg(F)}°**، بينما تعطي tan⁻¹(imag/real) وحدها ${pretty(String(naiveArgDeg(F)))}°.`,
  );
};

export const magPhase = defineWalkthrough({
  id: "ip5-mag-phase",
  title: bi("Magnitude, phase and DC", "المقدار والطور والمركبة المستمرة"),
  analogy: bi(
    "An arrow on a map. Its length says how far (the magnitude) and its direction says which way (the phase); you need both to arrive.",
    "سهم على خريطة: طوله يخبرك بالمسافة (المقدار)، واتجاهه يخبرك بالوجهة (الطور)، وتحتاج إلى الاثنين لتصل.",
  ),
  facts: {
    phase1: argDeg(WORKED_F[1]),
    naive1: naiveArgDeg(WORKED_F[1]),
    F0: fmtC(WORKED_F[0]),
    sum: fmtC(WORKED_SUMS[0]),
  },
  panels: [
    {
      id: "polar",
      pill: bi("Length and angle", "الطول والزاوية"),
      heading: bi("A coefficient as an arrow", "المعامل على هيئة سهم"),
      control: {
        label: bi("Coefficient", "المعامل"),
        options: [1, 2, 3].map((u) => ({ id: String(u), label: bi(`F${u}`, `F${u}`) })),
        initial: "1",
      },
      points: [
        bi(
          "Each coefficient is a complex number: its **magnitude** |F_u| = √(real² + imag²) is the arrow's length, its **phase** φ the arrow's angle.",
          "كل معامل عدد مركب: **مقداره (magnitude)** |F_u| = √(real² + imag²) هو طول السهم، و**طوره (phase)** φ هو زاوية السهم.",
        ),
        bi(
          "Take φ with the four-quadrant **atan2** (MATLAB's angle): tan⁻¹(imag/real) cannot tell −0.5 + 0.5i from 0.5 − 0.5i.",
          "احسب φ بالدالة **atan2** رباعية الأرباع (الدالة angle في MATLAB): فالصيغة tan⁻¹(imag/real) لا تميّز −0.5 + 0.5i من 0.5 − 0.5i.",
        ),
      ],
      pointsFor: Object.fromEntries([1, 2, 3].map((u) => [String(u), [polarPoint(u)]])),
    },
    {
      id: "spectra",
      pill: bi("Two spectra", "طيفان"),
      heading: bi("The DFT of [1, 2, 3, 4] as two charts", "تحويل DFT للمتتالية [1, 2, 3, 4] في رسمين"),
      control: {
        label: bi("Show", "اعرض"),
        options: [
          { id: "magnitude", label: bi("Magnitude", "المقدار") },
          { id: "phase", label: bi("Phase", "الطور") },
        ],
        initial: "magnitude",
      },
      points: [
        bi(
          "Plotting |F_u| against u gives the **magnitude spectrum**; the **phase spectrum** says how each wave is shifted. Together they rebuild the signal: F_u = |F_u|·e^(iφ).",
          "رسم |F_u| مقابل u يعطي **طيف المقدار (magnitude spectrum)**، ويبيّن **طيف الطور (phase spectrum)** مقدار إزاحة كل موجة. ومعًا يعيدان بناء الإشارة: F_u = |F_u|·e^(iφ).",
        ),
      ],
      pointsFor: {
        magnitude: [
          bi(
            `The magnitudes are mirror-symmetric, |F1| = |F3| = ${fmtNum(abs(WORKED_F[1]), 2)}, as conjugate symmetry predicts.`,
            `المقادير متناظرة تناظر المرآة، |F1| = |F3| = ${fmtNum(abs(WORKED_F[1]), 2)}، كما يتنبأ التناظر المرافق.`,
          ),
        ],
        phase: [
          bi(
            `The phases are **anti**-symmetric: φ1 = ${argDeg(WORKED_F[1])}° and φ3 = ${pretty(String(argDeg(WORKED_F[3])))}°.`,
            `الأطوار متناظرة **بإشارة معاكسة**: φ1 = ${argDeg(WORKED_F[1])}° و φ3 = ${pretty(String(argDeg(WORKED_F[3])))}°.`,
          ),
        ],
      },
    },
    {
      id: "dc",
      pill: bi("The DC coefficient", "المركبة المستمرة"),
      heading: bi("F0 is the average", "F0 هي المتوسط"),
      control: {
        label: bi("Convention", "الاصطلاح"),
        options: [
          { id: "lecture", label: bi("Lecture (1/N)", "المحاضرة (1/N)") },
          { id: "matlab", label: bi("MATLAB fft", "fft في MATLAB") },
        ],
        initial: "lecture",
      },
      points: [
        bi(
          "For u = 0 every exponential is exp(0) = 1, so **F0** simply adds up the samples: it is the **DC coefficient**.",
          "عند u = 0 يكون كل أُس مساويًا exp(0) = 1، لذا فإن **F0** يجمع العينات فحسب: إنه **المركبة المستمرة (DC coefficient)**.",
        ),
      ],
      pointsFor: {
        lecture: [
          bi(
            `With the lecture's 1/N it is the **average**: F0 = ${fmtC(WORKED_SUMS[0])}/${N4} = **${fmtC(WORKED_F[0])}**, the level the signal sits around.`,
            `ومع المعامل 1/N في اصطلاح المحاضرة تكون **المتوسط**: F0 = ${fmtC(WORKED_SUMS[0])}/${N4} = **${fmtC(WORKED_F[0])}**، وهو المستوى الذي تتمحور حوله الإشارة.`,
          ),
        ],
        matlab: [
          bi(
            `MATLAB's fft has no 1/N, so it returns the **sum**: ${fmtC(WORKED_SUMS[0])} here, and ${fmtC(MATLAB_B[0])} for fft(1:9).`,
            `لا تحتوي fft في MATLAB على 1/N، لذا تعيد **المجموع**: ${fmtC(WORKED_SUMS[0])} هنا، و ${fmtC(MATLAB_B[0])} للأمر fft(1:9).`,
          ),
        ],
      },
    },
  ],
});

// ---------- Some transform pairs ----------
const shiftPoint = (a: number) => {
  const g = circShift(WORKED, a);
  const G = dft(g);
  return bi(
    `f(x + ${a}) = ${list(g)}: F1 = ${showC(G[1])}, F2 = ${showC(G[2])}, F3 = ${showC(G[3])}. The bars do not move.`,
    `f(x + ${a}) = ${list(g)}: F1 = ${showC(G[1])}، و F2 = ${showC(G[2])}، و F3 = ${showC(G[3])}. ولا تتحرك الأعمدة.`,
  );
};

const gaussPoint = (sigma: number) => {
  const g = gaussian(PAIR_N, sigma);
  const sw = centredSignal(g).filter(([, v]) => v >= 0.5).length;
  return bi(`σ = ${sigma}: the signal is ${sw} samples wide at half height, its spectrum ${halfWidth(g)}.`, `σ = ${sigma}: عرض الإشارة عند نصف الارتفاع ${sw}، وعرض طيفها ${halfWidth(g)}.`);
};

const boxPoint = (half: number) => {
  const W = boxWidth(half);
  return bi(`${W} ones out of ${PAIR_N}: the main lobe ends at u = N/W = ${PAIR_N}/${W} ≈ ${fmtNum(PAIR_N / W, 1)}.`, `${W} من الآحاد من أصل ${PAIR_N}: ينتهي الفص الرئيسي عند u = N/W = ${PAIR_N}/${W} ≈ ${fmtNum(PAIR_N / W, 1)}.`);
};

const impulseN = dft(IMPULSE).map((c) => c.re * IMPULSE.length);

export const pairs = defineWalkthrough({
  id: "ip5-pairs",
  title: bi("Transform pairs", "أزواج التحويل"),
  analogy: bi(
    "An accordion. Squeeze it in space and its spectrum stretches out; pull it wide and the spectrum squeezes in.",
    "آلة الأكورديون: اضغطها في المكان فيتمدد طيفها، ومُدَّها فينضغط الطيف.",
  ),
  facts: {
    impulse: `1/${IMPULSE.length} ${fmtList(impulseN)}`,
    constant: fmtList(dft(CONSTANT)),
  },
  panels: [
    {
      id: "impulse-constant",
      pill: bi("Impulse and constant", "النبضة والثابت"),
      heading: bi("A spike ↔ a flat line", "نبضة ↔ خط مستوٍ"),
      control: {
        label: bi("Signal", "الإشارة"),
        options: [
          { id: "impulse", label: bi("Impulse [1, 0, 0, 0]", "نبضة [1, 0, 0, 0]") },
          { id: "constant", label: bi("Constant [1, 1, 1, 1]", "ثابت [1, 1, 1, 1]") },
        ],
        initial: "impulse",
      },
      points: [bi("The two are opposites: what is concentrated in one domain is spread out evenly in the other.", "الاثنان متقابلان: ما يتركّز في أحد المجالين ينتشر بالتساوي في الآخر.")],
      pointsFor: {
        impulse: [
          bi(
            `A **unit impulse** contains every frequency equally, so its DFT is flat: [1, 0, 0, 0] → (1/4)${list(impulseN)}.`,
            `تحتوي **نبضة الوحدة (unit impulse)** على جميع الترددات بالتساوي، لذا يكون تحويلها مستويًا: [1, 0, 0, 0] → (1/4)${list(impulseN)}.`,
          ),
        ],
        constant: [
          bi(
            `A **constant** does not vary at all, so its DFT is a single **DC** value: [1, 1, 1, 1] → ${list(dft(CONSTANT).map((c) => c.re))}.`,
            `أما **الثابت (constant)** فلا يتغير إطلاقًا، لذا يكون تحويله قيمة **مستمرة (DC)** واحدة: [1, 1, 1, 1] → ${list(dft(CONSTANT).map((c) => c.re))}.`,
          ),
        ],
      },
    },
    {
      id: "shift",
      pill: bi("Shift", "الإزاحة"),
      heading: bi("Moving a signal changes only the phase", "تحريك الإشارة لا يغيّر إلا الطور"),
      control: {
        label: bi("Move by", "إزاحة بمقدار"),
        options: [0, 1, 2].map((a) => ({ id: String(a), label: bi(`a = ${a}`, `a = ${a}`) })),
        initial: "0",
      },
      points: [
        bi(
          "**Shift**: f(x + a) ↔ F(u)·e^(i2πau/M). Each coefficient only turns, by an angle that grows with u, so its **magnitude stays the same**.",
          "**الإزاحة (shift)**: f(x + a) ↔ F(u)·e^(i2πau/M). فكل معامل يدور فقط، بزاوية تكبر مع u، لذا **يبقى مقداره كما هو**.",
        ),
        bi("That is why the magnitude spectrum does **not depend on where** an object is: the position lives in the phase.", "ولهذا لا يعتمد طيف المقدار **على موضع** الجسم: فالموضع محفوظ في الطور."),
      ],
      pointsFor: Object.fromEntries([1, 2].map((a) => [String(a), [shiftPoint(a)]])),
    },
    {
      id: "scaling",
      pill: bi("Scaling", "التحجيم"),
      heading: bi("Narrow in space ↔ wide in frequency", "ضيق في المكان ↔ عريض في التردد"),
      control: {
        label: bi("Gaussian", "دالة غاوس"),
        options: [
          { id: "narrow", label: bi(`Narrow (σ = ${GAUSS_SIGMA.narrow})`, `ضيقة (σ = ${GAUSS_SIGMA.narrow})`) },
          { id: "wide", label: bi(`Wide (σ = ${GAUSS_SIGMA.wide})`, `عريضة (σ = ${GAUSS_SIGMA.wide})`) },
        ],
        initial: "narrow",
      },
      points: [
        bi(
          "**Scaling**: f(ax) ↔ (1/a)·F(u/a). Squeezing a signal in space stretches its spectrum, and stretching it squeezes the spectrum.",
          "**التحجيم (scaling)**: f(ax) ↔ (1/a)·F(u/a). ضغط الإشارة في المكان يمدّ طيفها، ومدّها يضغط الطيف.",
        ),
        bi("A **Gaussian** transforms into a Gaussian, so it shows this cleanly: the narrower one is, the wider the other.", "تتحول **دالة غاوس (Gaussian)** إلى دالة غاوس، لذا تُظهر هذا بوضوح: كلما ضاقت إحداهما اتسعت الأخرى."),
      ],
      pointsFor: {
        narrow: [gaussPoint(GAUSS_SIGMA.narrow)],
        wide: [gaussPoint(GAUSS_SIGMA.wide)],
      },
    },
    {
      id: "box-sinc",
      pill: bi("Box ↔ sinc", "الصندوق ↔ sinc"),
      heading: bi("A box transforms into a sinc", "الصندوق يتحول إلى دالة sinc"),
      control: {
        label: bi("Box", "الصندوق"),
        options: [
          { id: "narrow", label: bi(`${boxWidth(BOX_HALF.narrow)} samples`, `${boxWidth(BOX_HALF.narrow)} عينات`) },
          { id: "wide", label: bi(`${boxWidth(BOX_HALF.wide)} samples`, `${boxWidth(BOX_HALF.wide)} عينة`) },
        ],
        initial: "narrow",
      },
      points: [
        bi(
          "A **box** (a run of ones) transforms into a **sinc**-shaped spectrum: a tall main lobe with smaller ripples that change sign.",
          "يتحول **الصندوق (box)**، أي سلسلة من الآحاد، إلى طيف على هيئة **sinc**: فص رئيسي مرتفع تحيط به تموجات أصغر تتغير إشارتها.",
        ),
        bi("The ripples come from the box's sharp edges, and by **scaling**, a wider box gives a narrower main lobe.", "تنشأ التموجات من حواف الصندوق الحادة، وبحسب **التحجيم** يعطي الصندوق الأعرض فصًا رئيسيًا أضيق."),
      ],
      pointsFor: {
        narrow: [boxPoint(BOX_HALF.narrow)],
        wide: [boxPoint(BOX_HALF.wide)],
      },
    },
  ],
});

// ---------- The 2-D DFT ----------
export const twoD = defineWalkthrough({
  id: "ip5-2d",
  title: bi("The 2-D DFT", "تحويل DFT ثنائي البُعد"),
  analogy: bi(
    "Reading a page twice: once along every line, then down every column. The 2-D DFT applies the 1-D DFT the same way, rows first, then columns.",
    "قراءة صفحة مرتين: مرة على امتداد كل سطر، ثم نزولًا في كل عمود. وهكذا يطبّق تحويل DFT ثنائي البُعد التحويلَ الأحادي: الصفوف أولًا ثم الأعمدة.",
  ),
  panels: [
    {
      id: "separable",
      pill: bi("Rows, then columns", "الصفوف ثم الأعمدة"),
      heading: bi("The 2-D DFT is separable", "تحويل DFT ثنائي البُعد قابل للفصل"),
      control: {
        label: bi("Step", "الخطوة"),
        options: [
          { id: "rows", label: bi("1 · Every row", "1 · كل صف") },
          { id: "columns", label: bi("2 · Every column", "2 · كل عمود") },
        ],
        initial: "rows",
      },
      points: [
        bi("The 2-D DFT is **separable**: take the 1-D DFT of every row, then of every column of the result.", "تحويل DFT ثنائي البُعد **قابل للفصل (separable)**: خذ تحويل DFT أحادي البُعد لكل صف، ثم لكل عمود من النتيجة."),
      ],
      pointsFor: {
        rows: [bi(`Every row of this image is [1, 2, 3, 4], so every row becomes the worked example's F = ${clist(WORKED_F)}.`, `كل صف في هذه الصورة هو [1, 2, 3, 4]، لذا يصبح كل صف هو F في المثال المحلول: ${clist(WORKED_F)}.`)],
        columns: [
          bi(
            "Each column is now constant, so its DFT keeps only its DC term: every row but the top one (u = 0) becomes **0**, because the image does not change down its columns.",
            "صار كل عمود ثابتًا، لذا لا يُبقي تحويله إلا مركبته المستمرة (DC): فتصبح الصفوف كلها **0** عدا الصف العلوي (u = 0)، لأن الصورة لا تتغير على امتداد أعمدتها.",
          ),
        ],
      },
    },
    {
      id: "centre",
      pill: bi("fftshift", "fftshift"),
      heading: bi("Move the DC term to the centre", "نقل المركبة المستمرة إلى المركز"),
      control: {
        label: bi("Display", "العرض"),
        options: [
          { id: "corner", label: bi("As computed", "كما حُسب") },
          { id: "centred", label: bi("After fftshift", "بعد fftshift") },
        ],
        initial: "corner",
      },
      points: [
        bi(
          "As computed, the **DC term** F(0, 0) sits in the top-left corner, and the low frequencies are split over all four corners.",
          "كما يُحسب التحويل، تقع **المركبة المستمرة (DC term)** F(0, 0) في الركن العلوي الأيسر، وتتوزع الترددات المنخفضة على الأركان الأربعة.",
        ),
      ],
      pointsFor: {
        centred: [
          bi(
            "**fftshift** swaps the quadrants diagonally, the same as multiplying the image by (−1)^(x+y) first: DC in the middle, low frequencies near it, high ones at the edges.",
            "تبدّل الدالة **fftshift** الأرباع قُطريًا، وهذا يماثل ضرب الصورة في (−1)^(x+y) أولًا: المركبة المستمرة في المنتصف، والترددات المنخفضة قربها، والمرتفعة عند الأطراف.",
          ),
        ],
      },
    },
    {
      id: "log",
      pill: bi("log(1 + |F|)", "log(1 + |F|)"),
      heading: bi("Why spectra are shown on a log scale", "لماذا تُعرض الأطياف بمقياس لوغاريتمي"),
      control: {
        label: bi("Show", "اعرض"),
        options: [
          { id: "raw", label: bi("|F|", "|F|") },
          { id: "log", label: bi("log(1 + |F|)", "log(1 + |F|)") },
        ],
        initial: "raw",
      },
      points: [
        bi(
          "The DC value is far larger than the rest, so drawn as it is, the spectrum is one bright dot on black.",
          "القيمة المستمرة (DC) أكبر بكثير من البقية، لذا إذا رُسم الطيف كما هو ظهر نقطة ساطعة واحدة على خلفية سوداء.",
        ),
      ],
      pointsFor: {
        log: [bi("**log(1 + |F|)** compresses the big values, so the weaker frequencies become visible; the 1 keeps a zero magnitude at log 1 = 0.", "تضغط **log(1 + |F|)** القيم الكبيرة فتظهر الترددات الأضعف؛ والعدد 1 يجعل المقدار الصفري يبقى عند log 1 = 0.")],
      },
    },
    {
      id: "mag-phase",
      pill: bi("Magnitude vs phase", "المقدار مقابل الطور"),
      heading: bi("Magnitude says how much, phase says where", "المقدار يخبر بالكمية، والطور بالموضع"),
      control: {
        label: bi("Square at", "موضع المربع"),
        options: [
          { id: "left", label: bi("Top left", "أعلى اليسار") },
          { id: "right", label: bi("Bottom right", "أسفل اليمين") },
        ],
        initial: "left",
      },
      points: [
        bi("Moving the square leaves the **magnitude** spectrum exactly the same: it only says **how strongly** each frequency is present.", "تحريك المربع يترك طيف **المقدار** كما هو تمامًا: فهو لا يخبر إلا **بمدى قوة** وجود كل تردد."),
        bi("The **phase** changes completely: it encodes **where** the structures are, so both are needed to rebuild the image.", "أما **الطور** فيتغير تمامًا: إذ يرمّز **مواضع** البنى، لذا نحتاج إلى الاثنين لإعادة بناء الصورة."),
      ],
    },
  ],
});

// ---------- Filtering in the frequency domain ----------
const fftCost = fftPerPixel(COST_SIZE, COST_SIZE);
/** "5 مرات" but "53 مرة": Arabic counts 3–10 with a plural. */
const timesAr = (n: number) => `${n} ${n >= 3 && n <= 10 ? "مرات" : "مرة"}`;
const costPoint = (m: number) => {
  const direct = directPerPixel(m);
  if (direct <= fftCost) {
    return bi(
      `${m} × ${m}: ${direct} against about ${fftCost}, so a small kernel is cheaper in space, and a separable one even more so.`,
      `${m} × ${m}: ${direct} مقابل نحو ${fftCost}، لذا تكون النواة الصغيرة أرخص في المجال المكاني، والقابلة للفصل أرخص من ذلك.`,
    );
  }
  return bi(`${m} × ${m}: ${direct} against about ${fftCost}, so the frequency route is about **${Math.round(direct / fftCost)} times** cheaper.`, `${m} × ${m}: ${direct} مقابل نحو ${fftCost}، لذا يكون الطريق الترددي أرخص بنحو **${timesAr(Math.round(direct / fftCost))}**.`);
};

export const filtering = defineWalkthrough({
  id: "ip5-filtering",
  title: bi("Filtering by multiplying", "الترشيح بالضرب"),
  analogy: bi(
    "A graphic equalizer. Instead of reworking the whole recording, you slide the bass and treble controls: each band of frequencies is simply turned up or down.",
    "معادل الصوت (equalizer): بدلًا من إعادة معالجة التسجيل كله، تحرّك مفاتيح الطبقات المنخفضة والمرتفعة، فيُرفع كل نطاق من الترددات أو يُخفض فحسب.",
  ),
  panels: [
    {
      id: "pipeline",
      pill: bi("Transform, multiply, invert", "حوِّل ثم اضرب ثم اعكس"),
      heading: bi("g = F⁻¹[H · F[f]]", "g = F⁻¹[H · F[f]]"),
      points: [
        bi("In 2-D too, convolving an image with a kernel in space equals **multiplying their transforms**: f * h ↔ F · H.", "في البُعدين أيضًا، يساوي التفاف الصورة مع نواة (kernel) في المكان **ضرب تحويليهما**: f * h ↔ F · H."),
        bi("So: transform the image, multiply by the filter's transform H(u, v), and transform back.", "لذا: حوِّل الصورة، واضربها في تحويل المرشح H(u, v)، ثم عُد بالتحويل العكسي."),
      ],
    },
    {
      id: "mask",
      pill: bi("Multiply by a mask", "الضرب في قناع"),
      heading: bi("Low-pass filtering as multiply-by-mask", "ترشيح التمرير المنخفض ضربًا في قناع"),
      control: {
        label: bi("Mask", "القناع"),
        options: [
          { id: "low", label: bi("Low-pass", "تمرير منخفض") },
          { id: "high", label: bi("High-pass", "تمرير مرتفع") },
        ],
        initial: "low",
      },
      points: [
        bi(
          "The mask H is 1 where a frequency may pass and 0 where it is removed; multiplying the centred spectrum by it is the whole filter.",
          "قيمة القناع H هي 1 حيث يُسمح للتردد بالمرور، و 0 حيث يُزال؛ وضرب الطيف الموسَّط فيه هو المرشح كله.",
        ),
      ],
      pointsFor: {
        low: [
          bi(
            "**Low-pass**: only the centre survives, so the square comes back **blurred**, with faint ripples around it (the ringing of an ideal mask).",
            "**التمرير المنخفض (low-pass)**: لا يبقى إلا المركز، فيعود المربع **ضبابيًا (blurred)** تحيط به تموجات خافتة (رنين القناع المثالي).",
          ),
        ],
        high: [bi("**High-pass**: the opposite mask removes the centre, and what survives is the square's **edges**.", "**التمرير المرتفع (high-pass)**: القناع المعاكس يزيل المركز، فلا يبقى إلا **حواف** المربع.")],
      },
    },
    {
      id: "cost",
      pill: bi("Why it pays", "لماذا يستحق العناء"),
      heading: bi("Cost per pixel: m² against log(MN)", "التكلفة لكل بكسل: m² مقابل log(MN)"),
      control: {
        label: bi("Kernel", "النواة"),
        options: [3, 9, 31].map((m) => ({ id: String(m), label: bi(`${m} × ${m}`, `${m} × ${m}`) })),
        initial: "3",
      },
      points: [
        bi(
          `Direct convolution costs about **m²** multiplications per pixel; the FFT route costs on the order of **log(MN)** per pixel whatever the kernel size: ${fftCost} for a ${COST_SIZE} × ${COST_SIZE} image.`,
          `يكلّف الالتفاف المباشر نحو **m²** عملية ضرب لكل بكسل، بينما يكلّف طريق FFT ما هو من رتبة **log(MN)** لكل بكسل أيًّا كان حجم النواة: ${fftCost} لصورة ${COST_SIZE} × ${COST_SIZE}.`,
        ),
      ],
      pointsFor: Object.fromEntries([3, 9, 31].map((m) => [String(m), [costPoint(m)]])),
    },
    {
      id: "wrap",
      pill: bi("Wrap-around", "الالتفاف حول الحدود"),
      heading: bi("The DFT's convolution is circular", "الالتفاف عبر DFT دائري"),
      control: {
        label: bi("Before the DFT", "قبل DFT"),
        options: [
          { id: "none", label: bi("No padding", "دون حشو") },
          { id: "zero", label: bi("Zero padding", "حشو بالأصفار") },
        ],
        initial: "none",
      },
      points: [
        bi(
          "The DFT treats the image as **periodic**, so a filter applied through it wraps round from one border to the opposite one.",
          "يعامل تحويل DFT الصورة على أنها **دورية (periodic)**، لذا يلتف المرشح المطبَّق من خلاله من أحد الحدود إلى الحد المقابل.",
        ),
      ],
      pointsFor: {
        none: [bi("A 3-pixel mean through the DFT: the bright pixels at the right bleed into the **left** border.", "متوسط 3 بكسلات عبر DFT: تتسرب البكسلات الساطعة في اليمين إلى الحد **الأيسر**.")],
        zero: [
          bi(
            "Zeros appended before the transform give the wrap-around somewhere harmless to land; cut them off and the left border stays **0**.",
            "الأصفار المضافة قبل التحويل تمنح الالتفاف مكانًا لا يضر فيه؛ فإذا قُصّت بقي الحد الأيسر **0**.",
          ),
        ],
      },
    },
  ],
});

/** Every walkthrough in this lecture, registered in lib/walkthroughs/index.ts. */
export const all = [why, sines, continuous, dftWalk, properties, magPhase, pairs, twoD, filtering] as const;

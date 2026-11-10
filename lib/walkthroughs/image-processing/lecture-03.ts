import { bi } from "@/components/widgets/types";
import { defineWalkthrough } from "@/lib/widgets/walkthrough";
import {
  DIRECTIONAL,
  EDGE_PATCHES,
  edgeHighBoost,
  edgeLaplacian,
  edgeMean,
  edgeSharpenedOneMask,
  edgeSharpenedRaw,
  edgeUnsharp,
  clip,
  flatMean,
  saltMean,
  SALT_IMAGE,
  listOf,
  respond,
  scaleTo255,
  separableCost,
  separableDemo,
  slide36,
  worked,
} from "@/lib/widgets/ip-lecture-03";

/*
 * Image Processing · Lecture 3 (content/subjects/image-processing/lectures/03-spatial-filtering.mdx).
 * One walkthrough per heading; the scenes are in
 * components/widgets/walkthrough/scenes/image-processing/lecture-03/. Every number the text
 * quotes is computed in lib/widgets/ip-lecture-03.ts, and the page's `expect` checks the facts.
 */

/** A number as the page prints it, with a real minus sign. */
const n = (v: number) => String(v).replace(/^-/, "−");
/** "20, 20, 0" in a sentence (Arabic uses «،»). */
const en = (xs: readonly number[]) => xs.map(n).join(", ");
const ar = (xs: readonly number[]) => xs.map(n).join("، ");

// ---------- What spatial filtering is ----------
const cropped = worked("correlation", "none").output;
const corner = Object.fromEntries((["none", "zero", "replicate", "symmetric", "wrap"] as const).map((p) => [p, worked("correlation", p).output[0][0]])) as Record<"none" | "zero" | "replicate" | "symmetric" | "wrap", number>;
const sharpRaw = edgeSharpenedRaw();
const sharpClipped = sharpRaw.map((v) => clip(v));
const sharpScaled = scaleTo255(sharpRaw);

export const spatial = defineWalkthrough({
  id: "ip3-spatial-filtering",
  title: bi("A mask slid across the image", "قناع يتحرك عبر الصورة"),
  analogy: bi(
    "A stencil moved across a page: at every stop you look only through its holes, weigh what you see, and write one number in the matching square of a new page.",
    "استنسل (stencil) يُحرَّك عبر صفحة: في كل موضع تنظر من فتحاته فقط، وتزن ما تراه، ثم تكتب رقمًا واحدًا في المربع المقابل من صفحة جديدة.",
  ),
  facts: {
    centre: cropped[1][1],
    corner: corner.none,
    cropped: `${cropped.length}×${cropped[0].length}`,
  },
  panels: [
    {
      id: "one-pixel",
      pill: bi("One output pixel", "بكسل واحد في المخرجات"),
      heading: bi("Each output pixel comes from a neighbourhood", "كل بكسل في المخرجات يأتي من جوار"),
      control: {
        label: bi("Processing", "المعالجة"),
        options: [
          { id: "point", label: bi("Point", "نقطية") },
          { id: "neighbourhood", label: bi("Neighbourhood", "جوار") },
        ],
        initial: "neighbourhood",
      },
      points: [
        bi(
          "Put the mask's centre on a pixel, multiply every pixel under it by the **coefficient** on top, and add: the sum is the output pixel at that same position.",
          "ضع مركز القناع (mask) على بكسل، واضرب كل بكسل تحته في **المعامل (coefficient)** الواقع فوقه، ثم اجمع: المجموع هو بكسل المخرجات في الموضع نفسه.",
        ),
      ],
      pointsFor: {
        point: [bi("**Point processing** reads only the pixel itself: one value in, one value out.", "**المعالجة النقطية (point processing)** لا تقرأ إلا البكسل نفسه: قيمة واحدة تدخل، وقيمة واحدة تخرج.")],
        neighbourhood: [
          bi(
            `**Neighbourhood processing** reads all nine: on the worked example the centre pixel gives 0+1+6 + 2+4+0 + 0+0+4 = **${cropped[1][1]}**, the centre of the output g.`,
            `**معالجة الجوار (neighbourhood processing)** تقرأ البكسلات التسعة كلها: في المثال المحلول يعطي البكسل المركزي 0+1+6 + 2+4+0 + 0+0+4 = **${cropped[1][1]}**، وهو مركز المخرجات g.`,
          ),
        ],
      },
    },
    {
      id: "flip",
      pill: bi("Correlation or convolution", "ارتباط أم التفاف"),
      heading: bi("Convolution rotates the mask by 180° first", "الالتفاف يدوّر القناع بزاوية 180° أولًا"),
      control: {
        label: bi("Operation", "العملية"),
        options: [
          { id: "correlation", label: bi("Correlation", "الارتباط") },
          { id: "convolution", label: bi("Convolution", "الالتفاف") },
        ],
        initial: "correlation",
      },
      points: [
        bi("Filter an **impulse**: an image of zeros with a single 1. Whatever comes out shows how the mask was laid on the image.", "رشّح **نبضة (impulse)**: صورة كلها أصفار عدا قيمة 1 واحدة. فما يخرج يكشف كيف وُضع القناع على الصورة."),
      ],
      pointsFor: {
        correlation: [
          bi(
            "**Correlation** lays w on the image as it is, so the impulse comes out as w **rotated by 180°**.",
            "**الارتباط (correlation)** يضع القناع w على الصورة كما هو، فتخرج النبضة على هيئة w **مدوَّرًا بزاوية 180°**.",
          ),
        ],
        convolution: [
          bi(
            "**Convolution** rotates w by 180° first, so the impulse comes out as w itself: w is the filter's **impulse response**. For symmetric masks the two are identical.",
            "**الالتفاف (convolution)** يدوّر w بزاوية 180° أولًا، فتخرج النبضة على هيئة w نفسه: فالقناع w هو **الاستجابة النبضية (impulse response)** للمرشح. وفي الأقنعة المتماثلة تتطابق العمليتان.",
          ),
        ],
      },
    },
    {
      id: "delta",
      pill: bi("The impulse as a mask", "النبضة قناعًا"),
      heading: bi("A single 1 copies the image, or shifts it", "قيمة 1 واحدة تنسخ الصورة أو تزيحها"),
      control: {
        label: bi("Where is the 1?", "أين تقع القيمة 1؟"),
        options: [
          { id: "centre", label: bi("At the centre", "في المركز") },
          { id: "left", label: bi("Left of centre", "يسار المركز") },
        ],
        initial: "centre",
      },
      points: [
        bi("As a **mask**, the impulse picks out one pixel under it (the **sifting property**), so every output pixel is a copy of one input pixel.", "عند استخدام النبضة **قناعًا (mask)** فإنها تلتقط بكسلًا واحدًا تحتها (**خاصية الغربلة (sifting property)**)، فيكون كل بكسل في المخرجات نسخة من بكسل واحد في المدخلات."),
      ],
      pointsFor: {
        centre: [bi("With the 1 at the centre each pixel copies itself: the **identity** filter.", "عندما تقع القيمة 1 في المركز ينسخ كل بكسل نفسه: إنه مرشح **الهوية (identity)**.")],
        left: [
          bi(
            "With the 1 left of centre, convolution (mask rotated) copies each pixel's **right** neighbour, so the picture moves one pixel **left**, as on slide 9. Zero padding fills the last column.",
            "عندما تقع القيمة 1 يسار المركز، ينسخ الالتفاف (convolution) (بعد تدوير القناع) الجار **الأيمن** لكل بكسل، فتتحرك الصورة بكسلًا واحدًا إلى **اليسار** كما في الشريحة 9. ويملأ الحشو بالأصفار العمود الأخير.",
          ),
        ],
      },
    },
    {
      id: "borders",
      pill: bi("Output size and borders", "حجم المخرجات والحدود"),
      heading: bi("What lies outside the image?", "ماذا يقع خارج الصورة؟"),
      control: {
        label: bi("Border method", "طريقة معالجة الحدود"),
        options: [
          { id: "none", label: bi("Ignore", "تجاهل") },
          { id: "zero", label: bi("Zeros", "أصفار") },
          { id: "replicate", label: bi("Replicate", "تكرار") },
          { id: "symmetric", label: bi("Mirror", "انعكاس") },
          { id: "wrap", label: bi("Wrap", "دائري") },
        ],
        initial: "none",
      },
      points: [
        bi(
          "If the mask must stay inside, an M×N image and an m×n mask give (M − m + 1)×(N − n + 1) outputs. Padding p = (m − 1)/2 pixels on every side keeps the size.",
          "إذا اشترطنا بقاء القناع (mask) داخل الصورة، فإن الصورة M×N مع القناع m×n تعطي (M − m + 1)×(N − n + 1) قيمة. والحشو (padding) بعرض p = (m − 1)/2 بكسل من كل جانب يحافظ على الحجم.",
        ),
      ],
      pointsFor: {
        none: [bi(`Only ${cropped.length}×${cropped[0].length} positions fit on the 5×5 worked example, so the output **shrinks**; its corner is **${corner.none}**.`, `لا يتسع المثال المحلول 5×5 إلا لمواضع عددها ${cropped.length}×${cropped[0].length}، فتتقلص المخرجات؛ وقيمة ركنها **${corner.none}**.`)],
        zero: [bi(`**Zero padding** keeps 5×5 but pulls the border outputs down (dark border artefacts): the corner drops to **${corner.zero}**.`, `**الحشو بالأصفار (zero padding)** يحافظ على الحجم 5×5 لكنه يخفض قيم الإطار (تشوّهات (artefacts) داكنة على الحدود): فتنخفض قيمة الركن إلى **${corner.zero}**.`)],
        replicate: [bi(`**Replicate** copies the nearest border pixel outwards; the corner becomes **${corner.replicate}**.`, `**التكرار (replicate)** ينسخ أقرب بكسل على الحد إلى الخارج؛ فتصبح قيمة الركن **${corner.replicate}**.`)],
        symmetric: [
          bi(
            `**Mirror** (symmetric) reflects the image across its border. With a 1-pixel pad the reflection is the border pixel itself, so the corner is **${corner.symmetric}**, as with replicate; larger masks tell them apart.`,
            `**الانعكاس (symmetric)** يعكس الصورة عبر حدودها. ومع حشو بعرض بكسل واحد يكون الانعكاس هو بكسل الحد نفسه، فتكون قيمة الركن **${corner.symmetric}** كما في التكرار؛ أما الأقنعة الأكبر فتُظهر الفرق بينهما.`,
          ),
        ],
        wrap: [bi(`**Wrap around** takes the pixels from the opposite side, as if the image repeated; the corner becomes **${corner.wrap}**.`, `**الحشو الدائري (wrap around)** يأخذ البكسلات من الجهة المقابلة كأن الصورة تتكرر؛ فتصبح قيمة الركن **${corner.wrap}**.`)],
      },
    },
    {
      id: "range",
      pill: bi("Values out of range", "القيم الخارجة عن المدى"),
      heading: bi("Clip, or scale back into 0–255", "القصّ أو إعادة التحجيم إلى المدى 0–255"),
      control: {
        label: bi("Fix", "المعالجة"),
        options: [
          { id: "clip", label: bi("Clip", "القصّ") },
          { id: "scale", label: bi("Scale", "إعادة التحجيم") },
        ],
        initial: "clip",
      },
      points: [
        bi(
          `Negative coefficients can push results below 0 or above 255. Sharpening the 20 | 80 edge (see the Laplacian) gives the row ${en(sharpRaw)}.`,
          `المعاملات (coefficients) السالبة قد تدفع النتائج إلى ما دون 0 أو ما فوق 255. فإبراز الحافة 20 | 80 (انظر لابلاسيان) يعطي الصف ${ar(sharpRaw)}.`,
        ),
      ],
      pointsFor: {
        clip: [bi(`**Clipping** sets ${n(Math.min(...sharpRaw))} to 0 and leaves every in-range value alone: ${en(sharpClipped)}.`, `**القصّ (clipping)** يحوّل القيمة ${n(Math.min(...sharpRaw))} إلى 0 ويترك كل قيمة داخل المدى كما هي: ${ar(sharpClipped)}.`)],
        scale: [
          bi(
            `**Scaling** maps the whole range [${n(Math.min(...sharpRaw))}, ${Math.max(...sharpRaw)}] onto [0, 255], so every value moves: ${en(sharpScaled)}.`,
            `**إعادة التحجيم (scaling)** تنقل المدى كله [${n(Math.min(...sharpRaw))}, ${Math.max(...sharpRaw)}] إلى [0, 255]، فتتغير كل القيم: ${ar(sharpScaled)}.`,
          ),
        ],
      },
    },
  ],
});

// ---------- The averaging (mean) filter ----------
const meanEdge = edgeMean();
const salt = { background: SALT_IMAGE[0][0], impulse: SALT_IMAGE[2][2], blotch: saltMean()[2][2] };
const frame = { zero: flatMean("zero").output, replicate: flatMean("replicate").output };

export const meanFilter = defineWalkthrough({
  id: "ip3-mean-filter",
  title: bi("Averaging a neighbourhood", "حساب متوسط الجوار"),
  analogy: bi(
    "Asking nine neighbours and reporting their average opinion: one loud outlier still drags the answer, and a sharp border between two groups gets softened.",
    "أن تسأل تسعة جيران وتعلن متوسط آرائهم: صوت شاذ واحد يظل يجرّ الإجابة نحوه، والحد الفاصل الحاد بين مجموعتين يصبح ناعمًا.",
  ),
  facts: { edge: listOf(meanEdge) },
  panels: [
    {
      id: "window",
      pill: bi("1/9 in every cell", "1/9 في كل خانة"),
      heading: bi("Each pixel becomes the average of its 3×3 window", "يصبح كل بكسل متوسط نافذته 3×3"),
      points: [
        bi("The **mean filter** gives each of the n×n coefficients 1/n², so they add up to 1 and a flat region stays as it is.", "**مرشح المتوسط (mean filter)** يعطي كل معامل من المعاملات n×n القيمة 1/n²، فيكون مجموعها 1 وتبقى المنطقة المستوية كما هي."),
        bi(`Across the 20 | 80 edge the interior becomes **${en(meanEdge)}**: the jump turns into a ramp, so the edge is **blurred**.`, `عبر الحافة 20 | 80 تصبح البكسلات الداخلية **${ar(meanEdge)}**: تتحول القفزة إلى منحدر، فتُ**ضبَّب** الحافة (edge).`),
      ],
    },
    {
      id: "size",
      pill: bi("Bigger mask, more blur", "قناع أكبر، تضبيب أكبر"),
      heading: bi("The ramp widens with the mask", "يتسع المنحدر مع اتساع القناع"),
      control: {
        label: bi("Mask size", "حجم القناع"),
        options: [
          { id: "k3", label: bi("3×3", "3×3") },
          { id: "k5", label: bi("5×5", "5×5") },
          { id: "k7", label: bi("7×7", "7×7") },
        ],
        initial: "k3",
      },
      points: [bi("Plot one row across the edge: an n×n mean turns the jump into a ramp with n − 1 in-between values, so the larger the mask, the stronger the smoothing.", "ارسم صفًا واحدًا عبر الحافة: يحوّل المتوسط n×n القفزة إلى منحدر فيه n − 1 قيمة وسيطة، لذا كلما كبر القناع (mask) زاد التنعيم (smoothing).")],
      pointsFor: {
        k3: [bi("3×3: every coefficient is 1/9.", "3×3: كل معامل يساوي 1/9.")],
        k5: [bi("5×5: every coefficient is 1/25.", "5×5: كل معامل يساوي 1/25.")],
        k7: [bi("7×7: every coefficient is 1/49. The slides go up to 21×21.", "7×7: كل معامل يساوي 1/49. وتصل الشرائح إلى 21×21.")],
      },
    },
    {
      id: "noise",
      pill: bi("Salt noise", "ضوضاء الملح"),
      heading: bi("An impulse is smeared, not removed", "النبضة تُلطَّخ ولا تُزال"),
      points: [
        bi(
          `A white ${salt.impulse} among ${salt.background}s is averaged with its 8 neighbours: (8·${salt.background} + ${salt.impulse})/9 = **${salt.blotch}**, over a whole 3×3 blotch.`,
          `تدخل قيمة بيضاء ${salt.impulse} بين قيم ${salt.background} في متوسط جيرانها الثمانية: (8·${salt.background} + ${salt.impulse})/9 = **${salt.blotch}**، على بقعة 3×3 كاملة.`,
        ),
        bi("The outlier is diluted, not removed, so averaging handles **salt-and-pepper** noise badly; the denser the noise, the worse.", "تُخفَّف القيمة الشاذة ولا تُزال، لذا يتعامل التوسيط تعاملًا سيئًا مع ضوضاء **الملح والفلفل (salt-and-pepper)**؛ وكلما زادت كثافة الضوضاء ساءت النتيجة."),
      ],
    },
    {
      id: "zero-border",
      pill: bi("Padding the border", "حشو الحدود"),
      heading: bi("Zero padding darkens the frame", "الحشو بالأصفار يُعتِم الإطار"),
      control: {
        label: bi("Padding", "الحشو"),
        options: [
          { id: "zero", label: bi("Zeros", "أصفار") },
          { id: "replicate", label: bi("Replicate", "التكرار") },
        ],
        initial: "zero",
      },
      points: [bi("To keep the output the same size as the image, pad the image first. The simplest choice, **zero padding**, adds a border of 0s.", "للحفاظ على حجم المخرجات مساويًا لحجم الصورة، احشُ الصورة أولًا. وأبسط خيار هو **الحشو بالأصفار (zero padding)**، وفيه يُضاف إطار من الأصفار.")],
      pointsFor: {
        zero: [
          bi(
            `On a flat image of ${frame.replicate[0][0]}s, an edge pixel averages in 3 zeros (**${frame.zero[0][2]}**) and a corner 5 zeros (**${frame.zero[0][0]}**): a dark frame.`,
            `في صورة مستوية كل قيمها ${frame.replicate[0][0]}، يدخل في متوسط بكسل الإطار 3 أصفار (**${frame.zero[0][2]}**) وفي متوسط الركن 5 أصفار (**${frame.zero[0][0]}**): إطار داكن.`,
          ),
        ],
        replicate: [bi(`**Replicate** padding copies the nearest border pixel outwards instead, so the flat image stays flat at **${frame.replicate[0][0]}**.`, `أما **الحشو بالتكرار (replicate)** فينسخ أقرب بكسل على الحد إلى الخارج بدلًا من ذلك، فتبقى الصورة المستوية مستوية عند **${frame.replicate[0][0]}**.`)],
      },
    },
  ],
});

// ---------- Separable filters ----------
const sepCost = separableCost(11);
const sep = separableDemo();

export const separable = defineWalkthrough({
  id: "ip3-separable",
  title: bi("One 2-D mask as two 1-D passes", "قناع ثنائي البعد على هيئة مرورين أحاديي البعد"),
  analogy: bi(
    "Averaging a class's marks: average each row of desks, then average the row averages. You get the same answer as averaging everyone at once, with far fewer sums.",
    "حساب متوسط درجات فصل: احسب متوسط كل صف من المقاعد، ثم متوسط هذه المتوسطات. تحصل على الإجابة نفسها التي يعطيها حساب متوسط الجميع مرة واحدة، لكن بعمليات أقل بكثير.",
  ),
  facts: { direct: sepCost.direct, separable: sepCost.separable },
  panels: [
    {
      id: "outer",
      pill: bi("Column × row", "عمود × صف"),
      heading: bi("Some masks are a column times a row", "بعض الأقنعة حاصل ضرب عمود في صف"),
      control: {
        label: bi("Mask", "القناع"),
        options: [
          { id: "mean", label: bi("3×3 mean", "المتوسط 3×3") },
          { id: "laplacian", label: bi("Laplacian variant", "صيغة لابلاسيان") },
        ],
        initial: "mean",
      },
      points: [bi("A mask is **separable** when it is a column vector times a row vector: entry (i, j) = column[i] × row[j].", "يكون القناع (mask) **قابلًا للفصل (separable)** عندما يكون حاصل ضرب متجه عمودي في متجه أفقي: العنصر (i, j) = column[i] × row[j].")],
      pointsFor: {
        mean: [bi("(1/3)[1 1 1]ᵀ times (1/3)[1 1 1] gives 1/9 in every entry: the mean filter.", "حاصل ضرب (1/3)[1 1 1]ᵀ في (1/3)[1 1 1] يعطي 1/9 في كل عنصر: إنه مرشح المتوسط (mean filter).")],
        laplacian: [bi("[1 −2 1]ᵀ times [1 −2 1] gives the separable variant of the Laplacian. The Gaussian is separable too.", "حاصل ضرب [1 −2 1]ᵀ في [1 −2 1] يعطي الصيغة القابلة للفصل من لابلاسيان (Laplacian). ومرشح غاوس (Gaussian) قابل للفصل أيضًا.")],
      },
    },
    {
      id: "passes",
      pill: bi("Rows, then columns", "الصفوف ثم الأعمدة"),
      heading: bi("Filter the rows, then the columns", "رشّح الصفوف ثم الأعمدة"),
      points: [
        bi("Average each row over 3 pixels, then average that result down each column. By **associativity** this equals filtering once with the 3×3 mean.", "احسب متوسط كل صف على 3 بكسلات، ثم احسب متوسط الناتج على طول كل عمود. وبفضل **الخاصية التجميعية (associativity)** يساوي ذلك الترشيح مرة واحدة بمرشح المتوسط 3×3."),
        bi(`On this picture both routes give the same 3×3 output, with **${sep.both[1][1]}** at the centre.`, `في هذه الصورة يعطي الطريقان المخرجات 3×3 نفسها، وفي مركزها **${sep.both[1][1]}**.`),
      ],
    },
    {
      id: "cost",
      pill: bi("Work per pixel", "العمل لكل بكسل"),
      heading: bi("N² multiplications become 2N", "N² عملية ضرب تصبح 2N"),
      points: [
        bi("An N×N mask needs N² multiplications and N² − 1 additions per pixel; two 1-D passes need 2N and 2N − 2.", "يحتاج القناع N×N إلى N² عملية ضرب و N² − 1 عملية جمع لكل بكسل؛ أما المروران أحاديا البعد فيحتاجان إلى 2N و 2N − 2."),
        bi(`The saving grows with N: for 11×11, **${sepCost.direct}** multiplications become **${sepCost.separable}**.`, `ويزداد التوفير مع N: ففي 11×11 تصبح **${sepCost.direct}** عملية ضرب **${sepCost.separable}** فقط.`),
      ],
    },
  ],
});

// ---------- Frequency, low-pass and high-pass ----------
export const frequency = defineWalkthrough({
  id: "ip3-frequency",
  title: bi("Frequency: how fast grey levels change", "التردد: مدى سرعة تغيّر مستويات الرمادي"),
  analogy: bi(
    "A music equalizer. Low-pass turns the treble down and leaves a smooth, muffled bass; high-pass turns the bass down and leaves only the hiss and the clicks.",
    "معادِل الصوت (equalizer): التمرير المنخفض يخفض الطبقات الحادة ويترك صوتًا جهيرًا ناعمًا مكتومًا؛ والتمرير المرتفع يخفض الطبقات الجهيرة ولا يترك إلا الهسيس والطقطقات.",
  ),
  panels: [
    {
      id: "profile",
      pill: bi("One row as a curve", "صف واحد على هيئة منحنى"),
      heading: bi("Slow changes and fast changes", "تغيّرات بطيئة وتغيّرات سريعة"),
      points: [
        bi("**Frequency** measures how much the grey values change with distance. Plot one image row and read it left to right.", "**التردد (frequency)** مقياس لمقدار تغيّر القيم الرمادية مع المسافة. ارسم صفًا واحدًا من الصورة واقرأه من اليسار إلى اليمين."),
        bi("A gentle ramp is **low frequency**; a sudden edge and fine texture or noise are **high frequency**.", "المنحدر اللطيف **تردد منخفض**؛ أما الحافة المفاجئة والنسيج الدقيق أو الضوضاء فهي **تردد مرتفع**."),
      ],
    },
    {
      id: "low-pass",
      pill: bi("Low-pass", "التمرير المنخفض"),
      heading: bi("Low-pass keeps the slow changes", "التمرير المنخفض يُبقي التغيّرات البطيئة"),
      control: {
        label: bi("Filter", "المرشح"),
        options: [
          { id: "mean", label: bi("5-pixel mean", "متوسط 5 بكسلات") },
          { id: "gaussian", label: bi("Gaussian", "غاوس") },
        ],
        initial: "mean",
      },
      points: [bi("A **low-pass** filter (positive coefficients adding up to 1) keeps the flat parts and the ramp, rounds off the edge and wipes out the texture.", "مرشح **التمرير المنخفض (low-pass)** (معاملاته موجبة ومجموعها 1) يُبقي الأجزاء المستوية والمنحدر، ويُليّن الحافة، ويمحو النسيج الدقيق.")],
      pointsFor: {
        mean: [bi("The mean weights every pixel equally, so the edge becomes a straight ramp.", "المتوسط يعطي كل البكسلات الوزن نفسه، فتتحول الحافة إلى منحدر مستقيم.")],
        gaussian: [bi("The **Gaussian** weights the centre most, so the blur is gentler and looks more natural.", "مرشح **غاوس (Gaussian)** يعطي المركز الوزن الأكبر، فيكون التضبيب ألطف ويبدو أكثر طبيعية.")],
      },
    },
    {
      id: "high-pass",
      pill: bi("High-pass", "التمرير المرتفع"),
      heading: bi("High-pass keeps only the changes", "التمرير المرتفع لا يُبقي إلا التغيّرات"),
      points: [
        bi("A **high-pass** filter (coefficients adding up to 0) turns the flat parts and the gentle ramp into about 0.", "مرشح **التمرير المرتفع (high-pass)** (مجموع معاملاته 0) يحوّل الأجزاء المستوية والمنحدر اللطيف إلى ما يقارب 0."),
        bi("What survives is the edge and the texture. Here it is the row minus its low-pass version, the mask δ − mean.", "وما يبقى هو الحافة والنسيج الدقيق. وهنا هو الصف مطروحًا منه نسخته منخفضة التمرير، أي القناع δ − mean."),
      ],
    },
    {
      id: "sigma",
      pill: bi("Gaussian σ", "قيمة σ في غاوس"),
      heading: bi("σ sets how strong the blur is", "تحدد σ شدة التضبيب"),
      control: {
        label: bi("Standard deviation", "الانحراف المعياري"),
        options: [
          { id: "s1", label: bi("σ = 1", "σ = 1") },
          { id: "s3", label: bi("σ = 3", "σ = 3") },
        ],
        initial: "s1",
      },
      points: [bi("The Gaussian weights follow e^(−x²/2σ²): the bigger the **standard deviation σ**, the wider the bell and the more pixels share the average.", "تتبع أوزان غاوس (Gaussian) الدالة e^(−x²/2σ²): فكلما كبر **الانحراف المعياري (sigma) σ** اتسع الجرس وشارك عدد أكبر من البكسلات في المتوسط.")],
      pointsFor: {
        s1: [bi("Small σ: the weights fall off fast, so the edge is only slightly smoothed.", "قيمة σ صغيرة: تتناقص الأوزان بسرعة، فلا تُنعَّم الحافة إلا قليلًا.")],
        s3: [bi("Large σ: the weights spread wide, so the edge becomes a long, soft ramp.", "قيمة σ كبيرة: تنتشر الأوزان على مدى واسع، فتصبح الحافة منحدرًا طويلًا ناعمًا.")],
      },
    },
  ],
});

// ---------- The Laplacian ----------
const lap = edgeLaplacian();
const oneMask = edgeSharpenedOneMask();
if (oneMask.join() !== sharpRaw.join()) throw new Error(`ip-lecture-03: the one-mask sharpener ${oneMask} differs from f − ∇²f ${sharpRaw}`);
const dir = (d: keyof typeof DIRECTIONAL) => ({
  own: respond(DIRECTIONAL[d], EDGE_PATCHES[d]),
  horizontal: respond(DIRECTIONAL[d], EDGE_PATCHES.horizontal),
  vertical: respond(DIRECTIONAL[d], EDGE_PATCHES.vertical),
  diagonal: respond(DIRECTIONAL[d], EDGE_PATCHES.diagonal),
});
const dirH = dir("horizontal");
const dirV = dir("vertical");
const dirD = dir("diagonal");

export const laplacian = defineWalkthrough({
  id: "ip3-laplacian",
  title: bi("The Laplacian: a second derivative as a mask", "لابلاسيان: مشتقة ثانية على هيئة قناع"),
  analogy: bi(
    "A bump detector on a road: on a flat stretch or a steady slope it reads 0, but where the road suddenly changes it kicks up on one side and down on the other.",
    "كاشف مطبّات على طريق: يقرأ 0 على المقطع المستوي أو المنحدر الثابت، لكنه حيث يتغير الطريق فجأة يقفز إلى الأعلى من جانب وإلى الأسفل من الجانب الآخر.",
  ),
  facts: { dark: lap[2], bright: lap[3], sharpened: listOf(sharpRaw.map((v) => clip(v))) },
  panels: [
    {
      id: "second-difference",
      pill: bi("Second difference", "الفرق الثاني"),
      heading: bi("f(x+1) + f(x−1) − 2f(x) along a row", "f(x+1) + f(x−1) − 2f(x) على طول صف"),
      points: [
        bi("The second derivative is approximated by f(x+1) + f(x−1) − 2f(x). It is **0** wherever the row is flat or a straight ramp.", "تُقرَّب المشتقة الثانية (second derivative) بالمقدار f(x+1) + f(x−1) − 2f(x)، وتساوي **0** حيثما كان الصف مستويًا أو منحدرًا مستقيمًا."),
        bi(`At the 20 | 80 edge it gives **${lap[2]}** on the dark side and **${n(lap[3])}** on the bright side; the **zero-crossing** between them marks the edge.`, `وعند الحافة 20 | 80 تعطي **${lap[2]}** على الجانب الداكن و **${n(lap[3])}** على الجانب الساطع؛ وتحدد **نقطة عبور الصفر (zero-crossing)** بينهما موضع الحافة.`),
      ],
    },
    {
      id: "masks",
      pill: bi("The masks", "الأقنعة"),
      heading: bi("Across plus down gives h1", "الأفقي مع الرأسي يعطي h1"),
      control: {
        label: bi("Mask", "القناع"),
        options: [
          { id: "h1", label: bi("h1", "h1") },
          { id: "h2", label: bi("h2 = −h1", "h2 = −h1") },
          { id: "h3", label: bi("h3, diagonals", "h3 مع الأقطار") },
        ],
        initial: "h1",
      },
      points: [bi("Every Laplacian mask's coefficients **add up to 0**, so flat regions give 0: it is a **high-pass** filter.", "مجموع معاملات كل قناع لابلاسيان (Laplacian) **صفر**، فتعطي المناطق المستوية 0: إنه مرشح **تمرير مرتفع (high-pass)**.")],
      pointsFor: {
        h1: [bi("[1 −2 1] across plus [1 −2 1] down gives h1, with −4 at the centre. It treats x and y alike: **isotropic** for 90° turns.", "الفرق [1 −2 1] أفقيًا مع [1 −2 1] رأسيًا يعطي h1، وفي مركزه −4. وهو يعامل x و y بالتساوي: **متماثل الاتجاهات (isotropic)** عند التدوير بزاوية 90°.")],
        h2: [bi("h2 is −h1: a positive centre, the same edges with the sign flipped. Both are used just as often.", "القناع h2 هو −h1: مركزه موجب، ويعطي الحواف نفسها بإشارة معكوسة. ويُستخدم الاثنان بالقدر نفسه.")],
        h3: [bi("Adding the four diagonal neighbours gives −8 at the centre: isotropic in 45° steps.", "إضافة الجيران القُطريين الأربعة تعطي −8 في المركز: فيصبح متماثل الاتجاهات (isotropic) لخطوات مقدارها 45°.")],
      },
    },
    {
      id: "response",
      pill: bi("Edge response", "استجابة الحافة"),
      heading: bi(`Flat regions vanish; the edge becomes ${lap[2]} | ${n(lap[3])}`, `تختفي المناطق المستوية، وتصبح الحافة ${lap[2]} | ${n(lap[3])}`),
      points: [
        bi(`Filtered with h1 (borders replicated), every row 20, 20, 20, 80, 80 becomes ${en(lap)}.`, `بعد الترشيح بالقناع h1 (مع تكرار الحدود (replicate)) يصبح كل صف 20، 20، 20، 80، 80 هو ${ar(lap)}.`),
        bi("Shown as an image, featureless regions turn dark and only the discontinuities remain. It is also very **noise-sensitive**.", "عند عرض النتيجة صورةً تصبح المناطق الخالية من التفاصيل داكنة ولا يبقى إلا الانقطاعات (discontinuities). وهو أيضًا **شديد الحساسية للضوضاء (noise)**."),
      ],
    },
    {
      id: "enhance",
      pill: bi("Edge enhancement", "تحسين الحواف"),
      heading: bi("Subtract the Laplacian to sharpen", "اطرح لابلاسيان لإبراز الصورة"),
      control: {
        label: bi("Compute with", "احسب باستخدام"),
        options: [
          { id: "h1", label: bi("h1", "h1") },
          { id: "h2", label: bi("h2", "h2") },
          { id: "one", label: bi("One mask", "قناع واحد") },
        ],
        initial: "h1",
      },
      points: [
        bi(`Every route gives ${en(sharpRaw)}, clipped to **${en(sharpClipped)}**: the dark side gets darker, the bright side brighter.`, `كل الطرق تعطي ${ar(sharpRaw)}، وبعد القصّ (clipping) **${ar(sharpClipped)}**: يزداد الجانب الداكن قتامة والجانب الساطع سطوعًا.`),
      ],
      pointsFor: {
        h1: [bi(`h1 has a negative centre, so its output is ∇²f and you **subtract** it: 20 − ${lap[2]} = ${n(sharpRaw[2])} and 80 − (${n(lap[3])}) = ${sharpRaw[3]}.`, `مركز h1 سالب، فناتجه هو ∇²f و**يُطرح**: 20 − ${lap[2]} = ${n(sharpRaw[2])} و 80 − (${n(lap[3])}) = ${sharpRaw[3]}.`)],
        h2: [bi("h2's output is −∇²f, so you **add** it. That is what the slide's \"f + ∇²f, using h2\" means.", "ناتج h2 هو −∇²f، لذا **يُضاف**. وهذا هو معنى «f + ∇²f باستخدام h2» في الشريحة.")],
        one: [bi(`δ − h1 folds both steps into one mask with **5** at the centre: 5·80 − (80 + 80 + 20 + 80) = ${sharpRaw[3]}.`, `المقدار δ − h1 يدمج الخطوتين في قناع واحد في مركزه **5**: 5·80 − (80 + 80 + 20 + 80) = ${sharpRaw[3]}.`)],
      },
    },
    {
      id: "directional",
      pill: bi("Directional masks", "الأقنعة الاتجاهية"),
      heading: bi("A negative side and a positive side", "جانب سالب وجانب موجب"),
      control: {
        label: bi("Mask", "القناع"),
        options: [
          { id: "horizontal", label: bi("h2: horizontal", "h2: أفقي") },
          { id: "vertical", label: bi("h3: vertical", "h3: رأسي") },
          { id: "diagonal", label: bi("h1: diagonal", "h1: قُطري") },
        ],
        initial: "horizontal",
      },
      points: [bi(`Each mask compares one side of the window with the opposite side, so it answers most strongly (**${dirH.own}** here) to edges in its own direction.`, `كل قناع يقارن جانبًا من النافذة بالجانب المقابل، لذا تكون استجابته أقوى ما تكون (**${dirH.own}** هنا) للحواف في اتجاهه.`)],
      pointsFor: {
        horizontal: [bi(`h2 subtracts the row above from the row below: ${dirH.horizontal} for a **horizontal** edge, ${dirH.vertical} for a vertical one.`, `يطرح h2 الصف العلوي من الصف السفلي: ${dirH.horizontal} للحافة **الأفقية** و ${dirH.vertical} للرأسية.`)],
        vertical: [bi(`h3 subtracts the left column from the right one: ${dirV.vertical} for a **vertical** edge, ${dirV.horizontal} for a horizontal one.`, `يطرح h3 العمود الأيسر من العمود الأيمن: ${dirV.vertical} للحافة **الرأسية** و ${dirV.horizontal} للأفقية.`)],
        diagonal: [bi(`h1 compares two opposite corners: ${dirD.diagonal} for a **diagonal** edge, ${dirD.horizontal} for the others.`, `يقارن h1 ركنين متقابلين: ${dirD.diagonal} للحافة **القُطرية** و ${dirD.horizontal} للحواف الأخرى.`)],
      },
    },
  ],
});

// ---------- Unsharp masking and high-boost filtering ----------
const un = edgeUnsharp(2);
const hb = { a0: edgeHighBoost(0), a1: edgeHighBoost(1), a17: edgeHighBoost(1.7) };

export const unsharp = defineWalkthrough({
  id: "ip3-unsharp",
  title: bi("Sharpening by subtracting a blur", "الإبراز بطرح نسخة مُضبَّبة"),
  analogy: bi(
    "A caricature: compare a face with a blurred, average version of itself and exaggerate the differences. The features that stand out are its edges.",
    "الرسم الكاريكاتيري: قارن الوجه بنسخة مُضبَّبة متوسطة منه، ثم بالِغ في الفروق. والملامح التي تبرز هي حوافه.",
  ),
  facts: { difference: listOf(un.difference), boost2: listOf(un.boosted) },
  panels: [
    {
      id: "difference",
      pill: bi("Blur, then subtract", "التضبيب ثم الطرح"),
      heading: bi("The blur misses the edge; the difference finds it", "التضبيب يفوّت الحافة، والفرق يجدها"),
      points: [
        bi(`The 3×3 mean turns the edge's interior ${en(un.f)} into **${en(un.blurred)}**.`, `يحوّل مرشح المتوسط 3×3 البكسلات الداخلية للحافة ${ar(un.f)} إلى **${ar(un.blurred)}**.`),
        bi(`So f − f̄ is **${en(un.difference)}**: 0 where the image is flat, negative just before the edge, positive just after it.`, `لذا يكون f − f̄ هو **${ar(un.difference)}**: صفر حيث الصورة مستوية، وسالب قبل الحافة مباشرةً، وموجب بعدها مباشرةً.`),
      ],
    },
    {
      id: "add-back",
      pill: bi("Add it back", "أضِفه إلى الأصل"),
      heading: bi("The difference alone is only edges", "الفرق وحده حواف فقط"),
      control: {
        label: bi("Show", "اعرض"),
        options: [
          { id: "alone", label: bi("f − f̄ alone", "f − f̄ وحده") },
          { id: "added", label: bi("f + (f − f̄)", "f + (f − f̄)") },
        ],
        initial: "alone",
      },
      points: [bi("f − f̄ is a **high-pass** image: flat areas become 0, whatever their brightness.", "الصورة f − f̄ صورة **تمرير مرتفع (high-pass)**: تصبح المناطق المستوية 0 مهما كان سطوعها.")],
      pointsFor: {
        alone: [bi("Displayed on its own it looks like an edge map, not a sharper photograph.", "وعند عرضها وحدها تبدو خريطة حواف، لا صورة أكثر حدة.")],
        added: [bi(`Added to the original it gives 2f − f̄ = **${en(un.boosted)}**: a dip before the edge and an overshoot after it, so the edge looks crisper.`, `وبإضافتها إلى الأصل نحصل على 2f − f̄ = **${ar(un.boosted)}**: انخفاض قبل الحافة وتجاوز (overshoot) بعدها، فتبدو الحافة أوضح.`)],
      },
    },
    {
      id: "pipeline",
      pill: bi("One mask", "قناع واحد"),
      heading: bi("Blur, scale, subtract: one filter", "التضبيب والضرب والطرح: مرشح واحد"),
      points: [
        bi("In practice only a fraction 1/A of the blur is subtracted: original → blur → scale → subtract → scale for display.", "عمليًا لا يُطرح إلا جزء 1/A من الصورة المُضبَّبة: الأصل ← التضبيب ← الضرب في ثابت ← الطرح ← التحجيم للعرض."),
        bi("Filtering is linear, so the steps fold into one mask: δ − (1/A)·mean, which is proportional to A·δ − mean.", "والترشيح خطي (linear)، لذا تندمج الخطوات في قناع واحد: δ − (1/A)·mean، وهو متناسب مع A·δ − mean."),
      ],
    },
    {
      id: "high-boost",
      pill: bi("Boost coefficient A", "معامل التعزيز A"),
      heading: bi("A decides how much of the original comes back", "يحدد A مقدار ما يعود من الأصل"),
      control: {
        label: bi("Boost", "التعزيز"),
        options: [
          { id: "a0", label: bi("A = 0", "A = 0") },
          { id: "a1", label: bi("A = 1", "A = 1") },
          { id: "a17", label: bi("A = 1.7", "A = 1.7") },
        ],
        initial: "a1",
      },
      points: [bi("**High-boost**: f_hb = A·f − f̄ = (A − 1)·f + f_s. With the Laplacian sharpening f_s = f − ∇²f, the mask has **A + 4** at its centre.", "**الترشيح عالي التعزيز (high-boost)**: f_hb = A·f − f̄ = (A − 1)·f + f_s. ومع إبراز لابلاسيان f_s = f − ∇²f يكون في مركز القناع **A + 4**.")],
      pointsFor: {
        a0: [bi(`A = 0: centre 4, the pure Laplacian h2. The edge row becomes ${en(hb.a0)}: edges only.`, `A = 0: المركز 4، أي لابلاسيان خالص h2. ويصبح صف الحافة ${ar(hb.a0)}: حواف فقط.`)],
        a1: [bi(`A = 1: centre 5, ordinary Laplacian sharpening: ${en(hb.a1)}.`, `A = 1: المركز 5، أي إبراز لابلاسيان العادي: ${ar(hb.a1)}.`)],
        a17: [bi(`A = 1.7: centre 5.7. Every pixel keeps 0.7 more of itself, so the result is sharp **and** brighter: ${en(hb.a17)}.`, `A = 1.7: المركز 5.7. يحتفظ كل بكسل بمقدار 0.7 إضافي من نفسه، فتكون النتيجة حادة **و**أسطع: ${ar(hb.a17)}.`)],
      },
    },
  ],
});

// ---------- Non-linear filters ----------
const s36 = slide36();

export const nonlinear = defineWalkthrough({
  id: "ip3-nonlinear",
  title: bi("Sort the window, then pick", "رتّب النافذة ثم انتقِ"),
  analogy: bi(
    "Scoring a dive: the judges' highest and lowest marks are thrown out before averaging, so one biased judge can't swing the result. Keeping only the middle mark is the median.",
    "تقييم قفزة غطس: تُستبعد أعلى درجة وأدنى درجة من درجات الحكام قبل حساب المتوسط، فلا يستطيع حكم منحاز واحد أن يغيّر النتيجة. والاكتفاء بالدرجة الوسطى وحدها هو الوسيط.",
  ),
  facts: { sorted: listOf(s36.sorted), median: s36.median, mean: s36.mean, max: s36.max, min: s36.min, trimmed: s36.trimmed },
  panels: [
    {
      id: "sort",
      pill: bi("Sort the window", "رتّب النافذة"),
      heading: bi("The median ignores the outlier", "الوسيط يتجاهل القيمة الشاذة"),
      points: [
        bi(`A **non-linear** filter sorts the 9 values under the mask instead of weighting them: ${en(s36.sorted)}.`, `المرشح **غير الخطي (non-linear)** يرتّب القيم التسع الواقعة تحت القناع بدلًا من وزنها: ${ar(s36.sorted)}.`),
        bi(`The **median** is the 5th value, **${s36.median}**, so the outlier 70 at the centre is replaced by a value from its own neighbourhood.`, `**الوسيط (median)** هو القيمة الخامسة **${s36.median}**، فتُستبدل القيمة الشاذة 70 في المركز بقيمة من جوارها نفسه.`),
      ],
    },
    {
      id: "rank",
      pill: bi("Rank-order filters", "مرشحات الرتبة"),
      heading: bi("Pick a position in the sorted list", "اختر موضعًا في القائمة المرتبة"),
      control: {
        label: bi("Rank", "الرتبة"),
        options: [
          { id: "min", label: bi("Min (1st)", "الأدنى (الأولى)") },
          { id: "median", label: bi("Median (5th)", "الوسيط (الخامسة)") },
          { id: "max", label: bi("Max (9th)", "الأقصى (التاسعة)") },
        ],
        initial: "median",
      },
      points: [bi("A **rank-order** filter returns the value at a chosen position (its **rank**) in the sorted window.", "**مرشح الرتبة (rank-order filter)** يعيد القيمة الموجودة في موضع محدد (**رتبتها (rank)**) من النافذة المرتبة.")],
      pointsFor: {
        min: [bi(`Rank 1, the **minimum** filter: **${s36.min}**. It darkens the image and removes salt (bright) pixels.`, `الرتبة 1، مرشح **الأدنى (min)**: **${s36.min}**. يُعتِم الصورة ويزيل بكسلات الملح (الساطعة).`)],
        median: [bi(`Rank 5 of 9, the **median**: **${s36.median}**. It is the most popular rank-order filter.`, `الرتبة 5 من 9، **الوسيط (median)**: **${s36.median}**. وهو أشهر مرشحات الرتبة.`)],
        max: [bi(`Rank 9, the **maximum** filter: **${s36.max}**. It brightens the image and removes pepper (dark) pixels.`, `الرتبة 9، مرشح **الأقصى (max)**: **${s36.max}**. يزيد سطوع الصورة ويزيل بكسلات الفلفل (الداكنة).`)],
      },
    },
    {
      id: "trimmed",
      pill: bi("Alpha-trimmed mean", "المتوسط المُشذَّب ألفا"),
      heading: bi("Trim both ends, average the rest", "احذف من الطرفين واحسب متوسط الباقي"),
      control: {
        label: bi("Trim at each end", "المحذوف من كل طرف"),
        options: [
          { id: "t0", label: bi("None", "لا شيء") },
          { id: "t2", label: bi("2 values", "قيمتان") },
          { id: "t4", label: bi("4 values", "4 قيم") },
        ],
        initial: "t2",
      },
      points: [bi("The **alpha-trimmed mean** sorts, drops values from **both ends** and averages what is left, so it lies between the mean and the median.", "**المتوسط المُشذَّب ألفا (alpha-trimmed mean)** يرتّب القيم، ويحذف بعضها من **الطرفين**، ويحسب متوسط الباقي، لذا يقع بين المتوسط والوسيط.")],
      pointsFor: {
        t0: [bi(`Trim nothing: the plain mean, **${s36.mean}**, dragged up by the single 70.`, `دون حذف: المتوسط العادي **${s36.mean}**، وقد رفعته القيمة 70 وحدها.`)],
        t2: [bi(`Trim 2 at each end: (5 + 7 + 8 + 10 + 12)/5 = **${s36.trimmed}**.`, `حذف قيمتين من كل طرف: (5 + 7 + 8 + 10 + 12)/5 = **${s36.trimmed}**.`)],
        t4: [bi(`Trim 4 at each end: only the middle value is left, the median **${s36.median}**.`, `حذف 4 قيم من كل طرف: لا تبقى إلا القيمة الوسطى، أي الوسيط **${s36.median}**.`)],
      },
    },
    {
      id: "salt-pepper",
      pill: bi("Salt-and-pepper noise", "ضوضاء الملح والفلفل"),
      heading: bi("Median or mean on impulse noise", "الوسيط أم المتوسط على الضوضاء النبضية"),
      control: {
        label: bi("Filter", "المرشح"),
        options: [
          { id: "mean", label: bi("3×3 mean", "المتوسط 3×3") },
          { id: "median", label: bi("3×3 median", "الوسيط 3×3") },
        ],
        initial: "mean",
      },
      points: [bi("The picture has an edge (40 | 200) sprinkled with **salt** (255) and **pepper** (0) pixels.", "في الصورة حافة (40 | 200) تتناثر عليها بكسلات **ملح (salt)** (255) و**فلفل (pepper)** (0).")],
      pointsFor: {
        mean: [bi("The mean spreads every impulse into a grey blotch and blurs the edge into a ramp.", "المتوسط ينشر كل نبضة في بقعة رمادية، ويحوّل الحافة إلى منحدر مُضبَّب.")],
        median: [bi("Each impulse sits at an end of its sorted window and is never picked: the noise is gone and the edge stays **exactly** where it was.", "تقع كل نبضة في أحد طرفي نافذتها المرتبة فلا تُختار أبدًا: فتختفي الضوضاء وتبقى الحافة **تمامًا** في موضعها.")],
      },
    },
  ],
});

/** Every walkthrough in this lecture, registered in lib/walkthroughs/index.ts. */
export const all = [spatial, meanFilter, separable, frequency, laplacian, unsharp, nonlinear] as const;

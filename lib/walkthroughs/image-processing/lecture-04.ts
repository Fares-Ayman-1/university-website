import { bi } from "@/components/widgets/types";
import { defineWalkthrough } from "@/lib/widgets/walkthrough";
import { fmtNum } from "@/lib/widgets/ip-lecture-05";
import {
  breakEven,
  COST_SIZE,
  EX,
  exRow,
  filterTest,
  freqPerPixel,
  h2,
  INVERSE_N,
  inverseAt,
  maxJump,
  re,
  RING_D0,
  ripple,
  ROWS,
  SPECTRA,
  spectrumText,
  spatialPerPixel,
  STRIPES_F,
  STRIPES_FC,
  TEST_D0,
} from "@/lib/widgets/ip-lecture-04";

/*
 * Image Processing · Lecture 4 (from the course book's Chapter 4). One walkthrough per heading;
 * the scenes are in components/widgets/walkthrough/scenes/image-processing/lecture-04/. Every
 * number the points quote is computed in lib/widgets/ip-lecture-04.ts, the same code the
 * scenes draw, and the page's `expect` facts check them against the worked examples.
 */

// ---------- 4.1 Introduction ----------
export const intro = defineWalkthrough({
  id: "ip4-intro",
  title: bi("Spatial and frequency domains", "المجالان المكاني والترددي"),
  analogy: bi(
    "A sound recording and its sheet music. The recording gives the air pressure at every instant; the score lists which notes are played and how loudly. Same music, two descriptions, and you can go from either one to the other.",
    "التسجيل الصوتي ونوتته الموسيقية: فالتسجيل يعطي ضغط الهواء في كل لحظة، والنوتة تسرد النغمات التي تُعزف ومدى علوّها. الموسيقى نفسها بوصفين مختلفين، ويمكنك الانتقال من أيٍّ منهما إلى الآخر.",
  ),
  panels: [
    {
      id: "decompose",
      pill: bi("A sum of waves", "مجموع موجات"),
      heading: bi("A signal is several sinusoids added together", "الإشارة عدة دوال جيبية مجموعة معًا"),
      control: {
        label: bi("Show", "اعرض"),
        options: [
          { id: "sum", label: bi("The signal", "الإشارة") },
          { id: "parts", label: bi("Its components", "مركباتها") },
        ],
        initial: "sum",
      },
      points: [
        bi(
          "The Fourier transform **breaks a signal into sinusoidal components** of different frequencies and amplitudes.",
          "يفكّك تحويل فورييه (Fourier transform) **الإشارة إلى مركبات جيبية (sinusoidal components)** بترددات وسعات (amplitudes) مختلفة.",
        ),
        bi(
          "On the right, the same signal in the **frequency domain**: one spike per frequency present, as tall as its amplitude.",
          "وعلى اليمين الإشارة نفسها في **المجال الترددي (frequency domain)**: قمة حادة (spike) واحدة لكل تردد موجود، ارتفاعها بقدر سعته.",
        ),
      ],
      pointsFor: {
        sum: [bi("As a whole the wavy curve is hard to read: which frequencies does it contain, and how strong are they?", "المنحنى المتموج كله صعب القراءة: ما الترددات التي يحتويها، وما مدى قوتها؟")],
        parts: [
          bi(
            "Split apart: a **strong slow wave** (frequency 1) and two weaker, faster ones (3 and 7), exactly the three spikes.",
            "بعد الفصل: **موجة بطيئة قوية** (التردد 1) وموجتان أضعف وأسرع (3 و 7)، وهي بالضبط القمم الثلاث.",
          ),
        ],
      },
    },
    {
      id: "rate",
      pill: bi("Frequency = rate of change", "التردد = معدل التغيّر"),
      heading: bi("In an image, frequency is how fast pixel values change", "التردد في الصورة هو سرعة تغيّر قيم البكسلات"),
      control: {
        label: bi("Row", "الصف"),
        options: [
          { id: "smooth", label: bi("Gentle ramp", "منحدر لطيف") },
          { id: "edge", label: bi("Sudden edge", "حافة مفاجئة") },
          { id: "noise", label: bi("Noise", "ضوضاء") },
        ],
        initial: "smooth",
      },
      points: [bi("Along a row of pixels, **frequency** measures how quickly the values rise and fall from one pixel to the next.", "على امتداد صف من البكسلات يقيس **التردد (frequency)** مدى سرعة ارتفاع القيم وانخفاضها من بكسل إلى الذي يليه.")],
      pointsFor: {
        smooth: [
          bi(
            `The ramp changes by only **${maxJump(ROWS.smooth)}** per pixel: a **low** frequency, like smooth areas and lighting.`,
            `يتغير المنحدر بمقدار **${maxJump(ROWS.smooth)}** فقط لكل بكسل: تردد **منخفض**، مثل المناطق الملساء والإضاءة.`,
          ),
        ],
        edge: [
          bi(
            `The step jumps by **${maxJump(ROWS.edge)}** in a single pixel: a **high** frequency, which is what edges are made of.`,
            `تقفز الدرجة بمقدار **${maxJump(ROWS.edge)}** في بكسل واحد: تردد **مرتفع**، ومن مثله تتكون الحواف (edges).`,
          ),
        ],
        noise: [
          bi(
            `Values jump up and down by as much as **${maxJump(ROWS.noise)}**: noise is high frequency too, so filters that remove it also soften edges.`,
            `تقفز القيم صعودًا وهبوطًا بما يصل إلى **${maxJump(ROWS.noise)}**: فالضوضاء (noise) تردد مرتفع أيضًا، لذا فالمرشحات التي تزيلها تنعّم الحواف كذلك.`,
          ),
        ],
      },
    },
    {
      id: "domains",
      pill: bi("Two domains", "مجالان"),
      heading: bi("The transform goes there, the inverse comes back", "التحويل يذهب والتحويل المعكوس يعود"),
      points: [
        bi(
          "The Fourier transform takes an image from the **spatial domain**, pixel values f(x, y), to the **frequency domain**, F(u, v); the **inverse transform** brings it back unchanged.",
          "ينقل تحويل فورييه الصورة من **المجال المكاني (spatial domain)**، أي قيم البكسلات f(x, y)، إلى **المجال الترددي**، أي F(u, v)؛ ويعيدها **التحويل المعكوس (inverse transform)** دون أي تغيير.",
        ),
        bi("In the Fourier image **each point is one frequency** contained in the original; nothing is lost on the way.", "في صورة فورييه **كل نقطة تردد واحد** موجود في الأصل، ولا يضيع شيء في الطريق."),
      ],
    },
    {
      id: "why",
      pill: bi("Why bother", "لماذا"),
      heading: bi("Three reasons to work with frequencies", "ثلاثة أسباب للعمل بالترددات"),
      points: [
        bi("**Speed**: for a **large** filter, going through the transform is faster than sliding a mask over the image.", "**السرعة**: مع المرشح **الكبير** يكون المرور عبر التحويل أسرع من تحريك قناع (mask) فوق الصورة."),
        bi(
          "**Precision**: low-pass and high-pass filters keep exactly the frequencies we choose. **New tasks**: some jobs, such as removing periodic noise, are practically impossible any other way.",
          "**الدقة**: تُبقي مرشحات التمرير المنخفض والمرتفع بالضبط الترددات التي نختارها. **مهام جديدة**: بعض الأعمال، مثل إزالة الضوضاء الدورية (periodic noise)، يكاد يستحيل تنفيذها بطريقة أخرى.",
        ),
      ],
    },
  ],
});

// ---------- 4.2 The 1-D DFT ----------
const f1 = fmtNum(inverseAt(SPECTRA.smooth, INVERSE_N));

export const dft1d = defineWalkthrough({
  id: "ip4-dft-1d",
  title: bi("The 1-D DFT, by hand", "تحويل DFT أحادي البعد يدويًا"),
  analogy: bi(
    "Holding a signal against template waves. Each frequency k is a template; multiply the signal by it sample by sample and add up, and the total says how well the signal matches that wave.",
    "مقارنة الإشارة بموجات نموذجية: كل تردد k موجة نموذجية، فإذا ضربت الإشارة فيها عينةً عينة ثم جمعت، دلّ المجموع على مدى تطابق الإشارة مع تلك الموجة.",
  ),
  facts: {
    smooth: spectrumText("smooth"),
    alternating: spectrumText("alternating"),
    f1,
  },
  panels: [
    {
      id: "formula",
      pill: bi("The formula", "الصيغة"),
      heading: bi("F[k] = Σ f[n] e^(−i2πkn/N)", "F[k] = Σ f[n] e^(−i2πkn/N)"),
      points: [
        bi(
          "Each output **F[k]** multiplies every sample f[n] by a **complex exponential** that turns k cycles over the N samples, then adds the products.",
          "كل خرج **F[k]** يضرب كل عينة f[n] في **دالة أُسّية مركبة** تُكمل k دورة على امتداد العينات الـ N، ثم يجمع حواصل الضرب.",
        ),
        bi("For N = 4 the exponential (−i)^(kn) only takes the values **1, −i, −1 and i**, so a small DFT is easy by hand.", "عندما N = 4 لا تأخذ الدالة الأُسّية (−i)^(kn) إلا القيم **1 و −i و −1 و i**، لذا يسهل حساب تحويل DFT صغير يدويًا."),
      ],
    },
    {
      id: "worked",
      pill: bi("Worked example", "مثال محلول"),
      heading: bi("Same average, different frequencies", "المتوسط نفسه وترددات مختلفة"),
      control: {
        label: bi("Signal", "الإشارة"),
        options: [
          { id: "smooth", label: bi("f = [4, 2, 0, 2]", "f = [4, 2, 0, 2]") },
          { id: "alternating", label: bi("g = [1, 3, 1, 3]", "g = [1, 3, 1, 3]") },
        ],
        initial: "smooth",
      },
      points: [
        bi(
          "Both signals add up to **8**, so the k = 0 term is 8 for both: with the book's formula it is the **sum** of the samples, N times their mean.",
          "مجموع كلتا الإشارتين **8**، لذا يساوي الحد k = 0 القيمة 8 في الإشارتين: فهو في صيغة الكتاب **مجموع** العينات، أي N مضروبًا في متوسطها.",
        ),
      ],
      pointsFor: {
        smooth: [
          bi(
            `One slow cycle: F = **${spectrumText("smooth")}**, weight at k = 1 and its mirror k = 3, a **low** frequency.`,
            `دورة واحدة بطيئة: F = **${spectrumText("smooth")}**، والوزن عند k = 1 وصورتها المنعكسة k = 3، أي تردد **منخفض**.`,
          ),
        ],
        alternating: [
          bi(
            `It flips at every sample: G = **${spectrumText("alternating")}**, all at k = 2 = N/2, the **highest** frequency four samples can hold.`,
            `تنقلب الإشارة عند كل عينة: G = **${spectrumText("alternating")}**، والوزن كله عند k = 2 = N/2، وهو **أعلى** تردد تحمله أربع عينات.`,
          ),
        ],
      },
    },
    {
      id: "inverse",
      pill: bi("Back again", "العودة"),
      heading: bi("f[n] = (1/N) Σ F[k] e^(i2πkn/N)", "f[n] = (1/N) Σ F[k] e^(i2πkn/N)"),
      points: [
        bi("The **inverse DFT** adds the weighted waves back up, with a **plus** sign in the exponent and the **1/N** in front.", "يجمع **التحويل المعكوس (inverse DFT)** الموجات الموزونة من جديد، مع إشارة **موجبة** في الأُس والمعامل **1/N** في المقدمة."),
        bi(`For n = 1 the exponential is i^k: (1/4)(8 + 4i + 0 − 4i) = **${f1}**, the second sample of f.`, `عند n = 1 تكون الدالة الأُسّية i^k: (1/4)(8 + 4i + 0 − 4i) = **${f1}**، وهي العينة الثانية من f.`),
      ],
    },
  ],
});

// ---------- 4.3 The 2-D DFT ----------
export const dft2d = defineWalkthrough({
  id: "ip4-dft-2d",
  title: bi("The 2-D DFT of an image", "تحويل DFT ثنائي البعد للصورة"),
  analogy: bi(
    "A city map with the town square in the middle. Once the spectrum is centred, the calm low frequencies live downtown and the busy high frequencies out in the suburbs: a point's distance from the centre tells how fast its pattern changes.",
    "خريطة مدينة ميدانها الرئيسي في المنتصف: فبعد توسيط الطيف تسكن الترددات المنخفضة الهادئة وسط المدينة، وتسكن الترددات المرتفعة الصاخبة الضواحي، وبُعد النقطة عن المركز يخبرك بمدى سرعة تغيّر نمطها.",
  ),
  facts: {
    F00: re(STRIPES_F, 0, 0),
    F02: re(STRIPES_F, 0, 2),
    Fc22: re(STRIPES_FC, 2, 2),
    Fc20: re(STRIPES_FC, 2, 0),
  },
  panels: [
    {
      id: "pair",
      pill: bi("Forward and inverse", "الأمامي والمعكوس"),
      heading: bi("F(u, v) from f(x, y), and back", "F(u, v) من f(x, y)، ثم العودة"),
      points: [
        bi(
          "The **forward** transform has the minus sign and, in this lecture, the **1/MN**; the **inverse** has the plus sign and rebuilds f exactly.",
          "للتحويل **الأمامي (forward)** الإشارة السالبة، والمعامل **1/MN** في هذه المحاضرة؛ أما **المعكوس** فله الإشارة الموجبة ويعيد بناء f تمامًا.",
        ),
        bi("Each F(u, v) = R + iI is complex: its **magnitude** √(R² + I²) is the spectrum, its **angle** tan⁻¹(I/R) the phase.", "كل F(u, v) = R + iI عدد مركب (complex): **مقداره** √(R² + I²) هو الطيف (spectrum)، و**زاويته** tan⁻¹(I/R) هي الطور (phase)."),
      ],
    },
    {
      id: "worked",
      pill: bi("Worked example", "مثال محلول"),
      heading: bi("A 4 × 4 image of stripes", "صورة خطوط 4 × 4"),
      control: {
        label: bi("Spectrum", "الطيف"),
        options: [
          { id: "computed", label: bi("As computed", "كما حُسب") },
          { id: "centred", label: bi("Centred", "بعد التوسيط") },
        ],
        initial: "computed",
      },
      points: [bi("Every row is 2, 4, 2, 4: the mean **3** plus the fastest pattern across the columns.", "كل صف هو 2، 4، 2، 4: المتوسط **3** مضافًا إليه أسرع نمط عبر الأعمدة.")],
      pointsFor: {
        computed: [
          bi(
            `Only **F(0, 0) = ${re(STRIPES_F, 0, 0)}** (the mean) and **F(0, 2) = ${re(STRIPES_F, 0, 2).replace("-", "−")}** (the stripes) are non-zero, and the DC term sits in the top-left **corner**.`,
            `لا تختلف عن الصفر إلا **F(0, 0) = ${re(STRIPES_F, 0, 0)}** (المتوسط) و **F(0, 2) = ${re(STRIPES_F, 0, 2).replace("-", "−")}** (الخطوط)، وتقع المركبة المستمرة (DC) في **الركن** العلوي الأيسر.`,
          ),
        ],
        centred: [
          bi(
            `Multiply by (−1)^(x+y) first and both move by (2, 2): the DC term to the **centre**, F(2, 2) = ${re(STRIPES_FC, 2, 2)}, the stripes to the **border**, F(2, 0) = ${re(STRIPES_FC, 2, 0).replace("-", "−")}.`,
            `اضرب في (−1)^(x+y) أولًا فينتقل المعاملان بمقدار (2, 2): المركبة المستمرة إلى **المركز**، F(2, 2) = ${re(STRIPES_FC, 2, 2)}، والخطوط إلى **الحافة**، F(2, 0) = ${re(STRIPES_FC, 2, 0).replace("-", "−")}.`,
          ),
        ],
      },
    },
    {
      id: "symmetry",
      pill: bi("Symmetry", "التناظر"),
      heading: bi("|F(u, v)| = |F(−u, −v)| for a real image", "|F(u, v)| = |F(−u, −v)| للصورة الحقيقية القيم"),
      points: [
        bi(
          "For a **real** image F(−u, −v) is the complex conjugate of F(u, v), so the spectrum is **symmetric about the centre** and half of it is redundant.",
          "في الصورة **الحقيقية القيم** يكون F(−u, −v) المرافق المركب (complex conjugate) لـ F(u, v)، لذا يكون الطيف **متناظرًا حول المركز** ونصفه زائد عن الحاجة.",
        ),
        bi("The transform is also **periodic**, F(u + M, v + N) = F(u, v), which is why −u can be read as M − u.", "والتحويل أيضًا **دوري (periodic)**، F(u + M, v + N) = F(u, v)، ولهذا يمكن قراءة −u على أنها M − u."),
      ],
    },
    {
      id: "block",
      pill: bi("Wide ↔ narrow", "عريض ↔ ضيق"),
      heading: bi("A block and its spectrum (Figure 4.2)", "كتلة وطيفها (الشكل 4.2)"),
      control: {
        label: bi("Block", "الكتلة"),
        options: [
          { id: "wide", label: bi("Wide", "عريضة") },
          { id: "tall", label: bi("Tall", "طويلة") },
        ],
        initial: "wide",
      },
      points: [bi("A rectangular block gives a spectrum with a bright central peak and fainter ripples around it.", "تعطي الكتلة المستطيلة طيفًا فيه قمة مركزية ساطعة تحيط بها تموجات أخفت.")],
      pointsFor: {
        wide: [bi("The block is **long across**, so its spectrum is **contracted across** and spread out up and down.", "الكتلة **طويلة أفقيًا**، لذا يكون طيفها **منكمشًا أفقيًا** وممتدًا إلى الأعلى والأسفل.")],
        tall: [bi("Stand the block upright and the spectrum turns with it: **wide in space means narrow in frequency**.", "أقِم الكتلة رأسيًا فيدور الطيف معها: **العريض في المكان ضيق في التردد**.")],
      },
    },
    {
      id: "meaning",
      pill: bi("Reading a spectrum", "قراءة الطيف"),
      heading: bi("Centre = low frequencies, edges = high", "المركز = الترددات المنخفضة، والأطراف = المرتفعة"),
      points: [
        bi(
          "In a centred spectrum the **low frequencies** (smooth areas) are near the centre and the **high frequencies** (edges, noise, fine details) toward the edges; brighter means stronger.",
          "في الطيف الموسَّط تقع **الترددات المنخفضة** (المناطق الملساء) قرب المركز، و**الترددات المرتفعة** (الحواف والضوضاء والتفاصيل الدقيقة) نحو الأطراف؛ وكلما زاد السطوع كانت المركبة أقوى.",
        ),
        bi("The magnitude says **how strong** each frequency is; the **phase**, not drawn here, says **where** the structures are.", "يدل المقدار على **مدى قوة** كل تردد، أما **الطور**، غير المرسوم هنا، فيدل على **مواضع** البُنى."),
      ],
    },
  ],
});

// ---------- 4.4 Advantages ----------
const freq = freqPerPixel(COST_SIZE, COST_SIZE);
const ratio = (m: number) => Math.round(spatialPerPixel(m) / freq);
const cheaperSpace = (m: number) => Math.round(freq / spatialPerPixel(m));

export const advantages = defineWalkthrough({
  id: "ip4-advantages",
  title: bi("Why filter in the frequency domain?", "لماذا نرشّح في المجال الترددي؟"),
  analogy: bi(
    "Stairs or a lift. For one floor the stairs are quicker, but the lift takes about the same time whether you go up 5 floors or 30: the bigger the mask, the more the fixed cost of the transforms pays off.",
    "السلّم أم المصعد: لطابق واحد يكون السلّم أسرع، لكن المصعد يستغرق الوقت نفسه تقريبًا سواء صعدت 5 طوابق أو 30؛ فكلما كبر القناع كانت التكلفة الثابتة للتحويلات أجدى.",
  ),
  facts: {
    freq,
    breakeven: breakEven(COST_SIZE, COST_SIZE),
    ratio31: ratio(31),
  },
  panels: [
    {
      id: "theorem",
      pill: bi("Convolution ↔ product", "الالتفاف ↔ الضرب"),
      heading: bi("f * h ↔ F · H", "f * h ↔ F · H"),
      points: [
        bi("Spatial filtering is a **convolution**: the mask slides over the image and a sum of products is formed at **every** pixel.", "الترشيح المكاني **التفاف (convolution)**: ينزلق القناع فوق الصورة ويُكوَّن مجموع لحواصل الضرب عند **كل** بكسل."),
        bi("The **convolution theorem** turns it into an element-by-element **multiplication** of the transforms: one product per frequency.", "تحوّله **مبرهنة الالتفاف (convolution theorem)** إلى **ضرب** التحويلين عنصرًا بعنصر: عملية ضرب واحدة لكل تردد."),
      ],
    },
    {
      id: "count",
      pill: bi("Operation count", "عدد العمليات"),
      heading: bi("Operations per pixel, 512 × 512 image", "العمليات لكل بكسل في صورة 512 × 512"),
      control: {
        label: bi("Mask", "القناع"),
        options: [3, 7, 9, 31].map((m) => ({ id: String(m), label: bi(`${m} × ${m}`, `${m} × ${m}`) })),
        initial: "3",
      },
      points: [
        bi(
          `Each FFT costs about log₂(MN) = 18 operations per pixel, so three FFTs and one product cost about **${freq}** per pixel, whatever the mask.`,
          `يكلّف كل تحويل FFT نحو log₂(MN) = 18 عملية لكل بكسل، لذا تكلّف ثلاثة تحويلات وعملية ضرب واحدة نحو **${freq}** عملية لكل بكسل أيًّا كان القناع.`,
        ),
      ],
      pointsFor: {
        "3": [bi(`3 × 3: only **${spatialPerPixel(3)}** multiplications per pixel in space, about ${cheaperSpace(3)} times cheaper than the frequency route.`, `3 × 3: **${spatialPerPixel(3)}** عمليات ضرب فقط لكل بكسل في المكان، أي أرخص من الطريق الترددي بنحو ${cheaperSpace(3)} مرات.`)],
        "7": [bi(`7 × 7: ${spatialPerPixel(7)} against ${freq}, still slightly cheaper in space.`, `7 × 7: ${spatialPerPixel(7)} مقابل ${freq}، فما زال المكان أرخص بقليل.`)],
        "9": [bi(`9 × 9: ${spatialPerPixel(9)} against ${freq}: from here on, the **frequency domain wins**.`, `9 × 9: ${spatialPerPixel(9)} مقابل ${freq}: ومن هنا فصاعدًا **يتفوق المجال الترددي**.`)],
        "31": [bi(`31 × 31: **${spatialPerPixel(31)}** against ${freq}, about **${ratio(31)} times** cheaper in the frequency domain.`, `31 × 31: **${spatialPerPixel(31)}** مقابل ${freq}، أي أرخص في المجال الترددي بنحو **${ratio(31)} مرة**.`)],
      },
    },
    {
      id: "beyond",
      pill: bi("More than speed", "أكثر من السرعة"),
      heading: bi("Periodic noise: two spikes in the spectrum", "الضوضاء الدورية: قمتان حادتان في الطيف"),
      points: [
        bi("**Precision**: a filter can keep or remove exactly the frequencies we choose, even a single point of the spectrum.", "**الدقة**: يستطيع المرشح أن يُبقي أو يزيل بالضبط الترددات التي نختارها، حتى لو كانت نقطة واحدة من الطيف."),
        bi(
          "**New tasks**: periodic stripes are spread over the whole image, but in the spectrum they are just **two bright spikes**; set them to zero and the stripes vanish.",
          "**مهام جديدة**: الخطوط الدورية منتشرة على الصورة كلها، لكنها في الطيف ليست إلا **قمتين حادتين ساطعتين**؛ اجعلهما صفرًا فتختفي الخطوط.",
        ),
      ],
    },
  ],
});

// ---------- 4.5 Frequency domain filtering ----------
export const filtering = defineWalkthrough({
  id: "ip4-filtering",
  title: bi("Filtering with G = H · F", "الترشيح بالعلاقة G = H · F"),
  analogy: bi(
    "A stencil over a wall being spray-painted. The paint (the spectrum) only reaches the wall where the stencil (H) is open, so the stencil's shape decides what survives, and it only works if it is lined up with the wall.",
    "استنسل فوق جدار يُرشّ بالطلاء: لا يصل الطلاء (الطيف) إلى الجدار إلا حيث يكون الاستنسل (H) مفتوحًا، فشكل الاستنسل يحدد ما يبقى، ولا ينجح ذلك إلا إذا كان الاستنسل مُحاذيًا للجدار.",
  ),
  panels: [
    {
      id: "pipeline",
      pill: bi("Block diagram", "المخطط الصندوقي"),
      heading: bi("Transform, multiply, transform back", "حوِّل، ثم اضرب، ثم عُد"),
      points: [
        bi("The image is **Fourier transformed**, **multiplied** by the filter function and **transformed back** to the spatial domain (Figure 4.3).", "تُحوَّل الصورة **بتحويل فورييه**، ثم **تُضرب** في دالة المرشح، ثم **تُعاد** إلى المجال المكاني (الشكل 4.3)."),
        bi("The model is **G(u, v) = H(u, v) F(u, v)**, element by element: each frequency is scaled by the filter's value there.", "النموذج هو **G(u, v) = H(u, v) F(u, v)** عنصرًا بعنصر: فيُضرب كل تردد في قيمة المرشح عنده."),
      ],
    },
    {
      id: "centre",
      pill: bi("Centre first", "التوسيط أولًا"),
      heading: bi("Shift the DC term to the centre before filtering", "انقل المركبة المستمرة إلى المركز قبل الترشيح"),
      control: {
        label: bi("Spectrum", "الطيف"),
        options: [
          { id: "uncentred", label: bi("Not shifted", "دون إزاحة") },
          { id: "centred", label: bi("Shifted", "بعد الإزاحة") },
        ],
        initial: "uncentred",
      },
      points: [bi("The filters are defined **around the centre**, so the spectrum is shifted first, to put the DC coefficient there.", "المرشحات معرَّفة **حول المركز**، لذا يُزاح الطيف أولًا لتقع المركبة المستمرة (DC coefficient) هناك.")],
      pointsFor: {
        uncentred: [
          bi(
            "Not shifted, the low frequencies are in the **corners**: the disc keeps the **highest** frequencies, and the result is a faint pattern of fine detail.",
            "دون إزاحة تكون الترددات المنخفضة في **الأركان**: فيُبقي القرص **أعلى** الترددات، ويكون الناتج نمطًا باهتًا من التفاصيل الدقيقة.",
          ),
        ],
        centred: [bi("Shifted, the disc covers the **low** frequencies, and the result is the image, smoothed.", "بعد الإزاحة يغطي القرص الترددات **المنخفضة**، فيكون الناتج هو الصورة بعد تنعيمها.")],
      },
    },
    {
      id: "lowpass",
      pill: bi("Figure 4.4", "الشكل 4.4"),
      heading: bi("A circular low-pass mask on the spectrum", "قناع دائري للتمرير المنخفض على الطيف"),
      control: {
        label: bi("Radius", "نصف القطر"),
        options: [
          { id: "small", label: bi(`D0 = ${TEST_D0.small}`, `D0 = ${TEST_D0.small}`) },
          { id: "large", label: bi(`D0 = ${TEST_D0.large}`, `D0 = ${TEST_D0.large}`) },
        ],
        initial: "small",
      },
      points: [bi("The mask keeps the frequencies **inside the circle** and removes the rest: smooth variations pass, rapid changes are blocked.", "يُبقي القناع الترددات **داخل الدائرة** ويزيل الباقي: فتمر التغيّرات الملساء وتُحجب التغيّرات السريعة.")],
      pointsFor: {
        small: [bi("A small radius keeps few frequencies: the square is **strongly blurred**, and the fine stripes melt into flat grey.", "نصف القطر الصغير يُبقي ترددات قليلة: فيُضبَّب المربع **بشدة**، وتذوب الخطوط الدقيقة في رمادي مستوٍ.")],
        large: [
          bi(
            "A larger radius keeps more: the square's edges come back sharper, but the one-pixel stripes, the highest frequency, are still gone.",
            "نصف القطر الأكبر يُبقي أكثر: فتعود حواف المربع أحدّ، لكن الخطوط التي عرضها بكسل واحد، وهي أعلى تردد، ما زالت غائبة.",
          ),
        ],
      },
    },
  ],
});

// ---------- 4.6 Ideal, Butterworth and Gaussian filters ----------
const r66 = exRow(6, 6);
const r46 = exRow(4, 6);
const r55 = exRow(5, 5);
const r04 = exRow(0, 4);
const ringing = {
  ideal: ripple(filterTest("ideal", "low", RING_D0).g),
  butterworth: ripple(filterTest("butterworth", "low", RING_D0).g),
  gaussian: ripple(filterTest("gaussian", "low", RING_D0).g),
};

export const filters = defineWalkthrough({
  id: "ip4-filters",
  title: bi("Ideal, Butterworth and Gaussian filters", "المرشحات المثالية ومرشحات بترورث وغاوس"),
  analogy: bi(
    "Three ways down from a plateau. The ideal filter is a cliff (on top or at the bottom, nothing in between), Butterworth is a ramp whose steepness you choose, and Gaussian is a gentle hill. Cliffs echo; gentle slopes don't.",
    "ثلاث طرق للنزول من هضبة: المرشح المثالي جُرف (إما في الأعلى وإما في الأسفل، ولا شيء بينهما)، ومرشح بترورث منحدر تختار درجة ميله، ومرشح غاوس تلّ لطيف. والجروف تُحدث صدى، أما المنحدرات اللطيفة فلا.",
  ),
  facts: {
    d66: h2(r66.D),
    ilpf66: h2(r66.ideal),
    blpf66: h2(r66.butterworth),
    glpf66: h2(r66.gaussian),
    blpf46: h2(r46.butterworth),
    glpf46: h2(r46.gaussian),
    ghpf66: h2(1 - r66.gaussian),
  },
  panels: [
    {
      id: "ideal",
      pill: bi("Ideal (ILPF)", "المثالي (ILPF)"),
      heading: bi("H = 1 inside the circle D ≤ D0, 0 outside", "H = 1 داخل الدائرة D ≤ D0، و 0 خارجها"),
      control: {
        label: bi("Cutoff", "تردد القطع"),
        options: [
          { id: "small", label: bi(`D0 = ${TEST_D0.small}`, `D0 = ${TEST_D0.small}`) },
          { id: "large", label: bi(`D0 = ${TEST_D0.large}`, `D0 = ${TEST_D0.large}`) },
        ],
        initial: "small",
      },
      points: [
        bi(
          "The ideal low-pass filter keeps every frequency **inside the circle** of radius D0 and removes every one outside; as a 3-D mesh it is a cylinder.",
          "يُبقي مرشح التمرير المنخفض المثالي كل تردد **داخل الدائرة** التي نصف قطرها D0، ويزيل كل تردد خارجها؛ وهو في الرسم الشبكي ثلاثي الأبعاد (mesh) أسطوانة.",
        ),
      ],
      pointsFor: {
        small: [bi(`D0 = ${TEST_D0.small}: a tiny disc, so only the coarsest shapes survive: **strong blur**.`, `D0 = ${TEST_D0.small}: قرص صغير جدًا، فلا تبقى إلا أخشن الأشكال: **تشويش شديد**.`)],
        large: [bi(`D0 = ${TEST_D0.large}: a wider disc keeps more detail, so there is **less blur**.`, `D0 = ${TEST_D0.large}: قرص أوسع يُبقي تفاصيل أكثر، فيكون **التشويش أقل**.`)],
      },
    },
    {
      id: "ringing",
      pill: bi("Ringing", "التموج الحلقي"),
      heading: bi(`A sharp cutoff makes ripples (D0 = ${RING_D0})`, `القطع الحاد يُحدث تموجات (D0 = ${RING_D0})`),
      control: {
        label: bi("Filter", "المرشح"),
        options: [
          { id: "ideal", label: bi("Ideal", "مثالي") },
          { id: "butterworth", label: bi("Butterworth, n = 2", "بترورث، n = 2") },
          { id: "gaussian", label: bi("Gaussian", "غاوس") },
        ],
        initial: "ideal",
      },
      points: [bi("The same cutoff on the test image; the curve is the brightness along one row through the square, the dashed line the original.", "تردد القطع نفسه على صورة الاختبار؛ والمنحنى هو السطوع على امتداد صف واحد يمر بالمربع، والخط المتقطع هو الأصل.")],
      pointsFor: {
        ideal: [
          bi(
            `Ideal: the abrupt jump in H leaves **ripples** beside every edge, straying ${ringing.ideal} grey levels outside the original range: **ringing**.`,
            `المثالي: القفزة المفاجئة في H تترك **تموجات** بجوار كل حافة، تخرج ${ringing.ideal} مستوى رماديًا عن مدى الأصل: إنه **التموج الحلقي (ringing)**.`,
          ),
        ],
        butterworth: [bi(`Butterworth, n = 2: the gradual roll-off leaves only a **faint** ripple, ${ringing.butterworth} grey levels.`, `بترورث، n = 2: الهبوط التدريجي لا يترك إلا تموجًا **خافتًا** مقداره ${ringing.butterworth} مستويات رمادية.`)],
        gaussian: [bi(`Gaussian: **no ripples** (${ringing.gaussian} grey levels); the edge is simply softened.`, `غاوس: **لا تموجات** (${ringing.gaussian} مستوى رمادي)؛ وإنما تُنعَّم الحافة فقط.`)],
      },
    },
    {
      id: "butterworth",
      pill: bi("Butterworth (BLPF)", "بترورث (BLPF)"),
      heading: bi("H = 1/(1 + (D/D0)^(2n))", "H = 1/(1 + (D/D0)^(2n))"),
      control: {
        label: bi("Order n", "الرتبة n"),
        options: [1, 2, 4, 10].map((n) => ({ id: String(n), label: bi(`n = ${n}`, `n = ${n}`) })),
        initial: "2",
      },
      points: [bi("The order **n** sets the steepness, and whatever n is, **H = 0.5 at D = D0**.", "تحدد **الرتبة (order) n** درجة الميل، ومهما كانت n فإن **H = 0.5 عند D = D0**.")],
      pointsFor: {
        "1": [bi("n = 1: a gentle slope with **no visible ringing**, but it lets more high frequencies through.", "n = 1: ميل لطيف **بلا تموج حلقي ظاهر**، لكنه يمرر ترددات مرتفعة أكثر.")],
        "2": [bi("n = 2: steeper, a good compromise, and the book's choice in Figure 4.9.", "n = 2: أكثر حدّة، وحل وسط جيد، وهو اختيار الكتاب في الشكل 4.9.")],
        "4": [bi("n = 4: steeper still; ringing starts to show.", "n = 4: أكثر حدّة أيضًا؛ ويبدأ التموج الحلقي في الظهور.")],
        "10": [bi("n = 10: almost a step; as n → ∞ the filter **becomes the ideal one**, ringing included.", "n = 10: يكاد يكون درجة؛ وعندما n → ∞ **يصبح المرشح مثاليًا**، بما في ذلك تموجه الحلقي.")],
      },
    },
    {
      id: "gaussian",
      pill: bi("Gaussian (GLPF)", "غاوس (GLPF)"),
      heading: bi("H = e^(−D²/2D0²)", "H = e^(−D²/2D0²)"),
      control: {
        label: bi("Cutoff", "تردد القطع"),
        options: [10, 20, 40, 100].map((d) => ({ id: String(d), label: bi(`D0 = ${d}`, `D0 = ${d}`) })),
        initial: "20",
      },
      points: [
        bi(`With σ replaced by D0, the filter passes **e^(−1/2) ≈ ${h2(Math.exp(-0.5))}** at D = D0 and falls smoothly to 0.`, `باستبدال D0 بـ σ يمرر المرشح **e^(−1/2) ≈ ${h2(Math.exp(-0.5))}** عند D = D0 ثم يهبط بسلاسة إلى 0.`),
        bi("Its inverse transform is **also a Gaussian**, one bump with no rings, so the GLPF **never rings**; a larger D0 keeps more and blurs less.", "تحويله المعكوس **دالة غاوس أيضًا**، نتوء واحد بلا حلقات، لذا **لا يُحدث** مرشح غاوس للتمرير المنخفض **تموجًا حلقيًا أبدًا**؛ و D0 الأكبر يُبقي أكثر ويشوّش أقل."),
      ],
    },
    {
      id: "highpass",
      pill: bi("High-pass", "التمرير المرتفع"),
      heading: bi("H_HP = 1 − H_LP", "H_HP = 1 − H_LP"),
      control: {
        label: bi("Filter", "المرشح"),
        options: [
          { id: "ideal", label: bi("IHPF", "IHPF") },
          { id: "butterworth", label: bi("BHPF, n = 2", "BHPF، n = 2") },
          { id: "gaussian", label: bi("GHPF", "GHPF") },
        ],
        initial: "ideal",
      },
      points: [
        bi(
          "Each high-pass filter is **1 minus** its low-pass partner: H = 0 at the centre removes the **average brightness**, and the edges remain.",
          "كل مرشح تمرير مرتفع يساوي **1 ناقص** نظيره للتمرير المنخفض: فقيمة H = 0 في المركز تحذف **متوسط السطوع**، وتبقى الحواف.",
        ),
      ],
      pointsFor: {
        ideal: [bi("IHPF: edges with **ripples** beside them; the sharp cutoff rings here too.", "IHPF: حواف بجوارها **تموجات**؛ فالقطع الحاد يُحدث تموجًا حلقيًا هنا أيضًا.")],
        butterworth: [bi("BHPF = 1/(1 + (D0/D)^(2n)): the same edges, cleaner.", "BHPF = 1/(1 + (D0/D)^(2n)): الحواف نفسها، لكن أنظف.")],
        gaussian: [bi("GHPF = 1 − e^(−D²/2D0²): the cleanest edges, with no ringing.", "GHPF = 1 − e^(−D²/2D0²): أنظف الحواف، بلا تموج حلقي.")],
      },
    },
    {
      id: "worked",
      pill: bi("Worked example", "مثال محلول"),
      heading: bi(`H on an ${EX.M} × ${EX.N} spectrum, D0 = ${EX.D0}`, `قيم H على طيف ${EX.M} × ${EX.N}، D0 = ${EX.D0}`),
      control: {
        label: bi("Filter", "المرشح"),
        options: [
          { id: "ideal", label: bi("ILPF", "ILPF") },
          { id: "butterworth", label: bi("BLPF, n = 2", "BLPF، n = 2") },
          { id: "gaussian", label: bi("GLPF", "GLPF") },
        ],
        initial: "butterworth",
      },
      points: [bi("The centre is (4, 4): first D(u, v) = √((u − 4)² + (v − 4)²), then H. The ringed cells are the page's five points.", "المركز هو (4, 4): احسب أولًا D(u, v) = √((u − 4)² + (v − 4)²)، ثم H. والخلايا المحاطة بإطار هي النقاط الخمس في الصفحة.")],
      pointsFor: {
        ideal: [bi(`ILPF: 1 up to D = ${EX.D0}, then **0**: at (6, 6), D = ${h2(r66.D)}, it is already 0.`, `ILPF: القيمة 1 حتى D = ${EX.D0}، ثم **0**: فعند (6, 6) حيث D = ${h2(r66.D)} تكون 0 بالفعل.`)],
        butterworth: [
          bi(
            `BLPF: **${h2(r55.butterworth)}, ${h2(r46.butterworth)}, ${h2(r66.butterworth)}** at D = ${h2(r55.D)}, ${h2(r46.D)}, ${h2(r66.D)}: exactly 0.5 at D0.`,
            `BLPF: **${h2(r55.butterworth)} و ${h2(r46.butterworth)} و ${h2(r66.butterworth)}** عند D = ${h2(r55.D)} و ${h2(r46.D)} و ${h2(r66.D)}: أي 0.5 بالضبط عند D0.`,
          ),
        ],
        gaussian: [
          bi(
            `GLPF: **${h2(r55.gaussian)}, ${h2(r46.gaussian)}, ${h2(r66.gaussian)}** at the same points, a gentler fall that still passes ${h2(r04.gaussian)} at D = ${h2(r04.D)}.`,
            `GLPF: **${h2(r55.gaussian)} و ${h2(r46.gaussian)} و ${h2(r66.gaussian)}** عند النقاط نفسها، أي هبوط ألطف ما زال يمرر ${h2(r04.gaussian)} عند D = ${h2(r04.D)}.`,
          ),
        ],
      },
    },
  ],
});

// ---------- 4.7 General steps ----------
export const steps = defineWalkthrough({
  id: "ip4-steps",
  title: bi("The general steps", "الخطوات العامة"),
  analogy: bi(
    "Editing a letter through a translator: translate it (FFT), edit it in the other language (multiply by H), and translate it back (inverse FFT). Skip undoing one step of the translation and the letter comes back garbled.",
    "تحرير رسالة عبر مترجم: تترجمها (FFT)، ثم تعدّلها في اللغة الأخرى (الضرب في H)، ثم تعيد ترجمتها (التحويل المعكوس). فإذا أغفلت التراجع عن خطوة من خطوات الترجمة عادت الرسالة مشوّهة.",
  ),
  panels: [
    {
      id: "flow",
      pill: bi("Seven steps", "سبع خطوات"),
      heading: bi("From image to filtered image", "من الصورة إلى الصورة المرشَّحة"),
      points: [
        bi("The book's recipe: grayscale, **FFT**, **shift**, build **H**, **multiply**, **inverse FFT**, normalise and display.", "وصفة الكتاب: صورة رمادية، ثم **FFT**، ثم **الإزاحة**، ثم بناء **H**، ثم **الضرب**، ثم **التحويل المعكوس**، ثم التطبيع والعرض."),
        bi("Steps 2, 3 and 6 are the **round trip** to the frequency domain and back; only steps 4 and 5 depend on the filter you choose.", "الخطوات 2 و 3 و 6 هي **رحلة الذهاب والعودة** إلى المجال الترددي؛ ولا تعتمد على المرشح الذي تختاره إلا الخطوتان 4 و 5."),
      ],
    },
    {
      id: "shift-back",
      pill: bi("Undo the shift", "إلغاء الإزاحة"),
      heading: bi("ifftshift before the inverse transform", "ifftshift قبل التحويل المعكوس"),
      control: {
        label: bi("Before ifft2", "قبل ifft2"),
        options: [
          { id: "ifftshift", label: bi("ifftshift", "ifftshift") },
          { id: "real", label: bi("Nothing, real part", "لا شيء، الجزء الحقيقي") },
          { id: "abs", label: bi("Nothing, abs", "لا شيء، abs") },
        ],
        initial: "ifftshift",
      },
      points: [bi("The spectrum was shifted in step 3, so it must be **shifted back** with ifftshift before ifft2.", "أُزيح الطيف في الخطوة 3، لذا يجب **إرجاعه** باستخدام ifftshift قبل ifft2.")],
      pointsFor: {
        ifftshift: [bi("With ifftshift the low-pass result comes back as a clean, smoothed image.", "مع ifftshift يعود ناتج التمرير المنخفض صورةً نظيفة منعَّمة.")],
        real: [bi("Without it every second pixel changes sign: the real part is g · (−1)^(x+y), a **checkerboard**.", "دونها تتغير إشارة بكسل من كل بكسلين: فيكون الجزء الحقيقي g · (−1)^(x+y)، أي **رقعة شطرنج**.")],
        abs: [bi("abs hides the checkerboard, since |g · (−1)^(x+y)| = |g|, which is why the omission often goes unnoticed.", "تخفي abs رقعة الشطرنج، لأن |g · (−1)^(x+y)| = |g|، ولهذا يمر هذا الإغفال غالبًا دون أن يُلاحظ.")],
      },
    },
    {
      id: "result",
      pill: bi("On a real image", "على صورة حقيقية"),
      heading: bi("Low-pass against high-pass", "التمرير المنخفض مقابل التمرير المرتفع"),
      control: {
        label: bi("Mask", "القناع"),
        options: [
          { id: "low", label: bi("Keep the centre", "أبقِ المركز") },
          { id: "high", label: bi("Remove the centre", "احذف المركز") },
        ],
        initial: "low",
      },
      points: [bi("The book's closing example: the same circle used to **keep** the centre of the spectrum (low-pass) or to **remove** it (high-pass).", "مثال الكتاب الختامي: الدائرة نفسها تُستخدم **لإبقاء** مركز الطيف (تمرير منخفض) أو **لحذفه** (تمرير مرتفع).")],
      pointsFor: {
        low: [bi("Low-pass: the disc of low frequencies survives, so the image is **blurred** but its shapes are intact.", "التمرير المنخفض: يبقى قرص الترددات المنخفضة، فتكون الصورة **ضبابية** لكن أشكالها سليمة.")],
        high: [bi("High-pass: the disc is cut out, so only **edges and fine texture** remain, on a dark background.", "التمرير المرتفع: يُقتطع القرص، فلا يبقى إلا **الحواف والنسيج الدقيق** على خلفية داكنة.")],
      },
    },
  ],
});

/** Every walkthrough in this lecture, registered in lib/walkthroughs/index.ts. */
export const all = [intro, dft1d, dft2d, advantages, filtering, filters, steps] as const;

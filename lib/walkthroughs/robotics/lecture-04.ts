import { bi } from "@/components/widgets/types";
import { defineWalkthrough } from "@/lib/widgets/walkthrough";
import {
  ENCODER_FACTS,
  LIDAR_FACTS,
  READ_ANGLE,
  SONAR_FACTS,
  TACHO_FACTS,
  echoDistance,
  fixed,
  readingAt,
  soundSpeed,
} from "@/lib/widgets/rob-lecture-04";

/*
 * Robotics · Lecture 4 (content/subjects/robotics/lectures/04-sensors-ii.mdx).
 * One walkthrough per heading; the scenes are in
 * components/widgets/walkthrough/scenes/robotics/lecture-04/. Every number the text quotes
 * is computed in lib/widgets/rob-lecture-04.ts, and the page's `expect` checks the facts.
 */

// ---------- Encoders ----------
const E = ENCODER_FACTS;

export const encoders = defineWalkthrough({
  id: "rob4-encoders",
  title: bi("From a turning shaft to a number", "من عمود دوّار إلى عدد"),
  analogy: bi(
    "Counting fence posts from a train window tells you how far you have gone, but only since you started counting; reading the kilometre signs tells you where you are at any moment. Incremental encoders count; absolute encoders read.",
    "عدّ أعمدة السياج من نافذة القطار يخبرك بالمسافة التي قطعتها، لكن منذ أن بدأت العدّ فقط؛ أما قراءة لافتات الكيلومترات فتخبرك بموقعك في أي لحظة. فالمُرمِّزات التزايدية تعدّ، والمُرمِّزات المطلقة تقرأ.",
  ),
  facts: E,
  panels: [
    {
      id: "slotted-disc",
      pill: bi("Slots and pulses", "الفتحات والنبضات"),
      heading: bi("Every slot that passes gives one pulse", "كل فتحة تمرّ تعطي نبضة واحدة"),
      points: [
        bi(
          "An LED shines through the **slotted disc** onto a photodiode. As the shaft turns, the light is passed and blocked in turn, giving a **pulse train**.",
          "يسطع ضوء LED عبر **القرص ذي الفتحات** على ثنائي ضوئي (photodiode). ومع دوران العمود يمرّ الضوء ويُحجَب بالتناوب، فينتج **قطار من النبضات (pulse train)**.",
        ),
        bi(
          `One slot pitch is 360° / N. With 60 slots that is **${E.slot60}°** per pulse, so 5 pulses mean 5 × ${E.slot60}° = 30°.`,
          `خطوة الفتحة الواحدة تساوي 360° / N. ومع 60 فتحة تكون **${E.slot60}°** لكل نبضة، فتعني 5 نبضات أن 5 × ${E.slot60}° = 30°.`,
        ),
        bi(
          `More slots give finer steps: a 500-slot disc gives 360° / 500 = **${E.slot500}°** per pulse (book Example 6.1).`,
          `وكلما زادت الفتحات صغرت الخطوة: فالقرص ذو 500 فتحة يعطي 360° / 500 = **${E.slot500}°** لكل نبضة (مثال الكتاب 6.1).`,
        ),
      ],
    },
    {
      id: "quadrature",
      pill: bi("Direction from A and B", "الاتجاه من A و B"),
      heading: bi("Two channels 90° out of phase reveal the direction", "قناتان بفرق طور 90° تكشفان الاتجاه"),
      control: {
        label: bi("Rotation", "الدوران"),
        options: [
          { id: "cw", label: bi("Clockwise", "مع عقارب الساعة") },
          { id: "ccw", label: bi("Counter-clockwise", "عكس عقارب الساعة") },
        ],
        initial: "cw",
      },
      points: [
        bi(
          "Detectors A and B sit a **quarter of a slot pitch** apart, so their pulse trains are 90° out of phase (**quadrature**). One channel alone looks the same in both directions.",
          "يقع الكاشفان A و B على بُعد **ربع خطوة فتحة** أحدهما من الآخر، فيكون بين قطارَي نبضاتهما فرق طور 90° (**الترميز التربيعي (quadrature)**). أما القناة الواحدة فتبدو متماثلة في الاتجاهين.",
        ),
        bi(
          "Read B at each rising edge of A: its level gives the direction (book p. 121). A third channel, **Z**, gives one index pulse per turn for **homing**.",
          "اقرأ B عند كل حافة صاعدة لـ A: فمستواها يعطي الاتجاه (الكتاب ص 121). وتعطي قناة ثالثة هي **Z** نبضة فهرسة (index pulse) واحدة في كل دورة **للعودة إلى الموضع المرجعي (homing)**.",
        ),
      ],
      pointsFor: {
        cw: [
          bi(
            "Clockwise, AB runs 00 → 01 → 11 → 10 (slide 12): B leads, so B is already **high** when A rises.",
            "مع عقارب الساعة تسير AB هكذا: 00 → 01 → 11 → 10 (الشريحة 12): تتقدم B، فتكون B **مرتفعة** بالفعل عندما تصعد A.",
          ),
        ],
        ccw: [
          bi(
            "Counter-clockwise, AB runs 00 → 10 → 11 → 01: A leads, so B is still **low** when A rises.",
            "عكس عقارب الساعة تسير AB هكذا: 00 → 10 → 11 → 01: تتقدم A، فتكون B ما زالت **منخفضة** عندما تصعد A.",
          ),
        ],
      },
    },
    {
      id: "counting",
      pill: bi("×1, ×2, ×4", "×1 و ×2 و ×4"),
      heading: bi("Count more edges for finer steps", "عُدّ حوافَّ أكثر لتحصل على خطوات أدق"),
      control: {
        label: bi("Counting mode", "نمط العدّ"),
        options: [
          { id: "x1", label: bi("Single (×1)", "مفرد (×1)") },
          { id: "x2", label: bi("Double (×2)", "مزدوج (×2)") },
          { id: "x4", label: bi("Quadruple (×4)", "رباعي (×4)") },
        ],
        initial: "x4",
      },
      points: [
        bi(
          "In each slot pitch A rises and falls once, and so does B, a quarter later: up to **4 edges per slot**.",
          "في كل خطوة فتحة تصعد A وتهبط مرة واحدة، وكذلك B بعدها بربع خطوة: أي ما يصل إلى **4 حواف لكل فتحة**.",
        ),
      ],
      pointsFor: {
        x1: [
          bi(
            `×1 counts the rising edges of A only: 1 count per slot, **${E.slot500}°** per count on a 500-slot disc.`,
            `النمط ×1 يعدّ الحواف الصاعدة لـ A فقط: عدّة واحدة لكل فتحة، أي **${E.slot500}°** لكل عدّة في قرص ذي 500 فتحة.`,
          ),
        ],
        x2: [
          bi(`×2 counts both edges of A: 2 counts per slot, **${E.x2}°** per count.`, `النمط ×2 يعدّ حافتَي A كلتيهما: عدّتان لكل فتحة، أي **${E.x2}°** لكل عدّة.`),
        ],
        x4: [
          bi(
            `×4 counts every edge of A and B: 4 counts per slot, 360° / 2000 = **${E.x4}°**. It sharpens the resolution, not the accuracy of the disc (book p. 122).`,
            `النمط ×4 يعدّ كل حواف A و B: 4 عدّات لكل فتحة، أي 360° / 2000 = **${E.x4}°**. وهو يحسّن الاستبانة (resolution) لا دقة (accuracy) القرص نفسه (الكتاب ص 122).`,
          ),
        ],
      },
    },
    {
      id: "absolute",
      pill: bi("Absolute disc", "القرص المطلق"),
      heading: bi("Every sector carries its own code", "لكل قطاع شفرته الخاصة"),
      control: {
        label: bi("Tracks", "المسارات"),
        options: [
          { id: "t3", label: bi("3 tracks", "3 مسارات") },
          { id: "t4", label: bi("4 tracks", "4 مسارات") },
        ],
        initial: "t3",
      },
      points: [
        bi(
          "Concentric **tracks**, read by one detector each, give an n-bit word that names the sector: 2ⁿ positions of 360° / 2ⁿ. The word is there as soon as power returns, so no homing is needed.",
          "تعطي **المسارات** متحدة المركز، ولكل منها كاشف، كلمةً من n بت تسمّي القطاع: 2ⁿ موضعًا، كلٌّ منها 360° / 2ⁿ. والكلمة متاحة فور عودة الطاقة، فلا حاجة إلى العودة إلى الموضع المرجعي (homing).",
        ),
        bi(
          `To match 2000 counts (500 slots read ×4) you need 2ⁿ ≥ 2000, so **${E.tracks} tracks**.`,
          `ولكي تساوي 2000 عدّة (500 فتحة تُقرأ ×4) تحتاج إلى 2ⁿ ≥ 2000، أي **${E.tracks} مسارًا**.`,
        ),
      ],
      pointsFor: {
        t3: [
          bi(
            `3 tracks: 8 sectors of **${E.res3}°**. At ${READ_ANGLE}° the detectors read ON-OFF-OFF = 100 = sector 4, which is 180°–225° (slide 17).`,
            `3 مسارات: 8 قطاعات كلٌّ منها **${E.res3}°**. وعند ${READ_ANGLE}° تقرأ الكواشف ON-OFF-OFF = 100 = القطاع 4، أي 180°–225° (الشريحة 17).`,
          ),
        ],
        t4: [
          bi(
            `4 tracks: 16 sectors of **${E.res4}°**. The same angle reads 1000 = sector 8, so 180°–202.5°. With 10 tracks a sector is **${E.res10}°**, with 12 tracks **${E.res12}°**.`,
            `4 مسارات: 16 قطاعًا كلٌّ منها **${E.res4}°**. والزاوية نفسها تُقرأ 1000 = القطاع 8، أي 180°–202.5°. ومع 10 مسارات يصبح القطاع **${E.res10}°**، ومع 12 مسارًا **${E.res12}°**.`,
          ),
        ],
      },
    },
    {
      id: "gray",
      pill: bi("Binary or Gray", "ثنائي أم جراي"),
      heading: bi("One bit at a time, so a misread is never far off", "بِت واحد في كل مرة، فلا يبتعد خطأ القراءة كثيرًا"),
      control: {
        label: bi("Code on the disc", "الشفرة على القرص"),
        options: [
          { id: "binary", label: bi("Binary", "ثنائي") },
          { id: "gray", label: bi("Gray code", "شفرة جراي") },
        ],
        initial: "binary",
      },
      points: [
        bi(
          "No row of detectors is perfectly aligned. Crossing from sector 7 to sector 8, the top bit's detector here reaches the boundary a moment before the others.",
          "لا يوجد صف من الكواشف محاذًى تمامًا. فعند العبور من القطاع 7 إلى القطاع 8 يصل كاشف البت الأعلى هنا إلى الحد قبل الكواشف الأخرى بلحظة.",
        ),
      ],
      pointsFor: {
        binary: [
          bi(
            `Binary 0111 → 1000 flips **4 bits** at once. Mid-crossing the detectors read **${E.glitch}** = sector 15: eight sectors, half a turn, away (book p. 124).`,
            `في الترميز الثنائي ينقلب **4 بتات** دفعة واحدة من 0111 إلى 1000. وفي منتصف العبور تقرأ الكواشف **${E.glitch}** = القطاع 15: أي على بُعد ثمانية قطاعات، نصف دورة (الكتاب ص 124).`,
          ),
        ],
        gray: [
          bi(
            "Gray code 0100 → 1100 flips **1 bit**, so a mid-crossing reading is sector 7 or sector 8: at worst one count off. The sequence runs 0000, 0001, 0011, 0010, 0110, …",
            "في شفرة جراي (Gray code) ينقلب **بِت واحد** من 0100 إلى 1100، فتكون القراءة في منتصف العبور القطاع 7 أو القطاع 8: أي أن الخطأ لا يتجاوز عدّة واحدة. والتسلسل هو 0000، 0001، 0011، 0010، 0110، …",
          ),
        ],
      },
    },
  ],
});

// ---------- Sonar ----------
const S = SONAR_FACTS;
const d6 = fixed(echoDistance(0.006), 2);
const hot = { v: soundSpeed(40), reads: fixed(readingAt(2, 40), 2) };

export const sonar = defineWalkthrough({
  id: "rob4-sonar",
  title: bi("Timing an echo", "توقيت الصدى"),
  analogy: bi(
    "Shouting across a valley and counting until the echo returns: the sound went to the cliff and back, so the cliff is half as far as the sound travelled.",
    "أن تصرخ عبر وادٍ وتعدّ حتى يعود الصدى: ذهب الصوت إلى الجرف ثم عاد، لذا يبعد الجرف نصف المسافة التي قطعها الصوت.",
  ),
  facts: S,
  panels: [
    {
      id: "ping",
      pill: bi("Ping and echo", "النبضة والصدى"),
      heading: bi("The distance is half the round trip", "المسافة نصف رحلة الذهاب والإياب"),
      control: {
        label: bi("Echo time", "زمن الصدى"),
        options: [
          { id: "t6", label: bi("6 ms", "6 ms") },
          { id: "t117", label: bi("11.7 ms", "11.7 ms") },
        ],
        initial: "t117",
      },
      points: [
        bi(
          "A burst of about **1 ms** at **50–250 kHz** goes out, and the sensor times how long the echo takes: the **time of flight** t.",
          "تنطلق دفقة مدتها نحو **1 ms** بتردد **50–250 kHz**، ويقيس المستشعر الزمن الذي يستغرقه الصدى: إنه **زمن الطيران (time of flight)** t.",
        ),
        bi(
          `The sound goes to the obstacle **and back**, so d = v·t / 2, with v ≈ ${S.v} m/s at 20 °C. Forgetting the 2 is the commonest slip (book p. 126).`,
          `ينتقل الصوت إلى العائق **ثم يعود**، لذا d = v·t / 2، حيث v ≈ ${S.v} m/s عند 20 °C. ونسيان العدد 2 هو أكثر الأخطاء شيوعًا (الكتاب ص 126).`,
        ),
      ],
      pointsFor: {
        t6: [bi(`t = 6 ms: d = 343 × 0.006 / 2 ≈ **${d6} m** (a book review question).`, `عند t = 6 ms: d = 343 × 0.006 / 2 ≈ **${d6} m** (أحد أسئلة المراجعة في الكتاب).`)],
        t117: [bi(`t = ${S.echo} ms: d = 343 × 0.0117 / 2 ≈ **${S.range} m**, as in the page's exercise.`, `عند t = ${S.echo} ms: d = 343 × 0.0117 / 2 ≈ **${S.range} m**، كما في تمرين الصفحة.`)],
      },
    },
    {
      id: "ring",
      pill: bi("Repeat rate and the ring", "معدل التكرار والحلقة"),
      heading: bi("20 pings a second, 24 sensors around the robot", "20 نبضة في الثانية و 24 مستشعرًا حول الروبوت"),
      control: {
        label: bi("Firing", "الإطلاق"),
        options: [
          { id: "one", label: bi("One sensor", "مستشعر واحد") },
          { id: "ring", label: bi("24 in turn", "24 بالتتابع") },
        ],
        initial: "one",
      },
      points: [
        bi(
          `Measurements repeat about **${S.rate} times per second**, which is the clicking a sonar makes. Each ping must be answered before the next one.`,
          `تتكرر القياسات نحو **${S.rate} مرة في الثانية**، وهذا هو صوت النقر الذي يصدره السونار. ويجب أن يعود صدى كل نبضة قبل النبضة التالية.`,
        ),
      ],
      pointsFor: {
        one: [
          bi(
            `Pings are 50 ms apart, so an echo from beyond 343 × 0.05 / 2 ≈ **${S.maxRange} m** would arrive after the next ping: that is the longest range one sensor can measure without ambiguity (book Example 6.3).`,
            `تفصل بين النبضات 50 ms، لذا فإن صدى ما يبعد أكثر من 343 × 0.05 / 2 ≈ **${S.maxRange} m** سيصل بعد النبضة التالية: وهذا أطول مدى يقيسه مستشعر واحد دون التباس (مثال الكتاب 6.3).`,
          ),
        ],
        ring: [
          bi(
            `Each cone covers about ${S.cone}°, so a round robot needs **${S.sensors}** sensors. Fired strictly one after another, a full scan takes 24 × 50 ms = **${S.scan} s**: too slow for a moving robot, so groups whose cones do not overlap fire together.`,
            `يغطي كل مخروط نحو ${S.cone}°، لذا يحتاج الروبوت الدائري إلى **${S.sensors}** مستشعرًا. وإذا أُطلقت واحدًا تلو الآخر بدقة، يستغرق المسح الكامل 24 × 50 ms = **${S.scan} s**: وهذا بطيء جدًا لروبوت متحرك، لذا تُطلق معًا مجموعاتٌ لا تتداخل مخاريطها.`,
          ),
        ],
      },
    },
    {
      id: "failures",
      pill: bi("When the echo misleads", "حين يُضلِّل الصدى"),
      heading: bi("Smooth surfaces and other sensors fool a sonar", "الأسطح الملساء والمستشعرات الأخرى تخدع السونار"),
      control: {
        label: bi("Problem", "المشكلة"),
        options: [
          { id: "specular", label: bi("Specular", "مرآوي") },
          { id: "virtual", label: bi("Multiple reflection", "انعكاس متعدد") },
          { id: "crosstalk", label: bi("Crosstalk", "تداخل") },
        ],
        initial: "specular",
      },
      points: [
        bi(
          "A sonar reports the shortest acoustic path that sent energy back to it, which is not always the distance to the nearest object (book p. 128).",
          "يُبلغ السونار عن أقصر مسار صوتي أعاد إليه طاقة، وليس ذلك دائمًا المسافة إلى أقرب جسم (الكتاب ص 128).",
        ),
      ],
      pointsFor: {
        specular: [
          bi(
            "**Specular reflection**: a smooth wall hit at an oblique angle, beyond the critical angle, mirrors the pulse away. No echo comes back, and the wall is **not detected**.",
            "**الانعكاس المرآوي (specular reflection)**: الجدار الأملس الذي تصطدم به الموجة بزاوية مائلة تتجاوز الزاوية الحرجة (critical angle) يعكس النبضة بعيدًا كالمرآة. فلا يعود صدى، و**لا يُكتشف** الجدار.",
          ),
        ],
        virtual: [
          bi(
            "**Multiple reflection**: the pulse bounces off the wall to an object and back the same way. The time matches that longer path, so the sensor reports a **virtual object** further away, where nothing is.",
            "**الانعكاس المتعدد (multiple reflection)**: ترتد النبضة عن الجدار إلى جسم ثم تعود بالطريق نفسه. فيطابق الزمنُ ذلك المسارَ الأطول، ويُبلغ المستشعر عن **جسم وهمي (virtual object)** أبعد، في مكان لا شيء فيه.",
          ),
        ],
        crosstalk: [
          bi(
            "**Crosstalk**: sensor 2 hears sensor 1's ping before its own echo and reports an obstacle **closer** than it is. Coded (pseudo-random) pings let each sensor accept only its own echo.",
            "**التداخل (crosstalk)**: يلتقط المستشعر 2 نبضة المستشعر 1 قبل صداه هو، فيُبلغ عن عائق **أقرب** مما هو في الحقيقة. والنبضات المُرمَّزة (شبه العشوائية) تجعل كل مستشعر لا يقبل إلا صداه.",
          ),
        ],
      },
    },
    {
      id: "temperature",
      pill: bi("Temperature", "درجة الحرارة"),
      heading: bi("The speed of sound changes with the air", "سرعة الصوت تتغير مع الهواء"),
      control: {
        label: bi("Air temperature", "حرارة الهواء"),
        options: [
          { id: "c20", label: bi("20 °C", "20 °C") },
          { id: "c40", label: bi("40 °C", "40 °C") },
        ],
        initial: "c20",
      },
      points: [
        bi(
          `Sound gets faster by about **0.6 m/s per °C**, but a sensor calibrated at 20 °C keeps using ${S.v} m/s (book p. 127).`,
          `تزداد سرعة الصوت بنحو **0.6 m/s لكل درجة مئوية**، لكن المستشعر المعايَر عند 20 °C يظل يستخدم ${S.v} m/s (الكتاب ص 127).`,
        ),
      ],
      pointsFor: {
        c20: [bi("At 20 °C the assumption holds: a wall 2.00 m away reads 2.00 m.", "عند 20 °C يصح الافتراض: فالجدار الذي يبعد 2.00 m يُقرأ 2.00 m.")],
        c40: [
          bi(
            `At 40 °C sound travels at ${hot.v} m/s, so the echo returns sooner and the same wall reads **${hot.reads} m**, about 3 % short. Precise sonars measure the air temperature and correct for it.`,
            `عند 40 °C ينتقل الصوت بسرعة ${hot.v} m/s، فيعود الصدى أسرع ويُقرأ الجدار نفسه **${hot.reads} m**، أي أقصر بنحو 3 %. لذا تقيس أجهزة السونار الدقيقة حرارة الهواء وتصحّح القراءة.`,
          ),
        ],
      },
    },
  ],
});

// ---------- Laser rangefinders and LiDAR ----------
const Lf = LIDAR_FACTS;

export const lidar = defineWalkthrough({
  id: "rob4-lidar",
  title: bi("Ranging with light", "قياس المدى بالضوء"),
  analogy: bi(
    "A lighthouse beam: held still it lights one point, swept round it paints the whole shoreline, and tilted up and down as it sweeps it would paint the cliffs as well.",
    "شعاع منارة: إذا ثبت أضاء نقطة واحدة، وإذا دار رسم الشاطئ كله، وإذا مال أيضًا إلى أعلى وأسفل أثناء دورانه رسم المنحدرات الصخرية كذلك.",
  ),
  facts: Lf,
  panels: [
    {
      id: "tof",
      pill: bi("Time of flight", "زمن الطيران"),
      heading: bi("The same formula, with almost a million times less time", "الصيغة نفسها، مع زمن أقل بنحو مليون مرة"),
      control: {
        label: bi("Pulse", "النبضة"),
        options: [
          { id: "sound", label: bi("Sound", "صوت") },
          { id: "light", label: bi("Light", "ضوء") },
        ],
        initial: "light",
      },
      points: [bi("Both sensors time a round trip, d = v·t / 2. Only the speed changes.", "كلا المستشعرين يقيس زمن رحلة ذهاب وإياب، d = v·t / 2. ولا يتغير إلا السرعة.")],
      pointsFor: {
        sound: [bi(`Sound at 343 m/s: a target 10 m away echoes after about **${Lf.ms10} ms**, which is easy to time.`, `الصوت بسرعة 343 m/s: الهدف الذي يبعد 10 m يعيد الصدى بعد نحو **${Lf.ms10} ms**، وهذا زمن سهل القياس.`)],
        light: [
          bi(
            `Light at 3 × 10⁸ m/s: the same 10 m takes only **${Lf.ns10} ns**. Light covers about 0.3 m per nanosecond, so resolving 1 mm needs timing to **${Lf.ps1mm} ps** (book p. 128).`,
            `الضوء بسرعة 3 × 10⁸ m/s: المسافة نفسها 10 m لا تستغرق إلا **${Lf.ns10} ns**. ويقطع الضوء نحو 0.3 m في النانوثانية، لذا يتطلب تمييز 1 mm توقيتًا بدقة **${Lf.ps1mm} ps** (الكتاب ص 128).`,
          ),
        ],
      },
    },
    {
      id: "phase",
      pill: bi("Phase and interferometry", "الطور وقياس التداخل"),
      heading: bi("Comparing waves instead of timing a pulse", "مقارنة الموجات بدلًا من توقيت نبضة"),
      control: {
        label: bi("Method", "الطريقة"),
        options: [
          { id: "phase", label: bi("Phase shift", "إزاحة الطور") },
          { id: "interferometry", label: bi("Interferometry", "قياس التداخل") },
        ],
        initial: "phase",
      },
      points: [bi("Instead of timing one pulse, the sensor can compare the returning light with a reference signal.", "بدلًا من توقيت نبضة واحدة، يمكن للمستشعر أن يقارن الضوء العائد بإشارة مرجعية.")],
      pointsFor: {
        phase: [
          bi(
            "**Phase shift**: the sensor analyses the returning light and compares it with the reference; the shift Δφ between them gives the distance (slide 29).",
            "**إزاحة الطور (phase shift)**: يحلّل المستشعر الضوء العائد ويقارنه بالإشارة المرجعية؛ والإزاحة Δφ بينهما تعطي المسافة (الشريحة 29).",
          ),
        ],
        interferometry: [
          bi(
            "**Interferometry** counts interference fringes as the target moves: the most accurate way to measure a **change** in distance. It counts from an arbitrary start, so on its own it gives no absolute distance (book p. 129).",
            "**قياس التداخل (interferometry)** يعدّ هُدُب التداخل (fringes) أثناء حركة الهدف: وهو أدق طريقة لقياس **التغيّر** في المسافة. لكنه يعدّ من نقطة بداية اختيارية، فلا يعطي وحده مسافة مطلقة (الكتاب ص 129).",
          ),
        ],
      },
    },
    {
      id: "scan",
      pill: bi("1-D, 2-D, 3-D", "أحادي وثنائي وثلاثي الأبعاد"),
      heading: bi("Sweep the beam to build a map", "حرّك الشعاع لتبني خريطة"),
      control: {
        label: bi("Sensor", "المستشعر"),
        options: [
          { id: "d1", label: bi("1-D rangefinder", "مقياس مدى 1-D") },
          { id: "d2", label: bi("2-D scanner", "ماسح 2-D") },
          { id: "d3", label: bi("3-D LiDAR", "ليدار 3-D") },
        ],
        initial: "d1",
      },
      points: [bi("A range plus the beam's angle places each reading as a point around the robot.", "المدى مع زاوية الشعاع يضعان كل قراءة نقطةً حول الروبوت.")],
      pointsFor: {
        d1: [bi("A rangefinder measures **one point at a time**, so it is a **1-D** sensor.", "يقيس مقياس المدى **نقطة واحدة في كل مرة**، لذا فهو مستشعر **أحادي البعد (1-D)**.")],
        d2: [
          bi(
            "Sweeping the beam in a plane, usually with a rotating mirror, gives a fan of ranges at known angles: a **2-D** scan of the walls and obstacles.",
            "تحريك الشعاع في مستوى، بمرآة دوّارة في العادة، يعطي مروحة من المسافات عند زوايا معروفة: أي مسحًا **ثنائي الأبعاد (2-D)** للجدران والعوائق.",
          ),
        ],
        d3: [
          bi(
            "A second axis of rotation tilts the fan in elevation too, so the sensor returns a **point cloud**: a 3-D scanner, or **LiDAR**, as used on autonomous vehicles.",
            "ومحور دوران ثانٍ يُميل المروحة في الارتفاع أيضًا، فيعيد المستشعر **سحابة نقاط (point cloud)**: إنه ماسح ثلاثي الأبعاد، أو **ليدار (LiDAR)**، كما في المركبات ذاتية القيادة.",
          ),
        ],
      },
    },
    {
      id: "occlusion",
      pill: bi("Occlusion", "الحجب"),
      heading: bi("A scanner sees surfaces, not what is behind them", "الماسح يرى الأسطح، لا ما خلفها"),
      control: {
        label: bi("Robot", "الروبوت"),
        options: [
          { id: "first", label: bi("First position", "الموضع الأول") },
          { id: "moved", label: bi("After moving", "بعد التحرك") },
        ],
        initial: "first",
      },
      points: [
        bi(
          "Every beam stops at the first surface it meets. The shadow behind the box is **unknown**, not empty, and the map must keep that difference (book p. 129).",
          "يتوقف كل شعاع عند أول سطح يقابله. فالظل خلف الصندوق **مجهول** وليس فارغًا، ويجب أن تحتفظ الخريطة بهذا الفرق (الكتاب ص 129).",
        ),
      ],
      pointsFor: {
        first: [bi("From here, the far side of the box and the wall behind it are hidden.", "من هذا الموضع يختفي الجانب البعيد من الصندوق والجدار الذي خلفه.")],
        moved: [bi("After the robot moves, beams reach into the old shadow: this is why mobile robots must move in order to see.", "بعد أن يتحرك الروبوت تصل الأشعة إلى داخل الظل القديم: ولهذا يجب أن تتحرك الروبوتات المتنقلة لكي ترى.")],
      },
    },
  ],
});

// ---------- Infrared distance sensors ----------
export const infrared = defineWalkthrough({
  id: "rob4-infrared",
  title: bi("Distance from an angle", "المسافة من زاوية"),
  analogy: bi(
    "Close one eye and move your head sideways: near things jump across your view, far things barely move. An IR sensor judges distance the same way, from a fixed baseline.",
    "أغمض عينًا واحدة وحرّك رأسك جانبيًا: الأشياء القريبة تقفز عبر مجال رؤيتك، والبعيدة لا تكاد تتحرك. ومستشعر الأشعة تحت الحمراء يقدّر المسافة بالطريقة نفسها، من خط أساس ثابت.",
  ),
  facts: { pulse: 40 },
  panels: [
    {
      id: "triangulation",
      pill: bi("Triangulation", "التثليث"),
      heading: bi("Where the spot lands gives the distance", "موضع سقوط البقعة يعطي المسافة"),
      control: {
        label: bi("Object", "الجسم"),
        options: [
          { id: "near", label: bi("Near", "قريب") },
          { id: "far", label: bi("Far", "بعيد") },
        ],
        initial: "near",
      },
      points: [
        bi(
          "A photon's time of flight is far too short for a simple, cheap circuit, so an IR sensor **triangulates**: a pulsed LED lights the object, and a **detector array** a known **baseline** b away sees the returning spot (slide 33; book p. 130).",
          "زمن طيران الفوتون أقصر بكثير من أن تقيسه دائرة بسيطة رخيصة، لذا يعتمد مستشعر الأشعة تحت الحمراء على **التثليث (triangulation)**: يضيء LED نابض الجسم، وترى **مصفوفة كواشف (detector array)** على بُعد **خط أساس (baseline)** b معروف البقعةَ العائدة (الشريحة 33؛ الكتاب ص 130).",
        ),
        bi("Where the spot lands on the array fixes the angle of return, and geometry turns that angle into the range (book p. 130).", "موضع سقوط البقعة على المصفوفة يحدد زاوية العودة، والهندسة تحوّل هذه الزاوية إلى مسافة (الكتاب ص 130)."),
      ],
      pointsFor: {
        near: [bi("A **near** object returns the light at a steep angle, onto one end of the array.", "الجسم **القريب** يعيد الضوء بزاوية حادة إلى أحد طرفي المصفوفة.")],
        far: [bi("A **distant** object returns it nearly parallel, onto the other end.", "الجسم **البعيد** يعيده موازيًا تقريبًا إلى الطرف الآخر.")],
      },
    },
    {
      id: "nonlinear",
      pill: bi("Non-linear response", "استجابة غير خطية"),
      heading: bi("The spot moves less and less as the object recedes", "تتحرك البقعة أقل فأقل كلما ابتعد الجسم"),
      points: [
        bi(
          "The response is **non-linear**: the spot moves a lot at short range and only a little at long range, so equal steps in distance give shrinking steps on the array (book p. 130).",
          "الاستجابة **غير خطية**: تتحرك البقعة كثيرًا عند المدى القصير وقليلًا عند المدى البعيد، فالخطوات المتساوية في المسافة تعطي خطوات تتقلص على المصفوفة (الكتاب ص 130).",
        ),
        bi(
          "So the resolution gets worse with distance, the output must be **linearized**, and a small sensor is useful only to under a metre.",
          "لذا تسوء الاستبانة (resolution) مع المسافة، ويجب **تخطيط (linearize)** الخرج، ولا يفيد المستشعر الصغير إلا لمسافة دون المتر.",
        ),
      ],
    },
    {
      id: "pulsed",
      pill: bi("Pulsed at 40 kHz", "نبضات بتردد 40 kHz"),
      heading: bi("Pulsing the LED shuts out room light", "جعل الـ LED نابضًا يحجب ضوء الغرفة"),
      points: [
        bi(
          "The LED is pulsed at about **40 kHz** and the detector answers only to light modulated at that frequency, so steady sunlight and lamps are rejected.",
          "يُشغَّل الـ LED نبضيًا بتردد نحو **40 kHz**، ولا يستجيب الكاشف إلا للضوء المُعدَّل بهذا التردد، فيُرفض ضوء الشمس والمصابيح الثابت.",
        ),
        bi(
          "IR is invisible, but a phone camera (only partly IR-filtered) or an IR detector card shows the emitter glowing: a quick check that it works.",
          "الأشعة تحت الحمراء غير مرئية، لكن كاميرا الهاتف (المرشَّحة جزئيًا فقط ضد هذه الأشعة) أو بطاقة كشف الأشعة تحت الحمراء تُظهر المُرسِل متوهجًا: وهي طريقة سريعة للتأكد من أنه يعمل.",
        ),
      ],
    },
    {
      id: "reflectivity",
      pill: bi("Bright or dull target", "هدف لامع أم باهت"),
      heading: bi("It measures where the light lands, not how much returns", "يقيس أين يسقط الضوء، لا كم يعود منه"),
      control: {
        label: bi("Target", "الهدف"),
        options: [
          { id: "white", label: bi("White", "أبيض") },
          { id: "grey", label: bi("Grey", "رمادي") },
        ],
        initial: "white",
      },
      points: [bi("The sensor measures **where** the light returns rather than how much, so it is largely independent of the target's reflectivity (book p. 130).", "يقيس المستشعر **أين** يعود الضوء لا كم يعود منه، لذا فهو مستقل إلى حد كبير عن انعكاسية الهدف (الكتاب ص 130).")],
      pointsFor: {
        white: [bi("A white target sends back a bright spot.", "الهدف الأبيض يعيد بقعة ساطعة.")],
        grey: [
          bi(
            "A grey target sends back a dimmer spot in the **same** place, so the distance is the same. The independence is only partial: the book's Table 6.2 still lists surface reflectivity among the sensor's weaknesses.",
            "الهدف الرمادي يعيد بقعة أخفت في المكان **نفسه**، فتبقى المسافة كما هي. لكن هذا الاستقلال جزئي فقط: فجدول الكتاب 6.2 ما زال يذكر انعكاسية السطح بين نقاط ضعف هذا المستشعر.",
          ),
        ],
      },
    },
  ],
});

// ---------- Tachometers ----------
const T = TACHO_FACTS;

export const tachometer = defineWalkthrough({
  id: "rob4-tachometer",
  title: bi("Measuring speed directly", "قياس السرعة مباشرةً"),
  analogy: bi(
    "Working out a car's speed from the kilometre signs passed in each second jumps between whole signs; a speedometer needle reads the speed itself.",
    "حساب سرعة السيارة من عدد لافتات الكيلومترات التي تمر بها في كل ثانية يقفز بين أعداد صحيحة من اللافتات؛ أما إبرة عدّاد السرعة فتقرأ السرعة نفسها.",
  ),
  facts: T,
  panels: [
    {
      id: "from-pulses",
      pill: bi("Speed from counts", "السرعة من العدّات"),
      heading: bi("Differentiating position: counts per window", "اشتقاق الموضع: العدّات في كل نافذة زمنية"),
      control: {
        label: bi("Window", "النافذة"),
        options: [
          { id: "w1", label: bi("1 ms", "1 ms") },
          { id: "w10", label: bi("10 ms", "10 ms") },
        ],
        initial: "w1",
      },
      points: [
        bi(
          `Velocity can be computed from the encoder: counts in a window ÷ the window. A ${T.cpr}-count encoder (500 slots, ×4) turning at a steady ${T.true} rpm gives 2.5 counts per millisecond.`,
          `يمكن حساب السرعة من المُرمِّز: العدّات في نافذة زمنية ÷ طول النافذة. فالمُرمِّز ذو ${T.cpr} عدّة (500 فتحة، ×4) الذي يدور بسرعة ثابتة ${T.true} rpm يعطي 2.5 عدّة في كل ملّي ثانية.`,
        ),
      ],
      pointsFor: {
        w1: [
          bi(
            `In 1 ms the count can only be 2 or 3, so the speed jumps between **${T.low}** and **${T.high} rpm**. One count in 1 ms is ${T.noise} counts/s, here ${T.rpmPerCount} rpm: differentiation amplifies the ±1-count noise.`,
            `في 1 ms لا يكون العدد إلا 2 أو 3، فتقفز السرعة بين **${T.low}** و **${T.high} rpm**. فالعدّة الواحدة في 1 ms تساوي ${T.noise} عدّة/ثانية، أي ${T.rpmPerCount} rpm هنا: فالاشتقاق يضخّم ضوضاء ±1 عدّة.`,
          ),
        ],
        w10: [
          bi(
            `A 10 ms window counts 25 and reads ${T.true} rpm: the one-count error is now divided by a longer time. But there is only one reading every 10 ms. Noisy velocity fed into the servo loop is heard as buzzing (book p. 131).`,
            `أما النافذة 10 ms فتعدّ 25 وتقرأ ${T.true} rpm: فخطأ العدّة الواحدة يُقسم الآن على زمن أطول. لكنها لا تعطي إلا قراءة واحدة كل 10 ms. والسرعة المشوشة حين تدخل حلقة المؤازرة (servo loop) تُسمع طنينًا (الكتاب ص 131).`,
          ),
        ],
      },
    },
    {
      id: "dc-tacho",
      pill: bi("DC tachometer", "مقياس سرعة مستمر"),
      heading: bi("A small generator whose voltage follows the speed", "مولِّد صغير يتبع جهدُه السرعةَ"),
      control: {
        label: bi("Shaft speed", "سرعة العمود"),
        options: [
          { id: "slow", label: bi("ω", "ω") },
          { id: "fast", label: bi("2ω", "2ω") },
        ],
        initial: "slow",
      },
      points: [
        bi(
          "A **DC tachometer** is a DC generator with **permanent magnets**. The field is constant, so V = K_t·ω: it measures velocity directly, with no differentiation.",
          "**مقياس سرعة الدوران المستمر (DC tachometer)** مولِّد تيار مستمر ذو **مغناطيسات دائمة**. ولأن المجال ثابت فإن V = K_t·ω: فهو يقيس السرعة مباشرةً دون اشتقاق.",
        ),
      ],
      pointsFor: {
        slow: [bi("At speed ω the output is K_t·ω.", "عند السرعة ω يكون الخرج K_t·ω.")],
        fast: [bi("Double the speed and the voltage doubles. It is a DC motor run backwards: the back-EMF of a motor, used as a sensor.", "ضاعِف السرعة يتضاعف الجهد. إنه محرك تيار مستمر يعمل بالعكس: القوة الدافعة الكهربائية العكسية (back-EMF) للمحرك مستخدَمةً مستشعرًا.")],
      },
    },
    {
      id: "ripple",
      pill: bi("DC or AC", "مستمر أم متردد"),
      heading: bi("Commutator ripple, and how AC types avoid it", "تموّج المبدِّل، وكيف تتجنبه الأنواع المترددة"),
      control: {
        label: bi("Tachometer", "مقياس السرعة"),
        options: [
          { id: "dc", label: bi("DC", "مستمر (DC)") },
          { id: "ac", label: bi("AC", "متردد (AC)") },
        ],
        initial: "dc",
      },
      points: [bi("Even at a constant speed the output is not perfectly clean.", "حتى عند سرعة ثابتة لا يكون الخرج نظيفًا تمامًا.")],
      pointsFor: {
        dc: [
          bi(
            "The **commutator** adds a slight **ripple** to the DC output that cannot be filtered out entirely. Being simpler, DC tachometers are still the usual choice in robots.",
            "يضيف **المبدِّل (commutator)** **تموّجًا (ripple)** طفيفًا إلى الخرج المستمر لا يمكن ترشيحه بالكامل. ومع ذلك تبقى مقاييس السرعة المستمرة الخيار المعتاد في الروبوتات لأنها أبسط.",
          ),
        ],
        ac: [
          bi(
            "An **AC tachometer** avoids that ripple, together with some other imperfections (book p. 131). Even so, robots generally use the simpler DC type.",
            "**مقياس السرعة المتردد (AC tachometer)** يتجنب ذلك التموّج مع بعض العيوب الأخرى (الكتاب ص 131). ومع ذلك تستخدم الروبوتات عمومًا النوع المستمر الأبسط.",
          ),
        ],
      },
    },
  ],
});

// ---------- Tactile sensors ----------
export const tactile = defineWalkthrough({
  id: "rob4-tactile",
  title: bi("Sensing by touch", "الاستشعار باللمس"),
  analogy: bi(
    "Holding a glass without looking: your fingertips feel where the pressure is and whether the glass is starting to slip, and you tighten your grip before it falls.",
    "أن تمسك كوبًا دون أن تنظر إليه: تشعر أطراف أصابعك بمكان الضغط وبما إذا كان الكوب قد بدأ ينزلق، فتشدّ قبضتك قبل أن يسقط.",
  ),
  panels: [
    {
      id: "array",
      pill: bi("An array of elements", "مصفوفة من العناصر"),
      heading: bi("An array turns a press into a pressure map", "المصفوفة تحوّل الضغطة إلى خريطة ضغط"),
      control: {
        label: bi("Press", "الضغط"),
        options: [
          { id: "light", label: bi("Light touch", "لمسة خفيفة") },
          { id: "firm", label: bi("Firm press", "ضغطة قوية") },
        ],
        initial: "light",
      },
      points: [
        bi(
          "A **tactile array** is a grid of sensing elements between a base and an outer layer. Each element reports the force on it, so together they give the **contact force distribution**.",
          "**المصفوفة اللمسية (tactile array)** شبكة من عناصر الاستشعار بين قاعدة وطبقة خارجية. ويُبلغ كل عنصر عن القوة الواقعة عليه، فتعطي معًا **توزيع قوة التلامس**.",
        ),
      ],
      pointsFor: {
        light: [bi("A light touch loads a few elements under the fingertip.", "اللمسة الخفيفة تحمِّل عددًا قليلًا من العناصر تحت طرف الإصبع.")],
        firm: [bi("A firm press spreads over more elements, with higher readings.", "الضغطة القوية تنتشر على عناصر أكثر، بقراءات أعلى.")],
      },
    },
    {
      id: "grip",
      pill: bi("In a finger", "في الإصبع"),
      heading: bi("A distribution says more than one force", "التوزيع يخبر بأكثر مما تخبر به قوة واحدة"),
      control: {
        label: bi("Grasp", "القبضة"),
        options: [
          { id: "centred", label: bi("Centred", "في المركز") },
          { id: "offset", label: bi("Off-centre", "بعيدًا عن المركز") },
          { id: "slip", label: bi("Slipping", "انزلاق") },
        ],
        initial: "centred",
      },
      points: [
        bi(
          "In a robot **finger**, the map tells the robot how the object sits, not just how hard it is gripped (book p. 132).",
          "في **إصبع** الروبوت تخبر الخريطةُ الروبوتَ بكيفية استقرار الجسم، لا بمدى قوة القبض عليه فقط (الكتاب ص 132).",
        ),
      ],
      pointsFor: {
        centred: [bi("The pressure is centred on the pad: the object is held squarely.", "الضغط في مركز الوسادة: الجسم ممسوك باستقامة.")],
        offset: [bi("The centre of pressure sits near the edge: the object was picked up off-centre or at an angle.", "مركز الضغط قريب من الحافة: التُقط الجسم بعيدًا عن المركز أو بزاوية.")],
        slip: [bi("The pressure creeps across the pad: the object is **slipping**, and the grip must tighten before it fails.", "يزحف الضغط عبر الوسادة: الجسم **ينزلق**، ويجب أن تشتد القبضة قبل أن تفلت.")],
      },
    },
    {
      id: "skin",
      pill: bi("Robot skin", "جلد الروبوت"),
      heading: bi("A skin lets the robot respond to contact", "الجلد يتيح للروبوت أن يستجيب للتلامس"),
      control: {
        label: bi("Made safe by", "الأمان عن طريق"),
        options: [
          { id: "fence", label: bi("Keeping people out", "إبعاد الناس") },
          { id: "skin", label: bi("Feeling contact", "الإحساس بالتلامس") },
        ],
        initial: "fence",
      },
      points: [bi("Tactile arrays wrapped round the arm act as an **artificial skin** that feels contact anywhere on the robot's body.", "المصفوفات اللمسية الملفوفة حول الذراع تعمل **جلدًا اصطناعيًا** يشعر بالتلامس في أي مكان من جسم الروبوت.")],
      pointsFor: {
        fence: [bi("A conventional industrial robot is made safe by a **guarded envelope**: people stay outside the fence.", "الروبوت الصناعي التقليدي يُجعل آمنًا بـ**منطقة محروسة (guarded envelope)**: يبقى الناس خارج السياج.")],
        skin: [
          bi(
            "With a skin, the robot feels an unexpected touch and stops or yields: the basis of **collaborative robots** that work beside people.",
            "مع الجلد يشعر الروبوت بلمسة غير متوقعة فيتوقف أو يتراجع: وهذا أساس **الروبوتات التعاونية (collaborative robots)** التي تعمل بجانب البشر.",
          ),
        ],
      },
    },
    {
      id: "principles",
      pill: bi("Sensing principles", "مبادئ الاستشعار"),
      heading: bi("Six ways to turn force into a signal", "ست طرق لتحويل القوة إلى إشارة"),
      control: {
        label: bi("Principle", "المبدأ"),
        options: [
          { id: "deformation", label: bi("Deformation", "التشوّه") },
          { id: "resistive", label: bi("Resistive", "مقاومي") },
          { id: "capacitive", label: bi("Capacitive", "سعوي") },
          { id: "optical", label: bi("Optical", "ضوئي") },
          { id: "magnetic", label: bi("Magnetic", "مغناطيسي") },
          { id: "mechanical", label: bi("Mechanical", "ميكانيكي") },
        ],
        initial: "deformation",
      },
      points: [bi("Any of these can sit under each element of the array (slides 41–42).", "يمكن أن يقع أيٌّ من هذه المبادئ تحت كل عنصر من عناصر المصفوفة (الشريحتان 41–42).")],
      pointsFor: {
        deformation: [
          bi(
            "**Deformation-based**: the surface strains, and strain gauges in a **Wheatstone bridge** turn their tiny change in resistance into a measurable voltage.",
            "**القائم على التشوّه (deformation-based)**: ينفعل السطح، فتحوّل مقاييس الانفعال (strain gauges) الموصولة في **قنطرة ويتستون (Wheatstone bridge)** تغيّرها الضئيل في المقاومة إلى جهد يمكن قياسه.",
          ),
        ],
        resistive: [
          bi(
            "**Resistive**: the resistance of a material between two electrodes changes with pressure. Such materials are cheap and easy to make into large flexible sheets.",
            "**المقاومي (resistive)**: تتغير مقاومة مادة بين قطبين كهربائيين مع الضغط. وهذه المواد رخيصة ويسهل تشكيلها في صفائح كبيرة مرنة.",
          ),
        ],
        capacitive: [
          bi(
            "**Capacitive**: force changes the distance between the plates (or their area), so the capacitance changes. Sensitive, and it can even detect a hand approaching.",
            "**السعوي (capacitive)**: تغيّر القوة المسافة بين اللوحين (أو مساحتهما)، فتتغير السعة. وهو حساس، بل يستطيع أن يكتشف يدًا تقترب.",
          ),
        ],
        optical: [
          bi(
            "**Optical**: the deformation changes how much light reaches a detector. It is immune to electrical interference.",
            "**الضوئي (optical)**: يغيّر التشوّه كمية الضوء التي تصل إلى الكاشف. وهو محصَّن ضد التداخل الكهربائي.",
          ),
        ],
        magnetic: [
          bi(
            "**Magnetic**: a small magnet in a soft layer moves as the layer deforms, and the change in the field is measured beneath it.",
            "**المغناطيسي (magnetic)**: يتحرك مغناطيس صغير داخل طبقة لينة عندما تتشوّه، ويُقاس تغيّر المجال من أسفلها.",
          ),
        ],
        mechanical: [
          bi(
            "**Mechanical**: a micro-switch closes. Just on or off, one bit per element, but very simple to read.",
            "**الميكانيكي (mechanical)**: ينغلق مفتاح دقيق (micro-switch). تشغيل أو إيقاف فقط، بِت واحد لكل عنصر، لكن قراءته بسيطة جدًا.",
          ),
        ],
      },
    },
  ],
});

/** Every walkthrough in this lecture, registered in lib/walkthroughs/index.ts. */
export const all = [encoders, sonar, lidar, infrared, tachometer, tactile] as const;

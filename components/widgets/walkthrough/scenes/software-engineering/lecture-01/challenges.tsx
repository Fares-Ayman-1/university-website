"use client";

import type { challenges } from "@/lib/walkthroughs/software-engineering/lecture-01";
import { BUILD_SPLIT, EVOLUTION_DRAWN } from "@/lib/widgets/se-lecture-01";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Mark, Person, Svg, Text, Token, type Pt } from "../../../primitives";
import { sceneSet } from "../../../scene-set";

function Heterogeneity() {
  const platforms = [bi("Android phone", "هاتف Android"), bi("Windows PC", "حاسوب Windows"), bi("Web browser", "متصفح الويب"), bi("Smart watch", "ساعة ذكية")];
  const ys = [46, 102, 158, 214];
  return (
    <Svg>
      <Box x={20} y={116} w={140} h={48} label={bi("Your software", "برمجياتك")} tone="navy" d={0} />
      {platforms.map((p, i) => (
        <g key={i}>
          <Arrow pts={[[162, 140], [328, ys[i] + 22]]} tone="faint" d={300 + i * 150} />
          <Box x={330} y={ys[i]} w={150} h={44} label={p} tone="outline" d={400 + i * 150} />
          <Token pts={[[162, 140], [328, ys[i] + 22]]} d={700 + i * 200} dur={500} />
          <Mark x={500} y={ys[i] + 22} ok d={1200 + i * 200} />
        </g>
      ))}
      <Chip x={105} y={236} text={bi("technology changes fast", "التقنية تتغير بسرعة")} tone="warn" center d={2000} />
    </Svg>
  );
}

const MONTH = 440 / 12;
const mx = (m: number) => 40 + m * MONTH;

function Delivery({ control }: { control: string }) {
  const often = control === "often";
  return (
    <Svg>
      <Arrow pts={[[40, 200], [500, 200]]} tone="faint" d={0} dur={600} />
      {[0, 3, 6, 9, 12].map((m) => (
        <Text key={m} x={mx(m)} y={216} text={`${m}`} mono size={10.5} tone="muted" d={100} />
      ))}
      <Text x={548} y={216} text={bi("months", "الأشهر")} anchor="end" tone="muted" size={11} d={100} />
      {often ? (
        <>
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <Box key={k} x={mx(2 * k) + 4} y={120} w={2 * MONTH - 8} h={44} label={`v${k + 1}`} mono tone="success" d={300 + k * 300} />
          ))}
          <Chip x={150} y={74} text={bi("users get v1 early", "يحصل المستخدمون على v1 مبكرًا")} tone="success" center d={600} />
          <Arrow pts={[[90, 92], [76, 118]]} tone="success" d={700} dur={250} />
          <Text x={270} y={250} text={bi("first working software: month 2", "أول برمجيات تعمل: الشهر 2")} tone="success" size={12.5} d={2200} />
        </>
      ) : (
        <>
          <Box x={40} y={120} w={440} h={44} label={bi("building the whole system", "بناء النظام كاملًا")} tone="muted" dashed d={300} />
          <Chip x={mx(6)} y={74} text={bi("needs change", "تتغير الاحتياجات")} tone="warn" center d={900} />
          <Arrow pts={[[mx(6), 94], [mx(6), 118]]} tone="gold" d={1000} dur={250} />
          <Chip x={mx(12)} y={74} text={bi("release", "الإصدار")} tone="gold" center d={1400} />
          <Arrow pts={[[mx(12), 94], [mx(12), 118]]} tone="gold" d={1500} dur={250} />
          <Text x={270} y={250} text={bi("first working software: month 12", "أول برمجيات تعمل: الشهر 12")} tone="danger" size={12.5} d={1800} />
        </>
      )}
    </Svg>
  );
}

function Trust() {
  const evidence = [bi("Testing", "الاختبار"), bi("Reviews", "المراجعات"), bi("Security checks", "فحوص الأمن")];
  const ys = [44, 104, 164];
  return (
    <Svg>
      <Box x={20} y={110} w={130} h={56} label={bi("Software", "البرمجيات")} tone="navy" d={0} />
      {evidence.map((e, i) => (
        <g key={i}>
          <Arrow pts={[[152, 138], [198, ys[i] + 22]]} tone="faint" d={200 + i * 150} dur={300} />
          <Box x={200} y={ys[i]} w={150} h={44} label={e} tone="slate" d={300 + i * 150} />
          <Arrow pts={[[352, ys[i] + 22], [438, 120]]} tone="success" d={900 + i * 150} />
          <Token pts={[[352, ys[i] + 22], [438, 120]]} tone="success" d={1000 + i * 200} dur={500} />
        </g>
      ))}
      <Person x={470} y={96} label={bi("Users", "المستخدمون")} d={800} />
      <Mark x={500} y={100} ok d={1700} />
      <Text x={470} y={190} text={bi("can rely on it", "يمكنهم الاعتماد عليها")} tone="success" size={12} d={1800} />
      <Chip x={275} y={250} text={bi("shown, not just claimed", "إثبات لا مجرد ادعاء")} tone="gold" center d={2000} />
    </Svg>
  );
}

function Costs({ control }: { control: string }) {
  const { development, testing } = BUILD_SPLIT;
  if (control === "life") {
    const unit = 480 / (development + testing + EVOLUTION_DRAWN);
    const devW = development * unit;
    const testW = testing * unit;
    const evoX = 40 + devW + testW;
    return (
      <Svg>
        <Text x={280} y={22} text={bi("Cost over the system's life", "التكلفة على مدى عمر النظام")} tone="heading" size={12.5} d={0} />
        <Box x={40} y={76} w={devW} h={68} r={0} label={bi("Development", "التطوير")} tone="gold" d={100} />
        <Box x={40 + devW} y={76} w={testW} h={68} r={0} label={bi("Testing", "الاختبار")} tone="slate" d={250} />
        <Box x={evoX} y={76} w={480 - devW - testW} h={68} r={0} label={bi("Evolution", "التطور")} sub={bi("after delivery", "بعد التسليم")} tone="navy" d={700} />
        <Arrow pts={[[40, 152], [40, 160], [evoX - 2, 160], [evoX - 2, 152]]} tone="muted" head={false} d={500} />
        <Text x={(40 + evoX) / 2} y={178} text={bi("building", "البناء")} tone="muted" size={11.5} d={600} />
        <Arrow pts={[[evoX + 2, 152], [evoX + 2, 160], [520, 160], [520, 152]]} tone="navy" head={false} d={1000} />
        <Chip x={(evoX + 520) / 2} y={194} text={bi("often costs more than development", "كثيرًا ما تتجاوز تكلفة التطوير")} tone="danger" center d={1200} />
        <Text x={280} y={250} text={bi("custom software with a long life", "برمجيات مخصصة ذات عمر طويل")} tone="muted" size={11.5} d={1400} />
      </Svg>
    );
  }
  const devW = 480 * (development / (development + testing));
  return (
    <Svg>
      <Text x={280} y={22} text={bi("Cost of building the system", "تكلفة بناء النظام")} tone="heading" size={12.5} d={0} />
      <Box x={40} y={76} w={devW} h={68} r={0} label={bi("Development", "التطوير")} sub={`${development} %`} tone="gold" size={14} d={100} />
      <Box x={40 + devW} y={76} w={480 - devW} h={68} r={0} label={bi("Testing", "الاختبار")} sub={`${testing} %`} tone="slate" size={14} d={500} />
      <Arrow pts={[[40, 152], [40, 160], [520, 160], [520, 152]]} tone="muted" head={false} d={800} />
      <Text x={280} y={182} text={bi("the split depends on the type of system and the development model", "يعتمد التوزيع على نوع النظام ونموذج التطوير")} tone="muted" size={11.5} d={900} />
      <Chip x={280} y={244} text={bi("all before delivery", "كلها قبل التسليم")} tone="outline" center d={1200} />
    </Svg>
  );
}

function NoUniversal({ control }: { control: string }) {
  const game = control === "game";
  return (
    <Svg>
      <Box
        x={20}
        y={96}
        w={160}
        h={68}
        label={game ? bi("A game", "لعبة") : bi("Anti-lock braking", "منع انغلاق المكابح")}
        sub={game ? bi("fun is what counts", "المتعة هي الأهم") : bi("safety-critical", "حرج من حيث السلامة")}
        tone={game ? "gold" : "danger"}
        d={0}
      />
      <Arrow pts={[[182, 130], [222, 130]]} tone="slate" d={300} dur={250} label={bi("decides", "يحدد")} labelAt={[202, 100]} />
      {game ? <GameLoop /> : <BrakesChain />}
    </Svg>
  );
}

function BrakesChain() {
  const steps = [bi("Complete, analyzable spec", "توصيف كامل قابل للتحليل"), bi("Build", "البناء"), bi("Extensive validation", "تحقق مكثف")];
  const ys = [50, 118, 186];
  return (
    <>
      {steps.map((s, i) => (
        <g key={i}>
          <Box x={224} y={ys[i]} w={220} h={44} label={s} tone="navy" d={500 + i * 300} />
          {i < 2 ? <Arrow pts={[[334, ys[i] + 46], [334, ys[i + 1] - 2]]} tone="slate" d={650 + i * 300} dur={200} /> : null}
        </g>
      ))}
      <Arrow pts={[[446, 208], [476, 208]]} tone="success" d={1400} dur={200} />
      <Box x={478} y={186} w={66} h={44} label={bi("Ship", "الطرح")} tone="success" d={1500} />
      <Token pts={[[334, 96], [334, 116]]} d={700} dur={300} />
      <Token pts={[[334, 164], [334, 184]]} d={1000} dur={300} />
      <Token pts={[[446, 208], [476, 208]]} tone="success" d={1450} dur={300} />
    </>
  );
}

function GameLoop() {
  const loop: Pt[] = [
    [382, 72],
    [469, 72],
    [469, 126],
    [469, 174],
    [469, 228],
    [382, 228],
    [305, 228],
    [305, 96],
    [305, 72],
    [382, 72],
  ];
  return (
    <>
      <Box x={230} y={50} w={150} h={44} label={bi("Prototype", "نموذج أولي")} tone="gold" d={500} />
      <Arrow pts={[[382, 72], [469, 72], [469, 126]]} tone="gold" d={700} />
      <Box x={394} y={128} w={150} h={44} label={bi("Players try it", "يجربه اللاعبون")} tone="slate" d={900} />
      <Arrow pts={[[469, 174], [469, 228], [382, 228]]} tone="gold" d={1100} />
      <Box x={230} y={206} w={150} h={44} label={bi("Refine", "التحسين")} tone="navy" d={1300} />
      <Arrow pts={[[305, 204], [305, 96]]} tone="gold" d={1500} label={bi("repeat", "كرِّر")} labelAt={[345, 144]} labelTone="gold" />
      <Token pts={loop} d={1700} dur={2400} />
    </>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof challenges>>({
  heterogeneity: Heterogeneity,
  delivery: Delivery,
  trust: Trust,
  costs: Costs,
  "no-universal": NoUniversal,
});

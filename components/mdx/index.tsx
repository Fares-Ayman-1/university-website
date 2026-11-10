import type { MDXComponents } from "mdx/types";
import type { Collection } from "@/lib/content";
import { Callout, Definition, Objectives, Takeaways } from "./Callouts";
import { Card, Grid, Steps } from "./Layout";
import { CodeBlock } from "./CodeBlock";
import { Exercise, Solution } from "./Exercise";
import { Quiz } from "./Quiz";
import { SlideFigure } from "./SlideFigure";
import { Tree } from "./Tree";
import { WeightedGraph } from "./WeightedGraph";
import { AgentLoop } from "./AgentLoop";
import { Ar, ArInline } from "./Arabic";
import { ConvolutionStepper } from "@/components/widgets/ConvolutionStepper";
import { StateMachine } from "@/components/widgets/StateMachine";
import { SearchStepper } from "@/components/widgets/SearchStepper";
import { RelationalAlgebra } from "@/components/widgets/RelationalAlgebra";
import { EncoderSim } from "@/components/widgets/EncoderSim";
import { Walkthrough } from "@/components/widgets/Walkthrough";
import { SearchCostCalc } from "@/components/widgets/SearchCostCalc";
import { AStarTable } from "@/components/widgets/AStarTable";
import { PuzzleHeuristics } from "@/components/widgets/PuzzleHeuristics";

type Context = { subject: string; collection: Collection; slug: string };

export function createMdxComponents(context: Context): MDXComponents {
  return {
    pre: CodeBlock,
    table: (props) => (
      <div className="table-wrap">
        <table {...props} />
      </div>
    ),
    Callout,
    Definition,
    Objectives,
    Takeaways,
    Steps,
    Grid,
    Card,
    Exercise,
    Solution,
    Quiz,
    Tree,
    WeightedGraph,
    AgentLoop,
    Ar,
    ArInline,
    ConvolutionStepper,
    StateMachine,
    SearchStepper,
    RelationalAlgebra,
    EncoderSim,
    Walkthrough,
    SearchCostCalc,
    AStarTable,
    PuzzleHeuristics,
    SlideFigure: (props: Omit<React.ComponentProps<typeof SlideFigure>, "context">) => (
      <SlideFigure {...props} context={context} />
    ),
  };
}

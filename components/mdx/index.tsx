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
    SlideFigure: (props: Omit<React.ComponentProps<typeof SlideFigure>, "context">) => (
      <SlideFigure {...props} context={context} />
    ),
  };
}

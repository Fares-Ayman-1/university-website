import {
  assertOutput,
  filterImage,
  parseMatrix,
  resolveKernel,
  type FilterMode,
  type Padding,
} from "@/lib/widgets/convolution";
import { WidgetShell } from "./WidgetShell";
import { bi } from "./types";
import { ConvolutionPlayer } from "./players";

/**
 * <ConvolutionStepper image="3 3 2; 0 0 1; …" kernel="0 1 2; 2 2 0; 0 1 2" expect="12 12 17; …" />
 * `kernel` is a matrix or a preset (mean, identity, laplacian, shift). `expect`, copied from
 * the page, makes the build fail if the widget would show a different answer.
 */
export function ConvolutionStepper({
  image,
  kernel = "mean",
  mode = "correlation",
  padding = "none",
  expect,
  title = "Slide the mask over the image",
  titleAr = "حرّك القناع فوق الصورة",
  caption,
  captionAr,
}: {
  image: string;
  kernel?: string;
  mode?: FilterMode;
  padding?: Padding;
  expect?: string;
  title?: string;
  titleAr?: string;
  caption?: string;
  captionAr?: string;
}) {
  const pixels = parseMatrix(image);
  const result = filterImage(pixels, resolveKernel(kernel), mode, padding);
  if (expect) assertOutput(result.output, parseMatrix(expect), "<ConvolutionStepper>");

  return (
    <WidgetShell
      name="convolution"
      kicker={bi("Spatial filtering", "الترشيح المكاني")}
      title={title}
      titleAr={titleAr}
      caption={caption}
      captionAr={captionAr}
    >
      <ConvolutionPlayer image={pixels} kernel={kernel} mode={mode} padding={padding} />
    </WidgetShell>
  );
}

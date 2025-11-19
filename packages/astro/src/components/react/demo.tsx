import { TabsDemo } from "./basicExample";
import exampleCode from "./basicExample?raw";
import ShikiHighlighter from "react-shiki";

const highlight = "ref={() => {}}";
const start = exampleCode.indexOf(highlight);
const end = start + highlight.length;
const properties = { class: "bg-neutral-600 rounded-sm p-1 -m-1" };
const decoration = { start, end, properties };

export default () => {
  return (
    <div className="flex items-center flex-col p-4">
      React / shadcn
      <TabsDemo />
      <ShikiHighlighter
        className="text-sm"
        language="jsx"
        theme="github-dark"
        decorations={[decoration]}
      >
        {exampleCode}
      </ShikiHighlighter>
    </div>
  );
};

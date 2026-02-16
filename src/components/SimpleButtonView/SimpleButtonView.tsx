import { Joy } from "../../types";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";

function getButtonColor(value: number): string {
  // Convert value to a hue between 120 (green) and 0 (red)
  const hue = 120 - value * 120;
  return `hsl(${hue}, 100%, 50%)`;
}

export function SimpleButtonView(props: { readonly joy: Joy | undefined }): JSX.Element {
  const buttons = props.joy
    ? props.joy.buttons.map((item: number, index: number) => (
        <Button
          key={`button-${index}`} // Use a unique identifier for the key
          variant={item > 0 ? "default" : "outline"}
          size="sm"
          style={item > 0 ? { backgroundColor: getButtonColor(item) } : undefined}
          className={item > 0 ? "text-black" : undefined}
        >
          {index} ({item})
        </Button>
      ))
    : [];

  const axes = props.joy
    ? props.joy.axes.map((item: number, index: number) => (
        <Progress key={index} value={item * 50 + 50} className="h-2 transition-none" />
      ))
    : [];

  return (
    <div className="flex flex-col gap-3">
      {props.joy ? null : (
        <div className="text-sm text-muted-foreground">Waiting for first data...</div>
      )}
      <div className="flex flex-wrap gap-2">{buttons}</div>
      <div className="flex flex-col gap-2">{axes}</div>
    </div>
  );
}

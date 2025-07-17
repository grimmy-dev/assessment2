import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

const OutputDisplayer = () => {
  return (
    <Card className="flex-1 h-[500px]">
      <CardHeader>
        <CardTitle>Prediction Output</CardTitle>
        <CardDescription>
          Model prediction results and confidence scores
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full h-full px-4">
        <div className="bg-background rounded-lg p-2 h-full overflow-auto text-sm font-mono">
          test
        </div>
      </CardContent>
    </Card>
  );
};

export default OutputDisplayer;

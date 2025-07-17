import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { ArrowUpIcon, UploadIcon, ZapIcon } from "lucide-react";

const InputTable = () => {
  return (
    <Card className="flex-1 h-[500px] gap-2">
      <CardHeader>
        <CardTitle>Test your Model.</CardTitle>
        <CardDescription>Add test data to validate your model.</CardDescription>
      </CardHeader>
      <CardContent className="h-[480px] flex flex-col gap-4 relative">
        <div className="h-10/12 flex flex-col gap-4 border-b py-4">
          <div className="h-full rounded-md bg-muted flex flex-col items-center justify-center gap-2 text-xl">
            <UploadIcon className="size-24" />
            Choose Test Data
            <div className="p-1 flex items-center justify-center text-xs rounded-md border border-amber-300 bg-amber-200/20 text-amber-300">
              <ZapIcon fill="currentColor" className="size-3 mr-0.5" />
              In development, try the manual way &#58;&#41;
            </div>
          </div>
          <Button
            size="sm"
            className="ml-auto w-fit text-xs hover:-translate-y-0.5 transition-transform duration-200"
          >
            Upload
            <ArrowUpIcon className="size-4" />
          </Button>
        </div>
        <span className="text-xs text-muted-foreground absolute right-1/2 bottom-15">
          OR
        </span>
        <Button>Add Data manually</Button>
      </CardContent>
    </Card>
  );
};

export default InputTable;

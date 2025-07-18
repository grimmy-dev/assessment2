"use client";
import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { CheckCircle2Icon, PlusIcon } from "lucide-react";

interface DataInfo {
  columns: string[];
  column_types: { [key: string]: string };
  sample_values: { [key: string]: any[] };
  shape: [number, number];
}

interface InputTableProps {
  taskId: string;
  canFetch: boolean;
  onPredict: (inputData: any, targetColumn: string) => void;
  onTrain: (targetColumn: string) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const InputTable: React.FC<InputTableProps> = ({
  taskId,
  onPredict,
  onTrain,
  canFetch,
}) => {
  const [dataInfo, setDataInfo] = useState<DataInfo | null>(null);
  const [inputData, setInputData] = useState<{ [key: string]: any }>({});
  const [targetColumn, setTargetColumn] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTrained, setIsTrained] = useState(false);
  const [isTraining, setIsTraining] = useState(false);

  useEffect(() => {
    if (taskId && canFetch) {
      fetchDataInfo();
    }
  }, [taskId, canFetch]);

  const fetchDataInfo = async (retryCount = 0) => {
    try {
      const response = await fetch(`${API_URL}/processed-data/${taskId}`);
      if (response.ok) {
        const data = await response.json();
        setDataInfo(data);
      } else if (response.status === 404 && retryCount < 4) {
        // Data not ready yet, retry after delay
        setTimeout(() => fetchDataInfo(retryCount + 1), 2000);
      } else {
        console.error(
          "Failed to fetch data info:",
          response.status,
          await response.body
        );
      }
    } catch (error) {
      console.error("Error fetching data info:", error);
      if (retryCount < 5) {
        setTimeout(() => fetchDataInfo(retryCount + 1), 2000);
      }
    }
  };

  const handleTrainModel = async () => {
    if (!targetColumn) {
      alert("Please select a target column");
      return;
    }

    setIsTraining(true);
    try {
      const response = await fetch(`${API_URL}/train`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task_id: taskId,
          target_column: targetColumn,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setIsTrained(true);
        onTrain(targetColumn);
        alert(
          `Model trained successfully! ${
            result.score_name
          }: ${result.score.toFixed(4)}`
        );
      } else {
        const error = await response.json();
        alert(`Training failed: ${error.detail}`);
      }
    } catch (error) {
      console.error("Error training model:", error);
      alert("Training failed");
    } finally {
      setIsTraining(false);
    }
  };

  const handleInputChange = (column: string, value: string) => {
    setInputData((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  const handlePredict = () => {
    if (!isTrained) {
      alert("Please train the model first");
      return;
    }

    const featureData = { ...inputData };
    delete featureData[targetColumn]; // Remove target column from input

    onPredict(featureData, targetColumn);
    setIsDialogOpen(false);
    setInputData({});
  };

  const getInputType = (columnType: string) => {
    if (columnType.includes("int") || columnType.includes("float")) {
      return "number";
    }
    return "text";
  };

  const getFeatureColumns = () => {
    if (!dataInfo || !targetColumn) return dataInfo?.columns || [];
    return dataInfo.columns.filter((col) => col !== targetColumn);
  };

  if (!dataInfo) {
    return (
      <Card className="flex-1 h-[500px]">
        <CardContent className="h-full flex items-center justify-center">
          <p>Loading data information...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex-1 h-[500px] gap-2">
      <CardHeader>
        <CardTitle>Test your Model</CardTitle>
        <CardDescription>
          Train your model and add test data to validate predictions
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[480px] flex flex-col gap-4">
        {/* Target Column Selection */}
        <div className="space-y-2">
          <Label
            htmlFor="target-select"
            className="text-sm text-muted-foreground"
          >
            Target Column (What to predict)
          </Label>
          <Select value={targetColumn} onValueChange={setTargetColumn}>
            <SelectTrigger id="target-select">
              <SelectValue placeholder="Select target column" />
            </SelectTrigger>
            <SelectContent>
              {dataInfo.columns.map((column) => (
                <SelectItem key={column} value={column}>
                  {column} ({dataInfo.column_types[column]})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Train Model Button */}
        <Button
          onClick={handleTrainModel}
          disabled={!targetColumn || isTraining}
          className="w-full"
        >
          {isTraining ? "Training..." : "Train Model"}
        </Button>

        {isTrained && (
          <div className="text-sm text-green-600 bg-green-200/10 border-green-200 p-2 rounded-md flex items-center justify-start">
            <CheckCircle2Icon className="size-4 mr-1" /> Model trained
            successfully! You can now make predictions.
          </div>
        )}

        {/* Data Info */}
        <div className="text-sm space-y-1 text-muted-foreground">
          <p>
            <strong>Dataset:</strong> {dataInfo.shape[0]} rows,{" "}
            {dataInfo.shape[1]} columns
          </p>
          <p>
            <strong>Available columns:</strong> {dataInfo.columns.join(", ")}
          </p>
        </div>

        {/* Prediction Input */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!isTrained} className="w-full">
              <PlusIcon className="size-4 mr-2" />
              Add Data Manually
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Input Feature Values</DialogTitle>
              <DialogDescription>
                Enter values for each feature to make a prediction
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {getFeatureColumns().map((column) => (
                <div
                  key={column}
                  className="grid grid-cols-2 items-center gap-4"
                >
                  <Label htmlFor={column} className="text-right">
                    {column} ({dataInfo.column_types[column]})
                  </Label>
                  <div className="col-span-2">
                    <Input
                      id={column}
                      type={getInputType(dataInfo.column_types[column])}
                      placeholder={`Enter ${column}`}
                      value={inputData[column] || ""}
                      onChange={(e) =>
                        handleInputChange(column, e.target.value)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={handlePredict} className="w-full mt-4">
              Make Prediction
            </Button>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default InputTable;

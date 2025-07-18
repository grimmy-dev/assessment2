import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface PredictionResult {
  success: boolean;
  prediction: any;
  prediction_proba?: { [key: string]: number };
  input_data: { [key: string]: any };
  model_type: string;
  error?: string;
}

interface OutputDisplayerProps {
  predictions: PredictionResult[];
  targetColumn: string;
}

const OutputDisplayer: React.FC<OutputDisplayerProps> = ({
  predictions,
  targetColumn,
}) => {
  const formatPrediction = (prediction: any) => {
    if (typeof prediction === "number") {
      return prediction.toFixed(4);
    }
    return String(prediction);
  };

  const getConsoleOutput = () => {
    if (predictions.length === 0) {
      return `> Waiting for predictions...
> Train your model and input feature values to see predictions here.

Model Status: Not trained
Target Column: ${targetColumn || "Not selected"}
Predictions: 0`;
    }

    let output = `> Prediction Results\n> Target Column: ${targetColumn}\n> Total Predictions: ${predictions.length}\n\n`;

    predictions.forEach((pred, index) => {
      const timestamp = new Date().toLocaleTimeString();

      if (pred.success) {
        output += `[${timestamp}] Prediction #${index + 1}\n`;
        output += `├─ Input Features:\n`;

        Object.entries(pred.input_data).forEach(([key, value]) => {
          output += `│  ├─ ${key}: ${value}\n`;
        });

        output += `├─ Predicted ${targetColumn}: ${formatPrediction(
          pred.prediction
        )}\n`;

        if (pred.prediction_proba) {
          output += `├─ Confidence Scores:\n`;
          Object.entries(pred.prediction_proba)
            .sort(([, a], [, b]) => b - a)
            .forEach(([label, prob]) => {
              output += `│  ├─ ${label}: ${(prob * 100).toFixed(2)}%\n`;
            });
        }

        output += `└─ Model Type: ${pred.model_type}\n\n`;
      } else {
        output += `[${timestamp}] Prediction #${index + 1} - ERROR\n`;
        output += `└─ Error: ${pred.error}\n\n`;
      }
    });

    return output;
  };

  return (
    <Card className="h-[500px] flex-1">
      <CardHeader>
        <CardTitle>Prediction Output</CardTitle>
        <CardDescription>
          Model prediction results and confidence scores
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full h-full">
        <pre className="whitespace-pre-wrap text-sm bg-background rounded-lg p-4 h-[380px] overflow-auto">
          {getConsoleOutput()}
        </pre>
      </CardContent>
    </Card>
  );
};

export default OutputDisplayer;

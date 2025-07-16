import React from "react";
import InputTable from "./input-table";
import OutputDisplayer from "./output-displayer";

const Predictor = () => {
  return (
    <section
      id="prediction"
      className="min-h-screen flex flex-col items-center justify-center gap-10"
    >
      <div className="text-center space-y-4">
        <h1 className="text-3xl lg:text-6xl font-extrabold scroll-m-20">
          Step 3: Test Predictions
        </h1>
        <p className="text-sm">
          Test your model with custom inputs and see real-time results
        </p>
      </div>
      <div className="flex w-full gap-4 items-start justify-start">
        <InputTable />
        <OutputDisplayer />
      </div>
    </section>
  );
};

export default Predictor;

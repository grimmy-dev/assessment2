import React from "react";
import { Button } from "./ui/button";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

const HeroSection = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-4xl lg:text-7xl font-extrabold scroll-m-20 capitalize">
        Turn Business Data into{" "}
        <span className="bg-gradient-to-r from-rose-500 to-rose-600 bg-clip-text text-transparent">Actionable Insights with AI</span>
      </h1>
      <p className="leading-7 max-w-lg md:max-w-3xl">
        Drop in your business data, analyze trends, train machine learning
        models, and generate predictions — effortlessly, in a single platform.
      </p>
      <Button asChild className="w-full sm:w-fit group font-semibold" size="lg">
        <Link href={"#uploader"}>
          Get started
          <ArrowRightIcon className="size-4 group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
      </Button>
    </div>
  );
};

export default HeroSection;

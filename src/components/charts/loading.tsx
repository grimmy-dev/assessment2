import Image from "next/image";
import { PropsWithChildren } from "react";

const ChartLoader = ({ children }: PropsWithChildren) => {
  return (
    <div className="relative h-fit w-full rounded-lg border-4 overflow-hidden">
      <div className="bg-background/10 w-full h-full backdrop-blur-xs absolute z-10 flex items-center justify-center">
        {children}
      </div>
      <Image
        src="/loading.png"
        loading="lazy"
        alt="loading"
        width={2180}
        height={1950}
        className="w-full object-contain"
      />
    </div>
  );
};

export default ChartLoader;

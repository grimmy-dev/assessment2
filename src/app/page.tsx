import HeroSection from "@/components/hero-section";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import Predictor from "@/components/prediction/predictor";
import Uploader from "@/components/uploader";

export default function Home() {
  return (
    <MaxWidthWrapper>
      <HeroSection />
      <Uploader />
      <Predictor />
    </MaxWidthWrapper>
  );
}

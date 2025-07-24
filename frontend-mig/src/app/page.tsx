import { GridSmallBackgroundDemo } from "@/components/ui/background";
import Homepage from "@/components/homepage";
import Contact from "@/components/contact";
import Features from "@/components/features";

export default function Home() {
  return (
    <main>
      <GridSmallBackgroundDemo />
      <Homepage />
      <Features />
      <Contact />
    </main>
  );
}

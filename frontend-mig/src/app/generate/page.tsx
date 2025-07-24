import { GridSmallBackgroundDemo } from "@/components/ui/background";
import NavbarWrapper from "@/components/ui/navbar";

export default function GenerateCodePage() {
  return (
    <main>
      <NavbarWrapper />
      <GridSmallBackgroundDemo />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Generate Code</h1>
        {/* Add your generate code form and functionality here */}
      </div>
    </main>
  );
}

import Navbar from "@/components/Navbar";
import ScrollProgress from "@/components/ScrollProgress";
import Hero from "@/components/Hero";
import SemanticSearchDemo from "@/components/SemanticSearchDemo";
import PipelineSimulation from "@/components/PipelineSimulation";
import KnowledgeBaseDemo from "@/components/KnowledgeBaseDemo";
import VectorSpace3D from "@/components/VectorSpace3D";
import SecuritySection from "@/components/SecuritySection";
import TechStack from "@/components/TechStack";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home({ searchParams }: { searchParams: { no3d?: string } }) {
  const no3d = !!searchParams?.no3d;
  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <SemanticSearchDemo />
        <PipelineSimulation />
        <KnowledgeBaseDemo />
        {no3d ? <div id="vectors" /> : <VectorSpace3D />}
        <SecuritySection />
        <TechStack />
        <CTA />
      </main>
      <Footer />
    </>
  );
}

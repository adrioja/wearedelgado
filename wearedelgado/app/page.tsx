import { AboutSection } from "@/components/about-section";
import { ContactSection } from "@/components/contact-section";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { ProjectsSection } from "@/components/projects-section";
import { ServicesSection } from "@/components/services-section";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <AboutSection />
        <ServicesSection />
        <ProjectsSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}

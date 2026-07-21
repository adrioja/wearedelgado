import { AboutSection } from "@/components/about-section";
import { CatalogsSection } from "@/components/catalogs-section";
import { ContactSection } from "@/components/contact-section";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { ProjectsSection } from "@/components/projects-section";
import { ServicesSection } from "@/components/services-section";
import { getSiteSettings } from "@/lib/data/site-settings";
import { getSocialLinks } from "@/lib/data/social-links";

export default async function Home() {
  const [settings, socialLinks] = await Promise.all([
    getSiteSettings(),
    getSocialLinks(),
  ]);

  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <AboutSection />
        <ServicesSection />
        <ProjectsSection />
        <CatalogsSection />
        <ContactSection settings={settings} />
      </main>
      <Footer socialLinks={socialLinks} />
    </>
  );
}

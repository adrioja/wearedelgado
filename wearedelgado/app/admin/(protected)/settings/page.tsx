import { getSiteSettings } from "@/lib/data/site-settings";
import { getSocialLinks } from "@/lib/data/social-links";
import { SettingsForm } from "./settings-form";
import { SocialLinksEditor } from "./social-links-editor";

export default async function AdminSettingsPage() {
  const [settings, socialLinks] = await Promise.all([
    getSiteSettings(),
    getSocialLinks(),
  ]);

  return (
    <div className="flex flex-col gap-14">
      <div>
        <h1 className="mb-8 font-serif text-2xl">Contacto, horario y ubicación</h1>
        <SettingsForm settings={settings} />
      </div>

      <div>
        <h2 className="mb-6 font-serif text-xl">Redes sociales</h2>
        <SocialLinksEditor links={socialLinks} />
      </div>
    </div>
  );
}

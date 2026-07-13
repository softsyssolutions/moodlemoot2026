import { useTranslation } from "@/i18n/LanguageContext";

const LanguageSwitcher = () => {
  const { locale, setLocale } = useTranslation();

  const nextLang = locale === "es" ? "en" : "es";
  const flagSrc = locale === "es" ? "https://flagcdn.com/w20/es.png" : "https://flagcdn.com/w20/us.png";
  const nextFlagSrc = locale === "es" ? "https://flagcdn.com/w20/us.png" : "https://flagcdn.com/w20/es.png";

  return (
    <button
      onClick={() => setLocale(nextLang)}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
      aria-label="Switch language"
    >
      <img src={flagSrc} alt="" className="w-5 h-3.5 rounded-sm object-cover" />
      {locale === "es" ? "ES" : "EN"}
    </button>
  );
};

export default LanguageSwitcher;

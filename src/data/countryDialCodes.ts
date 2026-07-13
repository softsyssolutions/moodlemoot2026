export type CountryDial = {
  code: string;        // ISO 3166-1 alpha-2
  name_es: string;
  name_en: string;
  dial: string;        // without + (e.g. "51")
  flag: string;        // emoji
};

// Ordered: LATAM first (most relevant), then rest of the world A→Z by ES name.
export const COUNTRY_DIAL_CODES: CountryDial[] = [
  { code: "PE", name_es: "Perú", name_en: "Peru", dial: "51", flag: "🇵🇪" },
  { code: "CO", name_es: "Colombia", name_en: "Colombia", dial: "57", flag: "🇨🇴" },
  { code: "MX", name_es: "México", name_en: "Mexico", dial: "52", flag: "🇲🇽" },
  { code: "AR", name_es: "Argentina", name_en: "Argentina", dial: "54", flag: "🇦🇷" },
  { code: "CL", name_es: "Chile", name_en: "Chile", dial: "56", flag: "🇨🇱" },
  { code: "EC", name_es: "Ecuador", name_en: "Ecuador", dial: "593", flag: "🇪🇨" },
  { code: "BO", name_es: "Bolivia", name_en: "Bolivia", dial: "591", flag: "🇧🇴" },
  { code: "VE", name_es: "Venezuela", name_en: "Venezuela", dial: "58", flag: "🇻🇪" },
  { code: "UY", name_es: "Uruguay", name_en: "Uruguay", dial: "598", flag: "🇺🇾" },
  { code: "PY", name_es: "Paraguay", name_en: "Paraguay", dial: "595", flag: "🇵🇾" },
  { code: "BR", name_es: "Brasil", name_en: "Brazil", dial: "55", flag: "🇧🇷" },
  { code: "CR", name_es: "Costa Rica", name_en: "Costa Rica", dial: "506", flag: "🇨🇷" },
  { code: "PA", name_es: "Panamá", name_en: "Panama", dial: "507", flag: "🇵🇦" },
  { code: "DO", name_es: "Rep. Dominicana", name_en: "Dominican Rep.", dial: "1", flag: "🇩🇴" },
  { code: "GT", name_es: "Guatemala", name_en: "Guatemala", dial: "502", flag: "🇬🇹" },
  { code: "HN", name_es: "Honduras", name_en: "Honduras", dial: "504", flag: "🇭🇳" },
  { code: "SV", name_es: "El Salvador", name_en: "El Salvador", dial: "503", flag: "🇸🇻" },
  { code: "NI", name_es: "Nicaragua", name_en: "Nicaragua", dial: "505", flag: "🇳🇮" },
  { code: "CU", name_es: "Cuba", name_en: "Cuba", dial: "53", flag: "🇨🇺" },
  { code: "PR", name_es: "Puerto Rico", name_en: "Puerto Rico", dial: "1", flag: "🇵🇷" },
  { code: "ES", name_es: "España", name_en: "Spain", dial: "34", flag: "🇪🇸" },
  { code: "US", name_es: "Estados Unidos", name_en: "United States", dial: "1", flag: "🇺🇸" },
  { code: "CA", name_es: "Canadá", name_en: "Canada", dial: "1", flag: "🇨🇦" },
  { code: "PT", name_es: "Portugal", name_en: "Portugal", dial: "351", flag: "🇵🇹" },
  { code: "FR", name_es: "Francia", name_en: "France", dial: "33", flag: "🇫🇷" },
  { code: "IT", name_es: "Italia", name_en: "Italy", dial: "39", flag: "🇮🇹" },
  { code: "DE", name_es: "Alemania", name_en: "Germany", dial: "49", flag: "🇩🇪" },
  { code: "GB", name_es: "Reino Unido", name_en: "United Kingdom", dial: "44", flag: "🇬🇧" },
  { code: "NL", name_es: "Países Bajos", name_en: "Netherlands", dial: "31", flag: "🇳🇱" },
  { code: "BE", name_es: "Bélgica", name_en: "Belgium", dial: "32", flag: "🇧🇪" },
  { code: "CH", name_es: "Suiza", name_en: "Switzerland", dial: "41", flag: "🇨🇭" },
  { code: "AT", name_es: "Austria", name_en: "Austria", dial: "43", flag: "🇦🇹" },
  { code: "IE", name_es: "Irlanda", name_en: "Ireland", dial: "353", flag: "🇮🇪" },
  { code: "SE", name_es: "Suecia", name_en: "Sweden", dial: "46", flag: "🇸🇪" },
  { code: "NO", name_es: "Noruega", name_en: "Norway", dial: "47", flag: "🇳🇴" },
  { code: "DK", name_es: "Dinamarca", name_en: "Denmark", dial: "45", flag: "🇩🇰" },
  { code: "FI", name_es: "Finlandia", name_en: "Finland", dial: "358", flag: "🇫🇮" },
  { code: "PL", name_es: "Polonia", name_en: "Poland", dial: "48", flag: "🇵🇱" },
  { code: "RO", name_es: "Rumanía", name_en: "Romania", dial: "40", flag: "🇷🇴" },
  { code: "GR", name_es: "Grecia", name_en: "Greece", dial: "30", flag: "🇬🇷" },
  { code: "TR", name_es: "Turquía", name_en: "Turkey", dial: "90", flag: "🇹🇷" },
  { code: "MA", name_es: "Marruecos", name_en: "Morocco", dial: "212", flag: "🇲🇦" },
  { code: "ZA", name_es: "Sudáfrica", name_en: "South Africa", dial: "27", flag: "🇿🇦" },
  { code: "AU", name_es: "Australia", name_en: "Australia", dial: "61", flag: "🇦🇺" },
  { code: "NZ", name_es: "Nueva Zelanda", name_en: "New Zealand", dial: "64", flag: "🇳🇿" },
  { code: "IN", name_es: "India", name_en: "India", dial: "91", flag: "🇮🇳" },
  { code: "CN", name_es: "China", name_en: "China", dial: "86", flag: "🇨🇳" },
  { code: "JP", name_es: "Japón", name_en: "Japan", dial: "81", flag: "🇯🇵" },
  { code: "KR", name_es: "Corea del Sur", name_en: "South Korea", dial: "82", flag: "🇰🇷" },
];

export const DEFAULT_DIAL_COUNTRY = "PE";

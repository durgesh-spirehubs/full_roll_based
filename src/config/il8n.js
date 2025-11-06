import { I18n } from "i18n";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const i18n = new I18n({
  locales: ["en"],
  directory: path.join(__dirname, "../../translation"),
  defaultLocale: "en",
  objectNotation: true,
  header: "locale",
});

export default i18n;

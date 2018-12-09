import be from "./be";
import de from "./de";
import en from "./en";
import es from "./es";
import fr from "./en";
import it from "./it";
import ja from "./ja";
import pt from "./pt";
import ru from "./ru";
import zh from "./zh";

function setLocale(name, locale){
	var lang = webix.i18n.locales[name];
	if (lang)
		lang.querybuilder = locale;
}

setLocale(be, "be-BY");
setLocale(de, "de-DE");
setLocale(en, "en-US");
setLocale(es, "es-ES");
setLocale(fr, "fr-FR");
setLocale(it, "it-IT");
setLocale(ja, "ja-JP");
setLocale(pt, "pt-BR");
setLocale(ru, "ru-RU");
setLocale(zh, "zh-CN");

webix.i18n.querybuilder = en;
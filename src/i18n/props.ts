import schinese from "./schinese.json";
import tchinese from "./tchinese.json";
import english from "./english.json";
import japanese from "./japanese.json";
import koreana from "./koreana.json";
import german from "./german.json";
import french from "./french.json";
import spanish from "./spanish.json";
import brazilian from "./brazilian.json";
import russian from "./russian.json";
import italian from "./italian.json";
import polish from "./polish.json";
import turkish from "./turkish.json";

export interface LanguageProps {
  label: string;
  strings: any;
  credit: string[];
  locale: string;
}

export const defaultLanguage = "english";
export const defaultLocale = "en";
export const defaultMessages = english;

export const langProps: { [key: string]: LanguageProps } = {
  english: {
    label: "English",
    strings: english,
    credit: [],
    locale: "en",
  },
  schinese: {
    label: "简体中文",
    strings: schinese,
    credit: [],
    locale: "zh-Hans",
  },
  tchinese: {
    label: "繁體中文",
    strings: tchinese,
    credit: [],
    locale: "zh-Hant",
  },
  japanese: {
    label: "日本語",
    strings: japanese,
    credit: [],
    locale: "ja",
  },
  koreana: {
    label: "한국어",
    strings: koreana,
    credit: [],
    locale: "ko",
  },
  german: {
    label: "Deutsch",
    strings: german,
    credit: [],
    locale: "de",
  },
  french: {
    label: "Français",
    strings: french,
    credit: [],
    locale: "fr",
  },
  spanish: {
    label: "Español",
    strings: spanish,
    credit: [],
    locale: "es",
  },
  brazilian: {
    label: "Português (Brasil)",
    strings: brazilian,
    credit: [],
    locale: "pt-BR",
  },
  russian: {
    label: "Русский",
    strings: russian,
    credit: [],
    locale: "ru",
  },
  italian: {
    label: "Italiano",
    strings: italian,
    credit: [],
    locale: "it",
  },
  polish: {
    label: "Polski",
    strings: polish,
    credit: [],
    locale: "pl",
  },
  turkish: {
    label: "Türkçe",
    strings: turkish,
    credit: [],
    locale: "tr",
  },
};

export const L = Object.keys(defaultMessages).reduce((obj, key) => {
  obj[key as keyof typeof obj] = key;
  return obj;
}, {} as typeof defaultMessages);

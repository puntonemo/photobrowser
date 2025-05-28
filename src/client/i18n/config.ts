import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import commonEN from './es/common.json';
import webauthmEN from './es/webauthm.json';
import translationEN from './en/translations.json';
import commonES from './es/common.json';
import webauthmES from './es/webauthm.json';
import translationES from './es/translations.json';

export const defaultNS = 'common';

i18next
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        // lng: 'es', // if you're using a language detector, do not define the lng option
        fallbackLng: 'es',
        debug: true,
        ns: ['common', 'webauthm', 'translation'],
        resources: {
            en: {
                common: commonEN,
                webauthm: webauthmEN,
                translation: translationEN,
            },
            es: {
                common: commonES,
                webauthm: webauthmES,
                translation: translationES,
            },
        },
        defaultNS,
        // if you see an error like: "Argument of type 'DefaultTFuncReturn' is not assignable to parameter of type xyz"
        // set returnNull to false (and also in the i18next.d.ts options)
        // returnNull: false,
    });

/* LanguageDetector : https://github.com/i18next/i18next-browser-languageDetector */

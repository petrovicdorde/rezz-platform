import { Injectable } from '@nestjs/common';
import { I18nLoader, I18nTranslation } from 'nestjs-i18n';
import srTranslation from './i18n/sr/translation.json';
import enTranslation from './i18n/en/translation.json';

@Injectable()
export class StaticI18nLoader extends I18nLoader {
  languages(): Promise<string[]> {
    return Promise.resolve(['sr', 'en']);
  }

  load(): Promise<I18nTranslation> {
    return Promise.resolve({
      sr: srTranslation,
      en: enTranslation,
    } as unknown as I18nTranslation);
  }
}

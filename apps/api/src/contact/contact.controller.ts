import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { I18nLang } from 'nestjs-i18n';
import { ContactService } from './contact.service';
import { ContactFormDto } from './dto/contact-form.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async submit(
    @Body() dto: ContactFormDto,
    @I18nLang() lang: string,
  ): Promise<{ message: string }> {
    return this.contactService.submit(dto, lang);
  }
}

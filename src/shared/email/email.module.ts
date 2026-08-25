import { Module } from '@nestjs/common';
import axios from 'axios';
import { EmailService } from './email.service';
import { TemplateService } from './template.service';

const EmailClientProvider = {
  provide: 'API_CLIENT',
  useFactory: () => {
    return axios.create({
      baseURL: process.env['BREVO_URL'],
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env['BREVO_API_KEY'],
      },
    });
  },
};

@Module({
  exports: [EmailClientProvider, EmailService],
  providers: [EmailClientProvider, EmailService, TemplateService],
})
export class EmailModule {}

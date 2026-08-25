import { Inject, Injectable, Logger } from '@nestjs/common';
import type { AxiosInstance } from 'axios';
import { TemplateService } from './template.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @Inject('API_CLIENT') private readonly email: AxiosInstance,
    private readonly templateService: TemplateService,
  ) {}

  async otp(toEmail: string, otp: string) {
    return this.sendEmail(toEmail, { otp }, 'signup-otp', 'Welcome to Requint');
  }

  async membershipEmail(
    memberName: string,
    teamName: string,
    email: string,
    password: string,
  ) {
    const loginLink = `${process.env['FROTEND_URL']}/login`;
    return this.sendEmail(
      email,
      { memberName, teamName, email, password, loginLink },
      'membership-email',
      'Membership Alert',
    );
  }

  async removeMember(email: string, memberName: string, teamName: string) {
    return this.sendEmail(
      email,
      { memberName, teamName },
      'revoke-membership',
      'Membership Alert',
    );
  }

  private async sendEmail(
    toEmail: string,
    data: Record<string, any>,
    templateName: string,
    subject: string,
  ) {
    try {
      const htmlContent = this.templateService.render(templateName, data);

      const response = await this.email.post('/email', {
        sender: {
          name: 'Requint',
          email: process.env['BREVO_EMAIL'],
        },
        to: [{ email: toEmail }],
        subject,
        htmlContent,
      });

      this.logger.log('email sent');
      return response.data;
    } catch (error: any) {
      this.logger.error(error.response?.data || error.message);
      throw error;
    }
  }
}

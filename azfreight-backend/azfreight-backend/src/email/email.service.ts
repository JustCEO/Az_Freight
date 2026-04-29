import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientSecretCredential } from '@azure/identity';
import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private graphClient: Client | null = null;
  private senderEmail: string;

  constructor(private config: ConfigService) {
    const tenantId = this.config.get<string>('MSGRAPH_TENANT_ID');
    const clientId = this.config.get<string>('MSGRAPH_CLIENT_ID');
    const clientSecret = this.config.get<string>('MSGRAPH_CLIENT_SECRET');
    this.senderEmail = this.config.get<string>('MSGRAPH_SENDER_EMAIL') || 'bot@juz.ai';

    if (tenantId && clientId && clientSecret) {
      const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
      const authProvider = new TokenCredentialAuthenticationProvider(credential, {
        scopes: ['https://graph.microsoft.com/.default'],
      });
      this.graphClient = Client.initWithMiddleware({ authProvider });
      this.logger.log('Microsoft Graph email client initialized');
    } else {
      this.logger.warn('Microsoft Graph credentials not configured — emails will be logged only');
    }
  }

  async sendEmail(to: string, subject: string, htmlBody: string): Promise<boolean> {
    if (!this.graphClient) {
      this.logger.log(`[DRY RUN] Email to: ${to}, subject: ${subject}`);
      return false;
    }

    try {
      await this.graphClient.api(`/users/${this.senderEmail}/sendMail`).post({
        message: {
          subject,
          body: { contentType: 'HTML', content: htmlBody },
          toRecipients: [{ emailAddress: { address: to } }],
        },
        saveToSentItems: false,
      });
      this.logger.log(`Email sent to ${to}: ${subject}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      return false;
    }
  }

  async sendMagicLink(to: string, magicLink: string, tenantName: string): Promise<boolean> {
    return this.sendEmail(to, `Login to ${tenantName} — AzFreight`, `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="width: 48px; height: 48px; background: #2563EB; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center;">
            <span style="color: white; font-weight: bold; font-size: 20px;">Az</span>
          </div>
        </div>
        <h2 style="text-align: center; color: #1e293b; margin-bottom: 16px;">Login to ${tenantName}</h2>
        <p style="color: #64748b; text-align: center; line-height: 1.6;">
          Click the button below to access your shipments and requests.
          This link is valid for 24 hours.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${magicLink}" style="background: #2563EB; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
            Sign In
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 13px; text-align: center;">
          If you didn't request this link, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
        <p style="color: #cbd5e1; font-size: 11px; text-align: center;">
          Powered by AzFreight
        </p>
      </div>
    `);
  }

  async sendInvitation(to: string, inviteUrl: string, tenantName: string, role: string): Promise<boolean> {
    return this.sendEmail(to, `You're invited to ${tenantName} — AzFreight`, `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="width: 48px; height: 48px; background: #2563EB; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center;">
            <span style="color: white; font-weight: bold; font-size: 20px;">Az</span>
          </div>
        </div>
        <h2 style="text-align: center; color: #1e293b; margin-bottom: 16px;">You're invited!</h2>
        <p style="color: #64748b; text-align: center; line-height: 1.6;">
          You've been invited to join <strong>${tenantName}</strong> as <strong>${role}</strong>.
          Click below to set up your account.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${inviteUrl}" style="background: #2563EB; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
            Accept Invitation
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 13px; text-align: center;">
          This invitation expires in 7 days.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
        <p style="color: #cbd5e1; font-size: 11px; text-align: center;">
          Powered by AzFreight
        </p>
      </div>
    `);
  }
}

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientSecretCredential } from '@azure/identity';
import { Client } from '@microsoft/microsoft-graph-client';
import {
  TokenCredentialAuthenticationProvider,
} from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';

@Injectable()
export class MailService implements OnModuleInit {
  private client: Client | null = null;
  private from: string;
  private frontendUrl: string;
  private readonly logger = new Logger(MailService.name);

  constructor(private config: ConfigService) {}

  onModuleInit() {
    const tenantId = this.config.get<string>('GRAPH_TENANT_ID');
    const clientId = this.config.get<string>('GRAPH_CLIENT_ID');
    const clientSecret = this.config.get<string>('GRAPH_CLIENT_SECRET');
    this.from = this.config.get<string>('MAIL_FROM') || 'noreply@dist.az';
    this.frontendUrl = this.config.get<string>('FRONTEND_URL') || 'http://localhost:3001';

    if (!tenantId || !clientId || !clientSecret) {
      this.logger.warn('Graph API credentials not configured — emails will be skipped');
      return;
    }

    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
      scopes: ['https://graph.microsoft.com/.default'],
    });
    this.client = Client.initWithMiddleware({ authProvider });
    this.logger.log(`Mail service ready, sending from ${this.from}`);
  }

  get isConfigured(): boolean {
    return this.client !== null;
  }

  async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.client) {
      this.logger.warn(`Skipping email to ${to}: Graph API not configured`);
      return;
    }

    try {
      await this.client.api(`/users/${this.from}/sendMail`).post({
        message: {
          subject,
          body: { contentType: 'HTML', content: html },
          toRecipients: [{ emailAddress: { address: to } }],
        },
        saveToSentItems: true,
      });
      this.logger.log(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      throw error;
    }
  }

  async sendInvitation(to: string, inviteUrl: string, tenantName: string): Promise<void> {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #0f172a; font-size: 24px; margin: 0;">AzFreight</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">${tenantName}</p>
        </div>
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px;">
          <h2 style="color: #0f172a; font-size: 20px; margin: 0 0 12px;">You're invited!</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
            You have been invited to join <strong>${tenantName}</strong> on AzFreight.
            Click the button below to create your account.
          </p>
          <a href="${inviteUrl}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
            Accept Invitation
          </a>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 24px;">
            This invitation expires in 7 days. If the button doesn't work, copy this link:<br/>
            <a href="${inviteUrl}" style="color: #2563eb; word-break: break-all;">${inviteUrl}</a>
          </p>
        </div>
      </div>
    `;
    await this.send(to, `You're invited to ${tenantName} — AzFreight`, html);
  }

  async sendMagicLink(to: string, magicLink: string, tenantName: string): Promise<void> {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #0f172a; font-size: 24px; margin: 0;">AzFreight</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">${tenantName}</p>
        </div>
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px;">
          <h2 style="color: #0f172a; font-size: 20px; margin: 0 0 12px;">Your login link</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
            Click the button below to access your shipment portal at <strong>${tenantName}</strong>.
          </p>
          <a href="${magicLink}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
            Sign In
          </a>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 24px;">
            This link expires in 24 hours and can only be used once.<br/>
            If the button doesn't work, copy this link:<br/>
            <a href="${magicLink}" style="color: #2563eb; word-break: break-all;">${magicLink}</a>
          </p>
        </div>
      </div>
    `;
    await this.send(to, `Your login link — ${tenantName}`, html);
  }
}

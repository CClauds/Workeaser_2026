import ESignatureInterface, {
  DocumentRequestInterface,
  EnvelopeArgsInterface,
  EnvelopeInterface,
  ESignatureResponseInterface,
  RecipientInterface
} from 'App/Integrations/ESignature/ESignature.interface';
import Env from '@ioc:Adonis/Core/Env';
import path from 'path';
import Docusign from 'docusign-esign';
import { readFileSync } from 'fs';

export default class DocusignImplementation implements ESignatureInterface {
  async sendEnvelope(envelopeArgs: EnvelopeArgsInterface): Promise<ESignatureResponseInterface> {
    const apiClient = await this.authenticate();
    const envelopesApi = new Docusign.EnvelopesApi(apiClient);

    const envelope = await this.makeEnvelope(envelopeArgs);

    const results = await envelopesApi.createEnvelope(Env.get('DOCUSIGN_API_ACCOUNT_ID'), {
      envelopeDefinition: envelope
    });

    return { envelopeId: String(results.envelopeId) };
  }

  async makeEnvelope(args: EnvelopeArgsInterface): Promise<EnvelopeInterface> {
    // Add the documents
    const documents: DocumentRequestInterface[] = [];
    args.documents.forEach((document) => {
      const newDocument: DocumentRequestInterface = {
        documentBase64: document.base64file,
        name: document.name,
        fileExtension: document.fileExtension,
        documentId: String(document.documentId)
      };

      documents.push(newDocument);
    });

    // Create recipients
    const recipients: RecipientInterface = {
      signers: args.signers,
      carbonCopies: args.cc
    };

    const env: EnvelopeInterface = {
      emailSubject: args.emailSubject,
      documents: documents,
      recipients: recipients,
      eventNotification: this.getWebookConfigurations,
      status: 'sent'
    };

    return env;
  }

  async getEnvelopePdf(envelopeId: string): Promise<Buffer> {
    const apiClient = await this.authenticate();
    const envelopesApi = new Docusign.EnvelopesApi(apiClient);

    const document = await envelopesApi.getDocument(
      Env.get('DOCUSIGN_API_ACCOUNT_ID'),
      envelopeId,
      'combined',
      {}
    );

    const documentBin = Buffer.from(document, 'binary');
    return documentBin;
  }

  private get getOauthBasePath() {
    return Env.get('DOCUSIGN_SANDBOX')
      ? 'https://account-d.docusign.com'
      : 'https://account.docusign.com';
  }

  private get getBasePath() {
    return `${Env.get('DOCUSIGN_BASE_URI')}/restapi`;
  }

  private async authenticate(): Promise<Docusign.ApiClient> {
    // Load DocuSign RSA private key from environment-controlled location.
    // Priority:
    //   1. DOCUSIGN_PRIVATE_KEY  — full PEM content as env var (preferred for prod / k8s secrets)
    //   2. DOCUSIGN_PRIVATE_KEY_PATH — absolute path to a PEM file on disk (legacy)
    // The previous in-repo `docusign_private.key` file is intentionally NOT supported anymore —
    // committing private keys to source control is a security incident waiting to happen.
    const rsaInline = Env.get('DOCUSIGN_PRIVATE_KEY') as string | undefined;
    let rsaKey: Buffer;

    if (rsaInline && rsaInline.includes('BEGIN')) {
      rsaKey = Buffer.from(rsaInline.replace(/\\n/g, '\n'), 'utf8');
    } else {
      const keyPath = Env.get('DOCUSIGN_PRIVATE_KEY_PATH') as string | undefined;
      if (!keyPath) {
        throw new Error(
          'DocuSign key not configured. Set DOCUSIGN_PRIVATE_KEY (PEM contents) or DOCUSIGN_PRIVATE_KEY_PATH (absolute path).'
        );
      }
      rsaKey = readFileSync(path.resolve(keyPath));
    }

    const scopes = ['signature', 'impersonation'];
    const jwtLifeSec = 10 * 60;

    const clientId = Env.get('DOCUSIGN_INTEGRATION_KEY');
    const userId = Env.get('DOCUSIGN_USER_ID');

    const apiClient = new Docusign.ApiClient({
      basePath: this.getBasePath,
      oAuthBasePath: this.getOauthBasePath
    });

    try {
      const request = await apiClient.requestJWTUserToken(
        clientId,
        userId,
        scopes,
        rsaKey,
        jwtLifeSec
      );
      const accessToken = request.body.access_token;

      apiClient.addDefaultHeader('Authorization', `Bearer ${accessToken}`);
      return apiClient;
    } catch (error) {
      console.log(error);
      throw new Error('Error authenticating user to Docusign');
    }
  }

  private get getWebookConfigurations() {
    // EventNotification
    return {
      envelopeEvents: [
        { envelopeEventStatusCode: 'sent' },
        { envelopeEventStatusCode: 'delivered' },
        { envelopeEventStatusCode: 'completed', includeDocuments: 'true' },
        { envelopeEventStatusCode: 'declined' },
        { envelopeEventStatusCode: 'voided' }
      ],
      loggingEnabled: 'true',
      requireAcknowledgment: 'true',
      url: this.getWebhookUrl,
      includeTimeZone: 'true',
      includeDocuments: 'true',
      eventData: {
        version: 'restv2.1',
        format: 'json'
      }
    };
  }

  private get getWebhookUrl() {
    return `${Env.get('API_URL')}/webhooks/docusign`;
  }
}

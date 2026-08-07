/**
 * MetaCloudImplementation — wrapper para Meta WhatsApp Cloud API.
 * Sprint C (HF-SPRINT-C-02).
 *
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 *
 * Configuração (.env):
 *  - WHATSAPP_META_PHONE_NUMBER_ID  (id do número Business)
 *  - WHATSAPP_META_ACCESS_TOKEN     (token permanente do System User)
 *  - WHATSAPP_META_VERSION          (default v18.0)
 *
 * Template sending requer template aprovado pela Meta antes (categoria UTILITY).
 * Texto livre só funciona dentro de janela de 24h após cliente enviar mensagem.
 */
import Env from '@ioc:Adonis/Core/Env';
import axios from 'axios';
import AppError from 'App/Utils/AppError';

export interface SendTemplateParams {
  to: string; // E.164 sem '+', ex: '5511999999999'
  templateName: string;
  languageCode: string; // 'pt_BR' | 'en_US'
  /** Variáveis posicionais {{1}}, {{2}}, ... */
  bodyParameters?: string[];
}

export interface SendTextParams {
  to: string;
  body: string;
}

export interface MetaSendResponse {
  providerMessageId: string;
}

export default class MetaCloudImplementation {
  private getBaseUrl(): string {
    const phoneNumberId = Env.get('WHATSAPP_META_PHONE_NUMBER_ID') as string | undefined;
    const version = (Env.get('WHATSAPP_META_VERSION', 'v18.0') as string) || 'v18.0';
    if (!phoneNumberId) {
      throw new AppError(AppError.LOGIC_ERROR, 'WHATSAPP_META_PHONE_NUMBER_ID não configurado');
    }
    return `https://graph.facebook.com/${version}/${phoneNumberId}`;
  }

  private getToken(): string {
    const token = Env.get('WHATSAPP_META_ACCESS_TOKEN') as string | undefined;
    if (!token) throw new AppError(AppError.LOGIC_ERROR, 'WHATSAPP_META_ACCESS_TOKEN não configurado');
    return token;
  }

  /** Normaliza para E.164 sem '+'. Meta exige assim. */
  private normalizePhone(phone: string): string {
    const cleaned = phone.replace(/[^\d]/g, '');
    if (cleaned.length < 10) throw new AppError(AppError.VALIDATION_FAIL, `Telefone inválido: ${phone}`);
    return cleaned;
  }

  /** Envia template aprovado. Forma mais comum (transacional). */
  public async sendTemplate(params: SendTemplateParams): Promise<MetaSendResponse> {
    const url = `${this.getBaseUrl()}/messages`;
    const phone = this.normalizePhone(params.to);

    const body: any = {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'template',
      template: {
        name: params.templateName,
        language: { code: params.languageCode },
      },
    };

    if (params.bodyParameters && params.bodyParameters.length > 0) {
      body.template.components = [
        {
          type: 'body',
          parameters: params.bodyParameters.map((p) => ({ type: 'text', text: String(p).slice(0, 1024) })),
        },
      ];
    }

    try {
      const res = await axios.post(url, body, {
        headers: { Authorization: `Bearer ${this.getToken()}`, 'Content-Type': 'application/json' },
        timeout: 15_000,
      });
      const msgId: string | undefined = res.data?.messages?.[0]?.id;
      if (!msgId) throw new Error('Meta API não devolveu message id');
      return { providerMessageId: msgId };
    } catch (err: any) {
      const detail = err.response?.data?.error || err.message;
      throw new AppError(AppError.LOGIC_ERROR, `Meta API: ${JSON.stringify(detail).slice(0, 300)}`);
    }
  }

  /** Envia texto livre. Funciona SOMENTE dentro de janela de 24h após cliente enviar 1 mensagem. */
  public async sendText(params: SendTextParams): Promise<MetaSendResponse> {
    const url = `${this.getBaseUrl()}/messages`;
    const phone = this.normalizePhone(params.to);

    const body = {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'text',
      text: { body: params.body.slice(0, 4096) },
    };

    try {
      const res = await axios.post(url, body, {
        headers: { Authorization: `Bearer ${this.getToken()}`, 'Content-Type': 'application/json' },
        timeout: 15_000,
      });
      const msgId: string | undefined = res.data?.messages?.[0]?.id;
      if (!msgId) throw new Error('Meta API não devolveu message id');
      return { providerMessageId: msgId };
    } catch (err: any) {
      const detail = err.response?.data?.error || err.message;
      throw new AppError(AppError.LOGIC_ERROR, `Meta API: ${JSON.stringify(detail).slice(0, 300)}`);
    }
  }
}

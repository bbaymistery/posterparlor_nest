import { BadRequestException, Injectable } from '@nestjs/common';
import { AppConfigService } from '@new-poster-parlor-api/config';
import {
  CreatePaymentOrderDto,
  PaymentVerificationResult,
  StripePaymentIntent,
} from '@new-poster-parlor-api/shared';
import Stripe from 'stripe';

/**
 * 💳 PAYMENT SERVICE (Stripe Sandbox Ödəniş Servisi)
 * 
 * Müəllim izahı:
 * Bu servis Stripe Sandbox (Test Rejimi) vasitəsilə təhlükəsiz online ödənişləri idarə edir.
 * Müştəri sifariş edərkən Stripe PaymentIntent yaradılır, frontend clientSecret ilə kart məlumatlarını
 * daxil edir və backend-də ödənişin statusu saniyələr daxilində doğrulanır.
 */
@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(private readonly configService: AppConfigService) {
    const { stripeSecretKey } = this.configService.paymentConfig;

    // Stripe SDK-sını gizli test açarı (sk_test_...) ilə inicializasiya edirik
    this.stripe = new Stripe(stripeSecretKey);
  }

  /**
   * 🔑 1. `getPublishableKey()`: Frontend üçün Stripe açıq açarını (pk_test_...) qaytarır
   */
  getPublishableKey(): string {
    return this.configService.paymentConfig.stripePublishableKey;
  }

  /**
   * 💳 2. `createPaymentIntent(dto)`: Stripe serverində yeni ödəniş niyyəti (PaymentIntent) yaradır
   * @param dto Məbləğ (Sent / Cent ilə) və valyuta (USD, EUR və s.)
   * @returns PaymentIntent ID və clientSecret (frontend ödəniş pəncərəsi üçün)
   */
  async createPaymentIntent(dto: CreatePaymentOrderDto): Promise<StripePaymentIntent> {
    try {
      // Stripe məbləği tam sent (cents) kimi qəbul edir ($10 = 1000 cents)
      const amountInCents = Math.round(dto.amount);

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amountInCents,
        currency: (dto.currency || 'usd').toLowerCase(),
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: dto.metadata || {},
      });

      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret || '',
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      };
    } catch (error: unknown) {
      const err = error;
      throw new BadRequestException(
        `Failed to create Stripe PaymentIntent: ${err || 'Payment service error'}`
      );
    }
  }

  /**
   * 🛡️ 3. `verifyPaymentIntent(paymentIntentId)`: Stripe-dan ödənişin uğurla tamamlandığını yoxlayır
   * @param paymentIntentId Stripe PaymentIntent ID-si (məsələn: "pi_3MtwBwLkdIwHu7ix08aD5xYc")
   */
  async verifyPaymentIntent(paymentIntentId: string, sandbox?: boolean): Promise<PaymentVerificationResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      // Standart canlı/reallaşmış ödəniş təsdiqi ('succeeded' və ya 'requires_capture')
      const isStrictSuccess =
        paymentIntent.status === 'succeeded' ||
        paymentIntent.status === 'requires_capture';

      // 💡 Əgər sorğuda (Postman və ya Client) explicit olaraq `sandbox: true` göndərilibsə, test sınaqlarına icazə verilir
      const isSandboxAllowed =
        sandbox === true &&
        (paymentIntent.status === 'requires_payment_method' ||
          paymentIntent.status === 'requires_confirmation');

      const isValid = isStrictSuccess || isSandboxAllowed;

      return {
        isValid,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      };
    } catch (error: unknown) {
      const err = error as Error;
      throw new BadRequestException(
        `Failed to verify Stripe PaymentIntent: ${err?.message || 'Verification failed'}`
      );
    }
  }

  /**
   * 🔍 4. `getPaymentDetails(paymentIntentId)`: Stripe-dan ödənişin ətraflı məlumatlarını gətirir
   */
  async getPaymentDetails(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error: unknown) {
      const err = error as Error;
      throw new BadRequestException(`Failed to fetch payment details from Stripe ${err?.message || 'getPaymentDetails failed'}`);
    }
  }
}

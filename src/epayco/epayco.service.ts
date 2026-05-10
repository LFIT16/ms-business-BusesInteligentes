import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EpaycoService {
  constructor(private readonly configService: ConfigService) {}

  crearDatosCheckout(data: {
    referenciaInterna: string;
    monto: number;
    descripcion: string;
    email: string;
    recargaId: number;
  }) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const backendUrl = this.configService.get<string>('BACKEND_URL');

    return {
      key: this.configService.get<string>('EPAYCO_PUBLIC_KEY'),
      test: this.configService.get<string>('EPAYCO_TEST') === 'true',

      name: 'Recarga tarjeta transporte',
      description: data.descripcion,
      invoice: data.referenciaInterna,
      currency: 'COP',
      amount: data.monto,
      tax_base: '0',
      tax: '0',
      country: 'CO',
      lang: 'ES',

      external: 'true',

      response: `${backendUrl}/api/recargas/epayco/respuesta`,
      confirmation: `${backendUrl}/api/recargas/epayco/confirmacion`,

      extra1: String(data.recargaId),
      extra2: data.referenciaInterna,

      name_billing: 'Ciudadano',
      email_billing: data.email,
      address_billing: 'Manizales',
      type_doc_billing: 'CC',
      mobilephone_billing: '3000000000',
      number_doc_billing: '1000000000',
    };
  }
}
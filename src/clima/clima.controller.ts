import { Controller, Post, Get, Body, Headers } from '@nestjs/common';
import { ClimaService } from './clima.service';
import { ConfigurarClimaDto } from './dto/configurar-clima.dto';

@Controller('/api/clima')
export class ClimaController {
  constructor(private readonly climaService: ClimaService) {}

  @Post('verificar')
  async verificarYEnviarAlertas() {
    // No necesita token, es un proceso interno
    return this.climaService.verificarYEnviarAlertas();
  }

  @Post('configurar')
  async configurar(
    @Body() dto: ConfigurarClimaDto,
    @Headers('authorization') authorization: string,
  ) {
    // 👈 Decodificar token aquí como en citas y pqrs
    let usuario = {
      id: 'test-123',
      name: 'Usuario Test',
      email: 'test@example.com'
    };
    
    if (authorization) {
      try {
        const token = authorization.replace('Bearer ', '');
        const payload = Buffer.from(token.split('.')[1], 'base64').toString();
        const decoded = JSON.parse(payload);
        
        if (decoded && decoded.id) {
          usuario = {
            id: decoded.id,
            name: decoded.name || decoded.email,
            email: decoded.email
          };
        }
      } catch (error: any) {
        console.error('Error decodificando token:', error?.message ?? error);
      }
    }
    
    return this.climaService.configurar(usuario.id, {
  ...dto,
  email: usuario.email,
});
  }

  @Get('configuracion')
  async obtenerConfiguracion(@Headers('authorization') authorization: string) {
    let usuarioId = 'test-123';
    
    if (authorization) {
      try {
        const token = authorization.replace('Bearer ', '');
        const payload = Buffer.from(token.split('.')[1], 'base64').toString();
        const decoded = JSON.parse(payload);
        if (decoded && decoded.id) {
          usuarioId = decoded.id;
        }
      } catch (error) {}
    }
    
    return this.climaService.obtenerConfiguracion(usuarioId);
  }
}
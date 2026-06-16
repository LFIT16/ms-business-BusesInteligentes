import { Controller, Post, Body, Headers, Get, Param } from '@nestjs/common';
import { CitasService } from './citas.service';

@Controller('/api/citas')
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  @Post('disponibilidad')
  async getDisponibilidad(@Body() body: any) {
    return this.citasService.getDisponibilidad(body);
  }

  @Post('agendar')
  async agendar(@Body() body: any, @Headers('authorization') authorization: string) {
    // Decodificar token para obtener el usuario
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
    
    return this.citasService.agendarCita({
      ...body,
      usuarioId: usuario.id,
      nombreUsuario: usuario.name,
      emailUsuario: usuario.email
    });
  }

  @Get('mis-citas')
  async getMisCitas(@Headers('authorization') authorization: string) {
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
    
    return this.citasService.getMisCitas(usuarioId);
  }
  

   @Get('cancelar/:id')
  async cancelarCita(
    @Param('id') id: number
  ) {

    return this.citasService.cancelarCita(
      id
    );

  }
}
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { MonitoreoService } from './monitoreo.service';

@Controller('/api/monitoreo')
export class MonitoreoController {
  constructor(private readonly monitoreoService: MonitoreoService) {}

  @Get('activos')
  findActivos() {
    return this.monitoreoService.findUbicacionesActivasConInfo();
  }

  @Get('ruta/:rutaId/activos')
findActivosPorRuta(
  @Param('rutaId', ParseIntPipe) rutaId: number,
) {
  return this.monitoreoService.findActivosPorRuta(rutaId);
}

  @Get('bus/:busId/eta/:paraderoId')
  calcularEta(
    @Param('busId', ParseIntPipe) busId: number,
    @Param('paraderoId', ParseIntPipe) paraderoId: number,
  ) {
    return this.monitoreoService.calcularEta(busId, paraderoId);
  }
}
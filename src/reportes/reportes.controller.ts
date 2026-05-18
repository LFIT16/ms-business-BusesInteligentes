import { Controller, Get, Query } from '@nestjs/common';
import { ReportesService } from './reportes.service';

@Controller('/api/reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('rangos-etarios')
  getDistribucionRangosEtarios(
    @Query('rutaId') rutaId?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return this.reportesService.getDistribucionRangosEtarios({
      rutaId: rutaId ? Number(rutaId) : undefined,
      fechaInicio,
      fechaFin,
    });
  }
}
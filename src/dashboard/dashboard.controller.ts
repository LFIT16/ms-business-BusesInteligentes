import { Controller, Get, Param, ParseIntPipe, Sse } from '@nestjs/common';
import { Observable, interval, map, switchMap } from 'rxjs';
import { DashboardService } from './dashboard.service';

@Controller('/api/dashboard-buses')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboardData() {
    return this.dashboardService.getDashboardData();
  }

  @Sse('stream')
  streamDashboardData(): Observable<MessageEvent> {
    return interval(30000).pipe(
      switchMap(async () => {
        const data = await this.dashboardService.getDashboardData();
        return { data: JSON.stringify(data) } as MessageEvent;
      }),
    );
  }

  @Get('bus/:id')
  async getDetalleBus(@Param('id', ParseIntPipe) id: number) {
    return this.dashboardService.getDetalleBus(id);
  }
}
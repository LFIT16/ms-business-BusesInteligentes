import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RutasModule } from './rutas/rutas.module';
import { NodosModule } from './nodos/nodos.module';
import { APP_GUARD } from '@nestjs/core';
import { SecurityGuard } from './guards/security/security.guard';
import { ParaderoModule } from './paradero/paradero.module';
import { BusesModule } from './buses/buses.module';
import { TurnosModule } from './turnos/turnos.module';
import { ConductoresModule } from './conductores/conductores.module';
import { ScheduleModule } from '@nestjs/schedule';

import { RecargasModule } from './recargas/recargas.module';
import { CiudadanosModule } from './ciudadanos/ciudadanos.module';
import { MetodosPagoModule } from './metodos-pago/metodos-pago.module';
import { MetodosPagoCiudadanoModule } from './metodos-pago-ciudadano/metodos-pago-ciudadano.module';
import { DireccionesModule } from './direcciones/direcciones.module';
import { IncidentesBusModule } from './incidentes-bus/incidentes-bus.module';
import { FotosModule } from './fotos/fotos.module';
import { ProgramacionesRutaModule } from './programaciones-ruta/programaciones-ruta.module';
import { BoletosModule } from './boletos/boletos.module';
import { HistorialModule } from './historial/historial.module';
import { ReportesModule } from './reportes/reportes.module';

import { IncidentesModule } from './incidentes/incidentes.module';
import { GpsModule } from './gps/gps.module';
import { EmpresasModule } from './empresas/empresas.module';
import { GruposModule } from './grupos/grupos.module';
import { MensajesModule } from './mensajes-grupo/mensajes.module';
import { MonitoreoModule } from './monitoreo/monitoreo.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { CitasModule } from './citas/citas.module';
import { PqrsModule } from './pqrs/pqrs.module';
import { MensajePrivadoModule } from './mensaje-privado/mensaje.module';
import { ClimaModule } from './clima/clima.module';
@Module({
  providers: [{ provide: APP_GUARD, useClass: SecurityGuard }],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASS'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // Usaremos migraciones
      }),
    }),
    ProgramacionesRutaModule,
    ScheduleModule.forRoot(), // ← añadir aquí
    RutasModule,
    NodosModule,
    ParaderoModule,
    BusesModule,
    TurnosModule,
    ConductoresModule,
   
    CiudadanosModule,
    MetodosPagoModule,
    MetodosPagoCiudadanoModule,
    RecargasModule,
    DireccionesModule,
    IncidentesBusModule,
    FotosModule,
    BoletosModule,
    HistorialModule,
    ReportesModule,
    IncidentesModule,
    GpsModule,
    EmpresasModule,
    GruposModule,
    MensajesModule,
    MensajePrivadoModule,
    MonitoreoModule,
    DashboardModule,
    CitasModule,
    PqrsModule,
    ClimaModule,
  ],
})
export class AppModule {}
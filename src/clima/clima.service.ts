import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';

import { ConfiguracionClima } from './entities/clima.entity';
import { ConfigurarClimaDto } from './dto/configurar-clima.dto';

@Injectable()
export class ClimaService {
  private openWeatherApiKey = process.env.OPENWEATHER_API_KEY;
  private n8nWebhookClima = process.env.N8N_WEBHOOK_CLIMA;

  constructor(
    @InjectRepository(ConfiguracionClima)
    private configRepository: Repository<ConfiguracionClima>,
  ) {}

  async configurar(usuarioId: string, dto: ConfigurarClimaDto) {
    let config = await this.configRepository.findOne({ where: { usuarioId } });

    if (!config) {
      config = this.configRepository.create({ usuarioId });
    }

    if (dto.activado !== undefined) config.activado = dto.activado;
    if (dto.horarioViaje) config.horarioViaje = dto.horarioViaje;
    if (dto.ciudad) config.ciudad = dto.ciudad;
    if (dto.canalPreferido) config.canalPreferido = dto.canalPreferido;
    if (dto.email) config.email = dto.email;
    if (dto.telefono) config.telefono = dto.telefono;

    if (dto.activado === true) {
      config.alertaEnviadaHoy = false;
    }

    await this.configRepository.save(config);

    return {
      success: true,
      mensaje: 'Configuración de clima actualizada',
      configuracion: config,
    };
  }

  async obtenerConfiguracion(usuarioId: string) {
    return this.configRepository.findOne({ where: { usuarioId } });
  }

  async obtenerClima(ciudad: string) {
    try {
      // Datos de prueba CON lluvia
      if (ciudad === 'LluviaTest') {
        console.log('🌧️ Usando datos de prueba con lluvia');
        return this.getDatosLluviaPrueba();
      }

      // Datos de prueba SIN lluvia
      if (ciudad === 'SolTest') {
        console.log('☀️ Usando datos de prueba sin lluvia');
        return this.getDatosSolPrueba();
      }

      console.log(`🌤️ Consultando clima para: ${ciudad}`);

      const ciudadNormalizada = this.normalizarCiudad(ciudad);
      const ciudadEncoded = encodeURIComponent(ciudadNormalizada);
      const url = `http://api.openweathermap.org/data/2.5/weather?q=${ciudadEncoded}&appid=${this.openWeatherApiKey}&units=metric&lang=es`;

      const response = await axios.get(url);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ Error obteniendo clima:', error);

      const mensajeError = error instanceof Error ? error.message : JSON.stringify(error);
      throw new HttpException(
        `Error obteniendo datos del clima: ${mensajeError}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private getDatosLluviaPrueba() {
    return {
      name: 'Ciudad de Prueba',
      main: { temp: 18, humidity: 85 },
      wind: { speed: 5.5 },
      weather: [{ description: 'lluvia intensa' }],
      clouds: { all: 90 },
      rain: { '1h': 8.5 },
    };
  }

  private getDatosSolPrueba() {
    return {
      name: 'Ciudad Soleada',
      main: { temp: 22, humidity: 45 },
      wind: { speed: 2.5 },
      weather: [{ description: 'cielo despejado' }],
      clouds: { all: 10 },
    };
  }

  private normalizarCiudad(ciudad: string): string {
    const limpia = ciudad.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').trim();

    if (!limpia || limpia.length < 2) {
      console.warn(`⚠️ Ciudad no reconocida: "${ciudad}", usando Bogota`);
      return 'Bogota,CO';
    }

    const reemplazos: Record<string, string> = {
      'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ñ': 'n',
      'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U', 'Ñ': 'N',
    };

    let normalizada = '';
    for (const char of limpia) {
      normalizada += reemplazos[char] || char;
    }

    const capitalizada = normalizada
      .split(' ')
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
      .join(' ');

    if (capitalizada === 'Bogot' || capitalizada === 'Bogota') {
      return 'Bogota,CO';
    }

    return `${capitalizada},CO`;
  }

  // ==========================================
  // Procesar clima
  // ==========================================
  private procesarClima(data: any) {
    const temp = data.main.temp;
    const humedad = data.main.humidity;
    const viento = data.wind.speed;
    const condicion = data.weather[0].description;
    const probabilidadLluvia = this.calcularProbabilidadLluvia(data);

    let recomendacion = '';
    let mensaje = '';
    let requiereAlerta = false;

    if (probabilidadLluvia > 70) {
      recomendacion = '🌧️ Se recomienda salir 15 minutos antes por posibles retrasos en el tráfico. ¡No olvides tu paraguas!';
      mensaje = `🌧️ Hoy lloverá (${probabilidadLluvia}% probabilidad). Temperatura: ${temp}°C. ${recomendacion}`;
      requiereAlerta = true;
    } else if (probabilidadLluvia > 50) {
      recomendacion = '🌦️ Posibilidad de lluvia. Se recomienda salir 10 minutos antes y llevar paraguas.';
      mensaje = `🌦️ Probabilidad de lluvia del ${probabilidadLluvia}%. Temperatura: ${temp}°C. ${recomendacion}`;
      requiereAlerta = true;
    } else {
      recomendacion = '¡Buen viaje!';
      mensaje = `☀️ Clima favorable hoy. Temperatura: ${temp}°C. ¡Buen viaje!`;
      requiereAlerta = false;
    }

    return {
      ciudad: data.name,
      temperatura: temp,
      condicion,
      probabilidadLluvia,
      humedad,
      viento,
      recomendacion,
      mensaje,
      requiereAlerta,
    };
  }

  private calcularProbabilidadLluvia(data: any): number {
    if (data.rain) {
      const rainAmount = data.rain['1h'] || data.rain['3h'] || 0;
      if (rainAmount > 5) return 90;
      if (rainAmount > 2) return 70;
      return 50;
    }

    if (data.clouds && data.clouds.all > 70) {
      return 40;
    }
    return 10;
  }

  async verificarYEnviarAlertas() {
    const configuraciones = await this.configRepository.find({
      where: { activado: true, alertaEnviadaHoy: false },
    });

    console.log(`📋 Procesando ${configuraciones.length} usuarios`);
    const resultados: Array<{
      usuarioId: string;
      enviado: boolean;
      mensaje?: string;
      error?: string;
    }> = [];

    for (const config of configuraciones) {
      try {
        if (!config.usuarioId) continue;

        const clima = await this.obtenerClima(config.ciudad || 'Bogotá');
        const pronostico = this.procesarClima(clima);

        await this.enviarAlerta(config, pronostico);

        config.alertaEnviadaHoy = true;
        config.ultimaAlertaEnviada = new Date();
        await this.configRepository.save(config);

        resultados.push({
          usuarioId: config.usuarioId,
          enviado: true,
          mensaje: pronostico.mensaje,
        });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`Error procesando usuario ${config.usuarioId}:`, errorMsg);

        resultados.push({
          usuarioId: config.usuarioId || '',
          enviado: false,
          error: errorMsg,
        });
      }
    }

    return { success: true, procesados: configuraciones.length, resultados };
  }

  private async enviarAlerta(config: ConfiguracionClima, pronostico: any) {
    try {
      if (!this.n8nWebhookClima) return;

      const payload = {
        usuarioId: config.usuarioId,
        canalPreferido: config.canalPreferido || 'email',
        email: config.email,
        telefono: config.telefono,
        clima: pronostico,
        horarioViaje: config.horarioViaje || '07:00',
      };

      await axios.post(this.n8nWebhookClima, payload);
      console.log('✅ Alerta enviada correctamente');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`Error enviando alerta al usuario ${config.usuarioId}:`, errorMsg);
    }
  }
}
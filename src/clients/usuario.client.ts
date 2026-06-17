import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class UsuarioClient {
  private baseUrl = process.env.MS_SECURITY;
  private internalApiKey = process.env.INTERNAL_API_KEY;

  async getUsuarioById(id: string, token: string) {
    try {
      const headers: any = {};
      
      // Si es el token especial 'internal', usar API key interna
      if (token === 'internal' && this.internalApiKey) {
        headers['x-internal-api-key'] = this.internalApiKey;
      } else if (token && token !== 'internal') {
        headers.Authorization = `Bearer ${token}`;
      }

      const { data } = await axios.get(
        `${this.baseUrl}/api/users/${id}`,
        { headers }
      );
      return data;
    } catch (error: unknown) {
      console.error(
        `Error obteniendo usuario ${id}:`,
        error instanceof Error ? error.message : String(error)
      );
      return null;
    }
  }

  async getSupervisores(token?: string): Promise<any[]> {
    try {
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.get(
        `${this.baseUrl}/api/user-role/supervisores`,
        { headers }
      );

      return response.data || [];
    } catch (error) {
      console.error('Error obteniendo supervisores:', error instanceof Error ? error.message : String(error));
      return [];
    }
  }

  async getSupervisorAleatorio(token?: string): Promise<any> {
    const supervisores = await this.getSupervisores(token);
    
    if (!supervisores || supervisores.length === 0) {
      console.log('⚠️ No hay supervisores disponibles');
      return null;
    }

    // 👈 Seleccionar un supervisor aleatorio
    const randomIndex = Math.floor(Math.random() * supervisores.length);
    const supervisor = supervisores[randomIndex];
    
    console.log(`🎯 Supervisor asignado: ${supervisor.name || supervisor.email} (${supervisor.email})`);
    return supervisor;
  }
}
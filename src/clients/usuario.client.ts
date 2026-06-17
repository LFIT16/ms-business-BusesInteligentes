import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class UsuarioClient {
  private baseUrl = process.env.MS_SECURITY;

  async getUsuarioById(id: string, token: string) {
    const { data } = await axios.get(
      `${this.baseUrl}/api/users/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return data;
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
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class UsuarioClient {
  private baseUrl = process.env.MS_SECURITY;

  async getUsuarioById(id: string) {
    const { data } = await axios.get(
      `${this.baseUrl}/usuarios/${id}`,
    );

    return data;
  }
}
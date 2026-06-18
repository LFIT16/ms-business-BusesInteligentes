import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SecurityGuard implements CanActivate {
  private readonly logger = new Logger('SecurityGuard');

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { headers, method } = request;
    const cleanUrl = request.path || request.url.split('?')[0];

    let normalizedUrl = cleanUrl;

    normalizedUrl = normalizedUrl.replace(/PQRS-\d{4}-\d{6}/g, '?');
    normalizedUrl = normalizedUrl.replace(/[0-9a-fA-F]{24}/g, '?');
    normalizedUrl = normalizedUrl.replace(/\d+/g, '?');

    const publicRoutes = [
      '/api/recargas/epayco/confirmacion',
      '/api/recargas/epayco/respuesta',
      '/api/citas/cancelar',
    ];

    const isPublicRoute = 
      publicRoutes.some(route => cleanUrl.startsWith(route)) || 
      (method === 'GET' && cleanUrl.startsWith('/api/pqrs/PQRS-'))

    if (isPublicRoute) {
      return true;
    }

    const internalKey = headers['x-internal-api-key'];
    if (internalKey) {
      if (internalKey === process.env.INTERNAL_API_KEY) {
        return true;
      }
      throw new UnauthorizedException('API key interna inválida');
    }

    if (!headers.authorization) {
      throw new UnauthorizedException('Token de autorización faltante');

    }

    const token = headers.authorization.replace('Bearer ', '');

    const permissionData = {
      url: normalizedUrl,
      method,
    };

    try {
      const securityUrl = `${process.env.MS_SECURITY}/api/public/security/permissions-validation`;

      const response = await axios.post(securityUrl, permissionData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });


      if (response.data === true) {
        return true;
      }

      throw new ForbiddenException('No autorizado para acceder a este recurso');
    } catch (error: any) {

      this.logger.error(`Error al validar permisos: ${error.message}`);

      if (error instanceof ForbiddenException) throw error;
      if (error instanceof UnauthorizedException) throw error;
      if (error.response?.status === 401) throw new UnauthorizedException('Token inválido o expirado');
      if (error.response?.status === 403) throw new ForbiddenException('No autorizado para acceder a este recurso');

      throw new UnauthorizedException('Error al validar permisos');
    }
  }
}
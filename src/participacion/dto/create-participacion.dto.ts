import { IsInt, IsNotEmpty, IsOptional, Min } from "class-validator";
import { Dueño } from "../../dueño/entities/dueño.entity";
import { Empresa } from "../../empresas/entities/empresa.entity";



export class CreateParticipacionDto {

      @IsInt()
      @Min(1)
      @IsOptional()
      porcentajeParticipacion?: number;
    
      @IsNotEmpty()
      empresa?: Empresa [] ;
    
      @IsNotEmpty()
      dueño?: Dueño [];
    
}

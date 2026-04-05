import { Controller, Get, Query } from '@nestjs/common';
import {
  PrixImmoService,
  DepartementPrixImmo,
  RegionPrixImmo,
} from '../application/prix-immo.service';

@Controller('prix-immo')
export class PrixImmoController {
  constructor(private readonly prixImmoService: PrixImmoService) {}

  @Get('departements')
  async getDepartements(
    @Query('annee') annee?: string,
    @Query('typeBien') typeBien?: string,
  ): Promise<DepartementPrixImmo[]> {
    const anneeNum = annee ? parseInt(annee, 10) : undefined;
    const typeBienFilter = typeBien || undefined;

    return this.prixImmoService.getDepartements(anneeNum, typeBienFilter);
  }

  @Get('regions')
  async getRegions(
    @Query('annee') annee?: string,
    @Query('typeBien') typeBien?: string,
  ): Promise<RegionPrixImmo[]> {
    const anneeNum = annee ? parseInt(annee, 10) : undefined;
    const typeBienFilter = typeBien || undefined;

    return this.prixImmoService.getRegions(anneeNum, typeBienFilter);
  }
}
import { PrismaClient, Luminosidade, Planta } from '@prisma/client';

const prisma = new PrismaClient();

// Tipos para auxiliar no cadastro e atualização
export type CreatePlantaInput = {
  nome: string;
  especie: string;
  preco: number;
  estoque: number;
  luminosidade: Luminosidade;
  petFriendly: boolean;
  regaACadaDias: number;
};

export type UpdatePlantaInput = Partial<CreatePlantaInput>;

export type PlantaFilters = {
  luminosidade?: Luminosidade;
  petFriendly?: boolean;
};

export class PlantaRepository {
  async create(data: CreatePlantaInput): Promise<Planta> {
    return await prisma.planta.create({
      data,
    });
  }

  async findAll(filters: PlantaFilters): Promise<Planta[]> {
    const where: any = {};

    if (filters.luminosidade !== undefined) {
      where.luminosidade = filters.luminosidade;
    }

    if (filters.petFriendly !== undefined) {
      where.petFriendly = filters.petFriendly;
    }

    return await prisma.planta.findMany({
      where,
    });
  }

  async findById(id: number): Promise<Planta | null> {
    return await prisma.planta.findUnique({
      where: { id },
    });
  }

  async update(id: number, data: UpdatePlantaInput): Promise<Planta> {
    return await prisma.planta.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<Planta> {
    return await prisma.planta.delete({
      where: { id },
    });
  }

  async sumStockAndValue() {
    const plantas = await prisma.planta.findMany();
    
    const valorTotalEmCentavos = plantas.reduce(
      (acc, p) => acc + p.preco * p.estoque,
      0
    );
    const totalDeVasos = plantas.reduce((acc, p) => acc + p.estoque, 0);

    return {
      valorTotalEmCentavos,
      totalDeVasos,
    };
  }
}
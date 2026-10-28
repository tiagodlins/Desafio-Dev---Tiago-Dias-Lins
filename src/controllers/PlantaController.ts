import { Request, Response } from 'express';
import { PlantaRepository } from '../repositories/PlantaRepository';
import { Luminosidade } from '@prisma/client';

const plantaRepository = new PlantaRepository();

const VALID_LUMINOSIDADES: Luminosidade[] = ['SOMBRA', 'MEIA_SOMBRA', 'SOL_PLENO'];

export class PlantaController {
  // POST /plantas
  async create(req: Request, res: Response): Promise<Response> {
    const { nome, especie, preco, estoque, luminosidade, petFriendly, regaACadaDias } = req.body;

    // 1. Validar se todos os campos foram enviados
    if (
      nome === undefined ||
      especie === undefined ||
      preco === undefined ||
      estoque === undefined ||
      luminosidade === undefined ||
      petFriendly === undefined ||
      regaACadaDias === undefined
    ) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    // 2. Validar regras de negócio
    if (typeof preco !== 'number' || preco <= 0) {
      return res.status(400).json({ message: 'O preço deve ser um número maior que zero.' });
    }

    if (typeof regaACadaDias !== 'number' || regaACadaDias < 1) {
      return res.status(400).json({ message: 'O intervalo de rega deve ser de pelo menos 1 dia.' });
    }

    if (typeof estoque !== 'number' || estoque < 0) {
      return res.status(400).json({ message: 'O estoque não pode ser negativo.' });
    }

    if (!VALID_LUMINOSIDADES.includes(luminosidade)) {
      return res.status(400).json({ message: 'Luminosidade inválida. Use: SOMBRA, MEIA_SOMBRA ou SOL_PLENO.' });
    }

    if (typeof petFriendly !== 'boolean') {
      return res.status(400).json({ message: 'O campo petFriendly deve ser um booleano.' });
    }

    const planta = await plantaRepository.create({
      nome,
      especie,
      preco,
      estoque,
      luminosidade,
      petFriendly,
      regaACadaDias,
    });

    return res.status(201).json(planta);
  }

  // GET /plantas
  async findAll(req: Request, res: Response): Promise<Response> {
    const { luminosidade, petFriendly } = req.query;

    const filters: any = {};

    if (luminosidade !== undefined) {
      if (!VALID_LUMINOSIDADES.includes(luminosidade as Luminosidade)) {
        return res.status(400).json({ message: 'Filtro de luminosidade inválido.' });
      }
      filters.luminosidade = luminosidade as Luminosidade;
    }

    if (petFriendly !== undefined) {
      if (petFriendly !== 'true' && petFriendly !== 'false') {
        return res.status(400).json({ message: 'Filtro petFriendly deve ser true ou false.' });
      }
      filters.petFriendly = petFriendly === 'true';
    }

    const plantas = await plantaRepository.findAll(filters);
    return res.status(200).json(plantas);
  }

  // GET /plantas/:id
  async findById(req: Request, res: Response): Promise<Response> {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido.' });
    }

    const planta = await plantaRepository.findById(id);

    if (!planta) {
      return res.status(404).json({ message: 'Planta não encontrada.' });
    }

    return res.status(200).json(planta);
  }

  // PATCH /plantas/:id
  async update(req: Request, res: Response): Promise<Response> {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido.' });
    }

    const plantaExiste = await plantaRepository.findById(id);
    if (!plantaExiste) {
      return res.status(404).json({ message: 'Planta não encontrada.' });
    }

    const { nome, especie, preco, estoque, luminosidade, petFriendly, regaACadaDias } = req.body;

    if (preco !== undefined && (typeof preco !== 'number' || preco <= 0)) {
      return res.status(400).json({ message: 'O preço deve ser maior que zero.' });
    }

    if (regaACadaDias !== undefined && (typeof regaACadaDias !== 'number' || regaACadaDias < 1)) {
      return res.status(400).json({ message: 'O intervalo de rega deve ser de pelo menos 1 dia.' });
    }

    if (estoque !== undefined && (typeof estoque !== 'number' || estoque < 0)) {
      return res.status(400).json({ message: 'O estoque não pode ser negativo.' });
    }

    if (luminosidade !== undefined && !VALID_LUMINOSIDADES.includes(luminosidade)) {
      return res.status(400).json({ message: 'Luminosidade inválida.' });
    }

    const plantaAtualizada = await plantaRepository.update(id, {
      nome,
      especie,
      preco,
      estoque,
      luminosidade,
      petFriendly,
      regaACadaDias,
    });

    return res.status(200).json(plantaAtualizada);
  }

  // DELETE /plantas/:id
  async delete(req: Request, res: Response): Promise<Response> {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido.' });
    }

    const plantaExiste = await plantaRepository.findById(id);
    if (!plantaExiste) {
      return res.status(404).json({ message: 'Planta não encontrada.' });
    }

    await plantaRepository.delete(id);
    return res.status(204).send();
  }

  // POST /plantas/:id/venda
  async venda(req: Request, res: Response): Promise<Response> {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido.' });
    }

    const { quantidade } = req.body;

    if (typeof quantidade !== 'number' || quantidade <= 0 || !Number.isInteger(quantidade)) {
      return res.status(400).json({ message: 'A quantidade vendida deve ser um número inteiro maior que zero.' });
    }

    const planta = await plantaRepository.findById(id);
    if (!planta) {
      return res.status(404).json({ message: 'Planta não encontrada.' });
    }

    if (planta.estoque < quantidade) {
      return res.status(400).json({ message: 'Estoque insuficiente para realizar a venda.' });
    }

    const plantaAtualizada = await plantaRepository.update(id, {
      estoque: planta.estoque - quantidade,
    });

    return res.status(200).json(plantaAtualizada);
  }

  // GET /plantas/estoque/valor-total
  async valorTotalEstoque(req: Request, res: Response): Promise<Response> {
    const resultado = await plantaRepository.sumStockAndValue();
    return res.status(200).json(resultado);
  }
}
import { Injectable } from '@nestjs/common';
import { PaginatedResult } from 'src/lib/dtos';

interface PrismaDelegate<T, CreateInput, WhereInput, UpdateInput> {
  create(args: { data: CreateInput }): Promise<T>;
  findMany(args?: any): Promise<T[]>;
  findFirst(args?: any): Promise<T | null>;
  findUnique(args: { where: any }): Promise<T | null>;
  update(args: { where: any; data: UpdateInput }): Promise<T>;
  delete(args: { where: any }): Promise<T>;
  count(args?: { where?: WhereInput }): Promise<number>;
}

@Injectable()
export abstract class BaseRepository<
  T,
  CreateInput = any,
  WhereInput extends Record<string, any> = any,
  UpdateInput = any,
> {
  protected constructor(
    protected readonly model: PrismaDelegate<
      T,
      CreateInput,
      WhereInput,
      UpdateInput
    >,
  ) {}

  async create(data: CreateInput): Promise<T> {
    return await this.model.create({ data });
  }

  async findOne(filter: WhereInput): Promise<T | null> {
    return await this.model.findFirst({ where: filter });
  }

  async findById(id: string): Promise<T | null> {
    return await this.model.findUnique({ where: { id } });
  }

  async findPaginated(option?: WhereInput): Promise<PaginatedResult<T>> {
    const page = 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    let options = {};

    if (option) {
      options = { ...option };
    }

    const [data, total] = await Promise.all([
      this.model.findMany({
        where: { ...options },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
      }),
      this.model.count(),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data,
    };
  }

  async findAll() {
    return this.model.findMany();
  }

  async update(id: string, data: UpdateInput): Promise<T> {
    return await this.model.update({ where: { id }, data });
  }

  async delete(id: string) {
    return await this.model.delete({ where: { id } });
  }
}

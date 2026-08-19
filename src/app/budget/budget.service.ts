import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { BudgetRepo } from 'src/shared/database/repositories';
import { CreateBudgetDTO, UpdateBudgetDTO } from './dtos';
import { BudgetStatus } from 'generated/prisma/enums';

@Injectable()
export class BudgetService {
  private readonly logger = new Logger(BudgetService.name);
  constructor(private readonly budgetRepo: BudgetRepo) {}

  async createBudget(data: CreateBudgetDTO) {
    try {
      const team = await this.budgetRepo.checkTeam(data.teamId!);
      if (!team) throw new NotFoundException("team doesn't exist");

      const remainingAmount = data.totalAmount - data.allocatedAmount;

      const budget = await this.budgetRepo
        .create({
          team: {
            connect: {
              id: data.teamId,
            },
          },
          name: data.name,
          totalAmount: data.totalAmount,
          allocatedAmount: data.allocatedAmount,
          remainingAmount,
          period: data.period!,
          createdBy: {
            connect: {
              id: data.createdById,
            },
          },
        })
        .then((data) => {
          this.logger.log('budget created successfully');
          return data;
        });

      return budget;
    } catch (err) {
      this.logger.error(err.message, err);
      throw new InternalServerErrorException(err.message, err);
    }
  }

  async getBudgetById(budgetId: string) {
    try {
      const budget = await this.budgetRepo.findById(budgetId);
      if (!budget) throw new NotFoundException('budget not found');

      return budget;
    } catch (err) {
      this.logger.error(err.message, err);
      throw new InternalServerErrorException(err.message, err);
    }
  }

  async getAllBudgets() {
    try {
      const budgets = await this.budgetRepo.findPaginated();
      return budgets;
    } catch (err) {
      this.logger.error(err.message, err);
      throw new InternalServerErrorException(err.message, err);
    }
  }

  async getAllBudgetByTeamId(teamId: string) {
    try {
      const team = await this.budgetRepo.checkTeam(teamId);
      if (!team) throw new NotFoundException('team doesnt exist');

      const budgets = await this.budgetRepo.findPaginated({ teamId });
      return budgets;
    } catch (err) {
      this.logger.error(err.message, err);
      throw new InternalServerErrorException(err.message, err);
    }
  }

  async updateBudget(id: string, data: UpdateBudgetDTO) {
    try {
      const existing = await this.budgetRepo.findById(id);
      if (!existing) throw new NotFoundException('budget not found');

      const totalAmount = Number(data.totalAmount ?? existing.totalAmount);
      const allocatedAmount =
        Number(data.allocatedAmount) || Number(existing.allocatedAmount);

      return this.budgetRepo
        .update(id, {
          ...data,
          remainingAmount: totalAmount - allocatedAmount,
        })
        .then((data) => {
          this.logger.log('budget updated successfully');
          return data;
        });
    } catch (err) {
      this.logger.error(err.message, err);
      throw new InternalServerErrorException(err.message, err);
    }
  }

  async allocateBudget(id: string) {
    try {
      const existing = await this.budgetRepo.findById(id);
      if (!existing) throw new NotFoundException('budget not found');

      if (existing.status === BudgetStatus.allocated)
        throw new BadRequestException('budget is already allocated');

      const budget = await this.budgetRepo.update(id, {
        status: BudgetStatus.allocated,
      });

      return budget;
    } catch (err) {
      this.logger.error(err.message, err);
      throw new InternalServerErrorException(err.message, err);
    }
  }
}

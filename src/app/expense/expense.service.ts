import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Request,
} from '@nestjs/common';
import { ExpenseRepo } from '../../shared/database/repositories';
import { CreateExpenseDTO, UpdateExpenseDTO } from './dtos';
import { ExpenseStatus } from 'generated/prisma/client';

@Injectable()
export class ExpenseService {
  private readonly logger = new Logger(ExpenseService.name);
  constructor(private readonly expenseRepo: ExpenseRepo) {}

  async createExpense(userId: string, data: CreateExpenseDTO) {
    try {
      const team = await this.expenseRepo.checkTeam(data.teamId!);
      if (!team) throw new NotFoundException('team doesnt exist');

      const receipt = data.receipt || {
        secure_url: '',
        public_id: '',
      };

      const expense = await this.expenseRepo.create({
        team: {
          connect: {
            id: data.teamId,
          },
        },
        submittedBy: {
          connect: {
            id: userId,
          },
        },
        title: data.title,
        amount: data.amount,
        category: data.category,
        receipt,
      });

      return expense;
    } catch (err) {
      this.logger.error("couldn't create expense", err);
      throw new InternalServerErrorException("couldn't create expense", err);
    }
  }

  async getExpenseById(expenseId: string) {
    try {
      const expense = await this.expenseRepo.findById(expenseId);
      if (!expense) throw new NotFoundException('expense not found');
      return expense;
    } catch (err) {
      this.logger.error("couldn't get expense", err);
      throw new InternalServerErrorException("couldn't get expense", err);
    }
  }

  async getAllExpenses() {
    try {
      const expenses = await this.expenseRepo.findPaginated();
      return expenses;
    } catch (err) {
      this.logger.error(err.message, err);
      throw new InternalServerErrorException(err.message, err);
    }
  }

  async getAllExpensesByTeamId(teamId: string) {
    try {
      const team = await this.expenseRepo.checkTeam(teamId);
      if (!team) throw new NotFoundException('team doesnt exist');

      const expenses = await this.expenseRepo.findPaginated({ teamId });
      return expenses;
    } catch (err) {
      this.logger.error(err.message, err);
      throw new InternalServerErrorException(err.message, err);
    }
  }

  async updateExpense(expenseId: string, data: UpdateExpenseDTO) {
    try {
      const existing = await this.expenseRepo.findById(expenseId);
      if (!existing) throw new NotFoundException('budget not found');

      return this.expenseRepo
        .update(expenseId, {
          ...data,
        })
        .then((data) => {
          this.logger.log('expense updated successfully');
          return data;
        });
    } catch (err) {
      this.logger.error(err.message, err);
      throw new InternalServerErrorException(err.message, err);
    }
  }

  async approveExpense(expenseId: string, reason: string) {
    try {
      const checkExpense = await this.expenseRepo.findById(expenseId);
      if (!checkExpense) throw new NotFoundException('expense not found');

      if (checkExpense.status === ExpenseStatus.approved)
        throw new BadRequestException('expense already approved');

      if (checkExpense.status === ExpenseStatus.rejected)
        throw new BadRequestException('expense already rejected');

      const expense = await this.expenseRepo.update(expenseId, {
        status: ExpenseStatus.approved,
        reason,
      });

      return expense;
    } catch (err) {
      this.logger.log(err.message, err);
      throw new InternalServerErrorException(err.message, err);
    }
  }

  async rejectExpense(expenseId: string, reason: string) {
    try {
      const checkExpense = await this.expenseRepo.findById(expenseId);
      if (!checkExpense) throw new NotFoundException('expense not found');

      if (checkExpense.status === ExpenseStatus.rejected)
        throw new BadRequestException('expense already rejected');

      if (checkExpense.status === ExpenseStatus.approved)
        throw new BadRequestException('expense already approved');

      const expense = await this.expenseRepo.update(expenseId, {
        status: ExpenseStatus.rejected,
        reason,
      });

      return expense;
    } catch (err) {
      this.logger.log(err.message, err);
      throw new InternalServerErrorException(err.message, err);
    }
  }
}

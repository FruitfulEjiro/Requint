import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDTO, UpdateExpenseDTO } from './dtos';
import { CurrentUser, RequirePermissions } from 'src/lib/decorators';
import type { User } from 'generated/prisma/client';
import { AdminGuard } from 'src/lib/guards';

@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post('create/:teamId')
  @RequirePermissions('expense:create')
  @HttpCode(HttpStatus.CREATED)
  async createExpense(
    @CurrentUser() user: User,
    @Param('teamId') teamId: string,
    @Body() data: CreateExpenseDTO,
  ) {
    const expense = await this.expenseService.createExpense(user.id, {
      teamId,
      ...data,
    });

    return {
      status: true,
      message: 'expense created successfully',
      data: expense,
    };
  }

  @Get('all')
  @UseGuards(AdminGuard)
  @RequirePermissions('expense:read:all')
  @HttpCode(HttpStatus.OK)
  async getAllExpenses() {
    const expenses = await this.expenseService.getAllExpenses();

    return {
      status: true,
      message: 'expenses fetched successfully',
      data: expenses,
    };
  }

  @Get('team/:teamId')
  @RequirePermissions('expense:read:all')
  @HttpCode(HttpStatus.OK)
  async GetExpenseByTeam(@Param('teamId') teamId: string) {
    const expenses = await this.expenseService.getAllExpensesByTeamId(teamId);

    return {
      status: true,
      message: 'expenses fetched successfully',
      data: expenses,
    };
  }

  @Get('/:expenseId')
  @RequirePermissions('expense:read')
  @HttpCode(HttpStatus.OK)
  async getExpenseById(@Param('expenseId') expenseId: string) {
    const expense = await this.expenseService.getExpenseById(expenseId);

    return {
      status: true,
      message: 'expense fetched successfully',
      data: expense,
    };
  }

  @Patch('update/:expenseId')
  @RequirePermissions('expense:update')
  @HttpCode(HttpStatus.OK)
  async updateExpense(
    @Param('expenseId') expenseId: string,
    @Body() data: UpdateExpenseDTO,
  ) {
    const expense = await this.expenseService.updateExpense(expenseId, data);

    return {
      status: true,
      message: 'expense updated successfully',
      data: expense,
    };
  }

  @Post('/:expenseId/approve')
  @UseGuards(AdminGuard)
  @RequirePermissions('expense:approve:reject')
  @HttpCode(HttpStatus.OK)
  async approveExpense(
    @Param('expenseId') expenseId: string,
    @Body('reason') reason: string,
  ) {
    const expense = await this.expenseService.approveExpense(expenseId, reason);

    return {
      status: true,
      message: 'expense approved successfully',
      data: expense,
    };
  }

  @Post('/:expenseId/reject')
  @UseGuards(AdminGuard)
  @RequirePermissions('expense:approve:reject')
  @HttpCode(HttpStatus.OK)
  async rejectExpense(
    @Param('expenseId') expenseId: string,
    @Body('reason') reason: string,
  ) {
    const expense = await this.expenseService.rejectExpense(expenseId, reason);

    return {
      status: true,
      message: 'expense rejected successfully',
      data: expense,
    };
  }
}

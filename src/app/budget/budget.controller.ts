import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { BudgetService } from './budget.service';
import { CreateBudgetDTO, UpdateBudgetDTO } from './dtos';
import { CurrentUser } from 'src/lib/decorators';
import type { User } from 'generated/prisma/client';

@Controller('budgets')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post('create/:teamId')
  @HttpCode(HttpStatus.CREATED)
  async createBudget(
    @Param('teamId') teamId: string,
    @CurrentUser() user: User,
    @Body() data: CreateBudgetDTO,
  ) {
    const budget = await this.budgetService.createBudget({
      ...data,
      teamId,
      createdById: user.id,
    });

    return {
      status: true,
      message: 'budget created successfully',
      data: budget,
    };
  }

  @Get('all')
  @HttpCode(HttpStatus.OK)
  async getAllBudgets() {
    const budgets = await this.budgetService.getAllBudgets();

    return {
      status: true,
      message: 'budgets fetched successfully',
      data: budgets,
    };
  }

  @Get('team/:teamId')
  @HttpCode(HttpStatus.OK)
  async getUserBudgets(@Param('teamId') teamId: string) {
    const budgets = await this.budgetService.getAllBudgetByTeamId(teamId);

    return {
      status: true,
      message: 'budgets fetched successfully',
      data: budgets,
    };
  }

  @Get('/:budgetId')
  @HttpCode(HttpStatus.OK)
  async getBudget(@Param('budgetId') budgetId: string) {
    const budget = await this.budgetService.getBudgetById(budgetId);

    return {
      status: true,
      message: 'budget fetched successfully',
      data: budget,
    };
  }

  @Patch('update/:budgetId')
  @HttpCode(HttpStatus.OK)
  async updateBudget(
    @Param('budgetId') budgetId: string,
    @Body() data: UpdateBudgetDTO,
  ) {
    const budget = await this.budgetService.updateBudget(budgetId, data);

    return {
      status: true,
      message: 'budget updated successfully',
      data: budget,
    };
  }

  @Patch('/:budgetId/allocate')
  @HttpCode(HttpStatus.OK)
  async allocateBudget(@Param('budgetId') budgetId: string) {
    const budget = await this.budgetService.allocateBudget(budgetId);

    return {
      status: true,
      message: 'budget allocated successfully',
      data: budget,
    };
  }
}

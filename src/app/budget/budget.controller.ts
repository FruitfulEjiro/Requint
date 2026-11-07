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
import { BudgetService } from './budget.service';
import { CreateBudgetDTO, UpdateBudgetDTO } from './dtos';
import { CurrentUser, RequirePermissions } from 'src/lib/decorators';
import type { User } from 'generated/prisma/client';
import { AdminGuard } from 'src/lib/guards';

@Controller('budgets')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post('create/:teamId')
  @RequirePermissions('budget:create')
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
  @UseGuards(AdminGuard)
  @RequirePermissions('budget:read:all')
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
  @RequirePermissions('budget:read:team')
  @HttpCode(HttpStatus.OK)
  async getTeamBudgets(@Param('teamId') teamId: string) {
    const budgets = await this.budgetService.getAllBudgetByTeamId(teamId);

    return {
      status: true,
      message: 'budgets fetched successfully',
      data: budgets,
    };
  }

  @Get('/:budgetId')
  @RequirePermissions('budget:read')
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
  @RequirePermissions('budget:update')
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

  @Post('/:budgetId/allocate')
  @UseGuards(AdminGuard)
  @RequirePermissions('budget:allocate')
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
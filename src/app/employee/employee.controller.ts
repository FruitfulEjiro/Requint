import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { UpdateEmployeeDTO } from './dtos';
import { RequirePermissions } from 'src/lib/decorators';
import { AdminGuard } from 'src/lib/guards';

@Controller('employees')
@UseGuards(AdminGuard)
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get('all')
  @RequirePermissions('employee:read:all')
  @HttpCode(HttpStatus.OK)
  async getAllEmployees() {
    const employees = await this.employeeService.getAllEmployees();

    return {
      status: true,
      message: 'employees fetched successfully',
      data: employees,
    };
  }

  @Get('team/:teamId')
  @RequirePermissions('employee:read:all')
  @HttpCode(HttpStatus.OK)
  async getEmployeeByTeam(@Param('teamId') teamId: string) {
    const employees =
      await this.employeeService.getAllEmployeesByTeamId(teamId);

    return {
      status: true,
      message: 'employees fetched successfully',
      data: employees,
    };
  }

  @Get('/:employeeId')
  @RequirePermissions('employee:read')
  @HttpCode(HttpStatus.OK)
  async getEmployeeId(@Param('employeeId') employeeId: string) {
    const employee = await this.employeeService.getEmployeeById(employeeId);

    return {
      status: true,
      message: 'employee fetched successfully',
      data: employee,
    };
  }

  @Patch('update/:employeeId')
  @RequirePermissions('employee:update')
  @HttpCode(HttpStatus.OK)
  async updateEmployee(
    @Param('employeeId') employeeId: string,
    @Body() data: UpdateEmployeeDTO,
  ) {
    const employee = await this.employeeService.updateEmployeeRecord(
      employeeId,
      data,
    );

    return {
      status: true,
      message: 'employee updated successfully',
      data: employee,
    };
  }
}

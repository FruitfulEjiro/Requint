import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { UpdateEmployeeDTO } from './dtos';

@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get('all')
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
  @HttpCode(HttpStatus.OK)
  async GetEmployeeByTeam(@Param('teamId') teamId: string) {
    const employees =
      await this.employeeService.getAllEmployeesByTeamId(teamId);

    return {
      status: true,
      message: 'employees fetched successfully',
      data: employees,
    };
  }

  @Get('/:employeeId')
  @HttpCode(HttpStatus.OK)
  async getExpenseById(@Param('employeeId') employeeId: string) {
    const employee = await this.employeeService.getEmployeeById(employeeId);

    return {
      status: true,
      message: 'employee fetched successfully',
      data: employee,
    };
  }

  @Patch('update/:employeeId')
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

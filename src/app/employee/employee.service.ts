import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EmployeeRepo } from 'src/shared/database/repositories';
import { UpdateEmployeeDTO } from './dtos';

@Injectable()
export class EmployeeService {
  private readonly logger = new Logger(EmployeeService.name);

  constructor(private readonly employeeRepo: EmployeeRepo) {}

  async getEmployeeById(employeeId: string) {
    try {
      const employee = await this.employeeRepo.findById(employeeId);
      if (!employee) throw new NotFoundException('expense not found');
      return employee;
    } catch (err) {
      this.logger.error(err.message, err);
      throw new InternalServerErrorException(err.message, err);
    }
  }

  async getAllEmployees() {
    try {
      const employee = await this.employeeRepo.findPaginated();
      return employee;
    } catch (err) {
      this.logger.error(err.message, err);
      throw new InternalServerErrorException(err.message, err);
    }
  }

  async getAllEmployeesByTeamId(teamId: string) {
    try {
      const team = await this.employeeRepo.checkTeam(teamId);
      if (!team) throw new NotFoundException('team doesnt exist');

      const employee = await this.employeeRepo.findPaginated({ teamId });
      return employee;
    } catch (err) {
      this.logger.error(err.message, err);
      throw new InternalServerErrorException(err.message, err);
    }
  }

  async updateEmployeeRecord(employeeId: string, data: UpdateEmployeeDTO) {
    try {
      const existing = await this.employeeRepo.findById(employeeId);
      if (!existing) throw new NotFoundException('budget not found');

      return this.employeeRepo
        .update(employeeId, {
          ...data,
        })
        .then((data) => {
          this.logger.log('employee updated successfully');
          return data;
        });
    } catch (err) {
      this.logger.error(err.message, err);
      throw new InternalServerErrorException(err.message, err);
    }
  }
}

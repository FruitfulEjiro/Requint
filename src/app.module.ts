import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './app/auth';
import { PrismaModule } from './shared/database';
import { RedisModule } from './shared/redis';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard, PermissionsGuard } from './lib/guards';
import { BudgetModule } from './app/budget';
import { ExpenseModule } from './app/expense';
import { MembershipModule } from './app/membership/membership.module';
import { EmployeeModule } from './app/employee';
import { EmailModule } from './shared/email';
import { RoleModule } from './app/role';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    RedisModule,
    BudgetModule,
    ExpenseModule,
    MembershipModule,
    EmployeeModule,
    EmailModule,
    RoleModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}

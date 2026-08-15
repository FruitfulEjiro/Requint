import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './app/auth';
import { PrismaModule } from './shared/database';
import { RedisModule } from './shared/redis';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './lib/guards';

@Module({
  imports: [AuthModule, PrismaModule, RedisModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    }
  ],
})
export class AppModule {}

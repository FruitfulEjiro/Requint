// redis/redis.module.ts
import { Module, Global, Logger } from '@nestjs/common';
import Redis from 'ioredis';

const logger = new Logger();

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const client = new Redis(process.env['REDIS_URL']!);
        client.on('error', (err) => {
          logger.error('Redis connection error:', err);
        });
        return client;
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}

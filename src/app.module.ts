import { Module } from '@nestjs/common'
import { AuthorModule } from './modules/author/author.module'
import { BookModule } from './modules/book/book.module'
import { StudentModule } from './modules/student/student.module'
import { LoanModule } from './modules/loan/loan.module'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthModule } from './modules/auth/auth.module'
import { APP_GUARD } from '@nestjs/core'
import {
  ThrottlerGuard,
  ThrottlerModule,
  ThrottlerModuleOptions
} from '@nestjs/throttler'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): ThrottlerModuleOptions => ({
        throttlers: [
          {
            ttl: parseInt(config.get<string>('THROTTLE_TTL', '60000'), 10),
            limit: parseInt(config.get<string>('THROTTLE_LIMIT', '10'), 10)
          }
        ]
      })
    }),
    AuthModule,
    AuthorModule,
    BookModule,
    StudentModule,
    LoanModule
  ],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }]
})
export class AppModule {}

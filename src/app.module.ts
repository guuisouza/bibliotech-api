import { Module } from '@nestjs/common'
import { AuthorModule } from './modules/author/author.module'
import { BookModule } from './modules/book/book.module'
import { StudentModule } from './modules/student/student.module'
import { LoanModule } from './modules/loan/loan.module'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './modules/auth/auth.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    AuthorModule,
    BookModule,
    StudentModule,
    LoanModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}

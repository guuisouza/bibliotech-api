import { Module } from '@nestjs/common'
import { AuthorModule } from './modules/author/author.module'
import { BookModule } from './modules/book/book.module'
import { StudentModule } from './modules/student/student.module'
import { LoanModule } from './modules/loan/loan.module'

@Module({
  imports: [AuthorModule, BookModule, StudentModule, LoanModule],
  controllers: [],
  providers: []
})
export class AppModule {}

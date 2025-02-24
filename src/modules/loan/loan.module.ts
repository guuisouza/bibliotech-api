import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { LoanController } from './loan.controller'
import { LoanService } from './loan.service'
import { StudentModule } from '../student/student.module'
import { BookModule } from '../book/book.module'

@Module({
  imports: [PrismaModule, StudentModule, BookModule],
  controllers: [LoanController],
  providers: [LoanService],
  exports: [LoanService]
})
export class LoanModule {}

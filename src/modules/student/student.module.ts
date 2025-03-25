import { forwardRef, Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { StudentService } from './student.service'
import { StudentController } from './student.controller'
import { LoanModule } from '../loan/loan.module'

@Module({
  imports: [PrismaModule, forwardRef(() => LoanModule)],
  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService]
})
export class StudentModule {}

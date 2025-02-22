import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { StudentService } from './student.service'
import { StudentController } from './student.controller'

@Module({
  imports: [PrismaModule],
  controllers: [StudentController],
  providers: [StudentService],
  exports: []
})
export class StudentModule {}

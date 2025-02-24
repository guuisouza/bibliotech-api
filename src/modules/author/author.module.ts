import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { AuthorController } from './author.controller'
import { AuthorService } from './author.service'

@Module({
  imports: [PrismaModule],
  controllers: [AuthorController],
  providers: [AuthorService],
  exports: [AuthorService]
})
export class AuthorModule {}

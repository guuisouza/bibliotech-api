import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthorModule } from './modules/author/author.module'
import { BookModule } from './modules/book/book.module'
import { StudentModule } from './modules/student/student.module'

@Module({
  imports: [AuthorModule, BookModule, StudentModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}

import { Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import * as bcrypt from 'bcrypt'

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedAdminUser()
  }

  private async seedAdminUser() {
    const username = process.env.SEED_USER_NAME as string
    const email = process.env.SEED_USER_EMAIL as string
    const password = process.env.SEED_USER_PASSWORD as string

    const adminExists = await this.prisma.user.findUnique({
      where: { email }
    })

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(password, 10)

      await this.prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword
        }
      })

      console.log('Admin user created!')
    } else {
      console.log('Admin user already exists... SKIPPING SEED!')
    }
  }
}

import { CanActivate } from '@nestjs/common'

export const jwtAuthGuardMock: CanActivate = {
  canActivate: jest.fn(() => true)
}

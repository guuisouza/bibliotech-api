import { applyDecorators } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'

export function ApiLoginBadRequestResponse() {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description: 'Bad Request - Invalid values for email or password',
      content: {
        'application/json': {
          example: {
            statusCode: 400,
            message: ['email must be an email', 'password must be a string'],
            error: 'Bad Request'
          }
        }
      }
    })
  )
}

export function ApiLoginUnauthorizedResponse() {
  return applyDecorators(
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Incorrect email or password',
      content: {
        'application/json': {
          examples: {
            loginUnauthorized: {
              summary: 'Incorrect email or password field values',
              value: {
                message: 'incorrect email or password',
                error: 'Unauthorized',
                statusCode: 401
              }
            }
          }
        }
      }
    })
  )
}

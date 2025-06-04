import { applyDecorators } from '@nestjs/common'
import { ApiBadRequestResponse, ApiConflictResponse } from '@nestjs/swagger'

export function ApiCreateLoanBadRequestResponse() {
  return applyDecorators(
    ApiBadRequestResponse({
      description: 'Bad Request - validation errors when creating a loan',
      content: {
        'application/json': {
          example: {
            statusCode: 400,
            message: [
              'studentId must be a number',
              'studentId should not be empty',
              'bookId must be a number',
              'bookId should not be empty',
              'dueDate must be a valid ISO 8601 date string',
              'dueDate should not be empty',
              'dueDate must be greater than current date'
            ],
            error: 'Bad Request'
          }
        }
      }
    })
  )
}

export function ApiCreateLoanConflictResponse() {
  return applyDecorators(
    ApiConflictResponse({
      description:
        'Conflict - this student already has an active loan or there are no available copies of the book',
      content: {
        'application/json': {
          examples: {
            noAvailableCopies: {
              summary: 'No available copies of the book',
              value: {
                statusCode: 409,
                message: 'no available copies of this book',
                error: 'Conflict'
              }
            },
            studentConflict: {
              summary: 'Student already has an active loan',
              value: {
                statusCode: 409,
                message: 'This student already has an active loan',
                error: 'Conflict'
              }
            }
          }
        }
      }
    })
  )
}

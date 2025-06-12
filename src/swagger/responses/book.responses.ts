import { applyDecorators } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'

export function ApiBookBadRequestResponse() {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description: 'Bad Request - Invalid values',
      content: {
        'application/json': {
          examples: {
            bookBadRequest: {
              summary: 'Invalid or missing values for book creation',
              value: {
                message: [
                  'title should not be empty',
                  'title must be shorter than or equal to 250 characters',
                  'title must be a string',
                  'authorId must be a number conforming to the specified constraints',
                  'genre should not be empty',
                  'genre must be shorter than or equal to 50 characters',
                  'genre must be a string',
                  'isbn should not be empty',
                  'isbn must be shorter than or equal to 15 characters',
                  'isbn must be a string',
                  'the published year must be greater than 1000',
                  'the published year must be less than the current year',
                  'year must be a number conforming to the specified constraints'
                ],
                error: 'Bad Request',
                statusCode: 400
              }
            }
          }
        }
      }
    })
  )
}

export function ApiBookInventoryBadRequestResponse() {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description: 'Bad Request - Invalid inventory quantity',
      content: {
        'application/json': {
          examples: {
            amountInvalid: {
              summary: 'Empty or invalid amount value',
              value: {
                message: [
                  'amount must be an integer number',
                  'amount must not be empty',
                  'the quantity to add or remove from inventory must be greater than 0'
                ],
                error: 'Bad Request',
                statusCode: 400
              }
            }
          }
        }
      }
    })
  )
}

export function ApiBookConflictResponse() {
  return applyDecorators(
    ApiResponse({
      status: 409,
      description: 'Conflict - Book already exists',
      content: {
        'application/json': {
          examples: {
            bookAlreadyExistsConflict: {
              summary: 'Book already exists',
              value: {
                message: 'this book already exists',
                error: 'Conflict',
                statusCode: 409
              }
            }
          }
        }
      }
    })
  )
}

export function ApiBookRemoveInventoryConflictResponse() {
  return applyDecorators(
    ApiResponse({
      status: 409,
      description:
        'Conflict - Cannot remove more books than the available quantity.',
      content: {
        'application/json': {
          examples: {
            bookAlreadyExistsConflict: {
              summary: 'Cannot remove more books than the available quantity.',
              value: {
                message: 'cannot remove more than 6 available books',
                error: 'Conflict',
                statusCode: 409
              }
            }
          }
        }
      }
    })
  )
}

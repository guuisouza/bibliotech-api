import { applyDecorators } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'

export function ApiAuthorBadRequestResponse() {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description: 'Bad Request - Invalid values for one or more fields',
      content: {
        'application/json': {
          examples: {
            invalidFields: {
              summary: 'Multiple invalid fields',
              value: {
                message: [
                  'name should not be empty',
                  'name must be shorter than or equal to 90 characters',
                  'name must be a string',
                  'nationality should not be empty',
                  'nationality must be shorter than or equal to 30 characters',
                  'nationality must be a string',
                  'the author must be over 16 years old',
                  'the birth year must be greater than 1000',
                  'birthYear must be a number conforming to the specified constraints'
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

export function ApiAuthorConflictResponse() {
  return applyDecorators(
    ApiResponse({
      status: 409,
      description: 'Conflict - Author already exists',
      content: {
        'application/json': {
          examples: {
            authorConflict: {
              summary: 'Author already exists',
              value: {
                message: 'author already exists',
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

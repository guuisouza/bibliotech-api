import { applyDecorators } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'

export function ApiSharedUnauthorizedResponse() {
  return applyDecorators(
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Unauthorized route access attempt',
      content: {
        'application/json': {
          examples: {
            loginUnauthorized: {
              summary: 'Unauthorized route access attempt',
              value: {
                message: 'Unauthorized',
                statusCode: 401
              }
            }
          }
        }
      }
    })
  )
}

export function ApiSharedAuthorNotFoundResponse() {
  return applyDecorators(
    ApiResponse({
      status: 404,
      description: 'Not Found - Author id not found',
      content: {
        'application/json': {
          examples: {
            authorNotFound: {
              summary: 'Author id not found',
              value: {
                message: 'author id 655 does not exist',
                error: 'Not Found',
                statusCode: 404
              }
            }
          }
        }
      }
    })
  )
}

export function ApiSharedBookNotFoundResponse() {
  return applyDecorators(
    ApiResponse({
      status: 404,
      description: 'Not Found - Book id not found',
      content: {
        'application/json': {
          examples: {
            bookNotFound: {
              summary: 'Book id not found',
              value: {
                message: 'book id 655 does not exist',
                error: 'Not Found',
                statusCode: 404
              }
            }
          }
        }
      }
    })
  )
}

export function ApiSharedStudentNotFoundResponse() {
  return applyDecorators(
    ApiResponse({
      status: 404,
      description: 'Not Found - Student id not found',
      content: {
        'application/json': {
          examples: {
            studentNotFound: {
              summary: 'Student id not found',
              value: {
                message: 'student id 655 does not exist',
                error: 'Not Found',
                statusCode: 404
              }
            }
          }
        }
      }
    })
  )
}

export function ApiSharedLoanNotFoundResponse() {
  return applyDecorators(
    ApiResponse({
      status: 404,
      description: 'Not Found - Loan id not found',
      content: {
        'application/json': {
          examples: {
            loanNotFound: {
              summary: 'Loan id not found',
              value: {
                message: 'loan id 655 does not exist',
                error: 'Not Found',
                statusCode: 404
              }
            }
          }
        }
      }
    })
  )
}

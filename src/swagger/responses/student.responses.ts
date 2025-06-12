import { applyDecorators } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'

export function ApiStudentFindOneResponse() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description:
        'Successful response with all the detailed information of the student and his active loan (if he has a loan)',
      content: {
        'application/json': {
          examples: {
            'student-without-loan': {
              summary: 'Response when the student does not have an active loan',
              value: {
                id: 1,
                name: 'Alice Oliveira',
                email: 'alice.oliveira@email.com',
                phone: '(11) 98765-4321',
                academicRegistration: '2023123456789',
                createdAt: '2025-03-24T20:49:45.000Z',
                updatedAt: '2025-03-24T20:49:45.000Z',
                activeLoan: null
              }
            },
            'student-with-loan': {
              summary: 'Response when the student has an active loan',
              value: {
                id: 1,
                name: 'Alice Oliveira',
                email: 'alice.oliveira@email.com',
                phone: '(11) 98765-4321',
                academicRegistration: '2023123456789',
                createdAt: '2025-03-24T20:49:45.000Z',
                updatedAt: '2025-03-24T20:49:45.000Z',
                activeLoan: {
                  id: 1,
                  studentId: 1,
                  bookId: 1,
                  loanDate: '2025-03-25T20:48:16.000Z',
                  dueDate: '2025-03-30T00:00:00.000Z',
                  isActive: true,
                  returnDate: null,
                  createdAt: '2025-03-25T20:48:16.000Z',
                  updatedAt: '2025-03-25T20:48:16.000Z'
                }
              }
            }
          }
        }
      }
    })
  )
}

export function ApiStudentBadRequestResponse() {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description: 'Bad Request - Invalid student data',
      content: {
        'application/json': {
          examples: {
            invalidStudentData: {
              summary: 'One or more fields have invalid values',
              value: {
                statusCode: 400,
                message: [
                  'name should not be empty',
                  'name must be shorter than or equal to 90 characters',
                  'name must be a string',
                  'email must be an email',
                  'email should not be empty',
                  'phone should not be empty',
                  'the phone number must be in the format (XX) XXXXX-XXXX',
                  'the phone number must be exactly 15 characters long (format: (XX) XXXXX-XXXX)',
                  'academic registration should not be empty',
                  'the academic registry must be exactly 13 digits long',
                  'academicRegistration must be a string'
                ],
                error: 'Bad Request'
              }
            }
          }
        }
      }
    })
  )
}

export function ApiStudentConflictResponse() {
  return applyDecorators(
    ApiResponse({
      status: 409,
      description:
        'Conflict - this student email or academic registry already exists',
      content: {
        'application/json': {
          examples: {
            emailConflict: {
              summary: 'Email already exists',
              value: {
                statusCode: 409,
                message: 'this student email already exists',
                error: 'Conflict'
              }
            },
            academicRegistryConflict: {
              summary: 'Academic registry already exists',
              value: {
                statusCode: 409,
                message: 'this student academic registry already exists',
                error: 'Conflict'
              }
            }
          }
        }
      }
    })
  )
}

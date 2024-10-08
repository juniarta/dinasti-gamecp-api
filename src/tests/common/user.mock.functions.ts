import { SignUpDto } from '@modules/auth/dto/sign-up.dto';
import { faker } from '@faker-js/faker';
import { User } from '@prisma/client';
import { PaginatorTypes } from '@nodeteam/nestjs-prisma-pagination';
import PaginatedResult = PaginatorTypes.PaginatedResult;
import { AccessRefreshTokens } from '@modules/auth/types/auth.types';
import UserEntity from '@modules/user/entities/user.entity';

export function getSignUpData(email?: string): SignUpDto {
  return {
    email: faker.internet.email({ provider: email }),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    password: faker.internet.password({ length: 12 }),
  };
}

export function getPaginatedData<T>(input: T[]): PaginatedResult<T> {
  return {
    data: input,
    meta: {
      total: input.length,
      lastPage: Math.ceil(input.length / 10),
      currentPage: 1,
      perPage: 10,
      prev: null,
      next: null,
    },
  };
}

export function createUsers(length: number): UserEntity[] {
  const result: UserEntity[] = [];
  for (let i = 0; i < length; i++) {
    const user: UserEntity = {
      id: faker.string.alphanumeric({ length: 12 }),
      ...getSignUpData(),
      phone: null,
      roles: ['member'],
      createdAt: faker.date.anytime(),
      updatedAt: faker.date.anytime(),
    };
    result.push(user);
  }

  return result;
}

export function getJwtTokens(): AccessRefreshTokens {
  return {
    accessToken: faker.string.alphanumeric({ length: 40 }),
    refreshToken: faker.string.alphanumeric({ length: 40 }),
  };
}

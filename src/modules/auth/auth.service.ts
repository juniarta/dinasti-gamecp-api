import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { UserRepository } from '@modules/user/user.repository';
import {
  INVALID_CREDENTIALS,
  NOT_FOUND,
  USER_CONFLICT,
} from '@constants/errors.constants';
import { SignInDto } from '@modules/auth/dto/sign-in.dto';
import { TokenService } from '@modules/auth/token.service';
import { AccessRefreshTokens } from './types/auth.types';
import UserEntity from '@modules/user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * @desc Create a new user
   * @param signUpDto
   * @returns Promise<User> - Created user
   * @throws ConflictException - User with this email or phone already exists
   */
  async singUp(signUpDto: SignUpDto): Promise<UserEntity> {
    const testUser: UserEntity = await this.userRepository.findOne({
      where: { email: signUpDto.email },
    });

    if (testUser) {
      // 409001: User with this email or phone already exists
      throw new ConflictException(USER_CONFLICT);
    }

    return this.userRepository.create(signUpDto);
  }

  /**
   * @desc Sign in a user
   * @returns AccessRefreshTokens - Access and refresh tokens
   * @throws NotFoundException - User not found
   * @throws UnauthorizedException - Invalid credentials
   * @param signInDto - User credentials
   */
  async signIn(signInDto: SignInDto): Promise<AccessRefreshTokens> {
    const testUser: UserEntity = await this.userRepository.findOne({
      where: {
        email: signInDto.email,
      },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!testUser) {
      // 404001: User not found
      throw new NotFoundException(NOT_FOUND);
    }

    if (
      !(await this.tokenService.isPasswordCorrect(
        signInDto.password,
        testUser.password,
      ))
    ) {
      // 401001: Invalid credentials
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }

    return this.tokenService.sign({
      id: testUser.id,
      email: testUser.email,
      roles: testUser.roles,
    });
  }

  refreshTokens(refreshToken: string): Promise<AccessRefreshTokens | void> {
    return this.tokenService.refreshTokens(refreshToken);
  }

  logout(accessToken: string): Promise<void> {
    return this.tokenService.logout(accessToken);
  }
}

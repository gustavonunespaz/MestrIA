import { IUserRepository } from '@domain/repositories/IUserRepository';
import { User } from '@domain/entities/User';
import { CreateUserDTO, UserResponseDTO, LoginDTO, LoginResponseDTO } from '@application/dto/UserDTO';
import { StringUtils, DateUtils } from '@shared/utils';
import { ValidationError, NotFoundError, UnauthorizedError } from '@shared/errors/AppError';
import { JWTService } from '@infrastructure/auth/JWTService';
import bcrypt from 'bcrypt';

// Use Case - Application layer orchestrates domain logic
export class CreateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(dto: CreateUserDTO): Promise<UserResponseDTO> {
    // Validation
    if (!dto.email || !dto.email.includes('@')) {
      throw new ValidationError('Invalid email format');
    }

    if (!dto.password || dto.password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ValidationError('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create domain entity
    const user = new User({
      id: StringUtils.generateId(),
      name: dto.name,
      email: dto.email,
      passwordHash,
      createdAt: DateUtils.now(),
      updatedAt: DateUtils.now(),
    });

    // Persist
    const createdUser = await this.userRepository.create(user);

    // Return DTO
    return new UserResponseDTO({
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      createdAt: createdUser.createdAt,
      updatedAt: createdUser.updatedAt,
    });
  }
}

export class GetUserByIdUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(id: string): Promise<UserResponseDTO> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundError('User');
    }

    return new UserResponseDTO({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}

export class LoginUseCase {
  private jwtService: JWTService;

  constructor(private userRepository: IUserRepository) {
    this.jwtService = new JWTService();
  }

  async execute(dto: LoginDTO): Promise<LoginResponseDTO> {
    // Validação
    if (!dto.email || !dto.password) {
      throw new ValidationError('Email e senha são obrigatórios');
    }

    // Buscar usuário
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedError('Email ou senha incorretos');
    }

    // Verificar senha
    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordMatch) {
      throw new UnauthorizedError('Email ou senha incorretos');
    }

    // Gerar tokens
    const token = this.jwtService.generateToken(user.id, user.email);
    const refreshToken = this.jwtService.generateRefreshToken(user.id);

    return new LoginResponseDTO({
      id: user.id,
      name: user.name,
      email: user.email,
      token,
      refreshToken,
    });
  }
}

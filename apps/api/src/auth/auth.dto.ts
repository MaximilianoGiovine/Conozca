/**
 * Data Transfer Objects para autenticación
 */
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@conozca.org',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario (mínimo 8 caracteres)',
    example: 'SecurePass123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class LoginDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@conozca.org',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'SecurePass123!',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

export class UserDto {
  @ApiProperty({
    description: 'ID único del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@conozca.org',
  })
  email: string;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan Pérez',
  })
  name: string;

  @ApiProperty({
    description: 'Rol del usuario',
    enum: ['USER', 'EDITOR', 'ADMIN'],
    example: 'USER',
  })
  role: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'Token de acceso JWT (válido por 15 minutos)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'Token de refresco (válido por 7 días)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refresh_token: string;

  @ApiProperty({
    description: 'Datos del usuario autenticado',
    type: UserDto,
  })
  user: UserDto;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token obtenido en login/register',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email del usuario que olvidó su contraseña',
    example: 'usuario@conozca.org',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@conozca.org',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Token de reset recibido por email',
    example: 'abc123def456...',
  })
  @IsString()
  @IsNotEmpty()
  reset_token: string;

  @ApiProperty({
    description: 'Nueva contraseña (mínimo 8 caracteres)',
    example: 'NewSecurePass123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { EmailService } from '../common/email.service';

describe('AuthService sessions/refresh', () => {
  let service: AuthService;
  const prisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  } as any as PrismaService;

  const mockEmailService = {
    sendVerificationEmail: jest.fn().mockResolvedValue(true),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
    sendWelcomeEmail: jest.fn().mockResolvedValue(true),
    sendNotificationEmail: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        { provide: PrismaService, useValue: prisma },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();
    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  it('rotates refresh token on refresh()', async () => {
    const user = { id: 'u1', email: 'a@b.com', role: 'USER', password: 'hash' } as any;
    (prisma.user.findUnique as any).mockResolvedValue(user);
    const jwt = moduleJwt(service);
    const tokens = (service as any).generateTokens(user.id, user.email, user.role);
    // mock session table via any
    (prisma as any).session = {
      findFirst: jest.fn().mockResolvedValue({ id: 's1' }),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      create: jest.fn().mockResolvedValue({ id: 's2' }),
    };

    const res = await service.refresh(tokens.refresh_token);
    expect((prisma as any).session.updateMany).toHaveBeenCalled();
    expect((prisma as any).session.create).toHaveBeenCalled();
    expect(res.access_token).toBeDefined();
  });

  it('verifies email and deletes token', async () => {
    const user = { id: 'u2', email: 'c@d.com' } as any;
    (prisma.user.findUnique as any).mockResolvedValue(user);
    (prisma as any).emailVerificationToken = {
      findUnique: jest.fn().mockResolvedValue({ userId: 'u2', tokenHash: require('crypto').createHash('sha256').update('tok').digest('hex'), expiresAt: new Date(Date.now() + 10000) }),
      delete: jest.fn().mockResolvedValue({}),
    };

    await expect(service.verifyEmail('c@d.com', 'tok')).resolves.not.toThrow();
    expect((prisma as any).emailVerificationToken.delete).toHaveBeenCalled();
  });
});

function moduleJwt(service: any) {
  return service['jwtService'] as JwtService;
}

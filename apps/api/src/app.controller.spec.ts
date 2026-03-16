import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaService } from "./prisma.service";

describe("AppController", () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        count: jest.fn().mockResolvedValue(0),
      },
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe("root", () => {
    it('should return "Hello World!"', async () => {
      const result = await appController.getHello();
      expect(result).toContain("usuarios registrados");
    });
  });

  describe("healthCheck", () => {
    it("should return health status", () => {
      const result = appController.healthCheck();

      expect(result).toHaveProperty("status", "ok");
      expect(result).toHaveProperty("timestamp");
      expect(result).toHaveProperty("uptime");
      expect(typeof result.uptime).toBe("number");
      expect(result.uptime).toBeGreaterThanOrEqual(0);
    });
  });
});

import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { join } from "path";

/**
 * Bootstrap de la aplicación NestJS.
 *
 * Inicializa la aplicación y la pone a escuchar en el puerto configurado.
 * Por defecto usa el puerto 4000, pero puede ser configurado vía variable de entorno PORT.
 */
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Trust proxy for Nginx/Load Balancer (security)
  app.set("trust proxy", 1);

  // Puerto configurable vía variable de entorno, por defecto 4000
  const port = process.env.PORT ?? 3000;

  // Servir archivos estáticos desde /uploads
  app.useStaticAssets(join(__dirname, "..", "uploads"), {
    prefix: "/uploads/",
  });

  // Configuración global de ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuración de Swagger/OpenAPI
  const enableSwagger = process.env.ENABLE_SWAGGER !== "false";

  if (enableSwagger) {
    const config = new DocumentBuilder()
      .setTitle("Conozca API")
      .setDescription(
        "API REST para la plataforma de revista digital Conozca. Incluye gestión de artículos, autenticación, categorías, y analíticas.",
      )
      .setVersion("1.0.0")
      .setContact(
        "Equipo Conozca",
        "https://conozca.org",
        "contacto@conozca.org",
      )
      .setLicense("MIT", "https://opensource.org/licenses/MIT")
      .addServer("http://localhost:3000", "Desarrollo Local")
      .addServer("https://staging-api.conozca.org", "Staging")
      .addServer("https://api.conozca.org", "Producción")
      .addBearerAuth(
        {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          name: "JWT",
          description:
            "Ingrese el JWT token (obtenido de /auth/login o /auth/register)",
          in: "header",
        },
        "JWT-auth",
      )
      .addTag("auth", "Autenticación y autorización")
      .addTag("articles", "Gestión de artículos")
      .addTag("categories", "Categorías de artículos")
      .addTag("authors", "Autores de artículos")
      .addTag("blocks", "Bloques de contenido (editor avanzado)")
      .addTag("uploads", "Upload de archivos e imágenes")
      .addTag("comments", "Comentarios en artículos")
      .addTag("health", "Health checks y monitoring")
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: "alpha",
        operationsSorter: "alpha",
      },
      customSiteTitle: "Conozca API Docs",
      customfavIcon: "https://conozca.org/favicon.ico",
      customCss: ".swagger-ui .topbar { display: none }",
    });

    console.log(
      `📚 Swagger UI disponible en http://localhost:${port}/api/docs`,
    );
  }

  await app.listen(port);

  console.log(`🚀 API corriendo en http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error("Error starting api:", err);
  process.exit(1);
});

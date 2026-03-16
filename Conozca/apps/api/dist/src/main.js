"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const path_1 = require("path");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.set("trust proxy", 1);
    const port = process.env.PORT ?? 3000;
    app.useStaticAssets((0, path_1.join)(__dirname, "..", "uploads"), {
        prefix: "/uploads/",
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const enableSwagger = process.env.ENABLE_SWAGGER !== "false";
    if (enableSwagger) {
        const config = new swagger_1.DocumentBuilder()
            .setTitle("Conozca API")
            .setDescription("API REST para la plataforma de revista digital Conozca. Incluye gestión de artículos, autenticación, categorías, y analíticas.")
            .setVersion("1.0.0")
            .setContact("Equipo Conozca", "https://conozca.org", "contacto@conozca.org")
            .setLicense("MIT", "https://opensource.org/licenses/MIT")
            .addServer("http://localhost:3000", "Desarrollo Local")
            .addServer("https://staging-api.conozca.org", "Staging")
            .addServer("https://api.conozca.org", "Producción")
            .addBearerAuth({
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            name: "JWT",
            description: "Ingrese el JWT token (obtenido de /auth/login o /auth/register)",
            in: "header",
        }, "JWT-auth")
            .addTag("auth", "Autenticación y autorización")
            .addTag("articles", "Gestión de artículos")
            .addTag("categories", "Categorías de artículos")
            .addTag("authors", "Autores de artículos")
            .addTag("blocks", "Bloques de contenido (editor avanzado)")
            .addTag("uploads", "Upload de archivos e imágenes")
            .addTag("comments", "Comentarios en artículos")
            .addTag("health", "Health checks y monitoring")
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup("api/docs", app, document, {
            swaggerOptions: {
                persistAuthorization: true,
                tagsSorter: "alpha",
                operationsSorter: "alpha",
            },
            customSiteTitle: "Conozca API Docs",
            customfavIcon: "https://conozca.org/favicon.ico",
            customCss: ".swagger-ui .topbar { display: none }",
        });
        console.log(`📚 Swagger UI disponible en http://localhost:${port}/api/docs`);
    }
    await app.listen(port);
    console.log(`🚀 API corriendo en http://localhost:${port}`);
}
bootstrap().catch((err) => {
    console.error("Error starting api:", err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map
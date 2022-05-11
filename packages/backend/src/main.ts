import { env } from "process";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import compression from "compression";
import helmet from "helmet";
import cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const options = new DocumentBuilder()
    .setTitle("API Overview")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup("api", app, document);

  app.use(helmet());
  app.use(compression());
  app.use(cookieParser(env.COOKIE_SECRET));
  app.enableCors();

  await app.listen(env.PORT || 3000);
}
bootstrap();

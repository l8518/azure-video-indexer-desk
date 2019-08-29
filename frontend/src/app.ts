
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import * as hbs from 'hbs';
import { isNullOrUndefined } from 'util';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
  );

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  hbs.registerPartials(join(__dirname, '..', '/views/_partials/'));
  app.setViewEngine('hbs');
  app.set('view options', { layout: 'default' });

  let hostname : string = (!isNullOrUndefined(process.env.HOST) ? process.env.HOST : undefined)
  await app.listen(process.env.PORT || 3000, hostname);
}
bootstrap();

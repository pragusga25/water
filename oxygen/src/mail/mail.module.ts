import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { forwardRef, Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    forwardRef(() =>
      MailerModule.forRootAsync({
        // imports: [ConfigModule], // import module if not enabled globally
        useFactory: async (config: ConfigService) => ({
          // transport: config.get("MAIL_TRANSPORT"),
          // or
          transport: {
            host: config.get('MAIL_HOST'),
            service: config.get('MAIL_SERVICE'),
            secure: true,
            port: config.get('MAIL_PORT'),
            auth: {
              user: config.get('MAIL_USER'),
              pass: config.get('MAIL_PASSWORD'),
            },
            tls: {
              rejectUnauthorized: false,
              secureProtocol: 'TLSv1_2_method',
            },
          },
          defaults: {
            from: `"No Reply" <${config.get('MAIL_FROM')}>`,
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        }),
        inject: [ConfigService],
      }),
    ),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}

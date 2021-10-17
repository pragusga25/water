import { GraphQLRequestModule } from '@golevelup/nestjs-graphql-request';
import { forwardRef, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';
import { UsersController } from './users/users.controller';
import { HasuraModule } from '@golevelup/nestjs-hasura';
import { MailModule } from './mail/mail.module';
import { ConfigModule } from '@nestjs/config';
const path = require('path');

@Module({
  imports: [
    forwardRef(() =>
      ConfigModule.forRoot({
        isGlobal: true, // no need to import into other modules
      }),
    ),
    GraphQLRequestModule.forRoot(GraphQLRequestModule, {
      // Exposes configuration options based on the graphql-request package
      endpoint: 'http://localhost:8080/v1/graphql',
      options: {
        headers: {
          'content-type': 'application/json',
          'x-hasura-admin-secret': 'hydro',
        },
      },
    }),
    HasuraModule.forRoot(HasuraModule, {
      webhookConfig: {
        secretFactory: 'secret',
        secretHeader: 'hydro',
      },
      managedMetaDataConfig: {
        metadataVersion: 'v3',
        secretHeaderEnvName: 'HASURA_NESTJS_WEBHOOK_SECRET_HEADER_VALUE',
        nestEndpointEnvName: 'NESTJS_EVENT_WEBHOOK_ENDPOINT',
        dirPath: path.join(process.cwd(), '../hydrogen/hasura/metadata'),
        defaultEventRetryConfig: {
          intervalInSeconds: 15,
          numRetries: 3,
          timeoutInSeconds: 100,
          toleranceSeconds: 21600,
        },
      },
    }),
    MailModule,
  ],
  controllers: [AppController, UsersController],
  providers: [AppService, UsersService],
})
export class AppModule {}

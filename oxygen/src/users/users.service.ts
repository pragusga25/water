import { InjectGraphQLClient } from '@golevelup/nestjs-graphql-request';
import {
  HasuraInsertEvent,
  TrackedHasuraEventHandler,
} from '@golevelup/nestjs-hasura';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';
import { MailService } from 'src/mail/mail.service';
import { CreateProfileArgs } from './users.controller';

export interface User extends CreateProfileArgs {
  id: number;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectGraphQLClient() private readonly client: GraphQLClient,
    @Inject(forwardRef(() => MailService))
    private readonly mailService: MailService,
  ) {}

  async createProfile({
    fullname,
    email,
    username,
    password,
  }: CreateProfileArgs) {
    const addUser = `
    mutation {
      insert_hydrogen_users_one(object: {email: "${email}", password: "${password}", username: "${username}"}) {
        id
      }
    }    
    `;

    const user_id = await this.client
      .request<{ insert_hydrogen_users_one: { id: number } }>(addUser)
      .then((result) => {
        console.log(result, 'RESSSSS1');
        const user_id = result.insert_hydrogen_users_one.id;

        const addProfile = `
      mutation {
        insert_hydrogen_profiles_one(object: {email: "${email}", fullname: "${fullname}", user_id: ${user_id}, username: "${username}"}) {
          user_id
        }
      }
      `;
        this.client
          .request<{ insert_hydrogen_profiles_one: { user_id: number } }>(
            addProfile,
          )
          .then((res) => console.log(res, 'RESSSS2'));

        console.log(user_id, 'USERRR_IDDDD');

        return user_id;
      });

    return {
      user_id,
      fullname,
    };
  }

  @TrackedHasuraEventHandler({
    triggerName: 'user-created',
    tableName: 'users',
    definition: { type: 'insert' },
    schema: 'hydrogen',
  })
  async handleUserCreated(evt: HasuraInsertEvent<User>) {
    console.log('A new user was created!');
    console.log('User info:', evt.event.data.new);
    await this.mailService.sendUserConfirmation(
      evt.event.data.new,
      'emailToken',
    );
  }
}

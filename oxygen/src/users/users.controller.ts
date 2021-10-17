import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';

interface HasuraActionPayload<Input extends {} = {}, Session extends {} = {}> {
  action: {
    name: string;
  };
  input: Input;
  session_variables: Session;
}

export interface CreateProfileArgs {
  fullname: string;
  email: string;
  username: string;
  password: string;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('createProfile')
  async createProfile(
    @Body() payload: HasuraActionPayload<{ params: CreateProfileArgs }>,
  ) {
    return await this.usersService.createProfile(payload.input.params);
  }
}

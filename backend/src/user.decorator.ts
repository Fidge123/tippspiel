import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { env } from 'process';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user[env.AUTH0_AUDIENCE + '/user'];
  },
);

export interface User {
  username: string;
  name: string;
  nickname: string;
  email: string;
}

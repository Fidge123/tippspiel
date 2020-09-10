import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request;
  },
);

export interface User {
  username: string;
  name: string;
  nickname: string;
  email: string;
}

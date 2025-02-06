import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { User } from "../user/user.entity";

// @GetUser 데코레이터 만들기(커스텀)
export const GetUser = createParamDecorator((data, ctx: ExecutionContext): User => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
})
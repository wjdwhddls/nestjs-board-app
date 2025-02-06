import { Body, Controller, Logger, Post, Req, Res, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserRequestDto } from '../user/dto/create-user-request.dto';
import { SignInRequestDto } from './dto/sign-in-request.dto';
import { Response } from 'express';

@Controller('api/auth')
export class AuthController {
    private readonly logger = new Logger(AuthController.name);
    constructor(private authService: AuthService) {}

    // 로그인 기능
    @Post('/signin')
    async signIn(@Body() loginUserDto: SignInRequestDto, @Res() res:Response): Promise<void>{
        this.logger.verbose(`User with email: ${loginUserDto.email} is try to signing in`);

        const accessToken = await this.authService.signIn(loginUserDto);
        
        //[2] JWT를 헤더에 저장
        res.setHeader(`Authorization`, accessToken)


        res.send({message: "Login Success"});

        this.logger.verbose(`User with email: ${loginUserDto.email} issued JWT ${accessToken}`);
    }
}

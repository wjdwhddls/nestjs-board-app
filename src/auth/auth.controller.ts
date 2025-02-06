import { Body, Controller, Logger, Post, Req, Res, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpRequestDto } from './dto/sign-up-request.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { SignInRequestDto } from './dto/sign-in-request.dto';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { User } from './user.entity';
import { GetUser } from './get-user.decorator';

@Controller('api/auth')
export class AuthController {
    private readonly logger = new Logger(AuthController.name);
    constructor(private authService: AuthService) {}

    // 회원 가입 기능
    @Post('/signup')
    async createArticles(@Body() signupRequestDto: SignUpRequestDto): Promise<UserResponseDto> {
        this.logger.verbose(`Visitor is try to creating a new account with title: ${signupRequestDto.email}`);

        const userResponseDto = new UserResponseDto(await this.authService.createUser(signupRequestDto))
        
        this.logger.verbose(`New account email with ${userResponseDto.email} created Successfully `);
        return userResponseDto;
    }

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

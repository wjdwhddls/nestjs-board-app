import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('api/auth')
@UsePipes(ValidationPipe)
export class AuthController {
    constructor(private authService: AuthService) {}

    // 회원 가입 기능
    @Post('/signup')
    async createBoards(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
        const userResponseDto = new UserResponseDto(await this.authService.createUser(createUserDto))
        return userResponseDto;
    }

    // 로그인 기능
    @Post('/signin')
    async signIn(@Body() LoginUserDto: LoginUserDto){
        const message = this.authService.signIn(LoginUserDto);
        return message;
    }
}

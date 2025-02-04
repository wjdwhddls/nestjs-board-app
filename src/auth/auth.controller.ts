import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

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
}

import { Body, Controller, Logger, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserRequestDto } from './dto/create-user-request.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { AuthController } from 'src/auth/auth.controller';

@Controller('api/user')
export class UserController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly userService: UserService) {}

// 회원 가입 기능
    @Post('/')
    async createArticles(@Body() createUserRequestDto: CreateUserRequestDto): Promise<UserResponseDto> {
        this.logger.verbose(`Visitor is try to creating a new account with title: ${createUserRequestDto.email}`);

        const userResponseDto = new UserResponseDto(await this.userService.createUser(createUserRequestDto))
        
        this.logger.verbose(`New account email with ${userResponseDto.email} created Successfully `);
        return userResponseDto;
    }
}

import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException, Res, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserRequestDto } from '../user/dto/create-user-request.dto';
import { UserRole } from '../user/user-role.enum';
import * as bcrypt from 'bcryptjs';
import { SignInRequestDto } from './dto/sign-in-request.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    
    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ){}

    // 로그인 기능
    async signIn(signinRequestDto : SignInRequestDto): Promise<string> {
        this.logger.verbose(`User with email: ${signinRequestDto.email} is signing in`);

        const { email,password } = signinRequestDto;

        try{
            const existingUser = await this.userService.findUserByEmail(email);

            if(!existingUser || !(await bcrypt.compare(password, existingUser.password))){
                this.logger.error(`Invalid credentials`)
                throw new UnauthorizedException(`Invalid credentials`);
            }

            // [1] JWT 토큰생성
            const payload = {
                id: existingUser.id,
                email: existingUser.email,
                username: existingUser.username,
                role: existingUser.role
            };
            const accessToken = await this.jwtService.sign(payload);
            this.logger.verbose(`User with email: ${signinRequestDto.email} issued JWT ${accessToken}`);

            return accessToken;
        }catch(error){
            this.logger.error(`Invalid credentials or Internal Server error`)
            throw error;
        }

    }

}



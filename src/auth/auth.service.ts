import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException, Res, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SignUpRequestDto } from './dto/sign-up-request.dto';
import { UserRole } from './user-role.enum';
import * as bcrypt from 'bcryptjs';
import { SignInRequestDto } from './dto/sign-in-request.dto';
import { JwtService } from '@nestjs/jwt';
import { maxLength } from 'class-validator';
import { Response } from 'express';
import { AuthController } from './auth.controller';
@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService
    ){}

    // 회원 가입 기능
    async createUser(signupRequestDto: SignUpRequestDto):Promise<User>{
        this.logger.verbose(`Visitor is creating a new account with title: ${signupRequestDto.email}`);

        const { username, password, email, role} = signupRequestDto;

        // // 유효성 검사  
        if (!username || !password || !email || !role) {  
            throw new BadRequestException(`내용을 모두 입력해야 합니다.`);  
        }

        await this.checkEmailExist(email);

        const hashedPassword = await this.hashPassword(password);
            
        const newUser = this.userRepository.create({
            username, // author : createBoardDto.author
            password: hashedPassword,
            email,
            role: UserRole.USER,
        });
        const createdUser = await this.userRepository.save(newUser);

        this.logger.verbose(`New account email with ${createdUser.email} created Successfully `);
        return createdUser;
    }

    // 로그인 기능
    async signIn(signinRequestDto : SignInRequestDto): Promise<string> {
        this.logger.verbose(`User with email: ${signinRequestDto.email} is signing in`);

        const { email,password } = signinRequestDto;

        try{
            const existingUser = await this.findUserByEmail(email);

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

    async findUserByEmail(email: string): Promise<User> {
        const existingUser = await this.userRepository.findOne({ where: {email}});
        if(!existingUser){
            throw new NotFoundException(`User not found`);
        }
        return existingUser;
    }

    async checkEmailExist(email: string): Promise<void> {
        const existingUser = await this.userRepository.findOne({ where: {email}});
        if(existingUser){
            throw new ConflictException(`Email already exists`);
        }
    }

    async hashPassword(password: string): Promise<string>{
        const salt = await bcrypt.genSalt(); // 솔트생성
        return await bcrypt.hash(password, salt);
    }
}



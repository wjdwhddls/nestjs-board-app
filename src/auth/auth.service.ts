import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from './users-role.enum';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>
    ){}

    // 회원 가입 기능
    async createUser(createUserDto: CreateUserDto):Promise<User>{
        const { username, password, email, role} = createUserDto;

        // // 유효성 검사  
        if (!username || !password || !email || !role) {  
            throw new BadRequestException(`내용을 모두 입력해야 합니다.`);  
        }

        await this.checkEmailExist(email);
            
        const newUser: User = {
            id: 0, // 임시 초기화
            username, // author : createBoardDto.author
            password,
            email,
            role: UserRole.USER
        }
        const createUser = await this.userRepository.save(newUser);
        return createUser;
    }

    async checkEmailExist(email: string): Promise<void> {
        const existingUser = await this.userRepository.findOne({ where: {email}});
        if(existingUser){
            throw new ConflictException(`Email already exists`);
        }
    }
}



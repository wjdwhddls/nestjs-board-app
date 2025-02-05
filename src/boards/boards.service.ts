import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Board } from './boards.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardStatus } from './boards-status.enum';
import { CreateBoardDto } from './dto/create-board.dto';
import { BoardResponseDto } from './dto/board-response.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { User } from 'src/auth/users.entity';

@Injectable() 
export class BoardsService {
    // Repository 계층 DI 
    constructor(
        @InjectRepository(Board)
        private boardRepository : Repository<Board>
    ){}

    // 모든 게시글 조회 기능  
    async getAllBoards(): Promise<Board[]> {  
        const foundBoards = await this.boardRepository.find(); // 모든 게시글을 가져옴  
        return foundBoards;  
    } 

    // 로그인된 유저가 작성한 게시글 조회 기능  
    async getMyAllBoards(logginedUser: User): Promise<Board[]> {  
        //기본 조회에서는 엔터티를 즉시로딩으로 변경해야 User에 접근 할 수 있다.
        //const foundBoards = await this.boardRepository.findOneBy({user : logginedUser});

        // 쿼리 빌더를 통해 lazy loading 설정된 엔터티와 관계를 가진 엔터티(User) 명시적 접근이 가능하다
        const foundBoards = await this.boardRepository.createQueryBuilder('board')
            .leftJoinAndSelect('board.user','user') //사용자 정보를 조인(레이지 로딩 상태에서 User 추가 쿼리)
            .where('board.userId = :userId', {userId : logginedUser.id})
            .getMany();
        return foundBoards;  
    } 

    // 특정 게시글 조회기능
    async getBoardDetailById(id: number): Promise<Board>{
        const foundBoard = await this.boardRepository.createQueryBuilder('board')
            .leftJoinAndSelect('board.user','user')
            .where('board.id = :id', {id})
            .getOne();
        if(!foundBoard) {
            throw new NotFoundException(`Board with ID ${id} not found`);
        }
        return foundBoard;
    }

    //키워드(작성자)로 검색한 게시글 조회 기능
    async getBoardsByKeyword(author: string): Promise<Board[]> {
       const foundBoardKw = await this.boardRepository.findBy({ author: author}); 
       return foundBoardKw;
    }

    // 게시글 작성 기능
    async createBoard(createBoardDto: CreateBoardDto, logginedUser: User):Promise<Board>{
        const {title,contents} = createBoardDto;

        // // 유효성 검사  
        if (!title || !contents) {  
            throw new BadRequestException(`작성자, 제목, 그리고 내용을 모두 입력해야 합니다.`);  
        }
           
        const newboard = this.boardRepository.create({
            author: logginedUser.username, // author : createBoardDto.author
            title,
            contents,
            status: BoardStatus.PUBLIC,
            user: logginedUser
        });
        const createBoard = await this.boardRepository.save(newboard);
        return createBoard;
    } 

    // 게시글 삭제 기능  
    async deleteBoardById(id: number,logginedUser: User): Promise<void> {    
        const foundBoard = await this.getBoardDetailById(id);   
        // 작성자와 요청한 사용자가 같은지 확인
        if(foundBoard.user.id !== logginedUser.id){
            throw new UnauthorizedException('Do not have permission to delete this board')
        }

        await this.boardRepository.delete(foundBoard);  
    } 

    // 특정 번호의 게시글 일부 수정  
    async updateBoardStatusById(id: number, status: BoardStatus): Promise<void> {  
        const result = await this.boardRepository.update(id, { status })
        // 예외 처리: 현재 상태가 PUBLIC일 때는 PUBLIC으로, PRIVATE일 때는 PRIVATE으로 변경할 수 없음  
        if (result.affected === 0) {
            throw new NotFoundException(`Board with ID ${id} not found`);
        }    
    }  

    // 특정 번호의 게시글 수정
    async updateBoardById(id: number, updateBoardDto: UpdateBoardDto): Promise<Board> {
        const foundBoard = await this.getBoardDetailById(id); // 게시글 조회
        const { title, contents } = updateBoardDto; // DTO에서 데이터 추출
        if(!title || !contents){
            throw new BadRequestException("Title and contents must be provided");
        }

        // 게시글 속성 업데이트
        foundBoard.title = title;
        foundBoard.contents = contents;
        const updatedBoard = await this.boardRepository.save(foundBoard);
        return updatedBoard;
    }

}
    


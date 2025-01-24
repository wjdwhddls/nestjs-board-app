import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Board } from './boards.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardStatus } from './boards-status.enum';
import { CreateBoardDto } from './dto/create-board.dto';
import { BoardResponseDto } from './dto/board-response.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

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

    // 특정 게시글 조회기능
    async getBoardDetailById(id: number): Promise<Board>{
        const foundBoardId = await this.boardRepository.findOneBy({id : id});
        if(!foundBoardId) {
            throw new NotFoundException(`Board with ID ${id} not found`);
        }
        return foundBoardId;
    }

    //키워드(작성자)로 검색한 게시글 조회 기능
    async getBoardsByKeyword(author: string): Promise<Board[]> {
       const foundBoardKw = await this.boardRepository.findBy({ author: author}); 
       return foundBoardKw;
    }

    // 게시글 작성 기능
    async createBoard(createBoardDto: CreateBoardDto):Promise<Board>{
        const {author,title,contents} = createBoardDto;

        // // 유효성 검사  
        if (!author || !title || !contents) {  
            throw new BadRequestException(`작성자, 제목, 그리고 내용을 모두 입력해야 합니다.`);  
        }
           
        const newboard: Board = {
            id: 0, // 임시 초기화
            author, // author : createBoardDto.author
            title,
            contents,
            status: BoardStatus.PUBLIC
        }
        const createBoard = await this.boardRepository.save(newboard);
        return createBoard;
    } 

    // 게시글 삭제 기능  
    async deleteBoardById(id: number): Promise<void> {  
        // 게시글이 존재하는지 확인  
        const foundBoard = await this.getBoardDetailById(id);  
        if (!foundBoard) {  
            throw new NotFoundException(`Board with ID ${id} not found`);  
        }   
        await this.boardRepository.delete(id);  
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
    


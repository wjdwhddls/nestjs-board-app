import { BadRequestException, Injectable } from '@nestjs/common';
import { Board } from './boards.entity';
import { BoardStatus } from './boards-status.enum';
import { CreateBoardDto } from './dto/create-board.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable() 
export class BoardsService {
    // Repository 계층 DI 
    constructor(
        @InjectRepository(Board)
        private boardRepository : Repository<Board>
    ){}

    // 모든 게시글 조회 기능  
    async getAllBoards(): Promise<Board[]> {  
        const foundBoards = await this.boardRepository.findAll(); // 모든 게시글을 가져옴  
        return foundBoards;  
    } 
    // // 데이터베이스
    // private boards: Board[] = [];
    

    // // 게시글 조회 기능  
    // getAllBoards(): Board[] {  
    //     const foundBoards = this.boards; 
    //     if (foundBoards.length === 0) {  
    //         throw new NotFoundException('No boards found');   
    //     }  
    //     return foundBoards; // foundBoards 반환  
    // }

    // // 특정 게시글 조회 기능
    // getBoardDetailById(id: number): Board{
    //     const foundBoardId = this.boards.find((board) => board.id == id);
    //     if(!foundBoardId) {
    //         throw new NotFoundException(`Board with ID ${id} not found`);
    //     }
    //     return foundBoardId;
    // }

    // //키워드(작성자)로 검색한 게시글 조회 기능
    // getBoardsByKeyword(author: string): Board[] {
    //    const foundBoardKw = this.boards.filter((board) => board.author === author);
    //    if(foundBoardKw.length === 0){
    //         throw new NotFoundException(`Board with Keywod ${author} not found`); 
    //    } 
    //    return foundBoardKw;
    // }

    // 게시글 작성 기능
    async createBoard(createBoardDto: CreateBoardDto):Promise<string>{
        const {author,title,contents} = createBoardDto;

        // // 유효성 검사  
        if (!author || !title || !contents) {  
            throw new BadRequestException(`작성자, 제목, 그리고 내용을 모두 입력해야 합니다.`);  
        }
           
        const board: Board = {
            id: 0, // 임시 초기화
            author, // author : createBoardDto.author
            title,
            contents,
            status: BoardStatus.PUBLIC
        }

        const message = await this.boardRepository.saveBoard(board);
        return message;
    } 

//     // 게시글 삭제 기능  
//     deleteBoardById(id: number): void {  
//         // 게시글이 존재하는지 확인  
//         const boardExists = this.boards.find((board) => board.id == id);  
//         if (!boardExists) {  
//             throw new NotFoundException(`Board with ID ${id} not found`);  
//         }   
//         this.boards = this.boards.filter((board) => board.id != id);  
//     } 

//     // 특정 번호의 게시글 일부 수정  
//     updateBoardStatusById(id: number, status: BoardStatus): Board {  
//         const foundBoard = this.getBoardDetailById(id);  

//         // 예외 처리: 현재 상태가 PUBLIC일 때는 PUBLIC으로, PRIVATE일 때는 PRIVATE으로 변경할 수 없음  
//         if (foundBoard.status === BoardStatus.PUBLIC && status === BoardStatus.PUBLIC) {  
//             throw new BadRequestException('Cannot change status from PUBLIC to PUBLIC');  
//         }  

//         if (foundBoard.status === BoardStatus.PRIVATE && status === BoardStatus.PRIVATE) {  
//             throw new BadRequestException('Cannot change status from PRIVATE to PRIVATE');  
//         }  

//         foundBoard.status = status;   
//         return foundBoard;  
//     }  

//     // 특정 번호의 게시글 수정
//     updateBoardById(id: number, updateBoardDto: UpdateBoardDto): Board{  
//         const foundBoard = this.getBoardDetailById(id);
//         const {title, contents} = updateBoardDto;

//         if(!title || !contents){
//             throw new BadRequestException('Title and contents must be provided');
//         }
//         foundBoard.title = title;
//         foundBoard.contents = contents;

//         return foundBoard;

//     }
    
}

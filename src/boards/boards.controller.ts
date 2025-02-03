import { Body, Controller, Delete, Get, Param, Post, Query, Patch, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { Board } from './boards.entity';
import { BoardResponseDto } from './dto/board-response.dto';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { BoardStatus } from './boards-status.enum';
import { BoardStatusValidationPipe } from './pipes/board-status-validation.pipe';

@Controller('api/boards')
@UsePipes(ValidationPipe)
export class BoardsController {
    // 생성자 주입
    constructor(private boardsService: BoardsService){}

    // 게시글 조회 기능 
    @Get('/')
    async getAllBoards(): Promise<BoardResponseDto[]> {
        const boards: Board[] = await this.boardsService.getAllBoards();
        const boardsResponseDto = boards.map(board => new BoardResponseDto(board));
        return boardsResponseDto;
    }

    // 특정 게시글 조회 기능
    @Get('/:id')
    async getBoardById( @Param('id') id: number): Promise<BoardResponseDto> {
        const boardResponseDto = new BoardResponseDto(await this.boardsService.getBoardDetailById(id));
        return boardResponseDto;
    }

    //키워드(작성자)로 검색한 게시글 조회 기능
    @Get('/search/:keyword')
    async getBoardsByKeyword(@Query('author') author: string): Promise<BoardResponseDto[]> {
        const boards: Board[] =  await this.boardsService.getBoardsByKeyword(author);
        const boardsResponseDto = boards.map(board => new BoardResponseDto(board));
        return boardsResponseDto;
    }

    // 게시글 작성 기능
    @Post('/')
    async createBoards(@Body() createBoardDto: CreateBoardDto): Promise<BoardResponseDto> {
        const boardResponseDto = new BoardResponseDto(await this.boardsService.createBoard(createBoardDto))
        return boardResponseDto;
    }

    // 특정 번호의 게시글 수정
    @Put('/:id')
    async updateBoardById(
        @Param('id')id: number,
        @Body()updateBoardDto : UpdateBoardDto): Promise<BoardResponseDto>{
        const boardResponseDto = new BoardResponseDto(await this.boardsService.updateBoardById(id, updateBoardDto))

        return boardResponseDto;
    }

    // 특정 번호의 게시글 일부 수정
    @Patch('/:id')
    async updateBoardStatusById(
        @Param('id')id: number, 
        @Body('status', BoardStatusValidationPipe) status: BoardStatus): Promise<void>{
        return await this.boardsService.updateBoardStatusById(id, status);
    }

    // 게시글 삭제 기능
    @Delete('/:id')
    async deleteBoardById(@Param('id')id: number): Promise<void> {
        await this.boardsService.deleteBoardById(id);
    }
}

import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { Board } from './boards.entity';
import { CreateBoardDto } from './dto/create-board.dto';

@Controller('api/boards')
export class BoardsController {
    // 생성자 주입
    constructor(private boardsService: BoardsService){}

    // 게시글 조회 기능
    @Get('/')
    getAllBoards(): Board[] {
	    return this.boardsService.getAllBoards();
    }

    // 특정 게시글 조회 기능
    @Get('/:id')
    getBoardById(
        @Param('id') id: number): Board {
        return this.boardsService.getBoardDetailById(id);
    }

    // 게시글 작성 기능
    @Post('/')
    createBoard(
        @Body() createboardDto: CreateBoardDto) {
        return this.boardsService.createBoard(createboardDto);
    }
}

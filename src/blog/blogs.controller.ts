import { Body, Controller, Delete, Get, Param, Post, Query, Patch, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { Blog } from './blogs.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { BlogStatus } from './blogs-status.enum';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogStatusValidationPipe } from './pipes/blog-status-validation.pipe';

@Controller('api/blogs')
@UsePipes(ValidationPipe)
export class BlogsController {
    // 생성자 주입
    constructor(private blogsService: BlogsService){}

    // 블로그 조회 기능
    @Get('/')
    getAllBlogs(): Blog[] {
        return this.blogsService.getAllBlogs();
    }

    // 특정 블로그 조회 기능
    @Get('/:id')
    getBlogById( @Param('id') id: number): Blog {
        return this.blogsService.getBlogDetailById(id);
    }

    //키워드(작성자)로 검색한 블로그 조회 기능
    @Get('/search/:keyword')
    getBlogsByKeyword(@Query('author') author: string): Blog[] {
        return this.blogsService.getBlogsByKeyword(author);
    }

    // 블로그 작성 기능
    @Post('/')
    createBlog(
        @Body() createblogDto: CreateBlogDto) {
        return this.blogsService.createBlog(createblogDto);
    }

    // 특정 번호의 블로그 수정
    @Put('/:id')
    updateBlogById(
        @Param('id')id: number,
        @Body()updateBlogDto : UpdateBlogDto): Blog{
        return this.blogsService.updateBlogById(id, updateBlogDto)
    }
    // 특정 번호의 블로그 일부 수정
    @Patch('/:id')
    updateBlogStatusById(
        @Param('id')id: number, 
        @Body('status', BlogStatusValidationPipe) status: BlogStatus): Blog{
        return this.blogsService.updateBlogStatusById(id, status);
    }

    // 블로그 삭제 기능
    @Delete('/:id')
    deleteBlogById(@Param('id')id: number): void {
        this.blogsService.deleteBlogById(id);
    }

}

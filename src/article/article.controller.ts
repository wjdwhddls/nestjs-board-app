import { Body, Controller, Delete, Get, Param, Post, Query, Patch, Put, UsePipes, ValidationPipe, UseGuards, Logger } from '@nestjs/common';
import { ArticlesService } from './article.service';
import { Article } from './article.entity';
import { ArticleResponseDto } from './dto/article-response.dto';
import { CreateArticleRequestDto } from './dto/create-article-request.dto';
import { UpdateArticleRequestDto } from './dto/update-article-request.dto';
import { ArticleStatus } from './article-status.enum';
import { ArticleStatusValidationPipe } from './pipes/article-status-validation.pipe';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/custom-role.guard';
import { UserRole } from 'src/auth/user-role.enum';
import { Roles } from 'src/auth/roles.decorator';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';

@Controller('api/articles')
@UseGuards(AuthGuard(), RolesGuard)
export class ArticlesController {
    private readonly logger = new Logger(ArticlesController.name);
    // 생성자 주입
    constructor(private articlesService: ArticlesService){}

    // 게시글 작성 기능
    @Post('/')
    async createArticles(@Body() createArticleRequestDto: CreateArticleRequestDto, @GetUser() logginedUser: User): Promise<ArticleResponseDto> {
        this.logger.verbose(`User: ${logginedUser.username} is try to creating a new article with title: ${createArticleRequestDto.title}`);

        const articleResponseDto = new ArticleResponseDto(await this.articlesService.createArticle(createArticleRequestDto, logginedUser));

        this.logger.verbose(`Article title with ${articleResponseDto.title} created Successfully `);
        return articleResponseDto;
    }

    // 게시글 조회 기능 
    @Get('/')
    @Roles(UserRole.USER)  // 로그인유저가 USER만 접근 가능
    async getAllArticles(): Promise<ArticleResponseDto[]> {
        this.logger.verbose(`Try to Retrieving all Articles`);

        const articles: Article[] = await this.articlesService.getAllArticles();
        const articlesResponseDto = articles.map(article => new ArticleResponseDto(article));

        this.logger.verbose(`Retrieved all Articles Successfully`);
        return articlesResponseDto;
    }

    // 나의 게시글 조회 기능 (로그인 유저)
    @Get('/myarticles')
    @Roles(UserRole.USER)  // 로그인유저가 USER만 접근 가능
    async getMyAllArticles(@GetUser() logginedUser: User): Promise<ArticleResponseDto[]> {
        this.logger.verbose(`Try to Retrieving ${logginedUser.username}'s all Articles`);

        const articles: Article[] = await this.articlesService.getMyAllArticles(logginedUser);
        const articlesResponseDto = articles.map(article => new ArticleResponseDto(article));

        this.logger.verbose(`Retrieved ${logginedUser.username}'s all Articles Successfully`);
        return articlesResponseDto;
    }

    // 특정 게시글 조회 기능
    @Get('/:id')
    async getArticleById( @Param('id') id: number): Promise<ArticleResponseDto> {
        this.logger.verbose(`Try to Retrieving a article by id ${id}`);

        const articleResponseDto = new ArticleResponseDto(await this.articlesService.getArticleDetailById(id));

        this.logger.verbose(`Retrieved a article by id ${id} Successfully`);
        return articleResponseDto;
    }

    //키워드(작성자)로 검색한 게시글 조회 기능
    @Get('/search/:keyword')
    async getArticlesByKeyword(@Query('author') author: string): Promise<ArticleResponseDto[]> {
        this.logger.verbose(`Try to Retrieving articles by author ${author}`);

        const articles: Article[] =  await this.articlesService.getArticlesByKeyword(author);
        const articlesResponseDto = articles.map(article => new ArticleResponseDto(article));

        this.logger.verbose(`Retrieving articles by author ${author} Successfully`);
        return articlesResponseDto;
    }

    // 특정 번호의 게시글 수정
    @Put('/:id')
    async updateArticleById(
        @Param('id')id: number,
        @Body()updateArticleRequestDto : UpdateArticleRequestDto): Promise<ArticleResponseDto>{
        this.logger.verbose(`Try to updating a article by id: ${id} with updateArticleRequestDto`);

        const articleResponseDto = new ArticleResponseDto(await this.articlesService.updateArticleById(id, updateArticleRequestDto))

        this.logger.verbose(`updated a article by id: ${id} Successfully`);
        return articleResponseDto;
    }

    // 특정 번호의 게시글 일부 수정 <ADMIN 기능>
    @Patch('/:id')
    @Roles(UserRole.ADMIN)
    async updateArticleStatusById(
        @Param('id')id: number, 
        @Body('status', ArticleStatusValidationPipe) status: ArticleStatus): Promise<void>{
        this.logger.verbose(`ADMIN is trying to updating a article by id: ${id} with status: ${status}`);  

        await this.articlesService.updateArticleStatusById(id, status);

        this.logger.verbose(`updated a article's by ${id} status ${status} Successfully`);
    }

    // 게시글 삭제 기능
    @Delete('/:id')
    @Roles(UserRole.USER, UserRole.ADMIN) 
    async deleteArticleById(@Param('id')id: number, @GetUser() logginedUser: User): Promise<void> {
        this.logger.verbose(`USER: ${logginedUser.username} is trying to Deleting a article by id`);  

        await this.articlesService.deleteArticleById(id, logginedUser);

        this.logger.verbose(`Deleted a article by id Successfully`);
    }
}

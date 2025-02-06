import { BadRequestException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Article } from './article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleStatus } from './article-status.enum';
import { CreateArticleRequestDto } from './dto/create-article-request.dto';
import { ArticleResponseDto } from './dto/article-response.dto';
import { UpdateArticleRequestDto } from './dto/update-article-request.dto';
import { User } from 'src/user/user.entity';

@Injectable() 
export class ArticlesService {
    private readonly logger = new Logger(ArticlesService.name)
    // Repository 계층 DI 
    constructor(
        @InjectRepository(Article)
        private articleRepository : Repository<Article>
    ){}

     // 게시글 작성 기능
    async createArticle(createArticleRequestDto: CreateArticleRequestDto, logginedUser: User):Promise<Article>{
        this.logger.verbose(`User: ${logginedUser.username} is creating a new article with title: ${createArticleRequestDto.title}`);
        const {title,contents} = createArticleRequestDto;

        // // 유효성 검사  
        if (!title || !contents) {  
            this.logger.error(`Title, and contents must be provided`)
            throw new BadRequestException(`작성자, 제목, 그리고 내용을 모두 입력해야 합니다.`);  
        }
           
        const newarticle = this.articleRepository.create({
            author: logginedUser.username, // author : createArticleRequestDto.author
            title,
            contents,
            status: ArticleStatus.PUBLIC,
            user: logginedUser
        });
        const createArticle = await this.articleRepository.save(newarticle);
        this.logger.verbose(`Article title with ${createArticleRequestDto.title} created Successfully `);
        return createArticle;
    }

    // 모든 게시글 조회 기능  
    async getAllArticles(): Promise<Article[]> {  
        this.logger.verbose(`Retrieving all Articles`);

        const foundArticles = await this.articleRepository.find(); // 모든 게시글을 가져옴  

        this.logger.verbose(`Retrieved all Articles Successfully`);
        return foundArticles;  
    } 

    // 로그인된 유저가 작성한 게시글 조회 기능  
    async getMyAllArticles(logginedUser: User): Promise<Article[]> {  
        this.logger.verbose(`Retrieving ${logginedUser.username}'s all Articles`);

        // 쿼리 빌더를 통해 lazy loading 설정된 엔터티와 관계를 가진 엔터티(User) 명시적 접근이 가능하다
        const foundArticles = await this.articleRepository.createQueryBuilder('article')
            .leftJoinAndSelect('article.user','user') //사용자 정보를 조인(레이지 로딩 상태에서 User 추가 쿼리)
            .where('article.userId = :userId', {userId : logginedUser.id})
            .getMany();

        this.logger.verbose(`Retrieved ${logginedUser.username}'s all Articles Successfully`);
        return foundArticles;  
    } 

    // 특정 게시글 조회기능
    async getArticleDetailById(id: number): Promise<Article>{
        this.logger.verbose(`Retrieving a article by id ${id}`);

        const foundArticle = await this.articleRepository.createQueryBuilder('article')
            .leftJoinAndSelect('article.user','user')
            .where('article.id = :id', {id})
            .getOne();
        if(!foundArticle) {
            throw new NotFoundException(`Article with ID ${id} not found`);
        }

        this.logger.verbose(`Retrieved a article by id ${id} Successfully`);
        return foundArticle;
    }

    //키워드(작성자)로 검색한 게시글 조회 기능
    async getArticlesByKeyword(author: string): Promise<Article[]> {
        this.logger.verbose(`Retrieving articles by author ${author}`);

       const foundArticleKw = await this.articleRepository.findBy({ author: author}); 

       this.logger.verbose(`Retrieving articles by author ${author} Successfully`);
       return foundArticleKw;
    }
    
    // 특정 번호의 게시글 수정
    async updateArticleById(id: number, updateArticleRequestDto: UpdateArticleRequestDto): Promise<Article> {
        this.logger.verbose(`updating a article by id: ${id} with updateArticleRequestDto`);

        const foundArticle = await this.getArticleDetailById(id); // 게시글 조회
        const { title, contents } = updateArticleRequestDto; // DTO에서 데이터 추출
        if(!title || !contents){
            throw new BadRequestException("Title and contents must be provided");
        }

        // 게시글 속성 업데이트
        foundArticle.title = title;
        foundArticle.contents = contents;
        const updatedArticle = await this.articleRepository.save(foundArticle);

        this.logger.verbose(`updated a article by id: ${id} Successfully`);
        return updatedArticle;
    }

    // 특정 번호의 게시글 일부 수정  
    async updateArticleStatusById(id: number, status: ArticleStatus): Promise<void> {
        this.logger.verbose(`ADMIN is updating a article by id: ${id} with status: ${status}`);  

        const result = await this.articleRepository.update(id, { status })
        // 예외 처리: 현재 상태가 PUBLIC일 때는 PUBLIC으로, PRIVATE일 때는 PRIVATE으로 변경할 수 없음  
        if (result.affected === 0) {
            throw new NotFoundException(`Article with ID ${id} not found`);
        }    

        this.logger.verbose(`updated a article's by ${id} status ${status} Successfully`);
    }  

    // 게시글 삭제 기능  
    async deleteArticleById(id: number,logginedUser: User): Promise<void> {    
        this.logger.verbose(`USER: ${logginedUser.username} is Deleting a article by id`);  

        const foundArticle = await this.getArticleDetailById(id);   
        // 작성자와 요청한 사용자가 같은지 확인
        if(foundArticle.user.id !== logginedUser.id){
            throw new UnauthorizedException('Do not have permission to delete this article')
        }

        await this.articleRepository.delete(foundArticle);  

        this.logger.verbose(`Deleted a article by id Successfully`);
    } 


}
    


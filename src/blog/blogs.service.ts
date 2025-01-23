import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Blog } from './blogs.entity';
import { BlogStatus } from './blogs-status.enum';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Injectable() 
export class BlogsService {
    // 데이터베이스
    private blogs: Blog[] = [];
    

    // 블로그 조회 기능  
    getAllBlogs(): Blog[] {  
        const foundBlogs = this.blogs; 
        if (foundBlogs.length === 0) {  
            throw new NotFoundException('No blogs found');   
        }  
        return foundBlogs; // foundBlogs 반환  
    }

    // 특정 블로그 조회 기능
    getBlogDetailById(id: number): Blog{
        const foundBlogId = this.blogs.find((blog) => blog.id == id);
        if(!foundBlogId) {
            throw new NotFoundException(`Blog with ID ${id} not found`);
        }
        return foundBlogId;
    }

    //키워드(작성자)로 검색한 블로그 조회 기능
    getBlogsByKeyword(author: string): Blog[] {
       const foundBlogKw = this.blogs.filter((blog) => blog.author === author);
       if(foundBlogKw.length === 0){
            throw new NotFoundException(`Blog with Keywod ${author} not found`); 
       } 
       return foundBlogKw;
    }

    // 블로그 작성 기능
    createBlog(createblogDto: CreateBlogDto) {   //특수문자 x
        const {author, title, contents} = createblogDto;
        
        // 특수문자 검사 정규 표현식  
        const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;  

        // 예외 처리: 작성자에만 특수문자가 포함되어 있는지 확인  
        if (specialCharRegex.test(author)) {  
            throw new BadRequestException('Author must not contain special characters');  
        }  
        const blog: Blog = {
            id: this.blogs.length + 1, // 임시 Auto Increament 기능
            author,
            title,
            contents,
            status: BlogStatus.PUBLIC
        }

        this.blogs.push(blog);   
        return blog; 
    }

    // 블로그 삭제 기능  
    deleteBlogById(id: number): void {  
        // 블로그이 존재하는지 확인  
        const blogExists = this.blogs.find((blog) => blog.id == id);  
        if (!blogExists) {  
            throw new NotFoundException(`Blog with ID ${id} not found`);  
        }   
        this.blogs = this.blogs.filter((blog) => blog.id != id);  
    } 

    // 특정 번호의 블로그 일부 수정  
    updateBlogStatusById(id: number, status: BlogStatus): Blog {  
        const foundBlog = this.getBlogDetailById(id);  

        // 예외 처리: 현재 상태가 PUBLIC일 때는 PUBLIC으로, PRIVATE일 때는 PRIVATE으로 변경할 수 없음  
        if (foundBlog.status === BlogStatus.PUBLIC && status === BlogStatus.PUBLIC) {  
            throw new BadRequestException('Cannot change status from PUBLIC to PUBLIC');  
        }  

        if (foundBlog.status === BlogStatus.PRIVATE && status === BlogStatus.PRIVATE) {  
            throw new BadRequestException('Cannot change status from PRIVATE to PRIVATE');  
        }  

        foundBlog.status = status;   
        return foundBlog;  
    }  

    // 특정 번호의 블로그 수정
    updateBlogById(id: number, updateBlogDto: UpdateBlogDto): Blog{  
        const foundBlog = this.getBlogDetailById(id);
        const {title, contents} = updateBlogDto;

        if(!title || !contents){
            throw new BadRequestException('Title and contents must be provided');
        }
        foundBlog.title = title;
        foundBlog.contents = contents;

        return foundBlog;

    }
    
}

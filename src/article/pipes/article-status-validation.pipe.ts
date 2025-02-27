import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ArticleStatus } from '../article-status.enum';

@Injectable()
export class ArticleStatusValidationPipe implements PipeTransform {
    private statusOptions = [
        ArticleStatus.PRIVATE,
        ArticleStatus.PUBLIC
    ]

    transform(value: any, metadata: ArgumentMetadata) {
        console.log('Parameter Type: ', metadata.type);

        const status = this.normalizeValue(value); //입력값을 대문자 변환과 문자열로 반환
        if(!this.isStatusValid(status)){
            throw new BadRequestException(`${value} is not a valid status`)
        }
        return value;
    }

    private normalizeValue(value: any): string {
        return value.toUpperCase();
    }

    private isStatusValid(status: string): boolean {
        return this.statusOptions.includes(status as ArticleStatus)
    }
}
import { Module } from '@nestjs/common';
import { BoardsModule } from './boards/boards.module';
import { BlogsModule } from './blog/blogs.module';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig } from './configs/database.config';


@Module({
  imports: [
    ConfigModule.forRoot(),
    BoardsModule,
    BlogsModule
  ],
  controllers : [],
  providers: [
    {
      provide : 'DATABASE_CONFIG',
      useValue : databaseConfig
    }
  ],
  exports: ['DATABASE_CONFIG']
})
export class AppModule {}
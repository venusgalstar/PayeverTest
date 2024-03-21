import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { UserAvatar, UserAvatarSchema } from '../schemas/user.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: "userAvatar", schema: UserAvatarSchema }])],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
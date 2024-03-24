import { Controller, Delete, Get, Param, Post, Redirect } from '@nestjs/common';
import { ApiService } from './api.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('api')
export class ApiController {

    @MessagePattern('your_pattern')
    handleMessagePrinted(data: any): string {
        console.log(data.text);
        return 'Message received!';
    }

    constructor(private readonly apiService: ApiService) { }

    @Get('users')
    async getUsers() {
        return await this.apiService.getUsers();
    }

    @Get('user/:id')
    async getUser(@Param('id') id: number) {
        return await this.apiService.getUser(id);
    }

    @Get('user/:id/avatar')
    async getUserAvatar(@Param('id') id: number) {
        return await this.apiService.getUserAvatar(id);
    }

    @Delete('user/:id/avatar')
    async deleteUserAvatar(@Param('id') id: number) {
        return await this.apiService.deleteUserAvatar(id);
    }
}

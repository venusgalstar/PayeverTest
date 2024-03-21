import { Controller, Delete, Get, Param, Post, Redirect } from '@nestjs/common';
import { ApiService } from './api.service';

@Controller('api')
export class ApiController {

    constructor(private readonly apiService: ApiService){}

    @Get('users')
    getUsers() {
        console.log("Param");
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

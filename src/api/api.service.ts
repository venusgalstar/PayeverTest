import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserAvatar } from '../schemas/user.schema';
import { writeFileSync, mkdirSync, unlinkSync } from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { ClientProxyFactory, Transport, ClientProxy } from '@nestjs/microservices';

const streamPipeline = promisify(pipeline);

@Injectable()
export class ApiService {
    baseUrl = "https://reqres.in";
    outputPath = "./images";
    private client: ClientProxy;

    constructor(@InjectModel("userAvatar") private userAvatarModel: Model<UserAvatar>) {
        this.client = ClientProxyFactory.create({
            transport: Transport.RMQ,
            options: {
                urls: ['amqp://your_rabbitmq_user:your_rabbitmq_password@localhost:5672'],
                queue: 'your_queue_name',
                queueOptions: {
                    durable: false
                },
            },
        });
    }

    public async sendHello() {
        return this.client.send('your_pattern', { text: 'Hello RabbitMQ!' }).toPromise();
    }

    async getUsers() {

        let idxPage = 1;

        while (1) {
            const res = await fetch(`${this.baseUrl}/api/users?page=${idxPage}`)
                .then(response => response.text());

            const info = JSON.parse(res);

            let idxData = 0;

            for (idxData = 0; idxData < info.data.length; idxData++) {
                await this.saveUserAvatar(info.data[idxData]);
            }

            idxPage++;

            if (info.total_pages === idxPage)
                break;
        }
        return "ok";
    }

    async getUser(id: number) {
        console.log("Param", id);
        const res = await fetch(`${this.baseUrl}/api/users/${id}`)
            .then(response => response.text());
        console.log("res", res);
        return res;
    }

    async getImageBase64(url: string, fileName: string): Promise<string> {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        await writeFileSync(fileName, new Uint8Array(buffer));
        return Buffer.from(buffer).toString('base64');
    }

    async deleteUserAvatar(id: number) {
        const data = await this.userAvatarModel.find({ id: id }).exec();
        if (data.length === 0) {
            return "";
        } else {
            unlinkSync(data[0].filename);
            this.userAvatarModel.deleteOne({ id: id }).exec();
        }
    }

    getFilenameFromUrl(url: string) {
        return url.substring(url.lastIndexOf('/') + 1);
    }

    async saveUserAvatar(res: any) {
        try {
            mkdirSync(this.outputPath, { recursive: true });
            console.log(`Directory created at ${this.outputPath}`);
        } catch (error) {
            console.error(`Error creating directory: ${error}`);
        }

        const fileName = this.outputPath + "/" + Date.now() + this.getFilenameFromUrl(res.avatar);
        const imageData = await this.getImageBase64(res.avatar, fileName);

        const newDoc = new UserAvatar();
        newDoc.id = res.id;
        newDoc.avatar = imageData;
        newDoc.filename = fileName;
        this.userAvatarModel.insertMany(newDoc);
    }
    
    async getUserAvatar(id: number) {

        const data = await this.userAvatarModel.find({ id: id }).exec();
        console.log("data", data);

        let res;

        if (data.length === 0) {
            res = await fetch(`${this.baseUrl}/api/users/${id}`)
                .then(response => response.text());
            res = JSON.parse(res);

            res = await this.saveUserAvatar(res.data);
        } else {
            res = data[0].avatar;
        }

        return res;
    }
}

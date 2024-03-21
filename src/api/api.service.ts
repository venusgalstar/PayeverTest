import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserAvatar } from '../schemas/user.schema';
import { writeFileSync, createWriteStream, mkdirSync, unlinkSync } from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
const streamPipeline = promisify(pipeline);

@Injectable()
export class ApiService {
    baseUrl = "https://reqres.in";
    outputPath = "./images";

    constructor(@InjectModel("userAvatar") private userAvatarModel: Model<UserAvatar>) { }

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
        }
    }

    getFilenameFromUrl(url: string) {
        return url.substring(url.lastIndexOf('/') + 1);
    }

    async getUserAvatar(id: number) {

        const data = await this.userAvatarModel.find({ id: id }).exec();
        console.log("data", data);

        let res;

        if (data.length === 0) {
            res = await fetch(`${this.baseUrl}/api/users/${id}`)
                .then(response => response.text());
            res = JSON.parse(res);
            console.log("res.data", res);

            try {
                mkdirSync(this.outputPath, { recursive: true });
                console.log(`Directory created at ${this.outputPath}`);
            } catch (error) {
                console.error(`Error creating directory: ${error}`);
            }

            const fileName = this.outputPath + "/" + Date.now() + this.getFilenameFromUrl(res.data.avatar);
            const imageData = await this.getImageBase64(res.data.avatar, fileName);

            const newDoc = new UserAvatar();
            newDoc.id = id;
            newDoc.avatar = imageData;
            newDoc.filename = fileName;
            this.userAvatarModel.insertMany(newDoc);

            res = imageData;
        } else {
            res = data[0].avatar;
        }

        return res;
    }
}

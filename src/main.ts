import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://your_rabbitmq_user:your_rabbitmq_password@localhost:5672'],
      queue: 'your_queue_name',
      queueOptions: {
        durable: false
      },
    },
  });

  await app.startAllMicroservices();

  await app.listen(3000);
}
bootstrap();

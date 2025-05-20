import { Module } from '@nestjs/common';
import { OrderItemsService } from './order-items.service';
import { OrderItemsController } from './order-items.controller';
import { OrderItem, OrderItemSchema } from './schemas/order-item.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OrderItem.name, schema: OrderItemSchema },
    ]),
  ],
  controllers: [OrderItemsController],
  providers: [OrderItemsService],
  exports: [OrderItemsService],
})
export class OrderItemsModule {}

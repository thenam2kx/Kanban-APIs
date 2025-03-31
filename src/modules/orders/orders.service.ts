import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
import { SoftDeleteModel } from 'mongoose-delete';
import { InjectModel } from '@nestjs/mongoose';
import { IUser } from '../users/users.interface';
import isValidMongoId from 'src/utils/validate.mongoid';
import aqp from 'api-query-params';
import {
  OrderItem,
  OrderItemDocument,
} from '../order-items/schemas/order-item.schema';
import { ClientSession } from 'mongoose';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: SoftDeleteModel<OrderDocument>,
    @InjectModel(OrderItem.name)
    private orderItemModel: SoftDeleteModel<OrderItemDocument>,
  ) {}

  // ====================================== //
  // ========== HELPER FUNCTIONS ========== //
  // ====================================== //

  /**
   * Validates if a MongoDB ObjectId is valid.
   * @param id - The ID to validate.
   * @throws BadRequestException if the ID is invalid.
   */
  private validateMongoId(id: string): void {
    if (!isValidMongoId(id)) {
      throw new BadRequestException('Invalid ID format.');
    }
  }

  /**
   * Extracts metadata from the authenticated user.
   * @param user - The authenticated user.
   * @returns An object containing the user's ID and email.
   */
  private getUserMetadata(user: IUser): { _id: string; email: string } {
    return { _id: user._id, email: user.email };
  }

  // ====================================== //
  // ========== CRUD FUNCTIONS ========== //
  // ====================================== //

  /**
   * Create a new order
   * @param createOrderDto - Data transfer object containing order details
   * @param userId - ID of the authenticated user creating the order
   * @returns Newly created order document
   * @throws BadRequestException if validation fails
   */
  async create(createOrderDto: CreateOrderDto, user: IUser) {
    // Start a transaction session
    const session: ClientSession = await this.orderModel.db.startSession();

    try {
      session.startTransaction();

      // Calculate total price from items
      const totalPrice = createOrderDto.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      const discount = createOrderDto.discount || 0;

      // Validate totalPrice matches the calculated value
      if (Math.abs(totalPrice - discount - createOrderDto.totalPrice) > 0.01) {
        throw new BadRequestException(
          'Total price does not match item calculations',
        );
      }

      const orderItems = await this.orderItemModel.insertMany(
        createOrderDto.items.map((item) => ({
          ...item,
          createdBy: this.getUserMetadata(user),
        })),
        { session },
      );
      console.log('🚀 ~ OrdersService ~ create ~ orderItems:', orderItems);

      const createOrder = await this.orderModel.create(
        [
          {
            // ...createOrderDto,
            // createdBy: this.getUserMetadata(user),
            // totalPrice: totalPrice - discount,
            // discount: discount,
            ...createOrderDto,
            items: orderItems.map((item) => item._id),
            totalPrice: totalPrice - discount,
            discount,
            createdBy: this.getUserMetadata(user),
          },
        ],
        { session },
      );

      // Commit the transaction
      await session.commitTransaction();
      return createOrder;
    } catch (error) {
      // Rollback the transaction if any error occurs
      await session.abortTransaction();
      throw error; // Re-throw the error to be handled by the controller
    } finally {
      // End the session
      session.endSession();
    }
  }

  /**
   * Retrieves a paginated list of order, grouped by module.
   * @param currentPage - The current page number.
   * @param limit - Number of items per page.
   * @param qs - Query string for filtering, sorting, population, and projection.
   * @returns An object containing pagination metadata and grouped permission results.
   */
  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;

    // Optimize by running count and find in parallel
    const [totalItems, result] = await Promise.all([
      this.orderModel.countDocuments(filter).exec(),
      this.orderModel
        .find(filter)
        .skip(offset)
        .limit(defaultLimit)
        .sort(sort as any)
        .populate(
          population
            ? population
            : [
                { path: 'userId', select: 'email fullname' },
                {
                  path: 'items',
                  select: 'productId variantId quantity price imageUrl',
                },
              ],
        )
        .select(projection as any)
        .lean()
        .exec(),
    ]);

    const totalPages = Math.ceil(totalItems / defaultLimit);

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems,
      },
      result,
    };
  }

  /**
   * Retrieves a single order by ID.
   * @param id - The order's ID.
   * @returns The order document.
   * @throws BadRequestException if the ID is invalid.
   */
  async findOne(id: string) {
    this.validateMongoId(id);

    const order = await this.orderModel
      .findById(id)
      .populate('userId', 'email name')
      .populate('items', 'productId variantId quantity price imageUrl')
      .lean()
      .exec();
    if (!order) throw new NotFoundException(`Order with ID ${id} not found`);
    return order;
  }

  /**
   * Updates an existing order.
   * @param id - The order's ID.
   * @param updateOrderDto - Data transfer object containing updated order details.
   * @param user - The authenticated user performing the action.
   * @returns The updated order document.
   * @throws BadRequestException if the ID is invalid, order does not exist, or updated apiPath + method already exists.
   */
  // async update(id: string, updateOrderDto: UpdateOrderDto, user: IUser) {
  //   const order = await this.orderModel.findOne({ _id: id }).exec();
  //   if (!order) throw new NotFoundException(`Order with ID ${id} not found`);

  //   if (updateOrderDto.items && order.status !== OrderStatus.PENDING) {
  //     throw new BadRequestException(
  //       'Cannot modify items after order processing begins',
  //     );
  //   }

  //   if (updateOrderDto.items) {
  //     const totalPrice = updateOrderDto.items.reduce(
  //       (sum, item) => sum + item.price * item.quantity,
  //       0,
  //     );
  //     updateOrderDto.totalPrice =
  //       totalPrice - (updateOrderDto.discount || order.discount || 0);
  //   }

  //   return await this.orderModel.findByIdAndUpdate(
  //     { _id: id },
  //     {
  //       ...updateOrderDto,
  //       updatedBy: this.getUserMetadata(user),
  //     },
  //     { new: true, runValidators: true },
  //   );
  // }

  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
    user: IUser,
  ): Promise<Order> {
    // Start a transaction session
    const session: ClientSession = await this.orderModel.db.startSession();

    try {
      session.startTransaction();

      // Find the existing order
      const existingOrder = await this.orderModel
        .findById({ _id: id })
        .session(session)
        .exec();
      if (!existingOrder) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      // Calculate total price if items are provided in the update
      let totalPrice = existingOrder.totalPrice + (existingOrder.discount || 0);
      let orderItems = existingOrder.items;

      if (updateOrderDto.items && updateOrderDto.items.length > 0) {
        // Calculate new total price from updated items
        totalPrice = updateOrderDto.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );

        // Delete old OrderItems and create new ones
        await this.orderItemModel.deleteMany(
          { _id: { $in: existingOrder.items } },
          { session },
        );

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        orderItems = await this.orderItemModel.insertMany(
          updateOrderDto.items.map((item) => ({
            ...item,
            createdBy: this.getUserMetadata(user),
            updatedBy: this.getUserMetadata(user),
          })),
          { session },
        );
      }

      const discount = updateOrderDto.discount ?? existingOrder.discount ?? 0;

      // Validate totalPrice matches the calculated value if provided
      if (
        updateOrderDto.totalPrice !== undefined &&
        Math.abs(totalPrice - discount - updateOrderDto.totalPrice) > 0.01
      ) {
        throw new BadRequestException(
          'Total price does not match item calculations',
        );
      }

      // Update the Order
      const updatedOrder = await this.orderModel
        .findByIdAndUpdate(
          id,
          {
            ...updateOrderDto,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            items: orderItems.map((item) => item._id),
            totalPrice: totalPrice - discount,
            discount,
            updatedBy: this.getUserMetadata(user),
          },
          { new: true, runValidators: true, session },
        )
        .lean()
        .exec();

      if (!updatedOrder) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      // Commit the transaction
      await session.commitTransaction();
      return updatedOrder;
    } catch (error) {
      // Rollback the transaction if any error occurs
      await session.abortTransaction();
      throw error; // Re-throw để controller xử lý
    } finally {
      // End the session
      session.endSession();
    }
  }

  /**
   * Soft deletes a order.
   * @param id - The order's ID.
   * @param user - The authenticated user performing the action.
   * @returns The delete operation result.
   * @throws BadRequestException if the ID is invalid or order does not exist.
   */
  async remove(id: string, user: IUser) {
    // Start a transaction session
    const session: ClientSession = await this.orderModel.db.startSession();

    try {
      session.startTransaction();

      const order = await this.orderModel
        .findOne({ _id: id })
        .session(session)
        .exec();
      if (!order) throw new NotFoundException(`Order with ID ${id} not found`);

      // Check if the order is already deleted
      if (order.status === OrderStatus.DELIVERED) {
        throw new BadRequestException('Cannot delete a delivered order');
      }

      // Check if the order is already deleted
      if (order.isPaid) {
        throw new BadRequestException('Cannot delete a paid order');
      }

      // Delete all order items associated with the order
      await Promise.all(
        order.items.map(async (itemId) => {
          const orderItem = await this.orderItemModel
            .findById(itemId)
            .session(session)
            .exec();
          if (orderItem) {
            await this.orderItemModel.updateOne(
              { _id: itemId },
              { deletedBy: this.getUserMetadata(user) },
              { session },
            );
            await this.orderItemModel.delete({ _id: itemId });
          }
        }),
      );

      // Update the order to mark it as deleted
      await this.orderItemModel.updateOne(
        { _id: id },
        { updatedBy: this.getUserMetadata(user) },
        { session },
      );

      // Delete the order
      const result = await this.orderModel.delete({ _id: id });

      // Commit the transaction
      await session.commitTransaction();

      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      // End the session
      session.endSession();
    }
  }
}

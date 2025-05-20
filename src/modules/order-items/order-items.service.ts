import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { OrderItem, OrderItemDocument } from './schemas/order-item.schema';
import { SoftDeleteModel } from 'mongoose-delete';
import { InjectModel } from '@nestjs/mongoose';
import { IUser } from '../users/users.interface';
import aqp from 'api-query-params';
import {
  getUserMetadata,
  isExistObject,
  isValidObjectId,
} from 'src/utils/utils';

@Injectable()
export class OrderItemsService {
  constructor(
    @InjectModel(OrderItem.name)
    private orderItemModel: SoftDeleteModel<OrderItemDocument>,
  ) {}

  // ====================================== //
  // ========== CRUD FUNCTIONS ========== //
  // ====================================== //

  /**
   * Create a new order
   * @param createOrderItemDto - Data transfer object containing order details
   * @param user - User creating the order
   * @returns Newly created order document
   */
  async create(createOrderItemDto: CreateOrderItemDto, user: IUser) {
    return await this.orderItemModel.create({
      ...createOrderItemDto,
      createdBy: getUserMetadata(user),
    });
  }

  /**
   * Retrieves a paginated list of order item, grouped by module.
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
      this.orderItemModel.countDocuments(filter).exec(),
      this.orderItemModel
        .find(filter)
        .skip(offset)
        .limit(defaultLimit)
        .sort(sort as any)
        .populate(population)
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
   * Retrieves a single order item by ID.
   * @param id - The order item's ID.
   * @returns The order item document.
   * @throws BadRequestException if the ID is invalid.
   */
  async findOne(id: string) {
    await isValidObjectId(id);

    const result = await this.orderItemModel.findById(id).lean().exec();
    if (!result) {
      throw new BadRequestException('Order item not found');
    }

    return result;
  }

  /**
   * Updates an existing order item.
   * @param id - The order item's ID.
   * @param updateOrderItemDto - Data transfer object containing updated order item details.
   * @param user - The authenticated user performing the action.
   * @returns The updated order item document.
   * @throws BadRequestException if the ID is invalid, order item does not exist, or updated apiPath + method already exists.
   */
  async update(
    id: string,
    updateOrderItemDto: UpdateOrderItemDto,
    user: IUser,
  ) {
    await isValidObjectId(id);

    await isExistObject(
      this.orderItemModel,
      { _id: id },
      {
        checkExisted: false,
        errorMessage: 'Sản phẩm trong đơn hàng không tồn tại!',
      },
    );

    return await this.orderItemModel.findByIdAndUpdate(
      { _id: id },
      {
        ...updateOrderItemDto,
        updatedBy: getUserMetadata(user),
      },
      { new: true, runValidators: true },
    );
  }

  /**
   * Soft deletes a order item.
   * @param id - The order item's ID.
   * @param user - The authenticated user performing the action.
   * @returns The delete operation result.
   * @throws BadRequestException if the ID is invalid or order item does not exist.
   */
  async remove(id: string, user: IUser) {
    await isValidObjectId(id);

    await this.orderItemModel.updateOne(
      { _id: id },
      {
        deletedBy: getUserMetadata(user),
      },
    );

    // Sử dụng phương thức delete của mongoose-delete
    return await this.orderItemModel.delete({ _id: id });
  }
}

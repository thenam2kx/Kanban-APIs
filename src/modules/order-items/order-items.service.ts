import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { OrderItem, OrderItemDocument } from './schemas/order-item.schema';
import { SoftDeleteModel } from 'mongoose-delete';
import { InjectModel } from '@nestjs/mongoose';
import isValidMongoId from 'src/utils/validate.mongoid';
import { IUser } from '../users/users.interface';
import aqp from 'api-query-params';

@Injectable()
export class OrderItemsService {
  constructor(
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
   * @param createOrderItemDto - Data transfer object containing order details
   * @param user - User creating the order
   * @returns Newly created order document
   */
  async create(createOrderItemDto: CreateOrderItemDto, user: IUser) {
    return await this.orderItemModel.create({
      ...createOrderItemDto,
      createdBy: this.getUserMetadata(user),
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
    this.validateMongoId(id);

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
    const order = await this.orderItemModel.findOne({ _id: id }).exec();
    if (!order) throw new NotFoundException(`Order with ID ${id} not found`);

    return await this.orderItemModel.findByIdAndUpdate(
      { _id: id },
      {
        ...updateOrderItemDto,
        updatedBy: this.getUserMetadata(user),
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
    const order = await this.orderItemModel.findOne({ _id: id }).exec();
    if (!order) {
      throw new BadRequestException('Order item not found');
    }

    await this.orderItemModel.updateOne(
      { _id: id },
      {
        deletedBy: this.getUserMetadata(user),
      },
    );

    // Sử dụng phương thức delete của mongoose-delete
    return await this.orderItemModel.delete({ _id: id });
  }
}

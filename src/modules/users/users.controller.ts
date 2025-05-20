import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from './users.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Creates a new user.
   * @param createUserDto - Data transfer object containing user creation details.
   * @param user - The authenticated user performing the action.
   * @returns The created user document.
   */
  @Post()
  @ResponseMessage('Tạo người dùng mới thành công')
  create(@Body() createUserDto: CreateUserDto, @User() user: IUser) {
    return this.usersService.create(createUserDto, user);
  }

  /**
   * Retrieves a paginated list of users.
   * @param currentPage - The current page number (converted to number).
   * @param limit - Number of items per page (converted to number).
   * @param qs - Query string for filtering, sorting, and population.
   * @returns An object containing pagination metadata and user results.
   */
  @Get()
  @ResponseMessage('Lấy danh sách người dùng thành công')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.usersService.findAll(+currentPage, +limit, qs);
  }

  /**
   * Retrieves a single user by ID.
   * @param id - The user's ID.
   * @returns The user document.
   */
  @Get(':id')
  @ResponseMessage('Lấy thông tin người dùng thành công')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * Updates a user's details.
   * @param id - The user's ID.
   * @param updateUserDto - Data transfer object containing updated user details.
   * @param user - The authenticated user performing the action.
   * @returns The update operation result.
   */
  @Patch(':id')
  @ResponseMessage('Cập nhật thông tin người dùng thành công')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @User() user: IUser,
  ) {
    return this.usersService.update(id, updateUserDto, user);
  }

  /**
   * Deletes a user by ID.
   * @param id - The user's ID.
   * @param user - The authenticated user performing the action.
   * @returns The delete operation result.
   */
  @Delete(':id')
  @ResponseMessage('Xóa người dùng thành công')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.usersService.remove(id, user);
  }
}

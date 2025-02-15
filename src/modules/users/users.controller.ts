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
import { CreateUserDto, UpdateRoleUSerDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from './users.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ====================================================================== //
  // APIs Management Users
  // ====================================================================== //
  @Post()
  @ResponseMessage('Tạo người dùng mới thành công')
  create(@Body() createUserDto: CreateUserDto, @User() user: IUser) {
    return this.usersService.create(createUserDto, user);
  }

  @Get()
  @ResponseMessage('Lấy danh sách người dùng thành công')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.usersService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage('Lấy thông tin người dùng thành công')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật thông tin người dùng thành công')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @User() user: IUser,
  ) {
    return this.usersService.update(id, updateUserDto, user);
  }

  @Patch(':id/block')
  @ResponseMessage('Tài khoản đã bị chặn thành công!')
  blockUser(@Param('id') id: string, @User() user: IUser) {
    return this.usersService.handleBlock(id, user);
  }

  @Patch(':id/unblock')
  @ResponseMessage('Tài khoản đã bị chặn thành công!')
  unBlockUser(@Param('id') id: string, @User() user: IUser) {
    return this.usersService.handleUnBlock(id, user);
  }

  @Delete(':id')
  @ResponseMessage('Xóa người dùng thành công')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.usersService.remove(id, user);
  }

  // ====================================================================== //
  // APIs Management Roles & Permissions
  // ====================================================================== //

  @Patch(':id/role')
  @ResponseMessage('Cập nhật vai trò người dùng thành công!')
  updateRoleUser(
    @Param('id') id: string,
    @Body() updateRoleUSerDto: UpdateRoleUSerDto,
    @User() user: IUser,
  ) {
    return this.usersService.handleUpdateRoleUser(id, updateRoleUSerDto, user);
  }
}

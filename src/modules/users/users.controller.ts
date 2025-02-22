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
import {
  CreateUserDto,
  UpdateAvatarUSerDto,
  UpdateRoleUSerDto,
} from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from './users.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ====================================================================== //
  // APIs Create Users
  // ====================================================================== //
  @Post()
  @ResponseMessage('Tạo người dùng mới thành công')
  create(@Body() createUserDto: CreateUserDto, @User() user: IUser) {
    return this.usersService.create(createUserDto, user);
  }

  // ====================================================================== //
  // APIs Fetch Users
  // ====================================================================== //
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

  // ====================================================================== //
  // APIs Update Users
  // ====================================================================== //
  @Patch(':id')
  @ResponseMessage('Cập nhật thông tin người dùng thành công')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @User() user: IUser,
  ) {
    return this.usersService.update(id, updateUserDto, user);
  }

  @Patch(':id/role')
  @ResponseMessage('Cập nhật vai trò người dùng thành công!')
  updateRoleUser(
    @Param('id') id: string,
    @Body() updateRoleUSerDto: UpdateRoleUSerDto,
    @User() user: IUser,
  ) {
    return this.usersService.handleUpdateRoleUser(id, updateRoleUSerDto, user);
  }

  @Patch(':id/avatar')
  @ResponseMessage('Cập nhật ảnh đại diện thành công!')
  updateAvatarUser(
    @Param('id') id: string,
    @Body() updateAvatarUSerDto: UpdateAvatarUSerDto,
    @User() user: IUser,
  ) {
    return this.usersService.handleUpdateAvatarUser(
      id,
      updateAvatarUSerDto,
      user,
    );
  }

  // ====================================================================== //
  // APIs Delete Users
  // ====================================================================== //

  @Delete(':id')
  @ResponseMessage('Xóa người dùng thành công')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.usersService.remove(id, user);
  }

  @Post('seed')
  @ResponseMessage('Seed dữ liệu thành công')
  seedUsers() {
    return this.usersService.seedUsers();
  }
}

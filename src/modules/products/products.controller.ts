import {
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Controller,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from '../users/users.interface';
import { CreateVariantDto } from './dto/create-variant.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ResponseMessage('Tạo sản phẩm thành công!')
  create(@Body() createProductDto: CreateProductDto, @User() user: IUser) {
    return this.productsService.create(createProductDto, user);
  }

  @Post(':id/variants/create')
  @ResponseMessage('Tạo biến thể thành công!')
  createVariant(
    @Param('id') id: string,
    @Body() createVariantDto: CreateVariantDto,
    @User() user: IUser,
  ) {
    return this.productsService.createVariant(id, createVariantDto, user);
  }

  @Get()
  @ResponseMessage('Lấy danh sách sản phẩm thành công!')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.productsService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage('Lấy thông tin sản phẩm thành công!')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật sản phẩm thành công!')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @User() user: IUser,
  ) {
    return this.productsService.update(id, updateProductDto, user);
  }

  @Patch(':id/variants/:variantId')
  @ResponseMessage('Cập nhật biến thể thành công!')
  updateVariant(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @Body() createVariantDto: CreateVariantDto,
    @User() user: IUser,
  ) {
    return this.productsService.updateVariant(
      id,
      variantId,
      createVariantDto,
      user,
    );
  }

  @Delete(':id')
  @ResponseMessage('Xóa sản phẩm thành công!')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.productsService.remove(id, user);
  }

  @Delete(':id/variants/:variantId')
  @ResponseMessage('Xóa biến thể thành công!')
  removeVariant(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @User() user: IUser,
  ) {
    return this.productsService.removeVariant(id, variantId, user);
  }
}

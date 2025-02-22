import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getModelToken } from '@nestjs/mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { BadRequestException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { IUser } from '../users/users.interface';
import { SoftDeleteModel } from 'mongoose-delete';

describe('ProductsService', () => {
  let service: ProductsService;
  let productModel: SoftDeleteModel<ProductDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getModelToken(Product.name),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            countDocuments: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            findOneAndUpdate: jest.fn(),
            updateOne: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productModel = module.get<SoftDeleteModel<ProductDocument>>(
      getModelToken(Product.name),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw an error if product already exists', async () => {
      jest.spyOn(productModel, 'findOne').mockResolvedValueOnce(true as any);
      const createProductDto: CreateProductDto = {
        name: 'Test Product',
      } as any;
      const user: IUser = { _id: '1', email: 'test@example.com' } as any;

      await expect(service.create(createProductDto, user)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create a new product', async () => {
      jest.spyOn(productModel, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(productModel, 'create').mockResolvedValueOnce({} as any);
      const createProductDto: CreateProductDto = {
        name: 'Test Product',
      } as any;
      const user: IUser = { _id: '1', email: 'test@example.com' } as any;

      const result = await service.create(createProductDto, user);
      expect(result).toEqual({});
    });
  });

  // Add more tests for other methods...
});

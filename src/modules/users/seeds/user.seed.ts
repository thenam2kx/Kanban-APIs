import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'mongoose-delete';
import { User, UserDocument } from '../schemas/user.schema';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserSeeder {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: SoftDeleteModel<UserDocument>,
  ) {}

  async seedUsers(count = 10000): Promise<void> {
    const users = [];

    for (let i = 0; i < count; i++) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Test@1234', salt);

      users.push({
        fullname: faker.person.fullName(),
        email: faker.internet.email(),
        phone: this.generateVietnamesePhoneNumber(),
        password: hashedPassword,
      });
    }

    await this.userModel.insertMany(users);
    console.log(`✅ Đã chèn ${count} user vào MongoDB`);
  }

  private generateVietnamesePhoneNumber(): string {
    const prefixes = [
      '032',
      '033',
      '034',
      '035',
      '036',
      '037',
      '038',
      '039',
      '052',
      '056',
      '058',
      '059',
      '070',
      '076',
      '077',
      '078',
      '079',
      '081',
      '082',
      '083',
      '084',
      '085',
      '086',
      '087',
      '088',
      '089',
      '090',
      '091',
      '092',
      '093',
      '094',
      '095',
      '096',
      '097',
      '098',
      '099',
    ];
    const prefix = faker.helpers.arrayElement(prefixes);
    const suffix = faker.string.numeric(7);
    return prefix + suffix;
  }
}

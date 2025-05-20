import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Permission } from 'src/modules/permissions/schemas/permission.schema';

@Schema({ timestamps: true, versionKey: false })
export class Role {
  @Prop({
    required: true,
    enum: ['SUPER_ADMIN', 'ADMIN', 'PARTNER', 'EMPLOYEE', 'USER'],
    default: 'USER',
  })
  name: string;

  @Prop()
  description: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: Permission.name })
  permissions: Permission[];

  @Prop({ type: Object })
  createdBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object })
  updatedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object })
  deletedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };
}

export type RoleDocument = HydratedDocument<Role>;
export const RoleSchema = SchemaFactory.createForClass(Role);

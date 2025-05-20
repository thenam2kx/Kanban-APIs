import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { FilterQuery, HydratedDocument } from 'mongoose';
import { SoftDeleteModel } from 'mongoose-delete';
import { IUser } from 'src/modules/users/users.interface';

/**
 * Extracts metadata from the authenticated user.
 * @param user - The authenticated user.
 * @returns An object containing the user's ID and email.
 */
export const getUserMetadata = (
  user: IUser,
): { _id: string; email: string } => {
  return { _id: user._id, email: user.email };
};

// =============================================== //
// =============================================== //
// =============================================== //

/**
 * Validates if a MongoDB ObjectId is valid.
 * @param id - The ID to validate.
 * @throws BadRequestException if the ID is invalid.
 */
export const isValidObjectId = (id: string): void => {
  if (!ObjectId.isValid(id)) {
    throw new BadRequestException('_id không hợp lệ.');
  }
};

// =============================================== //
// =============================================== //
// =============================================== //
interface ExistObjectOptions {
  checkNotDeleted?: boolean;
  errorMessage?: string;
  checkExisted?: boolean;
}

/**
 * Checks if an object exists in the database.
 * @param model - The Mongoose model to check against.
 * @param conditions - The conditions to find the object.
 * @param options - Optional settings for the check.
 * @param options.checkNotDeleted - Whether to check for non-deleted objects (default: true).
 * @param options.errorMessage - The error message to throw if the object is not found (default: 'Object not found').
 * @throws NotFoundException if the object is not found.
 */
export const isExistObject = async <
  T extends Omit<HydratedDocument<any>, 'delete'>,
>(
  model: SoftDeleteModel<T>,
  conditions: FilterQuery<T>,
  options: ExistObjectOptions = {},
): Promise<void> => {
  const {
    checkNotDeleted = true,
    errorMessage = 'Object not found',
    checkExisted = false,
  } = options;

  const queryConditions: FilterQuery<T> = {
    ...conditions,
    ...(checkNotDeleted && { deleted: false }),
  };

  const isExist = await model.exists(queryConditions);

  if (!isExist && !checkExisted) {
    throw new NotFoundException(errorMessage);
  }

  if (isExist && checkExisted) {
    throw new BadRequestException(errorMessage);
  }
};

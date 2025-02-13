import { ObjectId } from 'mongodb';

const isValidMongoId = (id: string): boolean => {
  return ObjectId.isValid(id);
};
export default isValidMongoId;

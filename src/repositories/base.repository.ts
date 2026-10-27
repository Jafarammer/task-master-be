import { Model, FilterQuery, UpdateQuery, Types } from "mongoose";

export abstract class BaseRepository<T> {
  constructor(protected readonly model: Model<T>) {}

  async findAll() {
    return this.model.find().exec();
  }

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.model.findById(id).exec();
  }

  async create(data: Partial<T>) {
    return this.model.create(data);
  }

  async update(id: string, data: UpdateQuery<T>) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.model
      .findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      })
      .exec();
  }

  async delete(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.model.findByIdAndDelete(id);
  }

  async findOne(filter: FilterQuery<T>) {
    return this.model.findOne(filter).exec();
  }
}

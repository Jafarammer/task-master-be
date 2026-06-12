import User from "../src/models/user.model";

export const createUser = async () => {
  return await User.create({
    full_name: "John Doe",
    email: "john@example.com",
    password: "@Jhone123",
    is_active: true,
  });
};

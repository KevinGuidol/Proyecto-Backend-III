import { fakerES as faker } from '@faker-js/faker';
import { hashPassword, verifyPassword } from './password.utils.js';
import { userModel } from '../models/user.model.js';
import { Product } from '../models/products.model.js';
import { cartService } from '../services/carts.service.js';
import Cart from '../models/carts.model.js';


export const generateMockUsers = async (count) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    const cartId = faker.database.mongodbObjectId();
    const user = {
      _id: faker.database.mongodbObjectId(),
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      age: faker.number.int({ min: 18, max: 80 }),
      email: faker.internet.email(),
      password: await hashPassword('coder123'),
      cartId: cartId,
      role: faker.helpers.arrayElement(['user', 'admin'])
    };
    users.push(user);
  }
  return users;
};

export const generateMockProducts = (count) => {
  const products = [];
  for (let i = 0; i < count; i++) {
    products.push({
      _id: faker.database.mongodbObjectId(),
      nombre: faker.commerce.productName(),
      descripcion: faker.commerce.productDescription(),
      precio: faker.number.int({ min: 100, max: 10000 }),
      categoria: faker.helpers.arrayElement(['Herramientas Manuales', 'Herramientas Eléctricas', 'Materiales', 'Accesorios']),
      stock: faker.number.int({ min: 0, max: 100 }),
      codigo: faker.string.uuid(),
      thumbnails: [faker.image.url()]
    });
  }
  return products;
};

export const insertMockData = async ({ users, products }) => {
  const insertedUsers = [];
  const insertedProducts = [];


  for (let i = 0; i < users; i++) {
    const cart = await cartService.createCart();
    const user = {
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      age: faker.number.int({ min: 18, max: 80 }),
      email: faker.internet.email(),
      password: await hashPassword('coder123'),
      cartId: cart._id,
      role: faker.helpers.arrayElement(['user', 'admin'])
    };
    const insertedUser = await userModel.create(user);
    insertedUsers.push(insertedUser);
  }


  for (let i = 0; i < products; i++) {
    const product = {
      nombre: faker.commerce.productName(),
      descripcion: faker.commerce.productDescription(),
      precio: faker.number.int({ min: 100, max: 10000 }),
      categoria: faker.helpers.arrayElement(['Herramientas Manuales', 'Herramientas Eléctricas', 'Materiales', 'Accesorios']),
      stock: faker.number.int({ min: 0, max: 100 }),
      codigo: faker.string.uuid(),
      thumbnails: [faker.image.url({ width: 200, height: 200, category: 'tools' })]
    };
    const insertedProduct = await Product.create(product);
    insertedProducts.push(insertedProduct);
  }

  return { users: insertedUsers, products: insertedProducts };
};

export const resetMockData = async () => {
  try {
    const mockUsers = await userModel.find({}).exec();
    const mockUserIds = [];
    const mockCartIds = [];

    for (const user of mockUsers) {
      const isMockPassword = await verifyPassword('coder123', user.password);
      if (isMockPassword) {
        mockUserIds.push(user._id);
        mockCartIds.push(user.cartId);
      }
    }

    const usersDeleted = await userModel.deleteMany({ _id: { $in: mockUserIds } });

    const cartsDeleted = await Cart.deleteMany({ _id: { $in: mockCartIds } });

    const productsDeleted = await Product.deleteMany({ codigo: { $regex: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i } });

    return {
      users: usersDeleted.deletedCount,
      products: productsDeleted.deletedCount,
      carts: cartsDeleted.deletedCount
    };
  } catch (error) {
    throw new Error('Error resetting mock data: ' + error.message);
  }
};
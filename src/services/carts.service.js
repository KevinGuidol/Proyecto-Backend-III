import { cartDao } from "../DAOs/index.dao.js";
import { NotFoundError, ValidationError } from "../utils/customErrors.js"
import { getLogger } from "../utils/logger.js";

const logger = getLogger();

export class CartService {
  async createCart() {
    try {
      return await cartDao.createCart();
    } catch (error) {
      throw new Error("Error al crear carrito" + error.message);
    }
  }

  async getCartById(cartId) {
    try {
      if (!cartId) throw new ValidationError("Falta el ID del carrito");
      logger.debug(`Buscando carrito con ID: ${cartId}`);
      const cart = await cartDao.getCartById(cartId);
      if (!cart) throw new Error("Carrito no encontrado");
      return cart;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error("Error al obtener carrito" + error.message);
    }
  }

  async getAllCarts() {
    try {
      return await cartDao.getAllCarts();
    } catch (error) {
      throw new Error("Error al obtener carritos" + error.message);
    }
  }

  async addProductToCart(cartId, productId) {
    try {
      if (!cartId || !productId) throw new ValidationError("Falta el ID del carrito o del producto");
      const cart = await cartDao.addProductToCart(cartId, productId);
      if (!cart) throw new NotFoundError("Carrito no encontrado");
      return cart;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error("Error al agregar producto al carrito" + error.message);
    }
  }

  async updateProductQuantity(cartId, productId, quantity) {
    try {
      if (!cartId || !productId) throw new ValidationError("Falta el ID del carrito o del producto");
      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new ValidationError("La cantidad debe ser un número entero positivo");
      }
      const cart = await cartDao.updateProductQuantity(cartId, productId, quantity);
      if (!cart) throw new NotFoundError("Carrito o producto no encontrado");
      return cart;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error("Error al actualizar cantidad: " + error.message);
    }
  }

  async removeProductFromCart(cartId, productId) {
    try {
      if (!cartId || !productId) throw new ValidationError("Falta el ID del carrito o del producto");
      const cart = await cartDao.removeProductFromCart(cartId, productId);
      if (!cart) throw new NotFoundError("Carrito no encontrado");
      return cart;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error("Error al eliminar producto del carrito: " + error.message);
    }
  }

  async updateCart(cartId, products) {
    try {
      if (!cartId) throw new ValidationError("Falta el ID del carrito");
      if (!Array.isArray(products)) throw new ValidationError("Los productos deben ser un array");
      const cart = await cartDao.updateCart(cartId, products);
      if (!cart) throw new NotFoundError("Carrito no encontrado");
      return cart;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error("Error al actualizar carrito: " + error.message);
    }
  }

  async clearCart(cartId) {
    try {
      if (!cartId) throw new ValidationError("Falta el ID del carrito");
      const cart = await cartDao.clearCart(cartId);
      if (!cart) throw new NotFoundError("Carrito no encontrado");
      return cart;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error("Error al vaciar carrito: " + error.message);
    }
  }
}

export const cartService = new CartService();
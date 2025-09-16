import { cartService } from "../services/carts.service.js";
import { productsService } from "../services/products.service.js";
import { ticketService } from "../services/ticket.service.js";
import { NotFoundError, ValidationError } from "../utils/customErrors.js"
import { getLogger } from "../utils/logger.js";

const logger = getLogger();

class CartsController {
  async getAll(req, res) {
    try {
      logger.info("Obteniendo todos los carritos");
      const carts = await cartService.getAllCarts();
      res.json(carts);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res) {
    const { cartId } = req.params;
    try {
      const cart = await cartService.getCartById(cartId);
      if (!cart) {
        return res.status(404).json({ error: "Carrito no encontrado" });
      }
      res.json(cart);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res) {
    try {
      const newCart = await cartService.createCart();
      res.status(201).json(newCart);
    } catch (error) {
      next(error);
    }
  }

  async addProductToCart(req, res) {
    const { cartId, productId } = req.params;
    try {
      const product = await productsService.getById(productId);
      if (!product) {
        return res.status(400).json({ error: "Producto no encontrado" });
      }
      const updatedCart = await cartService.addProductToCart(cartId, productId);
      res.json(updatedCart);
    } catch (error) {
      next(error);
    }
  }

  async updateCart(req, res) {
    const { cartId } = req.params;
    const { products } = req.body;
    try {
      const updatedCart = await cartService.updateCart(cartId, products);
      res.json(updatedCart);
    } catch (error) {
      next(error);
    }
  }

  async updateProductQuantity(req, res) {
    const { cartId, productId } = req.params;
    const { quantity } = req.body;
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ error: "La cantidad debe ser un número entero positivo" });
    }
    try {
      const updatedCart = await cartService.updateProductQuantity(cartId, productId, quantity);
      res.json(updatedCart);
    } catch (error) {
      next(error);
    }
  }

  async removeProductFromCart(req, res) {
    const { cartId, productId } = req.params;
    try {
      const updatedCart = await cartService.removeProductFromCart(cartId, productId);
      res.json(updatedCart);
    } catch (error) {
      next(error);
    }
  }

  async clearCart(req, res) {
    const { cartId } = req.params;
    try {
      const clearedCart = await cartService.clearCart(cartId);
      res.json({ message: "Todos los productos eliminados del carrito", clearedCart });
    } catch (error) {
      next(error);
    }
  }

  async purchase(req, res) {
    const { cartId } = req.params;
    try {
      const cart = await cartService.getCartById(cartId);
      if (!cart || !cart.products.length) {
        return res.status(400).json({ error: "El carrito está vacío o no existe" });
      }

      let totalAmount = 0;
      const unprocessedProducts = [];
      const processedProducts = [];

      for (const item of cart.products) {
        const product = await productsService.getById(item.product._id);
        if (product.stock >= item.quantity) {
          product.stock -= item.quantity;
          await productsService.update(product._id, { stock: product.stock });
          totalAmount += item.quantity * product.precio;
          processedProducts.push({ product: item.product._id, quantity: item.quantity });
        } else {
          unprocessedProducts.push(item.product._id.toString());
        }
      }

      cart.products = cart.products.filter(item =>
        unprocessedProducts.includes(item.product._id.toString())
      );
      await cartService.updateCart(cartId, cart.products);

      if (processedProducts.length > 0) {
        const ticketData = {
          amount: totalAmount,
          purchaser: req.user.email,
          products: processedProducts,
          purchase_datetime: new Date(),
        };
        const ticket = await ticketService.create(ticketData);
        return res.status(200).json({
          message: "Compra finalizada",
          ticket,
          unprocessedProducts: unprocessedProducts.length ? unprocessedProducts : undefined
        });
      } else {
        return res.status(400).json({
          error: "No se pudo procesar ningún producto por falta de stock",
          unprocessedProducts
        });
      }
    } catch (error) {
      next(error);
    }
  }
}

export const cartsController = new CartsController();
import request from 'supertest';
import mongoose from 'mongoose';
import express from 'express';
import { fakerES as faker } from '@faker-js/faker';
import app from '../server.js';
import { userModel } from '../models/user.model.js';
import { hashPassword } from '../utils/password.utils.js';
import dotenv from 'dotenv';
import http from 'http';
import { mongodbProvider } from '../config/mongodbProvider.js';
import { CONFIG } from '../config/config.js';
import { PERSISTENCE } from '../common/constants/persistence.js';
import passport from 'passport';
import { initializePassport } from '../config/passport.config.js';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { SECRET } from '../server.js';
import { cartService } from '../services/carts.service.js';
import { productsRouter } from '../routes/products.routes.js';
import { cartsRouter } from '../routes/carts.routes.js';
import { viewsRoutes } from '../routes/views.routes.js';
import { sessionRouter } from '../routes/session.routes.js';
import { authRouter } from '../routes/auth.routes.js';
import { loggerRouter } from '../routes/logger.routes.js';
import { mocksRouter } from '../routes/mocks.routes.js';
import { usersRouter } from '../routes/users.routes.js';
import { errorHandler } from '../middlewares/errorHandler.middleware.js';
import { getLogger } from '../utils/logger.js';
import swaggerUI from 'swagger-ui-express';
import swaggerSpec from '../config/swagger.js';
import { __dirname } from '../dirname.js';
import path from 'path';
import { mailService } from '../services/mail.service.js';
import { jest } from '@jest/globals';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const logger = getLogger();

const mockUser = async () => {
  const password = faker.internet.password();
  return {
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    age: faker.number.int({ min: 18, max: 99 }),
    email: faker.internet.email(),
    password: await hashPassword(password),
    rawPassword: password,
    isTestUser: true,
  };
};

describe('Conjunto de pruebas API USERS', () => {
  let server;

  beforeAll(async () => {
    jest.spyOn(mailService, 'sendMail').mockResolvedValue(true);

    if (CONFIG.PERSISTENCE === PERSISTENCE.MONGODB) {
      try {
        await mongodbProvider.connect(MONGO_URI);
        console.log('Conexión a MongoDB: OK');
      } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        throw error;
      }
    } else if (CONFIG.PERSISTENCE === PERSISTENCE.MEMORY) {
      console.info('Using in-memory persistence');
    }

    initializePassport();
    app.use(passport.initialize());
    app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));
    app.use(morgan('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static(path.resolve(__dirname, '../public')));
    app.use(cookieParser());
    app.use(cors());
    app.use(async (req, res, next) => {
      if (req.cookies.token) {
        try {
          const decoded = jwt.verify(req.cookies.token, SECRET);
          const user = await userModel.findById(decoded._id).lean();
          req.user = user;
          res.locals.currentUser = user || null;
          if (user && user.role !== 'admin') {
            const cart = await cartService.getCartById(user.cartId);
            res.locals.cartCount = cart ? cart.products.reduce((acc, item) => acc + item.quantity, 0) : 0;
          } else {
            res.locals.cartCount = 0;
          }
        } catch (error) {
          logger.error('Error en middleware de autenticación:', error);
          req.user = null;
          res.locals.currentUser = null;
          res.locals.cartCount = 0;
        }
      } else {
        req.user = null;
        res.locals.currentUser = null;
        res.locals.cartCount = 0;
      }
      next();
    });
    app.use((req, res, next) => {
      logger.http(`${req.method} ${req.url}`);
      next();
    });
    app.use('/', viewsRoutes);
    app.use('/api/products', productsRouter);
    app.use('/api/carts', cartsRouter);
    app.use('/api/sessions', sessionRouter);
    app.use('/', authRouter);
    app.use('/api/logger', loggerRouter);
    app.use('/api/mocks', mocksRouter);
    app.use('/api/users', usersRouter);
    app.use(errorHandler);


    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));

  });

  afterEach(async () => {
    jest.setTimeout(10000);
    await userModel.deleteMany({ isTestUser: true });
  });

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    if (CONFIG.PERSISTENCE === PERSISTENCE.MONGODB) {
      await mongoose.disconnect();
    }
  });

  test('[POST] /api/sessions/register', async () => {
    const userData = await mockUser();
    const response = await request(app)
      .post('/api/sessions/register')
      .send({
        first_name: userData.first_name,
        last_name: userData.last_name,
        age: userData.age,
        email: userData.email,
        password: userData.rawPassword,
        isTestUser: true,
      });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe('/login?message=register-success');
  });

  test('[POST] /api/sessions/register - Error email duplicado', async () => {
    const userData = await mockUser();
    await request(app).post('/api/sessions/register').send({
      first_name: userData.first_name,
      last_name: userData.last_name,
      age: userData.age,
      email: userData.email,
      password: userData.rawPassword,
    });
    const response = await request(app)
      .post('/api/sessions/register')
      .send({
        first_name: userData.first_name,
        last_name: userData.last_name,
        age: userData.age,
        email: userData.email,
        password: userData.rawPassword,
      });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toContain('error=Usuario%20ya%20existe');
  }, 10000);

  test('[POST] /api/sessions/login', async () => {
    const userData = await mockUser();
    await request(app).post('/api/sessions/register').send({
      first_name: userData.first_name,
      last_name: userData.last_name,
      age: userData.age,
      email: userData.email,
      password: userData.rawPassword,
    });
    const loginResponse = await request(app)
      .post('/api/sessions/login')
      .send({ email: userData.email, password: userData.rawPassword });

    expect(loginResponse.statusCode).toBe(302);
    expect(loginResponse.headers.location).toBe('/');
    expect(loginResponse.headers['set-cookie']).toBeDefined();
  });
  test('[GET] /api/sessions/current - Usuario autenticado', async () => {
    const userData = await mockUser();
    await request(app).post('/api/sessions/register').send({
      first_name: userData.first_name,
      last_name: userData.last_name,
      age: userData.age,
      email: userData.email,
      password: userData.rawPassword,
      isTestUser: true,
    });

    const loginResponse = await request(app)
      .post('/api/sessions/login')
      .send({ email: userData.email, password: userData.rawPassword });

    const rawCookies = loginResponse.headers['set-cookie'];
    const cookieString = rawCookies[0];
    const currentResponse = await request(app).get('/api/sessions/current').set('Cookie', cookieString);

    expect(currentResponse.statusCode).toBe(200);
    expect(currentResponse.body.usuario.email).toBe(userData.email);
  });

  test('[POST] /api/sessions/restore-password - Restaurar contraseña', async () => {
    const userData = await mockUser();
    await request(app).post('/api/sessions/register').send({
      first_name: userData.first_name,
      last_name: userData.last_name,
      age: userData.age,
      email: userData.email,
      password: userData.rawPassword,
      isTestUser: true,
    });

    const newPassword = 'newpass123';
    const restoreResponse = await request(app)
      .post('/api/sessions/restore-password')
      .send({ email: userData.email, password: newPassword });

    expect(restoreResponse.statusCode).toBe(302);
    expect(restoreResponse.headers.location).toContain('/login?message=Contrase%C3%B1a%20restaurada%20exitosamente');

    const loginResponse = await request(app)
      .post('/api/sessions/login')
      .send({ email: userData.email, password: newPassword });
    expect(loginResponse.statusCode).toBe(302);
  });

  test('[GET] /api/sessions/logout - Cerrar sesión', async () => {
    const userData = await mockUser();
    await request(app).post('/api/sessions/register').send({
      first_name: userData.first_name,
      last_name: userData.last_name,
      age: userData.age,
      email: userData.email,
      password: userData.rawPassword,
      isTestUser: true,
    });

    const loginResponse = await request(app)
      .post('/api/sessions/login')
      .send({ email: userData.email, password: userData.rawPassword });
    const cookie = loginResponse.headers['set-cookie'];

    const logoutResponse = await request(app)
      .get('/api/sessions/logout')
      .set('Cookie', cookie);

    expect(logoutResponse.statusCode).toBe(302);
    expect(logoutResponse.headers.location).toBe('/');
    expect(logoutResponse.headers['set-cookie'][0]).toContain('token=;');
  });

  test('[POST] /api/sessions/register - Validación de entrada', async () => {
    const invalidUserData = {
      first_name: 'A',
      last_name: 'Doe',
      age: 17,
      email: 'invalid-email',
      password: '123',
    };

    const response = await request(app)
      .post('/api/sessions/register')
      .send(invalidUserData);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  test('[POST] /api/sessions/login - Credenciales incorrectas', async () => {
    const userData = await mockUser();
    await request(app).post('/api/sessions/register').send({
      first_name: userData.first_name,
      last_name: userData.last_name,
      age: userData.age,
      email: userData.email,
      password: userData.rawPassword,
      isTestUser: true,
    });

    const loginResponse = await request(app)
      .post('/api/sessions/login')
      .send({ email: userData.email, password: 'wrongpass' });

    expect(loginResponse.statusCode).toBe(302);
    expect(loginResponse.headers.location).toContain('error=Usuario%20o%20contrase%C3%B1a%20incorrectos');
  });
});

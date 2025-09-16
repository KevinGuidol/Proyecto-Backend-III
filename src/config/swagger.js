import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: "ClyB'ness API",
      version: '1.0.0',
      description: "Documentación de la API de ClyB\'ness",
    },
    servers: [
      {
        url: 'http://localhost:8080',
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            first_name: { type: 'string', description: 'Nombre del usuario', example: 'Juan' },
            last_name: { type: 'string', description: 'Apellido del usuario', example: 'Pérez' },
            age: { type: 'number', description: 'Edad del usuario', example: 30 },
            email: { type: 'string', description: 'Correo electrónico del usuario', example: 'juan@example.com' },
            role: { type: 'string', description: 'Rol del usuario', example: 'user' },
            cartId: { type: 'string', description: 'ID del carrito asociado', example: '1234567890abcdef' },
          },
          required: ['first_name', 'last_name', 'age', 'email', 'role'],
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/docs/*.yml'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
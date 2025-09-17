# Clyb'ness (Ecommerce) - Proyecto Final Backend III

## Descripción


Este proyecto es una aplicación de ecommerce desarrollada como proyecto final para el curso de **Programación Backend III: Testing y Escalabilidad Backend** en **Coderhouse**. El sistema está construido con **Node.js**, **Express** y **MongoDB**, permitiendo la gestión integral de productos, carritos, usuarios y tickets de compra, con foco en la seguridad, escalabilidad, pruebas automatizadas y experiencia de usuario.


El backend utiliza **Handlebars** para vistas dinámicas, **Socket.io** para actualizaciones en tiempo real, **Nodemailer** para notificaciones por email y **Passport** con **JWT** para autenticación segura. El sistema de logging se implementa con **log4js** y la generación de datos simulados se realiza con **faker-js**.


Incluye un sistema de **testing automatizado** con **Mocha**, **Jest** y **Supertest** para validar endpoints críticos y asegurar la calidad del código. El despliegue es sencillo gracias al **Dockerfile** incluido y la imagen publicada en **DockerHub**.

---

## Características Principales

### Backend
- **Gestión de Productos**: CRUD, paginación, filtrado, generación de productos simulados.
- **Gestión de Carritos**: Creación automática, agregar/eliminar productos, vaciado y compra con generación de ticket.
- **Gestión de Usuarios**: Registro, login, restauración de contraseña, roles (`user` y `admin`), perfil y generación de usuarios simulados.
- **Autenticación y Autorización**: Passport (estrategias local y JWT), tokens seguros, middleware de roles.
- **Sistema de Tickets**: Generación y visualización de tickets, manejo de stock insuficiente.
- **Mailing**: Envío de correos de bienvenida y notificaciones.
- **WebSockets**: Actualización en tiempo real de productos para admins.
- **Mocking de Datos**: Generación y borrado de datos simulados para pruebas.
- **Logging**: log4js para eventos y errores, logs en consola y archivos.
- **Testing Automatizado**: Mocha, Jest y Supertest para endpoints clave.
- **Contenerización**: Dockerfile y despliegue en DockerHub.

### Frontend
- **Handlebars**: Vistas para productos, carritos, perfil, tickets, login, registro y restauración de contraseña.
- **Materialize CSS**: Interfaz responsive y moderna.
- **Socket.io-client**: Interactividad en tiempo real.
- **Toastify**: Notificaciones visuales.

---

## Tecnologías Utilizadas

- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.io, Nodemailer, Passport, JWT, Joi, log4js, faker-js, bcrypt, cors, Morgan, cookie-parser, Mocha, Supertest
- **Frontend**: Handlebars, Materialize CSS, Toastify, Socket.io-client
- **Otros**: dotenv, Docker

---

## Endpoints Principales

### Productos
- `GET /api/products`: Lista productos (paginación)
- `GET /api/products/:productId`: Producto por ID
- `POST /api/products`: Crear producto (admin)
- `PUT /api/products/:productId`: Actualizar producto (admin)
- `DELETE /api/products/:productId`: Eliminar producto (admin)

### Carritos
- `GET /api/carts`: Listar carritos (admin)
- `GET /api/carts/:cartId`: Detalles de carrito
- `POST /api/carts`: Crear carrito
- `POST /api/carts/:cartId/products/:productId`: Agregar producto
- `DELETE /api/carts/:cartId/products/:productId`: Eliminar producto
- `DELETE /api/carts/:cartId`: Vaciar carrito
- `POST /api/carts/:cartId/purchase`: Finalizar compra y ticket

### Usuarios y Sesiones
- `POST /api/sessions/register`: Registrar usuario y email
- `POST /api/sessions/login`: Login y JWT
- `GET /api/sessions/current`: Usuario autenticado
- `POST /api/sessions/restore-password`: Restaurar contraseña
- `GET /api/sessions/logout`: Logout
- `GET /api/users`: Listar usuarios (admin)

### Tickets
- `GET /api/tickets`: Listar tickets (admin)
- `GET /api/tickets/:ticketId`: Detalles de ticket

### Mocks
- `GET /api/mocks/mockingusers`: Generar usuarios simulados (admin)
- `GET /api/mocks/mockingproducts`: Generar productos simulados (admin)
- `POST /api/mocks/generateData`: Insertar datos simulados (admin)
- `DELETE /api/mocks/reset`: Eliminar datos simulados (admin)

### Logger
- `GET /api/logger`: Prueba de logging (admin)

---

## Vistas Principales (Frontend)

- `/`: Lista de productos
- `/realtimeproducts`: Gestión de productos en tiempo real (admin)
- `/cart/:cartId`: Carrito del usuario
- `/tickets/:ticketId`: Detalles de ticket
- `/profile`: Perfil de usuario
- `/login` y `/register`: Formularios de login y registro
- `/restore-password`: Restaurar contraseña

---

## Requisitos

- Node.js (v20.17.0 o superior)
- MongoDB (local o Atlas)
- Cuenta de Gmail para Nodemailer (con contraseña de aplicación)

---

## Ejecución con Docker

También podés correr el servidor rápidamente usando la imagen de DockerHub.

### 📦 Imagen en Docker Hub

🔗 [Ver en Docker Hub](https://hub.docker.com/repository/docker/kevinguidol/proyecto-backend-3/general)

## Autor

- **Kevin Guidolin**
- Proyecto desarrollado para el curso Backend III de [Coderhouse](https://www.coderhouse.com/)
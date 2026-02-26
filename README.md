# Supermarket Management System

A comprehensive Node.js and Sequelize-based backend API for a supermarket/restaurant management system with support for customers, restaurants, products, orders, and delivery management.

## Features

### Core Functionality
- **Multi-User Authentication** - Support for customers, restaurants, and delivery personnel with JWT-based authentication
- **Product Management** - Complete product catalog with categories, pricing, stock tracking, and restaurant associations
- **Order Processing** - Full order lifecycle management with payment tracking, delivery status, and order items
- **Shopping Cart** - Active cart management with item tracking and totals calculation
- **Restaurant Management** - Multi-restaurant support with location tracking, verification, and ratings
- **Addon System** - Product addons/extras with pricing and stock management
- **Combo Deals** - Create and manage product combos with multiple items
- **Delivery Management** - Delivery personnel tracking and assignment
- **Address Management** - Customer address storage for delivery
- **Rating System** - Customer ratings for restaurants and orders
- **Offer Management** - Special offers and discounts on products

### Technical Features
- RESTful API design
- PostgreSQL database with Sequelize ORM
- Swagger/OpenAPI documentation
- JWT authentication with bcrypt password hashing
- CORS enabled
- Request logging with Morgan
- Input validation with express-validator
- Docker support with embedded PostgreSQL
- Graceful shutdown handling
- Database migrations and seeding support
- **Multi-cart system** - Customers can maintain separate carts per restaurant

## Prerequisites

- **Node.js** v18 or higher
- **PostgreSQL** v12 or higher (or use Docker for embedded PostgreSQL)
- **npm** or **yarn**
- **Docker** (optional, for containerized deployment with embedded database)

## Environment Variables

The following environment variables are required (see `.env.example`):

```bash
NODE_ENV=development
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=supermarket_db
DB_USER=supermarket_user
DB_PASS=supermarket_password

# Optional: Use full database URL instead
# DATABASE_URL=postgres://user:password@host:5432/dbname

# Authentication & Security
JWT_SECRET=your_secret_key_here
BCRYPT_SALT_ROUNDS=10
JWT_EXPIRES_IN=10d

# Server Configuration
PORT=2801
```

## Setup

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd supermarket
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database credentials and JWT secret.

4. **Create the database** (if not using Docker)
   ```bash
   npm run db:create
   ```

5. **Run migrations**
   ```bash
   npm run db:migrate
   ```

6. **Seed the database** (optional)
   ```bash
   npm run db:seed
   ```

7. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:2801` (or the PORT specified in `.env`).

### Docker Deployment

The Docker setup includes an embedded PostgreSQL instance and automatically runs migrations.

1. **Build the Docker image**
   ```bash
   docker build -t supermarket-api .
   ```

2. **Run the container**
   ```bash
   docker run --env-file .env -p 2801:2801 -p 5432:5432 supermarket-api
   ```

   Or use the convenience script:
   ```bash
   ./rerun-container.sh
   ```

3. **Access the API**
   - API: `http://localhost:2801`
   - Swagger Docs: `http://localhost:2801/docs`

The `docker-entrypoint.sh` script automatically:
- Initializes PostgreSQL if needed
- Creates the database and user
- Runs migrations
- Starts the development server

## Project Structure

```
supermarket/
├── src/
│   ├── config/
│   │   ├── database.js        # Sequelize database configuration
│   │   ├── db-init.js         # Database initialization script
│   │   └── swagger.js         # Swagger/OpenAPI configuration
│   ├── controllers/
│   │   ├── addon.js           # Addon management logic
│   │   ├── auth.js            # Authentication (customer, restaurant, delivery)
│   │   ├── category.js        # Category management
│   │   └── product.js         # Product CRUD operations
│   ├── routers/
│   │   ├── api.js             # Main API router
│   │   ├── addons.js          # Addon routes with Swagger docs
│   │   ├── auth.js            # Authentication routes
│   │   ├── category.js        # Category routes
│   │   └── product.js         # Product routes
│   ├── validaters.js          # JWT validation middleware
│   └── server.js              # Express app setup and server
├── models/
│   ├── index.js               # Sequelize model loader
│   ├── customer.js            # Customer model
│   ├── restaurant.js          # Restaurant model
│   ├── deliveryMan.js         # Delivery personnel model
│   ├── product.js             # Product model
│   ├── category.js            # Category model
│   ├── addon.js               # Addon model
│   ├── addonPerProduct.js     # Product-addon relationship
│   ├── cart.js                # Shopping cart model
│   ├── cartItem.js            # Cart items model
│   ├── order.js               # Order model
│   ├── orderItem.js           # Order items model
│   ├── address.js             # Customer address model
│   ├── combo.js               # Combo deals model
│   ├── comboItem.js           # Combo items model
│   ├── offer.js               # Special offers model
│   └── rate.js                # Rating/review model
├── migrations/                # Sequelize migrations (17 files)
├── seeders/                   # Database seeders
├── .sequelizerc              # Sequelize CLI configuration
├── Dockerfile                # Docker image definition
├── docker-entrypoint.sh      # Docker startup script
└── package.json              # Dependencies and scripts
```

## Database Models

The system includes the following database models with relationships:

- **Customer** - User accounts with authentication
- **Restaurant** - Restaurant/vendor accounts with location and verification
- **DeliveryMan** - Delivery personnel accounts
- **Category** - Product categories
- **Product** - Products with pricing, stock, and restaurant association
- **Addon** - Product extras/addons
- **AddonPerProduct** - Many-to-many relationship between products and addons
- **Cart** - Active shopping carts
- **CartItem** - Items in shopping carts
- **Order** - Customer orders with payment and delivery tracking
- **OrderItem** - Items in orders
- **Address** - Customer delivery addresses
- **Combo** - Product combo deals
- **ComboItem** - Products included in combos
- **Offer** - Special offers and discounts
- **Rate** - Customer ratings and reviews

## API Endpoints

### Authentication
- `POST /api/auth/customer/register` - Register a new customer
- `POST /api/auth/customer/login` - Customer login
- `POST /api/auth/restaurant/register` - Register a new restaurant
- `POST /api/auth/restaurant/login` - Restaurant login
- `POST /api/auth/delivery/register` - Register delivery personnel
- `POST /api/auth/delivery/login` - Delivery personnel login

### Products
- `GET /api/product` - List all products
- `GET /api/product/:id` - Get product details
- `POST /api/product` - Create new product (restaurant only)
- `PUT /api/product/:id` - Update product (restaurant only)
- `DELETE /api/product/:id` - Delete product (restaurant only)

### Categories
- `GET /api/category` - List all categories
- `GET /api/category/:id` - Get category details
- `POST /api/category` - Create category
- `PUT /api/category/:id` - Update category
- `DELETE /api/category/:id` - Delete category

### Addons
- `GET /api/addons` - List all addons
- `GET /api/addons/:id` - Get addon details
- `POST /api/addons` - Create addon (restaurant only)
- `PUT /api/addons/:id` - Update addon (restaurant only)
- `DELETE /api/addons/:id` - Delete addon (restaurant only)

### Cart (Multi-Restaurant Support)
- `POST /api/cart/add` - Add product/addon/combo to cart
- `POST /api/cart/remove` - Remove item from cart
- `POST /api/cart/update` - Update cart item quantity or notes
- `POST /api/cart/clear` - Clear cart (specific restaurant or all)
- `GET /api/cart/get` - Get all active carts grouped by restaurant
- `POST /api/cart/convert-to-order` - Convert restaurant-specific cart to order

### Other Endpoints
- `GET /` - Health check
- `GET /version` - API version
- `GET /docs` - Swagger API documentation

## Available Scripts

- **`npm start`** - Start the production server
- **`npm run dev`** - Start development server with nodemon (hot-reload)
- **`npm test`** - Run Jest tests
- **`npm run lint`** - Run ESLint code linting
- **`npm run format`** - Format code with Prettier
- **`npm run db:create`** - Initialize database (create if not exists)
- **`npm run db:migrate`** - Run all pending migrations
- **`npm run db:migrate:undo`** - Rollback last migration
- **`npm run db:migrate:undo:all`** - Rollback all migrations
- **`npm run db:seed`** - Run all seeders
- **`npm run db:seed:undo`** - Undo all seeders
- **`npm run db:reset`** - Reset database (undo all, migrate, seed)

## API Documentation

Interactive Swagger/OpenAPI documentation is available at:
```
http://localhost:2801/docs
```

The documentation includes:
- All available endpoints
- Request/response schemas
- Authentication requirements
- Try-it-out functionality

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. After successful login or registration, include the token in requests:

```bash
Authorization: Bearer <your-jwt-token>
```

### User Roles
- **Customer** - Can browse products, manage cart, place orders
- **Restaurant** - Can manage their products, addons, and combos
- **Delivery** - Can view and update delivery assignments

## Security Features

- Passwords hashed with bcrypt (configurable salt rounds)
- JWT tokens with configurable expiration
- Role-based access control
- Input validation on all endpoints
- SQL injection protection via Sequelize ORM
- CORS configuration for cross-origin requests

## Development

### Adding New Migrations

```bash
npx sequelize-cli migration:generate --name migration-name
```

Edit the generated file in `migrations/`, then run:
```bash
npm run db:migrate
```

### Adding New Models

Create a new file in `models/` following the existing pattern, then define associations in the `associate` method.

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check credentials in `.env`
- Ensure database exists (run `npm run db:create`)

### Docker Issues
- Ensure ports 2801 and 5432 are not in use
- Check Docker logs: `docker logs <container-id>`
- Verify `.env` file is present

### Migration Errors
- Check migration files for syntax errors
- Ensure migrations run in order (numbered 01-17)
- Try resetting: `npm run db:reset`

## License

This project is licensed under the MIT License.

## Author

Developed as a comprehensive supermarket/restaurant management system backend.
# fodz-ma

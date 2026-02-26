const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Supermarket API',
    version: '1.0.0',
    description: 'API documentation for the supermarket backend'
  },
  servers: [
    {
      url: `https://foodz.ma-core.cloud/`,
      description: 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Product: {
        type: 'object',
        properties: {
          id: {
            type: 'integer'
          },
          status: {
            type: 'string'
          },
          name: {
            type: 'string'
          },
          slug: {
            type: 'string'
          },
          categoryId: {
            type: 'integer'
          },
          description: {
            type: 'string'
          },
          salePrice: {
            type: 'number',
            format: 'float'
          },
          barcode: {
            type: 'string'
          },
          costPrice: {
            type: 'number',
            format: 'float'
          },
          stock: {
            type: 'integer'
          },
          minStock: {
            type: 'integer'
          },
          maxStock: {
            type: 'integer'
          },
          weight: {
            type: 'number',
            format: 'float'
          },
          dimensions: {
            type: 'string'
          },
          brand: {
            type: 'string'
          },
          unit: {
            type: 'string'
          },
          isActive: {
            type: 'boolean'
          },
          prepTimeMinutes: {
            type: 'integer'
          },
          restaurantId: {
            type: 'integer'
          },
          rate: {
            type: 'number',
            format: 'float'
          },
          createdBy: {
            type: 'string'
          },
          updatedBy: {
            type: 'string'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      }
    }
  }
};

const options = {
  swaggerDefinition,
  apis: [
    'src/routers/**/*.js',
    'src/controllers/**/*.js',
    'src/docs/**/*.yaml'
  ]
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;

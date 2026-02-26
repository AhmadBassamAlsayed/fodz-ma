'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    
    return queryInterface.bulkInsert('categories', [
      // Pizza Palace Categories
      {
        id: 1,
        name: 'Pizzas',
        shortName: 'Pizza',
        description: 'All types of pizzas',
        restaurantId: 1,
        isActive: true,
        parentCategoryId: null,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        name: 'Classic Pizzas',
        shortName: 'Classic',
        description: 'Traditional pizza varieties',
        restaurantId: 1,
        isActive: true,
        parentCategoryId: 1,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 3,
        name: 'Specialty Pizzas',
        shortName: 'Specialty',
        description: 'Gourmet and specialty pizzas',
        restaurantId: 1,
        isActive: true,
        parentCategoryId: 1,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 4,
        name: 'Sides',
        shortName: 'Sides',
        description: 'Side dishes and appetizers',
        restaurantId: 1,
        isActive: true,
        parentCategoryId: null,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      // Burger House Categories
      {
        id: 5,
        name: 'Burgers',
        shortName: 'Burger',
        description: 'All burger varieties',
        restaurantId: 2,
        isActive: true,
        parentCategoryId: null,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 6,
        name: 'Beef Burgers',
        shortName: 'Beef',
        description: 'Beef burger options',
        restaurantId: 2,
        isActive: true,
        parentCategoryId: 5,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 7,
        name: 'Chicken Burgers',
        shortName: 'Chicken',
        description: 'Chicken burger options',
        restaurantId: 2,
        isActive: true,
        parentCategoryId: 5,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 8,
        name: 'Fries',
        shortName: 'Fries',
        description: 'French fries and potato sides',
        restaurantId: 2,
        isActive: true,
        parentCategoryId: null,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      // Sushi Express Categories
      {
        id: 9,
        name: 'Sushi Rolls',
        shortName: 'Rolls',
        description: 'Various sushi rolls',
        restaurantId: 3,
        isActive: true,
        parentCategoryId: null,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 10,
        name: 'Sashimi',
        shortName: 'Sashimi',
        description: 'Fresh sashimi selections',
        restaurantId: 3,
        isActive: true,
        parentCategoryId: null,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      // Taco Fiesta Categories
      {
        id: 11,
        name: 'Tacos',
        shortName: 'Tacos',
        description: 'Mexican tacos',
        restaurantId: 4,
        isActive: true,
        parentCategoryId: null,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 12,
        name: 'Burritos',
        shortName: 'Burrito',
        description: 'Mexican burritos',
        restaurantId: 4,
        isActive: true,
        parentCategoryId: null,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      // Pasta Paradise Categories (inactive restaurant)
      {
        id: 13,
        name: 'Pasta',
        shortName: 'Pasta',
        description: 'Italian pasta dishes',
        restaurantId: 5,
        isActive: false,
        parentCategoryId: null,
        status: 'inactive',
        createdBy: 'restaurant',
        updatedBy: 'admin',
        createdAt: new Date('2023-10-01'),
        updatedAt: now
      },
      {
        id: 14,
        name: 'Deleted Category',
        shortName: 'Deleted',
        description: 'This category was deleted',
        restaurantId: 1,
        isActive: false,
        parentCategoryId: null,
        status: 'deleted',
        createdBy: 'restaurant',
        updatedBy: 'admin',
        createdAt: new Date('2023-08-01'),
        updatedAt: now
      },
      // Urban Spice Kitchen Categories
      {
        id: 15,
        name: 'Fusion Bowls',
        shortName: 'Bowls',
        description: 'Signature noodle and rice bowls with global flavors',
        restaurantId: 6,
        isActive: true,
        parentCategoryId: null,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 16,
        name: 'Shareable Plates',
        shortName: 'Plates',
        description: 'Small plates designed for sharing',
        restaurantId: 6,
        isActive: true,
        parentCategoryId: null,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      // Family Feast Hub Categories
      {
        id: 17,
        name: 'Family Trays',
        shortName: 'Trays',
        description: 'Large-format meals for the whole family',
        restaurantId: 7,
        isActive: true,
        parentCategoryId: null,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 18,
        name: 'Sweet Treats',
        shortName: 'Desserts',
        description: 'Desserts and sweet platters',
        restaurantId: 7,
        isActive: true,
        parentCategoryId: null,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('categories', null, {});
  }
};

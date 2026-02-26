'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    
    return queryInterface.bulkInsert('addonsPerProduct', [
      // Pizza Palace - Margherita Pizza addons
      {
        id: 1,
        productId: 1,
        addonId: 1,
        isActive: true,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        productId: 1,
        addonId: 2,
        isActive: true,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 3,
        productId: 1,
        addonId: 3,
        isActive: true,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 4,
        productId: 1,
        addonId: 4,
        isActive: true,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      // Pizza Palace - Pepperoni Pizza addons
      {
        id: 5,
        productId: 2,
        addonId: 1,
        isActive: true,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 6,
        productId: 2,
        addonId: 2,
        isActive: true,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 7,
        productId: 2,
        addonId: 3,
        isActive: true,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      // Pizza Palace - Truffle Mushroom Pizza addons
      {
        id: 8,
        productId: 3,
        addonId: 1,
        isActive: true,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 9,
        productId: 3,
        addonId: 3,
        isActive: true,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      // Burger House - Classic Beef Burger addons
      {
        id: 10,
        productId: 5,
        addonId: 5,
        isActive: true,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 11,
        productId: 5,
        addonId: 6,
        isActive: true,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 12,
        productId: 5,
        addonId: 7,
        isActive: true,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 13,
        productId: 5,
        addonId: 8,
        isActive: true,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      // Burger House - Double Cheese Burger addons
      {
        id: 14,
        productId: 6,
        addonId: 5,
        isActive: true,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 15,
        productId: 6,
        addonId: 6,
        isActive: true,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 16,
        productId: 6,
        addonId: 8,
        isActive: true,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      // Burger House - Crispy Chicken Burger addons
      {
        id: 17,
        productId: 7,
        addonId: 5,
        isActive: true,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 18,
        productId: 7,
        addonId: 6,
        isActive: true,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      // Sushi Express - California Roll addons
      {
        id: 19,
        productId: 9,
        addonId: 9,
        isActive: true,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 20,
        productId: 9,
        addonId: 10,
        isActive: true,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 21,
        productId: 9,
        addonId: 11,
        isActive: true,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      // Sushi Express - Spicy Tuna Roll addons
      {
        id: 22,
        productId: 10,
        addonId: 9,
        isActive: true,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 23,
        productId: 10,
        addonId: 10,
        isActive: true,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      // Taco Fiesta - Beef Taco addons
      {
        id: 24,
        productId: 12,
        addonId: 12,
        isActive: true,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 25,
        productId: 12,
        addonId: 13,
        isActive: true,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 26,
        productId: 12,
        addonId: 14,
        isActive: true,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      // Taco Fiesta - Chicken Burrito addons
      {
        id: 27,
        productId: 13,
        addonId: 12,
        isActive: true,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 28,
        productId: 13,
        addonId: 13,
        isActive: true,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      // Inactive addon relation
      {
        id: 29,
        productId: 1,
        addonId: 15,
        isActive: false,
        status: 'inactive',
        createdBy: 'restaurant',
        updatedBy: 'admin',
        createdAt: new Date('2023-11-01'),
        updatedAt: now
      },
      // active addon relation
      {
        id: 30,
        productId: 2,
        addonId: 16,
        isActive: false,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'admin',
        createdAt: new Date('2023-09-01'),
        updatedAt: now
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('addonsPerProduct', null, {});
  }
};

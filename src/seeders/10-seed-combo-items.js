'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    
    return queryInterface.bulkInsert('comboItems', [
      // Pizza Party Combo (2 pizzas + garlic bread)
      {
        id: 1,
        comboId: 1,
        productId: 1,
        quantity: 1,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        comboId: 1,
        productId: 2,
        quantity: 1,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 3,
        comboId: 1,
        productId: 4,
        quantity: 2,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      // Family Pizza Deal (3 pizzas + 2 garlic bread)
      {
        id: 4,
        comboId: 2,
        productId: 1,
        quantity: 1,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 5,
        comboId: 2,
        productId: 2,
        quantity: 1,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 6,
        comboId: 2,
        productId: 3,
        quantity: 1,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 7,
        comboId: 2,
        productId: 4,
        quantity: 2,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      // Burger Meal Deal (1 burger + fries)
      {
        id: 8,
        comboId: 3,
        productId: 5,
        quantity: 1,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 9,
        comboId: 3,
        productId: 8,
        quantity: 1,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      // Double Burger Combo (2 burgers + 2 fries)
      {
        id: 10,
        comboId: 4,
        productId: 5,
        quantity: 1,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 11,
        comboId: 4,
        productId: 6,
        quantity: 1,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 12,
        comboId: 4,
        productId: 8,
        quantity: 2,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      // Sushi Platter (2 rolls + sashimi)
      {
        id: 13,
        comboId: 5,
        productId: 9,
        quantity: 1,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 14,
        comboId: 5,
        productId: 10,
        quantity: 1,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 15,
        comboId: 5,
        productId: 11,
        quantity: 1,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      // Taco Tuesday Special (3 tacos + burrito)
      {
        id: 16,
        comboId: 6,
        productId: 12,
        quantity: 3,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 17,
        comboId: 6,
        productId: 13,
        quantity: 1,
        status: 'active',
        createdBy: 'restaurant',
        updatedBy: 'restaurant',
        createdAt: now,
        updatedAt: now
      },
      // Expired Combo items
      {
        id: 18,
        comboId: 7,
        productId: 1,
        quantity: 2,
        status: 'inactive',
        createdBy: 'restaurant',
        updatedBy: 'admin',
        createdAt: new Date('2023-06-01'),
        updatedAt: now
      },
      // Deleted Combo items
      {
        id: 19,
        comboId: 8,
        productId: 5,
        quantity: 1,
        status: 'deleted',
        createdBy: 'restaurant',
        updatedBy: 'admin',
        createdAt: new Date('2023-05-01'),
        updatedAt: now
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('comboItems', null, {});
  }
};

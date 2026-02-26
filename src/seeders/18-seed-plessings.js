'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 7);
    
    return queryInterface.bulkInsert('offers', [
      {
        name: null,
        productId: 1,
        type: 'plessing',
        amount: null,
        percentage: null,
        status: 'active',
        isDeleted: false,
        isActive: true,
        isPleassing: true,
        quantity: 50,
        plessingPrice: 8.99,
        startDate: now,
        endDate: futureDate,
        createdBy: 'Pizza Palace',
        updatedBy: 'Pizza Palace',
        createdAt: now,
        updatedAt: now
      },
      {
        name: null,
        productId: 2,
        type: 'plessing',
        amount: null,
        percentage: null,
        status: 'active',
        isDeleted: false,
        isActive: true,
        isPleassing: true,
        quantity: 30,
        plessingPrice: 10.99,
        startDate: now,
        endDate: futureDate,
        createdBy: 'Pizza Palace',
        updatedBy: 'Pizza Palace',
        createdAt: now,
        updatedAt: now
      },
      {
        name: null,
        productId: 5,
        type: 'plessing',
        amount: null,
        percentage: null,
        status: 'active',
        isDeleted: false,
        isActive: true,
        isPleassing: true,
        quantity: 100,
        plessingPrice: 6.99,
        startDate: now,
        endDate: futureDate,
        createdBy: 'Burger House',
        updatedBy: 'Burger House',
        createdAt: now,
        updatedAt: now
      },
      {
        name: null,
        productId: 6,
        type: 'plessing',
        amount: null,
        percentage: null,
        status: 'active',
        isDeleted: false,
        isActive: true,
        isPleassing: true,
        quantity: 25,
        plessingPrice: 9.49,
        startDate: now,
        endDate: futureDate,
        createdBy: 'Burger House',
        updatedBy: 'Burger House',
        createdAt: now,
        updatedAt: now
      },
      {
        name: null,
        productId: 9,
        type: 'plessing',
        amount: null,
        percentage: null,
        status: 'active',
        isDeleted: false,
        isActive: true,
        isPleassing: true,
        quantity: 40,
        plessingPrice: 11.99,
        startDate: now,
        endDate: futureDate,
        createdBy: 'Sushi Master',
        updatedBy: 'Sushi Master',
        createdAt: now,
        updatedAt: now
      },
      {
        name: null,
        productId: 3,
        type: 'plessing',
        amount: null,
        percentage: null,
        status: 'active',
        isDeleted: false,
        isActive: false,
        isPleassing: true,
        quantity: 10,
        plessingPrice: 15.99,
        startDate: pastDate,
        endDate: now,
        createdBy: 'Pizza Palace',
        updatedBy: 'Pizza Palace',
        createdAt: pastDate,
        updatedAt: now
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('offers', {
      isPleassing: true
    }, {});
  }
};

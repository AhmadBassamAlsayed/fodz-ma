'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    
    return queryInterface.bulkInsert('configs', [
      {
        id: 1,
        name: 'baseKm',
        value: '2',
        status: 'active',
        createdBy: 'system',
        updatedBy: 'system',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        name: 'basePrice',
        value: '40',
        status: 'active',
        createdBy: 'system',
        updatedBy: 'system',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 3,
        name: 'afterBasePrice',
        value: '25',
        status: 'active',
        createdBy: 'system',
        updatedBy: 'system',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 4,
        name: 'dManPersentage',
        value: '15',
        status: 'active',
        createdBy: 'system',
        updatedBy: 'system',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 5,
        name: 'systemFees',
        value: '40',
        status: 'active',
        createdBy: 'system',
        updatedBy: 'system',
        createdAt: now,
        updatedAt: now
      },
      {
        id:6,
        name: 'homeKillSwitch',
        value: 'true',
        status: 'active',
        createdBy: 'system',
        updatedBy: 'system',
        createdAt: now,
        updatedAt: now
      },
      {
        id:7,
        name: 'restaurantKillSwitch',
        value: 'true',
        status: 'active',
        createdBy: 'system',
        updatedBy: 'system',
        createdAt: now,
        updatedAt: now
      },
      {
        id:8,
        name: 'plessingKillSwitch',
        value: 'true',
        status: 'active',
        createdBy: 'system',
        updatedBy: 'system',
        createdAt: now,
        updatedAt: now
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('configs', null, {});
  }
};

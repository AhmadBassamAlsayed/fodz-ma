'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('string', 10);
    const now = new Date();
    
    return queryInterface.bulkInsert('admins', [
      {
        id: 1,
        name: 'Admin User',
        phoneNumber: '0999999999',
        emailAddress: 'admin@example.com',
        password: hashedPassword,
        emailVerified: true,
        isActive: true,
        lastLogin: null,
        status: 'active',
        createdBy: 'system',
        updatedBy: 'system',
        createdAt: now,
        updatedAt: now
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('admins', null, {});
  }
};

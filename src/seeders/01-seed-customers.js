'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPasswordString = await bcrypt.hash('string', 10);
    const hashedPasswordDefault = await bcrypt.hash('password', 10);
    const now = new Date();
    
    return queryInterface.bulkInsert('customers', [
      {
        id: 1,
        name: 'Test User',
        phoneNumber: '0999999999',
        emailAddress: 'testuser@example.com',
        password: hashedPasswordString,
        emailVerified: true,
        isActive: true,
        lastLogin: new Date('2024-11-01'),
        status: 'active',
        createdBy: 'system',
        updatedBy: 'system',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        name: 'Jane Smith',
        phoneNumber: '+1234567891',
        emailAddress: 'jane.smith@example.com',
        password: hashedPasswordDefault,
        emailVerified: true,
        isActive: true,
        lastLogin: new Date('2024-10-20'),
        status: 'active',
        createdBy: 'system',
        updatedBy: 'system',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 3,
        name: 'Bob Johnson',
        phoneNumber: '+1234567892',
        emailAddress: 'bob.johnson@example.com',
        password: hashedPasswordDefault,
        emailVerified: true,
        isActive: true,
        lastLogin: new Date('2024-10-25'),
        status: 'active',
        createdBy: 'system',
        updatedBy: 'system',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 4,
        name: 'Alice Williams',
        phoneNumber: '+1234567893',
        emailAddress: 'alice.williams@example.com',
        password: hashedPasswordDefault,
        emailVerified: true,
        isActive: true,
        lastLogin: new Date('2024-10-28'),
        status: 'active',
        createdBy: 'system',
        updatedBy: 'system',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 5,
        name: 'Charlie Brown',
        phoneNumber: '+1234567894',
        emailAddress: 'charlie.brown@example.com',
        password: hashedPasswordDefault,
        emailVerified: true,
        isActive: true,
        lastLogin: new Date('2024-10-30'),
        status: 'active',
        createdBy: 'system',
        updatedBy: 'system',
        createdAt: now,
        updatedAt: now
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('customers', null, {});
  }
};

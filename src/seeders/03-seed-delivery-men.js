'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('delivery123', 10);
    const now = new Date();
    
    return queryInterface.bulkInsert('deliveryMen', [
      {
        id: 1,
        name: 'Mike Driver',
        password: hashedPassword,
        phoneNumber: '+1234567700',
        emailAddress: 'mike.driver@example.com',
        pdfPath: 'resources/delivery_pdf/seed-driver-1.pdf',
        rate: 4.8,
        account: 'ACC001',
        wallet: 1250.50,
        deliveredOrders: 342,
        isActive: true,
        status: 'active',
        isDeleted: false,
        createdBy: 'system',
        updatedBy: 'system',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        name: 'Sarah Courier',
        password: hashedPassword,
        phoneNumber: '+1234567701',
        emailAddress: 'sarah.courier@example.com',
        pdfPath: 'resources/delivery_pdf/seed-driver-2.pdf',
        rate: 4.9,
        account: 'ACC002',
        wallet: 890.75,
        deliveredOrders: 215,
        status: 'active',
        createdBy: 'system',
        updatedBy: 'system',
        createdAt: now,
        isActive: true,
        isDeleted: false,

        updatedAt: now
      },
      {
        id: 3,
        name: 'Tom Delivery',
        password: hashedPassword,
        phoneNumber: '+1234567702',
        emailAddress: 'tom.delivery@example.com',
        pdfPath: 'resources/delivery_pdf/seed-driver-3.pdf',
        rate: 4.6,
        account: 'ACC003',
        wallet: 2100.00,
        deliveredOrders: 567,
        status: 'active',
        createdBy: 'system',
        isActive: true,
        isDeleted: false,

        updatedBy: 'system',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 4,
        name: 'Lisa Transport',
        password: hashedPassword,
        phoneNumber: '+1234567703',
        emailAddress: 'lisa.transport@example.com',
        pdfPath: 'resources/delivery_pdf/seed-driver-4.pdf',
        rate: 4.5,
        account: 'ACC004',
        wallet: 450.25,
        isActive: true,
        isDeleted: false,

        deliveredOrders: 98,
        status: 'inactive',
        createdBy: 'system',
        updatedBy: 'admin',
        createdAt: new Date('2023-11-01'),
        updatedAt: now
      },
      {
        id: 5,
        name: 'David Express',
        password: hashedPassword,
        phoneNumber: '+1234567704',
        emailAddress: null,
        pdfPath: 'resources/delivery_pdf/seed-driver-5.pdf',
        rate: 4.2,
        account: 'ACC005',
        wallet: 0.00,
        isActive: true,
        isDeleted: false,

        deliveredOrders: 45,
        status: 'deleted',
        createdBy: 'system',
        updatedBy: 'admin',
        createdAt: new Date('2023-09-01'),
        updatedAt: now
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('deliveryMen', null, {});
  }
};

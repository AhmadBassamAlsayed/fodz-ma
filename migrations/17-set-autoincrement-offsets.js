'use strict';

/**
 * Migration to set AUTO_INCREMENT starting values for each table
 * Each table's ID will start from: table_number * 100
 * 
 * Table mapping:
 * 01 - customers:        100
 * 02 - restaurants:      200
 * 03 - deliveryMen:      300
 * 04 - addresses:        400
 * 05 - categories:       500
 * 06 - products:         600
 * 07 - addons:           700
 * 08 - addonsPerProduct: 800
 * 09 - offers:           900
 * 10 - combos:          1000
 * 11 - comboItems:      1100
 * 12 - carts:           1200
 * 13 - cartItems:       1300
 * 14 - orders:          1400
 * 15 - orderItems:      1500
 * 16 - rates:           1600
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();

    const tables = [
      { name: 'customers', number: 1 },
      { name: 'restaurants', number: 2 },
      { name: 'deliveryMen', number: 3 },
      { name: 'addresses', number: 4 },
      { name: 'categories', number: 5 },
      { name: 'products', number: 6 },
      { name: 'addons', number: 7 },
      { name: 'addonsPerProduct', number: 8 },
      { name: 'offers', number: 9 },
      { name: 'combos', number: 10 },
      { name: 'comboItems', number: 11 },
      { name: 'carts', number: 12 },
      { name: 'cartItems', number: 13 },
      { name: 'orders', number: 14 },
      { name: 'orderItems', number: 15 },
      { name: 'rates', number: 16 }
    ];

    if (dialect === 'postgres') {
      // PostgreSQL uses sequences
      for (const table of tables) {
        const startValue = table.number * 100;
        const sequenceName = `${table.name}_id_seq`;
        
        try {
          await queryInterface.sequelize.query(
            `ALTER SEQUENCE "${sequenceName}" RESTART WITH ${startValue};`
          );
          console.log(`✓ Set ${table.name} ID sequence to start at ${startValue}`);
        } catch (error) {
          console.warn(`⚠ Could not set sequence for ${table.name}:`, error.message);
        }
      }
    } else if (dialect === 'mysql' || dialect === 'mariadb') {
      // MySQL uses AUTO_INCREMENT
      for (const table of tables) {
        const startValue = table.number * 100;
        
        try {
          await queryInterface.sequelize.query(
            `ALTER TABLE \`${table.name}\` AUTO_INCREMENT = ${startValue};`
          );
          console.log(`✓ Set ${table.name} AUTO_INCREMENT to ${startValue}`);
        } catch (error) {
          console.warn(`⚠ Could not set AUTO_INCREMENT for ${table.name}:`, error.message);
        }
      }
    } else {
      console.warn(`⚠ Unsupported dialect: ${dialect}. Manual configuration required.`);
    }
  },

  async down(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();

    const tables = [
      'customers', 'restaurants', 'deliveryMen', 'addresses', 'categories',
      'products', 'addons', 'addonsPerProduct', 'offers', 'combos',
      'comboItems', 'carts', 'cartItems', 'orders', 'orderItems', 'rates'
    ];

    if (dialect === 'postgres') {
      // Reset sequences to 1
      for (const table of tables) {
        const sequenceName = `${table}_id_seq`;
        
        try {
          await queryInterface.sequelize.query(
            `ALTER SEQUENCE "${sequenceName}" RESTART WITH 1;`
          );
          console.log(`✓ Reset ${table} ID sequence to 1`);
        } catch (error) {
          console.warn(`⚠ Could not reset sequence for ${table}:`, error.message);
        }
      }
    } else if (dialect === 'mysql' || dialect === 'mariadb') {
      // Reset AUTO_INCREMENT to 1
      for (const table of tables) {
        try {
          await queryInterface.sequelize.query(
            `ALTER TABLE \`${table}\` AUTO_INCREMENT = 1;`
          );
          console.log(`✓ Reset ${table} AUTO_INCREMENT to 1`);
        } catch (error) {
          console.warn(`⚠ Could not reset AUTO_INCREMENT for ${table}:`, error.message);
        }
      }
    }
  }
};

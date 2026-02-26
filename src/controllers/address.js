const { Address, sequelize } = require('../../models');
const { Op } = require('sequelize');

const createAddress = async (req, res) => {
  try {
    const { name, city, country, street, notes, type, latitude, longitude } = req.body;

    // Validation - all fields are required
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    if (longitude === undefined || longitude === null) {
      return res.status(400).json({ message: 'Longitude is required' });
    }
    if (latitude === undefined || latitude === null) {
      return res.status(400).json({ message: 'Latitude is required' });
    }
    if (!city) {
      return res.status(400).json({ message: 'City is required' });
    }
    if (!country) {
      return res.status(400).json({ message: 'Country is required' });
    }
    if (!street) {
      return res.status(400).json({ message: 'Street is required' });
    }
    if (!notes) {
      return res.status(400).json({ message: 'Notes is required' });
    }
    if (!type) {
      return res.status(400).json({ message: 'Type is required' });
    }

    // Type-based authorization check
    if (type === 'restaurant') {
      // If type is restaurant, creator must be a restaurant
      if (req.user.role !== 'restaurant') {
        return res.status(403).json({ message: 'Only restaurants can create restaurant addresses' });
      }
    } else if (type === 'customer') {
      // If type is customer, creator must be a customer
      if (req.user.role !== 'customer') {
        return res.status(403).json({ message: 'Only customers can create customer addresses' });
      }
    } else {
      return res.status(400).json({ message: 'Type must be either "customer" or "restaurant"' });
    }

    // Create address with appropriate foreign key
    const addressData = {
      name,
      city,
      country,
      street,
      notes,
      type,
      latitude,
      longitude,
      status: 'active',
      isDefault: false,
      isActive: true,
      createdBy: req.user.name || null,
      updatedBy: req.user.name || null
    };

    // Set the appropriate foreign key based on type
    if (type === 'restaurant') {
      addressData.restaurantId = req.user.restaurantId;
    } else if (type === 'customer') {
      addressData.customerId = req.user.customerId;
    }

    const address = await Address.create(addressData);

    // Return only id, name, city, country
    return res.status(201).json({
      message: 'Address created successfully',
      address: {
        id: address.id,
        name: address.name,
        city: address.city,
        country: address.country
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
    console.log(error.message);
    console.log(error);
  }
};

const deleteAddress = async (req, res) => {
  try {
    let { address_id } = req.params;
    const customerId = req.body.customerId;

    // Authorization check
    if (customerId !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validate address_id
    address_id = Number(address_id);
    if (!Number.isInteger(address_id)) {
      return res.status(400).json({ message: 'Invalid address identifier' });
    }

    // Find address belonging to customer
    const address = await Address.findOne({ 
      where: { 
        id: address_id, 
        customerId: req.user.id,
        isDefault: false
      } 
    });
    
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // Soft delete
    await address.update({ 
      isActive: false, 
      isDeleted: true,
      updatedBy: req.user.name || null
    });

    return res.status(200).json({
      message: 'Address deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
    console.log(error.message);
    console.log(error);
  }
};

const updateAddress = async (req, res) => {
  try {
    const { customerId, name, streetAddress, city, country, street, stateRegion, isDefault, phone, notes, type, latitude, longitude } = req.body;
    
    // Authorization check
    if (customerId !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validate address_id
    let { address_id } = req.params;
    address_id = Number(address_id);
    if (!Number.isInteger(address_id)) {
      return res.status(400).json({ message: 'Invalid address identifier' });
    }

    // Find address belonging to customer
    const address = await Address.findOne({ 
      where: { 
        id: address_id, 
        customerId: req.user.id 
      } 
    });
    
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // Update only provided fields
    const updateData = {
      updatedBy: req.user.name || null
    };
    
    if (name !== undefined) updateData.name = name;
    if (streetAddress !== undefined) updateData.streetAddress = streetAddress;
    if (city !== undefined) updateData.city = city;
    if (country !== undefined) updateData.country = country;
    if (street !== undefined) updateData.street = street;
    if (stateRegion !== undefined) updateData.stateRegion = stateRegion;
    if (isDefault !== undefined) updateData.isDefault = isDefault;
    if (phone !== undefined) updateData.phone = phone;
    if (notes !== undefined) updateData.notes = notes;
    if (type !== undefined) updateData.type = type;
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;

    await address.update(updateData);

    return res.status(200).json({
      message: 'Address updated successfully',
      address
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
    console.log(error.message);
    console.log(error);
  }
};


const getAddresses = async (req, res) => {
  try {
    // Build where clause based on user role
    const whereClause = {
      isDeleted: false
    };

    if (req.user.role === 'customer') {
      whereClause.customerId = req.user.customerId;
    } else if (req.user.role === 'restaurant') {
      whereClause.restaurantId = req.user.restaurantId;
    }

    // Get all non-deleted addresses for authenticated user
    const addresses = await Address.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      message: 'Addresses fetched successfully',
      addresses
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
    console.log(error.message);
    console.log(error);
  }
};

const setDefaultAddress = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    let { address_id } = req.params;
    const { customerId } = req.body;

    // Authorization check
    if (customerId !== req.user.id) {
      await transaction.rollback();
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validate address_id
    address_id = Number(address_id);
    if (!Number.isInteger(address_id)) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Invalid address identifier' });
    }

    // Find the address to set as default
    console.log(address_id);
    const address = await Address.findOne({
      where: {
        id: address_id,
        customerId: req.user.id,
        isActive: true,
        isDeleted: false
      }
    });

    if (!address) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Address not found' });
    }

    // Set all other addresses for this customer to not default
    await Address.update(
      {
        isDefault: false,
        updatedBy: req.user.name || null
      },
      {
        where: {
          customerId: req.user.id,
          id: {
            [Op.ne]: address_id
          }
        },
        transaction
      }
    );

    // Set the selected address as default
    await address.update(
      {
        isDefault: true,
        updatedBy: req.user.name || null
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(200).json({
      message: 'Default address updated successfully',
      address: {
        id: address.id,
        name: address.name,
        isDefault: address.isDefault
      }
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: 'Server error' });
    console.log(error.message);
    console.log(error);
  }
}

module.exports = {
  createAddress,
  deleteAddress,
  updateAddress,
  getAddresses,
  setDefaultAddress
};

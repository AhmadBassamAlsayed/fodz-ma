const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Customer, Restaurant, DeliveryMan, Admin, Address, OTP, sequelize } = require('../../models');
const { Op } = require('sequelize');
const { getImageUrl, deleteImage } = require('../middleware/imageUpload');
const { generateOTP, sendOTP } = require('../services/beonService');
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

// name,
// streetAddress,
// isDefault,
// city,
// country,
// street,
// stateRegion,
// customerId,
// restaurantId,
// type,
// latitude,
// longitude

const deletee = async (req, res) => {
  try {
    const { type, phoneNumber, pass } = req.body;

    if (!type || !phoneNumber || !pass) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let account;
    let successMessage;

    if (type === 'res') {
      account = await Restaurant.findOne({ where: { phoneNumber } });
      successMessage = 'restaurant account deleted successfully';
    } else if (type === 'cus') {
      account = await Customer.findOne({ where: { phoneNumber } });
      successMessage = 'customer account deleted successfully';
    } else {
      return res.status(400).json({ message: 'Invalid type' });
    }

    if (!account || account.isDeleted === true) {
      return res.status(404).json({ message: 'wrong credentials' });
    }

    const isPasswordValid = await bcrypt.compare(pass, account.password);
    if (!isPasswordValid) {
      return res.status(404).json({ message: 'wrong credentials' });
    }

    const timestamp = Date.now();
    const deletedSuffix = `_deleted_${timestamp}`;

    if (account.phoneNumber) {
      account.phoneNumber = `${account.phoneNumber}${deletedSuffix}`;
    }
    if (account.emailAddress) {
      account.emailAddress = `${account.emailAddress}${deletedSuffix}`;
    }

    account.isDeleted = true;
    if (Object.prototype.hasOwnProperty.call(account.dataValues, 'isActive')) {
      account.isActive = false;
    }
    if (Object.prototype.hasOwnProperty.call(account.dataValues, 'status')) {
      account.status = 'deleted';
    }

    await account.save();

    return res.status(200).json({ message: successMessage });

  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};



const setFcmToken = async (req, res) => {
    try {
      const {fcmToken} = req.body;
      if(!fcmToken){
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      if(req.user.role === 'customer'){
        await Customer.update({
          fcmToken: fcmToken
        }, {
          where: {
            id: req.user.id
          }
        });
      }else if(req.user.role === 'restaurant'){
        await Restaurant.update({
          fcmToken: fcmToken
        }, {
          where: {
            id: req.user.id
          }
        });
      }else if(req.user.role === 'deliveryman'){
        await DeliveryMan.update({
          fcmToken: fcmToken
        }, {
          where: {
            id: req.user.id
          }
        });
      }
      
      res.status(200).json({ 
        message: 'FCM token updated successfully' 
      });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
}

const registerCustomer = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    let { name, phoneNumber, emailAddress, password, address } = req.body;

    if (!password || !name || !phoneNumber) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate address fields if address is provided
    if (address) {
      let { city, country, street, notes, latitude, longitude, type } = address;
      if (!city || !country || !street || latitude === undefined || longitude === undefined || !type) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Missing required address fields: city, country, street, latitude, longitude, and type are required' });
      }
      // Validate type is one of the allowed values
      const allowedTypes = ['customer', 'restaurant'];
      if (!allowedTypes.includes(type)) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Invalid address type. Must be one of: customer, restaurant' });
      }
    }

    let existingCustomer;
    if(emailAddress){
      existingCustomer = await Customer.findOne({
        where: {
          [Op.or]: [{ emailAddress }, { phoneNumber }]  
        },
        transaction
      });
    }else{
      existingCustomer = await Customer.findOne({
        where: {
          phoneNumber
        },
        transaction
      });
    }
    if (existingCustomer) {
        const conflicts = [];
        if (existingCustomer.emailAddress === emailAddress) {
            conflicts.push('email address');
        }
        if (existingCustomer.phoneNumber === phoneNumber) {
            conflicts.push('phone number');
        }
        const message =
            conflicts.length === 1
                ? `The ${conflicts[0]} is already in use`
                : `The following fields are already in use: ${conflicts.join(', ')}`;
        await transaction.rollback();
        return res.status(400).json({ message });
    }
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Create customer within transaction
    const customer = await Customer.create({
      name,
      phoneNumber,
      emailAddress,
      password: hashedPassword,
      status: 'active',
      isActive: false
    }, { transaction });
    
    // Create address for the customer if provided
    let createdAddress = null;
    if (address) {
      createdAddress = await Address.create({
        name: address.name || customer.name,
        streetAddress: address.streetAddress || null,
        isDefault: address.isDefault !== undefined ? address.isDefault : true,
        city: address.city,
        country: address.country,
        street: address.street,
        stateRegion: address.stateRegion || null,
        phone: address.phone || phoneNumber,
        notes: address.notes,
        customerId: customer.id,
        type: address.type,
        latitude: address.latitude,
        longitude: address.longitude,
        status: 'active',
        isActive: true
      }, { transaction });
    }

    // Generate and save OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    await OTP.create({
      customerId: customer.id,
      phoneNumber: customer.phoneNumber,
      code: otpCode,
      expiresAt: expiresAt,
      isUsed: false,
      attempts: 0
    }, { transaction });

    // Commit transaction
    await transaction.commit();
    
    // Send OTP via BeOn (after transaction commit)
    const otpResult = await sendOTP(customer.phoneNumber, otpCode, customer.name);
    
    if (!otpResult.success) {
      console.error('Failed to send OTP:', otpResult.error);
    }

    res.status(201).json({
      message: 'Customer registered successfully. Please verify your phone number with the OTP sent.',
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.emailAddress,
        phoneNumber: customer.phoneNumber,
        isActive: customer.isActive,
        address: createdAddress
      },
      requiresOTP: true
    });

  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: 'Server error'});
    console.log(error.message);
    console.log(error);
    
  }
};

const loginCustomer = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;
    if (!phoneNumber || !password) {
      return res.status(400).json({ message: 'Username or email and password are required' });
    }
    const customer = await Customer.findOne({
      where: {
        phoneNumber:phoneNumber
      },include:[{
        model:Address,
        as:'addresses',
        required:false,
        where:{
          isDefault:true,
        }
      }]
    });
    if (!customer || customer.isDeleted === true) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if customer is active
    if (!customer.isActive) {
      return res.status(403).json({ message: 'Account is not active' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    await customer.update({ 
        lastLogin: new Date() 
    });

    const token = jwt.sign({ id: customer.id, role: 'customer' }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
    
    return res.status(200).json({
      message: 'Login successful',
      token,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.emailAddress,
        phoneNumber: customer.phoneNumber,
        isActive: customer.isActive,
        address: customer.addresses[0]
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const registerRestaurant = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
        name,
        phoneNumber,
        emailAddress,
        password,
        description,
        deliveryDistanceKm,
        type,
        address,
        FCMtoken,
        fcmToken
    } = req.body;

    let addressObj = null;
    if (address) {
      try {
        addressObj = JSON.parse(address);
      } catch (e) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Invalid address format' });
      }
    }

    if (!password || !name || !phoneNumber) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Missing required fields' });
    }
    // Validate address fields if address is provided
    if (addressObj) {
      const { city, country, street, notes, latitude, longitude, type } = addressObj;
      if (!city || !country || !street || !notes || latitude === undefined || longitude === undefined || !type) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Missing required address fields: city, country, street, notes, latitude, longitude, and type are required' });
      }
      // Validate type is one of the allowed values
      const allowedTypes = ['customer', 'restaurant'];
      if (!allowedTypes.includes(type)) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Invalid address type. Must be one of: customer, restaurant' });
      }
    }
    let existingRestaurant;
    if (emailAddress) {
      existingRestaurant = await Restaurant.findOne({
        where: {
          [Op.or]: [{ emailAddress }, { phoneNumber }]
        },
        transaction
      });
    } else {
      existingRestaurant = await Restaurant.findOne({
        where: {
          phoneNumber
        },
        transaction
      });
    }

    if (existingRestaurant) {
      const conflicts = [];
      if (existingRestaurant.emailAddress === emailAddress) {
        conflicts.push('email address');
      }
      if (existingRestaurant.phoneNumber === phoneNumber) {
        conflicts.push('phone number');
      }

      const message =
        conflicts.length === 1
          ? `The ${conflicts[0]} is already in use`
          : `The following fields are already in use: ${conflicts.join(', ')}`;
      await transaction.rollback();
      return res.status(400).json({ message });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const deliveryDistanceValue = deliveryDistanceKm || null;
    const latitudeValue = addressObj ? addressObj.latitude : null;
    const longitudeValue = addressObj ? addressObj.longitude : null;
    const restaurantData = {
      name,
      phoneNumber,
      emailAddress,
      password: hashedPassword,
      type
    };

    if (FCMtoken || fcmToken) restaurantData.fcmToken = FCMtoken || fcmToken;

    if (description !== undefined) restaurantData.description = description;
    if (deliveryDistanceValue !== undefined) restaurantData.deliveryDistanceKm = deliveryDistanceValue;
    if (latitudeValue !== undefined) restaurantData.latitude = latitudeValue;
    if (longitudeValue !== undefined) restaurantData.longitude = longitudeValue;

    // Handle optional photo and cover image uploads
    if (req.files) {
      if (req.files.photo && req.files.photo[0]) {
        restaurantData.photoUrl = getImageUrl(req.files.photo[0].filename);
      }
      if (req.files.cover && req.files.cover[0]) {
        restaurantData.coverUrl = getImageUrl(req.files.cover[0].filename);
      }
      if (req.files.healthLicense && req.files.healthLicense[0]) {
        restaurantData.pdfUrl = getImageUrl(req.files.healthLicense[0].filename);
      }
    }

    // Create restaurant within transaction
    const restaurant = await Restaurant.create(restaurantData, { transaction });

    // Create address for the restaurant if provided
    let createdAddress = null;
    if (addressObj) {
      createdAddress = await Address.create({
        name: addressObj.name || name,
        streetAddress: addressObj.streetAddress || null,
        isDefault: addressObj.isDefault !== undefined ? addressObj.isDefault : true,
        city: addressObj.city,
        country: addressObj.country,
        street: addressObj.street,
        stateRegion: addressObj.stateRegion || null,
        phone: addressObj.phone || phoneNumber,
        notes: addressObj.notes,
        restaurantId: restaurant.id,
        type: addressObj.type,
        latitude: addressObj.latitude,
        longitude: addressObj.longitude,
        status: 'active',
        isActive: true
      }, { transaction });
    }

    // Commit transaction
    await transaction.commit();

    res.status(201).json({message: 'Restaurant registered successfully'});
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: 'Server error' });
    console.log(error.message);
    console.log(error);
  }
};

const loginRestaurant = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    if (!phoneNumber || !password) {
      return res.status(400).json({ message: 'Username or email and password are required' });
    }

    const restaurant = await Restaurant.findOne({
      where: {
        phoneNumber
      },include:[{
        model:Address,
        as:'addresses',
        required:false,
        where:{
          isDefault:true,
          isActive:true
        }
      }]
    });
    if (!restaurant || restaurant.isDeleted === true) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if restaurant is active
    if (!restaurant.isActive) {
      return res.status(403).json({ message: 'Account is not active' });
    }

    // Check if restaurant is verified
    if (!restaurant.isVerified) {
      return res.status(403).json({ message: 'Account is not verified' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, restaurant.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: restaurant.id, role: 'restaurant' }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    return res.status(200).json({
      message: 'Login successful',
      token,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        email: restaurant.emailAddress,
        phoneNumber: restaurant.phoneNumber,
        address: restaurant.addresses[0]
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
  
const registerDeliveryMan = async (req, res) => {
  const fs = require('fs');
  const { getPdfUrl } = require('../middleware/upload');
  try {
    const {
      name,
      phoneNumber,
      emailAddress,
      city,
      password
    } = req.body;

    // Check if at least one PDF file was uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: 'At least one PDF file is required' });
    }

    if (!password || !name || !phoneNumber) {
      // Delete uploaded files if validation fails
      if (req.files) {
        Object.values(req.files).forEach(fileArray => {
          fileArray.forEach(file => {
            if (file.path) fs.unlinkSync(file.path);
          });
        });
      }
      return res.status(400).json({ message: 'Missing required fields: name, phoneNumber, password' });
    }

    // Check for existing delivery man with same phone or email
    let existingDeliveryMan;
    if (emailAddress) {
      existingDeliveryMan = await DeliveryMan.findOne({
        where: {
          [Op.or]: [{ phoneNumber }, { emailAddress }]
        }
      });
    } else {
      existingDeliveryMan = await DeliveryMan.findOne({
        where: {
          phoneNumber
        }
      });
    }

    if (existingDeliveryMan) {
      // Delete uploaded files if user already exists
      if (req.files) {
        Object.values(req.files).forEach(fileArray => {
          fileArray.forEach(file => {
            if (file.path) fs.unlinkSync(file.path);
          });
        });
      }
      
      const conflicts = [];
      if (existingDeliveryMan.phoneNumber === phoneNumber) {
        conflicts.push('phone number');
      }
      if (emailAddress && existingDeliveryMan.emailAddress === emailAddress) {
        conflicts.push('email address');
      }

      const message =
        conflicts.length === 1
          ? `The ${conflicts[0]} is already in use`
          : `The following fields are already in use: ${conflicts.join(', ')}`;
      return res.status(400).json({ message });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Store full URLs to PDFs
    const pdf1 = req.files.pdf1 ? req.files.pdf1[0] : null;
    const pdf2 = req.files.pdf2 ? req.files.pdf2[0] : null;
    const pdf3 = req.files.pdf3 ? req.files.pdf3[0] : null;

    const deliveryManData = {
      name,
      phoneNumber,
      emailAddress: emailAddress || null,
      city: city || null,
      password: hashedPassword,
      pdfPath: pdf1 ? getPdfUrl(pdf1.filename) : '',
      pdf1Url: pdf1 ? getPdfUrl(pdf1.filename) : null,
      pdf2Url: pdf2 ? getPdfUrl(pdf2.filename) : null,
      pdf3Url: pdf3 ? getPdfUrl(pdf3.filename) : null,
      isActive: true,
      isVerified: false
    };

    const deliveryMan = await DeliveryMan.create(deliveryManData);

    const token = jwt.sign({ id: deliveryMan.id, role: 'deliveryMan' }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.status(201).json({
      message: 'Delivery man registered successfully. Your account is pending admin verification.',
      deliveryMan: {
        id: deliveryMan.id,
        name: deliveryMan.name,
        phoneNumber: deliveryMan.phoneNumber,
        emailAddress: deliveryMan.emailAddress,
        city: deliveryMan.city,
        isActive: deliveryMan.isActive,
        isVerified: deliveryMan.isVerified
      }
    });
  } catch (error) {
    // Clean up uploaded files on error
    if (req.files) {
      Object.values(req.files).forEach(fileArray => {
        fileArray.forEach(file => {
          if (file.path) {
            try {
              fs.unlinkSync(file.path);
            } catch (unlinkError) {
              console.log('Error deleting file:', unlinkError);
            }
          }
        });
      });
    }
    res.status(500).json({ message: 'Server error' });
    console.log(error.message);
    console.log(error);
  }
};
  
const loginDeliveryMan = async (req, res) => {
  try {
    const { phoneNumber, emailAddress, password } = req.body;

    // Accept either phoneNumber or emailAddress
    if ((!phoneNumber && !emailAddress) || !password) {
      return res.status(400).json({ message: 'Phone number or email address and password are required' });
    }

    // Build query to find by phone or email
    let whereClause;
    if (phoneNumber && emailAddress) {
      whereClause = {
        [Op.or]: [{ phoneNumber }, { emailAddress }]
      };
    } else if (phoneNumber) {
      whereClause = { phoneNumber };
    } else {
      whereClause = { emailAddress };
    }

    const deliveryMan = await DeliveryMan.findOne({
      where: whereClause
    });
    console.log(whereClause);
    
    console.log(deliveryMan);
    

    if (!deliveryMan || deliveryMan.isDeleted === true) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if account is active and verified
    if (!deliveryMan.isActive || (deliveryMan.status && deliveryMan.status !== 'active')) {
      return res.status(403).json({ message: 'Account is not active' });
    }

    if (!deliveryMan.isVerified) {
      return res.status(403).json({ message: 'Account is not verified. Please wait for admin verification.' });
    }

    const isPasswordValid = await bcrypt.compare(password, deliveryMan.password);
    console.log('woooooooooooooooow');
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: deliveryMan.id, role: 'deliveryman' }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    return res.status(200).json({
      message: 'Login successful',
      token,
      deliveryMan: {
        id: deliveryMan.id,
        name: deliveryMan.name,
        phoneNumber: deliveryMan.phoneNumber,
        emailAddress: deliveryMan.emailAddress,
        isActive: deliveryMan.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    if (!phoneNumber || !password) {
      return res.status(400).json({ message: 'Phone number and password are required' });
    }
    const admin = await Admin.findOne({
      where: {
        phoneNumber
      }
    });

    if (!admin || admin.isDeleted === true) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!admin.isActive) {
      return res.status(403).json({ message: 'Account is not active' });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    await admin.update({ 
      lastLogin: new Date() 
    });

    const token = jwt.sign({ id: admin.id, role: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    return res.status(200).json({
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.emailAddress,
        phoneNumber: admin.phoneNumber,
        isActive: admin.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getCities = async (req, res) => {
  try {
    const cities = await Restaurant.findAll({
      where: {
        isActive: true,
        isVerified: true,
        isDeleted: false,
        city: {
          [Op.ne]: null
        }
      },
      attributes: [
        [sequelize.fn('DISTINCT', sequelize.col('city')), 'city']
      ],
      raw: true
    });

    const cityList = cities.map(item => item.city).filter(city => city && city.trim() !== '');

    return res.status(200).json({
      message: 'Cities fetched successfully',
      cities: cityList
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, code } = req.body;

    if (!phoneNumber || !code) {
      return res.status(400).json({ message: 'Phone number and OTP code are required' });
    }

    const customer = await Customer.findOne({
      where: { phoneNumber }
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    if (customer.isActive) {
      return res.status(400).json({ message: 'Account is already verified' });
    }

    const otp = await OTP.findOne({
      where: {
        customerId: customer.id,
        code: code,
        isUsed: false,
        expiresAt: {
          [Op.gt]: new Date()
        }
      },
      order: [['createdAt', 'DESC']]
    });

    if (!otp) {
      return res.status(400).json({ message: 'Invalid or expired OTP code' });
    }

    if (otp.attempts >= 5) {
      return res.status(400).json({ message: 'Too many attempts. Please request a new OTP' });
    }

    await otp.update({
      isUsed: true,
      attempts: otp.attempts + 1
    });

    await customer.update({
      isActive: true,
      emailVerified: true
    });

    const token = jwt.sign({ id: customer.id, role: 'customer' }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    return res.status(200).json({
      message: 'Phone number verified successfully',
      token,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.emailAddress,
        phoneNumber: customer.phoneNumber,
        isActive: customer.isActive
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const customer = await Customer.findOne({
      where: { phoneNumber }
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    if (customer.isActive) {
      return res.status(400).json({ message: 'Account is already verified' });
    }

    const lastOTP = await OTP.findOne({
      where: {
        customerId: customer.id
      },
      order: [['createdAt', 'DESC']]
    });

    if (lastOTP) {
      const timeSinceLastOTP = Date.now() - new Date(lastOTP.createdAt).getTime();
      const fiveMinutes = 5 * 60 * 1000;

      if (timeSinceLastOTP < fiveMinutes) {
        const remainingTime = Math.ceil((fiveMinutes - timeSinceLastOTP) / 1000);
        return res.status(429).json({ 
          message: `Please wait ${Math.ceil(remainingTime / 60)} minutes before requesting a new OTP`,
          remainingSeconds: remainingTime
        });
      }
    }

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.create({
      customerId: customer.id,
      phoneNumber: customer.phoneNumber,
      code: otpCode,
      expiresAt: expiresAt,
      isUsed: false,
      attempts: 0
    });

    const otpResult = await sendOTP(customer.phoneNumber, otpCode, customer.name);

    if (!otpResult.success) {
      console.error('Failed to send OTP:', otpResult.error);
      return res.status(500).json({ message: 'Failed to send OTP. Please try again later.' });
    }

    return res.status(200).json({
      message: 'OTP sent successfully',
      expiresIn: 600
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { 
    registerCustomer,
    loginCustomer,
    registerRestaurant,
    loginRestaurant,
    registerDeliveryMan,
    loginDeliveryMan,
    setFcmToken,
    loginAdmin,
    deletee,
    getCities,
    verifyOTP,
    resendOTP
};




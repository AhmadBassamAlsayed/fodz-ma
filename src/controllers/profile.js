const {Customer,Restaurant,DeliveryMan} = require('../../models');
const bcrypt = require('bcryptjs');
const getProfile = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if(req.user.role === 'customer'){
            const customer = await Customer.findByPk(id);
            if(!customer){
                return res.status(404).json({ message: 'Customer not found' });
            }
            const customerData = customer.toJSON();
            delete customerData.password;
            return res.status(200).json(customerData);
        }
        if(req.user.role === 'restaurant'){
            const restaurant = await Restaurant.findByPk(id);
            if(!restaurant){
                return res.status(404).json({ message: 'Restaurant not found' });
            }
            const restaurantData = restaurant.toJSON();
            delete restaurantData.password;
            return res.status(200).json(restaurantData);
        }
        if(req.user.role === 'deliveryman'){
            const deliveryman = await DeliveryMan.findByPk(id);
            if(!deliveryman){
                return res.status(404).json({ message: 'Deliveryman not found' });
            }
            const deliverymanData = deliveryman.toJSON();
            delete deliverymanData.password;
            return res.status(200).json(deliverymanData);
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
}
const updateProfile = async (req, res) => {
    try {
        const id = Number(req.params.id);   
        if(req.user.role === 'customer'){
            const customer = await Customer.findByPk(id);
            if(!customer){
                return res.status(404).json({ message: 'Customer not found' });
            }
            customer.name = req.body.name;
            customer.save();
            return res.status(200).json(customer);
        }
        if(req.user.role === 'restaurant'){
            const restaurant = await Restaurant.findByPk(req.user.id);
            if(!restaurant){
                return res.status(404).json({ message: 'Restaurant not found' });
            }
            
            restaurant.save();
            return res.status(200).json(restaurant);
        }
        if(req.user.role === 'deliveryman'){
            const deliveryman = await DeliveryMan.findByPk(req.user.id);
            if(!deliveryman){
                return res.status(404).json({ message: 'Deliveryman not found' });
            }
            return res.status(200).json(deliveryman);
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
}
const updateCustomerInfo = async (req, res) => {
    try {
        const customerId = req.user.customerId;
        const { name, emailAddress, currentPassword, newPassword } = req.body;

        // Validate that customer ID matches authenticated user
        if (!customerId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Find customer
        const customer = await Customer.findByPk(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Check if customer is active
        if (!customer.isActive) {
            return res.status(403).json({ message: 'Account is not active' });
        }

        // Validate at least one field is being updated
        if (!name && !emailAddress && !newPassword) {
            return res.status(400).json({ 
                message: 'At least one field must be provided for update (name, emailAddress, or newPassword)' 
            });
        }

        // Update name if provided
        if (name) {
            if (typeof name !== 'string' || name.trim().length === 0) {
                return res.status(400).json({ message: 'Name must be a non-empty string' });
            }
            if (name.trim().length > 120) {
                return res.status(400).json({ message: 'Name must not exceed 120 characters' });
            }
            customer.name = name.trim();
        }

        // Update email if provided
        if (emailAddress !== undefined) {
            // Allow null/empty to clear email
            if (emailAddress === null || emailAddress === '') {
                customer.emailAddress = null;
            } else {
                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(emailAddress)) {
                    return res.status(400).json({ message: 'Invalid email address format' });
                }
                if (emailAddress.length > 160) {
                    return res.status(400).json({ message: 'Email address must not exceed 160 characters' });
                }
                
                // Check if email is already used by another customer
                const existingCustomer = await Customer.findOne({
                    where: {
                        emailAddress: emailAddress,
                        id: { [require('sequelize').Op.ne]: customerId }
                    }
                });
                
                if (existingCustomer) {
                    return res.status(400).json({ message: 'Email address is already in use' });
                }
                
                customer.emailAddress = emailAddress;
                // Reset email verification if email changed
                customer.emailVerified = false;
            }
        }

        // Update password if provided
        if (newPassword) {
            // Require current password for password change
            if (!currentPassword) {
                return res.status(400).json({ 
                    message: 'Current password is required to set a new password' 
                });
            }

            // Verify current password
            const isPasswordValid = await bcrypt.compare(currentPassword, customer.password);
            if (!isPasswordValid) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }

            // Validate new password
            if (newPassword.length < 6) {
                return res.status(400).json({ 
                    message: 'New password must be at least 6 characters long' 
                });
            }

            // Hash and update password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            customer.password = hashedPassword;
        }

        // Update metadata
        customer.updatedBy = customer.name;
        await customer.save();

        // Return updated customer data (without password)
        const customerData = customer.toJSON();
        delete customerData.password;

        return res.status(200).json({
            message: 'Customer information updated successfully',
            customer: customerData
        });

    } catch (error) {
        console.error('Update customer info error:', error);
        return res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    updateCustomerInfo
}
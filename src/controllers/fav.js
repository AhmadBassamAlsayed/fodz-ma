const { Favorite, Product, Customer } = require('../../models');

const getFav = async (req, res) => {
    try {
        const customerId = Number(req.params.id);
        if(customerId!=req.user.id){
            return res.status(403).json({ message: 'Unauthorized' });
        }
        // Get all favorites for the customer
        const favorites = await Favorite.findAll({
            where: {
                customerId,
                isActive: true,
                status: 'active'
            },
            include: [
                {
                    model: Product,
                    as: 'product',
                    required: true,
                    where: {
                        isActive: true,
                        status: 'active',
                        forSale: true
                    },
                    attributes: ['id', 'name', 'description', 'salePrice', 'categoryId', 'restaurantId', 'photoUrl']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            message: 'Favorites retrieved successfully',
            favorites: favorites.map(fav => ({
                id: fav.id,
                product: {
                    ...fav.product.toJSON(),
                    photoUrl: fav.product.photoUrl || null
                },
                createdAt: fav.createdAt
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

const addFav = async (req, res) => {
    try {
        const productId = Number(req.params.id);
        const { customerId } = req.body;

        // Validation
        if (customerId!=req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Verify customer exists
        const customer = await Customer.findByPk(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Verify product exists and is active
        const product = await Product.findOne({
            where: {
                id: productId,
                isActive: true,
                status: 'active',
                forSale:true
            }
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if favorite already exists
        const existingFavorite = await Favorite.findOne({
            where: {
                customerId,
                productId
            }
        });

        if (existingFavorite) {
            // If it exists but is inactive, reactivate it
            if (!existingFavorite.isActive || existingFavorite.status !== 'active') {
                await existingFavorite.update({
                    isActive: true,
                    status: 'active',
                    updatedBy: req.user?.name || 'system'
                });
                return res.status(200).json({
                    message: 'Product added to favorites successfully',
                });
            }
            return res.status(400).json({ message: 'Product is already in favorites' });
        }

        // Create new favorite
        const favorite = await Favorite.create({
            customerId,
            productId,
            isActive: true,
            status: 'active',
            createdBy: req.user?.name || 'system',
            updatedBy: req.user?.name || 'system'
        });

        res.status(201).json({
            message: 'Product added to favorites successfully',
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

const deleteFav = async (req, res) => {
    try {
        const productId = Number(req.params.id);
        const { customerId } = req.body;

        // Validation
        if (customerId!=req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Find the favorite
        const favorite = await Favorite.findOne({
            where: {
                customerId,
                productId,
                isActive: true,
                status: 'active'
            }
        });

        if (!favorite) {
            return res.status(404).json({ message: 'Favorite not found' });
        }

        // Soft delete the favorite
        await favorite.update({
            isActive: false,
            status: 'removed',
            updatedBy: req.user?.name || 'system'
        });

        res.status(200).json({
            message: 'Product removed from favorites successfully'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

module.exports = {
    getFav,
    addFav,
    deleteFav
};
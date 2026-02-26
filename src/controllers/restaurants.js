const {Restaurant,Category,Rate,Address,Sequelize} = require('../../models');
const { getImageUrl, deleteImage } = require('../middleware/imageUpload');


const listAll = async (req,res) => {
    try {
        const customerCity = req.user?.defaultAddress?.city || null;
        
        const includeArray = [
          {
            model:Category,
            as:'categories',
            required:true,
            where:{
                isActive:true,
                status:"active"
            },
            attributes:['id','name']
          },
          {
            model:Rate,
            as:'ratings',                
            required:false,                
            where:{
                isActive:true,
                status:"active"
            },
            attributes:[]
          }
        ];
        
        if (customerCity) {
            includeArray.push({
                model: Address,
                as: 'addresses',
                where: {
                    isDefault: true,
                    isActive: true,
                    city: customerCity
                },
                required: true,
                attributes: []
            });
        }
        
        const restaurants = await Restaurant.findAll({ 
            where: {
                status:"active",
                isVerified:true,
                isActive:true,
                type:"restaurant"
            },
            attributes:[
                'id',
                'name',
                'description',
                'type',
                'photoUrl',
                'coverUrl',
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('ratings.rating')), 0), 'average_rating'],
                [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('ratings.id'))), 'ratings_count']
            ],
            include: includeArray,
            group: customerCity ? ['Restaurant.id','categories.id','addresses.id'] : ['Restaurant.id','categories.id'],
            order:[[Sequelize.literal('average_rating'),'DESC']]
        });
        const jsons = restaurants.map((restaurant) => restaurant.toJSON());
        jsons.forEach(json => {
            json.photoUrl = json.photoUrl || null;
            json.coverUrl = json.coverUrl || null;
        });        
        if (restaurants.length === 0) {
          return res.status(404).json({ message: 'restaurants not found' });
        }
        
        return res.status(200).json({
          message: 'restaurants fetched successfully',
          data:jsons
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const activate = async (req,res)=> {
    try {        
        const resId = Number(req.params.res_id);
        if (!Number.isInteger(resId)) {
            return res.status(400).json({ message: 'Invalid restaurant identifier' });
        }
        const restaurant = await Restaurant.findOne({ where: { id: resId } });
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }
        restaurant.update({status:"active",isVerified:true});
        return res.status(200).json({
          message: 'Restaurant activated successfully',
        });
    
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }

};

const detailes = async (req, res) => {
    try {
        const resId = Number(req.params.resId);
        if (!Number.isInteger(resId)) {
            return res.status(400).json({ message: 'Invalid restaurant identifier' });
        }
        console.log(resId);
        
        const restaurant = await Restaurant.findOne({
            where: {
                id: resId,
                isVerified: true,
                isActive: true
            },
            attributes: [
                'id',
                'name',
                'description',
                'photoUrl',
                'coverUrl',
                [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('ratings.rating')), 0), 'averageRating'],
                [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('ratings.id'))), 'ratingsCount']
            ],
            include: [
                {
                    model: Category,
                    as: 'categories',
                    required: true,
                    where: {
                        isActive: true,
                    },
                    attributes: ['id', 'name']
                },
                {
                    model: Rate,
                    as: 'ratings',
                    required: false,
                    where: {
                        restaurantId: { [Sequelize.Op.ne]: null }
                    },
                    attributes: []
                }
            ],
            group: ['Restaurant.id', 'categories.id']
        });

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        const restaurantJson = restaurant.toJSON();
        restaurantJson.photoUrl = restaurantJson.photoUrl || null;
        restaurantJson.coverUrl = restaurantJson.coverUrl || null;
        restaurantJson.averageRating = restaurantJson.averageRating ? parseFloat(restaurantJson.averageRating).toFixed(2) : "0.00";
        restaurantJson.ratingsCount = restaurantJson.ratingsCount ? parseInt(restaurantJson.ratingsCount) : 0;

        return res.status(200).json({
            message: 'Restaurant details fetched successfully',
            data: restaurantJson
        });
        
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
}

const getPending = async (req,res)=> {
    try {
        const restaurants = await Restaurant.findAll({
            where:{
                status:"pending"
            }
        });
        if (restaurants.length===0) {
            return res.status(404).json({ message: 'restaurants not found' });
          }
        return res.status(200).json({
        message: 'restaurants fetched successfully',
        data:restaurants
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const updateImages = async (req, res) => {
    try {
        const { restaurantId } = req.params;

        if (!restaurantId) {
            return res.status(400).json({ message: 'Restaurant ID is required' });
        }

        const restaurant = await Restaurant.findByPk(restaurantId);

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        if (!req.files || (!req.files.photo && !req.files.cover)) {
            return res.status(400).json({ message: 'At least one image (photo or cover) is required' });
        }

        const updateData = {
            updatedBy: req.user?.name || null
        };

        if (req.files.photo && req.files.photo[0]) {
            if (restaurant.photoUrl) {
                deleteImage(restaurant.photoUrl);
            }
            updateData.photoUrl = getImageUrl(req.files.photo[0].filename);
        }

        if (req.files.cover && req.files.cover[0]) {
            if (restaurant.coverUrl) {
                deleteImage(restaurant.coverUrl);
            }
            updateData.coverUrl = getImageUrl(req.files.cover[0].filename);
        }

        await restaurant.update(updateData);

        return res.status(200).json({
            message: 'Restaurant images updated successfully',
            data: {
                id: restaurant.id,
                photoUrl: restaurant.photoUrl,
                coverUrl: restaurant.coverUrl
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    listAll,
    activate,
    detailes,
    getPending,
    updateImages
}
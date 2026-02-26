const { HomeAd, Restaurant } = require('../../models');
const { getImageUrl } = require('../middleware/imageUpload');

const all = async (req, res) => {
    try {
        const homeAds = await HomeAd.findAll({
            where: {
                status: 'active',
                isActive: true,
                isDeleted: false
            },
            include: [
                {
                    model: Restaurant,
                    as: 'restaurant',
                    attributes: ['id', 'name', 'photoUrl', 'coverUrl']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({
            message: 'Home ads fetched successfully',
            data: homeAds
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const deleteOne = async (req, res) => {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ message: 'Ad ID is required' });
        }

        const homeAd = await HomeAd.findOne({
            where: {
                id: Number(id),
                isDeleted: false
            }
        });

        if (!homeAd) {
            return res.status(404).json({ message: 'Home ad not found' });
        }

        homeAd.isDeleted = true;
        homeAd.status = 'deleted';
        homeAd.updatedBy = req.user?.id?.toString() || 'admin';
        await homeAd.save();

        return res.status(200).json({
            message: 'Home ad deleted successfully'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const create = async (req, res) => {
    try {
        const { resId } = req.body;

        if (!resId) {
            return res.status(400).json({ message: 'Restaurant ID is required' });
        }

        const restaurant = await Restaurant.findOne({
            where: {
                id: Number(resId),
                status: 'active',
                isActive: true
            }
        });

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        let photoUrl = null;
        if (req.file) {
            photoUrl = getImageUrl(req.file.filename);
        }

        const homeAd = await HomeAd.create({
            resId: Number(resId),
            photoUrl: photoUrl,
            status: 'active',
            isActive: true,
            isDeleted: false,
            createdBy: req.user?.id?.toString() || 'admin'
        });

        return res.status(201).json({
            message: 'Home ad created successfully',
            data: homeAd
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    all,
    deleteOne,
    create
};

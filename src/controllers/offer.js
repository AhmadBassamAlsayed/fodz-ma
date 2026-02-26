const { Product,Offer, sequelize } = require('../../models');
const { Op } = require('sequelize');

const create = async (req, res) => {
    try {
        const res_id=Number(req.params.res_id)
        const type=req.params.type
        if(res_id !== req.user.restaurantId){
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const {
            name,
            productId,
            amount,
            percentage,
            status,
            startDate,
            endDate
        }=req.body
        if((type==='percentage' && !percentage) || (type==='amount' && !amount)){
            return res.status(400).json({ message: 'Invalid data' });
        }
        const product = await Product.findOne({
            where:{
                id:productId,
                restaurantId:res_id
            },
            include:[{
                model:Offer,
                as:'offers',
                where:{
                    isPleassing:false,
                    isActive:true,
                    status:'active'
                },
                required:false
            }]
        })
        if(!product){
            return res.status(404).json({ message: 'Product not found' });
        }

        if(product.offers && product.offers.length>0){
            return res.status(403).json({ message: 'product have offer' });
        }
        let isActive = false;
        if (status === "active") {
          isActive=true;
        }
        if(startDate && endDate){
            if(startDate > endDate){
                return res.status(400).json({ message: 'Invalid date' });
            }
        }
        const offer = await Offer.create({
            name,
            productId,
            type,
            amount,
            percentage,
            status,
            isActive,
            startDate,
            endDate,
            createdBy: req.user.name || null,
            updatedBy: req.user.name || null
        });
        return res.status(201).json({
            message: 'Offer created successfully',
            offer
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

const update = async (req, res) => {
    try {
        const offer_id = Number(req.params.offer_id)
        const res_id=Number(req.params.res_id)
        if (res_id !== req.user.restaurantId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const offer = await Offer.findOne({ where: { id: offer_id, isDeleted: false, isPleassing: false}});
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }
        const product = await Product.findOne({ where: { id: offer.productId, restaurantId: res_id } });
        if (!product) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const {
            name,
            productId,
            amount,
            percentage,
            status,
            type,
            startDate,
            endDate
        } = req.body;
        const offerType = type !== undefined ? type : offer.type;
        const offerPercentage = percentage !== undefined ? percentage : offer.percentage;
        const offerAmount = amount !== undefined ? amount : offer.amount;
        
        if ((offerType === 'percentage' && !offerPercentage) || (offerType === 'amount' && !offerAmount)) {
            return res.status(400).json({ message: 'Invalid data: percentage type requires percentage value, amount type requires amount value' });
        }
        if (startDate && endDate) {
            if (startDate > endDate) {
                return res.status(400).json({ message: 'Invalid date' });
            }
        }
        if (productId) {
            const newProduct = await Product.findOne({ where: { id: productId, restaurantId: res_id } });
            if (!newProduct) {
                return res.status(404).json({ message: 'Product not found' });
            }
        }
        let isActive = offer.isActive;
        if (status === "active") {
            isActive = true;
        } else if (status === "deactivated") {
            isActive = false;
        }
        await offer.update({
            name: name !== undefined ? name : offer.name,
            productId: productId !== undefined ? productId : offer.productId,
            amount: amount !== undefined ? amount : offer.amount,
            percentage: percentage !== undefined ? percentage : offer.percentage,
            status: status !== undefined ? status : offer.status,
            isActive,
            type: type !== undefined ? type : offer.type,
            startDate: startDate !== undefined ? startDate : offer.startDate,
            endDate: endDate !== undefined ? endDate : offer.endDate,
            updatedBy: req.user.name || null
        });
        return res.status(200).json({
            message: 'Offer updated successfully',
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

const deletee = async (req, res) => {
    try {
        const offer_id = Number(req.params.offer_id)
        const res_id=Number(req.params.res_id)
        if (res_id !== req.user.restaurantId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const offer = await Offer.findOne({ where: { id: offer_id, isDeleted: false, isPleassing: false} });
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }
        await offer.update({
            isDeleted: true,
            isActive: false,
            updatedBy: req.user.name || null
        });
        return res.status(200).json({
            message: 'Offer deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

const activate = async (req, res) => {
    try {
        const offer_id = Number(req.params.offer_id)
        const res_id=Number(req.params.res_id)
        if (res_id !== req.user.restaurantId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const offer = await Offer.findOne({ where: { id: offer_id, status:"deactivated", isPleassing: false } });
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }
        const product = await Product.findOne({ where: { id: offer.productId, restaurantId: res_id } });
        if (!product) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        await offer.update({
            status: 'active',
            isActive: true,
            updatedBy: req.user.name || null
        });
        return res.status(200).json({
            message: 'Offer activated successfully',
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

const deactivate = async (req, res) => {
    try {
        const offer_id = Number(req.params.offer_id)
        const res_id=Number(req.params.res_id)
        if (res_id !== req.user.restaurantId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const offer = await Offer.findOne({ where: { id: offer_id, status:"active", isPleassing: false } });
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }
        const product = await Product.findOne({ where: { id: offer.productId, restaurantId: res_id } });
        if (!product) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        await offer.update({
            status: 'deactivated',
            isActive: false,
            updatedBy: req.user.name || null
        });
        return res.status(200).json({
            message: 'Offer deactivated successfully',
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

const getMine = async (req, res) => {
    try {
        const type = req.params.type
        const res_id = Number(req.params.res_id)
        const restaurantId = Number(res_id);
        if (restaurantId !== req.user.restaurantId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const offers = await Offer.findAll({
            where: {
                type,
                isDeleted: false,
                isPleassing: false
            },
            include: [
                {
                    model: Product,
                    as: 'product',
                    where: { restaurantId },
                    attributes: ['id', 'name', 'salePrice', 'isActive', 'status', 'photoUrl']
                }
            ]
        });
        const offersWithPhoto = offers.map(offer => {
            const offerJson = offer.toJSON();
            offerJson.photoUrl = offerJson.product?.photoUrl || null;
            return offerJson;
        });
        return res.status(200).json({ offers: offersWithPhoto });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

const Detail = async (req, res) => {
    try {
        const type = req.params.type
        const restaurantId = Number(req.params.res_id)
        const offer_id = Number(req.params.offer_id)
        const offerId = Number(offer_id);
        const currentDate = new Date();
        const offer = await Offer.findOne({
            where: {
                id: offerId,
                type,
                isActive: true,
                status: 'active',
                isPleassing: false,
                [Op.or]: [
                    { startDate: null },
                    { startDate: { [Op.lte]: currentDate } }
                ],
                [Op.or]: [
                    { endDate: null },
                    { endDate: { [Op.gte]: currentDate } }
                ]
            },
            include: [
                {
                    model: Product,
                    as: 'product',
                    where: { restaurantId },
                    attributes: ['id', 'name', 'salePrice', 'isActive', 'status', 'photoUrl']
                }
            ]
        });
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }
        const offerWithPhoto = {
            ...offer.toJSON(),
            photoUrl: offer.product?.photoUrl || null
        };
        return res.status(200).json({ offer: offerWithPhoto });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

const getoffers = async (req, res) => {
    try {
        const type = req.params.type
        const restaurantId = Number(req.params.res_id)
        const currentDate = new Date();
        const offers = await Offer.findAll({
            where: {
                type,
                isActive: true,
                status: 'active',
                isPleassing: false,
                [Op.or]: [
                    { startDate: null },
                    { startDate: { [Op.lte]: currentDate } }
                ],
                [Op.or]: [
                    { endDate: null },
                    { endDate: { [Op.gte]: currentDate } }
                ]
            },
            include: [
                {
                    model: Product,
                    as: 'product',
                    where: { restaurantId, isActive: true },
                    attributes: ['id', 'name', 'salePrice', 'isActive', 'status', 'photoUrl']
                }
            ]
        });
        const offersWithPhoto = offers.map(offer => {
            const offerJson = offer.toJSON();
            offerJson.photoUrl = offerJson.product?.photoUrl || null;
            return offerJson;
        });
        return res.status(200).json({ offers: offersWithPhoto });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

const createPlessing = async (req, res) => {
    try {
        const res_id = req.user.restaurantId;
        const {
            productId,
            plessingPrice,
            quantity,
            startDate,
            endDate
        } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({ message: 'Quantity is required and must be greater than 0' });
        }
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Start date and end date are required' });
        }
        if (new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({ message: 'Invalid date: start date must be before end date' });
        }
        if (!plessingPrice || plessingPrice <= 0) {
            return res.status(400).json({ message: 'Plessing price is required and must be greater than 0' });
        }

        const product = await Product.findOne({
            where: {
                id: productId,
                restaurantId: res_id,
                isDeleted: false
            }
        });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const plessing = await Offer.create({
            productId,
            type: 'plessing',
            plessingPrice,
            quantity,
            startDate,
            endDate,
            status: 'active',
            isActive: true,
            isPleassing: true,
            createdBy: req.user.name || null,
            updatedBy: req.user.name || null
        });

        return res.status(201).json({
            message: 'Plessing created successfully',
            plessing
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

const updatePlessing = async (req, res) => {
    try {
        const plessing_id = Number(req.params.plessing_id);
        const res_id = req.user.restaurantId;

        const plessing = await Offer.findOne({
            where: { id: plessing_id, isPleassing: true, isDeleted: false },
            include: [{
                model: Product,
                as: 'product',
                where: { restaurantId: res_id }
            }]
        });
        if (!plessing) {
            return res.status(404).json({ message: 'Plessing not found' });
        }

        const {
            productId,
            plessingPrice,
            quantity,
            startDate,
            endDate
        } = req.body;

        if (productId) {
            const newProduct = await Product.findOne({
                where: { id: productId, restaurantId: res_id, isDeleted: false }
            });
            if (!newProduct) {
                return res.status(404).json({ message: 'Product not found' });
            }
        }

        const newStartDate = startDate !== undefined ? startDate : plessing.startDate;
        const newEndDate = endDate !== undefined ? endDate : plessing.endDate;
        if (newStartDate && newEndDate && new Date(newStartDate) > new Date(newEndDate)) {
            return res.status(400).json({ message: 'Invalid date: start date must be before end date' });
        }

        const newQuantity = quantity !== undefined ? quantity : plessing.quantity;
        if (newQuantity !== null && newQuantity <= 0) {
            return res.status(400).json({ message: 'Quantity must be greater than 0' });
        }

        await plessing.update({
            productId: productId !== undefined ? productId : plessing.productId,
            plessingPrice: plessingPrice !== undefined ? plessingPrice : plessing.plessingPrice,
            quantity: newQuantity,
            startDate: newStartDate,
            endDate: newEndDate,
            updatedBy: req.user.name || null
        });

        return res.status(200).json({
            message: 'Plessing updated successfully'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

const plessingDetails = async (req, res) => {
    try {
        const plessing_id = Number(req.params.plessing_id);
        const res_id = Number(req.params.res_id);

        if (res_id !== req.user.restaurantId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const currentDate = new Date();
        const plessing = await Offer.findOne({
            where: {
                id: plessing_id,
                isPleassing: true,
                isActive: true,
                isDeleted: false,
                endDate: { [Op.gte]: currentDate }
            },
            include: [{
                model: Product,
                as: 'product',
                required: false,
                where: { restaurantId: res_id },
                attributes: ['id', 'name', 'salePrice', 'isActive', 'status', 'photoUrl']
            }]
        });

        if (!plessing) {
            return res.status(404).json({ message: 'Plessing not found' });
        }

        const plessingWithPhoto = {
            ...plessing.toJSON(),
            photoUrl: plessing.product?.photoUrl || null
        };

        return res.status(200).json({ plessing: plessingWithPhoto });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

const listPlessing = async (req, res) => {
    try {
        const res_id = Number(req.params.res_id);
        const currentDate = new Date();

        const plessings = await Offer.findAll({
            where: {
                isPleassing: true,
                isActive: true,
                isDeleted: false,
                endDate: { [Op.gte]: currentDate }
            },
            include: [{
                model: Product,
                as: 'product',
                required: false,
                where: { restaurantId: res_id, isActive: true, isDeleted: false },
                attributes: ['id', 'name', 'salePrice', 'isActive', 'status', 'photoUrl']
            }]
        });

        const plessingsWithPhoto = plessings.map(plessing => {
            const plessingJson = plessing.toJSON();
            plessingJson.photoUrl = plessingJson.product?.photoUrl || null;
            return plessingJson;
        });

        return res.status(200).json({ plessings: plessingsWithPhoto });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

const deactivatePlessing = async (req, res) => {
    try {
        const plessing_id = Number(req.params.plessing_id);
        const res_id = req.user.restaurantId;

        const plessing = await Offer.findOne({
            where: { id: plessing_id, isPleassing: true, isDeleted: false },
            include: [{
                model: Product,
                as: 'product',
                where: { restaurantId: res_id }
            }]
        });

        if (!plessing) {
            return res.status(404).json({ message: 'Plessing not found' });
        }

        await plessing.update({
            isActive: false,
            updatedBy: req.user.name || null
        });

        return res.status(200).json({
            message: 'Plessing deactivated successfully'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
};

module.exports={
    create,
    update,
    deletee,
    activate,
    deactivate,
    getMine,
    Detail,
    getoffers,
    createPlessing,
    updatePlessing,
    plessingDetails,
    listPlessing,
    deactivatePlessing
}
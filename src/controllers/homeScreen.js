const {Restaurant,Category,Combo,Product,Rate,Config,Offer,Section,SectionItem,HomeAd,Address,Sequelize,Order,DeliveryMan,Warning} = require('../../models');


const homeScreen = async (req,res) => {
    try {
        const homeKillSwitchConfig = await Config.findOne({ where: { name: 'homeKillSwitch' } });
        const restaurantKillSwitchConfig = await Config.findOne({ where: { name: 'restaurantKillSwitch' } });
        const plessingKillSwitchConfig = await Config.findOne({ where: { name: 'plessingKillSwitch' } });

        const homeKillSwitch = homeKillSwitchConfig?.value === 'true';
        const restaurantKillSwitch = restaurantKillSwitchConfig?.value === 'true';
        const plessingKillSwitch = plessingKillSwitchConfig?.value === 'true';

        let restaurants = [];
        let houses = [];
        
        const customerCity = req.user?.defaultAddress?.city || null;

        if (restaurantKillSwitch) {
            const restaurantInclude = [
                {
                    model:Rate,
                    as:'ratings',
                    attributes:[]
                },
                {
                    model: Category,
                    as: 'categories',
                    required: true,
                    where: {
                        isActive: true,
                    },
                    include: [
                        {
                            model: Product,
                            as: 'products',
                            required: true,
                            where: {
                                isActive: true,
                                status: 'active',
                                isDeleted: false,
                                forSale: true
                            },
                            attributes: [],
                            limit:1
                        }
                    ],
                    attributes: []
                }
            ];
            
            if (customerCity) {
                restaurantInclude.push({
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
            
            restaurants = await Restaurant.findAll({ 
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
                    'photoUrl',
                    'coverUrl',
                    [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('ratings.rating')), 0), 'average_rating'],
                    [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('ratings.id'))), 'ratings_count']
                ],
                include: restaurantInclude,
                group: customerCity ? ['Restaurant.id', 'categories.id', 'addresses.id'] : ['Restaurant.id', 'categories.id'],
                order:[[Sequelize.literal('average_rating'),'DESC']],
                subQuery: false
            });
        }

        if (homeKillSwitch) {
            const homeInclude = [
                {
                    model:Rate,
                    as:'ratings',
                    attributes:[]
                },
                {
                    model: Category,
                    as: 'categories',
                    required: true,
                    where: {
                        isActive: true,
                    },
                    include: [
                        {
                            model: Product,
                            as: 'products',
                            required: true,
                            where: {
                                isActive: true,
                                status: 'active',
                                isDeleted: false,
                                forSale:true
                            },
                            attributes: [],
                            limit:1
                        }
                    ],
                    attributes: []
                }
            ];
            
            if (customerCity) {
                homeInclude.push({
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
            
            houses = await Restaurant.findAll({ 
                where: {
                    status:"active",
                    isActive:true,
                    isVerified:true,
                    type:"home"

                },
                attributes:[
                    'id',
                    'name',
                    'description',
                    'photoUrl',
                    'coverUrl',
                    [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('ratings.rating')), 0), 'average_rating'],
                    [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('ratings.id'))), 'ratings_count']
                ],
                include: homeInclude,
                group: customerCity ? ['Restaurant.id', 'categories.id', 'addresses.id'] : ['Restaurant.id', 'categories.id'],
                order:[[Sequelize.literal('average_rating'),'DESC']],
                subQuery: false
            });
        }

        let plessing = [];

        if (plessingKillSwitch) {
            const now = new Date();
            const plessingInclude = [
                {
                    model: Offer,
                    as: 'offers',
                    where: {
                        isPleassing: true,
                        isActive: true,
                        status: 'active',
                        isDeleted: false,
                        startDate: { [Sequelize.Op.lte]: now },
                        endDate: { [Sequelize.Op.gte]: now }
                    },
                    required: true
                },
                {
                    model: Category,
                    as: 'category',
                    required: true,
                    attributes: [],
                    include: [
                        {
                            model: Restaurant,
                            as: 'restaurant',
                            required: true,
                            attributes: []
                        }
                    ]
                }
            ];

            if (customerCity) {
                plessingInclude[1].include[0].include = [{
                    model: Address,
                    as: 'addresses',
                    where: {
                        isDefault: true,
                        isActive: true,
                        city: customerCity
                    },
                    required: true,
                    attributes: []
                }];
            }

            plessing = await Product.findAll({
                where: {
                    status: 'active',
                    isActive: true,
                    isDeleted: false
                },
                include: plessingInclude
            });
        }
        
        const now = new Date();
        let plessSections = [];
        if (plessingKillSwitch) {
                plessSections = await Section.findAll({
                where: { isDeleted: false, screen: 'pless' },
                include: [
                    {
                        model: SectionItem,
                        as: 'items',
                        where: { isDeleted: false },
                        required: false,
                        include: [
                            {
                                model: Product,
                                as: 'product',
                                attributes: ['id', 'name', 'description', 'status', 'isActive', 'salePrice', 'categoryId', 'photoUrl'],
                                where: { status: 'active', isActive: true, isDeleted: false },
                                required: false,
                                include: [
                                    {
                                        model: Category,
                                        as: 'category',
                                        attributes: ['restaurantId'],
                                        required: false
                                    },
                                    {
                                        model: Offer,
                                        as: 'offers',
                                        where: {
                                            isPleassing: true,
                                            isActive: true,
                                            status: 'active',
                                            isDeleted: false,
                                            startDate: { [Sequelize.Op.lte]: now },
                                            endDate: { [Sequelize.Op.gte]: now }
                                        },
                                        required: true,
                                        attributes: ['id', 'type', 'amount', 'percentage']
                                    }
                                ]
                            },
                            {
                                model: Restaurant,
                                as: 'restaurant',
                                attributes: ['id', 'name', 'description', 'status', 'isActive', 'type', 'photoUrl', 'coverUrl'],
                                where: { status: 'active', isActive: true, isDeleted: false },
                                required: false
                            },
                            {
                                model: Category,
                                as: 'category',
                                attributes: ['id', 'name', 'description', 'status', 'isActive', 'restaurantId'],
                                where: { status: 'active', isActive: true, isDeleted: false },
                                required: false
                            }
                        ]
                    }
                ],
                order: [['id', 'ASC']]
            });
        }
        let famSections = [];
        if (homeKillSwitch) {
            famSections = await Section.findAll({
                where: { isDeleted: false, screen: 'fam' },
                include: [
                    {
                        model: SectionItem,
                        as: 'items',
                        where: { isDeleted: false },
                        required: false,
                        include: [
                            {
                                model: Restaurant,
                                as: 'restaurant',
                                attributes: ['id', 'name', 'description', 'status', 'isActive', 'type', 'photoUrl', 'coverUrl'],
                                where: { status: 'active', isActive: true, type: 'home', isDeleted: false },
                                required: false
                            },
                            {
                                model: Product,
                                as: 'product',
                                attributes: ['id', 'name', 'description', 'status', 'isActive', 'salePrice', 'categoryId', 'photoUrl'],
                                where: { status: 'active', isActive: true, isDeleted: false },
                                required: false,
                                include: [
                                    {
                                        model: Category,
                                        as: 'category',
                                        attributes: ['restaurantId'],
                                        required: false
                                    },
                                    {
                                        model: Restaurant,
                                        as: 'restaurant',
                                        where: { type: 'home' },
                                        required: true,
                                        attributes: []
                                    },
                                    {
                                        model: Offer,
                                        as: 'offers',
                                        where: {
                                            isPleassing: false,
                                            isActive: true,
                                            status: 'active',
                                            isDeleted: false,
                                            startDate: { [Sequelize.Op.lte]: now },
                                            endDate: { [Sequelize.Op.gte]: now }
                                        },
                                        required: false,
                                        attributes: ['id', 'type', 'amount', 'percentage']
                                    }
                                ]
                            },
                            {
                                model: Category,
                                as: 'category',
                                attributes: ['id', 'name', 'description', 'status', 'isActive', 'restaurantId'],
                                where: { status: 'active', isActive: true, isDeleted: false },
                                required: false,
                                include: [
                                    {
                                        model: Restaurant,
                                        as: 'restaurant',
                                        where: { type: 'home' },
                                        required: true,
                                        attributes: []
                                    }
                                ]
                            }
                        ]
                    }
                ],
                order: [['id', 'ASC']]
            });
        }
        let resSections = [];
        if (restaurantKillSwitch) {
            resSections = await Section.findAll({
            where: { isDeleted: false, screen: 'res' },
            include: [
                {
                    model: SectionItem,
                    as: 'items',
                    where: { isDeleted: false },
                    required: false,
                    include: [
                        {
                            model: Restaurant,
                            as: 'restaurant',
                            attributes: ['id', 'name', 'description', 'status', 'isActive', 'type', 'photoUrl', 'coverUrl'],
                            where: { status: 'active', isActive: true, type: 'restaurant', isDeleted: false },
                            required: false
                        },
                        {
                            model: Product,
                            as: 'product',
                            attributes: ['id', 'name', 'description', 'status', 'isActive', 'salePrice', 'categoryId', 'photoUrl'],
                            where: { status: 'active', isActive: true, isDeleted: false },
                            required: false,
                            include: [
                                {
                                    model: Category,
                                    as: 'category',
                                    attributes: ['restaurantId'],
                                    required: false
                                },
                                {
                                    model: Restaurant,
                                    as: 'restaurant',
                                    where: { type: 'restaurant' },
                                    required: true,
                                    attributes: []
                                },
                                {
                                    model: Offer,
                                    as: 'offers',
                                    where: {
                                        isPleassing: false,
                                        isActive: true,
                                        status: 'active',
                                        isDeleted: false,
                                        startDate: { [Sequelize.Op.lte]: now },
                                        endDate: { [Sequelize.Op.gte]: now }
                                    },
                                    required: false,
                                    attributes: ['id', 'type', 'amount', 'percentage']
                                }
                            ]
                        },
                        {
                            model: Category,
                            as: 'category',
                            attributes: ['id', 'name', 'description', 'status', 'isActive', 'restaurantId'],
                            where: { status: 'active', isActive: true, isDeleted: false },
                            required: false,
                            include: [
                                {
                                    model: Restaurant,
                                    as: 'restaurant',
                                    where: { type: 'restaurant' },
                                    required: true,
                                    attributes: []
                                }
                            ]
                        }
                    ]
                }
            ],
            order: [['id', 'ASC']]
            });
        }

        const homeAds = await HomeAd.findAll({
            where: {
                status: 'active',
                isActive: true,
                isDeleted: false
            },
            attributes: ['photoUrl', 'resId'],
            include: [
                {
                    model: Restaurant,
                    as: 'restaurant',
                    attributes: ['id', 'name']
                }
            ]
        });
        const adsPhotos = homeAds.map(ad => ({
            photoUrl: ad.photoUrl,
            resId: ad.resId,
            restaurantName: ad.restaurant?.name || null
        })).filter(ad => ad.photoUrl !== null);

        const Houses = houses.map((house) => house.toJSON());
        Houses.forEach(house => {
            house.photoUrl = house.photoUrl || null;
            house.coverUrl = house.coverUrl || null;
        });        
        const Restaurants = restaurants.map((restaurant) => restaurant.toJSON());
        Restaurants.forEach(rest => {
            rest.photoUrl = rest.photoUrl || null;
            rest.coverUrl = rest.coverUrl || null;
        });
        const PlessSections = plessSections.map((section) => {
            const sectionData = section.toJSON();
            const sectionItemss = [];
            
            if (sectionData.items && sectionData.items.length > 0) {
                sectionData.items.forEach(item => {
                    const sectionItem = {
                        name: null,
                        description: null,
                        resId: null,
                        catId: null,
                        productId: null,
                        price: null,
                        offerPrice: null,
                        photoUrl: null,
                        coverUrl: null
                    };
                    
                    if (sectionData.type === 'restaurant' && (item.restaurant || item.familyRestaurant)) {
                        const rest = item.restaurant || item.familyRestaurant;
                        sectionItem.name = rest.name;
                        sectionItem.description = rest.description;
                        sectionItem.resId = rest.id;
                        sectionItem.photoUrl = rest.photoUrl || null;
                        sectionItem.coverUrl = rest.coverUrl || null;
                    } else if (sectionData.type === 'cat' && item.category) {
                        sectionItem.name = item.category.name;
                        sectionItem.description = item.category.description;
                        sectionItem.resId = item.category.restaurantId;
                        sectionItem.catId = item.category.id;
                        sectionItem.photoUrl = item.category.photoUrl || null;
                    } else if (sectionData.type === 'product' && item.product) {
                        sectionItem.name = item.product.name;
                        sectionItem.description = item.product.description;
                        sectionItem.resId = item.product.category?.restaurantId || null;
                        sectionItem.catId = item.product.categoryId;
                        sectionItem.productId = item.product.id;
                        sectionItem.price = item.product.salePrice;
                        sectionItem.photoUrl = item.product.photoUrl || null;
                        
                        if (item.product.offers && item.product.offers.length > 0) {
                            const offer = item.product.offers[0];
                            if (offer.type === 'percentage' && offer.percentage) {
                                sectionItem.offerPrice = Math.max(0, item.product.salePrice * (1 - offer.percentage / 100));
                            } else if (offer.type === 'fixed' && offer.amount) {
                                sectionItem.offerPrice = Math.max(0, item.product.salePrice - offer.amount);
                            }
                        }
                    } else if (item.product && item.product.offers && item.product.offers.length > 0) {
                        sectionItem.name = item.product.name;
                        sectionItem.description = item.product.description;
                        sectionItem.resId = item.product.category?.restaurantId || null;
                        sectionItem.catId = item.product.categoryId;
                        sectionItem.productId = item.product.id;
                        sectionItem.price = item.product.salePrice;
                        sectionItem.photoUrl = item.product.photoUrl || null;
                        
                        const offer = item.product.offers[0];
                        if (offer.type === 'percentage' && offer.percentage) {
                            sectionItem.offerPrice = Math.max(0, item.product.salePrice * (1 - offer.percentage / 100));
                        } else if (offer.type === 'fixed' && offer.amount) {
                            sectionItem.offerPrice = Math.max(0, item.product.salePrice - offer.amount);
                        }
                    } else if (item.restaurant) {
                        sectionItem.name = item.restaurant.name;
                        sectionItem.description = item.restaurant.description;
                        sectionItem.resId = item.restaurant.id;
                        sectionItem.photoUrl = item.restaurant.photoUrl || null;
                        sectionItem.coverUrl = item.restaurant.coverUrl || null;
                    } else if (item.category) {
                        sectionItem.name = item.category.name;
                        sectionItem.description = item.category.description;
                        sectionItem.resId = item.category.restaurantId;
                        sectionItem.catId = item.category.id;
                        sectionItem.photoUrl = item.category.photoUrl || null;
                    }
                    
                    if (sectionItem.name !== null) {
                        sectionItemss.push(sectionItem);
                    }
                });
            }
            
            return {
                name: sectionData.name,
                type: sectionData.type || null,
                sectionItemss: sectionItemss
            };
        });

        const FamSections = famSections.map((section) => {
            const sectionData = section.toJSON();
            const sectionItemss = [];
            
            if (sectionData.items && sectionData.items.length > 0) {
                sectionData.items.forEach(item => {
                    const sectionItem = {
                        name: null,
                        description: null,
                        resId: null,
                        catId: null,
                        productId: null,
                        price: null,
                        offerPrice: null,
                        photoUrl: null,
                        coverUrl: null
                    };
                    
                    if (sectionData.type === 'restaurant' && (item.restaurant || item.familyRestaurant)) {
                        const rest = item.restaurant || item.familyRestaurant;
                        sectionItem.name = rest.name;
                        sectionItem.description = rest.description;
                        sectionItem.resId = rest.id;
                        sectionItem.photoUrl = rest.photoUrl || null;
                        sectionItem.coverUrl = rest.coverUrl || null;
                    } else if (sectionData.type === 'cat' && item.category) {
                        sectionItem.name = item.category.name;
                        sectionItem.description = item.category.description;
                        sectionItem.resId = item.category.restaurantId;
                        sectionItem.catId = item.category.id;
                        sectionItem.photoUrl = item.category.photoUrl || null;
                    } else if (sectionData.type === 'product' && item.product) {
                        sectionItem.name = item.product.name;
                        sectionItem.description = item.product.description;
                        sectionItem.resId = item.product.category?.restaurantId || null;
                        sectionItem.catId = item.product.categoryId;
                        sectionItem.productId = item.product.id;
                        sectionItem.price = item.product.salePrice;
                        sectionItem.photoUrl = item.product.photoUrl || null;
                        
                        if (item.product.offers && item.product.offers.length > 0) {
                            const offer = item.product.offers[0];
                            if (offer.type === 'percentage' && offer.percentage) {
                                sectionItem.offerPrice = Math.max(0, item.product.salePrice * (1 - offer.percentage / 100));
                            } else if (offer.type === 'fixed' && offer.amount) {
                                sectionItem.offerPrice = Math.max(0, item.product.salePrice - offer.amount);
                            }
                        }
                    } else if (item.familyRestaurant) {
                        sectionItem.name = item.familyRestaurant.name;
                        sectionItem.description = item.familyRestaurant.description;
                        sectionItem.resId = item.familyRestaurant.id;
                        sectionItem.photoUrl = item.familyRestaurant.photoUrl || null;
                        sectionItem.coverUrl = item.familyRestaurant.coverUrl || null;
                    } else if (item.product) {
                        sectionItem.name = item.product.name;
                        sectionItem.description = item.product.description;
                        sectionItem.resId = item.product.category?.restaurantId || null;
                        sectionItem.catId = item.product.categoryId;
                        sectionItem.productId = item.product.id;
                        sectionItem.price = item.product.salePrice;
                        sectionItem.photoUrl = item.product.photoUrl || null;
                        
                        if (item.product.offers && item.product.offers.length > 0) {
                            const offer = item.product.offers[0];
                            if (offer.type === 'percentage' && offer.percentage) {
                                sectionItem.offerPrice = Math.max(0, item.product.salePrice * (1 - offer.percentage / 100));
                            } else if (offer.type === 'fixed' && offer.amount) {
                                sectionItem.offerPrice = Math.max(0, item.product.salePrice - offer.amount);
                            }
                        }
                    } else if (item.category) {
                        sectionItem.name = item.category.name;
                        sectionItem.description = item.category.description;
                        sectionItem.resId = item.category.restaurantId;
                        sectionItem.catId = item.category.id;
                        sectionItem.photoUrl = item.category.photoUrl || null;
                    }
                    
                    if (sectionItem.name !== null) {
                        sectionItemss.push(sectionItem);
                    }
                });
            }
            
            return {
                name: sectionData.name,
                type: sectionData.type || null,
                sectionItemss: sectionItemss
            };
        });

        const ResSections = resSections.map((section) => {
            const sectionData = section.toJSON();
            const sectionItemss = [];
            
            if (sectionData.items && sectionData.items.length > 0) {
                sectionData.items.forEach(item => {
                    const sectionItem = {
                        name: null,
                        description: null,
                        resId: null,
                        catId: null,
                        productId: null,
                        price: null,
                        offerPrice: null,
                        photoUrl: null,
                        coverUrl: null
                    };
                    
                    if (sectionData.type === 'restaurant' && (item.restaurant || item.familyRestaurant)) {
                        const rest = item.restaurant || item.familyRestaurant;
                        sectionItem.name = rest.name;
                        sectionItem.description = rest.description;
                        sectionItem.resId = rest.id;
                        sectionItem.photoUrl = rest.photoUrl || null;
                        sectionItem.coverUrl = rest.coverUrl || null;
                    } else if (sectionData.type === 'cat' && item.category) {
                        sectionItem.name = item.category.name;
                        sectionItem.description = item.category.description;
                        sectionItem.resId = item.category.restaurantId;
                        sectionItem.catId = item.category.id;
                        sectionItem.photoUrl = item.category.photoUrl || null;
                    } else if (sectionData.type === 'product' && item.product) {
                        sectionItem.name = item.product.name;
                        sectionItem.description = item.product.description;
                        sectionItem.resId = item.product.category?.restaurantId || null;
                        sectionItem.catId = item.product.categoryId;
                        sectionItem.productId = item.product.id;
                        sectionItem.price = item.product.salePrice;
                        sectionItem.photoUrl = item.product.photoUrl || null;
                        
                        if (item.product.offers && item.product.offers.length > 0) {
                            const offer = item.product.offers[0];
                            if (offer.type === 'percentage' && offer.percentage) {
                                sectionItem.offerPrice = Math.max(0, item.product.salePrice * (1 - offer.percentage / 100));
                            } else if (offer.type === 'fixed' && offer.amount) {
                                sectionItem.offerPrice = Math.max(0, item.product.salePrice - offer.amount);
                            }
                        }
                    } else if (item.restaurant) {
                        sectionItem.name = item.restaurant.name;
                        sectionItem.description = item.restaurant.description;
                        sectionItem.resId = item.restaurant.id;
                        sectionItem.photoUrl = item.restaurant.photoUrl || null;
                        sectionItem.coverUrl = item.restaurant.coverUrl || null;
                    } else if (item.product) {
                        sectionItem.name = item.product.name;
                        sectionItem.description = item.product.description;
                        sectionItem.resId = item.product.category?.restaurantId || null;
                        sectionItem.catId = item.product.categoryId;
                        sectionItem.productId = item.product.id;
                        sectionItem.price = item.product.salePrice;
                        sectionItem.photoUrl = item.product.photoUrl || null;
                        
                        if (item.product.offers && item.product.offers.length > 0) {
                            const offer = item.product.offers[0];
                            if (offer.type === 'percentage' && offer.percentage) {
                                sectionItem.offerPrice = Math.max(0, item.product.salePrice * (1 - offer.percentage / 100));
                            } else if (offer.type === 'fixed' && offer.amount) {
                                sectionItem.offerPrice = Math.max(0, item.product.salePrice - offer.amount);
                            }
                        }
                    } else if (item.category) {
                        sectionItem.name = item.category.name;
                        sectionItem.description = item.category.description;
                        sectionItem.resId = item.category.restaurantId;
                        sectionItem.catId = item.category.id;
                        sectionItem.photoUrl = item.category.photoUrl || null;
                    }
                    
                    if (sectionItem.name !== null) {
                        sectionItemss.push(sectionItem);
                    }
                });
            }
            
            return {
                name: sectionData.name,
                type: sectionData.type || null,
                sectionItemss: sectionItemss
            };
        });

        const Plessing = plessing.map((product) => product.toJSON());
        Plessing.forEach(product => {
            product.photoUrl = product.photoUrl || null
        });        
        // Build response object
        const response = {
            homeKillSwitch,
            restaurantKillSwitch,
            plessingKillSwitch,
            adsPhotos: adsPhotos, 
            returants: { 
                normal: Restaurants,
                normalSections: ResSections,
                home: Houses,
                homeSections: FamSections,
                plessing: Plessing,
                plessingSections: PlessSections
            }
        };
        console.log();
        
        return res.status(200).json(response);
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:error.message});
    }


}

const serachScreen = async (req, res) => {
    try {
        const {search, type} = req.query;
        const Op = Sequelize.Op;
        const now = new Date();
        
        const customerCity = req.user?.defaultAddress?.city || null;

        if(!search){
            let data = null;
            
            if(type === 'restaurant'){
                const restaurantInclude = [
                    {
                        model: Rate,
                        as: 'ratings',
                        attributes: []
                    }
                ];
                
                if (customerCity) {
                    restaurantInclude.push({
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
                
                data = await Restaurant.findAll({
                    where: {
                        status: 'active',
                        isActive: true,
                        isVerified: true,
                        type: 'restaurant'
                    },
                    attributes: [
                        'id',
                        'name',
                        'photoUrl',
                        'coverUrl',
                        [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('ratings.rating')), 0), 'average_rating']
                    ],
                    include: restaurantInclude,
                    group: customerCity ? ['Restaurant.id', 'addresses.id'] : ['Restaurant.id'],
                    order: [[Sequelize.literal('average_rating'), 'DESC']],
                    limit: 3,
                    subQuery: false
                });
                
            } else if(type === 'home'){
                const homeInclude = [
                    {
                        model: Rate,
                        as: 'ratings',
                        attributes: []
                    }
                ];
                
                if (customerCity) {
                    homeInclude.push({
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
                
                data = await Restaurant.findAll({
                    where: {
                        status: 'active',
                        isActive: true,
                        isVerified: true,
                        type: 'home'
                    },
                    attributes: [
                        'id',
                        'name',
                        'photoUrl',
                        'coverUrl',
                        [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('ratings.rating')), 0), 'average_rating']
                    ],
                    include: homeInclude,
                    group: customerCity ? ['Restaurant.id', 'addresses.id'] : ['Restaurant.id'],
                    order: [[Sequelize.literal('average_rating'), 'DESC']],
                    limit: 3,
                    subQuery: false
                });
                
            } else if(type === 'plessing'){
                data = await Product.findAll({
                    where: {
                        status: 'active',
                        isActive: true,
                        isDeleted: false
                    },
                    attributes: ['id', 'name'],
                    include: [
                        {
                            model: Offer,
                            as: 'offers',
                            where: {
                                isPleassing: true,
                                isActive: true,
                                status: 'active',
                                isDeleted: false,
                                startDate: { [Op.lte]: now },
                                endDate: { [Op.gte]: now }
                            },
                            required: true,
                            attributes: []
                        },
                        {
                            model: Restaurant,
                            as: 'restaurant',
                            where: {
                                isActive: true
                            },
                            required: true,
                            attributes: ['id']
                        },
                        {
                            model: Category,
                            as: 'category',
                            required: true,
                            attributes: ['id']
                        }
                    ],
                    limit: 3
                });
            }

            const Data = data ? data.map(item => {
                const itemData = item.toJSON();
                itemData.photoUrl = itemData.photoUrl || null;
                return itemData;
            }) : [];

            return res.status(200).json({
                message: 'Data fetched successfully',
                Data
            });

        } else {
            let restaurants = [];
            let products = [];
            
            if(type === 'restaurant'){
                const restaurantSearchInclude = [
                    {
                        model: Rate,
                        as: 'ratings',
                        attributes: []
                    }
                ];
                
                if (customerCity) {
                    restaurantSearchInclude.push({
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
                
                restaurants = await Restaurant.findAll({
                    where: {
                        status: 'active',
                        isActive: true,
                        isVerified: true,
                        type: 'restaurant',
                        [Op.and]: [
                            Sequelize.where(
                                Sequelize.fn('LOWER', Sequelize.col('name')),
                                { [Op.like]: `%${search.toLowerCase()}%` }
                            )
                        ]
                    },
                    attributes: ['id', 'name', 'photoUrl', 'coverUrl', [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('ratings.rating')), 0), 'average_rating']],
                    include: restaurantSearchInclude,
                    group: customerCity ? ['Restaurant.id', 'addresses.id'] : ['Restaurant.id'],
                    limit: 5,
                    subQuery: false
                });

                products = await Product.findAll({
                    where: {
                        status: 'active',
                        isActive: true,
                        isDeleted: false,
                        [Op.and]: [
                            Sequelize.where(
                                Sequelize.fn('LOWER', Sequelize.col('Product.name')),
                                { [Op.like]: `%${search.toLowerCase()}%` }
                            )
                        ]
                    },
                    attributes: ['id', 'name', 'photoUrl', 'salePrice', 'description'],
                    include: [
                        {
                            model: Offer,
                            as: 'offers',
                            where: {
                                isPleassing: false,
                                isActive: true,
                                status: 'active',
                                isDeleted: false,
                                startDate: { [Op.lte]: now },
                                endDate: { [Op.gte]: now }
                            },
                            required: true,
                            attributes: []
                        },
                        {
                            model: Restaurant,
                            as: 'restaurant',
                            where: {
                                type: 'restaurant'
                            },
                            required: true,
                            attributes: ['id']
                        },
                        {
                            model: Category,
                            as: 'category',
                            required: true,
                            attributes: ['id']
                        }
                    ],
                    limit: 5
                });
                
            } else if(type === 'home'){
                const homeSearchInclude = [
                    {
                        model: Rate,
                        as: 'ratings',
                        attributes: []
                    }
                ];
                
                if (customerCity) {
                    homeSearchInclude.push({
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
                
                restaurants = await Restaurant.findAll({
                    where: {
                        status: 'active',
                        isActive: true,
                        isVerified: true,
                        type: 'home',
                        [Op.and]: [
                            Sequelize.where(
                                Sequelize.fn('LOWER', Sequelize.col('name')),
                                { [Op.like]: `%${search.toLowerCase()}%` }
                            )
                        ]
                    },
                    attributes: ['id', 'name', 'photoUrl', 'coverUrl', [Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('ratings.rating')), 0), 'average_rating']],
                    include: homeSearchInclude,
                    group: customerCity ? ['Restaurant.id', 'addresses.id'] : ['Restaurant.id'],
                    limit: 5,
                    subQuery: false
                });

                products = await Product.findAll({
                    where: {
                        status: 'active',
                        isActive: true,
                        isDeleted: false,
                        [Op.and]: [
                            Sequelize.where(
                                Sequelize.fn('LOWER', Sequelize.col('Product.name')),
                                { [Op.like]: `%${search.toLowerCase()}%` }
                            )
                        ]
                    },
                    attributes: ['id', 'name', 'photoUrl', 'salePrice', 'description'],
                    include: [
                        {
                            model: Offer,
                            as: 'offers',
                            where: {
                                isPleassing: false,
                                isActive: true,
                                status: 'active',
                                isDeleted: false,
                                startDate: { [Op.lte]: now },
                                endDate: { [Op.gte]: now }
                            },
                            required: true,
                            attributes: []
                        },
                        {
                            model: Restaurant,
                            as: 'restaurant',
                            where: {
                                type: 'home'
                            },
                            required: true,
                            attributes: ['id']
                        },
                        {
                            model: Category,
                            as: 'category',
                            required: true,
                            attributes: ['id']
                        }
                    ],
                    limit: 5
                });
                
            } else if(type === 'plessing'){
                products = await Product.findAll({
                    where: {
                        status: 'active',
                        isActive: true,
                        isDeleted: false,
                        [Op.and]: [
                            Sequelize.where(
                                Sequelize.fn('LOWER', Sequelize.col('Product.name')),
                                { [Op.like]: `%${search.toLowerCase()}%` }
                            )
                        ]
                    },
                    attributes: ['id', 'name', 'photoUrl', 'salePrice', 'description'],
                    include: [
                        {
                            model: Offer,
                            as: 'offers',
                            where: {
                                isPleassing: true,
                                isActive: true,
                                status: 'active',
                                isDeleted: false,
                                startDate: { [Op.lte]: now },
                                endDate: { [Op.gte]: now }
                            },
                            required: true,
                            attributes: []
                        },
                        {
                            model: Restaurant,
                            as: 'restaurant',
                            where: {
                                isActive: true
                            },
                            required: true,
                            attributes: ['id']
                        },
                        {
                            model: Category,
                            as: 'category',
                            required: true,
                            attributes: ['id']
                        }
                    ],
                    limit: 10
                });
            }

            const Restaurants = restaurants.map(rest => {
                const restData = rest.toJSON();
                restData.photoUrl = restData.photoUrl || null;
                return restData;
            });

            const Products = products.map(prod => {
                const prodData = prod.toJSON();
                prodData.photoUrl = prodData.photoUrl || null;
                return prodData;
            });

            return res.status(200).json({
                message: 'Search results fetched successfully',
                Data: {
                    restaurants: Restaurants,
                    products: Products
                }
            });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(error.message);
        console.log(error);
    }
}

const deliveryScreen = async (req, res) => {
    try {
        const Op = Sequelize.Op;
        const deliveryManId = req.user.deliverymanId;

        if (!deliveryManId) {
            return res.status(403).json({ message: 'Unauthorized: Delivery man only' });
        }

        // Get all completed orders (ready for delivery) in the delivery man's city
        const deliveryMan = await DeliveryMan.findByPk(deliveryManId, {
            attributes: ['id', 'city']
        });

        if (!deliveryMan || !deliveryMan.city) {
            return res.status(404).json({ message: 'Delivery man not found or city not set' });
        }

        // Find all completed orders in the same city
        const orders = await Order.findAll({
            where: {
                status: {
                    [Op.in]: ['completed', 'shipping']
                },
                isActive: true,
                deliveryManId: deliveryManId
            },
            include: [
                {
                    model: Address,
                    as: 'address',
                    where: {
                        city: deliveryMan.city
                    },
                    attributes: ['id', 'name', 'city', 'country', 'street', 'latitude', 'longitude', 'notes']
                },
                {
                    model: Restaurant,
                    as: 'restaurant',
                    attributes: ['id', 'name', 'phoneNumber', 'city', 'country', 'street', 'latitude', 'longitude']
                }
            ],
            attributes: ['id', 'orderNumber', 'totalAmount', 'shippingAmount', 'status', 'createdAt', 'updatedAt'],
            order: [['createdAt', 'DESC']]
        });

        const formattedOrders = orders.map(order => ({
            id: order.id,
            orderNumber: order.orderNumber,
            totalAmount: order.totalAmount,
            shippingAmount: order.shippingAmount,
            status: order.status,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            deliveryAddress: order.address,
            restaurantAddress: {
                id: order.restaurant.id,
                name: order.restaurant.name,
                phoneNumber: order.restaurant.phoneNumber,
                city: order.restaurant.city,
                country: order.restaurant.country,
                street: order.restaurant.street,
                latitude: order.restaurant.latitude,
                longitude: order.restaurant.longitude
            }
        }));

        return res.status(200).json({
            message: 'Available orders fetched successfully',
            orders: formattedOrders
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const deliveryProfile = async (req, res) => {
    try {
        const deliveryManId = req.user.deliverymanId;

        if (!deliveryManId) {
            return res.status(403).json({ message: 'Unauthorized: Delivery man only' });
        }

        const deliveryMan = await DeliveryMan.findByPk(deliveryManId, {
            attributes: [
                'id',
                'name',
                'phoneNumber',
                'emailAddress',
                'city',
                'wallet',
                'deliveredOrders',
                'rate',
                'isActive',
                'isVerified',
                'status',
                'createdAt'
            ]
        });

        if (!deliveryMan) {
            return res.status(404).json({ message: 'Delivery man not found' });
        }

        return res.status(200).json({
            message: 'Delivery man profile fetched successfully',
            deliveryMan: {
                id: deliveryMan.id,
                name: deliveryMan.name,
                phoneNumber: deliveryMan.phoneNumber,
                emailAddress: deliveryMan.emailAddress,
                city: deliveryMan.city,
                deliveredOrders: deliveryMan.deliveredOrders,
                rating: deliveryMan.rate,
                isActive: deliveryMan.isActive,
                isVerified: deliveryMan.isVerified,
                status: deliveryMan.status,
                memberSince: deliveryMan.createdAt
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const getDeliveryManWarnings = async (req, res) => {
    try {
        const deliveryManId = req.user.id;

        if (!deliveryManId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Get all warnings for this delivery man
        const warnings = await Warning.findAll({
            where: {
                deliveryManId,
                isActive: true,
                status: 'active'
            },
            attributes: ['id', 'title', 'body', 'createdAt'],
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({
            message: 'Warnings retrieved successfully',
            warnings
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports={
    homeScreen,
    serachScreen,
    deliveryScreen,
    deliveryProfile,
    getDeliveryManWarnings
};
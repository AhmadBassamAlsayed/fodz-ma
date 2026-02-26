const { Section, SectionItem, Restaurant, Product, Category, sequelize } = require('../../models');

const list = async (req, res) => {
    try {
        const sections = await Section.findAll({
            where: { isDeleted: false },
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
                            attributes: ['id', 'name', 'status', 'isActive']
                        },
                        {
                            model: Restaurant,
                            as: 'familyRestaurant',
                            attributes: ['id', 'name', 'status', 'isActive']
                        },
                        {
                            model: Product,
                            as: 'product',
                            attributes: ['id', 'name', 'status', 'isActive', 'salePrice']
                        },
                        {
                            model: Category,
                            as: 'category',
                            attributes: ['id', 'name', 'status', 'isActive']
                        }
                    ]
                }
            ],
            order: [['id', 'ASC']]
        });

        return res.status(200).json({ sections });
    } catch (error) {
        console.log(error.message);
        console.log(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const getOne = async (req, res) => {
    try {
        const sectionId = Number(req.params.id);

        const section = await Section.findOne({
            where: { id: sectionId, isDeleted: false },
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
                            attributes: ['id', 'name', 'status', 'isActive']
                        },
                        {
                            model: Restaurant,
                            as: 'familyRestaurant',
                            attributes: ['id', 'name', 'status', 'isActive']
                        },
                        {
                            model: Product,
                            as: 'product',
                            attributes: ['id', 'name', 'status', 'isActive', 'salePrice']
                        },
                        {
                            model: Category,
                            as: 'category',
                            attributes: ['id', 'name', 'status', 'isActive']
                        }
                    ]
                }
            ]
        });

        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }

        return res.status(200).json({ section });
    } catch (error) {
        console.log(error.message);
        console.log(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const create = async (req, res) => {
    try {
        const { screen, type, name, ids } = req.body;

        if (screen && !['res', 'fam', 'pless'].includes(screen)) {
            return res.status(400).json({ message: 'screen must be one of: res, fam, pless' });
        }

        if (!Array.isArray(ids)) {
            return res.status(400).json({ message: 'ids must be an array' });
        }

        const result = await sequelize.transaction(async (t) => {
            const section = await Section.create({
                screen: screen || null,
                type: type || null,
                name: name || null,
                createdBy: req.user.name || null,
                updatedBy: req.user.name || null
            }, { transaction: t });

            for (const id of ids) {
                const itemData = {
                    sectionId: section.id,
                    restaurantId: null,
                    famId: null,
                    productId: null,
                    categoryId: null,
                    createdBy: req.user.name || null,
                    updatedBy: req.user.name || null
                };

                if (type === 'fam') {
                    itemData.famId = id;
                } else if (type === 'restaurant') {
                    itemData.restaurantId = id;
                } else if (type === 'product') {
                    itemData.productId = id;
                } else if (type === 'cat') {
                    itemData.categoryId = id;
                }

                await SectionItem.create(itemData, { transaction: t });
            }

            return section;
        });

        return res.status(201).json({
            message: 'Section created successfully',
            section: result
        });
    } catch (error) {
        console.log(error.message);
        console.log(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const update = async (req, res) => {
    try {
        const sectionId = Number(req.params.id);
        const { screen, type, name, ids } = req.body;

        if (screen && !['res', 'fam', 'pless'].includes(screen)) {
            return res.status(400).json({ message: 'screen must be one of: res, fam, pless' });
        }

        if (!Array.isArray(ids)) {
            return res.status(400).json({ message: 'ids must be an array' });
        }

        const section = await Section.findOne({
            where: { id: sectionId, isDeleted: false }
        });

        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }

        await sequelize.transaction(async (t) => {
            await section.update({
                screen: screen !== undefined ? screen : section.screen,
                type: type !== undefined ? type : section.type,
                name: name !== undefined ? name : section.name,
                updatedBy: req.user.name || null
            }, { transaction: t });

            await SectionItem.destroy({
                where: { sectionId },
                transaction: t
            });

            for (const id of ids) {
                const itemData = {
                    sectionId: section.id,
                    restaurantId: null,
                    famId: null,
                    productId: null,
                    categoryId: null,
                    createdBy: req.user.name || null,
                    updatedBy: req.user.name || null
                };

                if (type === 'fam') {
                    itemData.famId = id;
                } else if (type === 'restaurant') {
                    itemData.restaurantId = id;
                } else if (type === 'product') {
                    itemData.productId = id;
                } else if (type === 'cat') {
                    itemData.categoryId = id;
                }

                await SectionItem.create(itemData, { transaction: t });
            }
        });

        return res.status(200).json({
            message: 'Section updated successfully',
            section
        });
    } catch (error) {
        console.log(error.message);
        console.log(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const deletee = async (req, res) => {
    try {
        const sectionId = Number(req.params.id);

        const section = await Section.findOne({
            where: { id: sectionId, isDeleted: false }
        });

        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }

        await sequelize.transaction(async (t) => {
            await section.update({
                isDeleted: true,
                updatedBy: req.user.name || null
            }, { transaction: t });

            await SectionItem.update(
                { isDeleted: true, updatedBy: req.user.name || null },
                { where: { sectionId }, transaction: t }
            );
        });

        return res.status(200).json({ message: 'Section deleted successfully' });
    } catch (error) {
        console.log(error.message);
        console.log(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    list,
    getOne,
    create,
    update,
    deletee
};

const { Category, Product, sequelize } = require('../../models');
const { Op } = require('sequelize');
const { getImageUrl, deleteImage } = require('../middleware/imageUpload');

// checked
const createCategory = async (req, res) => {
  try {
    const {restaurantId, name, shortName, description,status } = req.body;
    if(Number(restaurantId)!==Number(req.user.id)){
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    if (name.length > 120) {
      return res.status(400).json({ message: 'Category name must be less than 120 characters' });
    }

    if (shortName && shortName.length > 60) {
      return res.status(400).json({ message: 'Short name must be less than 60 characters' });
    }
    let isActive = false;
    if (status === "active") {
      isActive=true;
    }
    
    const categoryData = {
      name,
      shortName,
      description,
      status,
      restaurantId,
      isActive,
      createdBy: req.user.name || null,
      updatedBy: req.user.name || null
    };

    // Handle optional photo upload
    if (req.file) {
      categoryData.photoUrl = getImageUrl(req.file.filename);
    }

    const category = await Category.create(categoryData);

    return res.status(201).json({
      message: 'Category created successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
    console.log(error.message);
    console.log(error);
  }
};
// checked and updated
const deletee = async (req,res)=> {
  try {
    let { cat_id } = req.params;
    const restaurantId = req.body.restaurantId;

    if(restaurantId!==req.user.id){
      return res.status(401).json({ message: 'Unauthorized' });
    }

    cat_id = Number(cat_id);
    if (!Number.isInteger(cat_id)) {
      return res.status(400).json({ message: 'Invalid category identifier' });
    }
    const category = await Category.findOne({
      where:{
        id:cat_id,
        restaurantId,
        isDeleted:false
      },include:[
        {
          model:Product,
          as: 'products',
          required:false,
          where:{
            isDeleted:false,
            isActive:true
          }
        }
      ]
    });
    
    if(!category){
      return res.status(404).json({ message: 'Category not found' });
    }
    if(category.products.length>0){
      return res.status(400).json({ message: 'Category has products' });
    }
    // Soft delete the category
    await category.update({isActive:false, isDeleted: true});
    
    // Soft delete all products belonging to this category
    await Product.update(
      {isActive: false, isDeleted: true},
      {where: {categoryId: cat_id, restaurantId}}
    );
    
    return res.status(200).json({
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
    console.log(error.message);
    console.log(error);
  }
};
// checked
const updatee = async (req,res) => {
  try {
    const {restaurantId,name, shortName, description}=req.body
    if(Number(restaurantId)!==Number(req.user.id)){
      return res.status(401).json({ message: 'Unauthorized' });
    }
    let { cat_id } = req.params;
    cat_id = Number(cat_id);
    if (!Number.isInteger(cat_id)) {
      return res.status(400).json({ message: 'Invalid category identifier' });
    }

    const category = await Category.findOne({where:{id:cat_id,restaurantId:req.user.id,isDeleted:false}});
    if(!category){
      return res.status(404).json({ message: 'Category not found' });
    }

    const updateData = {name, shortName, description, updatedBy:req.user.name};

    // Handle optional photo upload
    if (req.file) {
      // Delete old photo if exists
      if (category.photoUrl) {
        deleteImage(category.photoUrl);
      }
      updateData.photoUrl = getImageUrl(req.file.filename);
    }

    await category.update(updateData);
    return res.status(200).json({
      message: 'Category updated successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
    console.log(error.message);
    console.log(error);
  }
};
// checked and updated
const deActivate = async (req,res) => {
  try {
    let { cat_id } = req.params;
    const {restaurantId}=req.body;
    if(restaurantId!==req.user.id){
      return res.status(401).json({ message: 'Unauthorized' });
    }
    cat_id = Number(cat_id);
    if (!Number.isInteger(cat_id)) {
      return res.status(400).json({ message: 'Invalid category identifier' });
    }
    const category = await Category.findOne({where:{id:cat_id,restaurantId:req.user.id,isActive:true}});
    if(!category){
      return res.status(404).json({ message: 'Category not found' });
    }
    await category.update({isActive:false,status:"deactivated",updatedBy:req.user.name});
    return res.status(200).json({
      message: 'Category deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
    console.log(error.message);
    console.log(error);
  }
};
// checked and updated
const activate = async (req,res) => {
  try {
    let { cat_id } = req.params;
    const {restaurantId}=req.body;
    if(restaurantId!==req.user.id){
      return res.status(401).json({ message: 'Unauthorized' });
    }
    cat_id = Number(cat_id);
    if (!Number.isInteger(cat_id)) {
      return res.status(400).json({ message: 'Invalid category identifier' });
    }
    const category = await Category.findOne({where:{id:cat_id,restaurantId:req.user.id,isActive:false}});
    if(!category){
      return res.status(404).json({ message: 'Category not found' });
    }
    await category.update({status:"active",isActive:true,updatedBy:req.user.name});
    return res.status(200).json({
      message: 'Category activated successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
    console.log(error.message);
    console.log(error);
  }
};
// checked and updated
const restore = async (req,res) => {
  try {
    let { cat_id } = req.params;
    const {restaurantId}=req.body;
    if(restaurantId!==req.user.id){
      return res.status(401).json({ message: 'Unauthorized' });
    }
    cat_id = Number(cat_id);
    if (!Number.isInteger(cat_id)) {
      return res.status(400).json({ message: 'Invalid category identifier' });
    }
    const category = await Category.findOne({where:{id:cat_id,restaurantId:req.user.id, isDeleted: true, isActive:false}});
    if(!category){
      return res.status(404).json({ message: 'Category not found' });
    }
    await category.update({status:"active",isActive:true,updatedBy:req.user.name});
    const products = await Product.update({
      status:"active",
      isActive:true,
      updatedBy:req.user.name
    },{
      where:{
        categoryId:cat_id,
        restaurantId:req.user.id
      }
    });
    return res.status(200).json({
      message: 'Category restored successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
    console.log(error.message);
    console.log(error);
  }
};
// checked
const getDeleted = async (req,res) =>{
  try {
    const resId = req.user.id;
    const restaurantId = Number(req.params.res_id);
    if(!Number.isInteger(restaurantId)){
      return res.status(400).json({ message: 'Invalid restaurant identifier' });
    }
    if (req.user.role !== 'admin' && restaurantId !== resId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const categories = await Category.findAll({
      where: {
        restaurantId: resId,
        isDeleted: true
      },
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM products AS p
              WHERE p."categoryId" = "Category"."id"
                AND p."isDeleted" = true
            )`),
            'deletedProductsCount'
          ]
        ]
      }
    });
    const serializedCategories = categories.map((category) => {
      const categoryJson = category.toJSON();
      categoryJson.photoUrl = category.photoUrl || null
      return categoryJson;
    });
    return res.status(200).json({
      message: 'Categories fetched successfully',
      categories:serializedCategories
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
    console.log(error.message);
    console.log(error);
  }
};
// checked
const getmine = async (req,res) =>{
  try {
    const restaurantId = req.user.id;
    const categories = await Category.findAll({
      where: {
        restaurantId,
        isDeleted: false
      },
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM products AS p
              WHERE p."categoryId" = "Category"."id"
                AND p."isDeleted" = false
            )`),
            'productsCount'
          ]
        ]
      }
    });
    if(!categories){
      return res.status(404).json({ message: 'Categories not found' });
    }
    const serializedCategories = categories.map((category) => {
      const categoryJson = category.toJSON();
      categoryJson.photoUrl = category.photoUrl || null
      return categoryJson;
    });
    return res.status(200).json({
      message: 'Categories fetched successfully',
      categories:serializedCategories
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
    console.log(error.message);
    console.log(error);
  }
};
// checked
const getCategories = async (req, res) => {
  try {
    const { res_id } = req.params;
    const restaurantId = Number(res_id);

    if (!Number.isInteger(restaurantId)) {
      return res.status(400).json({ message: 'Invalid restaurant identifier' });
    }

    const categories = await Category.findAll({
      where: {
        restaurantId,
        isActive: true
      }
    });

    if(!categories){
      return res.status(404).json({ message: 'Categories not found' });
    }
    
    const serializedCategories = categories.map((category) => {
      const categoryJson = category.toJSON();
      categoryJson.photoUrl = category.photoUrl || null
      return categoryJson;
    });
    return res.status(200).json({
      message: 'Categories fetched successfully',
      categories: serializedCategories
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
    console.log(error.message);
    console.log(error);
  }
};

module.exports = { 
  getCategories,
  createCategory,
  getmine,
  deletee,
  updatee,
  activate,
  deActivate,
  restore,
  getDeleted

}
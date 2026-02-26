const { Config } = require('../../models');

// Get all config values
const getAllConfigs = async (req, res) => {
  try {
    const configs = await Config.findAll({
      attributes: ['id', 'name', 'value', 'status', 'createdAt', 'updatedAt']
    });

    return res.status(200).json({
      message: 'Configs fetched successfully',
      configs
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
    console.log(error.message);
    console.log(error);
  }
};

// Update config values
const updateConfigs = async (req, res) => {
  try {
    const { config } = req.body;

    if (!config || !Array.isArray(config)) {
      return res.status(400).json({ 
        message: 'Invalid request format. Expected config array' 
      });
    }

    // Validate all config items before updating
    for (const item of config) {
      if (!item.name || item.value === undefined || item.value === null) {
        return res.status(400).json({ 
          message: 'Each config item must have name and value' 
        });
      }
    }

    // Update each config item
    const updatedConfigs = [];
    for (const item of config) {
      const configRecord = await Config.findOne({ 
        where: { name: item.name } 
      });

      if (!configRecord) {
        return res.status(404).json({ 
          message: `Config with name '${item.name}' not found` 
        });
      }

      await configRecord.update({
        value: item.value.toString(),
        updatedBy: req.user?.name || 'admin'
      });

      updatedConfigs.push(configRecord);
    }

    return res.status(200).json({
      message: 'Configs updated successfully',
      configs: updatedConfigs
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
    console.log(error.message);
    console.log(error);
  }
};

const getConfigByName = async (req, res) => {
  try {
    const config = await Config.findOne({
      where: { name: req.params.config_name },
      attributes: ['name', 'value']
    });

    if (!config) {
      return res.status(404).json({ 
        message: `Config with name '${req.params.config_name}' not found` 
      });
    }

    return res.status(200).json({
      message: 'Config fetched successfully',
      config
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
    console.log(error.message);
    console.log(error);
  }
}

const updateConfigByName = async (req, res) => {
  try {
    const { value } = req.body;

    if (value === undefined || value === null) {
      return res.status(400).json({ 
        message: 'Invalid request format. Expected config value' 
      });
    }

    const configRecord = await Config.findOne({ 
      where: { name: req.params.config_name } 
    });

    if (!configRecord) {
      return res.status(404).json({ 
        message: `Config with name '${req.params.config_name}' not found` 
      });
    }

    await configRecord.update({
      value: value.toString(),
      updatedBy: req.user?.name || 'admin'
    });

    return res.status(200).json({
      message: 'Config updated successfully',
      config: configRecord
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
    console.log(error.message);
    console.log(error);
  }
};

module.exports = {
  getAllConfigs,
  updateConfigs,
  updateConfigByName,
  getConfigByName
};

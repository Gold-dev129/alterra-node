const Setting = require('../models/Setting');

exports.getSettings = async (req, res) => {
    try {
        const settings = await Setting.find();
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        
        res.status(200).json({
            status: 'success',
            data: settingsMap
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.updateSetting = async (req, res) => {
    try {
        const { key, value } = req.body;
        const setting = await Setting.findOneAndUpdate(
            { key },
            { value },
            { new: true, upsert: true, runValidators: true }
        );
        
        res.status(200).json({
            status: 'success',
            data: { setting }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

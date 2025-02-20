const adminService = require('../services/admin.service');

async function toggleProductStatus(req, res) {
    try {
        const { id } = req.params;
        const result = await adminService.toggleProductStatus(parseInt(id));
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function updateProductCustomization(req, res) {
    try {
        const { id } = req.params;
        const customizationData = req.body;
        const result = await adminService.updateProductCustomization(
            parseInt(id),
            customizationData,
            req.user.userId
        );
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = {
    toggleProductStatus,
    updateProductCustomization,
}; 
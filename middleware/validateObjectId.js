const mongoose = require('mongoose');

module.exports = function (req, res, next) {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).send('Invalid Object id.');
    next();
}
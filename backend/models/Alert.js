const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema(
	{
		diseaseType: { type: String, required: true, index: true },
		message: { type: String, required: true },
		active: { type: Boolean, default: true },
		meta: { type: Object, default: {} }
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Alert', AlertSchema);



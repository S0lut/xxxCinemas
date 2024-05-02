const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    discount_type: { type: String, required: true },
    discount_value: { type: Number, required: true },
    expiry_date: { type: Date, required: true },
    usage_limit: { type: Number, required: true },
    used_count: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Voucher', voucherSchema);
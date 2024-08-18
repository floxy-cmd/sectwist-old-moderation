const mongoose = require('mongoose');

const cezaSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    guildId: {
        type: String,
        required: true,
    },
    roles: {
        type: [String],
        required: true,
    },
    cezaBitis: {
        type: Date,
        required: true,
    }
});

module.exports = mongoose.model('Ceza', cezaSchema);

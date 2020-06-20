const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const saltRounds = 10;
const Schema = mongoose.Schema;

const DistributorSchema = Schema(
    {
        name: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true
        },
        registration_date: {
            type: Date,
            required: true,
            default: new Date()
        },
        batteries: [
            {
                type: Number
            }
        ]
    }
);

DistributorSchema.pre('save', function (next) {
    // Check if document is new or a new password has been set
    if (this.isNew || this.isModified('password')) {
        // Saving reference to this because of changing scopes
        const document = this;
        bcrypt.hash(document.password, saltRounds,
            function (err, hashedPassword) {
                if (err) {
                    next(err);
                }
                else {
                    document.password = hashedPassword;
                    next();
                }
            });
    } else {
        next();
    }
});

DistributorSchema.path('name').validate(function (name) {
    return name.length <= 100;
}, 'Name max length must be 100');

DistributorSchema.path('address').validate(function (address) {
    address = address.replace('0x', '');
    return address.length === 40;
}, 'Address length must be 40');

module.exports = mongoose.model('Distributor', DistributorSchema);
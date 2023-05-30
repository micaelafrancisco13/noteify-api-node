const joi = require("joi");
joi.objectId = require("joi-objectid")(joi);
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 2,
        maxLength: 50,
        trim: true,
        required: true,
    },
});

const Category = mongoose.model("Category", categorySchema);

function validateCategory(category) {
    const schema = joi.object({
        name: joi.string().min(2).max(50).required().label("Category"),
    });

    return schema.validate(category);
}

function isObjectIdValid(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

exports.categorySchema = categorySchema;
exports.Category = Category;
exports.validate = validateCategory;
exports.isObjectIdValid = isObjectIdValid;

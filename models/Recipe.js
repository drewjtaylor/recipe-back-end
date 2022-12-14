const mongoose = require('mongoose');
const {Schema} = mongoose;

const RecipeSchema = new Schema({
    spoonacularId: {
        type: Number,
        required: true
    },
    userDescription: {
        type: String,
    },
    userNotes: {
        type: String
    },
    userRating: {
        type: Number,
    },
    favorite: {
        type: Boolean
    },
    public: {
        type: Boolean,
        required: true,
        default: false
    }
});

module.exports = mongoose.model('Recipe', RecipeSchema);
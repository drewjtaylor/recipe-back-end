const mongoose = require('mongoose');
const {Schema} = mongoose;

const savedRecipeSchema = new Schema({
    spoonacularId: {
        type: Number,
        reguired: true
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
    }
});

module.exports = mongoose.model('SavedRecipe', savedRecipeSchema);
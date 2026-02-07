const mongoose = require("mongoose");


const homeSchema = new mongoose.Schema({
  houseName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  photo: String,

  description:String
});

// Pre-hook to delete all favourites associated with a home before deleting the home
// homeSchema.pre("findOneAndDelete",async function (next) {
//   console.log("Came to preehook while deleting home");
//   const homeId = this.getQuery()._id; // Get the homeId from the query
//  await favourite.deleteMany({ houseId: homeId }); // Delete all files associated with this homeId
//   next(); // Call the next middleware or function in the stack
// })
module.exports = mongoose.model("Home", homeSchema);

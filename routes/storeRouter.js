
//External modules
const express = require("express");
const storeRouter = express.Router();

//Local modules
const storeController = require("../controllers/storeController");

storeRouter.get("/", storeController.getIndex);
storeRouter.get("/bookings", storeController.getBookings);
storeRouter.get("/favourites", storeController.getFavouriteList);
storeRouter.post("/favourites", storeController.postAddToFavourites);
storeRouter.post("/favourites/delete/:homeId", storeController.postRemoveFromFavourites);
storeRouter.get("/homes", storeController.getHomes);
storeRouter.get("/homes/:homeId", storeController.getHomeDetails);
module.exports = storeRouter;

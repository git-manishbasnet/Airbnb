const Home = require("../models/home");
const User = require("../models/user");

exports.getHomes = (req, res, next) => {
  Home.find().then((registeredHomes) => {
    res.render("store/homelist", {
      registeredHomes: registeredHomes,
      pageTitle: "Homes List",
      currentPage: "home",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user || {},
    });
  }); //fetchAll method is called to get the registered homes.Home means the Home class imported from models/home.js
  // console.log("Hello ",registeredHomes);
};
exports.getBookings = (req, res, next) => {
  res.render("store/bookings", {
    pageTitle: "My Bookings",
    currentPage: "bookings",
    isLoggedIn: req.isLoggedIn,
    user: req.session.user || {},
  });
};

exports.getFavouriteList = async (req, res, next) => {
  const userId = req.session.user._id;
  ("favourites"); // Populate the favourites field with the corresponding Home documents
  const user = await User.findById(userId).populate("favourites"); // Find the user by ID and populate the favourites field with Home documents

  res.render("store/favourite-list", {
    favouriteHomes: user.favourites,
    pageTitle: "My Favourites",
    currentPage: "favourites",
    isLoggedIn: req.isLoggedIn,
    user: req.session.user || {},
  });
};
exports.postAddToFavourites = async (req, res, next) => {
  const homeId = req.body.id;
  const userid = req.session.user._id;
  const user = await User.findById(userid);
  if (!user.favourites.includes(homeId)) {
    user.favourites.push(homeId); // Add the homeId to the user's favourites array
    await user.save(); // Save the updated user document
  }

  res.redirect("/favourites");
};

exports.postRemoveFromFavourites = async (req, res, next) => {
 
  const homeId = req.params.homeId;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  if (user.favourites.includes(homeId)) {
    user.favourites = user.favourites.filter(
      (favouriteId) => favouriteId != homeId
    ); // Remove the homeId from the user's favourites array
    await user.save(); // Save the updated user document
  }
  res.redirect("/favourites");
};

exports.getIndex = (req, res, next) => {
  console.log("Session value : ", req.session);
  Home.find().then((registeredHomes) => {
    res.render("store/index", {
      registeredHomes: registeredHomes,
      pageTitle: "airbnb Home",
      currentPage: "index",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user || {},
    });
  });
};
exports.getHomeDetails = (req, res, next) => {
  const homeId = req.params.homeId;
  Home.findById(homeId).then((home) => {
    console.log("Home details found", home);
    if (!home) {
      console.log("Home not found with id:", homeId);
      res.redirect("/homes");
    } else {
      console.log("Home details found", home);
      res.render("store/homedetail", {
        home: home,
        pageTitle: "Home Details",
        currentPage: "home",
        isLoggedIn: req.isLoggedIn,
        user: req.session.user || {},
      });
    }
  });
};

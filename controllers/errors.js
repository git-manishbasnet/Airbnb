const user = require("../models/user");

exports.pageNotFound = (req, res, next) => {
  res.status(404).render("404", {
    pageTitle: "Page not found",
    currentPage: "404",
    isLoggedIn: req.isLoggedIn,
    user: req.session.user || {}, // Use req.user if available, otherwise an empty object
  });
};

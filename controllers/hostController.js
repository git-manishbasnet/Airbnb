const Home = require("../models/home");
const user = require("../models/user");

const getPhotoDataUrl = (file) => {
  return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
};

exports.getAddHome = (req, res, next) => {
  res.render("host/edit-home", {
    pageTitle: "Add home to airbnb",
    currentPage: "add-home",
    editing: false, //editing is false because we are adding a new home, not editing an existing one
     isLoggedIn: req.isLoggedIn,
     user: req.session.user || {}, // Use req.user if available, otherwise an empty object
  });
};
// exports.getAddhome=getAddhome

exports.getEditHome = (req, res, next) => {
  const homeId = req.params.homeId; //get the homeId from the url
  const editing = req.query.editing === "true"; //get the edit query parameter from the url.
  Home.findById(homeId).then((home) => {
    if (!home) {
      console.log("Home not found with id: ", homeId);
      // If home is not found, redirect to the host-homelist page
      return res.redirect("/host/host-homelist"); //if home is not found, redirect to the host-homelist page
    }
    console.log(homeId, editing, home);
    res.render("host/edit-home", {
      home: home, //pass the home object to the view
      //home object will be used to prefill the form fields in the edit-home view
      pageTitle: "Edit home details",
      currentPage: "host-home",
      editing: editing, //pass the editing variable to the view
       isLoggedIn: req.isLoggedIn,
        user: req.session.user || {}, // Use req.user if available, otherwise an empty object
    });
  });
};

exports.getHostHomes = (req, res, next) => {
  Home.find().then((registeredHomes) => {
    
    res.render("host/host-homelist", {
      registeredHomes: registeredHomes,
      pageTitle: "Homes List",
      currentPage: "hostHomes",
       isLoggedIn: req.isLoggedIn,
      user: req.session.user || {}, // Use req.user if available, otherwise an empty object
    });
  });
};

exports.postAddHome = async (req, res, next) => {
  try {
    const { houseName, price, location, rating, description } = req.body;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).send("No file uploaded. Please upload a photo.");
    }

    const photo = getPhotoDataUrl(req.file);

    // Create new Home document
    const home = new Home({
      houseName,
      price,
      location,
      rating,
      photo,
      description,
    });

    // Save to MongoDB
    await home.save();
    console.log("Home saved successfully:", home);

    // Redirect after successful save
    res.redirect("/host/host-homelist");
  } catch (err) {
    console.error("Error adding home:", err);
    // Send 500 response instead of crashing server
    res.status(500).send("Internal Server Error");
  }
};


exports.postEditHome = (req, res, next) => {
  const { id, houseName, price, location, rating, description } =
    req.body;
   
  Home.findById(id).then((home) => {
    // Update the home object with the new values
    home.houseName = houseName;
    home.price = price;
    home.location = location;
    home.rating = rating;
    home.description = description;
    if(req.file){
      home.photo = getPhotoDataUrl(req.file); // Update the photo if a new one is uploaded
    }

     home.save().then((result) => {
    //result will be the result of the update operation
    console.log("Home updated successfully", result);
  }).catch((error) => {
    console.error("Error updating home:", error);
  });
  res.redirect("/host/host-homelist");
}).catch((error) => {
    console.error("Error finding home to edit:", error);
    // res.redirect("/host/host-homelist"); // Redirect to the host-homelist page if an error occurs
  });
}
 

exports.postDeleteHome = (req, res, next) => {
  const homeId = req.params.homeId; //get the homeId from the url
  console.log("came to delete homeId", homeId);
  Home.findByIdAndDelete(homeId)
    .then(() => {
      res.redirect("/host/host-homelist");
    })
    .catch((error) => {
      console.error("Error deleting home:", error);
    });
};

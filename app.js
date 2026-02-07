//Core modules
const path = require("path");

//External modules
const express = require("express");
const session = require("express-session");
const mongodbStore = require("connect-mongodb-session")(session); //This is used to store the session in MongoDB
require("dotenv").config();

const mongodbUri = process.env.MONGO_URI;

// const mongodbUri =
//   "mongodb+srv://mb2060127:mb2060127@airbnb.cv1uuxx.mongodb.net/airbnb?appName=Airbnb";
const { default: mongoose } = require("mongoose");
const multer = require("multer");

//Local module
const storeRouter = require("./routes/storeRouter");
const hostRouter = require("./routes/hostRouter");
const authRouter = require("./routes/authRouter");
const rootDir = require("./utils/pathUtil");
const errorsController = require("./controllers/errors");

const app = express();

app.set("view engine", "ejs"); //for ejs.ejs should be installed
app.set("views", "views");

const store = new mongodbStore({
  uri: mongodbUri, //MongoDB connection URI
  collection: "sessions", //Name of the collection where sessions will be stored
});

const randomString = () => {
  const characters = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); //This is the directory where the uploaded files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, randomString(10) + "-" + file.originalname); //This is the name of the uploaded file. It will be a combination of the current timestamp and the original file name
  },
});

const fileFilter = (req, file, cb) => {
  // This function is used to filter the files that are allowed to be uploaded
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true); // If the file is an image, allow it to be uploaded
  } else {
    cb(null, false); // If the file is not an image, reject it
  }
}

const multerOptions = {
  storage:storage, //This is the storage engine that multer will use to store the uploaded files
  fileFilter: fileFilter, //This is the function that will be used to filter the files that are allowed to be uploaded
};

app.use(express.urlencoded({extended: false}));
app.use(multer(multerOptions).single("photo")); //This is used to parse the form data and make it available in req.body. multer is used to handle file uploads, and "photo" is the name of the file input field in the form.
app.use(express.static(path.join(rootDir, "public"))); //It allows us to access the home.css file which.Otherwise we cannot set the css link to our html page
app.use("/host/uploads",express.static(path.join(rootDir, "uploads")));
app.use("/uploads",express.static(path.join(rootDir, "uploads")));
app.use("/homes/uploads",express.static(path.join(rootDir, "uploads")));
app.use(
  session({
    secret: "Airbnb secret session", //This is used to sign the session ID cookie
    resave: false, //This option indicates whether the session should be saved back to the session store even if it was never modified during the request. Setting it to false means that the session will only be saved if it was modified.
    saveUninitialized: true, //This option indicates whether a session that is new but not modified should be saved to the session store. Setting it to true means that a new session will be saved even if it was never modified.
    store: store, //This is the session store where the session data will be stored
  })
);

app.use((req, res, next) => {
  // Middleware to check if the user is logged in
  req.isLoggedIn = req.session.isLoggedIn;

  next();
});

app.use(storeRouter);

app.use(authRouter); //This is for the login page
app.use("/host", (req, res, next) => {
  if (req.isLoggedIn) {
    next(); // If the user is logged in, proceed to the next middleware or route handler
  } else {
    return res.redirect("/login"); //If user is not logged in then redirect to login page
  }
});
app.use("/host", hostRouter); //This is for the host page

app.use(errorsController.pageNotFound);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(mongodbUri)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on address http://localhost:${PORT}`);
      // console.log(req.isLoggedIn);
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });

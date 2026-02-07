const { check, validationResult } = require("express-validator");
const User = require("../models/user"); // Import the User model
bcrypt = require("bcryptjs"); // Import bcrypt for password hashing

exports.getSignup = (req, res, next) => {
  res.render("auth/signupPage", {
    pageTitle: "Signup",
    currentPage: "signup",
    isLoggedIn: false,
    errors: [],
    oldInput: {
      firstName: "",
      lastName: "",
      email: "",
      userType: "guest",
    },
    user: {},
  });
};
exports.postSignup = [
  //First name validation
  check("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters long")
    .matches(/^[a-zA-Z]+$/)
    .withMessage("First name must contain only letters"),
  //Last name validation
  check("lastName")
    .matches(/^[a-zA-Z]*$/)
    .withMessage("Last name must contain only letters"),
  //Email validation
  check("email")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),
  //Password validation
  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[@$!%*?&]/)
    .withMessage("Password must contain at least one special character")
    .trim(),
  //Confirm password validation
  check("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  //Usertype validation
  check("userType")
    .notEmpty()
    .withMessage("User type is required")
    .isIn(["guest", "host"])
    .withMessage("User type must be either 'guest' or 'host'"),
  //Terms and conditions validation
  check("terms")
    .notEmpty()
    .withMessage("You must agree to the terms and conditions")
    .custom((value) => {
      if (value !== "on") {
        throw new Error("You must agree to the terms and conditions");
      }
      return true;
    }),

  (req, res, next) => {
    const { firstName, lastName, email, password, userType } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("auth/signupPage", {
        pageTitle: "Signup",
        currentPage: "signup",
        isLoggedIn: false,
        errors: errors.array().map((error) => error.msg),
        oldInput: { firstName, lastName, email, userType },
        user: {}, //Because we are not logged in yet, we can pass an empty object
      });
    }
    bcrypt.hash(password, 12).then((hashedPassword) => {
      const user = new User({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hashedPassword,
        userType: userType,
      });
      user.save().then(() => {
          console.log("User created successfully");
          // If there are no validation errors, proceed with the signup logic
          res.redirect("/login");
        })
        .catch((err) => {
          console.error("Error creating user:", err);
          res.status(500).render("auth/signupPage", {
            pageTitle: "Signup",
            currentPage: "signup",
            isLoggedIn: false,
            errors: [
              err.message || "An error occurred while creating the user",
            ],
            oldInput: { firstName, lastName, email, userType },
            user: {}, 
          });
        });
    });
  },
];
exports.getLogin = (req, res, next) => {
  //This function is used to render the login page when user clicks on login link
  res.render("auth/loginPage", {
    pageTitle: "Login",
    currentPage: "login",
    isLoggedIn: false, // Set isLoggedIn to false since the user is not logged in yet
    errors: [],
    oldInput: { email: "", password: "" },
    user:{},
  });
};
exports.postLogin = async(req, res, next) => {
  //This function is used to handle the login form submission and redirect the user to the home page when the login is successful
  
const { email, password } = req.body;
const user= await User.findOne({ email: email })
  if (!user) {
    return res.status(401).render("auth/loginPage", {
      pageTitle: "Login",
      currentPage: "login",
      isLoggedIn: false,
      errors: ["User doesnot exist with this email"],
      oldInput: { email, password },
      user: {}, 
    });
  }

const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).render("auth/loginPage", {
      pageTitle: "Login",
      currentPage: "login",
      isLoggedIn: false,
      errors: ["Incorrect password !Please try again."],
      oldInput: { email, password },
      user: {}, // Because we are not logged in yet, we can pass an empty object
    });
  }

  req.session.isLoggedIn = true; // Set the session variable to indicate that the user is logged in
 console.log(user)
  req.session.user = user; // Store the user information in the session
  await req.session.save(); // Save the session to ensure the changes are persisted
  res.redirect("/");
};

exports.postLogout = (req, res, next) => {
  //This function is used to handle the logout form submission and redirect the user to the login page when the logout is successful
  req.session.destroy(() => {
    // Destroy the session.It removes the isLoggedIn property from the session database. You can check it
    res.redirect("/login"); // Redirect to the login page
  });
};

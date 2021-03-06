import User from "../models/user";

exports.signup = (req, res) => {
  res.render("user/new", {
    error: req.flash("error"),
    success: req.flash("success"),
    session: req.session,
    title: "New User"
  });
};

exports.login = (req, res) => {
  if (req.session.user) {
    res.redirect("/products");
  } else {
    res.render("utils/login", {
      error: req.flash("error"),
      success: req.flash("success"),
      session: req.session
    });
  }
};

exports.verifyPin = (req, res) => {
  let orderID = req.body.orderID;
  let sender = req.body.senderID;
  let senderPin = req.body.pin;

  User.findOne({ _id: sender })
    .then(
      user => {
        if (user.pin === senderPin) {
          req.session.verified = orderID;
          req.flash("success", "You may now deliver");
          res.redirect("/orders/" + orderID);
        } else {
          throw "Wrong pin! Try again?";
        }
      },
      err => {
        throw err;
      }
    )
    .catch(err => {
      req.verified = false;
      req.flash("error", err);
      res.redirect("/orders/" + orderID);
    });
};

//CheckAuthMiddleware
exports.checkAuth = role => {
  return (req, res, next) => {
    if (req.session.user) {
      if (req.session.user.role_id <= role) {
        next();
      } else {
        req.flash("error", "You don't have permission to access this");
        res.redirect(req.session.backURL || "/");
      }
    } else {
      res.redirect("/login");
    }
  };
};

exports.logout = (req, res) => {
  req.session.destroy(function(err) {
    res.redirect("/"); //Inside a callback… bulletproof!
  });
};

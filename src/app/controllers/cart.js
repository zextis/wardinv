import Products from '../models/product';
import Cart from '../models/cart';
import Order from '../models/order';
import {
    formatMoney
  } from 'accounting';

exports.addToCart = (req, res) => {
    let productId = req.params.id;
    let cart = new Cart(req.session.cart ? req.session.cart : {});
  
    //Fetch Product form DB
    Products.findById(productId, (err, product) => {
      if (err) {
        req.flash("error", err);
        res.redirect('/products');
      } else {
        cart.add(product, productId);
        req.session.cart = cart;
        // ! console.log(req.session.cart);
        req.flash("success", `${product.name} was added to cart`);
        res.redirect('/products');
      }
    });
  }
  
  exports.viewCart = (req, res) => {
    if (!req.session.cart || req.session.cart.items == {}) {
      res.render('cart', {
        products: null
      });
    } else {
      let cart = new Cart(req.session.cart);
      res.render('cart', {
        products: cart.generateArray(),
        totalPrice: formatMoney(cart.totalPrice),
        displayPrices: cart.makeDisplayPrices(),
        totalQty: cart.totalQty,
        success: req.flash('success'),
        error: req.flash('error')
      });
    }
  }
  
  exports.removeFromCart = (req, res) => {
    if (!req.session.cart || req.session.cart.items == {}) {
        res.render('cart', {
          products: null
        });
    }
    let cart = new Cart(req.session.cart);
    let id = req.params.id;
    cart.remove(id);
    req.session.cart = cart;
    // console.log(req.session.cart);
    res.redirect('/cart');
  }
  
  exports.updateQuantity = (req, res) =>{
    if (!req.session.cart || req.session.cart.items == {}) {
        res.render('cart', {
          products: null
        });
    }
    const cart =  new Cart(req.session.cart);
    let id = req.body.product_id;
    // !console.log(id);
    let newQty = parseInt(req.body.qty);
    //! console.log(`newqty is ${newQty}`);
    cart.updateQuantity(id, newQty);
    // console.log(cart);
    let product = cart.items[id].item;
    req.flash("success", `${product.name} was updated`);
    req.session.cart = cart;
    res.redirect('/cart');
    // !res.send('route works');
  }

  exports.checkout = (req, res) => {
    //add order to database
    const cart = new Cart(req.session.cart);
    let order = new Order({
      user: req.session.user,
      cart: cart,
      patient: req.body.patient
    });
    Order.create(order, (err, result) => {
      if (err){
        req.flash("error",'Oops! Something went wrong. Try again?');
        res.redirect('/products');
      } else{
        req.flash("success",'Order submitted! Feel free to pick it up!');
        req.session.cart = null;
        res.redirect('/products');
      }
    });
  }
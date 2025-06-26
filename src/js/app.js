import { settings, select, classNames} from "./settings.js";
import Product from "./components/Product.js";
import Cart from "./components/Cart.js";
import Booking from "./components/Booking.js";
import Home from "./components/Home.js";

const app = {
  initPages: function(){
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;// target <section id="order"> and <section id="booking"> in <div id="pages">
    thisApp.navLinks = document.querySelectorAll(select.nav.links);
    const idFromHash = window.location.hash.replace('#/', '');
    //thisApp.activatePage(thisApp.pages[0].id); //Activate the first page found in the DOM ("#order" or "#booking") when the application starts.
    let pageMatchingHash = thisApp.pages[0].id;

    for(let page of thisApp.pages){
      if(page.id == idFromHash){
        pageMatchingHash = page.id;
        break;
      }
    }
    
    thisApp.activatePage(pageMatchingHash);

    for(let link of thisApp.navLinks){
      link.addEventListener('click', function(event){
        event.preventDefault();
        const clickedElement = this;
        const id = clickedElement.getAttribute('href').replace('#', '');// delete # <a href="#order"> to target <section id="order">
        thisApp.activatePage(id);

        window.location.hash = '#/' + id;
      })
    }
  },

  activatePage: function(pageId){
    const thisApp = this;
    /*add class active to matching pages remove from non-matching*/
    for(let page of thisApp.pages){
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }
    /*add class active to matching link remove from non-matching*/
    for(let link of thisApp.navLinks){
      link.classList.toggle(classNames.nav.active, link.getAttribute('href') == '#' + pageId); 
    }
  },

  initMenu: function () {
    const thisApp = this;
    //console.log('thisApp.data:',thisApp.data);
    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initData: function () {
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.products;

    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){
        thisApp.data.products = parsedResponse; /* save parsedResponse as thisApp.data.products */
        thisApp.initMenu(); /* execute initMenu method */     
        thisApp.initCart();
      })
      .catch(function (error) {
        console.log('problem', error);
      });
  },

  init: function () {
    const thisApp = this;
    /*console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);*/
      thisApp.initPages();    
      thisApp.initHome();
      thisApp.initData();
      thisApp.initBooking();
    //thisApp.initCart();
  },

  initCart: function(){
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);
    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    })
  },

    initBooking: function(){
    const thisApp = this;

    const widgetContainer = document.querySelector(select.containerOf.booking);
    thisApp.booking = new Booking(widgetContainer);
  },

  initHome: function(){
    const thisApp = this;

    const widgetContainer = document.querySelector('.home-page');
    thisApp.home = new Home(widgetContainer, thisApp); //thisApp allows access to app.js
  }
};

app.init();

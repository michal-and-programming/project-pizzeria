/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  ("use strict");

  const select = {
    templateOf: {
      menuProduct: "#template-menu-product",
    },
    containerOf: {
      menu: "#product-list",
      cart: "#cart",
    },
    all: {
      menuProducts: "#product-list > .product",
      menuProductsActive: "#product-list > .product.active",
      formInputs: "input, select",
    },
    menuProduct: {
      clickable: ".product__header",
      form: ".product__order",
      priceElem: ".product__total-price .price",
      imageWrapper: ".product__images",
      amountWidget: ".widget-amount",
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: "active",
      imageVisible: "active",
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(
      document.querySelector(select.templateOf.menuProduct).innerHTML
    ),
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
    }
    renderInMenu() {
      const thisProduct = this;
      const generatedHTML = templates.menuProduct(thisProduct.data); /*generate HTML based on template*/
      thisProduct.element = utils.createDOMFromHTML(generatedHTML); /*create element using utils.createElementFromHTML*/
      const menuContainer = document.querySelector(select.containerOf.menu); /*find menu container*/
      menuContainer.appendChild(thisProduct.element); /*add element to menu*/
    }
    getElements() {
      const thisProduct = this;

      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);

      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(
        select.menuProduct.form
      );
      thisProduct.formInputs = thisProduct.form.querySelectorAll(
        select.all.formInputs
      );
      thisProduct.cartButton = thisProduct.element.querySelector(
        select.menuProduct.cartButton
      );
      thisProduct.priceElem = thisProduct.element.querySelector(
        select.menuProduct.priceElem
      );
      /*console.log('header',thisProduct.accordionTrigger);
        console.log('caly pojemnik z formularzem',thisProduct.form);
        console.log('ilosc sztuk w input',thisProduct.formInputs);
        console.log('guzik',thisProduct.cartButton);
        console.log('cena w span',thisProduct.priceElem);*/
    }
    initAccordion() {
      const thisProduct = this;

      /* START: add event listener to clickable trigger on event click */
      thisProduct.accordionTrigger.addEventListener("click", function (event) {
        event.preventDefault(); /* prevent default action for event */

        const activeProducts = thisProduct.element.querySelectorAll(
          select.all.menuProductsActive
        ); /* find active product (product that has active class) */

        for (let activeProduct of activeProducts)
          if (activeProduct !== thisProduct.element) {
            activeProduct.classList.remove(select.all.menuProductsActive);
          } /* if there is active product and it's not thisProduct.element, remove class active from it */

        thisProduct.element.classList.toggle("active"); /* toggle active class on thisProduct.element */
      });
    }
    initOrderForm() {
      const thisProduct = this;

      thisProduct.form.addEventListener("submit", function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.formInputs) {
        input.addEventListener("change", function () {
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener("click", function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });
      //console.log("metoda = initOrderForm");
    }

    initAmountWidget(){
        const thisProduct = this;
        thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
        thisProduct.amountWidgetElem.addEventListener('updated', function(){
          thisProduct.processOrder();
        })
      }

    processOrder() {
      const thisProduct = this;

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log("formData", formData);

      // set price to default price
      let price = thisProduct.data.price;

      // for every category (param)...
      for (let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        //console.log("to co jest w srodku", paramId,"to co jest w param",param);

        // for every option in this category
        for (let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          //console.log(optionId, option);

          // check if there is param with a name of paramId in formData and if it includes optionId
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          if (optionSelected) {
            // check if the option is not default
            if (!option.default) {
              price += option.price; // add option price to price variable
            }
          } else {
              // check if the option is default
              if (option.default) {
              price -= option.price; // reduce price variable
              }
            }
          const optionImage = thisProduct.imageWrapper.querySelector(optionId,paramId);//nie wiem jaki selektor
          if(optionImage) {
            if(optionSelected) {
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            }
            else {
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }

      // update calculated price in the HTML
      price *= thisProduct.amountWidget.value; //multiplying price by quantity
      thisProduct.priceElem.innerHTML = price;
    }
  }

  class AmountWidget{
    constructor(element){
      const thisWidget = this;
      thisWidget.getElements(element);
      if(thisWidget.input.value){
        thisWidget.setValue(thisWidget.input.value);
      }
      else{
        thisWidget.setValue(settings.amountWidget.defaultValue);
      }
      thisWidget.initActions();
    }
    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value){
      const thisWidget = this;

      const newValue = parseInt(value);

      if(thisWidget.value !==newValue && !Number.isNaN(newValue) 
        && newValue > settings.amountWidget.defaultMin 
        && newValue <= settings.amountWidget.defaultMax){
        thisWidget.value = newValue;
        thisWidget.announce();
      }
      thisWidget.input.value = thisWidget.value;/* TODO: Add validation */
    }

    initActions(){
      const thisWidget =this;
      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
      });
      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value -1);
      });
      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value +1);
      });
    }
    announce(){
      const thisWidget = this;

      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }
  }

  class Cart{
    constructor(element){
      const thisCart = this;

      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initActions();
      console.log('new Cart', thisCart);
    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = element.querySelector(select.cart.toggleTrigger);
    }

    initActions(){
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function(){
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      })
    }
  }

  const app = {
    initMenu: function () {
      const thisApp = this;
      //console.log('thisApp.data:',thisApp.data);
      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function () {
      const thisApp = this;
      thisApp.data = dataSource;
    },

    init: function () {
      const thisApp = this;
      /*console.log('*** App starting ***');
        console.log('thisApp:', thisApp);
        console.log('classNames:', classNames);
        console.log('settings:', settings);
        console.log('templates:', templates);*/
      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },

    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },
  };

  app.init();
}

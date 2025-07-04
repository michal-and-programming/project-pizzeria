import {select, classNames, templates} from "../settings.js";
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

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
      thisProduct.addToCart();
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
    thisProduct.priceSingle = price;
    price *= thisProduct.amountWidget.value; //multiplying price by quantity
    thisProduct.priceElem.innerHTML = price; // update calculated price in the HTML
  }

  addToCart() {
    const thisProduct = this;

    //  app.cart.add(thisProduct.prepareCartProduct());
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    }
    );
    thisProduct.element.dispatchEvent(event);
  }

   prepareCartProduct(){
    const thisProduct = this;
    const productSummary = {
      id: thisProduct.id,
      name: thisProduct.data.name,
      amount: thisProduct.amountWidget.value,
      priceSingle: thisProduct.priceSingle,
      price: thisProduct.priceSingle * thisProduct.amountWidget.value,
      params: thisProduct.prepareCartProductParams(),
    };
    return productSummary;
  }
  
  prepareCartProductParams() {
    const thisProduct = this;
    const formData = utils.serializeFormToObject(thisProduct.form);
    const params = {};
    // for very category (param)
    for(let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];
      // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
      params[paramId] = {
      label: param.label,
      options: {}
      }
      // for every option in this category
      for(let optionId in param.options) {
        const option = param.options[optionId];
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
        if(optionSelected) {
          params[paramId].options[optionId] = option// option is selected!
        }
      }
    }
    return params;  
  } 
}

export default Product;
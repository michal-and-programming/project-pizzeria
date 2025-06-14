import {select, classNames, templates, settings} from "../settings.js";
import CartProduct from "./CartProduct.js";
import utils from "../utils.js";

class Cart{
  constructor(element){
    const thisCart = this;
    thisCart.products = [];
    thisCart.getElements(element);
    thisCart.initActions();
    //console.log('new Cart', thisCart);
  }

  getElements(element){
    const thisCart = this;
    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = element.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = element.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelector(select.cart.totalPrice);
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    thisCart.dom.orderPrice = thisCart.dom.wrapper.querySelector(select.cart.orderTotal);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
  }

  initActions(){
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click', function(){
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    })
    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function(event){
      thisCart.remove(event.detail.cartProduct);
    })
    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();
    })
  }

  add(menuProduct){
    const thisCart = this;
    const generatedHTML = templates.cartProduct(menuProduct);
    thisCart.generatedDom = utils.createDOMFromHTML(generatedHTML);
    thisCart.dom.productList.appendChild(thisCart.generatedDom);
    thisCart.products.push(new CartProduct(menuProduct, thisCart.generatedDom));
    thisCart.update();
  }

  update(){
    const thisCart = this;
    const deliveryFee = settings.cart.defaultDeliveryFee;
    let totalNumber = 0;
    let subtotalPrice = 0;
    let totalPrice = 0;
    for(let cartProduct of thisCart.products){
      totalNumber+= cartProduct.amount;
      subtotalPrice+= cartProduct.price;
      }
      if(totalNumber===0){
        totalPrice = 0;
      }
    else{
      totalPrice = subtotalPrice + deliveryFee;
    }
    thisCart.totalNumber = totalNumber;
    thisCart.subtotalPrice = subtotalPrice;
    thisCart.deliveryFee = deliveryFee;
    thisCart.totalPrice = totalPrice;
    
    thisCart.dom.deliveryFee.innerHTML = deliveryFee;
    thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
    thisCart.dom.totalPrice.innerHTML = totalPrice;
    thisCart.dom.totalNumber.innerHTML = totalNumber;
    thisCart.dom.orderPrice.innerHTML  = totalPrice;
  }

  remove(cartProduct){
    const thisCart = this;
    cartProduct.dom.wrapper.remove();
    const indexOfProduct = thisCart.products.indexOf(cartProduct);
    if(indexOfProduct >=0){
      thisCart.products.splice(indexOfProduct, 1);
    }
    thisCart.update();
  }

  sendOrder() {
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.orders;
    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: [],
    };
    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    fetch(url, options);
  }
}

export default Cart;
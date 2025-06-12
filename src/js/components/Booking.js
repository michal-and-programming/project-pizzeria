import {select, templates} from "../settings.js";
import AmountWidget from "./AmountWidget.js";

class Booking{
  constructor(element){
    const thisBooking = this;
    thisBooking.element = element;
    
    thisBooking.render();
    thisBooking.initWidgets();
  }

  render(){
    const thisBooking = this;
    thisBooking.dom = {};

    const generatedHTML = templates.bookingWidget();
    thisBooking.dom.wrapper = thisBooking.element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount =  document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount =  document.querySelector(select.booking.hoursAmount);
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.dom.peopleAmount.addEventListener('click', function(){});

    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener('click', function(){});
  }
}

export default Booking
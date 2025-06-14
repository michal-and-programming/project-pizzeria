import {select, templates} from "../settings.js";
import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";

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
    thisBooking.dom.dateInput = document.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hoursInput = document.querySelector(select.widgets.hourPicker.wrapper);
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.dom.peopleAmount.addEventListener('click', function(){});

    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener('click', function(){});

    thisBooking.dateInput = new DatePicker(thisBooking.dom.dateInput);
    thisBooking.hoursInput = new HourPicker(thisBooking.dom.hoursInput);
  }
}

export default Booking
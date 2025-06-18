import {classNames, select, settings, templates} from "../settings.js";
import utils from "../utils.js";
import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";

class Booking{
  constructor(element){
    const thisBooking = this;
    thisBooking.element = element;
    thisBooking.starters = [];
    thisBooking.chosenTable = null;

    thisBooking.render();
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ]
    }

    const urls = {
      booking: settings.db.url + '/' + settings.db.bookings + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.events + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.events + '?' + params.eventsRepeat.join('&'),
    }

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
    .then(function(allResponses){
      const bookingsResponse = allResponses[0];
      const eventsCurrentResponse = allResponses[1];
      const eventsRepeatResponse = allResponses[2];
      return Promise.all([
        bookingsResponse.json(),
        eventsCurrentResponse.json(),
        eventsRepeatResponse.json(),
      ]);
    })
    .then(function([bookings, eventsCurrent, eventsRepeat]){//eventsCurrent= one-off event, eventsRepeat= cyclical event
      thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
    })
    .catch(function(error){
      console.error('problem with internet:', error);
    })
  }
  

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    thisBooking.updateDom();
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }
    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){    

      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDom(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if(typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] =='undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(!allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      }
      else{
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
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
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.floorPlan = document.querySelector(select.containerOf.floorPlan);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.cart.address);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.cart.phone);
    thisBooking.dom.input = thisBooking.dom.wrapper.querySelector(select.containerOf.checkbox);
    thisBooking.dom.submitButton = thisBooking.dom.wrapper.querySelector(select.booking.submitButton);
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.dom.peopleAmount.addEventListener('click', function(){
      thisBooking.resetTable();
    });

    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener('click', function(){
      thisBooking.resetTable();
    });

    thisBooking.datePicker = new DatePicker(thisBooking.dom.dateInput);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hoursInput);

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDom();
      thisBooking.resetTable();
    })
    thisBooking.dom.floorPlan.addEventListener('click', function(event){
      thisBooking.initTables(event);
    })
    thisBooking.dom.submitButton.addEventListener('click', (event) => {
      event.preventDefault();
      thisBooking.sendBooking();
    })
  }

  initTables(event){
    const thisBooking = this;
    const clickedElement = event.target;
    const id = parseInt(clickedElement.getAttribute(settings.booking.tableIdAttribute));

    if(clickedElement.classList.contains('table')){
    
      if(clickedElement.classList.contains(classNames.booking.tableBooked)){
        alert('this table is already booked')
      }

      if(clickedElement.classList.contains(classNames.booking.selectedTable)){
        clickedElement.classList.remove(classNames.booking.selectedTable);
        thisBooking.chosenTable = null;
        return;
      }

      for(let table of thisBooking.dom.tables){
        table.classList.remove(classNames.booking.selectedTable);
      }

      clickedElement.classList.add(classNames.booking.selectedTable);
      thisBooking.chosenTable = id;
    }
  }

  resetTable(){
    const thisBooking = this;
    
    for(let table of thisBooking.dom.tables){
        table.classList.remove(classNames.booking.selectedTable);
      }
  }

  checkbox() {
  const thisBooking = this;

  thisBooking.dom.input.addEventListener('click', function(event) {
    const check = event.target;

    if (check.tagName === 'INPUT') {
      if (check.checked) {
        if ((check.value === 'water' || check.value === 'bread') && !thisBooking.starters.includes(check.value)) {
          thisBooking.starters.push(check.value);
        }
        if (check.value === 'bread' && !thisBooking.starters.includes('water')) {
          thisBooking.starters.push('water');
        }
      } else if (!check.checked) {
        const index = thisBooking.starters.indexOf(check.value);
        if (index > -1) {
          thisBooking.starters.splice(index, 1);
        }
      }
      console.log(thisBooking.starters);
    }
  });
}

  sendBooking(){
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.bookings;

    const payload = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: Number(thisBooking.chosenTable),
      duration: Number(thisBooking.hoursAmount.value),
      ppl: Number(thisBooking.peopleAmount.value),
      starters: [],
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
    }

    for(let data of thisBooking.starters) {
      payload.starters.push(data.checkbox());
    }
   
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    fetch(url, options)

    .then(function(response){
      if(response.ok){
        return response.json();
      }
    })
    .then(function(){
      thisBooking.makeBooked(
        payload.date,
        payload.hour,
        payload.duration,
        payload.table
      )
    })
    .catch(function(error){
      console.error(error)
    })
  }
}

export default Booking

import { settings, templates } from "../settings.js";

class Home{
  constructor(element, refToApp){
    const thisHome = this;
    thisHome.element = element;
    thisHome.refToApp = refToApp;

    thisHome.render();
  }

  render(){
    const thisHome = this;

    const url = settings.db.url + '/' + settings.db.home;
     const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    fetch(url, options)
    .then(function(response){
      if(response.ok){
        return response.json();
      }
    })
    .then(function(data){
      const generatedHTML = templates.homePage({
        carousel: data.carousel,
        gallery: data.gallery,
      })
      thisHome.element.innerHTML = generatedHTML;
      thisHome.initCarousel();
      thisHome.initAction();
    })
    .catch(function(error){
      console.error(error)
    })
  }

  initCarousel(){
    const elem = document.querySelector('.main-carousel');
    new Flickity( elem, {
    cellAlign: 'left',
    contain: true,
    autoPlay: 3000,
    wrapAround: true,
    pageDots: true
    });
  }

  initAction(){
    const thisHome = this;
    const linkOrder = document.querySelector('.order-link-wrapper');
    const linkBooking = document.querySelector('.booking-link-wrapper');

    linkOrder.addEventListener('click', function(event){
      event.preventDefault();
      thisHome.refToApp.activatePage('order');
    })
    linkBooking.addEventListener('click', function(event){
      event.preventDefault();
      thisHome.refToApp.activatePage('booking');
    })
  }
}

export default Home;
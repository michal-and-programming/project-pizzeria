import { settings, templates } from "../settings.js";

class Home{
  constructor(element){
    const thisHome = this;
    thisHome.element = element;
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
      const generatedHTML = templates.homeWidget({
        carousel: data.carousel,
        gallery: data.gallery,
      })
      thisHome.element.innerHTML = generatedHTML;
      console.log(generatedHTML);
      thisHome.initAction();
    })
    .catch(function(error){
      console.error(error)
    })
  }

   

  initAction(){
    const linkOrder = document.querySelector('.order-link-wrapper');
    const linkBooking = document.querySelector('.booking-link-wrapper');

    linkOrder.addEventListener('click', function(){
      
    })
    linkBooking.addEventListener('click', function(){
      
    })
  }
}

export default Home;
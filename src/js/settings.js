export  const select = {
          templateOf: {
            menuProduct: '#template-menu-product',
            cartProduct: '#template-cart-product',
            bookingWidget: '#template-booking-widget',
            homePage:'#template-home', //new
          },
          containerOf: {
            menu: '#product-list',
            cart: '#cart',
            pages: '#pages', //new
            booking: '.booking-wrapper', //new
            floorPlan: '.floor-plan',
            checkbox: '.checkbox',
          },
          all: {
            menuProducts: '#product-list > .product',
            menuProductsActive: '#product-list > .product.active',
            formInputs: 'input, select',
          },
          menuProduct: {
            clickable: '.product__header',
            form: '.product__order',
            priceElem: '.product__total-price .price',
            imageWrapper: '.product__images',
            amountWidget: '.widget-amount',
            cartButton: '[href="#add-to-cart"]',
          },
          widgets: {
            amount: {
              input: 'input.amount',
              linkDecrease: 'a[href="#less"]',
              linkIncrease: 'a[href="#more"]',
            },
            datePicker: { //new
              wrapper: '.date-picker',
              input: `input[name="date"]`,
            },
            hourPicker: { //new
              wrapper: '.hour-picker',
              input: 'input[type="range"]',
              output: '.output',
            },
          },
          booking: { //new
            peopleAmount: '.people-amount',
            hoursAmount: '.hours-amount',
            tables: '.floor-plan .table',
            submitButton: '.btn-secondary',
          },
          nav: { //new
            links: '.main-nav a',
          },
          cart: {
            productList: '.cart__order-summary',
            toggleTrigger: '.cart__summary',
            totalNumber: `.cart__total-number`,
            totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
            subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
            deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
            orderTotal: '.cart__order-total .cart__order-price-sum',
            form: '.cart__order',
            formSubmit: '.cart__order [type="submit"]',
            phone: '[name="phone"]',
            address: '[name="address"]',
          },
          cartProduct: {
            amountWidget: '.widget-amount',
            price: '.cart__product-price',
            edit: '[href="#edit"]',
            remove: '[href="#remove"]',
          },
        };

export  const classNames = {
          menuProduct: {
            wrapperActive: 'active',
            imageVisible: 'active',
          },
          cart: {
            wrapperActive: 'active',
          },
          booking: { //new
            loading: 'loading',
            tableBooked: 'booked',
            selectedTable: 'selected',
          },
          nav: { //new
            active: 'active',
          },
          pages: { //new
            active: 'active',
          }
        };

export  const settings = {
          amountWidget: {
            defaultValue: 1,
            defaultMin: 1,
            defaultMax: 9,
          },
          hours: { //new
            open: 12,
            close: 24,
          },
          datePicker: { //new
            maxDaysInFuture: 14,
          },
          booking: { //new
            tableIdAttribute: 'data-table',
          },
          db: {
            url: '//localhost:3131',
            home: 'home',
            products: 'products',
            orders: 'orders',
            bookings: 'bookings', //new
            events: 'events', //new
            dateStartParamKey: 'date_gte', //new
            dateEndParamKey: 'date_lte', //new
            notRepeatParam: 'repeat=false', //new
            repeatParam: 'repeat_ne=false', //new
          },
          cart: {
            defaultDeliveryFee: 20,
          },
        };

export  const templates = {
          menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
          cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
          bookingWidget: Handlebars.compile(document.querySelector(select.templateOf.bookingWidget).innerHTML), //new
          homeWidget: Handlebars.compile(document.querySelector(select.templateOf.homePage).innerHTML),
        };
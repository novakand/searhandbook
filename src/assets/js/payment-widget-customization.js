const getCheckbox = () => {
  const checkbox = document.createElement('input');
  checkbox.setAttribute('type', 'checkbox');
  checkbox.setAttribute('id', 'saveTokenCtrl');
  checkbox.setAttribute('name', 'createRegistration');
  return checkbox;
};

const getLabel = () => {
  const label = document.createElement('label');
  label.setAttribute('for', 'saveTokenCtrl');
  const span = document.createElement('span');
  span.textContent = 'Save the token of this card';
  label.appendChild(span);
  return label;
};

const addCreateRegistrationHTML = () => {
  const createRegistrationHtml = document.createElement('div');
  createRegistrationHtml.setAttribute('class', 'wpwl-custom-checkbox');
  createRegistrationHtml.appendChild(getCheckbox());
  createRegistrationHtml.appendChild(getLabel());
  const form = document.querySelector('.wpwl-form');
  form.appendChild(createRegistrationHtml);
};

let wpwlOptions = {
  style: 'card',
  onAfterSubmit: () => {
    const service = location.href.includes('hotel') ? 'hotel' : 'transfer';
    location.href = `${location.origin}/search/${service}/payment-result`;
  },
  onReady: () => addCreateRegistrationHTML(),
};

// let wpwlOptions = {
//   style: 'plain',
//   forceCardHolderEqualsBillingName: true,
//   showCVVHint: true,
//   brandDetection: true,
//   spinner: {
//     className: '__display-none',
//   },
//
//   onReady: function(){
//     let loader = document.getElementById('transfer-payment_loader');
//     let formContainer = document.getElementById('transfer-payment_form-container');
//
//     setTimeout(() => {
//       loader.style.display = 'none';
//       formContainer.style.visibility = 'visible';
//     }, 1000);
//
//     let form = document.getElementsByClassName('wpwl-form')[0];
//     form.insertBefore(
//       document.getElementsByClassName('wpwl-group-cardNumber')[0],
//       document.getElementsByClassName('wpwl-group-brand')[0]
//     );
//     form.insertBefore(
//       document.getElementsByClassName('wpwl-group-cvv')[0],
//       document.getElementsByClassName('wpwl-group-cardHolder')[0]
//     );
//
//     let brands = document.getElementsByClassName('wpwl-group-brand')[0];
//     let visa = document.getElementsByClassName('wpwl-brand')[0].cloneNode(true);
//     visa.removeAttribute('class');
//     visa.setAttribute('class', 'wpwl-brand-card wpwl-brand-custom wpwl-brand-VISA');
//     let master = visa.cloneNode(true);
//     let amex = visa.cloneNode(true);
//     master.classList.remove('wpwl-brand-VISA');
//     amex.classList.remove('wpwl-brand-VISA');
//     master.classList.add('wpwl-brand-MASTER');
//     amex.classList.add('wpwl-brand-AMEX');
//     brands.appendChild(visa);
//     brands.appendChild(master);
//     brands.appendChild(amex);
//   },
//
//   onAfterSubmit: () => {
//     location.href = `${location.origin}/search/transfer/payment`;
//   },
//
//   onChangeBrand: function(e){
//     let customBrands = document.getElementsByClassName('wpwl-brand-custom');
//     for (let i = 0; i < customBrands.length; i++) {
//       customBrands[i].style.opacity = !!e ? '0.3' : '1';
//     }
//     let currentBrand = document.querySelectorAll('.wpwl-brand-custom.wpwl-brand-' + e);
//     if (!!currentBrand) {
//       for (let i = 0; i < currentBrand.length; i++) {
//         currentBrand[i].style.opacity = '1';
//       }
//     }
//   }
// };



import './style.css'
import {fetchData, postData, deleteData, editData} from './apiCalls'
import {showStatus} from './errorHandling'

//Sections, buttons, text
const couponsView = document.querySelector("#coupons-view")
const itemsView = document.querySelector("#items-view")
const merchantsView = document.querySelector("#merchants-view")
const merchantsNavButton = document.querySelector("#merchants-nav")
const itemsNavButton = document.querySelector("#items-nav")
const addNewButton = document.querySelector("#add-new-button")
const showingText = document.querySelector("#showing-text")
const displayOptions = document.querySelector(".display-options")

//Form elements
const merchantForm = document.querySelector("#new-merchant-form")
const newMerchantName = document.querySelector("#new-merchant-name")
const submitMerchantButton = document.querySelector("#submit-merchant")

// Event Listeners
merchantsView.addEventListener('click', (event) => {
  handleMerchantClicks(event)
})

merchantsNavButton.addEventListener('click', showMerchantsView)
itemsNavButton.addEventListener('click', showItemsView)

addNewButton.addEventListener('click', () => {
  hide([addNewButton])
  show([merchantForm])
})

submitMerchantButton.addEventListener('click', (event) => {
  submitMerchant(event)
})

//Global variables
let merchants;
let items;

//Page load data fetching
Promise.all([fetchData('merchants'), fetchData('items')])
.then(responses => {
    merchants = responses[0].data
    items = responses[1].data
    displayMerchants(merchants)
  })
  .catch(err => {
    console.log('catch error: ', err)
  })

// Merchant CRUD Functions
function handleMerchantClicks(event) {
  if (event.target.classList.contains("delete-merchant")) {
    deleteMerchant(event)
  } else if (event.target.classList.contains("edit-merchant")) {
    editMerchant(event)
  } else if (event.target.classList.contains("view-merchant-coupons")) {
    getMerchantCoupons(event)
  } else if (event.target.classList.contains("view-merchant-items")) {
    displayMerchantItems(event)
  } else if (event.target.classList.contains("submit-merchant-edits")) {
    submitMerchantEdits(event)
  } else if (event.target.classList.contains("discard-merchant-edits")) {
    discardMerchantEdits(event)
  }
}

function deleteMerchant(event) {
  const id = event.target.closest("article").id.split('-')[1]
  deleteData(`merchants/${id}`)
    .then(() => {
      let deletedMerchant = findMerchant(id)
      let indexOfMerchant = merchants.indexOf(deletedMerchant)
      merchants.splice(indexOfMerchant, 1)
      displayMerchants(merchants)
      showStatus('Success! Merchant removed!', true)
    })
}

function editMerchant(event) {
  const article = event.target.closest("article")
  const h3Name = article.firstElementChild
  const editInput = article.querySelector(".edit-merchant-input")
  const submitEditsButton = article.querySelector(".submit-merchant-edits")
  const discardEditsButton = article.querySelector(".discard-merchant-edits")
  const viewCouponButton = article.querySelector(".view-merchant-coupons")
  const viewItemsButton = article.querySelector(".view-merchant-items")
  const editMerchantButton = article.querySelector(".edit-merchant")
  const deleteMerchantButton = article.querySelector(".delete-merchant")
  editInput.value = h3Name.innerText
  show([editInput, submitEditsButton, discardEditsButton])
  hide([viewCouponButton, viewItemsButton, editMerchantButton, deleteMerchantButton])
}

function submitMerchantEdits(event) {
  event.preventDefault();
  const article = event.target.closest("article")
  const editInput = article.querySelector(".edit-merchant-input")
  const id = article.id.split('-')[1]

  const patchBody = { name: editInput.value }
  editData(`merchants/${id}`, patchBody)
    .then(patchResponse => {
      let merchantToUpdate = findMerchant(patchResponse.data.id)
      let indexOfMerchant = merchants.indexOf(merchantToUpdate)
      merchants.splice(indexOfMerchant, 1, patchResponse.data)
      displayMerchants(merchants)
      showStatus('Success! Merchant updated!', true)
    })
}

function discardMerchantEdits(event) {
  const article = event.target.closest("article")
  const editInput = article.querySelector(".edit-merchant-input")
  const submitEditsButton = article.querySelector(".submit-merchant-edits")
  const discardEditsButton = article.querySelector(".discard-merchant-edits")
  const viewCouponButton = article.querySelector(".view-merchant-coupons")
  const viewItemsButton = article.querySelector(".view-merchant-items")
  const editMerchantButton = article.querySelector(".edit-merchant")
  const deleteMerchantButton = article.querySelector(".delete-merchant")

  editInput.value = ""
  hide([editInput, submitEditsButton, discardEditsButton])
  show([viewCouponButton, viewItemsButton, editMerchantButton, deleteMerchantButton])
}

function submitMerchant(event) {
  event.preventDefault()
  var merchantName = newMerchantName.value
  postData('merchants', { name: merchantName })
    .then(postedMerchant => {
      merchants.push(postedMerchant.data)
      displayAddedMerchant(postedMerchant.data)
      newMerchantName.value = ''
      showStatus('Success! Merchant added!', true)
      hide([merchantForm]) 
    })
}

// Functions that control the view 
function showMerchantsView() {
  showingText.innerText = "All Merchants"
  addRemoveActiveNav(merchantsNavButton, itemsNavButton)
  addNewButton.dataset.state = 'merchant'
  show([merchantsView, addNewButton])
  show([displayOptions])
  hide([itemsView])
  displayMerchants(merchants)
}

function showItemsView() {
  showingText.innerText = "All Items"
  addRemoveActiveNav(itemsNavButton, merchantsNavButton)
  addNewButton.dataset.state = 'item'
  show([itemsView])
  hide([merchantsView, merchantForm, addNewButton, couponsView])
  displayItems(items)
}

function showMerchantItemsView(id, items) {
  showingText.innerText = `All Items for Merchant #${id}`
  show([itemsView])
  hide([merchantsView, addNewButton, couponsView])
  addRemoveActiveNav(itemsNavButton, merchantsNavButton)
  addNewButton.dataset.state = 'item'
  displayItems(items)
}

// Functions that add data to the DOM
function displayItems(items) {
  itemsView.innerHTML = ''
  let firstHundredItems = items.slice(0, 99)
  firstHundredItems.forEach(item => {
    let merchant = findMerchant(item.attributes.merchant_id).attributes.name
    itemsView.innerHTML += `
     <article class="item" id="item-${item.id}">
          <img src="" alt="">
          <h2>${item.attributes.name}</h2>
          <p>${item.attributes.description}</p>
          <p>$${item.attributes.unit_price}</p>
          <p class="merchant-name-in-item">Merchant: ${merchant}</p>
        </article>
    `
  })
}

function displayMerchants(merchants) {
    merchantsView.innerHTML = ''
    merchants.forEach(merchant => {
        merchantsView.innerHTML += 
        `<article class="merchant" id="merchant-${merchant.id}">
          <h3 class="merchant-name">${merchant.attributes.name}</h3>
          <div class="merchant-options">
            <button class="view-merchant-coupons">View Coupons</button>
            <button class="view-merchant-items">View Items</button>
            <button class="edit-merchant">Edit</button>
            <input class="edit-merchant-input hidden" name="edit-merchant" type="text">
            <button class="submit-merchant-edits hidden">
              Submit Edits
            </button>
            <button class="discard-merchant-edits hidden">
              Discard Edits
            </button>
            <button class="delete-merchant">Delete</button>
          </div>
        </article>` 
    })
}

function displayAddedMerchant(merchant) {
      merchantsView.insertAdjacentHTML('beforeend', 
      `<article class="merchant" id="merchant-${merchant.id}">
          <h3 class="merchant-name">${merchant.attributes.name}</h3>
          <div class="merchant-options">
            <button class="view-merchant-coupons">View Coupons</button>
            <button class="view-merchant-items">View Items</button>
            <button class="edit-merchant">Edit</button>
            <input class="edit-merchant-input hidden" name="edit-merchant" type="text">
            <button class="submit-merchant-edits hidden">
              Submit Edits
            </button>
            <button class="discard-merchant-edits hidden">
              Discard Edits
            </button>
            <button class="delete-merchant">Delete</button>
          </div>
        </article>`)
}

function displayMerchantItems(event) {
  let merchantId = event.target.closest("article").id.split('-')[1]
  const filteredMerchantItems = filterByMerchant(merchantId)
  showMerchantItemsView(merchantId, filteredMerchantItems)
}

function getMerchantCoupons(event) {
  let merchantId = event.target.closest("article").id.split('-')[1]
  console.log("Merchant ID:", merchantId)
  hide([displayOptions])
  fetchData(`merchants/${merchantId}/coupons`)
  .then(couponData => {
    console.log("Coupon data from fetch:", couponData)
    const coupons = couponData.data; 

        displayMerchantCoupons(coupons);
    })
}

function displayMerchantCoupons(coupons) {
  show([couponsView]);
  hide([merchantsView, itemsView]);
  couponsView.innerHTML = ``;

  console.log(coupons);

  if (coupons.length === 0) {
    couponsView.innerHTML = `<p>No coupons available for this merchant.</p>`;
    return;
  }

  coupons.forEach(coupon => {
    console.log(coupon);

    const { id, attributes } = coupon; 
    const { name, code, discount_value, discount_type, active, merchant_id } = attributes;

    let formattedDiscount;
    if (discount_type === 'percent') {
      formattedDiscount = `${discount_value}%`;
    } else if (discount_type === 'dollar') {
      formattedDiscount = `$${discount_value}`;
    } else {
      formattedDiscount = `${discount_value}`; 
    }

    couponsView.innerHTML += `
      <article class="coupon" id="coupon-${id}">
        <h4>Coupon Name: ${name || 'N/A'}</h4>
        <p>Coupon Code: ${code || 'N/A'}</p>
        <p>Discount Value: ${formattedDiscount}</p>
        <p>Status: ${active ? 'Active' : 'Inactive'}</p>
        <p>Merchant ID: ${merchant_id || 'N/A'}</p>
      </article>
    `;
  });
}


//Helper Functions
function show(elements) {
  elements.forEach(element => {
    element.classList.remove('hidden')
  })
}

function hide(elements) {
  elements.forEach(element => {
    element.classList.add('hidden')
  })
}

function addRemoveActiveNav(nav1, nav2) {
  nav1.classList.add('active-nav')
  nav2.classList.remove('active-nav')
}

function filterByMerchant(merchantId) {
  const specificMerchantItems = []

  for (let i = 0; i < items.length; i++) {
    if (items[i].attributes.merchant_id === parseInt(merchantId)) {
      specificMerchantItems.push(items[i])
    }
  }

  return specificMerchantItems
}

function findMerchant(id) {
  let foundMerchant;

  for (let i = 0; i < merchants.length; i++) {
    if (parseInt(merchants[i].id) === parseInt(id)) {
      foundMerchant = merchants[i]
      return foundMerchant
    }
  }
}


// --------------------- MODEL ---------------------  //

const SERVER = "https://user-list.alphacamp.io";
const INDEX_API = SERVER + "/api/v1/users/";
//完整連結  https://user-list.alphacamp.io/api/v1/users/ 

const bountyData = [];
let localData = [];
let priceData = []
const dataPerPage = 48;
let currentPage = 1;
const bountyPanel = document.querySelector("#bounty-panel");
const bountyModal = document.querySelector("#bounty-modal");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input")
const modelTrackingBtn = document.querySelector("#modal-tracking-button")
const pagination = document.querySelector("#pagination")
const navTargetLink = document.querySelector("#nav-link-target")


// 回傳過濾過的資料
function filterDataByName(searchName) {
  // 檢查有無輸入內容
  if (searchName.length !== 0) {
    const filterData = bountyData.filter(data => {
      const fullName = data.name + data.surname
      return fullName.toLowerCase().includes(searchName)
    })
    // 找不到資料就跟使用者講
    if (filterData.length === 0) {
      return alert(`no search result match: ${searchName}`)
    } else {
      //找到東西就回傳過濾過的data
      return filterData
    }
  } else {
    // 沒有輸入就回傳原始data
    return bountyData
  }
}


// toggle data to local Storage
function toggleTargetToStorage(targetId) {
  // 確定id是數字
  const id = Number(targetId)
  // 取得localStorage資料，沒有的話就用一個空的array
  const list = loadLocalStorage()

  // 要是已經有就 remove
  if (list.some(target => target.id === id)) {
    const index = list.findIndex(target => target.id === id)
    list.splice(index, 1)
    localStorage.setItem("target-list", JSON.stringify(list))
    // localData reset
    localData = loadLocalStorage()
    console.log(`Remove from local storage, storage length : ${list.length}`)
    return
  }
  // 沒有的話就 add
  const target = bountyData.find(target => target.id === id);
  //把目標放入array
  list.push(target);
  //把array存入local storage
  localStorage.setItem("target-list", JSON.stringify(list))
  // localData reset
  localData = loadLocalStorage()
  console.log(`Save to local storage, storage length : ${list.length}`)
}

// load local storage
function loadLocalStorage() {
  const list = JSON.parse(localStorage.getItem("target-list")) || [];
  return list
}

// get pagination data
function getDataPerPage(pageNumber, data) {
  const page = Number(pageNumber)
  const pageStart = dataPerPage * (page - 1)
  const pageEnd = (dataPerPage * page)

  const pageData = data.slice(pageStart, pageEnd)
  return pageData
}

// generatePriceData
function generatePricePerData(data) {

  // find if there is already in localStorage
  const priceDataStore = JSON.parse(localStorage.getItem("priceData"))

  // 有資料就繼續使用
  if (priceDataStore) {
    priceData = priceDataStore
    // 沒有資料就做一個新的
  } else {
    const dataAmount = data.length
    for (let i = 1; i <= dataAmount; i++) {
      const number = Math.floor(Math.random() * 9) + 1 // 1-9  
      const zeroAmount = Math.floor(Math.random() * 8) + 1
      let price = `${number + "0".repeat(zeroAmount)}`
      price = "$" + price.replace(/\B(?=(\d{3})+(?!\d))/g, ",")

      priceData.push(price)
      // 存入localStorage
      localStorage.setItem("priceData", JSON.stringify(priceData))
    }
  }
}

// --------------------- VIEW ---------------------  //

// render 人物 card
function renderBountyPanel(data) {
  let rawHTML = "";
  //每筆data內的資料做一張bounty卡
  data.forEach((person) => {
    rawHTML += `
    <div class="bounty-card card p-0 col-lg-1 col-md-3 col-sm-4 col-xs-6 mb-2 p-1 border-white">
      <button type="button" class="bounty-btn btn bounty-btn btn-none p-0 position-relative" data-bs-toggle="modal" data-bs-target="#bounty-modal" data-id=${person.id}>
    `

    // 紅色skull target icon
    if (localData.some(target => Number(target.id) === Number(person.id))) {
      // target in storage
      rawHTML += `
      <div class="position-relative w-auto m-0 p-0">
      <div class="mini-icon position-absolute top-0 start-25" style="color: red;">
        <i class="fa-sharp fa-solid fa-skull fa-lg"></i>
      </div>`
    } else {
      // target not in storage
    }

    // 照片＋名字
    rawHTML += `
          <img src=${person.avatar} class="border rounded img-fluid" alt="bounty photo">
          <p class="card-text h6">${person.name} ${person.surname}</p>
        </button>
    </div>
    </div>`;

  });
  bountyPanel.innerHTML = rawHTML;
  console.log("dataPanel Rendered")
}

// render 人物 Modal
function renderModal(bountyId) {
  const id = Number(bountyId);
  const name = document.querySelector("#modal-name");
  const age = document.querySelector("#modal-age");
  const birth = document.querySelector("#modal-birth");
  const region = document.querySelector("#modal-region");
  const email = document.querySelector("#modal-email");
  const image = document.querySelector("#modal-image");
  const price = document.querySelector("#modal-price")

  axios.get(INDEX_API + id).then((response) => {
    const data = response.data;
    name.innerText = `${data.name} ${data.surname}`;
    age.innerText = `Age: ${data.age}`;
    birth.innerText = `Birth: ${data.birthday}`;
    region.innerText = `Region: ${data.region}`;
    email.innerText = `Email: ${data.email}`;
    image.innerHTML = `
    <image src="${data.avatar}" alt="bounty photo" class="zoom" ondragstart="return false">
    `;
    modelTrackingBtn.setAttribute(`data-id`, `${data.id}`)
    price.innerText = priceData[data.id - 1]
  });
}

// toggle modal tracking button
function toggleModalTrackingBtn() {
  if (modelTrackingBtn.classList.contains("btn-danger")) {
    modalTrackingBtnOff()
  } else {
    modalTrackingBtnOn()
  }
}

// render modal tracking button
function renderModalTrackingBtn(targetId) {
  const id = Number(targetId)
  // 有資料
  if (localData.some(target => target.id === id)) {
    modalTrackingBtnOff()
    // 沒資料
  } else {
    modalTrackingBtnOn()
  }
}

// render modal tracking button on
function modalTrackingBtnOn() {
  modelTrackingBtn.classList.remove("btn-secondary")
  modelTrackingBtn.classList.add("btn-danger")
  modelTrackingBtn.innerText = "Mark Target"
}
// render modal tracking button off
function modalTrackingBtnOff() {
  modelTrackingBtn.classList.remove("btn-danger")
  modelTrackingBtn.classList.add("btn-secondary")
  modelTrackingBtn.innerText = "Remove Target"
}

// render Pagination
function renderPagination(data) {
  const totalData = data.length
  const totalPage = Math.ceil(totalData / dataPerPage)
  let rawHTML = ""
  for (let i = 1; i <= totalPage; i++) {
    rawHTML += `
    <li class="page-item"><a id="page-link-${i}" class="page-link text-secondary" href="#" data-page="${i}">${i}</a></li>
    `
  }
  pagination.innerHTML = rawHTML
}

// hightLight Page link
function highLightPageLink(pageNumber) {
  const pageLink = document.querySelector(`#page-link-${pageNumber}`)
  const allLinks = document.querySelectorAll(".page-link")
  allLinks.forEach(element => element.classList.remove("bg-danger", "text-white"))
  pageLink.classList.add("bg-danger", "text-white")
}

// render nav Target link target amount
function renderNavTargetAmount() {
  const targetAmount = localData.length
  navTargetLink.innerText = `Target(${targetAmount})`
}



// --------------------- CONTROL ---------------------  //

// 點選人物卡片
bountyPanel.addEventListener("click", (event) => {
  const target = event.target.parentElement;
  // 點到人物按鈕上變化modal內容
  if (target.matches(".bounty-btn")) {
    renderModal(target.dataset.id);
    renderModalTrackingBtn(target.dataset.id);
  }
});

// 點選收尋按鈕
searchForm.addEventListener("submit", function onSubmitBtnClicked(event) {
  event.preventDefault() // 不要刷新頁面
  const searchName = searchInput.value.trim().toLowerCase() // 儲存input
  searchInput.value = "" // 清空input

  const filterData = filterDataByName(searchName)
  renderBountyPanel(getDataPerPage(1, filterData))
  renderPagination(filterData)
  highLightPageLink(1) // highlight page 1 link
})

// 點選 modal 內 tracking 按鈕
modelTrackingBtn.addEventListener("click", function onModalTrackingBtnClicked(event) {
  const id = event.target.dataset.id
  toggleTargetToStorage(id)
  toggleModalTrackingBtn()//改顏色
  renderBountyPanel(getDataPerPage(currentPage, bountyData)) //刷新頁面(home page)
  renderNavTargetAmount()
})

// 點選 pagination 
pagination.addEventListener("click", function onPaginationClicked(event) {
  event.preventDefault() // 不要刷新頁面

  if (event.target.matches(".page-link")) {
    const page = Number(event.target.dataset.page)
    renderBountyPanel(getDataPerPage(page, bountyData))
    highLightPageLink(page)
    currentPage = page
  }
})


// START
// axios get data from API
// render data on bounty panel
axios.get(INDEX_API).then((response) => {
  bountyData.push(...response.data.results); // store bountyData from API
  localData = loadLocalStorage() // store local data from localStorage
  renderBountyPanel(getDataPerPage(1, bountyData)); // render page 1 data
  renderPagination(bountyData); // render pagination
  highLightPageLink(1) // highlight page 1 link
  renderNavTargetAmount()

  // 賞金
  generatePricePerData(bountyData)
});


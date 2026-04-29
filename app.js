let allItems = [];

// Notification
function showNotification(msg){
  let n = document.getElementById("notification");
  n.innerText = msg;
  n.style.display = "block";
  setTimeout(() => n.style.display = "none", 3000);
}

// Image preview
document.getElementById("image").addEventListener("change", function(){
  let file = this.files[0];
  if(file){
    document.getElementById("preview").src = URL.createObjectURL(file);
  }
});

// Add item
async function addItem(type){

  let itemName = document.getElementById("itemName").value;
  let location = document.getElementById("location").value;
  let personName = document.getElementById("personName").value;
  let phone = document.getElementById("phone").value;
  let description = document.getElementById("description").value;
  let file = document.getElementById("image").files[0];

  if(!itemName || !location || !personName || !phone){
    alert("Fill all fields");
    return;
  }

  let reader = new FileReader();

  reader.onloadend = async function(){

    await fetch("http://localhost:5000/add", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        itemName,
        location,
        personName,
        phone,
        description,
        type,
        image: reader.result
      })
    });

    showNotification("Item Added ✅");
    loadItems();
  };

  if(file){
    reader.readAsDataURL(file);
  } else {
    reader.onloadend();
  }
}

// Load items
async function loadItems(){
  let res = await fetch("http://localhost:5000/items");
  allItems = await res.json();

  displayItems();
  updateStats();

  let matches = findMatches();
  if(matches.length){
    showNotification("🔥 Match Found!");
  }
}

// Display
function displayItems(){
  document.getElementById("list").innerHTML =
    allItems.map(i => `
      <div class="item-card ${i.type}">
        <b>${i.itemName}</b> (${i.type})<br>
        👤 ${i.personName}<br>
        📱 ${i.phone}<br>
        📍 ${i.location}<br>

        <button onclick="deleteItem('${i._id}')">Delete</button>

        <br>
        ${i.image ? `<img src="${i.image}" width="120">` : ""}
      </div>
    `).join("");
}

// Delete
async function deleteItem(id){
  await fetch(`http://localhost:5000/delete/${id}`, {
    method: "DELETE"
  });
  loadItems();
}

// Search
function searchItems(){
  let text = document.getElementById("search").value.toLowerCase();

  let filtered = allItems.filter(i =>
    (i.itemName || "").toLowerCase().includes(text) ||
    (i.location || "").toLowerCase().includes(text)
  );

  document.getElementById("list").innerHTML =
    filtered.map(i => `
      <div class="item-card ${i.type}">
        <b>${i.itemName}</b> (${i.type})
      </div>
    `).join("");
}

// Matching
function findMatches(){
  let lost = allItems.filter(i => i.type === "lost");
  let found = allItems.filter(i => i.type === "found");

  let matches = [];

  lost.forEach(l => {
    found.forEach(f => {
      if(l.itemName.toLowerCase().includes(f.itemName.toLowerCase())){
        matches.push(true);
      }
    });
  });

  return matches;
}

// Stats
function updateStats(){
  document.getElementById("stats").innerHTML = `
    Total: ${allItems.length} <br>
    Lost: ${allItems.filter(i=>i.type==="lost").length} <br>
    Found: ${allItems.filter(i=>i.type==="found").length}
  `;
}

window.onload = loadItems;
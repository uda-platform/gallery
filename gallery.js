(async () => {

const BACKEND = "https://uda-backend.onrender.com";
const CDN_BASE = "https://cdn.myuda.site/uda";

const params = new URLSearchParams(location.search);
const dealer = (params.get("dealer") || "").toLowerCase();
const plate = (params.get("plate") || "").toUpperCase();
const amount = Number(params.get("amount") || 0);

const hero = document.getElementById("hero");
const content = document.getElementById("content");

function safeNum(n){
  return Number(String(n).replace(/[^0-9.-]/g,"")) || 0;
}

if (!dealer) {
  hero.textContent = "Invalid dealer";
  return;
}

try {

  // ===============================
  // 🔥 IF PLATE VIEW (SHOW ALL PHOTOS)
  // ===============================
  if (plate) {

    const carRes = await fetch(`${BACKEND}/cars/${dealer}`);
    const cars = await carRes.json();

    const car = cars.find(c =>
      String(c.PlateNumber).toUpperCase() === plate
    );

    if (!car) {
      hero.textContent = "Car not found";
      return;
    }

    hero.textContent = `${car.Brand} ${car.Model} ${car.Spec} ${car.Year}`;

    const picCount = Number(car.PicCount || 0);

    if (!picCount) {
      content.innerHTML = "<div class='msg'>No photos found</div>";
      return;
    }

    for (let i = 1; i <= picCount; i++) {

      const img = document.createElement("img");
      img.src = `${CDN_BASE}/${dealer}/${plate}/${i}.jpg`;
      img.style.width = "100%";
      img.style.marginBottom = "15px";
      img.style.borderRadius = "10px";
      img.loading = "lazy";

      img.onerror = () => img.remove();

      content.appendChild(img);
    }

    return;
  }

  // ===============================
  // 🔥 IF NETTPAY VIEW (CAR LIST)
  // ===============================
  if (!amount) {
    hero.textContent = "Invalid amount";
    return;
  }

  hero.textContent = `Kereta Sesuai Gaji RM ${amount}`;

  const nettRes = await fetch(`${BACKEND}/nettpay/${dealer}`);
  const nettList = await nettRes.json();

  const range = nettList.find(r => Number(r.amount) === amount);

  if (!range) {
    content.innerHTML = "<div class='msg'>No salary range</div>";
    return;
  }

  const maxOTR = Number(range.maxOTR);

  const carRes = await fetch(`${BACKEND}/cars/${dealer}`);
  const cars = await carRes.json();

  const filtered = cars.filter(c =>
    String(c.Status).toUpperCase() === "NEW STOCK" &&
    safeNum(c.OTR) <= maxOTR
  );

  if (!filtered.length) {
    content.innerHTML = "<div class='msg'>Tiada kereta</div>";
    return;
  }

  filtered.forEach(car => {

    const plateEncoded = encodeURIComponent(car.PlateNumber);

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${CDN_BASE}/${dealer}/${plateEncoded}/1.jpg"
           onerror="this.style.display='none'">
      <div><strong>${car.Brand} ${car.Model} ${car.Spec} ${car.Year}</strong></div>
      <div>RM ${safeNum(car.OTR).toLocaleString()}</div>
      <div>Bulanan ${car.Monthly} utk ${car.Tenure} tahun</div>
      <a class="btn" href="?dealer=${dealer}&plate=${plateEncoded}">
        LIHAT GAMBAR
      </a>
    `;

    content.appendChild(card);
  });

} catch (err) {
  content.innerHTML = "<div class='msg'>Error loading data</div>";
}

})();
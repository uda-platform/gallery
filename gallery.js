(async () => {
  const API_BASE = "https://uda-backend.onrender.com";
  const R2_BASE = "https://cdn.myuda.site";

  const params = new URLSearchParams(location.search);
  const dealer = (params.get("dealer") || "").toLowerCase();
  const plate = (params.get("plate") || "").toUpperCase();
  const amount = params.get("amount");

  const container = document.getElementById("gallery");

  function showError(msg) {
    container.innerHTML = `
      <div class="msg">${msg}</div>
    `;
  }

  function buildImageUrl(dealer, plate, index) {
    return `${R2_BASE}/${dealer}/${plate}/${index}.jpg`;
  }

  async function loadGallery() {
    if (!dealer) return showError("Dealer not provided");
    if (!plate) return showError("Plate not provided");

    try {
      const res = await fetch(`${API_BASE}/cars/${dealer}`);
      if (!res.ok) throw new Error("Failed to load cars");

      const cars = await res.json();
      const car = cars.find(
        c => String(c.PlateNumber).toUpperCase() === plate
      );

      if (!car) return showError("Car not found");

      const header = document.createElement("div");
      header.className = "hero";
      header.textContent =
        `${car.Brand} ${car.Model} ${car.Spec} ${car.Year}`;
      container.appendChild(header);

      const picCount = Number(car.PicCount || 10);

      for (let i = 1; i <= picCount; i++) {
        const img = document.createElement("img");
        img.src = buildImageUrl(dealer, plate, i);
        img.className = "photo";
        img.loading = "lazy";

        img.onerror = () => img.remove();

        container.appendChild(img);
      }

    } catch (err) {
      showError("System Error: Failed to load data.");
    }
  }

  loadGallery();
})();

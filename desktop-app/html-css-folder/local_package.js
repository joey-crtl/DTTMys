document.addEventListener("DOMContentLoaded", async () => {
  // -----------------------------
  // Elements
  // -----------------------------
  const packageGrid = document.getElementById("loc-packageGrid");
  const searchBox = document.getElementById("loc-searchBox");
  const addBtn = document.getElementById("loc-addPackageBtn");

  // Add Package Modal  
  const addPackageModal = document.getElementById("loc-addPackageModal");
  const closeAddModal = document.getElementById("loc-closeAddModal");
  const addPackageForm = document.getElementById("loc-addPackageForm");
  const pkgMainPhotoInput = document.getElementById("loc-pkgMainPhoto");
  const pkgPhotoInput = document.getElementById("loc-pkgPhoto");
  const mainPreviewContainer = document.getElementById("loc-mainPreviewContainer");
  const previewContainer = document.getElementById("loc-previewContainer");

  // Itinerary Add
  const itineraryBuilder = document.getElementById("loc-itineraryBuilder");
  const addDayBtn = document.getElementById("loc-addDayBtn");
  const pkgItineraryHidden = document.getElementById("loc-pkgItinerary");

  // Edit Package Modal
  const editPackageModal = document.getElementById("loc-editPackageModal");
  const editPackageForm = document.getElementById("loc-editPackageForm");
  const editPkgId = document.getElementById("loc-editPkgId");
  const editPkgName = document.getElementById("loc-editPkgName");
  const editPkgPrice = document.getElementById("loc-editPkgPrice");
  const editPkgMainPhoto = document.getElementById("loc-editPkgMainPhoto");
  const editMainPreviewContainer = document.getElementById("loc-editMainPreviewContainer");
  const editPkgPhoto = document.getElementById("loc-editPkgPhoto");
  const editPreviewContainer = document.getElementById("loc-editPreviewContainer") || document.createElement("div");
  const editExistingPhotos = document.getElementById("loc-editExistingPhotos");
  const editItineraryBuilder = document.getElementById("loc-editItineraryBuilder");
  const editAddDayBtn = document.getElementById("loc-editAddDayBtn");
  const editPkgItinerary = document.getElementById("loc-editPkgItinerary");

  const editFields = {
    destination: document.getElementById("loc-editPkgDestination"),
    available: document.getElementById("loc-editPkgAvailable"),
    description: document.getElementById("loc-editPkgDescription"),
    inclusions: document.getElementById("loc-editPkgInclusions"),
    exclusions: document.getElementById("loc-editPkgExclusions")
  };

  // Package Details Modal
  const packageDetailsModal = document.getElementById("loc-packageDetailsModal");
  const detailsPhotoContainer = document.getElementById("loc-detailsPhotoContainer");
  const detailsInfoContainer = document.getElementById("loc-detailsInfoContainer");
  const closeDetailsModal = document.getElementById("loc-closeDetailsModal");

  // Photo Viewer
  const photoViewerModal = document.getElementById("loc-photoViewerModal");
  const photoViewerImg = document.getElementById("loc-photoViewerImg");
  const closePhotoViewer = document.getElementById("loc-closePhotoViewer");
  const prevPhoto = document.getElementById("loc-prevPhoto");
  const nextPhoto = document.getElementById("loc-nextPhoto");

  let currentPhotoIndex = 0;
  let currentPackagePhotos = [];

  // -----------------------------
  // Helpers
  // -----------------------------
  async function uploadFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async e => {
        const fileBase64 = e.target.result;
        const fileName = `package/${Date.now()}-${file.name}`;
        try {
          const res = await window.api.uploadPackagePhoto(fileBase64, fileName);
          if (res.success || res.publicUrl) resolve(res.publicUrl);
          else reject(new Error(res.message || "Upload failed"));
        } catch (err) { reject(err); }
      };
      reader.readAsDataURL(file);
    });
  }

  function previewImage(file, container, width = "70px", height = "70px") {
    const reader = new FileReader();
    reader.onload = e => {
      const img = document.createElement("img");
      img.src = e.target.result;
      img.style.width = width;
      img.style.height = height;
      img.style.objectFit = "cover";
      img.style.borderRadius = "6px";
      container.appendChild(img);
    };
    reader.readAsDataURL(file);
  }

  function createDayBlock(dayNum, activities = []) {
    const block = document.createElement("div");
    block.classList.add("day-block");
    block.innerHTML = `
      <h4>Day ${dayNum}</h4>
      <div class="activities"></div>
      <button type="button" class="itinerary-btn add addActivityBtn">+ Add Activity</button>
      <button type="button" class="itinerary-btn remove removeDayBtn">Remove Day</button>
    `;
    const activitiesContainer = block.querySelector(".activities");
    function addActivity(value = "") {
      const input = document.createElement("input");
      input.type = "text";
      input.value = value;
      input.classList.add("activity-input");
      input.placeholder = "Enter activity";
      activitiesContainer.appendChild(input);
    }
    activities.forEach(a => addActivity(a));
    block.querySelector(".addActivityBtn").addEventListener("click", () => addActivity());
    block.querySelector(".removeDayBtn").addEventListener("click", () => block.remove());
    return block;
  }

  function collectItinerary(builder) {
    const days = builder.querySelectorAll(".day-block");
    return Array.from(days).map((block, i) => {
      const activities = Array.from(block.querySelectorAll(".activity-input"))
        .map(input => input.value.trim())
        .filter(v => v !== "");
      return { day: i + 1, activities };
    });
  }

  function arrayToBullets(arr) {
    if (!arr || !arr.length) return "-";
    return `<ul style="margin:0; padding-left:20px; list-style-type: disc;">` + 
      arr.map(item => {
        if (typeof item === "object" && item.day && Array.isArray(item.activities)) {
          return `<li style="margin:2px 0;"><strong>Day ${item.day}:</strong> ${item.activities.join(", ") || "-"}</li>`;
        }
        return `<li style="margin:2px 0;">${item}</li>`; 
      }).join("") + "</ul>";
  }

  // -----------------------------
  // Fetch packages (local)
  // -----------------------------
  let packages = await window.api.getLocalPackages();
  renderPackages(packages);

  // -----------------------------
  // Render packages
  // -----------------------------
  function renderPackages(list) {
    packageGrid.innerHTML = "";
    if (!list.length) {
      packageGrid.innerHTML = "<p>No packages found.</p>";
      return;
    }
    list.forEach(pkg => {
      const card = document.createElement("div");
      card.classList.add("package-card");
      card.innerHTML = `
        <div class="package-info">
          <h3>${pkg.name}</h3>
          <div class="actions">
            <button class="viewDetails">View Details</button>
            <button class="edit">Edit</button>
            <button class="delete">Delete</button>
          </div>
        </div>
      `;
      packageGrid.appendChild(card);

      card.querySelector(".viewDetails").addEventListener("click", () => openDetailsModal(pkg.id));
      card.querySelector(".edit").addEventListener("click", () => openEditModal(pkg.id));
      card.querySelector(".delete").addEventListener("click", () => deletePackage(pkg.id));
    });
  }

  // -----------------------------
  // Open Details Modal
    // -----------------------------
    function openDetailsModal(pkgId) {
    const pkg = packages.find(p => p.id === pkgId);
    if (!pkg) return;

    // Reset containers
    detailsPhotoContainer.innerHTML = "";
    detailsInfoContainer.innerHTML = "";

    // Prepare scrollable photos
    const photoScroll = document.createElement("div");
    photoScroll.style.display = "flex";
    photoScroll.style.flexDirection = "column";
    photoScroll.style.gap = "8px";
    photoScroll.style.maxHeight = "70vh";
    photoScroll.style.overflowY = "auto";
    photoScroll.style.paddingRight = "6px";
    photoScroll.style.scrollbarWidth = "thin";
    photoScroll.style.scrollbarColor = "#c1c1c1 transparent";

    const allPhotos = [pkg.main_photo, ...(pkg.add_photo || [])].filter(Boolean);
    currentPackagePhotos = allPhotos;
    currentPhotoIndex = 0;

    allPhotos.forEach((photo, index) => {
      const img = document.createElement("img");
      img.src = photo;
      img.style.width = "240px";
      img.style.height = "160px";
      img.style.objectFit = "cover";
      img.style.borderRadius = "8px";
      img.style.cursor = "pointer";
      img.style.transition = "transform 0.2s ease";
      img.addEventListener("mouseenter", () => (img.style.transform = "scale(1.04)"));
      img.addEventListener("mouseleave", () => (img.style.transform = "scale(1)"));
      img.addEventListener("click", () => {
        currentPhotoIndex = index;
        photoViewerImg.src = currentPackagePhotos[currentPhotoIndex];
        photoViewerModal.classList.add("show");
      });
      photoScroll.appendChild(img);
    });

    detailsPhotoContainer.appendChild(photoScroll);

    // Build the right info section
    detailsInfoContainer.innerHTML = `
      <h2>${pkg.name}</h2>
      <p><strong>Price:</strong> ₱${pkg.price}</p>
      <p><strong>Available:</strong> ${pkg.available}</p>
      <p><strong>Destination:</strong> ${pkg.destination}</p>

      <h3>Description</h3>
      <p>${pkg.description || "-"}</p>

      <h3>Inclusions</h3>
      <ul>
        ${(pkg.inclusions || "")
          .split(",")
          .map(i => `<li>${i.trim()}</li>`)
          .join("")}
      </ul>

      <h3>Itinerary</h3>
      ${arrayToBullets(pkg.itinerary)}

      <h3>Exclusions</h3>
      <ul>
        ${(pkg.exclusions || "")
          .split(",")
          .map(i => `<li>${i.trim()}</li>`)
          .join("")}
      </ul>
    `;

    // Show modal
    packageDetailsModal.classList.add("show");
  }


    // Close modals
    closeDetailsModal.addEventListener("click", () => packageDetailsModal.classList.remove("show"));
    window.addEventListener("click", e => { if (e.target === packageDetailsModal) packageDetailsModal.classList.remove("show"); });

  // -----------------------------
  // Search
  // -----------------------------
  searchBox.addEventListener("input", () => {
    const term = searchBox.value.toLowerCase();
    const filtered = packages.filter(pkg => pkg.name.toLowerCase().includes(term));
    renderPackages(filtered);
  });

  // -----------------------------
  // Modal open/close (Add & Edit)
  // -----------------------------
  addBtn.addEventListener("click", () => addPackageModal.classList.add("show"));
  closeAddModal.addEventListener("click", () => addPackageModal.classList.remove("show"));
  window.addEventListener("click", e => { if (e.target === addPackageModal) addPackageModal.classList.remove("show"); });

  const closeEditModalBtn = editPackageModal.querySelector(".modal-close");
  closeEditModalBtn.addEventListener("click", () => editPackageModal.classList.remove("show"));
  window.addEventListener("click", e => { if (e.target === editPackageModal) editPackageModal.classList.remove("show"); });

  // -----------------------------
  // Itinerary buttons
  // -----------------------------
  addDayBtn.addEventListener("click", () => {
    const count = itineraryBuilder.querySelectorAll(".day-block").length + 1;
    itineraryBuilder.appendChild(createDayBlock(count));
  });
  editAddDayBtn.addEventListener("click", () => {
    const count = editItineraryBuilder.querySelectorAll(".day-block").length + 1;
    editItineraryBuilder.appendChild(createDayBlock(count));
  });

  // -----------------------------
  // Photo previews
  // -----------------------------
  pkgMainPhotoInput.addEventListener("change", () => {
    mainPreviewContainer.innerHTML = "";
    const file = pkgMainPhotoInput.files[0];
    if (file) previewImage(file, mainPreviewContainer, "100px", "100px");
  });
  pkgPhotoInput.addEventListener("change", () => {
    previewContainer.innerHTML = "";
    Array.from(pkgPhotoInput.files).forEach(file => previewImage(file, previewContainer, "70px", "70px"));
  });
  editPkgMainPhoto.addEventListener("change", () => {
    editMainPreviewContainer.innerHTML = "";
    const file = editPkgMainPhoto.files[0];
    if (file) previewImage(file, editMainPreviewContainer, "100px", "100px");
  });
  editPkgPhoto.addEventListener("change", () => {
    editPreviewContainer.innerHTML = "";
    Array.from(editPkgPhoto.files).forEach(file => previewImage(file, editPreviewContainer, "70px", "70px"));
  });

  // -----------------------------
  // Add Package (local)
  // -----------------------------
  addPackageForm.addEventListener("submit", async e => {
    e.preventDefault();
    const name = document.getElementById("loc-pkgName").value;
    const price = parseFloat(document.getElementById("loc-pkgPrice").value);
    const destination = document.getElementById("loc-pkgDestination").value;
    const available = parseInt(document.getElementById("loc-pkgAvailable").value);
    const description = document.getElementById("loc-pkgDescription").value;
    const inclusions = document.getElementById("loc-pkgInclusions").value;
    const exclusions = document.getElementById("loc-pkgExclusions").value;

    if (isNaN(price) || price < 0) return alert("Invalid price.");
    if (isNaN(available) || available < 0) return alert("Invalid available number.");
    if (!pkgMainPhotoInput.files.length) return alert("Upload a main photo.");

    try {
      const mainPhotoUrl = await uploadFile(pkgMainPhotoInput.files[0]);
      const addPhotoUrls = [];
      for (const file of Array.from(pkgPhotoInput.files)) addPhotoUrls.push(await uploadFile(file));

      const itinerary = collectItinerary(itineraryBuilder);

      // Update hidden input
      pkgItineraryHidden.value = JSON.stringify(itinerary);

      const result = await window.api.addLocalPackage({
        name, price, main_photo: mainPhotoUrl, add_photo: addPhotoUrls,
        destination, available, description, itinerary,
        inclusions, exclusions
      });

      if (result.success) {
        packages = await window.api.getLocalPackages();
        renderPackages(packages);
        addPackageForm.reset();
        mainPreviewContainer.innerHTML = "";
        previewContainer.innerHTML = "";
        itineraryBuilder.innerHTML = "";
        addPackageModal.classList.remove("show");
      } else alert("Failed to add package: " + result.message);
    } catch (err) { alert("Upload error: " + err.message); }
  });

  // -----------------------------
  // Edit Package (local)
  // -----------------------------
  window.openEditModal = async (id) => {
    const pkg = packages.find(p => p.id === id);
    if (!pkg) return;

    editPkgId.value = pkg.id;
    editPkgName.value = pkg.name;
    editPkgPrice.value = pkg.price;
    editFields.destination.value = pkg.destination || "";
    editFields.available.value = pkg.available || 0;
    editFields.description.value = pkg.description || "";
    editFields.inclusions.value = pkg.inclusions || "";
    editFields.exclusions.value = pkg.exclusions || "";

    editItineraryBuilder.innerHTML = "";
    if (pkg.itinerary && Array.isArray(pkg.itinerary)) {
      pkg.itinerary.forEach(d => editItineraryBuilder.appendChild(createDayBlock(d.day, d.activities)));
    }

    editPackageModal.main_photo = pkg.main_photo || null;
    editPackageModal.currentPhotos = [...(pkg.add_photo || [])];

    editMainPreviewContainer.innerHTML = "";
    if (pkg.main_photo) {
      const img = document.createElement("img");
      img.src = pkg.main_photo;
      img.style.width = "100px";
      img.style.height = "100px";
      img.style.objectFit = "cover";
      img.style.borderRadius = "6px";
      editMainPreviewContainer.appendChild(img);
    }

    editExistingPhotos.innerHTML = "";
    editPackageModal.currentPhotos.forEach(photo => {
      const wrapper = document.createElement("div");
      wrapper.style.position = "relative";
      wrapper.style.display = "inline-block";
      wrapper.style.marginRight = "5px";

      const img = document.createElement("img");
      img.src = photo;
      img.style.width = "70px";
      img.style.height = "70px";
      img.style.objectFit = "cover";
      img.style.borderRadius = "6px";

      const removeBtn = document.createElement("span");
      removeBtn.innerHTML = "&times;";
      removeBtn.style.position = "absolute";
      removeBtn.style.top = "0";
      removeBtn.style.right = "0";
      removeBtn.style.background = "rgba(0,0,0,0.5)";
      removeBtn.style.color = "white";
      removeBtn.style.cursor = "pointer";
      removeBtn.style.fontSize = "14px";
      removeBtn.style.borderRadius = "50%";
      removeBtn.style.padding = "0 4px";
      removeBtn.addEventListener("click", () => {
        editPackageModal.currentPhotos = editPackageModal.currentPhotos.filter(p => p !== photo);
        wrapper.remove();
      });

      wrapper.appendChild(img);
      wrapper.appendChild(removeBtn);
      editExistingPhotos.appendChild(wrapper);
    });

    editPreviewContainer.innerHTML = "";
    editPackageModal.classList.add("show");
  };

  editPackageForm.addEventListener("submit", async e => {
    e.preventDefault();
    const _id = editPkgId.value;
    const name = editPkgName.value;
    const price = parseFloat(editPkgPrice.value);
    const destination = editFields.destination.value;
    const available = parseInt(editFields.available.value);
    const description = editFields.description.value;
    const inclusions = editFields.inclusions.value;
    const exclusions = editFields.exclusions.value;

    if (isNaN(price) || price < 0) return alert("Invalid price.");
    if (isNaN(available) || available < 0) return alert("Invalid available number.");

    let main_photo = editPackageModal.main_photo;
    if (editPkgMainPhoto.files.length > 0) main_photo = await uploadFile(editPkgMainPhoto.files[0]);

    const newPhotos = [];
    for (const file of editPkgPhoto.files) newPhotos.push(await uploadFile(file));
    const updatedPhotos = [...editPackageModal.currentPhotos, ...newPhotos];

    const itinerary = collectItinerary(editItineraryBuilder);

    // Update hidden input
    editPkgItinerary.value = JSON.stringify(itinerary);

    const result = await window.api.editLocalPackage({
      _id, name, price, main_photo, add_photo: updatedPhotos,
      destination, available, description, itinerary,
      inclusions, exclusions
    });

    if (result.success) {
      packages = await window.api.getLocalPackages();
      renderPackages(packages);
      editPackageForm.reset();
      editPackageModal.currentPhotos = [];
      editExistingPhotos.innerHTML = "";
      editPreviewContainer.innerHTML = "";
      editPkgPhoto.value = "";
      editMainPreviewContainer.innerHTML = "";
      editItineraryBuilder.innerHTML = "";
      editPackageModal.classList.remove("show");
    } else alert("Failed to edit: " + result.message);
  });

  // -----------------------------
  // Delete Package (local)
  // -----------------------------
  window.deletePackage = async id => {
    if (!confirm("Are you sure you want to delete this package?")) return;
    const result = await window.api.deleteLocalPackage(id);
    if (result.success) {
      packages = await window.api.getLocalPackages();
      renderPackages(packages);
    } else alert("Failed to delete: " + result.message);
  };

  // -----------------------------
  // Photo viewer controls
  // -----------------------------
  prevPhoto.addEventListener("click", () => {
    if (currentPackagePhotos.length) {
      currentPhotoIndex = (currentPhotoIndex - 1 + currentPackagePhotos.length) % currentPackagePhotos.length;
      photoViewerImg.src = currentPackagePhotos[currentPhotoIndex];
    }
  });
  nextPhoto.addEventListener("click", () => {
    if (currentPackagePhotos.length) {
      currentPhotoIndex = (currentPhotoIndex + 1) % currentPackagePhotos.length;
      photoViewerImg.src = currentPackagePhotos[currentPhotoIndex];
    }
  });
  closePhotoViewer.addEventListener("click", () => photoViewerModal.classList.remove("show"));
  window.addEventListener("click", e => { if (e.target === photoViewerModal) photoViewerModal.classList.remove("show"); });
});

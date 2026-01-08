// Disable console logs for production
console.log = console.debug = console.info = () => {};

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const reservationId = params.get("reservation_id");

  // Clean URL (remove ?reservation_id=)
  window.history.replaceState({}, document.title, window.location.pathname);

  // Display reservation ID
  const reservationEl = document.getElementById("reservationId");
  const reservationInput = document.getElementById("reservationInput");
  if (reservationEl) reservationEl.textContent = reservationId || "❌ None";
  if (reservationInput) reservationInput.value = reservationId || "";

  // 📋 Copy button feature
  const copyBtn = document.getElementById("copyBtn");
  if (copyBtn && reservationId) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(reservationId);
        copyBtn.textContent = "✅ Copied!";
        setTimeout(() => (copyBtn.textContent = "📋 Copy ID"), 2000);
      } catch {
        alert("Failed to copy Reservation ID");
      }
    });
  }

  // QR Code Popup functionality
  const qrPopup = document.getElementById("qrPopup");
  const closePopup = document.getElementById("closePopup");
  const popupTitle = document.getElementById("popupTitle");
  const popupQR = document.getElementById("popupQR");
  const popupInstruction = document.getElementById("popupInstruction");

  // Function to open QR popup
  function openQRPopup(title, qrSrc, instruction) {
    popupTitle.textContent = title;
    popupQR.src = qrSrc;
    popupInstruction.textContent = instruction;
    qrPopup.classList.add("active");
    document.body.style.overflow = "hidden"; // Prevent scrolling
  }

  // Function to close QR popup
  function closeQRPopup() {
    qrPopup.classList.remove("active");
    document.body.style.overflow = ""; // Restore scrolling
  }

  // Close popup when clicking close button
  closePopup.addEventListener("click", closeQRPopup);

  // Close popup when clicking outside the popup content
  qrPopup.addEventListener("click", (e) => {
    if (e.target === qrPopup) {
      closeQRPopup();
    }
  });

  // Close popup with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && qrPopup.classList.contains("active")) {
      closeQRPopup();
    }
  });

  // ✅ Load payment QR codes
  try {
    const { supabase } = await import("../serverClient.js");
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .in("type", ["gcash_qr", "paymaya_qr"]);

    if (error) throw error;

    const gcash = data.find((i) => i.type === "gcash_qr");
    const paymaya = data.find((i) => i.type === "paymaya_qr");

    const gcashQR = document.getElementById("gcashQR");
    const paymayaQR = document.getElementById("paymayaQR");
    
    gcashQR.src = gcash?.content || "";
    paymayaQR.src = paymaya?.content || "";

    // Add click events to QR code containers
    document.getElementById("gcashBox").addEventListener("click", () => {
      if (gcashQR.src) {
        openQRPopup(
          "GCash QR Code", 
          gcashQR.src, 
          "Scan this QR code with your GCash app to complete payment"
        );
      }
    });

    document.getElementById("paymayaBox").addEventListener("click", () => {
      if (paymayaQR.src) {
        openQRPopup(
          "PayMaya QR Code", 
          paymayaQR.src, 
          "Scan this QR code with your PayMaya app to complete payment"
        );
      }
    });

    // 🧾 Upload handler
    const form = document.getElementById("paymentProofForm");
    const status = document.getElementById("uploadStatus");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const file = document.getElementById("paymentImage").files[0];
      if (!file || !reservationId) {
        status.textContent = "⚠️ Missing file or reservation ID.";
        status.className = "status-message status-error";
        return;
      }

      status.textContent = "Uploading... Please wait.";
      status.className = "status-message status-info";

      // Upload to Supabase Storage (e.g., 'payment_receipts')
      const fileName = `${reservationId}_${Date.now()}.${file.name.split('.').pop()}`;
      const { data: uploadedFile, error: uploadError } = await supabase.storage
        .from("payment_receipts")
        .upload(fileName, file);

      if (uploadError) {
        status.textContent = "❌ Upload failed. Please try again.";
        status.className = "status-message status-error";
        return;
      }

      const { data: publicUrlData } = supabase
        .storage
        .from("payment_receipts")
        .getPublicUrl(fileName);

      // Insert into payment_proofs table
      const { error: dbError } = await supabase.from("payment_proofs").insert({
        reservation_id: reservationId,
        image_url: publicUrlData.publicUrl,
        created_at: new Date(),
      });

      if (dbError) {
        status.textContent = "❌ Failed to save proof in database.";
        status.className = "status-message status-error";
        return;
      }

      status.textContent = "✅ Payment proof submitted successfully!";
      status.className = "status-message status-success";
      form.reset();
    });
  } catch {
    document.getElementById("status").textContent =
      "⚠️ Failed to load payment methods.";
  }
});
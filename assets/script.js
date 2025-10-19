// Wait for images to load and position orbit images, and re-position on resize
(function(){
  const container = document.querySelector('.circle-container');
  const orbitImages = document.querySelectorAll('.orbit-image');
  const centerImg = document.querySelector('.center-image');
  const popup = document.getElementById('popup');
  const popupText = document.getElementById('popup-text');
  const imageDisplay = document.getElementById('image-display');
  const displayImage = document.getElementById('display-image');
  const closeBtns = document.querySelectorAll('.close-btn');

  // Positioning function: computes center then places orbit images evenly
  function positionOrbit() {
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // radius chosen to avoid overlap with center image; adjust padding as needed
    const centerW = centerImg.offsetWidth || parseFloat(getComputedStyle(centerImg).width);
    const maxOrbitImgW = Array.from(orbitImages).reduce((max, img) => {
      const w = img.offsetWidth || parseFloat(getComputedStyle(img).width);
      return Math.max(max, w || 0);
    }, 0);

    // radius: distance from center point to the center of orbit images
    // keep a gap between center image's edge and orbit images' inner edge (scaled for larger images)
    // previous padding was 25 for original sizes; scaled by 1.5 => 37.5 then +15% => ~43.1, rounded to 44
    const radius = Math.max((Math.min(centerX, centerY) - (maxOrbitImgW / 2) - (centerW / 2) - 44),
  138
);

    const total = orbitImages.length;
    orbitImages.forEach((img, i) => {
      // ensure we have a width/height measurement
      const imgW = img.offsetWidth || parseFloat(getComputedStyle(img).width) || 80;
      const imgH = img.offsetHeight || parseFloat(getComputedStyle(img).height) || imgW;

      // angle starts at -90deg so first image is top-center; remove -Math.PI/2 to start at right if you prefer
      const angle = (i / total) * (2 * Math.PI) - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle) - imgW / 2;
      const y = centerY + radius * Math.sin(angle) - imgH / 2;

      // apply computed left/top (within the container)
      img.style.left = `${x}px`;
      img.style.top  = `${y}px`;
    });
  }

  // Add click handler for center image
  if (centerImg) {
    centerImg.addEventListener('click', (e) => {
      e.stopPropagation();
      showPopup("Research interests include: Cardiovascular and renal pharmacology, general pharmacology, infectious diseases, immunology, virology, and toxicology.");
      displayImage.src = centerImg.src;
      displayImage.alt = centerImg.alt;
      imageDisplay.style.display = 'block';
      imageDisplay.setAttribute('aria-hidden','false');
    });
  }

  // Add a fallback if center image fails to load (e.g., your-photo.jpg missing)
  if (centerImg) {
    // If the image has no naturalWidth (failed to load) or explicitly errors, use a simple SVG data URL
    const placeholderSVG = encodeURIComponent(`
      <svg xmlns='http://www.w3.org/2000/svg' width='414' height='414' viewBox='0 0 414 414'>
        <defs>
          <linearGradient id='g' x1='0' x2='1'>
            <stop offset='0' stop-color='%23e6eefc'/>
            <stop offset='1' stop-color='%23ffffff'/>
          </linearGradient>
        </defs>
        <rect width='100%' height='100%' rx='207' fill='url(%23g)' />
        <g fill='%233b82f6' font-family='Poppins, Arial, sans-serif' font-size='48' text-anchor='middle'>
          <text x='50%' y='52%'>Keith</text>
          <text x='50%' y='72%' font-size='32'>Primas</text>
        </g>
      </svg>
    `);

    function applyPlaceholder(){
      // use a smaller data URI that most browsers accept
      centerImg.src = `data:image/svg+xml;charset=utf-8,${placeholderSVG}`;
      centerImg.alt = 'Keith Primas - portrait placeholder';
      // force reposition after the src swap to get correct offsets
      setTimeout(positionOrbit, 30);
    }

    // If the image never loaded by the time script runs
    if (!centerImg.complete || (centerImg.naturalWidth === 0 && centerImg.naturalHeight === 0)){
      // attach error handler to catch failure
      centerImg.addEventListener('error', applyPlaceholder, { once: true });
      // Also schedule a check shortly after load to apply placeholder if still empty
      setTimeout(() => {
        if (centerImg.naturalWidth === 0) applyPlaceholder();
      }, 60);
    }
  }

  // Show popup
  function showPopup(text){
    popupText.textContent = text;
    popup.style.display = 'block';
    popup.setAttribute('aria-hidden','false');
  }

  function hidePopup(){
    popup.style.display = 'none';
    popup.setAttribute('aria-hidden','true');
  }

  function hideImageDisplay(){
    imageDisplay.style.display = 'none';
    imageDisplay.setAttribute('aria-hidden','true');
  }

  // Attach click events to orbit images for popup and image display
  orbitImages.forEach(img => {
    img.addEventListener('click', (e) => {
      e.stopPropagation();
      const info = img.getAttribute('data-info') || img.alt || 'No details.';
      showPopup(info);
      
      // Show the image in the display
      displayImage.src = img.src;
      displayImage.alt = img.alt;
      imageDisplay.style.display = 'block';
      imageDisplay.setAttribute('aria-hidden','false');
    });
  });

  // Close buttons & clicking outside
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      hidePopup();
      hideImageDisplay();
    });
  });
  
  window.addEventListener('click', (e) => {
    if (e.target === popup || e.target === imageDisplay) {
      hidePopup();
      hideImageDisplay();
    }
  });

  // Position once all images have loaded (ensures offsets available)
  window.addEventListener('load', () => {
    positionOrbit();
    // additionally, if images might still change size (e.g., responsive fonts), reposition after a tick
    setTimeout(positionOrbit, 50);
  });

  // Reposition on resize & orientation change
  window.addEventListener('resize', () => {
    positionOrbit();
  });

  // Also run on DOMContentLoaded as a fallback (if images cache quickly)
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(positionOrbit, 20);
  });
})();

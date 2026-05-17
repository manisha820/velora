/* ─── js/product.js ─── */
/* Shared logic for all product detail pages, now featuring an instant premium checkout experience */

// Supabase Global Credentials
const SUPABASE_URL = 'https://srpvngufspadzxhyvrun.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VoCf-zE_YnyGbcbTCkMe7w_yHEJnwSV';
let supabase = null;

// Dynamic Script Loader for Supabase SDK
function loadSupabaseClient(callback) {
  if (window.supabase) {
    try {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      console.log('👑 Velora Royal Vault connected to Supabase securely.');
      if (callback) callback();
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
    }
    return;
  }
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  script.async = true;
  script.onload = () => {
    try {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      console.log('👑 Velora Royal Vault connected to Supabase securely.');
      if (callback) callback();
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
    }
  };
  script.onerror = () => {
    console.error('Failed to load Supabase SDK from CDN.');
  };
  document.head.appendChild(script);
}

// Start loading Supabase immediately
loadSupabaseClient();

document.addEventListener('DOMContentLoaded', () => {

  /* ─────────────────────────────────
     1. CUSTOM CURSOR
     ───────────────────────────────── */
  const cursor      = document.getElementById('cursor');
  const cursorTrail = document.getElementById('cursor-trail');
  let mx = 0, my = 0;

  function refreshCursorBindings() {
    if (cursor) {
      document.querySelectorAll('a, button, .btn-royal, .btn-text-link, .scent-note-card, .scent-arch-card, .bento-card, .ingredient-chip, .btn-icon-circle, .checkout-close, .qty-btn')
        .forEach(el => {
          // Prevent duplicates
          el.removeEventListener('mouseenter', addCursorHover);
          el.removeEventListener('mouseleave', removeCursorHover);
          el.addEventListener('mouseenter', addCursorHover);
          el.addEventListener('mouseleave', removeCursorHover);
        });
    }
  }

  function addCursorHover() { if(cursor) cursor.classList.add('hover'); }
  function removeCursorHover() { if(cursor) cursor.classList.remove('hover'); }

  if (cursor && cursorTrail) {
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top  = my + 'px';
      setTimeout(() => {
        cursorTrail.style.left = mx + 'px';
        cursorTrail.style.top  = my + 'px';
      }, 80);
    });
    refreshCursorBindings();
  }

  /* ─────────────────────────────────
     2. SCROLL REVEAL
     ───────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');
  const observer  = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => observer.observe(el));


  /* ─────────────────────────────────
     3. NAVBAR SCROLL HIDE/SHOW
     ───────────────────────────────── */
  const nav = document.getElementById('product-nav');
  let lastScrollY = 0;

  if (nav) {
    window.addEventListener('scroll', () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY && currentY > 100) {
        nav.style.transform = 'translateY(-100%)';
      } else {
        nav.style.transform = 'translateY(0)';
      }
      lastScrollY = currentY;
    }, { passive: true });
  }


  /* ─────────────────────────────────
     4. SCENT NOTE IMAGE TILT
     ───────────────────────────────── */
  document.querySelectorAll('.scent-note-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / (rect.width  / 2);
      const dy   = (e.clientY - cy) / (rect.height / 2);
      const img  = card.querySelector('.scent-note-image');
      if (img) {
        img.style.transform = `rotateX(${-dy * 4}deg) rotateY(${dx * 4}deg)`;
      }
    });
    card.addEventListener('mouseleave', () => {
      const img = card.querySelector('.scent-note-image');
      if (img) {
        img.style.transform = '';
      }
    });
  });


  /* ─────────────────────────────────
     5. SMOOTH SCROLL for anchor links
     ───────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const targetId = link.getAttribute('href').substring(1);
      const target   = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });


  /* ─────────────────────────────────
     6. LUXURY CART & SEAMLESS CHECKOUT DRAWER
     ───────────────────────────────── */

  // Cart state
  let cart = null;
  
  // Inject Cart Icon into Nav
  const navRight = document.querySelector('.nav-right');
  if (navRight) {
    const cartBtn = document.createElement('button');
    cartBtn.className = 'nav-cart-btn';
    cartBtn.ariaLabel = 'Open Shopping Bag';
    cartBtn.innerHTML = `
      <span class="material-symbols-outlined">shopping_bag</span>
      <span class="nav-cart-badge" id="cart-badge">0</span>
    `;
    navRight.appendChild(cartBtn);
    cartBtn.addEventListener('click', () => {
      if (cart) {
        openDrawer();
      } else {
        showToast('Your Private Bag is Empty');
      }
    });
  }

  // Inject Modal Structure to Body
  const drawerMarkup = `
    <div class="checkout-overlay" id="checkout-overlay"></div>
    <div class="checkout-drawer" id="checkout-drawer">
      <button class="checkout-close" id="checkout-close" aria-label="Close Checkout">
        <span class="material-symbols-outlined">close</span>
      </button>
      <div class="drawer-header">
        <h2 class="drawer-logo">VELORA</h2>
        <p class="drawer-tagline">Maison de Parfum &middot; Instant Checkout</p>
      </div>
      <div class="drawer-body" id="drawer-body">
        <!-- Rendered dynamically -->
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', drawerMarkup);

  const drawerOverlay = document.getElementById('checkout-overlay');
  const drawer = document.getElementById('checkout-drawer');
  const drawerClose = document.getElementById('checkout-close');
  const drawerBody = document.getElementById('drawer-body');
  const cartBadge = document.getElementById('cart-badge');

  // Close handlers
  drawerOverlay.addEventListener('click', closeDrawer);
  drawerClose.addEventListener('click', closeDrawer);

  function openDrawer() {
    drawerOverlay.classList.add('active');
    drawer.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderDrawerContent();
    refreshCursorBindings();
  }

  function closeDrawer() {
    drawerOverlay.classList.remove('active');
    drawer.classList.remove('active');
    document.body.style.overflow = '';
  }

  // ── Customizer State variables ──
  let selectedSize = '50ml';
  let selectedQty = 1;

  // ── Size Capsules Click Handlers ──
  const sizeCapsules = document.querySelectorAll('.size-capsule');
  const priceEl = document.querySelector('.product-price');
  const sizeLabelEl = document.querySelector('.product-size-label');

  // Prepend dynamic Total Price element above the price row
  const priceRow = document.querySelector('.product-price-row');
  let totalPriceEl = null;

  if (priceRow) {
    totalPriceEl = document.createElement('div');
    totalPriceEl.className = 'product-total-price';
    totalPriceEl.style.opacity = '0';
    totalPriceEl.style.height = '0';
    totalPriceEl.style.overflow = 'hidden';
    totalPriceEl.style.transform = 'translateY(8px)';
    totalPriceEl.style.transition = 'opacity 0.4s var(--ease-royal), transform 0.4s var(--ease-royal), height 0.4s var(--ease-royal), margin-bottom 0.4s var(--ease-royal)';
    totalPriceEl.style.fontFamily = "'Hanken Grotesk', sans-serif";
    totalPriceEl.style.fontSize = '0.78rem';
    totalPriceEl.style.letterSpacing = '0.25em';
    totalPriceEl.style.textTransform = 'uppercase';
    totalPriceEl.style.color = 'var(--gold)';
    totalPriceEl.style.fontWeight = '600';
    totalPriceEl.innerHTML = `Total Investment: <span class="total-val" style="color: var(--white); font-family: 'Bodoni Moda', serif; font-size: 1.15rem; margin-left: 0.5rem;">£0</span>`;
    priceRow.parentNode.insertBefore(totalPriceEl, priceRow);
  }

  // Recalculates and animates dynamic total/unit pricing changes
  function updateDynamicPricing() {
    if (!priceEl) return;
    const basePrice = parseInt(priceEl.getAttribute('data-base-price')) || 395;
    const activeCapsule = document.querySelector('.size-capsule.active');
    const offset = activeCapsule ? (parseInt(activeCapsule.getAttribute('data-offset')) || 0) : 0;
    
    const unitPrice = basePrice + offset;
    const totalPrice = unitPrice * selectedQty;
    
    priceEl.innerText = `£${unitPrice}`;
    
    if (totalPriceEl) {
      if (selectedQty > 1) {
        totalPriceEl.querySelector('.total-val').innerText = `£${totalPrice}`;
        totalPriceEl.style.height = '24px';
        totalPriceEl.style.marginBottom = '0.6rem';
        totalPriceEl.style.opacity = '1';
        totalPriceEl.style.transform = 'translateY(0)';
      } else {
        totalPriceEl.style.opacity = '0';
        totalPriceEl.style.height = '0';
        totalPriceEl.style.marginBottom = '0';
        totalPriceEl.style.transform = 'translateY(8px)';
      }
    }
  }

  if (priceEl) {
    const basePrice = parseInt(priceEl.getAttribute('data-base-price')) || 495;
    sizeCapsules.forEach(capsule => {
      capsule.addEventListener('click', () => {
        sizeCapsules.forEach(c => c.classList.remove('active'));
        capsule.classList.add('active');

        selectedSize = capsule.getAttribute('data-size');
        const offset = parseInt(capsule.getAttribute('data-offset')) || 0;
        const currentPrice = basePrice + offset;

        // Animate price change
        priceEl.style.opacity = '0';
        priceEl.style.transform = 'translateY(-3px)';
        priceEl.style.transition = 'opacity 0.2s, transform 0.2s';
        
        setTimeout(() => {
          updateDynamicPricing();
          priceEl.style.opacity = '1';
          priceEl.style.transform = 'translateY(0)';
        }, 200);

        // Update Volume text
        let labelText = '50ml / 1.7 fl oz';
        if (selectedSize === '100ml') {
          labelText = '100ml / 3.4 fl oz';
        } else if (selectedSize === '200ml') {
          labelText = '200ml / 6.8 fl oz';
        }
        if (sizeLabelEl) {
          sizeLabelEl.innerText = labelText;
        }
      });
    });
  }

  // ── Page Quantity Selector Handlers ──
  const pageQtyValEl = document.querySelector('.page-qty-val');
  const pageQtyMinusBtn = document.querySelector('.page-qty-selector .minus-btn');
  const pageQtyPlusBtn = document.querySelector('.page-qty-selector .plus-btn');

  if (pageQtyValEl) {
    if (pageQtyMinusBtn) {
      pageQtyMinusBtn.addEventListener('click', () => {
        if (selectedQty > 1) {
          selectedQty--;
          pageQtyValEl.innerText = selectedQty;
          updateDynamicPricing();
        }
      });
    }
    if (pageQtyPlusBtn) {
      pageQtyPlusBtn.addEventListener('click', () => {
        if (selectedQty < 10) {
          selectedQty++;
          pageQtyValEl.innerText = selectedQty;
          updateDynamicPricing();
        }
      });
    }
  }

  // Scent details extractor
  function extractProductDetails() {
    const titleEl = document.querySelector('.product-title');
    const priceEl = document.querySelector('.product-price');
    const imgEl = document.querySelector('.imperial-bottle-focus-img, .product-img, .split-img, .hero-fullscreen-img');

    let title = titleEl ? titleEl.innerText : 'Velora Fragrance';
    let priceText = priceEl ? priceEl.innerText : '£495';
    let price = parseInt(priceText.replace(/[^0-9]/g, '')) || 495;
    let image = imgEl ? imgEl.src : 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNFZoHaVh7Sq7a6lQDV51hP0PblZNe1gEhrW-0zRvNbVr2Od4uMXRjTz2cbdUsq6yV9DrjYIbB3hTX8PUo3ifAk5Ruo22XzM4V5xJGbB8ZB-jXWeBhkMGyMVeev6yqmZF7GKUrnWxyW6H51wN43MpCW22mtjxcDhBnLbDhh7giqHETaWYfxXcn1We830iWc0wh8JXHJIO5ne5gcbSlNAgWi7UNf9w-0_ZAhDkPwCQCZlWysWIvxQTqHggGDDaWUy1UrwWBuTy8Qhpv';
    
    // Custom volume description
    let volDesc = selectedSize;
    if (selectedSize === '50ml') volDesc = '50ml (Classic Decant)';
    else if (selectedSize === '100ml') volDesc = '100ml (Flagship Flacon)';
    else if (selectedSize === '200ml') volDesc = '200ml (Imperial Decanter)';

    return { title, price, priceText, image, size: volDesc };
  }

  // Global Cart API for showcase grids or external pages
  window.veloraAddToCartAndOpenDrawer = function(details) {
    if (!details) return;
    
    cart = {
      title: details.title || 'Velora Fragrance',
      price: parseInt(details.price) || 395,
      image: details.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNFZoHaVh7Sq7a6lQDV51hP0PblZNe1gEhrW-0zRvNbVr2Od4uMXRjTz2cbdUsq6yV9DrjYIbB3hTX8PUo3ifAk5Ruo22XzM4V5xJGbB8ZB-jXWeBhkMGyMVeev6yqmZF7GKUrnWxyW6H51wN43MpCW22mtjxcDhBnLbDhh7giqHETaWYfxXcn1We830iWc0wh8JXHJIO5ne5gcbSlNAgWi7UNf9w-0_ZAhDkPwCQCZlWysWIvxQTqHggGDDaWUy1UrwWBuTy8Qhpv',
      size: details.size || '100ml (Flagship Flacon)',
      qty: details.qty || 1
    };

    // Update nav badge
    if (cartBadge) {
      cartBadge.innerText = cart.qty;
      cartBadge.classList.add('visible');
    }

    openDrawer();
  };

  // Bind Add to Cart / Add to Collection Buttons
  const checkoutTriggers = document.querySelectorAll('.product-cta, .btn-wishlist, .btn-icon-circle');
  
  checkoutTriggers.forEach(btn => {
    if (btn.classList.contains('product-cta')) {
      // Primary Checkout Button
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const details = extractProductDetails();
        
        // Add or update cart
        cart = {
          title: details.title,
          price: details.price,
          image: details.image,
          size: details.size,
          qty: selectedQty
        };
        
        // Update badge
        cartBadge.innerText = selectedQty;
        cartBadge.classList.add('visible');
        
        openDrawer();
      });
    } else {
      // Wishlist / Save Button
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const details = extractProductDetails();
        
        // Save to wishlist in local storage
        let wishlist = JSON.parse(localStorage.getItem('velora_wishlist')) || [];
        if (!wishlist.includes(details.title)) {
          wishlist.push(details.title);
          localStorage.setItem('velora_wishlist', JSON.stringify(wishlist));
          showToast(`Added ${details.title} to Collection`);
          
          // Sync with Supabase cloud database
          syncWishlistItem(details.title);
        } else {
          showToast(`${details.title} is already in Collection`);
        }
      });
    }
  });

  // Render checkout states inside the drawer
  function renderDrawerContent() {
    if (!cart) return;

    const totalPrice = cart.price * cart.qty;

    drawerBody.innerHTML = `
      <div class="checkout-flow" id="checkout-form-container">
        <!-- Section 1: Item Preview -->
        <div class="checkout-section">
          <h3 class="checkout-section-title">01 / Selection</h3>
          <div class="cart-item-preview">
            <div class="cart-item-img-wrap">
              <img src="${cart.image}" alt="${cart.title}" />
            </div>
            <div class="cart-item-info">
              <h4 class="cart-item-title">${cart.title}</h4>
              <p class="cart-item-meta">${cart.size} &middot; Rare Extract</p>
              <div class="cart-item-qty-row">
                <span class="qty-label">Quantity:</span>
                <div class="qty-selector">
                  <button class="qty-btn" id="qty-dec" aria-label="Decrease quantity">&minus;</button>
                  <span class="qty-val" id="qty-val">${cart.qty}</span>
                  <button class="qty-btn" id="qty-inc" aria-label="Increase quantity">&plus;</button>
                </div>
              </div>
            </div>
            <div class="cart-item-price-block">
              <span class="cart-item-price">&pound;${totalPrice}</span>
            </div>
          </div>
        </div>

        <!-- Section 2: Delivery & Shipping Address -->
        <div class="checkout-section">
          <h3 class="checkout-section-title">02 / Concierge Shipping</h3>
          <div class="form-grid">
            <div class="input-wrap full-width">
              <input type="text" id="cust-name" required placeholder=" " />
              <label for="cust-name">Full Name</label>
            </div>
            <div class="input-wrap full-width">
              <input type="text" id="cust-address" required placeholder=" " />
              <label for="cust-address">Delivery Address (Street & Apt)</label>
            </div>
            <div class="input-wrap">
              <input type="text" id="cust-city" required placeholder=" " />
              <label for="cust-city">City</label>
            </div>
            <div class="input-wrap">
              <input type="text" id="cust-zip" required placeholder=" " />
              <label for="cust-zip">Postal Code</label>
            </div>
            <div class="input-wrap full-width">
              <input type="text" id="cust-country" required placeholder=" " defaultValue="United Kingdom" value="United Kingdom" />
              <label for="cust-country">Country</label>
            </div>
            <div class="input-wrap full-width">
              <input type="tel" id="cust-phone" required placeholder=" " />
              <label for="cust-phone">Contact Number (For Dispatch)</label>
            </div>
          </div>
        </div>

        <!-- Section 3: Safe Payment -->
        <div class="checkout-section">
          <h3 class="checkout-section-title">03 / Imperial Encryption</h3>
          <div class="form-grid">
            <div class="input-wrap full-width">
              <input type="text" id="pay-cardholder" required placeholder=" " autocomplete="cc-name" />
              <label for="pay-cardholder">Cardholder Name</label>
            </div>
            <div class="input-wrap full-width">
              <input type="text" id="pay-cardno" required placeholder=" " autocomplete="cc-number" inputmode="numeric" />
              <label for="pay-cardno">Card Number</label>
            </div>
            <div class="input-wrap">
              <input type="text" id="pay-expiry" required placeholder=" " autocomplete="cc-exp" inputmode="numeric" />
              <label for="pay-expiry">Expiry Date (MM/YY)</label>
            </div>
            <div class="input-wrap">
              <input type="password" id="pay-cvv" required placeholder=" " autocomplete="cc-csc" inputmode="numeric" maxlength="4" />
              <label for="pay-cvv">CVV Code</label>
            </div>
          </div>
        </div>

        <!-- Error Summary Box -->
        <div class="checkout-error-box" id="checkout-error-box">
          <span class="material-symbols-outlined">warning</span>
          <span id="error-message">Please fill in all the required royal details.</span>
        </div>

        <!-- Final royal CTA -->
        <div class="checkout-action-wrap">
          <button class="btn-royal checkout-submit-btn" id="checkout-submit-btn">
            <span>Authorise Dispatch &middot; &pound;${totalPrice}</span>
          </button>
          <p class="checkout-legal">Secure luxury checkout by Velora Atelier. Fully encrypted.</p>
        </div>
      </div>
    `;

    // Quantity buttons logic
    const decBtn = document.getElementById('qty-dec');
    const incBtn = document.getElementById('qty-inc');
    const qtyVal = document.getElementById('qty-val');

    decBtn.addEventListener('click', () => {
      if (cart.qty > 1) {
        cart.qty--;
        selectedQty = cart.qty;
        qtyVal.innerText = cart.qty;
        if (pageQtyValEl) pageQtyValEl.innerText = selectedQty;
        cartBadge.innerText = selectedQty;
        renderDrawerContent();
      }
    });

    incBtn.addEventListener('click', () => {
      cart.qty++;
      selectedQty = cart.qty;
      qtyVal.innerText = cart.qty;
      if (pageQtyValEl) pageQtyValEl.innerText = selectedQty;
      cartBadge.innerText = selectedQty;
      renderDrawerContent();
    });

    // Form inputs formatting & validation
    const cardInput = document.getElementById('pay-cardno');
    const expInput = document.getElementById('pay-expiry');
    const cvvInput = document.getElementById('pay-cvv');
    const submitBtn = document.getElementById('checkout-submit-btn');
    const errorBox = document.getElementById('checkout-error-box');
    const errorMessage = document.getElementById('error-message');

    // Credit Card number auto-spacing (XXXX XXXX XXXX XXXX)
    cardInput.addEventListener('input', (e) => {
      let val = cardInput.value.replace(/\D/g, '');
      let formatted = '';
      for (let i = 0; i < val.length && i < 16; i++) {
        if (i > 0 && i % 4 === 0) {
          formatted += ' ';
        }
        formatted += val[i];
      }
      cardInput.value = formatted;
    });

    // Credit Card Expiry formatting (MM/YY)
    expInput.addEventListener('input', (e) => {
      let val = expInput.value.replace(/\D/g, '');
      let formatted = '';
      if (val.length > 0) {
        formatted += val.substring(0, 2);
        if (val.length > 2) {
          formatted += '/' + val.substring(2, 4);
        }
      }
      expInput.value = formatted;
    });

    // CVV formatting (allow only digits)
    cvvInput.addEventListener('input', (e) => {
      cvvInput.value = cvvInput.value.replace(/\D/g, '').substring(0, 4);
    });

    // Submit Action
    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Fields to validate
      const requiredInputs = [
        { id: 'cust-name', name: 'Recipient Name' },
        { id: 'cust-address', name: 'Delivery Address' },
        { id: 'cust-city', name: 'City' },
        { id: 'cust-zip', name: 'Postal Code' },
        { id: 'cust-country', name: 'Country' },
        { id: 'cust-phone', name: 'Contact Phone Number' },
        { id: 'pay-cardholder', name: 'Cardholder Name' },
        { id: 'pay-cardno', name: 'Card Number' },
        { id: 'pay-expiry', name: 'Expiry Date' },
        { id: 'pay-cvv', name: 'CVV Security Code' }
      ];

      let hasError = false;
      let errorText = '';

      // Reset styles
      errorBox.classList.remove('active');
      requiredInputs.forEach(item => {
        const el = document.getElementById(item.id);
        if (el) el.classList.remove('input-error');
      });

      // Validation check
      for (let item of requiredInputs) {
        const el = document.getElementById(item.id);
        if (!el || !el.value.trim()) {
          el.classList.add('input-error');
          el.focus();
          // Shake effect
          el.parentElement.classList.add('shake');
          setTimeout(() => el.parentElement.classList.remove('shake'), 500);
          
          errorText = `The ${item.name} is required to prepare your package.`;
          hasError = true;
          break;
        }
      }

      // Check credit card format
      if (!hasError) {
        const cardNoClean = cardInput.value.replace(/\s/g, '');
        if (cardNoClean.length < 13 || cardNoClean.length > 16) {
          cardInput.classList.add('input-error');
          cardInput.focus();
          cardInput.parentElement.classList.add('shake');
          setTimeout(() => cardInput.parentElement.classList.remove('shake'), 500);
          errorText = 'Please provide a valid credit card number.';
          hasError = true;
        }
      }

      // Check Expiry Date format
      if (!hasError) {
        if (!/^\d{2}\/\d{2}$/.test(expInput.value)) {
          expInput.classList.add('input-error');
          expInput.focus();
          expInput.parentElement.classList.add('shake');
          setTimeout(() => expInput.parentElement.classList.remove('shake'), 500);
          errorText = 'Please enter expiry date as MM/YY.';
          hasError = true;
        }
      }

      // Check CVV format
      if (!hasError) {
        if (cvvInput.value.length < 3) {
          cvvInput.classList.add('input-error');
          cvvInput.focus();
          cvvInput.parentElement.classList.add('shake');
          setTimeout(() => cvvInput.parentElement.classList.remove('shake'), 500);
          errorText = 'Please enter a valid CVV code.';
          hasError = true;
        }
      }

      if (hasError) {
        errorMessage.innerText = errorText;
        errorBox.classList.add('active');
        return;
      }

      // If validation succeeds, launch the majestic checkout animations!
      triggerLuxuryCheckoutAnimations();
    });
  }

  // Sync Guest Wishlist to Supabase Table
  async function syncWishlistItem(productTitle) {
    if (!supabase) return;
    try {
      let guestSessionId = localStorage.getItem('velora_guest_session');
      if (!guestSessionId) {
        guestSessionId = 'guest_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('velora_guest_session', guestSessionId);
      }
      
      // Get matching product ID
      const { data: product } = await supabase
        .from('products')
        .select('id')
        .eq('title', productTitle)
        .maybeSingle();
        
      if (product) {
        await supabase
          .from('wishlists')
          .insert([{
            guest_session_id: guestSessionId,
            product_id: product.id
          }]);
        console.log(`👑 Wishlist synced to Supabase for: ${productTitle}`);
      }
    } catch (err) {
      console.warn("Wishlist cloud sync error:", err);
    }
  }

  // Asynchronous Database-backed checkout writes
  async function triggerLuxuryCheckoutAnimations() {
    const totalCost = cart.price * cart.qty;
    const recipientName = document.getElementById('cust-name').value;
    const deliveryAddress = document.getElementById('cust-address').value;
    const deliveryCity = document.getElementById('cust-city').value;
    const deliveryPostal = document.getElementById('cust-zip').value;
    const deliveryCountry = document.getElementById('cust-country').value;
    const contactPhone = document.getElementById('cust-phone').value;
    const orderNo = 'VL-' + Math.floor(10000 + Math.random() * 90000);

    // Fade out form
    const formContainer = document.getElementById('checkout-form-container');
    if (formContainer) {
      formContainer.style.opacity = '0';
      formContainer.style.transform = 'translateY(15px)';
      formContainer.style.transition = 'opacity 0.6s var(--ease-royal), transform 0.6s var(--ease-royal)';
    }

    setTimeout(async () => {
      // Inject luxurious loading spinner
      drawerBody.innerHTML = `
        <div class="checkout-loading-screen" id="checkout-loading-screen">
          <div class="royal-spinner-wrap">
            <div class="royal-spinner-circle"></div>
            <span class="royal-spinner-icon">👑</span>
          </div>
          <h3 class="loading-title">Encrypting Transaction</h3>
          <p class="loading-subtitle" id="loading-sub">Connecting with royal financial vaults...</p>
        </div>
      `;

      try {
        const sub = document.getElementById('loading-sub');

        if (!supabase) {
          throw new Error("Supabase secure client is not connected.");
        }

        // Phase 1: Create customer entry
        if (sub) sub.innerText = 'Registering concierge client details...';
        const { data: customer, error: customerError } = await supabase
          .from('customers')
          .insert([{
            full_name: recipientName,
            phone: contactPhone,
            address: deliveryAddress,
            city: deliveryCity,
            postal_code: deliveryPostal,
            country: deliveryCountry
          }])
          .select()
          .single();

        if (customerError) throw customerError;

        // Phase 2: Create main order entry
        if (sub) {
          sub.innerText = 'Securing signature courier dispatch routes...';
          document.querySelector('.loading-title').innerText = 'Preparing Dispatch';
        }
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert([{
            order_reference: orderNo,
            customer_id: customer.id,
            recipient_name: recipientName,
            shipping_address: deliveryAddress,
            shipping_city: deliveryCity,
            shipping_postal_code: deliveryPostal,
            shipping_country: deliveryCountry,
            contact_phone: contactPhone,
            total_amount: totalCost,
            payment_status: 'Authorized',
            fulfillment_status: 'Preparing Dispatch'
          }])
          .select()
          .single();

        if (orderError) throw orderError;

        // Phase 3: Connect product UUID
        let productId = null;
        const { data: productData } = await supabase
          .from('products')
          .select('id')
          .eq('title', cart.title)
          .maybeSingle();

        if (productData) {
          productId = productData.id;
        }

        // Phase 4: Insert order item
        const { error: itemError } = await supabase
          .from('order_items')
          .insert([{
            order_id: order.id,
            product_id: productId,
            product_title: cart.title,
            size_selected: cart.size,
            quantity: cart.qty,
            unit_price: cart.price,
            total_price: totalCost
          }]);

        if (itemError) throw itemError;

        // Visual delay to complete the high-end loading experience
        setTimeout(() => {
          drawerBody.innerHTML = `
            <div class="checkout-success-screen">
              <div class="wax-seal-container">
                <div class="wax-seal">
                  <span class="seal-logo">V</span>
                </div>
                <div class="seal-glow"></div>
              </div>
              
              <h3 class="success-title">Order Confirmed</h3>
              <p class="success-subtitle">Your majestic package is being prepared for dispatch.</p>
              
              <div class="success-receipt-box">
                <div class="receipt-row logo-row">
                  <span>VELORA ATELIER</span>
                </div>
                <div class="receipt-divider"></div>
                <div class="receipt-row">
                  <span class="receipt-lbl">Order Reference:</span>
                  <span class="receipt-val">${orderNo}</span>
                </div>
                <div class="receipt-row">
                  <span class="receipt-lbl">Item:</span>
                  <span class="receipt-val">${cart.qty}x ${cart.title} (${cart.size})</span>
                </div>
                <div class="receipt-row">
                  <span class="receipt-lbl">Deliver To:</span>
                  <span class="receipt-val">${recipientName}</span>
                </div>
                <div class="receipt-row">
                  <span class="receipt-lbl">Destination:</span>
                  <span class="receipt-val">${deliveryAddress}, ${deliveryCity}, ${deliveryCountry}</span>
                </div>
                <div class="receipt-divider"></div>
                <div class="receipt-row total-row">
                  <span class="receipt-lbl">Total Investment:</span>
                  <span class="receipt-val">&pound;${totalCost}</span>
                </div>
              </div>
              
              <button class="btn-royal success-return-btn" id="success-return-btn">
                <span>Return to Maison</span>
              </button>
            </div>
          `;

          // Clear cart
          cart = null;
          cartBadge.innerText = '0';
          cartBadge.classList.remove('visible');

          document.getElementById('success-return-btn').addEventListener('click', () => {
            closeDrawer();
          });

          refreshCursorBindings();

        }, 1200);

      } catch (error) {
        console.error("Supabase Vault Error:", error);
        drawerBody.innerHTML = `
          <div class="checkout-error-screen" style="text-align: center; padding: 40px 20px;">
            <span class="material-symbols-outlined" style="font-size: 48px; color: #ff5252; margin-bottom: 20px;">warning</span>
            <h3 class="success-title" style="color: #ff5252;">Vault Encryption Error</h3>
            <p class="success-subtitle">${error.message || 'There was a security vault connection error. Please try again.'}</p>
            <button class="btn-royal success-return-btn" id="error-return-btn" style="margin-top: 30px;">
              <span>Back to Checkout</span>
            </button>
          </div>
        `;
        document.getElementById('error-return-btn').addEventListener('click', () => {
          renderDrawerContent();
        });
        refreshCursorBindings();
      }
    }, 600);
  }


  /* ─────────────────────────────────
     7. TOAST NOTIFICATIONS (Luxury Wishlist popup)
     ───────────────────────────────── */
  function showToast(message) {
    // Check if toast already exists
    let toast = document.getElementById('velora-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'velora-toast';
      toast.className = 'velora-toast';
      document.body.appendChild(toast);
    }

    toast.innerText = message;
    toast.classList.add('active');

    // Remove cursor interaction classes dynamically
    refreshCursorBindings();

    setTimeout(() => {
      toast.classList.remove('active');
    }, 3000);
  }

});


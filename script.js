function populateDates(eventData) {
  const carousel = document.getElementById("date-carousel");
  carousel.innerHTML = "";

  if (eventData.length === 0) {
    carousel.innerHTML = `
            <div class="flex items-center justify-center w-full text-purple-200 text-lg">
                <i class="fas fa-exclamation-circle mr-3"></i>
                No dates available
            </div>
        `;
    return;
  }

  eventData.forEach((item, index) => {
    const date = new Date(item.date);
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

    const startTime = item.startTime
      ? formatTimeFromISO(item.startTime)
      : "N/A";
    const endTime = item.endTime ? formatTimeFromISO(item.endTime) : "N/A";

    const itemDiv = document.createElement("div");
    itemDiv.classList.add(
      "date-carousel-item",
      "flex-shrink-0",
      "w-36",
      "cursor-pointer",
      "transform",
      "transition-all",
      "duration-300",
      "hover:scale-105",
      "hover:-translate-y-2",
      "snap-center"
    );

    itemDiv.innerHTML = `
            <div class="relative group">
                <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-2xl backdrop-blur-sm border border-white/20 group-hover:border-white/40 transition-all duration-300"></div>
                <div class="relative p-4 text-center">
                    <div class="text-sm font-medium text-purple-200/80 mb-1">${dayName}</div>
                    <div class="text-xl font-bold text-white mb-2">${formattedDate}</div>
                    <div class="text-xs text-purple-200/70 space-y-1">
                        <div class="flex items-center justify-center space-x-1">
                            <i class="fas fa-clock text-xs"></i>
                            <span>${startTime}</span>
                        </div>
                        <div class="text-purple-300/50">to</div>
                        <div class="flex items-center justify-center space-x-1">
                            <i class="fas fa-clock text-xs"></i>
                            <span>${endTime}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

    itemDiv.dataset.date = item.date;
    itemDiv.dataset.startTime = item.startTime;
    itemDiv.dataset.endTime = item.endTime;

    // Improved mobile interaction handling
    let touchStartX = 0;
    let touchStartY = 0;
    let isTouchMove = false;

    itemDiv.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isTouchMove = false;
      },
      { passive: true }
    );

    itemDiv.addEventListener(
      "touchmove",
      (e) => {
        const touchEndX = e.touches[0].clientX;
        const touchEndY = e.touches[0].clientY;
        const deltaX = Math.abs(touchEndX - touchStartX);
        const deltaY = Math.abs(touchEndY - touchStartY);

        // If movement is more than 10px, consider it a scroll
        if (deltaX > 10 || deltaY > 10) {
          isTouchMove = true;
        }
      },
      { passive: true }
    );

    const selectDate = (e) => {
      // Prevent action if it was a scroll gesture
      if (isTouchMove) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      document.querySelectorAll('.date-carousel-item').forEach(el => {
        const bgDiv = el.querySelector('.absolute');
        bgDiv.className = 'absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-2xl backdrop-blur-sm border border-white/20 group-hover:border-white/40 transition-all duration-300';
      });

      const selectedBg = itemDiv.querySelector('.absolute');
      selectedBg.className = 'absolute inset-0 bg-gradient-to-br from-red-500/80 to-pink-500/80 rounded-2xl backdrop-blur-sm border-2 border-red-400 shadow-xl shadow-red-500/50 transition-all duration-300';

      document.getElementById('selected-pickup-date').value = item.date;
      document.getElementById('selected-start-time').value = item.startTime;
      document.getElementById('selected-end-time').value = item.endTime;

      // Add haptic feedback for mobile
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    };

    // Use touchend for better mobile response
    itemDiv.addEventListener("touchend", selectDate, { passive: false });
    // Keep click for desktop
    itemDiv.addEventListener("click", selectDate);

    carousel.appendChild(itemDiv);

    if (index === 0) {
      setTimeout(() => {
        const firstItem = carousel.querySelector('.date-carousel-item');
        if (firstItem) {
          const touchEndEvent = new Event('touchend', { bubbles: true });
          firstItem.dispatchEvent(touchEndEvent);
        }
      }, 100);
    }
  });

  setupSwipeIndicators();
}

function setupCarouselNavigation() {
  const prevButton = document.getElementById("prev-carousel-button");
  const nextButton = document.getElementById("next-carousel-button");
  const carousel = document.getElementById("date-carousel");
  const scrollAmount = 152; // w-36 + spacing

  if (prevButton) {
    prevButton.addEventListener("click", () => {
      carousel.scrollLeft -= scrollAmount;
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => {
      carousel.scrollLeft += scrollAmount;
    });
  }
}

function formatTimeFromISO(isoString) {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    });
  } catch (error) {
    console.error("Error parsing time:", error);
    return "N/A";
  }
}

function setupSwipeIndicators() {
  const carousel = document.getElementById("date-carousel");
  const indicators = document.querySelectorAll(".w-2, .w-6");

  // Update indicators based on scroll position
  carousel.addEventListener("scroll", () => {
    const scrollLeft = carousel.scrollLeft;
    const scrollWidth = carousel.scrollWidth - carousel.clientWidth;
    const scrollPercentage = scrollLeft / scrollWidth;

    // Reset all indicators
    indicators.forEach((indicator) => {
      indicator.className = 'w-2 h-2 rounded-full bg-white/30 transition-all duration-300';
    });

    // Highlight current indicator
    const currentIndex = Math.round(scrollPercentage * (indicators.length - 1));
    if (indicators[currentIndex]) {
      indicators[currentIndex].className = 'w-6 h-2 rounded-full bg-white/60 transition-all duration-300';
    }
  });

  // Hide swipe hint after first interaction
  let hasInteracted = false;
  carousel.addEventListener("scroll", () => {
    if (!hasInteracted) {
      hasInteracted = true;
      const swipeHint = document.querySelector('.text-purple-200\\/60');
      if (swipeHint && swipeHint.parentElement) {
        swipeHint.parentElement.style.opacity = '0';
        setTimeout(() => swipeHint.parentElement.style.display = 'none', 300);
      }
    }
  });
}

// Enhanced touch handling for better swipe experience
function setupTouchHandling() {
  const carousel = document.getElementById("date-carousel");
  let touchStartTime = 0;
  let isScrolling = false;

  carousel.addEventListener(
    "touchstart",
    (e) => {
      touchStartTime = Date.now();
      isScrolling = false;
    },
    { passive: true }
  );

  carousel.addEventListener(
    "touchmove",
    () => {
      isScrolling = true;
    },
    { passive: true }
  );

  carousel.addEventListener(
    "touchend",
    () => {
      // Reset scrolling state after a short delay
      setTimeout(() => {
        isScrolling = false;
      }, 50);
    },
    { passive: true }
  );

  // Prevent click events during scrolling with better detection
  carousel.addEventListener(
    "click",
    (e) => {
      if (isScrolling || (Date.now() - touchStartTime < 200)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    },
    true
  );
}

// Add CSS for hiding scrollbars
const style = document.createElement("style");
style.textContent = `
    .scrollbar-hide::-webkit-scrollbar {
        display: none;
    }
    .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
`;
document.head.appendChild(style);

// Array of inspirational quotes about environment and sustainability
const inspirationalQuotes = [
  {
    quote:
      "The greatest threat to our planet is the belief that someone else will save it.",
    author: "Robert Swan, Polar Explorer",
  },
  {
    quote:
      "We do not inherit the earth from our ancestors; we borrow it from our children.",
    author: "Native American Proverb",
  },
  {
    quote: "The Earth does not belong to us; we belong to the Earth.",
    author: "Chief Seattle",
  },
  {
    quote:
      "What we are doing to the forests of the world is but a mirror reflection of what we are doing to ourselves and to one another.",
    author: "Mahatma Gandhi",
  },
  {
    quote: "Be the change you wish to see in the world.",
    author: "Mahatma Gandhi",
  },
  {
    quote:
      "The environment is where we all meet; where we all have a mutual interest; it is the one thing all of us share.",
    author: "Lady Bird Johnson",
  },
  {
    quote:
      "Every time we turn our heads the other way when we see the law flouted, when we tolerate what we know to be wrong, when we close our eyes and ears to the corrupt because we are too busy or too frightened, when we fail to speak up and speak out, we strike a blow against freedom and decency and justice.",
    author: "Robert F. Kennedy",
  },
  {
    quote:
      "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb",
  },
  {
    quote:
      "Progress is impossible without change, and those who cannot change their minds cannot change anything.",
    author: "George Bernard Shaw",
  },
  {
    quote: "We won't have a society if we destroy the environment.",
    author: "Margaret Mead",
  },
  {
    quote:
      "The environment and the economy are really both two sides of the same coin. If we cannot sustain the environment, we cannot sustain ourselves.",
    author: "Wangari Maathai",
  },
  {
    quote:
      "What's the use of a fine house if you haven't got a tolerable planet to put it on?",
    author: "Henry David Thoreau",
  },
];

// Function to get random quote
function getRandomQuote() {
  return inspirationalQuotes[
    Math.floor(Math.random() * inspirationalQuotes.length)
  ];
}

// Replace date carousel with thank you section
function showThankYouSection() {
  const dateSection = document.querySelector(".space-y-4");
  const randomQuote = getRandomQuote();

  dateSection.innerHTML = `
                <div class="flex items-center space-x-3 mb-6">
                    <div class="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <i class="fas fa-check text-white text-lg"></i>
                    </div>
                    <h2 class="text-xl font-bold text-white">
                        Thank You! 🎉
                    </h2>
                </div>

                <!-- Success message -->
                <div class="relative mb-6">
                    <div class="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-2xl backdrop-blur-sm"></div>
                    <div class="relative p-6 text-center">
                        <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center animate-glow">
                            <i class="fas fa-check text-white text-2xl"></i>
                        </div>
                        <p class="text-green-200 mb-4 leading-relaxed">
                            Your PickUp has been scheduled successfully! We will make sure to swing by your address on that day.
                        </p>
                    </div>
                </div>

                <!-- Share message -->
                <div class="relative mb-6">
                    <div class="absolute inset-0 bg-black/20 rounded-2xl backdrop-blur-sm"></div>
                    <div class="relative p-4 text-center">
                        <p class="text-purple-300/90 text-sm">
                            <i class="fas fa-share-alt mr-2"></i>
                            Please share this in your neighborhood!
                        </p>
                    </div>
                </div>
                
                <!-- Random inspirational quote -->
                <div class="relative mb-6">
                    <div class="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl backdrop-blur-sm border border-purple-400/20"></div>
                    <div class="relative p-5">
                        <div class="text-center">
                            <i class="fas fa-quote-left text-purple-300/60 text-lg mb-3"></i>
                            <blockquote class="text-purple-200/90 italic text-sm mb-3 leading-relaxed">
                                "${randomQuote.quote}"
                            </blockquote>
                            <cite class="text-purple-300/70 text-xs">- ${randomQuote.author}</cite>
                        </div>
                    </div>
                </div>
                
                <!-- Contact info -->
                <div class="relative">
                    <div class="absolute inset-0 bg-black/30 rounded-2xl backdrop-blur-sm"></div>
                    <div class="relative p-5">
                        <p class="text-purple-200/80 text-sm mb-3 text-center">
                            <i class="fas fa-question-circle mr-2"></i>
                            Have any questions?
                        </p>
                        <div class="space-y-3">
                            <a href="mailto:feds201@gmail.com" class="flex items-center justify-center text-blue-300 hover:text-blue-200 transition-colors text-sm group">
                                <i class="fas fa-envelope mr-2 group-hover:scale-110 transition-transform"></i>
                                feds201@gmail.com
                            </a>
                            <a href="https://instagram.com/feds201" target="_blank" class="flex items-center justify-center text-pink-300 hover:text-pink-200 transition-colors text-sm group">
                                <i class="fab fa-instagram mr-2 group-hover:scale-110 transition-transform"></i>
                                @feds201
                            </a>
                        </div>
                    </div>
                </div>
            `;

  // Hide the address section and submit button
  const addressSection = document.querySelector(".space-y-4:nth-of-type(2)");
  const submitButton = document.querySelector('button[type="submit"]');
  
  if (addressSection) addressSection.style.display = "none";
  if (submitButton) submitButton.style.display = "none";

  // Add a "Schedule Another" button
  const form = document.querySelector("form");
  const newButton = document.createElement("button");
  newButton.type = "button";
  newButton.className =
    "w-full p-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-purple-500/50 transform hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden mt-6";
  newButton.innerHTML = `
                <div class="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div class="relative flex items-center justify-center space-x-3">
                    <span>Schedule Another PickUp</span>
                    <i class="fas fa-plus group-hover:rotate-90 transition-transform duration-300"></i>
                </div>
            `;

  newButton.addEventListener("click", () => {
    location.reload();
  });

  form.appendChild(newButton);
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Setup touch handling
  setupTouchHandling();

  // Add staggered animation delays
  const elements = document.querySelectorAll(".animate-slideIn");
  elements.forEach((el, index) => {
    el.style.animationDelay = `${index * 0.1}s`;
  });

  // Setup form submission
  const form = document.querySelector("form");
  
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault(); // stop normal form submit

      const submitButton = document.querySelector('button[type="submit"]');
      const originalButtonContent = submitButton.innerHTML;
      
      // Disable button and show loading state
      submitButton.disabled = true;
      submitButton.innerHTML = `
        <div class="absolute inset-0 bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 opacity-100 transition-opacity duration-300"></div>
        <div class="relative flex items-center justify-center space-x-3">
          <i class="fas fa-spinner animate-spin text-lg"></i>
          <span>Processing...</span>
        </div>
      `;
      submitButton.className = submitButton.className.replace('hover:scale-[1.02] hover:-translate-y-1', '');

      const pickupDate = document.getElementById('selected-pickup-date').value;
      const address = document.getElementById('address').value;

      if (!pickupDate || !address) {
        // Reset button state if validation fails
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonContent;
        submitButton.className = 'w-full p-4 bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-red-500/50 transform hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden';
        alert('Please select a date and enter your address.');
        return;
      }

      // Check if address appears to be in Rochester Hills area
    //   const addressLower = address.toLowerCase();
    //   const isInServiceArea = (
    //     addressLower.includes('rochester hills') ||
    //     addressLower.includes('rochester, mi') ||
    //     addressLower.includes('auburn hills') ||
    //     addressLower.includes('troy, mi') ||
    //     addressLower.includes('oakland university') ||
    //     addressLower.includes('pontiac, mi') ||
    //     addressLower.includes('bloomfield') ||
    //     addressLower.includes('birmingham, mi') ||
    //     addressLower.includes('48309') ||
    //     addressLower.includes('48307') ||
    //     addressLower.includes('48306') ||
    //     addressLower.includes('48073') ||
    //     addressLower.includes('48084')
    //   );

    //   if (!isInServiceArea) {
    //     const confirmOutsideArea = confirm(
    //       'Your address appears to be outside our primary service area (Rochester Hills and nearby areas). ' +
    //       'We may not be able to provide pickup service to this location. ' +
    //       'Would you like to proceed anyway?'
    //     );
        
    //     if (!confirmOutsideArea) {
    //       return;
    //     }
    //   }

      console.log('Submitting data:', {
        pickupDate: pickupDate,
        address: address
      });

      const appsScriptUrl = "https://script.google.com/macros/s/AKfycbw8YyPA6bd8sBhYTabJyA2WmavU-bKWbPhjJSoFjmfqaPXKSnF0YAGtPHzDpOYGCLQt/exec";

      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "text/plain;charset=utf-8 ");

      const raw = JSON.stringify({
        mode: "submit",
        pickupDate: pickupDate,
        address: address
      });

      const requestOptions = {
        method: "POST",
        mode: "cors",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
      };

      try {
        const response = await fetch(appsScriptUrl, requestOptions);
        const result = await response.json();

        if (result.success) {
          showThankYouSection();
          
          // Clear form data
          document.getElementById('selected-pickup-date').value = '';
          document.getElementById('selected-start-time').value = '';
          document.getElementById('selected-end-time').value = '';
          document.getElementById('address').value = '';
        } else {
          // Reset button state on failure
          submitButton.disabled = false;
          submitButton.innerHTML = originalButtonContent;
          submitButton.className = 'w-full p-4 bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-red-500/50 transform hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden';
          alert('Failed to schedule PickUP: ' + (result.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error submitting data:', error);
        // Reset button state on error
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonContent;
        submitButton.className = 'w-full p-4 bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-red-500/50 transform hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden';
        alert('An error occurred while scheduling PickUP.');
      }
    });
  }
});

// Load dates from Google Sheets
const appsScriptUrl = "https://script.google.com/macros/s/AKfycbw8YyPA6bd8sBhYTabJyA2WmavU-bKWbPhjJSoFjmfqaPXKSnF0YAGtPHzDpOYGCLQt/exec";

// Enhanced loading state - wrap in a function to ensure DOM is ready
function initializeDateLoading() {
  const carousel = document.getElementById("date-carousel");
  if (carousel) {
    carousel.innerHTML = `
              <div class="flex items-center justify-center w-full text-purple-200 text-lg">
                  <i class="fas fa-spinner animate-spin mr-3"></i>
                  Loading dates...
              </div>
          `;

    fetch(appsScriptUrl, {
      method: "GET",
      mode: "cors",
    })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then((data) => populateDates(data))
      .catch((error) => {
        console.error("Error fetching dates:", error);
        carousel.innerHTML = `
                      <div class="flex items-center justify-center w-full text-red-400 text-lg">
                          <i class="fas fa-exclamation-triangle mr-3"></i>
                          Failed to load dates
                      </div>
                  `;
      });
  } else {
    // If carousel doesn't exist yet, try again in a short time
    setTimeout(initializeDateLoading, 100);
  }
}

// Start date loading when page loads
document.addEventListener("DOMContentLoaded", initializeDateLoading);

// Also try to initialize immediately if DOM is already loaded
if (document.readyState === "loading") {
  // Document is still loading
  document.addEventListener("DOMContentLoaded", initializeDateLoading);
} else {
  // Document has already loaded
  initializeDateLoading();
}


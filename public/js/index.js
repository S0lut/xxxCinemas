window.onscroll = function() {scrollFunction()};

function scrollFunction() {

    var header = document.querySelector("header");
    if (document.body.scrollTop > 60 || document.documentElement.scrollTop > 60) {
        header.style.background = "radial-gradient(circle, #8e00bd 0%, #2d003b 100%)";
        header.style.borderBottom = "2px solid white";
    } else {
        header.style.background = "linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0.2))";
        header.style.borderBottom = "none";
    }

}


var userContainer = document.querySelector('.user-container');
var dropdown = document.getElementById('login-dropdown');

userContainer.addEventListener('mouseenter', function() {
    dropdown.style.display = 'block';
});

userContainer.addEventListener('mouseleave', function() {
    dropdown.style.display = 'none';
});



document.addEventListener("DOMContentLoaded", function() {
    const prevMovie = document.getElementById("prevMovie");
    const nextMovie = document.getElementById("nextMovie");
    const movieSlider = document.getElementById("movieSlider");
    const movieCards = document.querySelectorAll(".movieCard");
    const numVisible = 4;

    let currentIndex = 0;


    function updateSlider() {
        prevMovie.style.display = currentIndex > 0 ? "block" : "none";
        nextMovie.style.display = currentIndex + numVisible < movieCards.length ? "block" : "none";

        movieCards.forEach(card => {
            card.style.display = "none";
        });

        for (let i = currentIndex; i < currentIndex + numVisible; i++) {
            if (movieCards[i]) {
                movieCards[i].style.display = "block";
            }
        }
    }

    updateSlider();

    nextMovie.addEventListener("click", function() {
        if (currentIndex + numVisible < movieCards.length) {
            currentIndex++;
            updateSlider();
        }
    });

    prevMovie.addEventListener("click", function() {
        if (currentIndex > 0) {
            currentIndex--;
            updateSlider();
        }
    });
});







document.addEventListener('click', function(event) {
    var popups = document.querySelectorAll('.popup');
    popups.forEach(function(popup) {
        if (event.target === popup) {
            popup.style.display = 'none';
        }
    });
});



document.addEventListener("DOMContentLoaded", function() {
    const movieCards = document.querySelectorAll(".movieCard");
    movieCards.forEach(card => {
        card.addEventListener("mouseover", function() {
            movieCards.forEach(otherCard => {
                if (otherCard !== card) {
                    otherCard.classList.add("grayscale");
                }
            });
        });
        card.addEventListener("mouseout", function() {
            movieCards.forEach(otherCard => {
                otherCard.classList.remove("grayscale");
            });
        });
    });
});


document.addEventListener("DOMContentLoaded", function() {
    const movieCard2s = document.querySelectorAll(".movieCard2");
    movieCard2s.forEach(card => {
        card.addEventListener("mouseover", function() {
            movieCard2s.forEach(otherCard => {
                if (otherCard !== card) {
                    otherCard.classList.add("grayscale");
                }
            });
        });
        card.addEventListener("mouseout", function() {
            movieCard2s.forEach(otherCard => {
                otherCard.classList.remove("grayscale");
            });
        });
    });
});


const initSlider = () => {
    const imageList = document.querySelector(".slider-wrapper .image-list");
    const slideButtons = document.querySelectorAll(".slider-wrapper .slide-button");
    const sliderScrollbar = document.querySelector(".container .slider-scrollbar");
    const scrollbarThumb = sliderScrollbar.querySelector(".scrollbar-thumb");
    const maxScrollLeft = imageList.scrollWidth - imageList.clientWidth;
    
    // Handle scrollbar thumb drag
    scrollbarThumb.addEventListener("mousedown", (e) => {
        const startX = e.clientX;
        const thumbPosition = scrollbarThumb.offsetLeft;
        const maxThumbPosition = sliderScrollbar.getBoundingClientRect().width - scrollbarThumb.offsetWidth;
        
        // Update thumb position on mouse move
        const handleMouseMove = (e) => {
            const deltaX = e.clientX - startX;
            const newThumbPosition = thumbPosition + deltaX;
            // Ensure the scrollbar thumb stays within bounds
            const boundedPosition = Math.max(0, Math.min(maxThumbPosition, newThumbPosition));
            const scrollPosition = (boundedPosition / maxThumbPosition) * maxScrollLeft;
            
            scrollbarThumb.style.left = `${boundedPosition}px`;
            imageList.scrollLeft = scrollPosition;
        }
        // Remove event listeners on mouse up
        const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        }
        // Add event listeners for drag interaction
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    });
    // Slide images according to the slide button clicks
    slideButtons.forEach(button => {
        button.addEventListener("click", () => {
            const direction = button.id === "prev-slide" ? -1 : 1;
            const scrollAmount = imageList.clientWidth * direction;
            imageList.scrollBy({ left: scrollAmount, behavior: "smooth" });
        });
    });
     // Show or hide slide buttons based on scroll position
    const handleSlideButtons = () => {
        slideButtons[0].style.display = imageList.scrollLeft <= 0 ? "none" : "flex";
        slideButtons[1].style.display = imageList.scrollLeft >= maxScrollLeft ? "none" : "flex";
    }
    // Update scrollbar thumb position based on image scroll
    const updateScrollThumbPosition = () => {
        const scrollPosition = imageList.scrollLeft;
        const thumbPosition = (scrollPosition / maxScrollLeft) * (sliderScrollbar.clientWidth - scrollbarThumb.offsetWidth);
        scrollbarThumb.style.left = `${thumbPosition}px`;
    }
    // Call these two functions when image list scrolls
    imageList.addEventListener("scroll", () => {
        updateScrollThumbPosition();
        handleSlideButtons();
    });
}
window.addEventListener("resize", initSlider);
window.addEventListener("load", initSlider);


window.addEventListener('DOMContentLoaded', async () => {
    const username = getCookie("username");
    let balance = getCookie("balance"); 
    const loginDropdown = document.getElementById("login-dropdown");

    
    async function fetchAndUpdateBalance() {
        try {
            const response = await fetch("/api/user/balance", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (response.ok) {
                const data = await response.json();
                balance = data.balance;
                setBalanceCookie(balance);
            } else {
                console.error("Failed to fetch user balance");
            }
        } catch (error) {
            console.error("Error fetching user balance:", error);
        }
    }

    if (username) {
        try {
            
            const balanceText = balance ? `<div id="balance">Balance: ${balance}</div>` : '';
            loginDropdown.innerHTML = `<span>Hi, ${username}<br>${balanceText}<a href="#" id="logout-link">Log Out</a>`;
            document.getElementById("logout-link").addEventListener("click", () => {
                document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                document.cookie = "balance=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                document.cookie = "isAdmin=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                location.href = "/"; 
            });
            await fetchAndUpdateBalance();
        } catch (error) {
            console.error('Error fetching user balance:', error);
        }
    } else {
        // If not logged in, display login link
        loginDropdown.innerHTML = `<a href="Signin" id="login-link">Log In</a>`;
    }

});

// Function to get the value of a cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}
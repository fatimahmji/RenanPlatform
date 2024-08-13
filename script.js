document.addEventListener("DOMContentLoaded", function () {
    // Get all navigation items
    const navItems = document.querySelectorAll("nav ul li a");

    // Highlight the active link based on the current page
    navItems.forEach(item => {
        if (item.href === window.location.href) {
            item.classList.add("active-link");
        }
    });
});

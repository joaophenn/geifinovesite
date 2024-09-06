document.addEventListener("DOMContentLoaded", function () {
    // Manipulação do Dropdown
    const dropdowns = document.querySelectorAll(".dropdown");

    dropdowns.forEach(dropdown => {
        dropdown.addEventListener("click", function (event) {
            event.stopPropagation();
            this.classList.toggle("active");
            const dropdownContent = this.querySelector(".dropdown-content");
            dropdownContent.classList.toggle("show");
        });
    });

    // Fecha dropdowns ao clicar fora
    document.addEventListener("click", function (event) {
        dropdowns.forEach(dropdown => {
            if (!dropdown.contains(event.target)) {
                dropdown.classList.remove("active");
                const dropdownContent = dropdown.querySelector(".dropdown-content");
                dropdownContent.classList.remove("show");
            }
        });
    });

    // Navegação suave para links no cabeçalho e dentro de dropdowns
    const headerLinks = document.querySelectorAll('nav ul li a, .dropdown-content a');
    headerLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });

                // Fecha o dropdown após clicar no link
                dropdowns.forEach(dropdown => {
                    const dropdownContent = dropdown.querySelector(".dropdown-content");
                    dropdown.classList.remove("active");
                    dropdownContent.classList.remove("show");
                });
            }
        });
    });
});

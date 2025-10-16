
    document.addEventListener('DOMContentLoaded', function() {
      const mobileMenuButton = document.querySelector('[aria-controls="mobile-menu"]');
      const mobileMenu = document.getElementById('mobile-menu');

      mobileMenuButton.addEventListener('click', function() {
        const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
        mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
        mobileMenu.classList.toggle('hidden');

        // Toggle icons inside the button
        const menuIcon = mobileMenuButton.querySelector('.block');
        const closeIcon = mobileMenuButton.querySelector('.hidden');
        if (menuIcon && closeIcon) {
          menuIcon.classList.toggle('hidden');
          menuIcon.classList.toggle('block');
          closeIcon.classList.toggle('hidden');
          closeIcon.classList.toggle('block');
        }
      });
    });
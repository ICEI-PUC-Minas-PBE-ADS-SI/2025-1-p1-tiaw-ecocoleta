// Simple JavaScript functionality for the EcoColeta landing page

document.addEventListener("DOMContentLoaded", function () {
    // Handle navigation menu items
    const menuItems = document.querySelectorAll(".menu-item");
    menuItems.forEach((item) => {
      item.addEventListener("click", function () {
        // For now, just log the click. In a real implementation, this would navigate to the respective page
        console.log("Navigating to:", item.textContent);
      });
    });
  
    // Handle login button
    const loginButton = document.querySelector(".login-button");
    if (loginButton) {
      loginButton.addEventListener("click", function () {
        console.log("Login button clicked");
        // In a real implementation, this would open a login modal or navigate to a login page
      });
    }
  
    // Handle primary and secondary buttons
    const primaryButtons = document.querySelectorAll(".primary-button");
    primaryButtons.forEach((button) => {
      button.addEventListener("click", function () {
        console.log("Primary button clicked:", button.textContent.trim());
      });
    });
  
    const secondaryButtons = document.querySelectorAll(".secondary-button");
    secondaryButtons.forEach((button) => {
      button.addEventListener("click", function () {
        console.log("Secondary button clicked:", button.textContent.trim());
      });
    });
  
    // Handle impact calculator
    const calculateButton = document.querySelector(".calculator-button");
    const quantityInput = document.querySelector(".form-input");
    const progressFill = document.querySelector(".progress-fill");
    const progressText = document.querySelector(".progress-text");

    function updateProgress(value) {
      const maxValue = 100;
      const progress = Math.min((value / maxValue) * 100, 100);
      progressFill.style.width = `${progress}%`;
      progressText.textContent = `${Math.round(progress)}%`;
    }

    quantityInput.addEventListener("input", function() {
      const value = parseFloat(this.value) || 0;
      updateProgress(value);
    });

    if (calculateButton) {
      calculateButton.addEventListener("click", function (e) {
        e.preventDefault();
        const materialSelect = document.querySelector(".select-value");
        const quantity = parseFloat(quantityInput.value) || 0;

        console.log(
          "Calculating impact for:",
          materialSelect.textContent,
          "Quantity:",
          quantity
        );

        // Atualiza o progresso quando o botão é clicado
        updateProgress(quantity);
      });
    }
  
    // Handle reward buttons
    const rewardButtons = document.querySelectorAll(".reward-button");
    rewardButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const rewardCard = button.closest(".reward-card");
        const rewardTitle = rewardCard.querySelector(".reward-title").textContent;
        const rewardPoints =
          rewardCard.querySelector(".reward-points").textContent;
  
        console.log("Redeeming reward:", rewardTitle, "Points:", rewardPoints);
        // In a real implementation, this would handle the reward redemption process
      });
    });
  
    // Handle CTA buttons
    const ctaButtons = document.querySelectorAll(".cta-button");
    ctaButtons.forEach((button) => {
      button.addEventListener("click", function () {
        console.log("CTA button clicked:", button.textContent.trim());
        // In a real implementation, this would navigate to the respective page or open a modal
      });
    });
  
    // Handle footer links
    const footerLinks = document.querySelectorAll(".footer-link");
    footerLinks.forEach((link) => {
      link.addEventListener("click", function () {
        console.log("Footer link clicked:", link.textContent);
        // In a real implementation, this would navigate to the respective page
      });
    });
  });

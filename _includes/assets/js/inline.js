(function () {
  var form = document.querySelector(".contact-form");
  if (form) {
    var fields = [
      { input: "#name", error: "#name-error", message: "Please enter your name." },
      { input: "#email", error: "#email-error", message: "Please enter a valid email address." },
      { input: "#message", error: "#message-error", message: "Please enter a message." }
    ];

    function showError(input, errorEl, message) {
      input.setAttribute("aria-invalid", "true");
      errorEl.textContent = message;
    }

    function clearError(input, errorEl) {
      input.removeAttribute("aria-invalid");
      errorEl.textContent = "";
    }

    fields.forEach(function (field) {
      var input = form.querySelector(field.input);
      var errorEl = form.querySelector(field.error);
      if (!input || !errorEl) return;

      input.addEventListener("input", function () {
        if (input.validity.valid) clearError(input, errorEl);
      });
    });

    form.addEventListener("submit", function (event) {
      var hasError = false;

      fields.forEach(function (field) {
        var input = form.querySelector(field.input);
        var errorEl = form.querySelector(field.error);
        if (!input || !errorEl) return;

        if (!input.validity.valid) {
          event.preventDefault();
          hasError = true;
          showError(input, errorEl, field.message);
        } else {
          clearError(input, errorEl);
        }
      });

      if (hasError) {
        var firstInvalid = form.querySelector("[aria-invalid='true']");
        if (firstInvalid) firstInvalid.focus();
      }
    });
  }

  var disclosure = document.querySelector(".nav-disclosure");
  if (disclosure) {
    var summary = disclosure.querySelector("summary");
    var mobileQuery = window.matchMedia("(max-width: 767px)");

    function isMobileNav() {
      return mobileQuery.matches;
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && disclosure.open && isMobileNav()) {
        disclosure.open = false;
        if (summary) summary.focus();
      }
    });

    disclosure.addEventListener("click", function (event) {
      if (!isMobileNav()) return;
      if (event.target.closest(".site-nav--mobile a") && disclosure.open) {
        disclosure.open = false;
      }
    });
  }
})();

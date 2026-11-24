(function () {
	var storageKey = "sm-theme";

	function currentTheme() {
		return document.documentElement.getAttribute("data-theme") === "dark"
			? "dark"
			: "light";
	}

	function setTheme(theme) {
		theme = theme === "dark" ? "dark" : "light";
		if (theme === "dark") {
			document.documentElement.setAttribute("data-theme", "dark");
		} else {
			document.documentElement.removeAttribute("data-theme");
		}
		try {
			localStorage.setItem(storageKey, theme);
		} catch (err) {}
		syncControls(theme);
		document.dispatchEvent(
			new CustomEvent("sm-themechange", { detail: { theme: theme } })
		);
	}

	function syncControls(theme) {
		theme = theme || currentTheme();
		document.querySelectorAll("[data-theme-set]").forEach(function (button) {
			button.setAttribute(
				"aria-pressed",
				button.getAttribute("data-theme-set") === theme ? "true" : "false"
			);
		});
	}

	document.querySelectorAll("[data-theme-set]").forEach(function (button) {
		button.addEventListener("click", function () {
			setTheme(button.getAttribute("data-theme-set"));
		});
	});

	syncControls(currentTheme());
})();

const debounceTime = 500;

document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchInput");

  searchInput.focus();
  searchInput.addEventListener("keyup", function (event) {
    if (event.code === "Enter") {
      if (event.shiftKey) {
        prevButton.click();
      } else {
        nextButton.click();
      }
    }
  });

  let searchTimer;
  searchInput.addEventListener("input", (event) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      searchText(1);
    }, debounceTime);
  });

  const results = document.getElementById("results");
  const totalLabel = document.getElementById("total");
  const currentLabel = document.getElementById("current");
  const prevButton = document.getElementById("prevButton");
  const nextButton = document.getElementById("nextButton");
  const regexButton = document.getElementById("regexButton");
  const caseSensitiveButton = document.getElementById("caseSensitiveButton");

  const searchText = (index) => {
    chrome.runtime.sendMessage(
      {
        action: "search",
        searchText: searchInput.value,
        index: index,
        useRegex: regexButton.classList.contains("enabled"),
        caseSensitive: caseSensitiveButton.classList.contains("enabled"),
      },
      responseHandler
    );
  };

  const responseHandler = (response) => {
    if (response.total > 0) {
      results.classList.remove("hidden");
      totalLabel.textContent = response.total;
      currentLabel.textContent = response.current;
      prevButton.disabled = false;
      nextButton.disabled = false;
    } else {
      results.classList.add("hidden");
      prevButton.disabled = true;
      nextButton.disabled = true;
    }
  };

  prevButton.addEventListener("click", function () {
    const total = parseInt(totalLabel.textContent);
    const current = parseInt(currentLabel.textContent);
    const prev = current > 1 ? current - 1 : total;
    searchText(prev);
  });

  nextButton.addEventListener("click", function () {
    const total = parseInt(totalLabel.textContent);
    const current = parseInt(currentLabel.textContent);
    const next = current < total ? current + 1 : 1;
    searchText(next);
  });

  function toggle() {
    console.log("toggle");
    this.classList.toggle("enabled");
    searchText(1);
  }

  regexButton.addEventListener("click", toggle);
  caseSensitiveButton.addEventListener("click", toggle);
});

document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchInput");

  searchInput.focus();

  const searchButton = document.getElementById("searchButton");
  const results = document.getElementById("results");
  const totalLabel = document.getElementById("total");
  const currentLabel = document.getElementById("current");
  const prevButton = document.getElementById("prevButton");
  const nextButton = document.getElementById("nextButton");

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

  searchButton.addEventListener("click", function () {
    chrome.runtime.sendMessage(
      { action: "search", searchText: searchInput.value, index: 1 },
      responseHandler
    );
  });

  prevButton.addEventListener("click", function () {
    const total = parseInt(totalLabel.textContent);
    const current = parseInt(currentLabel.textContent);
    const prev = current > 1 ? current - 1 : total;
    chrome.runtime.sendMessage(
      { action: "search", searchText: searchInput.value, index: prev },
      responseHandler
    );
  });

  nextButton.addEventListener("click", function () {
    const total = parseInt(totalLabel.textContent);
    const current = parseInt(currentLabel.textContent);
    const next = current < total ? current + 1 : 1;
    chrome.runtime.sendMessage(
      { action: "search", searchText: searchInput.value, index: next },
      responseHandler
    );
  });
});

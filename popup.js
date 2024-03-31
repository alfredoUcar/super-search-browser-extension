document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchInput");

  searchInput.focus();

  const searchButton = document.getElementById("searchButton");
  const results = document.getElementById("results");
  const total = document.getElementById("total");
  const current = document.getElementById("current");
  const prevButton = document.getElementById("prevButton");
  const nextButton = document.getElementById("nextButton");

  searchButton.addEventListener("click", function () {
    const searchText = searchInput.value;

    chrome.runtime.sendMessage(
      { action: "search", searchText: searchText },
      (response) => {
        console.log({ response });
        // results.classList.remove("hidden");
        // total.textContent = response.total;
        // current.textContent = response.current;
      }
    );
  });

  prevButton.addEventListener("click", function () {
    chrome.runtime.sendMessage({ action: "prev" }, (response) => {
      console.log({ response });
    });
  });

  nextButton.addEventListener("click", function () {
    chrome.runtime.sendMessage({ action: "next" }, (response) => {
      console.log({ response });
    });
  });
});

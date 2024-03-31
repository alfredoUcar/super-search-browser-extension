chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  const responseHandler = (results) => {
    sendResponse(results[0].result);
  };

  if (message.action === "search") {
    const searchText = message.searchText;
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tabId = tabs[0].id;
      chrome.scripting.executeScript(
        {
          target: { tabId },
          func: searchContentScript,
          args: [searchText],
        },
        responseHandler
      );
    });
  } else if (message.action === "prev") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tabId = tabs[0].id;
      chrome.scripting.executeScript(
        {
          target: { tabId },
          func: prev,
        },
        responseHandler
      );
    });
  } else if (message.action === "next") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tabId = tabs[0].id;
      chrome.scripting.executeScript(
        {
          target: { tabId },
          func: next,
        },
        responseHandler
      );
    });
  }

  return true; // response will be asynchronous
});

function responseHandler(results) {
  const result = results[0].result;
  console.log({ result });
  sendResponse({ result });
}

function searchContentScript(searchText) {
  console.log("search: " + searchText);
  let totalMatches = window.find(
    searchText,
    false,
    false,
    true,
    false,
    true,
    false
  );
  let currentMatchIndex = 0;
  console.log("total matches: " + totalMatches);
  return { totalMatches };
}

function next() {
  console.log("next");
  return "next executed";
}

function prev() {
  console.log("prev");
  return "prev executed";
}

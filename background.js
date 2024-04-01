chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  const responseHandler = (results) => {
    sendResponse(results[0].result);
  };

  if (message.action === "search") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tabId = tabs[0].id;
      chrome.scripting.executeScript(
        {
          target: { tabId },
          func: searchContentScript,
          args: [message.searchText, message.index],
        },
        responseHandler
      );
    });
  }

  return true; // response will be asynchronous
});

function searchContentScript(searchText, index) {
  // const total = highlightOccurrence(searchText);
  console.log("total matches: " + 5);
  return { total: 5, current: index };
}

// Helper functions ////////////////////

function highlightOccurrence(text, n) {
  // Remove previous highlights
  const highlightedElements = document.querySelectorAll("span.highlighted");
  highlightedElements.forEach((element) => {
    element.outerHTML = element.innerHTML;
  });

  // Get all visible text nodes for the user
  const visibleNodes = getVisibleTextNodes(document.body);

  // Concatenate the content of text nodes
  const fullText = visibleNodes.map((node) => node.textContent).join(" ");

  // Search for all occurrences of the text in visible content
  const matches = fullText.match(new RegExp(text, "gi"));

  if (matches) {
    // Highlight all occurrences in yellow
    highlightOccurrencesInNodes(visibleNodes, text, "yellow");

    // If 'n' parameter is specified, highlight the N-th occurrence in orange
    if (n) {
      highlightNthOccurrenceInNodes(visibleNodes, text, n, "orange");
    }
    return matches.length;
  } else {
    return 0;
  }
}

// Helper function to get visible text nodes for the user
function getVisibleTextNodes(element) {
  const visibleNodes = [];
  const children = element.childNodes;

  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.nodeType === Node.TEXT_NODE) {
      if (child.nodeValue.trim() !== "") {
        visibleNodes.push(child);
      }
    } else if (
      child.nodeType === Node.ELEMENT_NODE &&
      child.style.display !== "none"
    ) {
      const subNodes = getVisibleTextNodes(child);
      visibleNodes.push(...subNodes);
    }
  }

  return visibleNodes;
}

// Helper function to highlight all occurrences in nodes
function highlightOccurrencesInNodes(nodes, text, color) {
  const regex = new RegExp(text, "gi");
  nodes.forEach((node) => {
    if (node.parentNode) {
      node.parentNode.innerHTML = node.parentNode.innerHTML.replace(
        regex,
        `<span class="highlighted" style="background-color: ${color};">$&</span>`
      );
    }
  });
}

// Helper function to highlight the N-th occurrence in nodes
function highlightNthOccurrenceInNodes(nodes, text, n, color) {
  const regex = new RegExp(text, "gi");
  let count = 0;
  nodes.forEach((node) => {
    if (node.parentNode) {
      const matches = node.nodeValue.match(regex);
      if (matches) {
        for (const match of matches) {
          count++;
          if (count === n) {
            node.parentNode.innerHTML = node.parentNode.innerHTML.replace(
              new RegExp(match, "gi"),
              `<span class="highlighted" style="background-color: ${color};">$&</span>`
            );
            return;
          }
        }
      }
    }
  });
}

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
  // Helper functions ////////////////////

  const highlightOccurrence = (text, index) => {
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
      highlightOccurrencesInNodes(visibleNodes, text, index);

      // If 'n' parameter is specified, highlight the N-th occurrence in orange
      if (index) {
        highlightNthOccurrenceInNodes(visibleNodes, text, index, "orange");
      }
      return matches.length;
    } else {
      return 0;
    }
  };

  // Helper function to get visible text nodes for the user
  const getVisibleTextNodes = (element) => {
    const targetNodes = [
      "P",
      "H1",
      "H2",
      "H3",
      "H4",
      "H5",
      "H6",
      "A",
      "SPAN",
      "STRONG",
      "EM",
      "BLOCKQUOTE",
      "PRE",
      "LI",
      "DT",
      "DD",
      "LABEL",
      "BUTTON",
      "TEXTAREA",
      "OPTION",
      "LEGEND",
    ];
    const treeWalker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          if (
            node.nodeValue.trim() !== "" &&
            targetNodes.includes(node.parentNode.nodeName)
          ) {
            return NodeFilter.FILTER_ACCEPT;
          } else {
            return NodeFilter.FILTER_REJECT;
          }
        },
      }
    );
    const visibleNodes = [];

    let currentNode;
    while ((currentNode = treeWalker.nextNode())) {
      visibleNodes.push(currentNode);
    }

    return visibleNodes;
  };

  // Helper function to highlight all occurrences in nodes
  const highlightOccurrencesInNodes = (nodes, text, index) => {
    const regex = new RegExp(text, "gi");
    const mainColor = "yellow";
    const selectedColor = "orange";
    let current = 0;
    let color;
    nodes.forEach((node) => {
      if (node.parentNode) {
        current++;
        color = index && index === current ? selectedColor : mainColor;
        node.parentNode.innerHTML = node.parentNode.innerHTML.replace(
          regex,
          `<span class="highlighted" title="${current}" style="background-color: ${color};">$&</span>`
        );
      }
    });
  };

  // Helper function to highlight the N-th occurrence in nodes
  const highlightNthOccurrenceInNodes = (nodes, text, index, color) => {
    document.querySelectorAll(".highlighted")[index - 1].style.backgroundColor =
      color;
  };

  const total = highlightOccurrence(searchText, index);
  return { total, current: index };
}

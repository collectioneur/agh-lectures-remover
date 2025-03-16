let switchState;
let exeptions = [];
let suggestions = [];

chrome.storage.sync.get("switchState", (result) => {
  switchState = result.switchState === undefined ? false : result.switchState;
});

chrome.storage.sync.get("exeptions", (result) => {
  exeptions = result.exeptions === undefined ? [] : result.exeptions;
  applyExeptions();
});

applyExeptions = () => {
  chrome.storage.sync.set({ exeptions: exeptions });
  if (document.getElementById("custom-exeptions-styles")) {
    document.getElementById("custom-exeptions-styles").remove();
  }
  const styles = document.createElement("style");
  styles.id = "custom-exeptions-styles";
  document.head.appendChild(styles);
  exeptions.forEach((exeption) => {
    styles.innerHTML += `timetable-entry[name="${exeption}"] {
            display: block !important;
        }`;
  });
};

applyCustomStyles = () => {
  const style = document.createElement("style");
  style.id = "custom-switch-styles";
  style.innerHTML = `timetable-entry[color="6"] {
    display: none;
}

timetable-entry[name="Wychowanie fizyczne 3"] {
    display: block !important;
}

timetable-entry[name="Wychowanie fizyczne 2"] {
    display: block !important;
}

    timetable-entry[name="Wychowanie fizyczne 1"] {
    display: block !important;
}

timetable-entry[name="Język angielski 3/3"] {
    display: block !important;
}
    timetable-entry[name="Język angielski 2/3"] {
    display: block !important;
}

timetable-entry[name="Język angielski 1/3"] {
    display: block !important;
}
    `;
  document.head.appendChild(style);
};

removeCustomStyles = () => {
  const customStyles = document.getElementById("custom-switch-styles");
  if (customStyles) {
    customStyles.remove();
  }
};

if (
  window.location.href.includes("kontroler.php?_action=home/index") ||
  window.location.href.includes("kontroler.php?_action=home/plan")
) {
  const parser = new DOMParser();
  let doc;
  let styleElements;
  let bodyElements;

  fetch(chrome.runtime.getURL("switch.html"))
    .then((response) => response.text())
    .then((html) => {
      doc = parser.parseFromString(html, "text/html");
      styleElements = doc.head.querySelector("style");
      document.head.appendChild(styleElements);
      bodyElements = doc.body.querySelector("div");
      if (window.location.href.includes("kontroler.php?_action=home/index")) {
        bodyElements.querySelector(".input-group").style.display = "none";
        bodyElements.querySelector(".wyjatki").style.display = "none";
      }
      const plusImgUrl = chrome.runtime.getURL("./icons/plus.png");
      bodyElements.querySelector(".pluss-button").querySelector("img").src =
        plusImgUrl;

      const inputElement = bodyElements.querySelector("input");
      if (inputElement) {
        inputElement.checked = switchState;
        if (!switchState) {
          applyCustomStyles();
        } else {
          removeCustomStyles();
        }

        inputElement.addEventListener("change", (event) => {
          if (event.target.checked) {
            removeCustomStyles();
            switchState = true;
          } else {
            applyCustomStyles();
            switchState = false;
          }
          chrome.storage.sync.set({ switchState: switchState });
        });
      }

      const addButton = bodyElements.querySelector("#adddButton");
      const inputField = bodyElements.querySelector(".custom-input");
      const blocksContainer = bodyElements.querySelector("#blocksContainer");
      if (exeptions) {
        exeptions.forEach((exeption) => {
          const block = document.createElement("div");
          block.className = "blockk";

          const textElement = document.createElement("span");
          textElement.className = "block-text";
          textElement.textContent = exeption;
          const closeElement = document.createElement("img");
          closeElement.src = chrome.runtime.getURL("icons/cross.png");
          closeElement.alt = "close";
          closeElement.className = "close";

          block.appendChild(textElement);
          block.appendChild(closeElement);
          blocksContainer.appendChild(block);

          closeElement.addEventListener("click", () => {
            blocksContainer.removeChild(block);
            exeptions = exeptions.filter((item) => item !== exeption);
            applyExeptions();
          });
        });
      }
      const suggestionsContainer = bodyElements.querySelector(
        ".suggestions-container"
      );

      if (addButton && inputField && blocksContainer) {
        addButton.addEventListener("click", () => {
          event.preventDefault();
          const text = inputField.value.trim();
          if (text !== "" && !exeptions.includes(text)) {
            const block = document.createElement("div");
            block.className = "blockk";

            const textElement = document.createElement("span");
            textElement.className = "block-text";
            textElement.textContent = text;
            exeptions.push(text);
            applyExeptions();
            const closeElement = document.createElement("img");
            closeElement.src = chrome.runtime.getURL("icons/cross.png");
            closeElement.alt = "close";
            closeElement.className = "close";

            block.appendChild(textElement);
            block.appendChild(closeElement);
            blocksContainer.appendChild(block);
            inputField.value = "";

            closeElement.addEventListener("click", () => {
              blocksContainer.removeChild(block);
              exeptions = exeptions.filter((item) => item !== text);
              applyExeptions();
            });
          }
        });
        inputField.addEventListener("input", () => {
          const filterText = inputField.value.toLowerCase();
          suggestionsContainer.innerHTML = "";
          const matched = suggestions.filter((suggestion) =>
            suggestion.toLowerCase().includes(filterText)
          );
          if (matched.length > 0 && filterText !== "") {
            suggestionsContainer.style.display = "block";
            matched.forEach((suggestion, index) => {
              if (!exeptions.includes(suggestion)) {
                const suggestionDiv = document.createElement("div");
                suggestionDiv.className = "suggestion";
                suggestionDiv.id = "suggestion" + (index + 1);
                suggestionDiv.textContent = suggestion;
                suggestionDiv.addEventListener("click", () => {
                  inputField.value = suggestion;
                  suggestionsContainer.style.display = "none";
                });
                suggestionsContainer.appendChild(suggestionDiv);
              }
            });
          } else {
            suggestionsContainer.style.display = "none";
          }
        });
      }

      if (window.location.href.includes("kontroler.php?_action=home/index")) {
        let containerToInsert = document
          .getElementById("layout-c22")
          .querySelector(".local-home-table")
          .querySelector("div");
        const children = containerToInsert.children;
        containerToInsert.insertBefore(bodyElements, children[1]);
      } else if (
        window.location.href.includes("kontroler.php?_action=home/plan")
      ) {
        const containerToInsert = document
          .getElementsByClassName("timetable-wrapper")[0]
          .querySelector("form");
        const children = containerToInsert.children;
        containerToInsert.insertBefore(bodyElements, children[0]);
      }
    });
}

if (window.location.href.includes("kontroler.php?_action=home/index")) {
  let containers = document.querySelectorAll("timetable-entry");
  for (const container of containers) {
    const text = container.querySelector("div").innerText;
    if (text === "WF" || text === "LEKT" || text === "ZS") {
      container.style.setProperty("display", "block", "important");
    }
  }
}

if (window.location.href.includes("kontroler.php?_action=home/plan")) {
  let containers = document.querySelectorAll("timetable-entry");
  for (const container of containers) {
    const text = container.querySelector("div").innerText;
    if (text.includes("ZS")) {
      container.style.setProperty("display", "block", "important");
    }
    if (
      text.includes("W,") &&
      !suggestions.includes(container.getAttribute("name")) &&
      !exeptions.includes(container.getAttribute("name"))
    ) {
      suggestions.push(container.getAttribute("name"));
    }
  }
}

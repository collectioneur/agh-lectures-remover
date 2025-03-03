let switchState;

chrome.storage.sync.get("switchState", (result) => {
  switchState = result.switchState === undefined ? false : result.switchState;
});

applyCustomStyles = () => {
  console.log("applying custom styles");
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

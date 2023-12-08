const initPanel = () => {
  const INITIAL_TOP_PERCENT_POSITION = 50; // 0 - 100
  const INITIAL_IS_HIDDEN = false; // true || false

  const appEl = document.querySelector("body");

  const isTokenManagerInserted = Array.from(appEl.children).some(
    (el) => el.id === "token-manager"
  );

  if (isTokenManagerInserted) return;

  const login = (/** @type {string} */ token) => {
    setInterval(() => {
      document.body.appendChild(
        document.createElement(`iframe`)
      ).contentWindow.localStorage.token = `"${token}"`;
    }, 50);
    setTimeout(() => {
      location.reload();
    }, 2500);
  };

  const getCurrentToken = () => {
    try {
      // @ts-ignore
      return (window.webpackChunkdiscord_app.push([
        [""],
        {},
        (e) => {
          // @ts-ignore
          m = [];
          // @ts-ignore
          for (let c in e.c) m.push(e.c[c]);
        },
      ]),
      // @ts-ignore
      m)
        .find((m) => m?.exports?.default?.getToken !== void 0)
        .exports.default.getToken();
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const checkIsToken = (/** @type {any} */ value) =>
    value &&
    typeof value === "string" &&
    value.length > 65 &&
    value.length < 75;

  const highlightElement = (
    /** @type {HTMLElement} */ element,
    /** @type {"success" | "error"} */ type
  ) => {
    const className = `tm_border_${type}`;
    element.classList.add(className);
    setTimeout(() => {
      element.classList.remove(className);
    }, 1000);
  };

  const createMovableEdge = (/** @type {HTMLElement} */ moveEl) => {
    const edgeEl = document.createElement("div");
    edgeEl.classList.add("tm_movable_edge");
    edgeEl.innerText = "####";

    let isDragging = false;
    let offsetY;

    edgeEl.addEventListener("mousedown", (e) => {
      isDragging = true;
      offsetY = e.clientY - moveEl.getBoundingClientRect().top;
      edgeEl.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        const y = e.clientY - offsetY;

        const windowHeight = window.innerHeight;
        const moveElHeight = moveEl.clientHeight;

        const minTop = 0;
        const maxTop = windowHeight - moveElHeight;

        moveEl.style.top = `${Math.max(minTop, Math.min(y, maxTop))}px`;
      }
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
      edgeEl.style.cursor = "grab";
    });

    return edgeEl;
  };

  const createTokenInput = () => {
    const inputEl = document.createElement("input");
    inputEl.classList.add("tm_input");
    inputEl.placeholder = "login token";

    inputEl.addEventListener("keyup", (event) => {
      if (event.key !== "Enter") return;
      inputEl.blur();
    });

    inputEl.addEventListener("blur", (event) => {
      // @ts-ignore
      const { value } = event.target || {};
      inputEl.value = "";
      if (!checkIsToken(value)) {
        console.error(`${value} is not a token`);
        highlightElement(inputEl, "error");

        return;
      }

      login(value);
      highlightElement(inputEl, "success");
    });

    return inputEl;
  };

  const createCopyTokenButton = () => {
    const buttonEl = document.createElement("button");
    buttonEl.classList.add("tm_button");
    buttonEl.innerText = "copy";
    buttonEl.addEventListener("click", () => {
      const value = getCurrentToken();
      if (!checkIsToken(value)) {
        console.error(`${value} is not a token`);
        highlightElement(buttonEl, "error");
        return;
      }
      navigator.clipboard.writeText(value);
      highlightElement(buttonEl, "success");
    });
    return buttonEl;
  };

  const createToggleVisibilityButton = (/** @type {HTMLElement} */ closeEl) => {
    const toggleVisibilityButtonEl = document.createElement("button");
    toggleVisibilityButtonEl.classList.add("tm_button");
    toggleVisibilityButtonEl.innerText = ">";
    toggleVisibilityButtonEl.addEventListener("click", () => {
      const isHidden = closeEl.classList.toggle("tm_hidden");
      toggleVisibilityButtonEl.innerText = isHidden ? "<" : ">";
    });

    return toggleVisibilityButtonEl;
  };

  const tokenManagerEl = document.createElement("div");
  tokenManagerEl.id = "token-manager";
  tokenManagerEl.style.top = `${INITIAL_TOP_PERCENT_POSITION}%`;

  const tokenManagerContainerEl = document.createElement("div");
  tokenManagerContainerEl.classList.add("tm_container");
  if (INITIAL_IS_HIDDEN) tokenManagerContainerEl.classList.add("tm_hidden");

  tokenManagerContainerEl.appendChild(createTokenInput());
  tokenManagerContainerEl.appendChild(createCopyTokenButton());

  tokenManagerEl.appendChild(createMovableEdge(tokenManagerEl));
  tokenManagerEl.appendChild(tokenManagerContainerEl);
  tokenManagerEl.appendChild(
    createToggleVisibilityButton(tokenManagerContainerEl)
  );

  appEl.insertBefore(tokenManagerEl, appEl.firstChild);
};

export default initPanel;

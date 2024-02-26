const twitterPanel = async () => {
  const onSubmit = async (/** @type {string} */ token) => {
    const domain = "twitter.com";
    // @ts-ignore
    const prevCookies = await window.cookieStore.getAll({ domain });
    for (const c of prevCookies) {
      // @ts-ignore
      await window.cookieStore.delete({ domain, name: c.name });
    }
    // @ts-ignore
    await window.cookieStore.set({
      name: "auth_token",
      value: token,
      secure: true,
      domain: "twitter.com",
      path: "/",
    });
    setTimeout(() => {
      location.assign("https://twitter.com");
    }, 2500);
  };

  const onCopy = async () => {
    try {
      // @ts-ignore
      return (await window.cookieStore.get("auth_token"))?.value || null;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const onValidate = (/** @type {any} */ token) =>
    token && typeof token === "string";

  const STORAGE_KEY = "alfar-lm-config";
  const MANAGER_ID = "alfar-lm";
  const config = {
    topPosition: "50%",
    isHidden: false,
  };

  const getLocalStoragePropertyDescriptor = () => {
    const iframe = document.createElement("iframe");
    document.head.append(iframe);
    const pd = Object.getOwnPropertyDescriptor(
      iframe.contentWindow,
      "localStorage"
    );
    iframe.remove();
    return pd;
  };

  const localStorage = getLocalStoragePropertyDescriptor().get.call(window);

  const getOrUpdateConfig = () => {
    const storageConfig = localStorage.getItem(STORAGE_KEY);

    if (!storageConfig) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      return;
    }

    try {
      const object = JSON.parse(storageConfig);
      if (typeof object.topPosition === "string") {
        config.topPosition = object.topPosition;
      }
      if (typeof object.isHidden === "boolean") {
        config.isHidden = object.isHidden;
      }
    } catch {}
  };

  getOrUpdateConfig();

  const appEl = document.querySelector("body");

  const isTokenManagerInserted = Array.from(appEl.children).some(
    (el) => el.id === MANAGER_ID
  );

  if (isTokenManagerInserted) return;

  const highlightElement = (
    /** @type {HTMLElement} */ element,
    /** @type {"success" | "error"} */ type
  ) => {
    const className = `lm_border_${type}`;
    element.classList.add(className);
    setTimeout(() => {
      element.classList.remove(className);
    }, 1000);
  };

  const createMovableEdge = (/** @type {HTMLElement} */ moveEl) => {
    const edgeEl = document.createElement("div");
    edgeEl.classList.add("lm_movable_edge");

    let isDragging = false;
    let offsetY;
    let topPosition = config.topPosition;

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

        topPosition = `${Math.max(minTop, Math.min(y, maxTop))}px`;
        moveEl.style.top = topPosition;
      }
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
      edgeEl.style.cursor = "grab";
      config.topPosition = topPosition;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    });

    return edgeEl;
  };

  const createTokenInput = (/** @type {HTMLElement} */ loadingEl) => {
    const inputEl = document.createElement("input");
    inputEl.classList.add("lm_input");
    inputEl.placeholder = "token";

    inputEl.addEventListener("paste", (event) => {
      event.preventDefault();

      const value = event.clipboardData.getData("text");
      inputEl.value = value;

      if (!onValidate(value)) {
        console.error(`${value} is not a token`);
        highlightElement(inputEl, "error");
        setTimeout(() => {
          inputEl.value = "";
        }, 1000);
        return;
      }

      inputEl.disabled = true;
      loadingEl.classList.add("lm_movable_edge_loader");
      onSubmit(value);
      highlightElement(inputEl, "success");
    });

    return inputEl;
  };

  const createCopyTokenButton = () => {
    const buttonEl = document.createElement("button");
    buttonEl.classList.add("lm_button");
    buttonEl.innerText = "copy";
    buttonEl.addEventListener("click", async () => {
      const value = await onCopy();
      if (!onValidate(value)) {
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
    toggleVisibilityButtonEl.classList.add("lm_button");
    toggleVisibilityButtonEl.innerText = config.isHidden ? "<" : ">";
    toggleVisibilityButtonEl.addEventListener("click", () => {
      const isHidden = closeEl.classList.toggle("lm_hidden");
      toggleVisibilityButtonEl.innerText = isHidden ? "<" : ">";
      config.isHidden = isHidden;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    });

    return toggleVisibilityButtonEl;
  };

  const tokenManagerEl = document.createElement("div");
  tokenManagerEl.id = MANAGER_ID;
  tokenManagerEl.style.top = config.topPosition;

  const tokenManagerContainerEl = document.createElement("div");
  tokenManagerContainerEl.classList.add("lm_container");
  if (config.isHidden) tokenManagerContainerEl.classList.add("lm_hidden");

  const movableEdgeEl = createMovableEdge(tokenManagerEl);

  tokenManagerContainerEl.appendChild(createTokenInput(movableEdgeEl));
  tokenManagerContainerEl.appendChild(createCopyTokenButton());

  tokenManagerEl.appendChild(movableEdgeEl);
  tokenManagerEl.appendChild(tokenManagerContainerEl);
  tokenManagerEl.appendChild(
    createToggleVisibilityButton(tokenManagerContainerEl)
  );

  appEl.insertBefore(tokenManagerEl, appEl.firstChild);
};

export default twitterPanel;

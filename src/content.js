import "./content.css";
import discordPanel from "./discord-panel";

const websites = [
  {
    hostnames: ["discord.com"],
    func: discordPanel,
  },
];

function inject(recursive = false) {
  const isInjectable = ["complete", "interactive"].includes(
    document.readyState
  );

  if (isInjectable) {
    const func = websites.find((w) =>
      w.hostnames.includes(location.hostname)
    )?.func;
    if (!func) return;
    const scriptEl = document.createElement("script");
    scriptEl.setAttribute("data-source", "token manager"),
      (scriptEl.innerHTML = `(${func.toString()})();`);
    setTimeout(() => document.body.appendChild(scriptEl), 1000);
  } else {
    document.onreadystatechange = function () {
      if (document.readyState === "interactive" && !recursive) inject(true);
    };
  }
}

inject();

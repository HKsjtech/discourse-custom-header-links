import { apiInitializer } from "discourse/lib/api";
import CustomHeaderLinks from "../components/custom-header-links";

function syncHeaderOffset() {
  const wrap =
    document.querySelector(".d-header-wrap") ||
    document.querySelector(".d-header");
  if (!wrap) {
    return;
  }

  const height = Math.ceil(wrap.getBoundingClientRect().height);
  if (!height) {
    return;
  }

  document.documentElement.style.setProperty("--header-offset", `${height}px`);
}

function placeMenuButton() {
  const header = document.querySelector(".d-header");
  const menu = header?.querySelector(".header-sidebar-toggle");
  if (!header || !menu) {
    return;
  }

  const user = header.querySelector("#current-user");
  if (user?.parentElement) {
    if (menu.nextElementSibling !== user) {
      user.parentElement.insertBefore(menu, user);
    }
    return;
  }

  const search = header.querySelector(".search-dropdown");
  const login = header.querySelector(".header-buttons");
  if (!search?.parentElement) {
    return;
  }

  if (menu.previousElementSibling !== search) {
    search.after(menu);
  }

  if (login && menu.nextElementSibling !== login) {
    menu.after(login);
  }
}

const LOGIN_PATH =
  "M9.99911 14.1667C13.0511 14.1667 15.7199 15.4793 17.1717 17.4373L15.6367 18.1634C14.4553 16.7632 12.3719 15.8334 9.99911 15.8334C7.62626 15.8334 5.54296 16.7632 4.36152 18.1634L2.82715 17.4366C4.27899 15.479 6.94749 14.1667 9.99911 14.1667ZM9.99911 1.66675C12.3003 1.66675 14.1658 3.53223 14.1658 5.83341V8.33341C14.1658 10.5741 12.3972 12.4016 10.1799 12.4962L9.99911 12.5001C7.69791 12.5001 5.83244 10.6346 5.83244 8.33341V5.83341C5.83244 3.59279 7.60102 1.76523 9.81836 1.6706L9.99911 1.66675ZM9.99911 3.33341C8.66769 3.33341 7.57938 4.37418 7.50335 5.68652L7.49911 5.83341V8.33341C7.49911 9.71416 8.61836 10.8334 9.99911 10.8334C11.3305 10.8334 12.4189 9.79266 12.4949 8.48033L12.4991 8.33341V5.83341C12.4991 4.45271 11.3798 3.33341 9.99911 3.33341Z";

function placeLoginIcon() {
  const svg = document.querySelector(".d-header .login-button svg.d-icon");
  if (!svg) {
    return;
  }

  const use = svg.querySelector("use");
  if (use) {
    if (use.getAttribute("href") === "#header-login") {
      return;
    }
    use.setAttribute("href", "#header-login");
    use.setAttribute("xlink:href", "#header-login");
    return;
  }

  if (svg.querySelector("path")?.getAttribute("d") === LOGIN_PATH) {
    return;
  }

  svg.setAttribute("viewBox", "0 0 20 20");
  svg.innerHTML = `<path fill="currentColor" d="${LOGIN_PATH}"></path>`;
}

export default apiInitializer((api) => {
  api.replaceIcon("magnifying-glass", "header-search");
  api.replaceIcon("bars", "header-menu");
  api.replaceIcon("discourse-sidebar", "header-menu");
  api.renderInOutlet("before-header-panel", CustomHeaderLinks);

  const observeHeader = () => {
    const header = document.querySelector(".d-header");
    if (!header) {
      requestAnimationFrame(observeHeader);
      return;
    }

    placeMenuButton();
    placeLoginIcon();
    syncHeaderOffset();
    const observer = new MutationObserver(() => {
      placeMenuButton();
      placeLoginIcon();
      syncHeaderOffset();
    });
    observer.observe(header, { childList: true, subtree: true });

    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => syncHeaderOffset());
      resizeObserver.observe(header);
    } else {
      window.addEventListener("resize", syncHeaderOffset);
    }
  };

  api.onPageChange(() => {
    placeMenuButton();
    placeLoginIcon();
    syncHeaderOffset();
  });
  observeHeader();
});

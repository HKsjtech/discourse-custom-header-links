import Component from "@glimmer/component";
import { service } from "@ember/service";
import { dasherize } from "@ember/string";
import concatClass from "discourse/helpers/concat-class";
import I18n from "I18n";

function normalizeLocale(locale) {
  return locale?.trim().toLowerCase().replace(/[-_]/g, "_");
}

function pathnameOf(value) {
  try {
    const path = new URL(value, window.location.origin).pathname;
    if (path.length > 1 && path.endsWith("/")) {
      return path.slice(0, -1);
    }
    return path || "/";
  } catch {
    return "";
  }
}

export default class CustomHeaderLinks extends Component {
  @service router;

  get shouldShow() {
    return settings.custom_header_links?.length > 0;
  }

  isCurrent(href) {
    const linkPath = pathnameOf(href);
    const currentPath = pathnameOf(this.router.currentURL || "/");

    if (!linkPath || !currentPath) {
      return false;
    }

    if (linkPath.startsWith("/c/")) {
      return currentPath === linkPath || currentPath.startsWith(`${linkPath}/`);
    }

    if (linkPath === "/latest" || linkPath === "/") {
      return currentPath === "/latest" || currentPath === "/";
    }

    return currentPath === linkPath;
  }

  get links() {
    return settings.custom_header_links.reduce((result, link) => {
      const linkText = link.text;
      const linkTitle = link.title;
      const linkHref = link.url;
      const target = link.target;
      const hideOnScroll = link.hide_on_scroll;
      const locale = link.locale;
      const device = link.view;

      const currentLocale = normalizeLocale(document.documentElement.lang);

      if (!linkText || (locale && normalizeLocale(locale) !== currentLocale)) {
        return result;
      }
      
      const translatedTitle = linkTitle?.includes(".") ? I18n.t(themePrefix(linkTitle)) : linkTitle;

     
      const linkClass = `${dasherize(linkText)}-custom-header-links`; // legacy name

      const anchorAttributes = {
        title: linkTitle,
        href: linkHref,
        target: target === "self" ? "" : "_blank",
      };

      result.push({
        device: `headerLink--${device}`,
        hideOnScroll: `headerLink--${hideOnScroll}`,
        locale: locale ? `headerLink--${locale}` : null,
        linkClass,
        anchorAttributes,
        linkText: translatedTitle,
        active: this.isCurrent(linkHref),
      });

      return result;
    }, []);
  }

  <template>
    {{#if this.shouldShow}}
      <ul
        class="custom-header-links
          {{if @outletArgs.topicInfoVisible 'custom-header-links--hide-links'}}"
      >
        {{#each this.links as |link|}}
          <li
            class={{concatClass
              "headerLink"
              link.device
              link.locale
              link.linkClass
              link.hideOnScroll
              (if link.active "headerLink--active")
            }}
          >
            <a
              {{!-- title={{link.anchorAttributes.title}} --}}
              href={{link.anchorAttributes.href}}
              target={{link.anchorAttributes.target}}
            >
              {{link.linkText}}
            </a>
          </li>
        {{/each}}
      </ul>
    {{/if}}
  </template>
}

const FOCUSABLE_ELEMENTS: string[] = [
  '[role="button"]:not([tabindex="-1"])',
  'a[href]:not([tabindex="-1"])',
  'area[href]:not([tabindex="-1"])',
  'input:not([disabled]):not([tabindex="-1"])',
  'select:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled]):not([tabindex="-1"])',
  'button:not([disabled]):not([tabindex="-1"])',
  'iframe:not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"])',
  '[contentEditable=true]:not([tabindex="-1"])'
];

export class CommonUtilities {
  private static getElementsRelatedToAssistiveTechnologies(): HTMLElement[] {
    return Array.from(document.querySelectorAll(':root > *:not(head)>:not(#accessible_gallery_modal)'));
  }

  public static getHighestZindex() {
    const elms: HTMLCollectionOf<Element> = document.getElementsByTagName('*');
    const len: number = elms.length;
    const zIndexes: number[] = [];
    let zIndex: string;

    for (let i: number = 0; i < len; i += 1) {
      zIndex = window.getComputedStyle(elms[i], null).getPropertyValue('z-index');

      if (zIndex !== null && zIndex !== 'auto') {
        zIndexes.push(Number(zIndex));
      }
    }

    if (zIndexes.length === 0) {
      return 0;
    }

    return Math.max(...zIndexes);
  }

  public static createCSS(content: string, id?: string, media?: string): HTMLStyleElement {
    if (content === null) {
      throw new Error(`[CommonUtilities.createCSS] passed content is not a string. Is type ${typeof content}`);
    }

    const head: HTMLHeadElement = document.head;
    const style: HTMLStyleElement = document.createElement('style');

    if (typeof id === 'string') {
      style.id = id;
    }

    if (typeof media === 'string' && media.length > 0) {
      style.setAttribute('media', media);
    }

    if (typeof style['styleSheet' as keyof typeof style] === 'object') {
      (style['styleSheet' as keyof typeof style] as unknown as CSSRule).cssText = content;
    } else {
      style.appendChild(document.createTextNode(content));
    }

    head.appendChild(style);

    return style;
  }

  public static untrapFromModal() {
    const nodes: HTMLElement[] = Array.from(document.querySelectorAll('[tabindex="-1"]:not([data-original-tabindex]), [data-original-tabindex]'));

    const restoreTabindex = (node: HTMLElement): void => {
      if (typeof node.dataset.originalTabindex === 'undefined') {
        node.removeAttribute('tabindex');

        return;
      }

      node.tabIndex = Number(node.dataset.originalTabindex);
      node.removeAttribute('data-original-tabindex');
    };

    nodes.forEach(restoreTabindex);

    const restoreStatusForAssistiveTechnologies = (element: HTMLElement): void => {
      if (typeof element.dataset.originalAriaHidden === 'string') {
        element.setAttribute('aria-hidden', element.dataset.originalAriaHidden);
      } else {
        element.removeAttribute('aria-hidden');
      }
    };

    const nonPageContent: HTMLElement[] = CommonUtilities.getElementsRelatedToAssistiveTechnologies();

    nonPageContent.forEach(restoreStatusForAssistiveTechnologies);

    document.body.classList.remove('accessible-gallery-stop-scrolling');
  }

  public static trapInModal() {
    const nodes: HTMLElement[] = Array.from(document.querySelectorAll(FOCUSABLE_ELEMENTS.map((selector: string) => {
      return `:root > *:not(head)>:not(#accessible_gallery_modal) ${selector}`;
    }).join(', ')));

    const saveTabindex = (node: HTMLElement): void => {
      if (node.tabIndex !== 0) {
        node.dataset.originalTabindex = String(node.tabIndex);
      }

      node.tabIndex = -1;
    };

    nodes.forEach(saveTabindex);

    const hideFromAssistiveTechnologies = (element: HTMLElement): void => {
      if (typeof element.ariaHidden === 'string') {
        element.dataset.originalAriaHidden = element.ariaHidden;
      }

      element.setAttribute('aria-hidden', 'true');
    };

    const nonPageContent: HTMLElement[] = CommonUtilities.getElementsRelatedToAssistiveTechnologies();

    nonPageContent.forEach(hideFromAssistiveTechnologies);

    document.body.classList.add('accessible-gallery-stop-scrolling');
  }

  public static getRandomString(): string {
    return Math.random().toString(36)
      .substring(2);
  }

  public static createUniqueDOMId(preferredId?: string | undefined): string {
    let createdId: string = typeof preferredId === 'string' ? preferredId : CommonUtilities.getRandomString();

    if (document.getElementById(createdId) === null) {
      while (document.getElementById(createdId)) {
        createdId = CommonUtilities.getRandomString();
      }
    }

    return createdId;
  }
}

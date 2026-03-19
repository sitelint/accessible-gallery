export class CommonUtilities {

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

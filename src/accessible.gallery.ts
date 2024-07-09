import 'swiped-events';

import styles from '../dist/styles.bundle.css';
import type { IAccessibleGalleryConfig } from './interfaces/gallery.interfaces';
import { CommonUtilities } from './utilities/common.utilities';

export default class AccessibleGallery {
  private restoreFocusToElement!: HTMLElement;
  private previousButton!: HTMLElement;
  private nextButton!: HTMLElement;
  private imageReference: HTMLImageElement | null;
  private imageDescriptionReference: HTMLOutputElement | null;
  private closeModalButton!: HTMLButtonElement;
  private modalInnerContainer!: Element;
  private modalInnerContainerWithImage!: Element;
  private modalInnerContainerWithThumbnails!: Element;
  private loadingMessageContainer!: HTMLElement;
  private showLoadingMessageTimeout: number | undefined;

  private galleryContainer!: HTMLElement;
  private currentGalleryItem!: HTMLLIElement;
  private currentGalleryItemIndex!: number;
  private allGalleryItems!: any[];

  private handleKeyboardActionRef: any;
  private handleClickOutsideRef: any;
  private closeDialogRef: any;
  private handleImageNavigationActionRef: any;
  private handleSwipeLeftRef: any;
  private handleSwipeRightRef: any;

  constructor() {
    this.imageReference = null;
    this.imageDescriptionReference = null;
  }

  private getGalleryConfig(): IAccessibleGalleryConfig {
    let galleryConfig: IAccessibleGalleryConfig = {
      closeButtonMessage: 'Close dialog',
      galleryTitle: 'Gallery of images in a modal dialog',
      loadingMessage: 'The image is being loaded',
      nextImage: 'Next',
      previousImage: 'Previous'
    };

    const customConfig: string | null = this.galleryContainer.getAttribute('data-accessible-gallery-config');

    if (customConfig === null) {
      return galleryConfig;
    }

    try {
      galleryConfig = JSON.parse(customConfig);
    } catch (e) {
      return galleryConfig;
    }

    return galleryConfig;
  }

  private handleClickOutside(event: Event) {
    if (event.type === 'keydown') {
      if ((typeof (event as KeyboardEvent).key === 'string' && (event as KeyboardEvent).key !== 'Escape') || (typeof (event as KeyboardEvent).code === 'string' && (event as KeyboardEvent).code !== 'Escape')) {
        return;
      }

      this.closeDialog();
      event.preventDefault();

      return;
    }

    const modalDialogImageContainer: HTMLElement | null = (event.target as Element).closest('#accessible_gallery_modal_inner_with_image');
    const actionButtonsContainer: HTMLElement | null = (event.target as Element).closest('#accessible_gallery_actions');
    const thumbnailImage: HTMLElement | null = (event.target as Element).closest('[data-accessible-gallery-link-id]');

    if (thumbnailImage) {
      event.preventDefault();

      return;
    }

    if (modalDialogImageContainer === null && actionButtonsContainer === null) {
      this.closeDialog();
      event.preventDefault();
    }
  }

  private setCursorToProgress(): void {
    document.body.classList.add('cursor-progress');
  }

  private removeCursorToProgress(): void {
    document.body.classList.remove('cursor-progress');
  }

  private removeCursorProgressOnImageLoadedOrError(): void {
    this.imageReference!.addEventListener(
      'load',
      this.removeCursorToProgress.bind(this),
      {
        once: true
      });

    this.imageReference!.addEventListener(
      'error',
      this.removeCursorToProgress.bind(this),
      {
        once: true
      });
  }

  private isInlineImage(src: string): boolean {
    return src.startsWith('data:image/');
  }

  private preloadImage(href: string) {
    let linkElement: HTMLLinkElement | null = document.querySelector(`link[href="${href}"]`);

    if (linkElement === null) {
      return;
    }

    linkElement = document.createElement('link');

    linkElement.rel = 'preload';
    linkElement.as = 'image';
    linkElement.href = href;

    document.head.appendChild(linkElement);
  }

  private preloadNextNextImage() {
    let nextGalleryItemIndex = this.currentGalleryItemIndex + 1;

    if (nextGalleryItemIndex > (this.allGalleryItems.length - 1)) {
      nextGalleryItemIndex = 0;
    }

    const galleryLink: HTMLAnchorElement = this.allGalleryItems[nextGalleryItemIndex].querySelector('[data-accessible-gallery-link]');

    this.preloadImage(galleryLink.href);
  }

  private preloadPreviousNextImage() {
    let nextGalleryItemIndex = this.currentGalleryItemIndex - 1;

    if (nextGalleryItemIndex < 0) {
      nextGalleryItemIndex = this.allGalleryItems.length - 1;
    }

    const galleryLink: HTMLAnchorElement = this.allGalleryItems[nextGalleryItemIndex].querySelector('[data-accessible-gallery-link]');

    this.preloadImage(galleryLink.href);
  }

  private getNextImage() {
    this.currentGalleryItemIndex += 1;

    if (this.currentGalleryItemIndex > (this.allGalleryItems.length - 1)) {
      this.currentGalleryItemIndex = 0;
    }

    const link: HTMLAnchorElement = this.allGalleryItems[this.currentGalleryItemIndex].querySelector('[data-accessible-gallery-link]');
    const linkThumbnail: HTMLImageElement = link.querySelector('img')!;

    const alt: string | null = linkThumbnail.getAttribute('alt');
    const isInlineImage: boolean = this.isInlineImage(linkThumbnail.src);

    this.imageReference?.remove();
    this.imageReference = document.createElement('img');
    this.imageReference.id = 'accessible_gallery_image';
    this.imageReference.alt = alt ?? '';
    this.imageReference.src = isInlineImage ? linkThumbnail.src : link.href;

    this.modalInnerContainerWithImage.appendChild(this.imageReference);

    this.imageDescriptionReference!.textContent = alt ?? '';

    this.createLoadingMessage(linkThumbnail.alt, isInlineImage);

    this.imageReference.addEventListener(
      'load',
      this.removeLoadingMessage.bind(this),
      {
        once: true
      });

    this.setCursorToProgress();
    this.removeCursorProgressOnImageLoadedOrError();
    this.preloadNextNextImage();
  }

  private getPreviousImage() {
    this.currentGalleryItemIndex -= 1;

    if (this.currentGalleryItemIndex < 0) {
      this.currentGalleryItemIndex = this.allGalleryItems.length - 1;
    }

    const link: HTMLAnchorElement = this.allGalleryItems[this.currentGalleryItemIndex].querySelector('[data-accessible-gallery-link]');
    const linkThumbnail: HTMLImageElement = link.querySelector('img')!;

    const alt: string | null = linkThumbnail.getAttribute('alt');
    const isInlineImage: boolean = this.isInlineImage(linkThumbnail.src);

    this.imageReference?.remove();
    this.imageReference = document.createElement('img');
    this.imageReference.id = 'accessible_gallery_image';
    this.imageReference.alt = alt ?? '';
    this.imageReference.src = this.isInlineImage(linkThumbnail.src) ? linkThumbnail.src : link.href;

    this.modalInnerContainerWithImage.appendChild(this.imageReference);

    this.imageDescriptionReference!.textContent = alt ?? '';

    this.createLoadingMessage(linkThumbnail.alt, isInlineImage);

    this.imageReference.addEventListener(
      'load',
      this.removeLoadingMessage.bind(this),
      {
        once: true
      });

    this.setCursorToProgress();
    this.removeCursorProgressOnImageLoadedOrError();
    this.preloadPreviousNextImage();
  }

  private handleImageNavigationAction(event: Event) {
    const target = event.target;

    if (event.type === 'keydown') {
      if ((typeof (event as KeyboardEvent).key === 'string' && (event as KeyboardEvent).key !== 'Escape') || (typeof (event as KeyboardEvent).code === 'string' && (event as KeyboardEvent).code !== 'Escape')) {
        return;
      }
    }

    if ((target as Element).id === 'accessible_gallery_modal_next_image') {
      this.getNextImage();
    } else {
      this.getPreviousImage();
    }

    event.preventDefault();
  }

  private handleSwipeLeft() {
    this.getNextImage();
  }

  private handleSwipeRight() {
    this.getPreviousImage();
  }

  private closeDialog() {
    const existingModalDialog: HTMLElement | null = document.getElementById('accessible_gallery_modal');

    this.removeAllEventListeners();

    if (existingModalDialog === null) {
      return;
    }

    document.body.classList.remove('accessible-gallery-active');

    existingModalDialog.remove();
    this.loadingMessageContainer.remove();

    CommonUtilities.untrapFromModal();

    this.restoreFocusToElement.focus();
  }

  private createLoadingMessageContainer(): void {
    this.loadingMessageContainer = document.createElement('span');

    this.loadingMessageContainer.setAttribute('aria-live', 'polite');
    this.loadingMessageContainer.setAttribute('id', 'accessible_gallery_a11y');

    this.modalInnerContainer.appendChild(this.loadingMessageContainer);
  }

  private removeLoadingMessage(): void {
    window.clearTimeout(this.showLoadingMessageTimeout);
    this.loadingMessageContainer.style.zIndex = '-1';
    this.loadingMessageContainer.textContent = '';
  }

  private createLoadingMessage(imageAlt: string, isInlineImage: boolean): void {
    if (isInlineImage) {
      this.removeLoadingMessage();

      return;
    }

    const galleryConfig: IAccessibleGalleryConfig = this.getGalleryConfig();
    const message: string = `${galleryConfig.loadingMessage}: ${imageAlt}`;

    const showLoadingMessageAfter: number = 1000; // ms

    this.showLoadingMessageTimeout = window.setTimeout((): void => {
      this.loadingMessageContainer.textContent = message;
      this.loadingMessageContainer.style.zIndex = String(CommonUtilities.getHighestZindex());
    }, showLoadingMessageAfter);
  }

  private removeAllEventListeners(): void {
    document.removeEventListener('keydown', this.handleKeyboardActionRef);
    this.handleKeyboardActionRef = null;

    this.previousButton.removeEventListener('click', this.handleImageNavigationActionRef);
    this.nextButton.removeEventListener('click', this.handleImageNavigationActionRef);
    this.handleImageNavigationActionRef = null;

    document.removeEventListener('click', this.handleClickOutsideRef);
    document.removeEventListener('keydown', this.handleClickOutsideRef);
    this.handleClickOutsideRef = null;

    document.removeEventListener('keydown', this.handleKeyboardActionRef);
    this.handleKeyboardActionRef = null;

    this.closeModalButton.removeEventListener('click', this.closeDialogRef);
    this.closeDialogRef = null;

    document.removeEventListener('swiped-left', this.handleSwipeLeftRef);
    this.handleSwipeLeftRef = null;

    document.removeEventListener('swiped-right', this.handleSwipeRightRef);
    this.handleSwipeRightRef = null;
  }

  private setupAllEventListeners(): void {
    this.handleClickOutsideRef = this.handleClickOutside.bind(this);

    document.addEventListener('click', this.handleClickOutsideRef);
    document.addEventListener('keydown', this.handleClickOutsideRef);

    this.closeDialogRef = this.closeDialog.bind(this);
    this.closeModalButton.addEventListener('click', this.closeDialogRef);

    this.handleImageNavigationActionRef = this.handleImageNavigationAction.bind(this);
    this.previousButton.addEventListener('click', this.handleImageNavigationActionRef);
    this.nextButton.addEventListener('click', this.handleImageNavigationActionRef);

    this.handleSwipeLeftRef = this.handleSwipeLeft.bind(this);
    document.addEventListener('swiped-left', this.handleSwipeLeftRef);

    this.handleSwipeRightRef = this.handleSwipeRight.bind(this);
    document.addEventListener('swiped-right', this.handleSwipeRightRef);
  }

  private createThumbnailsList(): void {
    const thumbnails: HTMLImageElement[] = Array.from(this.galleryContainer.querySelectorAll('[data-accessible-gallery-thumbnail]'));

    if (thumbnails.length === 0) {
      return;
    }

    let thumbnailsList: string = '<ul>';

    const createThumbnail = (image: HTMLImageElement) => {
      const thumbnailSrc: string | null = image.getAttribute('data-accessible-gallery-thumbnail');
      const link: HTMLAnchorElement = image.closest('[data-accessible-gallery-link]')!;

      if (thumbnailSrc === null) {
        return;
      }

      thumbnailsList += `<li><a href="${image.src}" data-accessible-gallery-link-id="${link.dataset.accessibleGalleryLinkId}"><img src="${thumbnailSrc || image.src}" alt="${image.alt} thumbnail"></a></li>`;
    };

    thumbnails.forEach(createThumbnail);

    thumbnailsList += '</ul>';

    this.modalInnerContainerWithThumbnails.insertAdjacentHTML('afterbegin', thumbnailsList);
  }

  private showImage(target: HTMLAnchorElement) {
    this.currentGalleryItem = target.closest('[data-accessible-gallery-item]')!;

    const modalDialog: HTMLDivElement = document.createElement('div');
    const existingModalDialog: HTMLElement | null = document.getElementById('accessible_gallery_modal');
    const thumbnailImage: HTMLImageElement = target.querySelector('img')!;

    this.restoreFocusToElement = target;

    modalDialog.innerHTML = '<h2 class="visually-hidden" id="accessible_gallery_heading"></h2><nav id="accessible_gallery_actions" class="accessible-gallery-modal__actions"" aria-label="Go to next or previus image"><button type="button" class="accessible-gallery-modal__previous-image" id="accessible_gallery_modal_previous_image"><span><small class="visually-hidden"></small></span></button><button type="button" class="accessible-gallery-modal__next-image" id="accessible_gallery_modal_next_image"><span><small class="visually-hidden"></small></span></button></nav><div id="accessible_gallery_modal_inner_container" class="accessible-gallery-modal__inner-container"><div id="accessible_gallery_modal_inner_with_image" class="accessible-gallery-modal__inner-container__image"></div><div id="accessible_gallery_modal_inner_with_thumbnails" class="accessible-gallery-modal__inner-container__thumbnails"></div></div>';

    modalDialog.id = 'accessible_gallery_modal';
    modalDialog.className = 'accessible-gallery-modal';
    modalDialog.setAttribute('tabindex', '-1');
    modalDialog.setAttribute('role', 'dialog');
    modalDialog.setAttribute('aria-labelledby', 'accessible_gallery_heading');

    const highestZindex: number = CommonUtilities.getHighestZindex();

    modalDialog.style.zIndex = String(highestZindex + 1);

    const modalActionsContainer: HTMLElement = modalDialog.querySelector('#accessible_gallery_actions')!;

    modalActionsContainer.style.zIndex = String(highestZindex + 1);

    for (const button of Array.from(modalActionsContainer.querySelectorAll('button'))) {
      button.style.zIndex = String(highestZindex + 2);
    }

    this.modalInnerContainer = modalDialog.querySelector('#accessible_gallery_modal_inner_container')!;
    this.modalInnerContainerWithImage = modalDialog.querySelector('#accessible_gallery_modal_inner_with_image')!;
    this.modalInnerContainerWithThumbnails = modalDialog.querySelector('#accessible_gallery_modal_inner_with_thumbnails')!;
    this.imageReference = document.createElement('img');

    const alt: string | null = thumbnailImage.getAttribute('alt');
    const isInlineImage: boolean = this.isInlineImage(thumbnailImage.src);

    this.imageReference.id = 'accessible_gallery_image';
    this.imageReference.alt = alt ?? '';
    this.imageReference.src = isInlineImage ? thumbnailImage.src : target.href;

    this.modalInnerContainerWithImage.appendChild(this.imageReference);

    this.imageDescriptionReference = document.createElement('output');
    this.imageDescriptionReference.textContent = alt ?? '';

    this.modalInnerContainerWithImage.appendChild(this.imageDescriptionReference);

    this.imageReference.addEventListener(
      'load',
      this.removeLoadingMessage.bind(this),
      {
        once: true
      });

    this.createThumbnailsList();
    this.createLoadingMessageContainer();
    this.createLoadingMessage(this.imageReference.alt, isInlineImage);

    const galleryConfig: IAccessibleGalleryConfig = this.getGalleryConfig();

    this.previousButton = modalDialog.querySelector('#accessible_gallery_modal_previous_image')!;
    this.previousButton.querySelector('small')!.textContent = galleryConfig.previousImage;

    this.nextButton = modalDialog.querySelector('#accessible_gallery_modal_next_image')!;
    this.nextButton.querySelector('small')!.textContent = galleryConfig.nextImage;

    if (existingModalDialog) {
      existingModalDialog.remove();
    }

    this.closeModalButton = document.createElement('button');

    this.closeModalButton.type = 'button';
    this.closeModalButton.id = 'accessible_gallery_modal_close_button';
    this.closeModalButton.className = 'accessible-gallery-modal__close-button';
    this.closeModalButton.innerHTML = `<span><small class="visually-hidden">${galleryConfig.closeButtonMessage}</small></span>`;

    modalDialog.appendChild(this.closeModalButton);

    document.body.appendChild(modalDialog);
    document.body.classList.add('accessible-gallery-active');

    this.setupAllEventListeners();

    const modalDialogTitleHeading: HTMLHeadingElement = modalDialog.querySelector('h2')!;

    modalDialogTitleHeading.textContent = galleryConfig.galleryTitle;

    window.setTimeout((): void => {
      modalDialog.focus();
    }, 500);
  }

  private handleKeyboardAction(event: KeyboardEvent) {
    if (
      (typeof event.code === 'string' && event.code === 'ArrowRight') ||
      (typeof event.key === 'string' && event.key === 'ArrowRight')
    ) {
      this.getNextImage();
      event.preventDefault();

      return;
    }

    if (
      (typeof event.code === 'string' && event.code === 'ArrowLeft') ||
      (typeof event.key === 'string' && event.key === 'ArrowLeft')
    ) {
      this.getPreviousImage();
      event.preventDefault();
    }
  }

  private findGalleryItemIndex(clickedItem: HTMLElement): void {
    this.currentGalleryItemIndex = this.allGalleryItems.findIndex((item: any) => {
      return item === clickedItem;
    });
  }

  private showOriginalImageFromThumbnail(targetThumbail: HTMLAnchorElement): void {
    const targetImageLink: HTMLAnchorElement = document.querySelector(`[data-accessible-gallery-link-id="${targetThumbail.dataset.accessibleGalleryLinkId}"]`)!;
    const targetImageLiItem: HTMLLIElement = targetImageLink.closest('[data-accessible-gallery-item]')!;

    this.findGalleryItemIndex(targetImageLiItem);

    const link: HTMLAnchorElement = this.allGalleryItems[this.currentGalleryItemIndex].querySelector('[data-accessible-gallery-link]');
    const linkThumbnail: HTMLImageElement = link.querySelector('img')!;
    const nextLinkThumbnailImage: HTMLImageElement = this.currentGalleryItem.querySelector('img')!;

    const alt: string | null = nextLinkThumbnailImage.getAttribute('alt');
    const isInlineImage: boolean = this.isInlineImage(linkThumbnail.src);

    this.imageReference?.remove();
    this.imageReference = document.createElement('img');
    this.imageReference.id = 'accessible_gallery_image';
    this.imageReference.alt = alt ?? '';
    this.imageReference.src = isInlineImage ? linkThumbnail.src : link.href;

    this.modalInnerContainerWithImage.appendChild(this.imageReference);

    this.createLoadingMessage(linkThumbnail.alt, isInlineImage);

    this.imageReference.addEventListener(
      'load',
      this.removeLoadingMessage.bind(this),
      {
        once: true
      });

    this.setCursorToProgress();
    this.removeCursorProgressOnImageLoadedOrError();
  }

  private handleOpenAction(event: Event): void {
    const target: HTMLAnchorElement | null = (event.target as Element).closest('[data-accessible-gallery-link]');
    const targetThumbail: HTMLAnchorElement | null = (event.target as Element).closest('[data-accessible-gallery-link-id]');

    if (target === null && targetThumbail) {

      event.preventDefault();
      this.showOriginalImageFromThumbnail(targetThumbail);

      return;
    }

    if (target === null) {
      return;
    }

    if (typeof target.dataset.accessibleGalleryLink !== 'string') {
      return;
    }

    event.preventDefault();
    CommonUtilities.trapInModal();

    this.galleryContainer = target.closest('[data-accessible-gallery]')!;

    this.allGalleryItems = Array.from(
      this.galleryContainer.querySelectorAll('[data-accessible-gallery-item]')
    );

    const addUniqueDomId = (galleryItem: HTMLLIElement): void => {
      const galleryLink: HTMLAnchorElement = galleryItem.querySelector('[data-accessible-gallery-link]')!;

      galleryLink.dataset.accessibleGalleryLinkId = CommonUtilities.createUniqueDOMId();
    };

    this.allGalleryItems.forEach(addUniqueDomId);

    const clickedItem: HTMLElement = target.closest('[data-accessible-gallery-item]')!;

    this.findGalleryItemIndex(clickedItem);

    this.showImage(target);

    this.handleKeyboardActionRef = this.handleKeyboardAction.bind(this);
    document.addEventListener('keydown', this.handleKeyboardActionRef);
  }

  private applyActions(): void {
    CommonUtilities.createCSS(styles, 'accessible_gallery_styles');
    document.addEventListener('click', this.handleOpenAction.bind(this));
  }

  public init(): void {
    if (document.readyState !== 'loading') {
      this.applyActions();

      return;
    }

    document.addEventListener('DOMContentLoaded', this.applyActions.bind(this));
  }

}

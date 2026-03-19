import 'swiped-events';

import styles from '../dist/styles.bundle.css';
import type { IAccessibleGalleryConfig } from './interfaces/gallery.interfaces';
import { CommonUtilities } from './utilities/common.utilities';

export default class AccessibleGallery {
  private previousButton!: HTMLElement;
  private nextButton!: HTMLElement;
  private imageReference: HTMLImageElement | null;
  private figureReference: HTMLElement | null;
  private figCaptionReference: HTMLElement | null;
  private closeModalButton!: HTMLButtonElement;
  private modalInnerContainer!: Element;
  private modalInnerContainerWithImage!: Element;
  private modalInnerContainerWithThumbnails!: Element;
  private loadingMessageContainer!: HTMLElement;
  private showLoadingMessageTimeout: number | undefined;

  private galleryContainer!: HTMLElement;
  private currentGalleryItemIndex!: number;
  private allGalleryItems!: any[];
  private allThumbnailButtons!: NodeListOf<HTMLButtonElement>;

  private handleKeyboardActionRef: any;
  private handleClickOutsideRef: any;
  private closeDialogRef: any;
  private handleImageNavigationActionRef: any;
  private handleSwipeLeftRef: any;
  private handleSwipeRightRef: any;
  private handleThumbnailOpenRef: Map<HTMLButtonElement, (event: Event) => void> = new Map();

  constructor() {
    this.imageReference = null;
    this.figureReference = null;
    this.figCaptionReference = null;
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

    const galleryButton: HTMLButtonElement = this.allGalleryItems[nextGalleryItemIndex].querySelector('[data-accessible-gallery-link]');

    this.preloadImage(galleryButton.dataset.src || '');
  }

  private preloadPreviousNextImage() {
    let nextGalleryItemIndex = this.currentGalleryItemIndex - 1;

    if (nextGalleryItemIndex < 0) {
      nextGalleryItemIndex = this.allGalleryItems.length - 1;
    }

    const galleryButton: HTMLButtonElement = this.allGalleryItems[nextGalleryItemIndex].querySelector('[data-accessible-gallery-link]');

    this.preloadImage(galleryButton.dataset.src || '');
  }

  private navigateToImage(index: number): void {
    const previousIndex = this.currentGalleryItemIndex;

    this.currentGalleryItemIndex = ((index % this.allGalleryItems.length) + this.allGalleryItems.length) % this.allGalleryItems.length;

    const button: HTMLButtonElement = this.allGalleryItems[this.currentGalleryItemIndex].querySelector('[data-accessible-gallery-link]');
    const buttonThumbnail: HTMLImageElement = button.querySelector('img')!;

    this.createFigureWithImage(buttonThumbnail, button.dataset.src, this.modalInnerContainerWithImage, 'accessible_gallery_image');
    if (index >= previousIndex) {
      this.preloadNextNextImage();
    } else {
      this.preloadPreviousNextImage();
    }
  }

  private getNextImage(): void {
    this.navigateToImage(this.currentGalleryItemIndex + 1);
  }

  private getPreviousImage(): void {
    this.navigateToImage(this.currentGalleryItemIndex - 1);
  }

  private handleImageNavigationAction(event: Event) {
    const nextBtn: Element | null = (event.target as Element).closest('#accessible_gallery_modal_next_image');
    const prevBtn: Element | null = (event.target as Element).closest('#accessible_gallery_modal_previous_image');

    if (event.type === 'keydown') {
      if ((typeof (event as KeyboardEvent).key === 'string' && (event as KeyboardEvent).key !== 'Escape') || (typeof (event as KeyboardEvent).code === 'string' && (event as KeyboardEvent).code !== 'Escape')) {
        return;
      }
    }

    if (nextBtn) {
      this.getNextImage();
    } else if (prevBtn) {
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
    const existingModalDialog: HTMLDialogElement | null = document.getElementById('accessible_gallery_modal') as HTMLDialogElement;

    this.removeAllEventListeners();

    if (existingModalDialog === null) {
      return;
    }

    document.body.classList.remove('accessible-gallery-active');
    existingModalDialog.close();

    existingModalDialog.remove();
    this.loadingMessageContainer.remove();
  }

  private createLoadingMessageContainer(): void {
    this.loadingMessageContainer?.remove();

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

    this.handleThumbnailOpenRef.forEach((handler, galleryItemButton) => {
      galleryItemButton.removeEventListener('click', handler);
    });
    this.handleThumbnailOpenRef.clear();
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

    this.allThumbnailButtons.forEach((thumbnail) => {
      const handler = (event: Event) => {
        this.showOriginalImageFromThumbnail(event.currentTarget as HTMLButtonElement);
      };

      this.handleThumbnailOpenRef.set(thumbnail, handler);
      thumbnail.addEventListener('click', handler);
    });
  }

  private createThumbnailsList(): void {
    const thumbnails: HTMLImageElement[] = Array.from(this.galleryContainer.querySelectorAll('[data-accessible-gallery-thumbnail]'));

    if (thumbnails.length === 0) {
      return;
    }

    const thumbnailsList: HTMLElement = document.createElement('ul');

    const createThumbnail = (image: HTMLImageElement) => {
      const thumbnailSrc: string | null = image.getAttribute('data-accessible-gallery-thumbnail');
      const caption: string | null = image.getAttribute('data-accessible-gallery-item-caption');
      const galleryLinkButton: HTMLButtonElement = image.closest('[data-accessible-gallery-link]')!;

      if (thumbnailSrc === null) {
        return;
      }
      const li = document.createElement('li');
      const button = document.createElement('button');
      const img = document.createElement('img');

      button.dataset.src = image.src;
      button.type = 'button';
      button.dataset.accessibleGalleryLinkId = galleryLinkButton.dataset.accessibleGalleryLinkId;

      img.src = thumbnailSrc || image.src;
      img.alt = `${image.alt} thumbnail`;

      if (caption) {
        img.dataset.accessibleGalleryItemCaption = caption;
      }

      button.appendChild(img);
      li.appendChild(button);
      thumbnailsList.appendChild(li);
    };

    thumbnails.forEach(createThumbnail);

    this.modalInnerContainerWithThumbnails.appendChild(thumbnailsList);
    this.allThumbnailButtons = this.modalInnerContainerWithThumbnails.querySelectorAll('[data-accessible-gallery-link-id]');
  }

  private showImage(target: HTMLButtonElement) {
    const modalDialog: HTMLDialogElement = document.createElement('dialog');
    const existingModalDialog: HTMLDialogElement | null = document.getElementById('accessible_gallery_modal') as HTMLDialogElement;
    const thumbnailImage: HTMLImageElement = target.querySelector('img')!;

    modalDialog.innerHTML = '<h2 class="visually-hidden" id="accessible_gallery_heading"></h2>' +
      '<nav id="accessible_gallery_actions" class="accessible-gallery-modal__actions" aria-label="Go to next or previus image">' +
        '<button type="button" class="accessible-gallery-modal__previous-image" id="accessible_gallery_modal_previous_image">' +
          '<span><small class="visually-hidden"></small></span>' +
        '</button>' +
        '<button type="button" class="accessible-gallery-modal__next-image" id="accessible_gallery_modal_next_image">' +
          '<span><small class="visually-hidden"></small></span>' +
        '</button>' +
      '</nav>' +
      '<div id="accessible_gallery_modal_inner_container" class="accessible-gallery-modal__inner-container">' +
        '<div id="accessible_gallery_modal_inner_with_image" class="accessible-gallery-modal__inner-container__image"></div>' +
        '<div id="accessible_gallery_modal_inner_with_thumbnails" class="accessible-gallery-modal__inner-container__thumbnails"></div>' +
      '</div>';

    modalDialog.id = 'accessible_gallery_modal';
    modalDialog.className = 'accessible-gallery-modal';
    modalDialog.setAttribute('aria-labelledby', 'accessible_gallery_heading');

    const highestZIndex: number = CommonUtilities.getHighestZindex();

    modalDialog.style.zIndex = String(highestZIndex + 1);

    const modalActionsContainer: HTMLElement = modalDialog.querySelector('#accessible_gallery_actions')!;

    modalActionsContainer.style.zIndex = String(highestZIndex + 1);

    for (const button of Array.from(modalActionsContainer.querySelectorAll('button'))) {
      button.style.zIndex = String(highestZIndex + 2);
    }

    this.modalInnerContainer = modalDialog.querySelector('#accessible_gallery_modal_inner_container')!;
    this.modalInnerContainerWithImage = modalDialog.querySelector('#accessible_gallery_modal_inner_with_image')!;
    this.modalInnerContainerWithThumbnails = modalDialog.querySelector('#accessible_gallery_modal_inner_with_thumbnails')!;
    this.createFigureWithImage(thumbnailImage, target.dataset.src, this.modalInnerContainerWithImage, 'accessible_gallery_image');
    this.createThumbnailsList();

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
      modalDialog.showModal();
    }, 500);
  }

  private createFigureWithImage(image: HTMLImageElement, altSource: string | undefined, appendTarget: Element, imageId: string | null) {
    window.clearTimeout(this.showLoadingMessageTimeout);
    this.figureReference?.remove();
    this.figureReference = document.createElement('figure');
    this.imageReference = document.createElement('img');

    const alt: string | null = image.getAttribute('alt');
    const caption: string | null = image.getAttribute('data-accessible-gallery-item-caption');
    const isInlineImage: boolean = this.isInlineImage(image.src);

    if (imageId) {
      this.imageReference.id = imageId;
    }
    this.imageReference.alt = alt ?? '';
    this.imageReference.src = isInlineImage ? image.src : (altSource ?? '');

    this.figureReference.appendChild(this.imageReference);

    if (caption) {
      this.figCaptionReference = document.createElement('figcaption');

      this.figCaptionReference.textContent = caption;
      this.figureReference.appendChild(this.figCaptionReference);
    }
    appendTarget.appendChild(this.figureReference);

    this.imageReference.addEventListener(
      'load',
      this.removeLoadingMessage.bind(this),
      {
        once: true
      });

    this.createLoadingMessageContainer();
    this.createLoadingMessage(this.imageReference.alt, isInlineImage);

    this.setCursorToProgress();
    this.removeCursorProgressOnImageLoadedOrError();
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

  private showOriginalImageFromThumbnail(targetThumbnail: HTMLButtonElement): void {
    const targetImageButton: HTMLButtonElement = document.querySelector(`[data-accessible-gallery-link-id="${targetThumbnail.dataset.accessibleGalleryLinkId}"]`)!;
    const targetImageLiItem: HTMLLIElement = targetImageButton.closest('[data-accessible-gallery-item]')!;

    this.findGalleryItemIndex(targetImageLiItem);

    this.navigateToImage(this.currentGalleryItemIndex);
  }

  private handleOpenAction(target: HTMLButtonElement): void {

    if (target === null) {
      return;
    }

    if (typeof target.dataset.accessibleGalleryLink !== 'string') {
      return;
    }

    this.galleryContainer = target.closest('[data-accessible-gallery]')!;

    this.allGalleryItems = Array.from(
      this.galleryContainer.querySelectorAll('[data-accessible-gallery-item]')
    );

    const addUniqueDomId = (galleryItem: HTMLLIElement): void => {
      const galleryButton: HTMLButtonElement = galleryItem.querySelector('[data-accessible-gallery-link]')!;

      galleryButton.dataset.accessibleGalleryLinkId = CommonUtilities.createUniqueDOMId();
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
    document.querySelectorAll<HTMLButtonElement>('[data-accessible-gallery-link]')?.forEach((button: HTMLButtonElement) => {
      button.addEventListener('click', () => {
        this.handleOpenAction(button);
      });
    });
  }

  public init(): void {
    if (document.readyState !== 'loading') {
      this.applyActions();

      return;
    }

    document.addEventListener('DOMContentLoaded', this.applyActions.bind(this));
  }

}

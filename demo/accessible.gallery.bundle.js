!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t(((e="undefined"!=typeof globalThis?globalThis:e||self).accessible=e.accessible||{},e.accessible.gallery={}))}(this,(function(e){"use strict";
/*!
     * swiped-events.js - v@version@
     * Pure JavaScript swipe events
     * https://github.com/john-doherty/swiped-events
     * @inspiration https://stackoverflow.com/questions/16348031/disable-scrolling-when-touch-moving-certain-element
     * @author John Doherty <www.johndoherty.info>
     * @license MIT
     */!function(e,t){"function"!=typeof e.CustomEvent&&(e.CustomEvent=function(e,i){i=i||{bubbles:!1,cancelable:!1,detail:void 0};var a=t.createEvent("CustomEvent");return a.initCustomEvent(e,i.bubbles,i.cancelable,i.detail),a},e.CustomEvent.prototype=e.Event.prototype),t.addEventListener("touchstart",(function(e){if("true"===e.target.getAttribute("data-swipe-ignore"))return;o=e.target,l=Date.now(),i=e.touches[0].clientX,a=e.touches[0].clientY,n=0,s=0}),!1),t.addEventListener("touchmove",(function(e){if(!i||!a)return;var t=e.touches[0].clientX,l=e.touches[0].clientY;n=i-t,s=a-l}),!1),t.addEventListener("touchend",(function(e){if(o!==e.target)return;var t=parseInt(r(o,"data-swipe-threshold","20"),10),c=parseInt(r(o,"data-swipe-timeout","500"),10),d=Date.now()-l,g="",h=e.changedTouches||e.touches||[];Math.abs(n)>Math.abs(s)?Math.abs(n)>t&&d<c&&(g=n>0?"swiped-left":"swiped-right"):Math.abs(s)>t&&d<c&&(g=s>0?"swiped-up":"swiped-down");if(""!==g){var m={dir:g.replace(/swiped-/,""),touchType:(h[0]||{}).touchType||"direct",xStart:parseInt(i,10),xEnd:parseInt((h[0]||{}).clientX||-1,10),yStart:parseInt(a,10),yEnd:parseInt((h[0]||{}).clientY||-1,10)};o.dispatchEvent(new CustomEvent("swiped",{bubbles:!0,cancelable:!0,detail:m})),o.dispatchEvent(new CustomEvent(g,{bubbles:!0,cancelable:!0,detail:m}))}i=null,a=null,l=null}),!1);var i=null,a=null,n=null,s=null,l=null,o=null;function r(e,i,a){for(;e&&e!==t.documentElement;){var n=e.getAttribute(i);if(n)return n;e=e.parentNode}return a}}(window,document);const t=['[role="button"]:not([tabindex="-1"])','a[href]:not([tabindex="-1"])','area[href]:not([tabindex="-1"])','input:not([disabled]):not([tabindex="-1"])','select:not([disabled]):not([tabindex="-1"])','textarea:not([disabled]):not([tabindex="-1"])','button:not([disabled]):not([tabindex="-1"])','iframe:not([tabindex="-1"])','[tabindex]:not([tabindex="-1"])','[contentEditable=true]:not([tabindex="-1"])'];class i{static getElementsRelatedToAssistiveTechnologies(){return Array.from(document.querySelectorAll(":root > *:not(head)>:not(#accessible_gallery_modal)"))}static getHighestZindex(){const e=document.getElementsByTagName("*"),t=e.length,i=[];let a;for(let n=0;n<t;n+=1)a=window.getComputedStyle(e[n],null).getPropertyValue("z-index"),null!==a&&"auto"!==a&&i.push(Number(a));return 0===i.length?0:Math.max(...i)}static createCSS(e,t,i){if(null===e)throw new Error("[CommonUtilities.createCSS] passed content is not a string. Is type "+typeof e);const a=document.head,n=document.createElement("style");return"string"==typeof t&&(n.id=t),"string"==typeof i&&i.length>0&&n.setAttribute("media",i),"object"==typeof n.styleSheet?n.styleSheet.cssText=e:n.appendChild(document.createTextNode(e)),a.appendChild(n),n}static untrapFromModal(){Array.from(document.querySelectorAll('[tabindex="-1"]:not([data-original-tabindex]), [data-original-tabindex]')).forEach((e=>{void 0!==e.dataset.originalTabindex?(e.tabIndex=Number(e.dataset.originalTabindex),e.removeAttribute("data-original-tabindex")):e.removeAttribute("tabindex")}));i.getElementsRelatedToAssistiveTechnologies().forEach((e=>{"string"==typeof e.dataset.originalAriaHidden?e.setAttribute("aria-hidden",e.dataset.originalAriaHidden):e.removeAttribute("aria-hidden")})),document.body.classList.remove("accessible-gallery-stop-scrolling")}static trapInModal(){Array.from(document.querySelectorAll(t.map((e=>`:root > *:not(head)>:not(#accessible_gallery_modal) ${e}`)).join(", "))).forEach((e=>{0!==e.tabIndex&&(e.dataset.originalTabindex=String(e.tabIndex)),e.tabIndex=-1}));i.getElementsRelatedToAssistiveTechnologies().forEach((e=>{"string"==typeof e.ariaHidden&&(e.dataset.originalAriaHidden=e.ariaHidden),e.setAttribute("aria-hidden","true")})),document.body.classList.add("accessible-gallery-stop-scrolling")}}e.AccessibleGallery=class{constructor(){this.imageReference=null}getGalleryConfig(){let e={closeButtonMessage:"Close dialog",galleryTitle:"Gallery of images in a modal dialog",loadingMessage:"The image is being loaded",nextImage:"Next",previousImage:"Previous"};try{e=JSON.parse(this.galleryContainer.getAttribute("data-accessible-gallery-config"))}catch(t){return e}return e}handleClickOutside(e){if("keydown"===e.type){if("string"==typeof e.key&&"Escape"!==e.key||"string"==typeof e.code&&"Escape"!==e.code)return;return this.closeDialog(),void e.preventDefault()}const t=e.target.closest("#accessible_gallery_modal_inner_with_image"),i=e.target.closest("#accessible_gallery_actions");null===t&&null===i&&(this.closeDialog(),e.preventDefault())}setCursorToProgress(){document.body.classList.add("cursor-progress")}removeCursorToProgress(){document.body.classList.remove("cursor-progress")}removeCursorProgressOnImageLoadedOrError(){this.imageReference.addEventListener("load",this.removeCursorToProgress.bind(this),{once:!0}),this.imageReference.addEventListener("error",this.removeCursorToProgress.bind(this),{once:!0})}isInlineImage(e){return e.startsWith("data:image/")}preloadImage(e){let t=document.querySelector(`link[href="${e}"]`);null!==t&&(t=document.createElement("link"),t.rel="preload",t.as="image",t.href=e,document.head.appendChild(t))}preloadNextNextImage(){let e=this.currentGalleryItemIndex+1;e>this.allGalleryItems.length-1&&(e=0);const t=this.allGalleryItems[e].querySelector("[data-accessible-gallery-link]");this.preloadImage(t.href)}preloadPreviousNextImage(){let e=this.currentGalleryItemIndex-1;e<0&&(e=this.allGalleryItems.length-1);const t=this.allGalleryItems[e].querySelector("[data-accessible-gallery-link]");this.preloadImage(t.href)}getNextImage(){var e;this.currentGalleryItemIndex+=1,this.currentGalleryItemIndex>this.allGalleryItems.length-1&&(this.currentGalleryItemIndex=0);const t=this.allGalleryItems[this.currentGalleryItemIndex].querySelector("[data-accessible-gallery-link]"),i=t.querySelector("img"),a=this.currentGalleryItem.querySelector("img").getAttribute("alt"),n=this.isInlineImage(i.src);null===(e=this.imageReference)||void 0===e||e.remove(),this.imageReference=document.createElement("img"),this.imageReference.id="accessible_gallery_image",this.imageReference.alt=null===a?"":a,this.imageReference.src=n?i.src:t.href,this.modalInnerContainerWithImage.appendChild(this.imageReference),this.createLoadingMessage(i.alt,n),this.imageReference.addEventListener("load",this.removeLoadingMessage.bind(this),{once:!0}),this.setCursorToProgress(),this.removeCursorProgressOnImageLoadedOrError(),this.preloadNextNextImage()}getPreviousImage(){var e;this.currentGalleryItemIndex-=1,this.currentGalleryItemIndex<0&&(this.currentGalleryItemIndex=this.allGalleryItems.length-1);const t=this.allGalleryItems[this.currentGalleryItemIndex].querySelector("[data-accessible-gallery-link]"),i=t.querySelector("img"),a=this.currentGalleryItem.querySelector("img").getAttribute("alt"),n=this.isInlineImage(i.src);null===(e=this.imageReference)||void 0===e||e.remove(),this.imageReference=document.createElement("img"),this.imageReference.id="accessible_gallery_image",this.imageReference.alt=null===a?"":a,this.imageReference.src=this.isInlineImage(i.src)?i.src:t.href,this.modalInnerContainerWithImage.appendChild(this.imageReference),this.createLoadingMessage(i.alt,n),this.imageReference.addEventListener("load",this.removeLoadingMessage.bind(this),{once:!0}),this.setCursorToProgress(),this.removeCursorProgressOnImageLoadedOrError(),this.preloadPreviousNextImage()}handleImageNavigationAction(e){const t=e.target;"keydown"===e.type&&("string"==typeof e.key&&"Escape"!==e.key||"string"==typeof e.code&&"Escape"!==e.code)||("accessible_gallery_modal_next_image"===t.id?this.getNextImage():this.getPreviousImage(),e.preventDefault())}handleSwipeLeft(){this.getNextImage()}handleSwipeRight(){this.getPreviousImage()}closeDialog(){const e=document.getElementById("accessible_gallery_modal");this.removeAllEventListeners(),null!==e&&(document.body.classList.remove("accessible-gallery-active"),e.remove(),this.loadingMessageContainer.remove(),i.untrapFromModal(),this.restoreFocusToElement.focus())}createLoadingMessageContainer(){this.loadingMessageContainer=document.createElement("span"),this.loadingMessageContainer.setAttribute("aria-live","polite"),this.loadingMessageContainer.setAttribute("id","accessible_gallery_a11y"),this.modalInnerContainer.appendChild(this.loadingMessageContainer)}removeLoadingMessage(){window.clearTimeout(this.showLoadingMessageTimeout),this.loadingMessageContainer.style.zIndex="-1",this.loadingMessageContainer.textContent=""}createLoadingMessage(e,t){if(t)return void this.removeLoadingMessage();const a=`${this.getGalleryConfig().loadingMessage}: ${e}`;this.showLoadingMessageTimeout=window.setTimeout((()=>{this.loadingMessageContainer.textContent=a,this.loadingMessageContainer.style.zIndex=String(i.getHighestZindex())}),1e3)}removeAllEventListeners(){document.removeEventListener("keydown",this.handleKeyboardActionRef),this.handleKeyboardActionRef=null,this.previousButton.removeEventListener("click",this.handleImageNavigationActionRef),this.nextButton.removeEventListener("click",this.handleImageNavigationActionRef),this.handleImageNavigationActionRef=null,document.removeEventListener("click",this.handleClickOutsideRef),document.removeEventListener("keydown",this.handleClickOutsideRef),this.handleClickOutsideRef=null,document.removeEventListener("keydown",this.handleKeyboardActionRef),this.handleKeyboardActionRef=null,this.closeModalButton.removeEventListener("click",this.closeDialogRef),this.closeDialogRef=null,document.removeEventListener("swiped-left",this.handleSwipeLeftRef),this.handleSwipeLeftRef=null,document.removeEventListener("swiped-right",this.handleSwipeRightRef),this.handleSwipeRightRef=null}setupAllEventListeners(){this.handleClickOutsideRef=this.handleClickOutside.bind(this),document.addEventListener("click",this.handleClickOutsideRef),document.addEventListener("keydown",this.handleClickOutsideRef),this.closeDialogRef=this.closeDialog.bind(this),this.closeModalButton.addEventListener("click",this.closeDialogRef),this.handleImageNavigationActionRef=this.handleImageNavigationAction.bind(this),this.previousButton.addEventListener("click",this.handleImageNavigationActionRef),this.nextButton.addEventListener("click",this.handleImageNavigationActionRef),this.handleSwipeLeftRef=this.handleSwipeLeft.bind(this),document.addEventListener("swiped-left",this.handleSwipeLeftRef),this.handleSwipeRightRef=this.handleSwipeRight.bind(this),document.addEventListener("swiped-right",this.handleSwipeRightRef)}showImage(e){this.currentGalleryItem=e.closest("[data-accessible-gallery-item]");const t=document.createElement("div"),a=document.getElementById("accessible_gallery_modal"),n=e.querySelector("img");this.restoreFocusToElement=e,t.innerHTML='<h2 class="visually-hidden" id="accessible_gallery_heading"></h2><div id="accessible_gallery_actions" class="accessible-gallery-modal__actions" tabindex="-1"><button type="button" class="accessible-gallery-modal__previous-image" id="accessible_gallery_modal_previous_image"></button><button type="button" class="accessible-gallery-modal__next-image" id="accessible_gallery_modal_next_image"></button></div><div id="accessible_gallery_modal_inner_container" class="accessible-gallery-modal__inner-container"><div id="accessible_gallery_modal_inner_with_image" class="accessible-gallery-modal__inner-container__image"></div></div>',t.id="accessible_gallery_modal",t.className="accessible-gallery-modal",t.tabIndex=-1,t.setAttribute("role","dialog"),t.setAttribute("aria-labelledby","accessible_gallery_heading");const s=i.getHighestZindex();t.style.zIndex=String(s+1);const l=t.querySelector("#accessible_gallery_actions");l.style.zIndex=String(s+1),Array.from(l.querySelectorAll("button")).forEach((e=>{e.style.zIndex=String(s+2)})),this.modalInnerContainer=t.querySelector("#accessible_gallery_modal_inner_container"),this.modalInnerContainerWithImage=t.querySelector("#accessible_gallery_modal_inner_with_image"),this.imageReference=document.createElement("img");const o=n.getAttribute("alt"),r=this.isInlineImage(n.src);this.imageReference.id="accessible_gallery_image",this.imageReference.alt=null===o?"":o,this.imageReference.src=r?n.src:e.href,this.modalInnerContainerWithImage.appendChild(this.imageReference),this.imageReference.addEventListener("load",this.removeLoadingMessage.bind(this),{once:!0}),this.createLoadingMessageContainer(),this.createLoadingMessage(this.imageReference.alt,r);const c=this.getGalleryConfig();this.previousButton=t.querySelector("#accessible_gallery_modal_previous_image"),this.previousButton.textContent=c.previousImage,this.nextButton=t.querySelector("#accessible_gallery_modal_next_image"),this.nextButton.textContent=c.nextImage,a&&a.remove(),this.closeModalButton=document.createElement("button"),this.closeModalButton.type="button",this.closeModalButton.id="accessible_gallery_modal_close_button",this.closeModalButton.className="accessible-gallery-modal__close-button",this.closeModalButton.innerHTML=`<span class="visually-hidden">${c.closeButtonMessage}</span><svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 268.29 268.29" with="24" height="24"><defs><filter id="a" height="1.36" width="1.36" color-interpolation-filters="sRGB" y="-.18" x="-.18"><feGaussianBlur stdDeviation="13.714"/></filter></defs><g stroke-linejoin="round" stroke="#000" stroke-linecap="round"><path d="M268.57 149.51c0 50.495-40.934 91.429-91.429 91.429s-91.429-40.934-91.429-91.429 40.934-91.429 91.429-91.429 91.429 40.934 91.429 91.429z" transform="translate(-43 -15.362)" color="#000" filter="url(#a)" stroke-width="19.6" fill="#fff"/><path d="M223.57 132.148c0 50.495-40.934 91.429-91.429 91.429s-91.429-40.934-91.429-91.429 40.934-91.429 91.429-91.429 91.429 40.934 91.429 91.429z" color="#000" stroke-width="29.8" fill="#fff"/><path d="M95.701 95.703l72.884 72.884v-.985" stroke-width="28" fill="none"/><path d="M168.582 95.703l-72.884 72.884v-.985" stroke-width="28" fill="none"/></g></svg>`,t.appendChild(this.closeModalButton),document.body.appendChild(t),document.body.classList.add("accessible-gallery-active"),this.setupAllEventListeners();t.querySelector("h2").textContent=c.galleryTitle,window.setTimeout((()=>{t.focus()}),500)}handleKeyboardAction(e){if("string"==typeof e.code&&"ArrowRight"===e.code||"string"==typeof e.key&&"ArrowRight"===e.key)return this.getNextImage(),void e.preventDefault();("string"==typeof e.code&&"ArrowLeft"===e.code||"string"==typeof e.key&&"ArrowLeft"===e.key)&&(this.getPreviousImage(),e.preventDefault())}handleOpenAction(e){const t=e.target.closest("[data-accessible-gallery-link]");if(null===t)return;if("string"!=typeof t.dataset.accessibleGalleryLink)return;e.preventDefault(),i.trapInModal(),this.galleryContainer=t.closest("[data-accessible-gallery]"),this.allGalleryItems=Array.from(this.galleryContainer.querySelectorAll("[data-accessible-gallery-item]"));const a=t.closest("[data-accessible-gallery-item]");this.currentGalleryItemIndex=this.allGalleryItems.findIndex((e=>e===a)),this.showImage(t),this.handleKeyboardActionRef=this.handleKeyboardAction.bind(this),document.addEventListener("keydown",this.handleKeyboardActionRef)}applyActions(){i.createCSS(":root body.accessible-gallery-stop-scrolling{overflow:hidden !important}.cursor-progress{cursor:progress}.visually-hidden{border:0 !important;clip:rect(0, 0, 0, 0) !important;height:1px !important;margin:-1px !important;overflow:hidden !important;padding:0 !important;position:absolute !important;white-space:nowrap !important;width:1px !important}#accessible_gallery button{background-color:#000;border:1px solid #000;border-radius:.25rem;color:#fff;padding:.375rem .75rem}#accessible_gallery button:focus,#accessible_gallery button:hover{background-color:#000;border-color:#000}.accessible-gallery-modal{background-color:rgba(0,0,0,.85);height:100vh;left:0;position:fixed;top:0;width:100%;z-index:2}.accessible-gallery-modal__actions{display:flex;height:1px;justify-content:space-between;position:absolute;white-space:nowrap;width:100%}@media(max-width: 575.98px){.accessible-gallery-modal__actions{bottom:8rem}}@media(min-width: 768px){.accessible-gallery-modal__actions{left:50%;top:50%;transform:translate(-50%, -50%)}}.accessible-gallery-modal__actions button{align-items:center;background:#000;border:0;border-radius:.5rem;box-shadow:0 0 3px #fff;color:#fff;display:flex;height:3rem;margin:0 1rem;padding:1rem 1.5rem}.accessible-gallery-modal__actions button:nth-of-type(1){margin-right:2rem}.accessible-gallery-modal__actions button:focus,.accessible-gallery-modal__actions button:hover{background:#fff;box-shadow:0 0 10px #000;color:#000;outline:0}.accessible-gallery-modal__close-button{background:none;border:0;position:absolute;right:4px;top:4px}[dir=rtl] .accessible-gallery-modal__close-button{left:4px;right:initial}.accessible-gallery-modal__close-button svg{height:2.5rem;width:2.5rem}.accessible-gallery-modal__close-button:focus,.accessible-gallery-modal__close-button:hover{outline-color:#fff;outline-style:auto;outline-width:1px}@supports(outline-color: -webkit-focus-ring-color){.accessible-gallery-modal__close-button:focus,.accessible-gallery-modal__close-button:hover{outline-color:-webkit-focus-ring-color}}.accessible-gallery-modal__inner-container{height:100%;position:relative;width:100%}.accessible-gallery-modal__inner-container__image{align-items:center;background:#000;display:flex;justify-content:center;left:50%;max-height:98%;position:absolute;top:50%;transform:translate(-50%, -50%);width:98%}@media(min-width: 768px){.accessible-gallery-modal__inner-container__image{height:90%;width:auto}@supports(width: max-content){.accessible-gallery-modal__inner-container__image{width:max-content}}}.accessible-gallery-modal__inner-container__image img{aspect-ratio:auto;background:#000;box-shadow:0 0 8px #000;display:block;margin:0 auto;max-height:100%;max-width:100%;object-fit:contain;object-position:center}.accessible-gallery-modal__inner-container span{background:rgba(0,0,0,.7);color:#fff;display:inline-block;left:0;max-width:100%;padding:1rem;position:absolute;white-space:nowrap;white-space:pre-line;z-index:-1}.accessible-gallery-modal__inner-container span:empty{display:none}@media(min-width: 768px){.accessible-gallery-modal__inner-container span{left:50%;transform:translate(-50%, 0);bottom:2rem;top:auto}}/*# sourceMappingURL=styles.bundle.css.map */\n","accessible_gallery_styles"),document.addEventListener("click",this.handleOpenAction.bind(this))}init(){"loading"===document.readyState?document.addEventListener("DOMContentLoaded",this.applyActions.bind(this)):this.applyActions()}}}));

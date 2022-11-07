# Accessible Gallery

Accessible Gallery allows you to create an image gallery automatically directly from the HTML.

## Demo

[Accessible Images Gallery](https://www.sitelint.com/lab/accessible-gallery/)

## Getting started

1. First download the package:

```bash
npm install @sitelintcode/accessible-gallery --save
```

2. Setup HTML structure:

```html
  <ul class="accessible-gallery" data-accessible-gallery
      data-accessible-gallery-config='{"galleryTitle":"Gallery of images in a modal dialog","loadingMessage":"The image is being loaded","closeButtonMessage":"Close gallery", "previousImage":"Previous","nextImage":"Next", "closeButton":"Close dialog"}'>

      <li class="accessible-gallery__item" data-accessible-gallery-item>
        <a href="#no_image" data-accessible-gallery-link>
          <img loading="lazy" alt="Placeholder"
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAA1JREFUGFdjOHPmzH8ACDADZKt3GNsAAAAASUVORK5CYII=" />
        </a>
      </li>

      <li class="accessible-gallery__item" data-accessible-gallery-item>
        <a href="images/castelmezzano-1979546_1920.jpeg" data-accessible-gallery-link>
          <img loading="lazy" alt="Castelmezzano by night" src="images/castelmezzano-1979546_1920_thumbnail.jpeg" />
        </a>
      </li>

      <li class="accessible-gallery__item" data-accessible-gallery-item>
        <a href="images/sunset-3325080_1920.jpeg" data-accessible-gallery-link>
          <img loading="lazy" alt="Sunset in mountains" src="images/sunset-3325080_1920_thumbnail.jpeg" />
        </a>
      </li>

  </ul>
```

3. Use:

```javascript
  import AccessibleGallery from '@sitelint/accessible-gallery';

  const accessibleGallery = new AccessibleGallery();

  accessibleGallery.init();
```

## Notes

### Features

1. The gallery supports [image preloding](https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types/preload) for previous / next image using.
2. While loading the image the message is being displayed to give a feedback when loading image takes more than 1 second. The message appears with 1 second delay to avoid "blinking" when the image is loaded faster than 1 second.
3. The gallery should be fully responsive and adapt to all viewport sizes.
4. Gallery supports [base64 encoded images](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URLs). Example: `src="data:image/png;base64,..."`.
5. The left/right swipe gesture is supported. Very useful on mobile devices.

### Technical

1. `import { terser } from "rollup-plugin-terser";` was replaced with  `import { terser } from "rollup-plugin-minification";` because `rollup-plugin-terser` is not compatible with Rollup 3.x version. See: https://github.com/TrySound/rollup-plugin-terser/issues/119
2. At the moment the gallery code is being executed on `DOMContentLoaded` event automatically. Eventually, if event `DOMContentLoaded` was called after Accessible Gallery code was loaded then the gallery will run immediately.


## Options

Optionally you may want to set custom messages, e.g. for localisation purpose. An attribute `data-accessible-gallery-config` contains config for all strings.

```json
{
  "galleryTitle": "Gallery of images in a modal dialog",
  "loadingMessage": "The image is being loaded",
  "closeButtonMessage": "Close gallery",
  "previousImage": "Previous",
  "nextImage": "Next",
  "closeButton": "Close dialog"
}
```

**Note**: above config is being stored as a valid JSON string under attribute `data-accessible-gallery-config`.

### Can I use other languages than english?

Yes. See above "Options".

## Contributing

Contributions are welcome, and greatly appreciated! Contributing doesn't just mean submitting pull requests. There are many different ways for you to get involved, including answering questions on the issues, reporting or triaging bugs, and participating in the features evolution process.

## Acknowledgments

Images coming from [Pixabay](https://pixabay.com)

## License

MIT

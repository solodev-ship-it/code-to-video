import {validateFontManifest} from '@code-to-video/ui/fonts';

export const qaFontManifest = validateFontManifest({schemaVersion: 1, faces: [
  {id: 'atkinson-regular', family: 'Atkinson Hyperlegible', src: '/fonts/atkinson/AtkinsonHyperlegible-Regular.ttf', weight: 400, style: 'normal',
    license: {name: 'SIL Open Font License 1.1', source: 'fonts/atkinson/OFL.txt', redistributionApproved: true},
    licenseId: 'OFL-1.1', licenseDocumentation: 'fonts/atkinson/OFL.txt', attribution: 'Copyright 2020 Braille Institute of America, Inc.'},
  {id: 'atkinson-bold', family: 'Atkinson Hyperlegible', src: '/fonts/atkinson/AtkinsonHyperlegible-Bold.ttf', weight: 700, style: 'normal',
    license: {name: 'SIL Open Font License 1.1', source: 'fonts/atkinson/OFL.txt', redistributionApproved: true},
    licenseId: 'OFL-1.1', licenseDocumentation: 'fonts/atkinson/OFL.txt', attribution: 'Copyright 2020 Braille Institute of America, Inc.'},
]});

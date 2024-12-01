export const audioContainers = new Set([
    'aiff',
    'aif',
    'aifc',

    'm4a',
    'm4v',
    'mp4',
    '3gp',
    'aac',

    'amr',
    '3ga',

    'ape',

    'asf',
    'wma',

    'bwf',
    'wav',

    'dsd',

    'flac',

    'mp2',

    'mkv',
    'mka',

    'mp3',

    'mpc',
    'mpp',

    'ogg',
    'oga',
    'ogv',
    'ogx',

    'opus',

    'spx',

    'webm',

    'wv',
].map(ext => '.' + ext.toLowerCase()))
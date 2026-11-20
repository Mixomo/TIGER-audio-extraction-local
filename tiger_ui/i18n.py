"""Stable task values; translations affect presentation only."""
TEXT = {
    'en': {
        'task': 'Separate', 'speakers': 'Two voices', 'stems': 'Dialogue · music · effects',
        'media': 'From', 'audio': 'Audio', 'video': 'Video', 'file': 'Your audio or video',
        'run': 'Separate tracks', 'retry': 'Separate again', 'example': 'Try an example',
        'prepare': 'Preparing your file', 'separating': 'Separating the tracks',
        'dialogue': 'Dialogue', 'effects': 'Effects', 'music': 'Music', 'voiceA': 'Voice A', 'voiceB': 'Voice B',
        'export': 'Preparing your downloads', 'empty_file': 'Choose a non-empty audio or video file.',
       
        'invalid_file': 'This file could not be read. Try another audio or video file.',
        'no_audio': 'This file has no audio track.', 'video_required': 'Choose a video, or switch to Audio.',
        'decode_failed': 'The audio could not be decoded. Try another file.',
        'failed': 'Separation could not finish. Your file is still here; please try again.',
    },
    'fr': {
        'task': 'Séparer', 'speakers': 'Deux voix', 'stems': 'Dialogues · musique · effets',
        'media': 'Depuis', 'audio': 'Audio', 'video': 'Vidéo', 'file': 'Votre audio ou vidéo',
        'run': 'Séparer les pistes', 'retry': 'Séparer à nouveau', 'example': 'Essayer un exemple',
        'prepare': 'Préparation de votre fichier', 'separating': 'Séparation des pistes',
        'dialogue': 'Dialogues', 'effects': 'Effets', 'music': 'Musique', 'voiceA': 'Voix A', 'voiceB': 'Voix B',
        'export': 'Préparation des téléchargements', 'empty_file': 'Choisissez un fichier audio ou vidéo non vide.',
       
        'invalid_file': 'Ce fichier est illisible. Essayez un autre fichier audio ou vidéo.',
        'no_audio': 'Ce fichier ne contient aucune piste audio.', 'video_required': 'Choisissez une vidéo ou passez au mode Audio.',
        'decode_failed': 'Le son est illisible. Essayez un autre fichier.',
        'failed': 'La séparation a échoué. Votre fichier est conservé ; vous pouvez réessayer.',
    },
}


def choices(lang, group):
    keys = ['speakers', 'stems'] if group == 'task' else ['audio', 'video']
    return [(TEXT[lang][key], key) for key in keys]

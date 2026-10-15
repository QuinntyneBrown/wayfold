# Slide spec: python tools/video-build/feature-deck.py docs/videos/02-join-and-set-up-your-profile/deck.py docs/videos/02-join-and-set-up-your-profile
NUM = '02'
TITLE = 'Join and set up your profile'
SUB = 'Create an account, sign in and choose what members see'
PARTS = ['Introduction', 'The front door', 'Create your account', 'Sign in', 'Settings', 'What others see', 'On your phone', 'Recap']
S, P = 'video-shots', 'video-phone'
SHOTS = {
    'home.png': (S, 'pages__home__default', None),
    'sign-up.png': (S, 'pages__sign-up__default', None),
    'sign-up-invalid.png': (S, 'pages__sign-up__invalid', None),
    'sign-up-submitting.png': (S, 'pages__sign-up__submitting', None),
    'sign-up-success.png': (S, 'pages__sign-up__success', None),
    'sign-in.png': (S, 'pages__sign-in__default', None),
    'sign-in-invalid.png': (S, 'pages__sign-in__invalid', None),
    'sign-in-locked.png': (S, 'pages__sign-in__locked', None),
    'settings.png': (S, 'pages__settings__default', None),
    'settings-invalid.png': (S, 'pages__settings__invalid', None),
    'settings-success.png': (S, 'pages__settings__success', None),
    'member.png': (S, 'pages__member__default', None),
    'menu-phone.png': (P, 'dialogs__site-menu__signed-in', None),
    'not-found.png': (S, 'pages__not-found__default', None),
    'server-error.png': (S, 'pages__server-error__default', None),
}
SLIDES = [
    {'k': 'text', 'h': 'Joining Wayfold, screen by screen', 'lead': 'Sign up · sign in · settings · what others see', 'cue': 'This video walks you through joining', 'part': 0},
    {'k': 'shot', 'img': 'home.png', 'tag': 'Home', 'h': 'Find your people', 'p': 'Browse cars, providers and products without an account.', 'cue': 'The front door', 'part': 1},
    {'k': 'shot', 'img': 'sign-up.png', 'tag': 'Sign up', 'h': 'Name, email, password', 'p': 'Anyone in the GTA can join.', 'cue': 'The sign-up form asks for three things', 'part': 2},
    {'k': 'shot', 'img': 'sign-up-invalid.png', 'tag': 'Invalid', 'h': 'Check these fields', 'p': 'Each field says what it needs.', 'cue': 'If you miss something', 'part': 2},
    {'k': 'strip', 'h': 'Working, then you are in', 'items': [('sign-up-submitting.png', 'Creating your account'), ('sign-up-success.png', 'Add your first car')], 'cue': 'While the account is being created', 'part': 2},
    {'k': 'strip', 'h': 'Sign in', 'items': [('sign-in.png', 'Email and password'), ('sign-in-invalid.png', 'Field-by-field help')], 'cue': 'Coming back is the same idea', 'part': 3},
    {'k': 'shot', 'img': 'sign-in-locked.png', 'tag': 'Locked', 'h': 'Too many attempts', 'p': 'Sign-in pauses for 15 minutes.', 'cue': 'After too many wrong tries', 'part': 3},
    {'k': 'shot', 'img': 'settings.png', 'tag': 'Settings', 'h': 'Choose what members see', 'p': 'Display name, GTA area, optional home church.', 'cue': 'In settings, you choose what members see', 'part': 4},
    {'k': 'text', 'h': 'Your church, your choice', 'lead': 'Shown only to signed-in members, only if you tick the box. Never to visitors.', 'cue': 'Showing your church is your choice', 'part': 4},
    {'k': 'strip', 'h': 'Check, then save', 'items': [('settings-invalid.png', 'At most 80 characters'), ('settings-success.png', 'Saved')], 'cue': 'The church name has a limit', 'part': 4},
    {'k': 'shot', 'img': 'member.png', 'tag': 'Member profile', 'h': 'Priya Nair', 'p': 'Church tag, garage, for sale, recommendations, posts, follow.', 'cue': 'This is how a profile looks', 'part': 5},
    {'k': 'phone', 'img': 'menu-phone.png', 'tag': 'Phone', 'h': 'One menu button', 'p': 'Feed, sell your car, your garage and the rest.', 'cue': 'Wayfold works the same on a phone', 'part': 6},
    {'k': 'strip', 'h': 'When something goes wrong', 'items': [('not-found.png', 'Page not found'), ('server-error.png', 'Something went wrong')], 'cue': 'And if a page doesn', 'part': 6},
    {'k': 'recap', 'items': ['Anyone in the GTA can join', 'Every form says what to fix', 'Too many tries: 15-minute pause', 'Home church: optional, your choice'], 'cue': 'Things to remember', 'part': 7},
    {'k': 'next', 'h': 'Next: your garage', 'lead': 'Add a car, then sell it', 'cue': 'Next time: your garage', 'part': 7},
]

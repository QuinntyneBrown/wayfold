# Slide spec: python tools/video-build/feature-deck.py docs/videos/06-dealers-and-financing-professionals/deck.py docs/videos/06-dealers-and-financing-professionals
NUM = '06'
TITLE = 'Dealers and financing professionals'
SUB = 'List a business, manage inventory, get verified'
PARTS = ['Introduction', 'List your business', 'Dealer profile', 'Inventory', 'Financing pros', 'Recap']
S, F = 'video-shots', 'video-full'
SHOTS = {
    'editor.png': (S, 'pages__provider-editor__default', None),
    'editor-licence.png': (F, 'pages__provider-editor__default', 300),
    'editor-invalid.png': (S, 'pages__provider-editor__invalid', None),
    'editor-success.png': (S, 'pages__provider-editor__success', None),
    'dealer.png': (S, 'pages__provider__dealer', None),
    'inventory-empty.png': (S, 'pages__dealer-inventory__empty', None),
    'add-vehicle.png': (S, 'pages__vehicle-editor__dealer', None),
    'listed.png': (S, 'notifications__inventory-toast__success', None),
    'delete.png': (S, 'dialogs__delete-vehicle__default', None),
    'delete-failed.png': (S, 'dialogs__delete-vehicle__failed', None),
    'financing.png': (S, 'pages__provider__financing', None),
    'answer.png': (F, 'pages__vehicle-detail__default', 860),
}
SLIDES = [
    {'k': 'text', 'h': 'Free for businesses too', 'lead': 'List your business · manage inventory · get verified', 'cue': 'Dealers and financing professionals use Wayfold for free', 'part': 0},
    {'k': 'shot', 'img': 'editor.png', 'tag': 'List your business', 'h': 'One profile, every kind', 'p': 'Name, category, municipality, what you do, contact email.', 'cue': 'Any auto business starts', 'part': 1},
    {'k': 'shot', 'img': 'editor-licence.png', 'tag': 'Financing professionals', 'h': 'Add your licence', 'p': 'Financing licence or credential.', 'cue': 'Financing professionals add one more thing', 'part': 1},
    {'k': 'strip', 'h': 'Check, then submitted', 'items': [('editor-invalid.png', 'Complete the required fields'), ('editor-success.png', 'Verified after the licence check')], 'cue': 'Leave out the name or the description', 'part': 1},
    {'k': 'shot', 'img': 'dealer.png', 'tag': 'Dealer', 'h': 'Eglinton Auto Group', 'p': 'Scarborough. Recommended by 19 members. Inventory below.', 'cue': 'Here is Eglinton Auto Group', 'part': 2},
    {'k': 'shot', 'img': 'inventory-empty.png', 'tag': 'Your inventory', 'h': 'Starts empty', 'p': 'The dealer manages every car here.', 'cue': 'The dealer manages its cars', 'part': 3},
    {'k': 'shot', 'img': 'add-vehicle.png', 'tag': 'Add vehicle', 'h': 'Add dealer inventory', 'p': 'Same form as private sellers. Every car gets a page and a rating.', 'cue': 'Add vehicle opens the same form', 'part': 3},
    {'k': 'shot', 'img': 'listed.png', 'tag': 'Listed', 'h': 'Vehicle listed', 'p': 'Your inventory is up to date.', 'cue': 'When a car is published', 'part': 3},
    {'k': 'strip', 'h': 'Delete, with a check', 'items': [('delete.png', 'Delete this vehicle?'), ('delete-failed.png', 'Could not delete. Try again.')], 'cue': 'To take a car down', 'part': 3},
    {'k': 'shot', 'img': 'financing.png', 'tag': 'Verified', 'h': 'Marcus Chen', 'p': 'FSRA licence checked by Wayfold.', 'cue': 'Now the financing side', 'part': 4},
    {'k': 'shot', 'img': 'answer.png', 'tag': 'Public answer', 'h': 'On the vehicle page', 'p': 'Buyers see the answer where they shop.', 'cue': 'His page lists the public questions', 'part': 4},
    {'k': 'recap', 'items': ['One free profile for every auto business', 'Dealers add, list and delete inventory', 'Verified only after a licence check', 'Answers show on the profile and the car'], 'cue': 'Things to remember', 'part': 5},
    {'k': 'next', 'h': 'That is Wayfold', 'lead': 'Cars, care and community across Toronto and the GTA', 'cue': "That's the whole product", 'part': 5},
]

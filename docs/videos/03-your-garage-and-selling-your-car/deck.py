# Slide spec: python tools/video-build/feature-deck.py docs/videos/03-your-garage-and-selling-your-car/deck.py docs/videos/03-your-garage-and-selling-your-car
NUM = '03'
TITLE = 'Your garage and selling your car'
SUB = 'Add a car, share it, and list it for sale'
PARTS = ['Introduction', 'Your garage', 'Add a car', 'Share it', 'Sell this car', 'What buyers see', 'Recap']
S = 'video-shots'
SHOTS = {
    'garage.png': (S, 'pages__member__own', None),
    'add-car.png': (S, 'dialogs__add-car__default', None),
    'add-car-invalid.png': (S, 'dialogs__add-car__invalid', None),
    'add-car-failed.png': (S, 'dialogs__add-car__failed', None),
    'feed-toast.png': (S, 'notifications__community-toast__success', None),
    'sell.png': (S, 'pages__vehicle-editor__default', None),
    'sell-invalid.png': (S, 'pages__vehicle-editor__invalid', None),
    'sell-success.png': (S, 'pages__vehicle-editor__success', None),
    'private.png': (S, 'pages__vehicle-detail__private', None),
    'sold.png': (S, 'pages__vehicle-detail__sold', None),
}
SLIDES = [
    {'k': 'text', 'h': 'From garage to sale', 'lead': 'Add a car · share it · sell it', 'cue': 'On Wayfold, your cars live in your garage', 'part': 0},
    {'k': 'shot', 'img': 'garage.png', 'tag': 'Your profile', 'h': 'Tendai’s garage', 'p': 'A 2015 Honda Fit called Bluebird. Edit profile and Add a car are yours only.', 'cue': 'This is Tendai Mensah', 'part': 1},
    {'k': 'shot', 'img': 'add-car.png', 'tag': 'Add a car', 'h': 'Year, make, model', 'p': 'Nickname, photo and notes are optional.', 'cue': 'Add a car opens a short form', 'part': 2},
    {'k': 'strip', 'h': 'Mistakes and dropped connections', 'items': [('add-car-invalid.png', 'Check the marked fields'), ('add-car-failed.png', 'Could not send. Your text is still here.')], 'cue': 'Year, make and model are required', 'part': 2},
    {'k': 'shot', 'img': 'feed-toast.png', 'tag': 'Feed', 'h': 'Share with your community', 'p': 'Posts about cars, questions and recommendations.', 'cue': 'Your car can show up in the community feed', 'part': 3},
    {'k': 'shot', 'img': 'sell.png', 'tag': 'Sell your car', 'h': 'Starts from Bluebird', 'p': 'Year, make and model filled in. Add price, mileage, condition, place.', 'cue': 'When it', 'part': 4},
    {'k': 'strip', 'h': 'Check, then publish', 'items': [('sell-invalid.png', 'Check the listing'), ('sell-success.png', 'Your car is listed')], 'cue': 'If the year or price doesn', 'part': 4},
    {'k': 'shot', 'img': 'private.png', 'tag': 'Private listing', 'h': '2019 Toyota RAV4 XLE', 'p': '$29,500 from Priya Nair, private seller in Etobicoke.', 'cue': 'Here is a private listing', 'part': 5},
    {'k': 'text', 'h': 'Fair price', 'lead': 'Compared with 8 similar GTA listings. Seller, church tag and Message seller beside it.', 'cue': 'Wayfold rates the price', 'part': 5},
    {'k': 'shot', 'img': 'sold.png', 'tag': 'Sold', 'h': 'The page stays up', 'p': 'Shared links keep working.', 'cue': 'When a car sells', 'part': 5},
    {'k': 'recap', 'items': ['Your garage: the cars you own', 'Year, make and model are enough', 'A failed save keeps your text', 'Sell this car starts from your garage', 'Price rating and message seller on every listing'], 'cue': 'Things to remember', 'part': 6},
    {'k': 'next', 'h': 'Next: finding a vehicle', 'lead': 'And asking if a deal is good', 'cue': 'Next time: finding a vehicle', 'part': 6},
]

# Slide spec: python tools/video-build/feature-deck.py docs/videos/04-finding-a-vehicle-and-the-deal-question/deck.py docs/videos/04-finding-a-vehicle-and-the-deal-question
NUM = '04'
TITLE = 'Finding a vehicle and the deal question'
SUB = 'Search every seller, read the price rating, ask if it is a good deal'
PARTS = ['Introduction', 'Search', 'The vehicle page', 'Ask about this deal', 'Message the seller', 'Recap']
S, F = 'video-shots', 'video-full'
SHOTS = {
    'vehicles.png': (S, 'pages__vehicles__default', None),
    'no-results.png': (S, 'pages__vehicles__no-results', None),
    'detail.png': (S, 'pages__vehicle-detail__default', None),
    'no-rating.png': (S, 'pages__vehicle-detail__no-rating', None),
    'answer.png': (F, 'pages__vehicle-detail__default', 860),
    'ask.png': (S, 'dialogs__ask-expert__default', None),
    'ask-invalid.png': (S, 'dialogs__ask-expert__invalid', None),
    'ask-success.png': (S, 'dialogs__ask-expert__success', None),
    'no-questions.png': (F, 'pages__vehicle-detail__no-questions', 860),
    'contact.png': (S, 'dialogs__contact-dealer__default', None),
    'contact-success.png': (S, 'dialogs__contact-dealer__success', None),
}
SLIDES = [
    {'k': 'text', 'h': 'Is this a good deal?', 'lead': 'Search · price rating · public questions · message the seller', 'cue': 'This video shows how you find a car', 'part': 0},
    {'k': 'shot', 'img': 'vehicles.png', 'tag': 'Vehicles', 'h': 'One search, every seller', 'p': 'Private sellers and dealers. Filter by seller type, make, municipality.', 'cue': 'Vehicles is one search', 'part': 1},
    {'k': 'text', 'h': 'A rating on every card', 'lead': 'RAV4: fair price · Civic: good price · Mazda3: great price', 'cue': 'Every card shows the price', 'part': 1},
    {'k': 'shot', 'img': 'no-results.png', 'tag': 'No results', 'h': 'No matches', 'p': 'One button clears the filters.', 'cue': 'If your filters are too narrow', 'part': 1},
    {'k': 'shot', 'img': 'detail.png', 'tag': 'Vehicle page', 'h': '2021 Honda Civic Sport', 'p': '$24,995 from Eglinton Auto Group. Good price against 12 GTA listings.', 'cue': 'Every vehicle has its own page', 'part': 2},
    {'k': 'shot', 'img': 'no-rating.png', 'tag': 'No rating', 'h': 'Not enough to compare', 'p': 'Wayfold says so instead of guessing.', 'cue': 'When there aren', 'part': 2},
    {'k': 'shot', 'img': 'answer.png', 'tag': 'Public Q&A', 'h': 'Is 6.99% over 84 months a good offer?', 'p': 'Answered by Marcus Chen, verified financing professional.', 'cue': 'Here is the part no other car site has', 'part': 3},
    {'k': 'shot', 'img': 'ask.png', 'tag': 'Ask about this deal', 'h': 'Pick a topic, ask in public', 'p': 'Up to 1,000 characters. The next buyer learns from it.', 'cue': 'To ask your own', 'part': 3},
    {'k': 'strip', 'h': 'Nudge, then posted', 'items': [('ask-invalid.png', 'Write your question'), ('ask-success.png', 'Posted')], 'cue': 'An empty question gets a gentle nudge', 'part': 3},
    {'k': 'shot', 'img': 'no-questions.png', 'tag': 'No questions yet', 'h': 'Be the first to ask', 'p': 'The section invites the first question.', 'cue': 'On a car nobody has asked about yet', 'part': 3},
    {'k': 'strip', 'h': 'Message the seller', 'items': [('contact.png', 'Up to 2,000 characters'), ('contact-success.png', 'Sent')], 'cue': "When you're ready, message the seller", 'part': 4},
    {'k': 'recap', 'items': ['One search, every GTA seller', 'A price rating, or an honest “not enough data”', 'Public questions, verified answers', 'Message the seller when ready'], 'cue': 'Things to remember', 'part': 5},
    {'k': 'next', 'h': 'Next: providers you can trust', 'lead': 'And how recommendations work', 'cue': 'Next time: the providers', 'part': 5},
]

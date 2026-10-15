# Slide spec: python tools/video-build/feature-deck.py docs/videos/05-providers-and-recommendations/deck.py docs/videos/05-providers-and-recommendations
NUM = '05'
TITLE = 'Providers and recommendations'
SUB = 'Find a provider people trust, recommend one, and recommend products'
PARTS = ['Introduction', 'Directory', 'Provider page', 'Recommend', 'Products', 'Recap']
S = 'video-shots'
SHOTS = {
    'providers.png': (S, 'pages__providers__default', None),
    'providers-none.png': (S, 'pages__providers__no-results', None),
    'provider.png': (S, 'pages__provider__default', None),
    'recommend.png': (S, 'dialogs__recommend__default', None),
    'recommend-invalid.png': (S, 'dialogs__recommend__invalid', None),
    'recommend-success.png': (S, 'dialogs__recommend__success', None),
    'member-recs.png': (S, 'pages__member__recommendations', None),
    'feed.png': (S, 'pages__home__feed', None),
    'products.png': (S, 'pages__products__default', None),
    'recommend-product.png': (S, 'dialogs__recommend__product', None),
}
SLIDES = [
    {'k': 'text', 'h': 'Who you can see, not who you know', 'lead': 'Providers · recommendations · products', 'cue': 'Finding an honest mechanic', 'part': 0},
    {'k': 'shot', 'img': 'providers.png', 'tag': 'Providers', 'h': 'Every kind of auto business', 'p': 'Filter by category and GTA municipality.', 'cue': 'Providers lists the auto people', 'part': 1},
    {'k': 'text', 'h': 'Ranked by recommendations', 'lead': 'Danforth Auto Care 28 · Eglinton Auto Group 19 · Marcus Chen 15 · Steeles Brake & Tire 11', 'cue': 'The list is ranked by recommendations', 'part': 1},
    {'k': 'shot', 'img': 'providers-none.png', 'tag': 'No results', 'h': 'No matches', 'p': 'One button clears the filters.', 'cue': 'Too narrow a search', 'part': 1},
    {'k': 'shot', 'img': 'provider.png', 'tag': 'Provider page', 'h': 'Danforth Auto Care', 'p': 'Owner’s church for signed-in members. Member recommendations with names.', 'cue': 'Here is Danforth Auto Care', 'part': 2},
    {'k': 'shot', 'img': 'recommend.png', 'tag': 'Recommend', 'h': '10 to 500 characters', 'p': 'Honest sentences, not stars.', 'cue': 'To recommend Danforth yourself', 'part': 3},
    {'k': 'strip', 'h': 'Check, then posted', 'items': [('recommend-invalid.png', 'Write 10 to 500 characters'), ('recommend-success.png', 'Posted')], 'cue': 'Too short, and the form asks', 'part': 3},
    {'k': 'strip', 'h': 'Where it shows up', 'items': [('provider.png', 'The provider page'), ('member-recs.png', 'Your profile'), ('feed.png', 'The feed')], 'cue': 'Your recommendation then shows up', 'part': 3},
    {'k': 'shot', 'img': 'products.png', 'tag': 'Products', 'h': 'Recommended, not sold', 'p': 'What members use and where they bought it.', 'cue': 'Products work the same way', 'part': 4},
    {'k': 'shot', 'img': 'recommend-product.png', 'tag': 'Recommend a product', 'h': 'Name, category, where, why', 'p': 'No checkout. Just the facts members need.', 'cue': 'To recommend a product', 'part': 4},
    {'k': 'recap', 'items': ['Ranked by recommendations you can see', '10 to 500 honest characters', 'On the provider page, your profile, the feed', 'Products: recommended, never sold'], 'cue': 'Things to remember', 'part': 5},
    {'k': 'next', 'h': 'Next: dealers and financing pros', 'lead': 'Inventory and verified answers', 'cue': 'Next time: dealers', 'part': 5},
]

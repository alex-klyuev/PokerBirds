const mongoose = require('mongoose');

// for local use:
// mongoose.connect('mongodb://localhost/PokerBirds', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

// for deployment through docker:
mongoose.connect('mongodb://db:27017/PokerBirds', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

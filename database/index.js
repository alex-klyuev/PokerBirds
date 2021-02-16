const mongoose = require('mongoose');

mongoose.connect('mongodb://database/PokerBirds', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

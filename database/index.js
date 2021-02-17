const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/PokerBirds', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

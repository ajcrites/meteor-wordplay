Game = function () {
};
Game.prototype = {
    init: function () {
        // create a new game w/ fresh board
        this.game_id = Games.insert({board: new_board()});
        this.game_clock_id = GameClocks.insert({game_id: this.game_id, clock: 3});

        // move everyone who is ready in the lobby to the game
        Players.update({game_id: null, idle: false, name: {$ne: ''}},
                       {$set: {game_id: this.game_id}},
                       {multi: true});
        // Save a record of who is in the game, so when they leave we can
        // still show them.
        var p = Players.find({game_id: this.game_id},
                             {fields: {_id: true, name: true}}).fetch();
        Games.update({_id: this.game_id}, {$set: {players: p}});

        // wind down the game clock
        var clock = 3;
        var interval = Meteor.setInterval(function () {
          clock -= 1;
          GameClocks.update({game_id: this.game_id}, {$set: {clock: clock}});

          // end of game
          if (clock === 0) {
            // stop the clock
            Meteor.clearInterval(interval);
            // declare zero or more winners
            var scores = {};
            Words.find({game_id: this.game_id}).forEach(function (word) {
              if (!scores[word.player_id])
                scores[word.player_id] = 0;
              scores[word.player_id] += word.score;
            });
            var high_score = _.max(scores);
            var winners = [];
            _.each(scores, function (score, player_id) {
              if (score === high_score)
                winners.push(player_id);
            });
            Games.update(this.game_id, {$set: {winners: winners}});
          }
        }, 1000);

        return this.game_id;
    }
}

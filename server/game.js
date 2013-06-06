////////// Server only logic //////////

Meteor.methods({
  restart_game: function (game_id) {
     Games.update(game_id, {$set: {winners: []}});
     GameClocks.update(game_id, {$set: {clock: 120}});
  },
  start_new_game: function () {
      var game = new Game;
      return game.init();
  },


  keepalive: function (player_id) {
    check(player_id, String);
    Players.update({_id: player_id},
                  {$set: {last_keepalive: (new Date()).getTime(),
                          idle: false}});
  }
});

Meteor.setInterval(function () {
  var now = (new Date()).getTime();
  var idle_threshold = now - 70*1000; // 70 sec
  var remove_threshold = now - 60*60*1000; // 1hr

  Players.update({last_keepalive: {$lt: idle_threshold}},
                 {$set: {idle: true}});

  // XXX need to deal with people coming back!
  // Players.remove({$lt: {last_keepalive: remove_threshold}});

}, 30*1000);

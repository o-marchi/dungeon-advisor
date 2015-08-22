global.UI = {
  renderer: null,
  gold: 100,
  w: null,
  h: null,
  floors: [[], []],
  max_rooms: 4,
  max_floors: 8,
  change: false,
  clouds: [],
  spawn_counter: 0,
  spawn_wait: 0,
  spawn_point: {x: 2, y: 14.5},
  heroes: [],
  num_heroes: 0,
  bg: null,
  fg: null,
  ctx: null,
  statuses: [],
  counters: [],
  init: function(ctx){
    this.ctx = ctx;
    this.w = Math.floor(GAME.width / CHAR_WIDTH);
    this.h = Math.floor(GAME.height / CHAR_HEIGHT);
    this.menu = new Menu('MENU', 25,  this.h - 20);
    this.renderer = new Renderer(GAME.width, GAME.height, 1);
    this.bg = new Renderer(GAME.width, GAME.height, 1);
    this.fg = new Renderer(GAME.width, GAME.height, 1);


    for(var x=0; x < this.w; x++) {
      if(Math.random() > 0.95)
      {
        var c = new Sprite(x, H.GetRandom(1, 3), new Char('@', 'FFFFFF', undefined, 0.2));
        c.body.velocity.x = 1;
        this.clouds.push(c);
      }
      if((x%14 === 0) && (Math.random() > 0.5) && (x > 20))
        S.OUTDOOR.stamp.stamp(this.bg.context, x, 0);
      for(var y=0; y < this.h; y++) {
        if(y > 4)
          if((x > this.w-29) && (x < this.w-3) && (y > 6) && (y < this.h - 2))
            P.BOX_MD.stamp(this.bg.context, x, y);
          else if((x < 3) || (x > (this.w-32)) || (y < 7))
            P.randomSolid().stamp(this.fg.context, x, y);
          else
            P.VOID.stamp(this.bg.context, x, y);
      }
    }
    this.bg.context.font = HEADING_FONT;
    this.bg.context.strokeStyle = 'white';
    this.bg.context.lineWidth = 5;
    this.bg.context.strokeText('dungeon', 10, 44);
    this.bg.context.fillText('dungeon', 10, 44);
    this.bg.context.fillStyle = '#579441';
    this.bg.context.strokeText('advisor', 135, 44);
    this.bg.context.fillText('advisor', 135, 44);
    this.renderer.stamp(ctx);

    this.counters.push(new Counter(new Char('●', 'FFE545'), this, 'gold'));
    this.counters.push(new Counter(new Char('#', 'FA6728'), this, 'num_heroes'));
    for(var i=0; i < 20; i++)
      this.addRoom(R.random());

    // this.menu.stamp(this.renderer.context, this.w-27, 19);
  },
  addStatus: function(hero, title, text){
    var tmp = [];
    tmp.push(new StatusUpdate(hero, title, text));
    this.statuses.forEach(function(status){
      tmp.push(status);
    });
    if(tmp.length > 5)
      tmp.pop().kill  ();
    this.statuses = tmp;
  },
  addRoom: function(type){
    var added = false;
    this.floors.forEach(function(f, i) {
      if((f.length < (this.max_rooms)) && !added)
      {
        added = true;
        f.push(new Room(type, ((i%2)== 1)));
      }
    }.bind(this));

    if(!added)
      if(this.floors.length < (this.max_floors))
        this.floors.push([new Room(type, ((this.floors.length%2)==1))]);
      else
        console.log('No room');
  },
  spawnHero: function() {
    this.heroes.push(E.GetRandomHero(1));
    this.num_heroes = this.heroes.length;
  },
  removeHero: function(hero) {
    // this.heroes = H.RemoveFromArray(this.heroes, hero);
    var tmp = [];
    hero.end();
    H.Null(hero);
    this.num_heroes = this.heroes.length;
  },
  update: function(dt){
    this.clouds.forEach(function(cloud, idx){
      if(cloud.x > (this.w + 2))
        cloud.body.x = -1;
    }.bind(this));
    this.spawn_counter += dt;
    if(this.spawn_counter > this.spawn_wait)
    {
      this.spawn_counter = 0;
      this.spawn_wait = H.GetRandom(8, 14);
      this.spawnHero();
    }
    var _tmp = [];
    this.heroes.forEach(function(hero) {
      hero.update(dt);
      if(hero.sprite.x < (this.w - 31))
        if(hero.sprite.x < (this.spawn_point.x - 1))
          if((hero.current_floor === undefined) || (hero.current_floor < this.floors.length))
            _tmp.push(this.flipHero(hero));
          else
            _tmp.push(hero);
        else
          _tmp.push(hero);
      else
        if((hero.current_floor === undefined) || (hero.current_floor < this.floors.length))
          _tmp.push(this.flipHero(hero));
        else
          this.removeHero(hero);
    }.bind(this));
    this.heroes = _tmp;

  },
  flipHero: function(hero) {
    if(hero.current_floor === undefined)
      hero.current_floor = 1;
    else
      hero.current_floor += 1;
    hero.body.y += ROOM_HEIGHT;
    hero.turnAround();
    return hero;
  },
  draw: function() {
    var ctx = this.renderer.context;
    ctx.clearRect(0, 0, GAME.width, GAME.height);

    this.bg.stamp(ctx);

    this.clouds.forEach(function(cloud, idx){
      cloud.stamp(ctx);
    });
    this.floors.forEach(function(floor, y) {
      floor.forEach(function(room, x) {
        room.renderer.stamp(ctx, 3 + (x * ROOM_WIDTH), 7 + (y * ROOM_HEIGHT));
      });
    });
    this.heroes.forEach(function(hero) {
      hero.stamp(ctx);
    });

    this.statuses.forEach(function(status, y){
      status.stamp(ctx, this.w-27, 8 + (y * 4));
    }.bind(this));

    this.counters.forEach(function (counter, x){
      counter.stamp(ctx, 3 + (x*7), 4);
    }.bind(this));

    this.fg.stamp(ctx);

    // this.type.stamp(ctx, this.w-27, 9);

    this.renderer.stamp(g_ctx);
  }
};

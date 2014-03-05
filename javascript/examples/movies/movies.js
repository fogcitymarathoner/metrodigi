// An example Backbone application contributed by
// [Jérôme Gravel-Niquet](http://jgn.me/). This demo uses a simple
// [LocalStorage adapter](backbone-localstorage.html)
// to persist Backbone models within your browser.

// Load the application once the DOM is ready, using `jQuery.ready`:
$(function(){
    // Actor-Movie Association Model

    var ActorMovie = Backbone.Model.extend({
        // Default attributes for the movie item.
        defaults: function() {
            return {
                movie_id: "",
                actor_id: ''
            };
        }
    });

    // ActorMovie Collection
    // ---------------

    // The collection of movies is backed by *localStorage* instead of a remote
    // server.
    var ActorMovieList = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: ActorMovie,

        // Save all of the actors-movies association under the `"actors-movies"` namespace.
        localStorage: new Backbone.LocalStorage("actors-movies-backbone")


    });

    var ActorsMovies = new ActorMovieList();

    // Movie Model
    // ----------

    var currentYear = (new Date).getFullYear();
    // Our basic **Movie** model has 'pk', `title`, `year`, and `notes` attributes.
    var Movie = Backbone.Model.extend({
        // Default attributes for the movie item.
        defaults: function() {
            return {
                title: "empty Movie Title ...",
                year: currentYear,
                notes: "empty Movie Notes ...",
                rating: "empty Movie Rating ...",
                gross: "empty gross ...",
                director: "empty director ...",
                genre: "empty genre ..."
            };
        }
    });

    // Movie Collection
    // ---------------

    // The collection of movies is backed by *localStorage* instead of a remote
    // server.
    var MovieList = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: Movie,

        // Save all of the movies items under the `"movies"` namespace.
        localStorage: new Backbone.LocalStorage("movies-backbone"),

        // Todos are sorted by their original insertion order.
        comparator: function(movie) {
            return movie.get('pk');
        }

    });


    // Create our global collection of **Movies**.
    var Movies = new MovieList();
    var MovieListView = Backbone.View.extend({
        el: '.page',
        render: function () {
            var that = this;
            var movies =  Movies;

            localStorage= new Backbone.LocalStorage("movies-backbone");
            movies = Movies.localStorage.findAll();
            var template = _.template($('#movie-list-template').html(), {movies: movies.reverse(), type: 'movies'});

            that.$el.html(template);
        }

    });

    var movieListView = new MovieListView();


    $.fn.serializeObject = function() {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function() {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };

    var MovieEditView = Backbone.View.extend({
        el: '.page',
        model: Movies,
        events: {
            'click #delete-movie': 'deleteMovie',
            'submit .edit-movie-form': 'saveMovie'
        },
        saveMovie: function (ev) {
            var movieDetails = $(ev.currentTarget).serializeObject();

            var that = this;

            this.model.localStorage= new Backbone.LocalStorage("movies-backbone");

            movie = new Movie({'id': movieDetails.id, 'title': movieDetails.title, 'notes': movieDetails.notes,
                'year': movieDetails.year, 'rating': movieDetails.rating,
                'gross': movieDetails.gross, 'director': movieDetails.director, 'genre': movieDetails.genre
            });

            if (movieDetails.id == null)
            {
                Movies.localStorage.create(movie);
                last_indx = Movies.localStorage.records.length;

                last_movie = Movies.localStorage.records[last_indx-1];

                movie_id = last_movie;
            } else {
                Movies.localStorage.update(movie);

                actors_movies = ActorsMovies;
                all_associations = actors_movies.localStorage.findAll();

                // filter and delete  actors associated with this movie
                for(var key in all_associations) {
                    if(all_associations[key].movie_id == movieDetails.id)
                    {

                        association = new ActorMovie({id: all_associations[key].id});
                        actors_movies.localStorage.destroy(association);
                    }
                }

                movie_id = movieDetails.id;
            }

            console.log(movie_id);

            actors_movies = ActorsMovies;
            // detect associated actors selected
            for(var key in movieDetails) {
                if(/^actor_/.test(key))
                {
                    actor_id = key.replace(/^actor_/, '');
                    actor_movie_association = new ActorMovie({'movie_id': movie_id, 'actor_id': actor_id});
                    actors_movies.localStorage.create(actor_movie_association);
                }
            }
            router.navigate('', {trigger:true}); // Redirect to home
        },
        deleteMovie: function (ev) {
            var that = this;

            var movies =  Movies;
            this.model.localStorage= new Backbone.LocalStorage("movies-backbone");

            that.movie = new Movie({id: that.movie.id});
            actors_movies = ActorsMovies;
            all_associations = actors_movies.localStorage.findAll();

            // filter and delete  actors associated with this movie
            for(var key in all_associations) {

                if(all_associations[key].movie_id == that.movie.id)
                {

                    association = new ActorMovie({id: all_associations[key].id});
                    actors_movies.localStorage.destroy(association);
                }
            }
            this.model.localStorage.destroy(that.movie);
            router.navigate('', {trigger:true}); // Redirect to home
        },
        render: function (options) {
            var that = this;
            this.model.localStorage= new Backbone.LocalStorage("movies-backbone");
            actors = Actors.localStorage.findAll()


            if(options.id) {
                that.movie = new Movie({id: options.id});

                actors_movies = ActorsMovies;
                all_associations = actors_movies.localStorage.findAll();

                // filter this movie's associations'
                var this_movie_associations = [];
                for(var key in all_associations) {
                    if(all_associations[key].movie_id == options.id)
                    {
                        this_movie_associations.push(all_associations[key].actor_id)
                    }
                }
                movie = Movies.localStorage.find(that.movie);

                var template = _.template($('#edit-movie-template').html(), {movie: movie, actors: actors, associations: this_movie_associations});
                that.$el.html(template);
            } else {
                var template = _.template($('#edit-movie-template').html(), {movie: null, actors: actors, associations: this_movie_associations});
                that.$el.html(template);
            }
        }
    });

    var movieEditView = new MovieEditView;


    // Actor Model
    // ----------

    // Our basic **Actor** model has firstname and last attributes.
    var Actor = Backbone.Model.extend({
        // Default attributes for the movie item.
        defaults: function() {
            return {
                firstname: "empty firstname ...",
                lastname: "empty lastname ...",
                gender: 'empty gender',
                dob: 'empty dob'
            };
        }
    });

    // Actor Collection
    // ---------------

    // The collection of todos is backed by *localStorage* instead of a remote
    // server.
    var ActorList = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: Actor,

        // Save all of the movies items under the `"movies"` namespace.
        localStorage: new Backbone.LocalStorage("actors-backbone")


    });


    // Create our global collection of **Movies**.
    var Actors = new ActorList();
    var ActorListView = Backbone.View.extend({
        el: '.page',
        render: function () {
            var that = this;
            var actors =  Actors;

            localStorage= new Backbone.LocalStorage("actors-backbone");
            actorslist = Actors.localStorage.findAll()
            var template = _.template($('#actor-list-template').html(), {actors: actorslist, type: 'actors'});

            that.$el.html(template);
        }

    });

    var actorListView = new ActorListView();


    var ActorEditView = Backbone.View.extend({
        el: '.page',
        model: Actors,
        events: {
            'click #delete-actor': 'deleteActor',
            'submit .edit-actor-form': 'saveActor'
        },
        saveActor: function (ev) {
            var actorDetails = $(ev.currentTarget).serializeObject();
            this.model.localStorage= new Backbone.LocalStorage("actors-backbone");

            actor = new Actor({'id': actorDetails.id, 'firstname': actorDetails.firstname,
                'lastname': actorDetails.lastname,
                'gender': actorDetails.gender,
                'dob': actorDetails.dob
            });

            if (actorDetails.id == null)
            {
                Actors.localStorage.create(actor);
                last_indx = Actors.localStorage.records.length;

                last_actor = Actors.localStorage.records[last_indx-1];

                actor_id = last_actor;
            } else {
                Actors.localStorage.update(actor);

                actors_movies = ActorsMovies;
                all_associations = actors_movies.localStorage.findAll();

                // filter and delete  movies associated with this actor
                for(var key in all_associations) {
                    if(all_associations[key].actors_id == actorDetails.id)
                    {
                        association = new ActorMovie({id: all_associations[key].id});
                        actors_movies.localStorage.destroy(association);
                    }
                }

                actor_id = actorDetails.id;
            }
            // detect associated actors selected
            actors_movies = ActorsMovies;
            for(var key in actorDetails) {
                if(/^movie_/.test(key))
                {
                    movie_id = key.replace(/^movie_/, '');
                    actor_movie_association = new ActorMovie({'movie_id': movie_id, 'actor_id': actor_id});
                    actors_movies.localStorage.create(actor_movie_association);
                }
            }
            router.navigate('actors', {trigger:true}); // Redirect to home
        },
        deleteActor: function (ev) {
            var that = this;

            var actors =  Actors;
            this.model.localStorage= new Backbone.LocalStorage("actors-backbone");
            that.actor = new Actor({id: that.actor.id});


            actors_movies = ActorsMovies;
            all_associations = actors_movies.localStorage.findAll();

            // filter and delete  movies associated with this actor
            for(var key in all_associations) {
                if(all_associations[key].actors_id == that.actor.id)
                {
                    association = new ActorMovie({id: all_associations[key].id});
                    actors_movies.localStorage.destroy(association);
                }
            }

            this.model.localStorage.destroy(that.actor);
            router.navigate('actors', {trigger:true}); // Redirect to home
        },
        render: function (options) {
            var that = this;
            this.model.localStorage= new Backbone.LocalStorage("actors-backbone");

            movies = Movies.localStorage.findAll()
            if(options.id) {
                that.actor = new Actor({id: options.id});

                actors_movies = ActorsMovies;
                all_associations = actors_movies.localStorage.findAll();

                // filter this actor's associations'
                var this_actor_associations = [];
                for(var key in all_associations) {
                    if(all_associations[key].actor_id == options.id)
                    {
                        this_actor_associations.push(all_associations[key].movie_id)
                    }
                }
                actor = Actors.localStorage.find(that.actor);

                var template = _.template($('#edit-actor-template').html(), {actor: actor, movies: movies, associations: this_actor_associations});
                that.$el.html(template);
            } else {
                var template = _.template($('#edit-actor-template').html(), {actor: null, movies: movies, associations: this_actor_associations});
                that.$el.html(template);
            }
        }
    });

    var actorEditView = new ActorEditView;
    var MovieActorSearchView = Backbone.View.extend({
        el: '.page',
        render: function (options) {
            var that = this;


            movies = Movies.localStorage.findAll()
            actorslist = Actors.localStorage.findAll()
            links = [];

            for(var key in movies) {
                id = movies[key].id;
                title =  movies[key].title;
                link = {'href':'#edit/'+id, 'title':title};
                links.push(link);
            }
            for(var key in actorslist) {
                id = actorslist[key].id;
                title =  actorslist[key].firstname+' '+actorslist[key].lastname;
                link = {'href':'#edit_actor/'+id, 'title':title};
                links.push(link);
            }

            console.log(links);
            var template = _.template($('#search-movie-actor-template').html(), {links: links});
            that.$el.html(template);
            $('#example').dataTable();
        }
    });
    var movieActorSearchView = new MovieActorSearchView;


    // The Application
  // ---------------

  // Our overall **AppView** is the top-level piece of UI.
  var AppView = Backbone.View.extend({


  });

  // Finally, we kick things off by creating the **App**.
  var App = new AppView;

    var Router = Backbone.Router.extend({
        routes: {
            "": "home",
            "edit/:id": "edit",
            "actors": "actors",
            "new": "edit",
            "edit_actor/:id": "edit_actor",
            "new_actor": "edit_actor",
            "search": "search"
        }
    });

    var router = new Router;
    router.on('route:home', function() {
        // render actor list
        movieListView.render();
    });
    router.on('route:actors', function() {
        // render actor list
        actorListView.render();
    });

    router.on('route:edit', function(id) {
        movieEditView.render({id: id});
    });

    router.on('route:edit_actor', function(id) {
        actorEditView.render({id: id});
    });

    router.on('route:search', function(id) {
        movieActorSearchView.render({id: id});
    });
    Backbone.history.start();
});

function htmlEncode(value){
    return $('<div/>').text(value).html();
    };

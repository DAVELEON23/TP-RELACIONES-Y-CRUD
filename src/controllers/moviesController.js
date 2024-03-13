const path = require('path');
const db = require('../database/models');
const sequelize = db.sequelize;
const { Op } = require("sequelize");


//Aqui tienen una forma de llamar a cada uno de los modelos
// const {Movies,Genres,Actor} = require('../database/models');

//Aquí tienen otra forma de llamar a los modelos creados
const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor;


const moviesController = {
    'list': (req, res) => {
        db.Movie.findAll({
            include: ['genre']
        })
            .then(movies => {
                res.render('moviesList.ejs', {movies})
            })
    },
    'detail': (req, res) => {
        db.Movie.findByPk(req.params.id,
            {
                include : ['genre']
            })
            .then(movie => {
                res.render('moviesDetail.ejs', {movie});
            });
    },
    'new': (req, res) => {
        db.Movie.findAll({
            order : [
                ['release_date', 'DESC']
            ],
            limit: 5
        })
            .then(movies => {
                res.render('newestMovies', {movies});
            });
    },
    'recomended': (req, res) => {
        db.Movie.findAll({
            where: {
                rating: {[db.Sequelize.Op.gte] : 8}
            },
            order: [
                ['rating', 'DESC']
            ]
        })
            .then(movies => {
                res.render('recommendedMovies.ejs', {movies});
            });
    },
    //Aqui dispongo las rutas para trabajar con el CRUD
    add: function (req, res) {
        const genres = Genres.findAll();
        const actors = Actors.findAll();
        Promise.all([genres,actors])
        .then (([allGenres,allActors])=>{
            res.render("moviesAdd",{allGenres,allActors})
        }) .catch(error => 
            res.send(error))
        
    },
    create: function (req,res) {
        const{title,rating,awards,release_date,length,genre_id}=req.body;
        Movies.create({
            title:title,
            rating:rating,
            awards:awards,
            release_date:release_date,
            length:length,
            genre_id:genre_id,
        })
        .then(()=>{
            res.redirect("/movies")
        }) .catch(error => 
            console.log(error))
    },
    edit: function(req,res) {
        const id = req.params.id;
        const movies = db.Movie.findByPk(id,{include :['genre', 'actors']});
        const genres = db.Genre.findAll();
        const actors = db.Actor.findAll();
        Promise.all([movies ,genres ,actors])
            .then(([Movie , allGenres, allActors]) => {res.render('moviesEdit', { Movie, allGenres,allActors})
            }).catch(error => 
                console.log(error))
    },
    update: function (req,res) {
        const id = req.params.id;
        const { title, rating, awards, release_date,length,genre_id } = req.body;
        Movies.update(
            {
                title: title,
                rating: rating,
                awards: awards,
                release_date: release_date,
                length: length,
                genre_id: genre_id
            },
            {where: {id: id}
            })
        .then(()=> {return res.redirect('/movies')}
        )
        .catch(error => res.send(error))
    },
    delete: function (req,res) {
        const id = req.params.id;
        db.Movie.findByPk(id)
        .then(Movie => {res.render('moviesDelete', {Movie, id})
        })
        .catch(error => res.send(error))
    },
    destroy: async (req,res) => {
        const id = req.params.id;
        try {
            
            await Movies.destroy({
                where: { id: id }
            });
            res.redirect("/movies");
        }
        catch (error){console.log(error)}
}
    }


module.exports = moviesController;
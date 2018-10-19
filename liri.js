// Code to read and set any environment variables with the dotenv package
require('dotenv').config();

// Importing files needed to run the funtions
const fs = require("fs");
const keys = require('./keys.js');
const request = require('request');
const Spotify = require('node-spotify-api');
const moment = require('moment');
const colors = require('colors')

let liriCommand = process.argv[2];
let input = process.argv[3];
//======================================================================

// Available commands for liri 
//spotify-this-song, movie-this, concert-this, do-what-it-says
function commands(liriCommand, input) {
    switch (liriCommand) {

        case "spotify-this-song":
            getSong(input);
            break;

        case "movie-this":
            getMovie(input);
            break;

        case "concert-this":
            concertThis();
            break;

        case "do-what-it-says":
            getRandom();
            break;

        //If no command is entered, this is the default message to user
        default:
            console.log("No valid argument has been provided, please enter one of the following commands:'spotify-this-song', 'movie-this', 'concert-this', 'do-what-it-says' followed by parameter.".red);
    }
}
//========================================================================

// FUNCTION FOR EACH LIRI COMMAND
//Function for Spotify
function getSong(songName) {
    let spotify = new Spotify(keys.spotify);

    //If no song is provided, use "The Sign" 
    if (!songName) {
        songName = "whats My Age Again".blue;
    };

    console.log(songName.green);

    //Callback to spotify to search for song name
    spotify.search({ type: 'track', query: songName}, function(err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        } 
        console.log("-------------------------------------------------------------------".red + "\r\n" + "Artist: ".rainbow + data.tracks.items[0].artists[0].name.cyan + "\nSong name: ".rainbow + data.tracks.items[0].name.cyan +
        "\nAlbum Name: ".rainbow + data.tracks.items[0].album.name.cyan + "\nPreview Link: ".rainbow + data.tracks.items[0].preview_url.cyan + "\r\n" + "-------------------------------------------------------------------".red); 
        
        //Creates a variable to save text into log.txt file
        var logSong = "Artist: " + data.tracks.items[0].artists[0].name + "\nSong name: " + data.tracks.items[0].name +
        "\nAlbum Name: " + data.tracks.items[0].album.name + "\nPreview Link: " + data.tracks.items[0].preview_url + "\n";

        //Appends text to log.txt file
        fs.appendFile('log.txt', logSong, function (err) {
            if (err) throw err;
        });

        logResults(data);
    });
};

//Function for movies
function getMovie(movieName) {
    //If no movie name is provided, use Mr.Nobody as default
    if (!movieName) {
        movieName = "mr nobody";
        console.log("If you havent watched this then you should, its on netflix!".magenta)
    }

    // Runs a request to the OMDB API with the movie specified
    let queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&r=json&tomatoes=true&apikey=trilogy";

    //Callback to OMDB API to get movie info
    request(queryUrl, function (error, response, body) {

        // If the request is successful
        if (!error && response.statusCode === 200) {
            let movieObject = JSON.parse(body);

            //console.log(movieObject); // Show the text in the terminal
            let movieResults =
                "-------------------------------------------------------------------".red + "\r\n" +
                "Title: ".rainbow + movieObject.Title.cyan + "\r\n" +
                "Year: ".rainbow + movieObject.Year.cyan + "\r\n" +
                "Imdb Rating: ".rainbow + movieObject.imdbRating.cyan + "\r\n" +
                "Rotten Tomatoes Rating: ".rainbow + movieObject.tomatoRating.cyan + "\r\n" +
                "Country: ".rainbow + movieObject.Country.cyan + "\r\n" +
                "Language: ".rainbow + movieObject.Language.cyan + "\r\n" +
                "Plot: ".rainbow + movieObject.Plot.cyan + "\r\n" +
                "Actors: ".rainbow + movieObject.Actors.cyan + "\r\n" +
                "-------------------------------------------------------------------".red + "\r\n";
            console.log(movieResults.cyan);

            //Appends movie results to log.txt file
            fs.appendFile('log.txt', movieResults, function (err) {
                if (err) throw err;
            });
            logResults(response);
        }
        else {
            console.log("Error :" + error);
            return;
        }
    });
};

//BandsInTown =============================================
function concertThis() {

    //Grab user input
    let artist = input;

    //If user doesn't enter artist, return error
    if (!artist) {
        console.log("ERROR: You did not provide an artist!".red);
        return;
    } else {
        artist = artist.trim();
    }

    //Search bandsintown for artist
    let queryUrl =
        "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=" + keys.bandsintown;
    request(queryUrl, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            let data = JSON.parse(body);
            let formatTime = moment(data[0].datetime.slice(0, 10), "YYYY-MM-DD").format("dddd MMMM Do, YYYY");
            let artistData = [
                "Venue Name: ".rainbow + data[0].venue.name.cyan,
                "Venue Location: ".rainbow + data[0].venue.city.cyan + ", " + data[0].venue.country.cyan,
                "Date: ".rainbow + formatTime.cyan
            ].join("\n\n");

            //appends file to log
            fs.appendFile("log.txt", artistData  , function (err) {
                if (err) throw err;
                console.log("-------------------------------------------------------------------".red + "\r\n" + "NEXT SHOW FOR:" + artist.toUpperCase() +
                    "\n\n" + artistData +
                    "\r\n" + "-------------------------------------------------------------------".red);
            });
        }
    });
}


//Function for Random
function getRandom() {
    //Reads text in random.txt file
    fs.readFile("random.txt", "utf8", function (error, data) {
        if (error) {
            return console.log(error);
        }
        else {
            console.log(data);

            //creates a variable for data in random.txt
            let randomData = data.split(",");
            //passes data into getSong function
            commands(randomData[0], randomData[1]);
        }
    });
};


//Function to log results from the other functions
function logResults(data) {
    fs.appendFile("log.txt", data, function (err) {
        if (err)
            throw err;
    });
};

commands(liriCommand, input);

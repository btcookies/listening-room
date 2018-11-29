import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import './App.css';
import Spotify from 'spotify-web-api-js';


const spotifyWebApi = new Spotify();

class App extends Component {
  constructor(){
    super();
    const params = this.getHashParams();
    this.state = {
      loggedIn: params.access_token ? true : false,
      nowPlaying: {
        name: 'Not Checked',
        image: ''
      },
      playlist: {
        id: "0NXu9CZfJUBbXnd5SE9EJW", // change this to a playlist you own
        content: []
      }
    };
    if (params.access_token) {
      spotifyWebApi.setAccessToken(params.access_token);
    }
  }

  // get spotify credential params to prove premium access
  getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }

  // gets the currently playing song title and image for display on
  // front page
  getNowPlaying() {
    spotifyWebApi.getMyCurrentPlaybackState()
      .then((response) => {
        this.setState({
          nowPlaying: {
            name: response.item.name,
            image: response.item.album.images[0].url
          }
        })
      })
  }

  // getting list of tracks in a playlist using spotifyWebApi
  getSongs() {
    const playlistURI = this.state.playlist.id;
    this.setState({playlist: { id: playlistURI, content: []}});
    spotifyWebApi.getPlaylistTracks(playlistURI)
      .then((response) => {
        response.items.map((object) =>
          this.setState({
            playlist: {
              id: playlistURI,
              content:
                [...this.state.playlist.content,
                {"songName": object.track.name,
                "url": object.track.external_urls.spotify,
                votes: 0}]
            }
          }))
      })
  }

  // adds song to playlist identified in the this.state.playlist.id field
  addSong() {
    const songURI = prompt("What song would you like to add? Paste the uri here.", "");
    if (songURI === null) {
      alert("Sorry, you did not input a valid uri. Please try again.");
    } else {
      console.log("Grabbed song uri: " + songURI);
      spotifyWebApi.addTracksToPlaylist(this.state.playlist.id, [songURI])
      .then((object) => console.log(object)/* do nothing*/)
    }
  }

  // removes song from playlist identified in the this.state.playlist.id field
  removeSong() {
    const songURI = prompt("What song would you like to remove? Paste the uri here.", "");
    if (songURI === null) {
      alert("Sorry, you did not input a valid uri. Please try again.");
    } else {
      console.log("Grabbed song uri: " + songURI);
      spotifyWebApi.removeTracksFromPlaylist(this.state.playlist.id, [songURI])
      .then((object) => console.log(object)/* do nothing*/)
    }
  }

  // set refresh time for 1 second to keep playlist updated
  // componentDidMount() {
  //   this.interval = setInterval(() => this.getSongs(), 1000);
  // }
  //
  // componentWillUnmount() {
  //   clearInterval(this.interval);
  // }

  render() {

    let listSongs = this.state.playlist.content.map((song) =>
        <Router key={song.songName}>
          <li>
            <a href={song.url}> { song.songName }</a>
            <button>
              upvote
            </button>
            <button>
              downvote
            </button>
          </li>
        </Router>);

    return (
      <div className="App">
        <a href='http://localhost:8888'>
          <button>Login With Spotify</button>
        </a>
        <div>Now Playing: { this.state.nowPlaying.name } </div>
        <div>
          <img src= { this.state.nowPlaying.image } style={{width: 100}}/>
        </div>
        <button onClick={() => this.getNowPlaying()}>
          Check Now Playing
        </button>
        <div>
        Playlist:
        { listSongs }
        <button onClick={() => this.getSongs()}>
          Refresh Playlist
        </button>
        <button onClick={() => this.addSong()}>
          Add Song
        </button>
        <button onClick={() => this.removeSong()}>
          Remove Song
        </button>
        </div>
      </div>
    );
  }
}

export default App;

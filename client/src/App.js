import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import './App.css';
import Spotify from 'spotify-web-api-js';
import $ from 'jquery';

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
        name: 'Current Playlist',
        content: [{"songName": "Crew",
                   "url": "https://open.spotify.com/track/3jEtESxn2ngF25DMD6vbBg?si=omRx4yCdSI2oHjItqbfACw"},
                  {"songName": "Lost In Japan",
                   "url": "https://open.spotify.com/track/6WBTeFDEfAJbaSUUc1V1xQ?si=oFCUXZYBSX-5xRfhMu5KTA"},
                  {"songName": "1999 WILDFIRE",
                   "url": "https://open.spotify.com/track/1t4pPnbkOjzoA5RvsDjvUU?si=utREqrTmTVum9kKuAQQz0g"}]
      },
    };
    if (params.access_token) {
      spotifyWebApi.setAccessToken(params.access_token);
    }
  }
  getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }
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

  updatePlaylist() {
    const name = prompt("What's the name of the song you are adding?", "<insert title here>");
    const code = prompt("Copy and paste the Song Link from Spotify into this field", "<insert code here>");
    let canContinue = name !== null && code !== null ? true : false;

    // jquery call to get HTML object from string
    //
    // REVISIT THIS TO SEE IF WE CAN GET COOL EMBEDDED PLAYLIST
    //
    // const embedHTML = $(code);


    if (!canContinue) {
      alert("Sorry, you've entered invalid input[s]. Please try again.");
    } else {
      console.log("This is the name value stored: " + name + "\n");
      console.log("This is the embed code stored: " + code + "\n");
      this.setState({
        playlist: {
          content: [...this.state.playlist.content, {"songName": name, "url": code}]
        }
      });
      console.log(this.state.playlist.content);
    }
  }
  render() {

    // const playlist = [{"songName": "Crew",
    //                    "embed": <iframe src="https://open.spotify.com/embed/track/15EPc80XuFrb2LmOzGjuRg"
    //                                     width="300" height="380" frameborder="0"
    //                                     allowtransparency="true" allow="encrypted-media"></iframe>},
    //                   {"songName": "Lost In Japan",
    //                    "embed": <iframe src="https://open.spotify.com/embed/track/79esEXlqqmq0GPz0xQSZTV"
    //                                     width="300" height="380" frameborder="0"
    //                                     allowtransparency="true" allow="encrypted-media"></iframe>},
    //                   {"songName": "1999 WILDFIRE",
    //                    "embed": <iframe src="https://open.spotify.com/embed/track/1t4pPnbkOjzoA5RvsDjvUU"
    //                                     width="300" height="380" frameborder="0"
    //                                     allowtransparency="true" allow="encrypted-media"></iframe>}
    //
    //                   ];
    let listSongs = this.state.playlist.content.map((song) =>
        <Router key={song.songName}>
          <li>
            <a href={song.url}> { song.songName }</a>
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
        </div>
        <div>
        <button onClick={() => this.updatePlaylist()}>
          Add To Playlist
        </button>
        </div>
      </div>
    );
  }
}

export default App;

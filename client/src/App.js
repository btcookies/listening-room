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
    let canContinue = name !== "<insert title here>" && code !== "<insert code here>" ? true : false;

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

        /**
           * Fetches a specific playlist.
           * See [Get a Playlist](https://developer.spotify.com/web-api/get-playlist/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {string} playlistId The id of the playlist. If you know the Spotify URI it is easy
           * to find the playlist id (e.g. spotify:user:xxxx:playlist:<here_is_the_playlist_id>)
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getPlaylist = function(playlistId, options, callback) {
            var requestData = {
              url: _baseUri + '/playlists/' + playlistId
            };
            return _checkParamsAndPerformRequest(requestData, options, callback);
          };

          /**
           * Fetches the tracks from a specific playlist.
           * See [Get a Playlist's Tracks](https://developer.spotify.com/web-api/get-playlists-tracks/) on
           * the Spotify Developer site for more information about the endpoint.
           *
           * @param {string} playlistId The id of the playlist. If you know the Spotify URI it is easy
           * to find the playlist id (e.g. spotify:user:xxxx:playlist:<here_is_the_playlist_id>)
           * @param {Object} options A JSON object with options that can be passed
           * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
           * one is the error object (null if no error), and the second is the value if the request succeeded.
           * @return {Object} Null if a callback is provided, a `Promise` object otherwise
           */
          Constr.prototype.getPlaylistTracks = function(playlistId, options, callback) {
            var requestData = {
              url: _baseUri + '/playlists/' + playlistId + '/tracks'
            };
            return _checkParamsAndPerformRequest(requestData, options, callback);
          };

          /**
            * Add tracks to a playlist.
            * See [Add Tracks to a Playlist](https://developer.spotify.com/web-api/add-tracks-to-playlist/) on
            * the Spotify Developer site for more information about the endpoint.
            *
            * @param {string} playlistId The id of the playlist. If you know the Spotify URI it is easy
            * to find the playlist id (e.g. spotify:user:xxxx:playlist:<here_is_the_playlist_id>)
            * @param {Array<string>} uris An array of Spotify URIs for the tracks
            * @param {Object} options A JSON object with options that can be passed
            * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
            * one is the error object (null if no error), and the second is the value if the request succeeded.
            * @return {Object} Null if a callback is provided, a `Promise` object otherwise
            */
           Constr.prototype.addTracksToPlaylist = function(playlistId, uris, options, callback) {
             var requestData = {
               url: _baseUri + '/playlists/' + playlistId + '/tracks',
               type: 'POST',
               postData: {
                 uris: uris
               }
             };
             return _checkParamsAndPerformRequest(requestData, options, callback, true);
           };

           /**
 * Reorder tracks in a playlist
 * See [Reorder a Playlist’s Tracks](https://developer.spotify.com/web-api/reorder-playlists-tracks/) on
 * the Spotify Developer site for more information about the endpoint.
 *
 * @param {string} playlistId The id of the playlist. If you know the Spotify URI it is easy
 * to find the playlist id (e.g. spotify:user:xxxx:playlist:<here_is_the_playlist_id>)
 * @param {number} rangeStart The position of the first track to be reordered.
 * @param {number} insertBefore The position where the tracks should be inserted. To reorder the tracks to
 * the end of the playlist, simply set insert_before to the position after the last track.
 * @param {Object} options An object with optional parameters (range_length, snapshot_id)
 * @param {function(Object,Object)} callback An optional callback that receives 2 parameters. The first
 * one is the error object (null if no error), and the second is the value if the request succeeded.
 * @return {Object} Null if a callback is provided, a `Promise` object otherwise
 */
Constr.prototype.reorderTracksInPlaylist = function(playlistId, rangeStart, insertBefore, options, callback) {
  /* eslint-disable camelcase */
  var requestData = {
    url: _baseUri + '/playlists/' + playlistId + '/tracks',
    type: 'PUT',
    postData: {
      range_start: rangeStart,
      insert_before: insertBefore
    }
  };
  /* eslint-enable camelcase */
  return _checkParamsAndPerformRequest(requestData, options, callback);
};

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

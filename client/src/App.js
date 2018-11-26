import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import './App.css';
import Spotify from 'spotify-web-api-js';
import $ from 'jquery';


const spotifyWebApi = new Spotify();

/* global module */
'use strict';

/**
 * Class representing the API
 */
var SpotifyWebApi = (function() {
  var _baseUri = 'https://api.spotify.com/v1';
  var _accessToken = null;
  var _promiseImplementation = null;

  var WrapPromiseWithAbort = function(promise, onAbort) {
    promise.abort = onAbort;
    return promise;
  };

  var _promiseProvider = function(promiseFunction, onAbort) {
    var returnedPromise;
    if (_promiseImplementation !== null) {
      var deferred = _promiseImplementation.defer();
      promiseFunction(
        function(resolvedResult) {
          deferred.resolve(resolvedResult);
        },
        function(rejectedResult) {
          deferred.reject(rejectedResult);
        }
      );
      returnedPromise = deferred.promise;
    } else {
      if (window.Promise) {
        returnedPromise = new window.Promise(promiseFunction);
      }
    }

    if (returnedPromise) {
      return new WrapPromiseWithAbort(returnedPromise, onAbort);
    } else {
      return null;
    }
  };

  var _extend = function() {
    var args = Array.prototype.slice.call(arguments);
    var target = args[0];
    var objects = args.slice(1);
    target = target || {};
    objects.forEach(function(object) {
      for (var j in object) {
        if (object.hasOwnProperty(j)) {
          target[j] = object[j];
        }
      }
    });
    return target;
  };

  var _buildUrl = function(url, parameters) {
    var qs = '';
    for (var key in parameters) {
      if (parameters.hasOwnProperty(key)) {
        var value = parameters[key];
        qs += encodeURIComponent(key) + '=' + encodeURIComponent(value) + '&';
      }
    }
    if (qs.length > 0) {
      // chop off last '&'
      qs = qs.substring(0, qs.length - 1);
      url = url + '?' + qs;
    }
    return url;
  };

  var _performRequest = function(requestData, callback) {
    var req = new XMLHttpRequest();

    var promiseFunction = function(resolve, reject) {
      function success(data) {
        if (resolve) {
          resolve(data);
        }
        if (callback) {
          callback(null, data);
        }
      }

      function failure() {
        if (reject) {
          reject(req);
        }
        if (callback) {
          callback(req, null);
        }
      }

      var type = requestData.type || 'GET';
      req.open(type, _buildUrl(requestData.url, requestData.params));
      if (_accessToken) {
        req.setRequestHeader('Authorization', 'Bearer ' + _accessToken);
      }
      if (requestData.contentType) {
        req.setRequestHeader('Content-Type', requestData.contentType)
      }

      req.onreadystatechange = function() {
        if (req.readyState === 4) {
          var data = null;
          try {
            data = req.responseText ? JSON.parse(req.responseText) : '';
          } catch (e) {
            console.error(e);
          }

          if (req.status >= 200 && req.status < 300) {
            success(data);
          } else {
            failure();
          }
        }
      };

      if (type === 'GET') {
        req.send(null);
      } else {
        var postData = null
        if (requestData.postData) {
          postData = requestData.contentType === 'image/jpeg' ? requestData.postData : JSON.stringify(requestData.postData)
        }
        req.send(postData);
      }
    };

    if (callback) {
      promiseFunction();
      return null;
    } else {
      return _promiseProvider(promiseFunction, function() {
        req.abort();
      });
    }
  };

  var _checkParamsAndPerformRequest = function(requestData, options, callback, optionsAlwaysExtendParams) {
    var opt = {};
    var cb = null;

    if (typeof options === 'object') {
      opt = options;
      cb = callback;
    } else if (typeof options === 'function') {
      cb = options;
    }

    // options extend postData, if any. Otherwise they extend parameters sent in the url
    var type = requestData.type || 'GET';
    if (type !== 'GET' && requestData.postData && !optionsAlwaysExtendParams) {
      requestData.postData = _extend(requestData.postData, opt);
    } else {
      requestData.params = _extend(requestData.params, opt);
    }
    return _performRequest(requestData, cb);
  };


/**
 * Creates an instance of the wrapper
 * @constructor
 */
var Constr = function() {};

Constr.prototype = {
  constructor: SpotifyWebApi
};

/**
 * Fetches a resource through a generic GET request.
 *
 * @param {string} url The URL to be fetched
 * @param {function(Object,Object)} callback An optional callback
 * @return {Object} Null if a callback is provided, a `Promise` object otherwise
 */
Constr.prototype.getGeneric = function(url, callback) {
  var requestData = {
    url: url
  };
  return _checkParamsAndPerformRequest(requestData, callback);
};


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
      playlist: []
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
  getPlaylistTracksAPI() {
    this.setState({playlist: []});
    spotifyWebApi.getPlaylistTracks("5tx4WPl98jpQUZ6X19S1Wo")
      .then((response) => {
        response.items.map((object) =>
          this.setState({
            playlist:
            [...this.state.playlist,
              {"songName": object.track.name,
              "url": object.track.external_urls.spotify,
              votes: 0}]
          }))

      })
  }

  // set refresh time for 1 second to keep playlist updated
  componentDidMount() {
    this.interval = setInterval(() => this.getPlaylistTracksAPI(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {

    let listSongs = this.state.playlist.map((song) =>
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
      </div>
    );
  }
}

export default App;

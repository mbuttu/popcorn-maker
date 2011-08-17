/**********************************************************************************

Copyright (C) 2011 by Mozilla Foundation

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

**********************************************************************************/

(function ( window, document, undefined ) {

  var modules = {};

  /****************************************************************************
   * Track
   ****************************************************************************/
  var numTracks = 0;
  var Track = function ( options ) {
    var trackEvents = [],
        id = numTracks++,
        butter = undefined,
        that = this;

    options = options || {};
    var name = options.name || 'Track' + Date.now();

    this.getName = function () {
      return name;
    }; //getName

    this.getId = function () {
      return id;
    }; //getId

    this.getTrackEvent = function ( trackId ) {
      for ( var i=0, l=trackEvents.length; i<l; ++i) {
        if ( trackEvents[i].getId() === trackId || trackEvents[i].getName() === trackId ) {
          return trackEvents[i];
        } //if
      } //for
    }; //getTrackEvent

    this.getTrackEvents = function () {
      return trackEvents;
    }; //getTrackEvents

    this.removeTrackEvent = function ( trackEvent ) {
      if ( typeof(trackEvent) === "string" ) {
        trackEvent = that.getTrackEvent( trackEvent );
      } //if

      var idx = trackEvents.indexOf( trackEvent );

      if ( idx > -1 ) {
        trackEvents.splice( idx, 1 );
        trackEvent.track = undefined;
        trackEvent.setButter( undefined );
        butter.trigger( "trackeventremoved", trackEvent );
      } //if
    }; //removeTrackEvent

    this.addTrackEvent = function ( trackEvent ) {
      if ( !( trackEvent instanceof TrackEvent ) ) {
        trackEvent = new TrackEvent( trackEvent );
      } //if
      trackEvents.push( trackEvent );

      trackEvent.track = that;
      butter && trackEvent.setButter( butter );
      return trackEvent;
    }; //addTrackEvent

    this.setButter = function ( b ) {
      butter = b;
      if ( butter ) {
        butter.trigger( "trackadded", that );
        var events = that.getTrackEvents();
        for ( var i=0, l=events.length; i<l; ++i ) {
          events[i].setButter( butter );
        } //for
      }
    };

    this.getButter = function ()  {
      return butter;
    };

    this.importJSON = function ( importData ) {
      if ( importData.name ) {
        name = importData.name;
      }
      if ( importData.trackEvents ) {
        var importTrackEvents = importData.trackEvents;
        for ( var i=0, l=importTrackEvents.length; i<l; ++i ) {
          var newTrackEvent = new TrackEvent();
          newTrackEvent.importJSON( importTrackEvents[ i ] );
          that.addTrackEvent( newTrackEvent );
        }
      }
    };

    this.exportJSON = function () {
      var exportJSONTrackEvents = [];
      for ( var i=0, l=trackEvents.length; i<l; ++i ) {
        exportJSONTrackEvents.push( trackEvents[ i ].exportJSON() );
      }
      return {
        name: name,
        trackEvents: exportJSONTrackEvents
      };
    };

  }; //Track

  /****************************************************************************
   * TrackEvent
   ****************************************************************************/
  var numTrackEvents = 0;
  var TrackEvent = function ( options ) {
    var id = numTrackEvents++,
        butter = undefined,
        that = this;

    options = options || {};
    var name = options.name || 'Track' + Date.now();
    this.start = options.start || 0;
    this.end = options.end || 0;
    this.type = options.type;
    this.popcornOptions = options.popcornOptions;
    this.popcornEvent = options.popcornEvent;
    this.track = options.track;
    
    this.getName = function () {
      return name;
    };

    this.getId = function () {
      return id;
    }; //getId

    this.setButter = function ( b ) {
      butter = b;
      butter && butter.trigger( "trackeventadded", that );
    };

    this.getButter = function ()  {
      return butter;
    };

    this.importJSON = function ( importData ) {
      this.start = importData.start || 0;
      this.end = importData.end || 0;
      this.type = importData.type;
      if ( importData.name ) {
        name = importData.name;
      }
      this.popcornOptions = importData.popcornOptions;
    };

    this.exportJSON = function () {
      return {
        start: this.start,
        end: this.end,
        type: this.type,
        popcornOptions: this.popcornOptions,
        track: this.track ? this.track.getName() : undefined,
        name: name
      };
    };

  }; //TrackEvent

  /****************************************************************************
   * Target 
   ****************************************************************************/
  var numTargets = 0;
  var Target = function ( options ) {
    var id = numTargets++;

    options = options || {};
    var name = options.name || "Target" + id + Date.now();
    this.object = options.object;

    this.getName = function () {
      return name;
    }; //getName

    this.getId = function () {
      return id;
    }; //getId

    this.importJSON = function ( importData ) {
      if ( importData.name ) {
        name = importData.name
      }
      this.object = importData.object
    };

    this.exportJSON = function () {
      var obj;
      try {
        obj = JSON.stringify( this.object );
      }
      catch ( e ) {
        obj = this.object.toString();
      }
      return {
        name: name,
        object: obj
      };
    };
  }; //Target

  /****************************************************************************
   * Media
   ****************************************************************************/
  var numMedia = 0;
  var Media = function ( options ) {
    options = options || {};

    var tracksByName = {},
        tracks = [],
        id = numMedia++,
        name = options.name || "Media" + id + Date.now(),
        url,
        target,
        butter = undefined,
        currentTime = 0,
        duration = 0,
        that = this;

    this.getUrl = function () {
      return url;
    };

    this.getTarget = function () {
      return target;
    };

    this.setUrl = function ( newUrl ) {
      if ( url !== newUrl ) {
        url = newUrl;
        butter && butter.trigger( "mediacontentchanged", that );
      }
    };

    this.setTarget = function ( newTarget ) {
      if ( target !== newTarget ) {
        target = newTarget;
        butter && butter.trigger( "mediatargetchanged", that );
      }
    };

    this.getName = function () {
      return name;
    };

    this.getId = function () {
      return id;
    };

    this.getTracks = function () {
      return tracks;
    };

    this.setButter = function ( b ) {
      if ( b !== butter ) {      
        butter = b;
        if ( butter ) {
          butter.trigger( "mediaadded", that );
          var tracks = that.getTracks();
          for ( var i=0, l=tracks.length; i<l; ++i ) {
            tracks[i].setButter( butter );
          } //for
        }
      } //if
    };

    this.getButter = function ()  {
      return butter;
    };

    this.addTrack = function ( track ) {
      if ( !(track instanceof Track) ) {
        track = new Track( track );
      } //if
      tracksByName[ track.getName() ] = track;
      tracks.push( track );
      butter && track.setButter( butter );
      return track;
    }; //addTrack

    this.getTrack = function ( name ) {
      var track = tracksByName[ name ];
      if ( track ) {
         return track;
      } //if

      for ( var i=0, l=tracks.length; i<l; ++i ) {
        if ( tracks[i].getName() === name ) {
          return tracks[i];
        } //if
      } //for

      return undefined;
    }; //getTrack

    this.removeTrack = function ( track ) {
      if ( typeof(track) === "string" ) {
        track = that.getTrack( track );
      } //if
      var idx = tracks.indexOf( track );
      if ( idx > -1 ) {
        tracks.splice( idx, 1 );
        track.setButter( undefined );
        delete tracksByName[ track.getName() ];
        var events = track.getTrackEvents();
        for ( var i=0, l=events.length; i<l; ++i ) {
          butter.trigger( "trackeventremoved", events[i] );
        } //for
        butter && butter.trigger( "trackremoved", track );
        return track;
      } //if
      return undefined;    
    }; //removeTrack

    this.currentTime = function ( time ) {
      if ( time !== undefined ) {
        currentTime = time;
        butter && butter.trigger("mediatimeupdate", that);
      } //if
      return currentTime;
    }; //currentTime

    this.duration = function ( time ) {
      if ( time ) {
        duration = time;
        butter && butter.trigger("mediadurationchanged", that);
      }
      return duration;
    }; //duration

    this.importJSON = function ( importData ) {
      if ( importData.name ) {
        name = importData.name;
      }
      importData.target && that.setTarget( importData.target );
      importData.url && that.setUrl( importData.url );
      
      //butter.listen( "timelineready", function(){
        if ( importData.tracks ) {
          var importTracks = importData.tracks;
          for ( var i=0, l=importTracks.length; i<l; ++i ) {
            var newTrack = new Track();
            newTrack.importJSON( importTracks[ i ] );
            that.addTrack( newTrack );
          }
        }
      //});
    };

    this.exportJSON = function () {
      var exportJSONTracks = [];
      for ( var i=0, l=tracks.length; i<l; ++i ) {
        exportJSONTracks.push( tracks[ i ].exportJSON() );
      }
      return {
        name: name,
        url: url,
        target: target,
        duration: duration,
        tracks: exportJSONTracks
      };
    };

    options.url && this.setUrl( options.url );
    options.target && this.setTarget( options.target );

  }; //Media

  /****************************************************************************
   * Butter
   ****************************************************************************/
  var numButters = 0;
  var Butter = function ( options ) {

    var events = {},
        medias = [],
        mediaByName = {},
        currentMedia,
        targets = [],
        targetsByName = {},
        projectDetails = {},
        that = this;
        
    this.id = "Butter" + numButters++;

    function checkMedia() {
      if ( !currentMedia ) {
        throw new Error("No media object is selected");
      } //if
    }

    /****************************************************************
     * Event methods
     ****************************************************************/
    //trigger - Triggers an event indicating a change of state in the core
    this.trigger = function ( name, options, domain ) {
      var eventObj = {
        type: name,
        domain: domain,
        data: options
      };

      if ( events[ name ] ) {
        //for (var i=0, l=events[ name ].length; i<l; ++i) {
        for ( var i=events[ name ].length - 1; i>=0; --i ) {
          events[ name ][ i ].call( that, eventObj, domain );
        } //for
      } //if
      if ( domain ) {
        name = name + domain;
        if ( events[ name ] ) {
          for ( var i=events[ name ].length - 1; i>=0; --i ) {
          //for (var i=0, l=events[ name ].length; i<l; ++i) {
            events[ name ][ i ].call( that, eventObj, domain );
          } //for
        } //if
      } //if
    }; //trigger

    //listen - Listen for events triggered by the core
    this.listen = function ( name, handler, domain ) {
      domain = domain || "";
      name = name + domain;
      if ( !events[ name ] ) {
        events[ name ] = [];
      } //if
      events[ name ].push( handler );
    }; //listen

    //unlisten - Stops listen for events triggered by the core
    this.unlisten = function ( name, handler, domain ) {
      domain = domain || "";
      name = name + domain;
      var handlerList = events[ name ];
      if ( handlerList ) {
        if ( handler ) {
          var idx = handlerList.indexOf( handler );
          handlerList.splice( idx, 1 );
        }
        else {
          events[ name ] = [];
        } //if
      } //if
    }; //unlisten

    /****************************************************************
     * TrackEvent methods
     ****************************************************************/
    //addTrackEvent - Creates a new Track Event
    this.addTrackEvent = function ( track, trackEvent ) {
      checkMedia();
      if ( typeof(track) === "string" ) {
        track = currentMedia.getTrack( track );
      } //if
      if ( track ) {
        if ( !(trackEvent instanceof TrackEvent) ) {
          trackEvent = new TrackEvent( trackEvent );
        } //if
        track.addTrackEvent( trackEvent );
        return trackEvent;
      }
      else {
        throw new Error("No valid track specified");
      } //if
    }; //addTrackEvents

    //getTrackEvents - Get a list of Track Events
    this.getTrackEvents = function () {
      checkMedia();
      var tracks = currentMedia.getTracks();
      var trackEvents = {};
      for ( var i=0, l=tracks.length; i<l; ++i ) {
        var track = tracks[i];
        trackEvents[ track.getName() ] = track.getTrackEvents();
      } //for
      return trackEvents;
    }; //getTrackEvents

    this.getTrackEvent = function ( track, trackEvent ) {
      checkMedia();
      if ( track && trackEvent ) {
        if ( typeof(track) === "string" ) {
          track = that.getTrack( track );
        } //if
        return track.getTrackEvent( trackEvent );
      }
      else {
        var events = that.getTrackEvents();
        for ( var trackName in events ) {
          var t = events[ trackName ];
          for ( var i=0, l=t.length; i<l; ++i ) {
            if ( t[ i ].getName() === track ) {
              return t[ i ];
            }
          }
        } //for
      } //if
    }; //getTrackEvent

    //removeTrackEvent - Remove a Track Event
    this.removeTrackEvent = function ( track, trackEvent ) {

      checkMedia();

      // one param given
      if ( !trackEvent ) {
        if ( track instanceof TrackEvent ) {
          trackEvent = track;
          track = trackEvent.track;
        }
        else if ( typeof(track) === "string" ) {
          trackEvent = that.getTrackEvent( track );
          track = trackEvent.track;
        }
        else {
          throw new Error("Invalid parameters for removeTrackEvent");
        }
      } //if

      if ( typeof( track ) === "string") {
        track = that.getTrack( track );
      }

      if ( typeof( trackEvent ) === "string" ) {
        trackEvent = track.getTrackEvent( trackEvent );
      }

      track.removeTrackEvent( trackEvent );
      return trackEvent;
    };

    /****************************************************************
     * Track methods
     ****************************************************************/
    //addTrack - Creates a new Track
    this.addTrack = function ( track ) {
      checkMedia();
      return currentMedia.addTrack( track );
    }; //addTrack

    //getTracks - Get a list of Tracks
    this.getTracks = function () {
      checkMedia();
      return currentMedia.getTracks();
    }; //getTracks

    //getTrack - Get a Track by its id
    this.getTrack = function ( name ) {
      checkMedia();
      return currentMedia.getTrack( name );
    }; //getTrack

    //removeTrack - Remove a Track
    this.removeTrack = function ( track ) {
      checkMedia();
      return currentMedia.removeTrack( track );
    };

    /****************************************************************
     * Target methods
     ****************************************************************/
    //addTarget - add a target object
    this.addTarget = function ( target ) {
      if ( !(target instanceof Target) ) {
        target = new Target( target );
      } //if

      targetsByName[ target.getName() ] = target;
      targets.push( target );

      that.trigger( "targetadded", target );

      return target;
    };

    //removeTarget - remove a target object
    this.removeTarget = function ( target ) {
      if ( typeof(target) === "string" ) {
        target = that.getTarget( target );
      } //if
      var idx = targets.indexOf( target );
      if ( idx > -1 ) {
        targets.splice( idx, 1 );
        delete targets[ target.getName() ]; 
        that.trigger( "targetremoved", target );
        return target;
      } //if
      return undefined;
    };

    //getTargets - get a list of targets objects
    this.getTargets = function ( serialize ) {
      if ( serialize ) {
        var sTargets = [];
        for ( var i=0, l=targets.length; i<l; ++i ) {
          sTargets.push( targets[i].exportJSON() );
        } 
        return sTargets;
      }
      else {
        return targets;
      }
    };

    //getTarget - get a target object by its id
    this.getTarget = function ( name ) {
      return targetsByName[ name ];
    };

    /****************************************************************
     * Project methods
     ****************************************************************/
    //importProject - Import project data
    this.importProject = function ( projectData ) {
      projectDetails = projectData.project;
      if ( projectData.targets ) {
        for ( var i=0, l=projectData.targets.length; i<l; ++i ) {

          var t, targets = that.getTargets(), targetData = projectData.targets[ i ];
          for ( var k=0, j=targets.length; k<j; ++k ) {
            if ( targets[ k ].getName() === targetData.name ) {
              t = targets[ k ];
            }
          }

          if ( !t ) {
            t = new Target();
            t.importJSON( projectData.targets[ i ] );
            that.addTarget( t );
          }
          else {
            t.importJSON( projectData.targets[ i ] );
          }
        }
      }
      if ( projectData.media ) {
        for ( var i=0, l=projectData.media.length; i<l; ++i ) {

          var m, medias = that.getAllMedia(), mediaData = projectData.media[ i ];
          for( var k = 0, j = medias.length; k < j; k++ ) { 
            if( medias[ k ].getTarget() === mediaData.target && medias[ k ].getUrl() === mediaData.url ) {
              m = medias[ k ];  
            }
          }

          if ( !m ) {
            m = new Media();
            m.importJSON( projectData.media[ i ] );
            that.addMedia( m );
          }
          else {
            m.importJSON( projectData.media[ i ] );
          }
          
        }
      }
    };

    //exportProject - Export project data
    this.exportProject = function () {
      var exportJSONMedia = [];
      for ( var m=0, lm=medias.length; m<lm; ++m ) {
        exportJSONMedia.push( medias[ m ].exportJSON() );
      }
      var projectData = {
        project: projectDetails,
        targets: that.getTargets( true ),
        media: exportJSONMedia
      };
      return projectData;
    };

    //setProjectDetails - set the details of the project
    this.setProjectDetails = function ( key, value ) {
      projectDetails[ key ] = value;
    };

    //getProjectDetails - get the projects details
    this.getProjectDetails = function ( key ) {
      if ( key ) {
        return projectDetails[ key ];
      }
      else {
        return projectDetails;
      }
    };
    
    this.clearProject = function() {
      var allTargets = that.getTargets(),
      allMedias = that.getAllMedia();
      for ( var i = 0, l = allTargets.length; i < l; i++ ) {
        that.removeTarget( allTargets[ i ] );
      }
      for ( var i = 0, l = allMedias.length; i < l; i++ ) {
        that.removeMedia( allMedias[ i ] );
      }
    };

    /****************************************************************
     * Media methods
     ****************************************************************/
    //currentTime - Gets and Sets the media's current time.
    this.currentTime = function ( time ) {
      checkMedia();
      return currentMedia.currentTime( time );
    };

    //duration - Gets and Sets the media's duration.
    this.duration = function ( time ) {
      checkMedia();
      return currentMedia.duration( time );
    };

    //getAllMedia - returns all stored media objects
    this.getAllMedia = function () {
      return medias;
    };

    //getMedia - get the media's information
    this.getMedia = function ( media ) {
      if ( mediaByName[ media ] ) {
        return mediaByName[ media ];
      }

      for ( var i=0,l=medias.length; i<l; ++i ) {
        if ( medias[i].getName() === media ) {
          return medias[i];
        }
      }

      return undefined;
    };

    //getCurrentMedia - returns the current media object
    this.getCurrentMedia = function () {
      return currentMedia;
    };

    //setMedia - set the media's information
    this.setMedia = function ( media ) {
      if ( typeof( media ) === "string" ) {
        media = that.getMedia( media );
      } //if

      if ( media && medias.indexOf( media ) > -1 ) {
        currentMedia = media;
        that.trigger( "mediachanged", media );
        return currentMedia;
      } //if
    };

    //addMedia - add a media object
    this.addMedia = function ( media ) {
      if ( !( media instanceof Media ) ) {
        media = new Media( media );
      } //if

      var mediaName = media.getName();
      medias.push( media );
      mediaByName[ mediaName ] = media;

      media.setButter( that );
      if ( !currentMedia ) {
        that.setMedia( media );
      } //if
      return media;
    };

    //removeMedia - forget a media object
    this.removeMedia = function ( media ) {
      if ( typeof( media ) === "string" ) {
        media = that.getMedia( media );
      } //if

      var idx = medias.indexOf( media );
      if ( idx > -1 ) {
        medias.splice( idx, 1 );
        delete mediaByName[ media.getName() ];
        var tracks = media.getTracks();
        for ( var i=0, l=tracks.length; i<l; ++i ) {
          that.trigger( "trackremoved", tracks[i] );
        } //for
        media.setButter( undefined );
        if ( media === currentMedia ) {
          
          currentMedia = undefined;
        } //if
        that.trigger( "mediaremoved", media );
        return media;
      } //if
      return undefined;
    };

    this.extend = function () {
      Butter.extend( that, [].slice.call( arguments, 1 ) );
    };

    /****************************************************************
     * Init Modules for this instance
     ****************************************************************/
    /*
    for ( var moduleName in modules ) {
      modules[moduleName].setup && modules[moduleName].setup.call(this);
    } //for
    */

  }; //Butter

  Butter.getScriptLocation = function () {
    var scripts = document.querySelectorAll( "script" );
    for (var i=0; i<scripts.length; ++i) {
      var pos = scripts[i].src.lastIndexOf('butter.js');
      if ( pos > -1 ) {
        return scripts[i].src.substr(0, pos) + "/";
      } //if
    } //for
  };

  //registerModule - Registers a Module into the Butter core
  Butter.registerModule = Butter.prototype.registerModule = function ( name, module ) {

    Butter.prototype[name] = function( options ) {
      module.call( this, options );
      return this;
    };
    if ( module.extend ) {
      Butter.extendAPI( module.extend );
    } //if
  };

  Butter.extendAPI = function ( functions ) {
    for ( var fn in functions ) {
      if ( functions.hasOwnProperty( fn ) ) {
        Butter[fn] = functions[ fn ];
        Butter.prototype[ fn ] = functions[ fn ];
      } //if
    } //for
  };

  Butter.extend = function ( obj /* , extra arguments ... */) {
    var dest = obj, src = [].slice.call( arguments, 1 );
    src.forEach( function( copy ) {
      for ( var prop in copy ) {
        dest[ prop ] = copy[ prop ];
      }
    });
  };

  Butter.Media = Media;
  Butter.Track = Track;
  Butter.TrackEvent = TrackEvent;
  Butter.Target = Target;

  window.Butter = Butter;

})( window, document, undefined );


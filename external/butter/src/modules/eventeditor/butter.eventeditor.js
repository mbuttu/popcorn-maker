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

(function( window, document, Butter, undefined ) {

  Butter.registerModule( "eventeditor", function ( options ) {
    var editorTarget,
        defaultEditor,
        binding,
        commServer,
        editorHeight,
        editorWidth,
        targetWindow,
        customEditors = {},
        butter = this;

    function constructEditor( trackEvent ) {

      var editorWindow,
        butter = this,
        editorSrc =  customEditors[ trackEvent.type ] || trackEvent.manifest.customEditor || defaultEditor,
        updateEditor = function( trackEvent ){
          commServer.send( "editorCommLink", trackEvent.data.popcornOptions, "updatetrackevent" );
        };

      editorTarget && clearTarget();

      if ( binding === "bindWindow" ) {

        editorWindow = targetWindow || window.open( editorSrc, "", "width=" + editorWidth + ",height=" + editorHeight + ",menubar=no,toolbar=no,location=no,status=no" );
        setupServer();
        editorWindow.addEventListener( "beforeunload", function() {
          butter.unlisten ( "trackeventupdated", updateEditor );
          butter.trigger( "trackeditforcedclosed" );
        }, false );
      } else if ( binding === "bindFrame" ) {

        editorWindow = document.createElement( "iframe" );
        editorWindow.style.width = editorWidth;
        editorWindow.style.height = editorHeight;
        setupServer();
        editorWindow.src = editorSrc;
        editorTarget.appendChild( editorWindow );
      }

      function setupServer() {

        commServer[ binding ]( "editorCommLink", editorWindow, function() {

          butter.listen( "trackeventupdated", updateEditor );
          butter.listen( "targetadded", function() {
            commServer.send( "editorCommLink", butter.getTargets(), "domtargetsupdated" );
          });
          commServer.listen( "editorCommLink", "okayclicked", function( newOptions ){

            trackEvent.popcornOptions = newOptions;
            editorWindow.close && editorWindow.close();
            editorWindow && editorWindow.parentNode && editorWindow.parentNode.removeChild( editorWindow );
            butter.unlisten ( "trackeventupdated", updateEditor );
            butter.trigger( "trackeditclosed" );
            butter.trigger( "trackeventupdated", trackEvent );
          });
          commServer.listen( "editorCommLink", "applyclicked", function( newOptions ) {

            trackEvent.popcornOptions = newOptions;
            butter.trigger( "trackeventupdated", trackEvent );
          });
          commServer.listen( "editorCommLink", "deleteclicked", function() {

            butter.removeTrackEvent( trackEvent );
            editorWindow.close && editorWindow.close();
            editorWindow && editorWindow.parentNode && editorWindow.parentNode.removeChild( editorWindow );
            butter.unlisten ( "trackeventupdated", updateEditor );
            butter.trigger( "trackeditclosed" );
          });
          commServer.listen( "editorCommLink", "cancelclicked", function() {

            editorWindow.close && editorWindow.close();
            editorWindow && editorWindow.parentNode && editorWindow.parentNode.removeChild( editorWindow );
            butter.unlisten ( "trackeventupdated", updateEditor );
            butter.trigger( "trackeditclosed" );
          });

          var targetCollection = butter.getTargets(), targetArray = [];
          for ( var i=0, l=targetCollection.length; i<l; ++i ) {
            targetArray.push( [ targetCollection[ i ].getName(), targetCollection[ i ].getId() ] );
          }
          
          commServer.send( "editorCommLink", { trackEvent: trackEvent, targets: targetArray }, "edittrackevent");
        });
      }

    } //constructEditor

    function clearTarget() {

      while ( editorTarget.firstChild ) {
        editorTarget.removeChild( editorTarget.firstChild );
      }
    } //clearTarget

    function setTarget( newTarget, type ) {

      var setTheTarget = {

        "domtarget": function( targ ) {
          if ( typeof targ === "string" ) {

             return editorTarget = document.getElementById( targ ) || {};
          } else if ( targ ) {

             return editorTarget = targ;
          }
        },

        "window": function( targ ) {
          if ( targ ){
            return targetWindow = targ;
          }
        }

      };

      return setTheTarget[ type ]( newTarget );

    } //setTarget

    if ( !options || typeof options !== "object" ) {
      throw new Error( "Invalid Argument" );
    }

    editorWidth = options.editorWidth || 400;
    editorHeight = options.editorHeight || 400;

    ( options.target && setTarget( options.target, "domtarget" ) ) || ( options.targetWindow && setTarget( options.targetWindow, "window" ) );

    binding = editorTarget ? "bindFrame" : "bindWindow";

    defaultEditor = options.defaultEditor || "defaultEditor.html";

    commServer = new Butter.CommServer();

    /************************
     * instance methods
     ************************/
    this.editTrackEvent = function( trackEvent ) {
             
      if ( !trackEvent || !( trackEvent instanceof Butter.TrackEvent ) ) {
        return false;
      }
      
      this.trigger( "trackeditstarted" );
      constructEditor.call( this, trackEvent );
      return true;
    }; //editTrackEvent

    this.addCustomEditor = function( editorSource, pluginType ) {

      if ( !pluginType || !editorSource ) {
        return false;
      }

      return customEditors[ pluginType ] = editorSource;
    }; //addCustomEditor
          
    this.removeCustomEditor = function( editorSource, pluginType ) {
      if ( !pluginType || !editorSource ) {
        return false;
      }
      
      var oldSource = customEditors[ pluginType ];
      
      customEditors[ pluginType ] = undefined;
      return oldSource;
    }; //removeCustomEditor

    this.changeEditorTarget = function( newTarget, type ) {

      var types = [ "domtarget", "window" ],
        lowerCaseType;
      
      //will target a new Window
      if ( !newTarget ) {
        editorTarget = undefined;
        binding = "bindWindow";
        return true;
      }

      if ( !type || types.indexOf( lowerCaseType = type.toLowerCase() ) === -1 ) {

        return false;
      }

      return setTarget( newTarget, lowerCaseType );
    }; //changeEditorTarget

    this.setDefaultEditor = function( newEditor ) {
      if ( !newEditor || typeof newEditor !== "string" ) {

        return false;
      }

      defaultEditor = newEditor;

      return defaultEditor;
    }; //setDefaultEditor

    this.setEditorDims = function ( dims ) {

      if ( !dims || ( !dims.height && !dims.width ) ) {

        return false;
      }

      editorWidth = dims.width || editorWidth;
      editorHeight = dims.height || editorHeight;

      return dims;
    }; //setEditorDims

  }); //eventeditor

})( window, window.document, Butter );


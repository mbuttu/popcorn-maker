(function() {

	window.addEventListener("DOMContentLoaded", function() {

		var b = new Butter(),
		appController = window.appController,
		tracks = JSON.parse(appController.tracksAsJSON()),
		idx;

    console.log(appController.tracksAsJSON());

		var targetDiv = appController.editorDOMWindow.document.createElement("div");

		targetDiv.id = "me";
		targetDiv.style.width = "400px";
		targetDiv.style.height = "500px";
		targetDiv.style.border = "1px solid black";
		appController.editorDOMWindow.document.body.appendChild(targetDiv);

		b.eventeditor({
			//target: "butter-editor-div",
			//defaultEditor: "lib/defaultEditor.html",
			target: targetDiv,
			defaultEditor: "popcorn-maker/lib/defaultEditor.html",
			editorWidth: "98%",
			editorHeight: "98%"
		});

		b.previewer({
			layout: "layouts/default.html",
			target: "previewer-iframe",
			popcornURL: "lib/popcorn-complete.js",
			//media: "http://robothaus.org/bugs/video/brendan1.ogv",
			//media: "trailer.mp4",
      media: appController.moviePath,
			callback: function() {
				b.buildPopcorn("outerVideo", function() {
					for (idx = 0; idx < tracks.length; idx++) {
						var events = tracks[idx].events;
						var eventIdx;

						var butterTrack = new Butter.Track();
						b.addTrack(butterTrack);

						for (eventIdx = 0; eventIdx < events.length; eventIdx++) {
							var event = events[eventIdx];
console.log(event);

							var butterTrackEvent = new Butter.TrackEvent({
								type: event.type,
								popcornOptions: {
									start: event.start,
									end: event.end
								}
							});

							butterTrackEvent.track = butterTrack;
							b.addTrackEvent(butterTrack, butterTrackEvent);
						}
					}
					b.plugintray({
						target: "butter-plug-in-div"
					});
					var registry = b.getRegistry();
					for (var i = 0, l = registry.length; i < l; i++) {
						b.addPlugin({
							type: registry[i].type
						});
					}
				});
			}
		});

		b.timeline({
			target: "butter-timeline-div"
		});

	},
	false);

	function overlay(style) {
		var el = document.getElementById("overlay-div");
		el.style.visibility = style;
	}

})();


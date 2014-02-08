(function($) {
	$.fn.scratchoff = function(options) {

		var scopa = $(this);
		var isRetina = options.thisRetina;
		var image = {
			'back': {
				'url': options.back,
				'img': null
			},
			'front': {
				'url': options.front,
				'img': null
			}
		};

		var canvas = {
			'temp': null,
			'draw': null
		};
		var tdown = false;

		function getLocalCoords(elem, ev) {
			var ox = 0,
				oy = 0;
			var first;
			var pageX, pageY;

			while (elem != null) {
				ox += elem.offsetLeft;
				oy += elem.offsetTop;
				elem = elem.offsetParent;
			}

			if (ev.hasOwnProperty('changedTouches')) {
				first = ev.changedTouches[0];
				pageX = first.pageX;
				pageY = first.pageY;
			} else {
				pageX = ev.pageX;
				pageY = ev.pageY;
			}

			return {
				'x': pageX - ox,
				'y': pageY - oy
			};
		}


		function recompositeCanvases() {
			var main = scopa[0];
			var tempctx = canvas.temp.getContext('2d');
			var mainctx = main.getContext('2d');

			canvas.temp.width = canvas.temp.width;

			tempctx.drawImage(canvas.draw, 0, 0, canvas.temp.width, canvas.temp.height);

			tempctx.globalCompositeOperation = 'source-out';
			tempctx.drawImage(image.back.img, 0, 0, canvas.temp.width, canvas.temp.height);

			mainctx.drawImage(image.front.img, 0, 0, canvas.temp.width, canvas.temp.height);

			mainctx.drawImage(canvas.temp, 0, 0, canvas.temp.width, canvas.temp.height);

		}


		function scratchLine(can, x, y, fresh) {
			var ctx = can.getContext('2d');
			ctx.lineWidth = 65;
			ctx.lineCap = ctx.lineJoin = 'round';
			ctx.strokeStyle = '#000';
			if (fresh) {
				ctx.beginPath();
				ctx.moveTo(x + 1, y);
			}
			ctx.lineTo(x, y);
			ctx.stroke();
		}


		function setupCanvases() {
			var c = scopa[0];
			image.back.img.width = (isRetina) ? image.back.img.width / 2 : image.back.img.width;
			image.back.img.height = (isRetina) ? image.back.img.height / 2 : image.back.img.height;

			c.width = image.back.img.width;
			c.height = image.back.img.height;

			canvas.temp = document.createElement('canvas');
			canvas.draw = document.createElement('canvas');
			canvas.temp.width = canvas.draw.width = c.width;
			canvas.temp.height = canvas.draw.height = c.height;

			recompositeCanvases();


			function tdown_handler(e) {
				var local = getLocalCoords(c, e);
				tdown = true;

				scratchLine(canvas.draw, local.x, local.y, true);
				recompositeCanvases();

				if (e.cancelable) {
					e.preventDefault();
				}
				return false;
			};


			function tmove_handler(e) {
				if (!tdown) {
					return true;
				}

				var local = getLocalCoords(c, e);

				scratchLine(canvas.draw, local.x, local.y, false);
				recompositeCanvases();

				if (e.cancelable) {
					e.preventDefault();
				}
				return false;
			};


			function tup_handler(e) {
				if (tdown) {
					tdown = false;
					if (e.cancelable) {
						e.preventDefault();
					}
					return false;
				}

				return true;
			};

			c.addEventListener('mousedown', tdown_handler, false);
			c.addEventListener('touchstart', tdown_handler, false);

			window.addEventListener('mousemove', tmove_handler, false);
			window.addEventListener('touchmove', tmove_handler, false);

			window.addEventListener('mouseup', tup_handler, false);
			window.addEventListener('touchend', tup_handler, false);
		}

		function init() {
			//reload images into memory
			var loadCount = 0;
			var loadTotal = 0;
			var loadingIndicator;

			function imageLoaded(e) {
				loadCount++;

				if (loadCount >= loadTotal) {
					setupCanvases();
				}
			}

			for (k in image)
				if (image.hasOwnProperty(k))
					loadTotal++;

			for (k in image)
				if (image.hasOwnProperty(k)) {
					image[k].img = document.createElement('img');
					image[k].img.addEventListener('load', imageLoaded, false);
					image[k].img.src = image[k].url;
				}
		}
			init();
	};

	$(document).on("ready", function() {

		var before = document.getElementById('before');
		var after = document.getElementById('after');

		var urlVars = getUrlVars();
		var totalImages = 2;
		var imageCounter = 0;
		var isRetina = false;
		loadImages();


		function draw() {
			$("#canvas1").scratchoff({
				back: beforeVars,
				front: afterVars,
				thisRetina: isRetina
			});
		}


		function loadImages() {
			if (window.devicePixelRatio >= 2) {
				beforeVars = urlVars['before'];
				afterVars = urlVars['after'];
				isRetina = true;
			} else {
				beforeVars = urlVars['before'];
				afterVars = urlVars['after'];
			}

			before.addEventListener("load", onImageLoad, false);
			before.setAttribute("src", beforeVars);
			after.addEventListener("load", onImageLoad, false);
			after.setAttribute("src", afterVars);
		}

		function onImageLoad(e) {
			imageCounter++;
			if (imageCounter == totalImages) {
				draw();
			}
		}

		function getUrlVars() {
			var vars = [],
				hash;
			var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');

			for (var i = 0; i < hashes.length; i++) {
				hash = hashes[i].split('=');
				vars.push(hash[0]);
				vars[hash[0]] = hash[1];
			}
			var arr2str = hashes.toString();
			if (arr2str.match(/orientation/)) {

				totalLoad = hashes.length - 1

			} else {

				totalLoad = hashes.length
			}
			return vars;
		}

	});

})(jQuery);

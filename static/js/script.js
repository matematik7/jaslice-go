/* global $, WebSocket, location */

$(function () {
	$('.slider').slider();

	var generalShowHide = function (self, on) {
		if (on) {
			$(self).find('.js-module-show-on').show();
			$(self).find('.js-module-off').show();
			$(self).find('.js-module-show-off').hide();
			$(self).find('.js-module-on').hide();
		} else {
			$(self).find('.js-module-show-on').hide();
			$(self).find('.js-module-off').hide();
			$(self).find('.js-module-show-off').show();
			$(self).find('.js-module-on').show();
		}
	};

	var modulesShowHide = function (on) {
		if (on) {
			$('.js-module').show();
			$('.js-on').hide();
			$('.js-off').show();
		} else {
			$('.js-module').hide();
			$('.js-musicplayer').show();
			$('.js-on').show();
			$('.js-off').hide();
		}
	};

	var pathJoin = function (parts, sep) {
		var separator = sep || '/';
		var replace = new RegExp(separator + '{1,}', 'g');
		return parts.join(separator).replace(replace, separator);
	};

	modulesShowHide($('input[name=on]').val() === 'true');

	$('.js-on').click(function () {
		$.get('/api/on');

		// everything gets reset on turn on, so this is the easiest solution
		setTimeout(function () {
			location.reload();
		}, 500);
	});

	$('.js-off').click(function () {
		$.get('/api/off');
		modulesShowHide(false);
	});

	$('.js-module').each(function () {
		var url = $(this).find('input[name=url]').val();
		var self = this;

		// on-off button
		if ($(self).find('input[name=on]').length) {
			generalShowHide(self, $(self).find('input[name=on]').val() === 'true');

			$(self).find('.js-module-on').click(function () {
				$.get(pathJoin([url, 'on']));
				generalShowHide(self, true);
			});

			$(self).find('.js-module-off').click(function () {
				$.get(pathJoin([url, 'off']));
				generalShowHide(self, false);
			});
		}

		// slider
		$(self).find('.js-slider').on('slideStop', function () {
			$.get(pathJoin([url, this.name, this.value]));
		});

		// button
		$(self).find('.js-button').click(function () {
			$.get(pathJoin([url, $(this).data('path')]));
		});

		// select list
		$(self).find('.js-select').change(function () {
			$.get(pathJoin([url, this.name, this.value]));
		});

		// module specific
		if ($(self).hasClass('js-musicplayer')) {
			var socket = new WebSocket('ws://' + location.host + url + 'song');
			socket.onmessage = function (event) {
				$(self).find('.js-musicplayer-song').text(event.data);
			};
		} else if ($(self).hasClass('js-utrinek') || $(self).hasClass('js-utrinki')) {
			var oldVal = $(self).find('input[name=interval]').val().split(',');
			$(self).find('input[name=interval]').on('slideStop', function () {
				var newVal = $(this).val().split(',');
				if (newVal[0] !== oldVal[0]) {
					$.get(url + 'min/' + newVal[0]);
				}
				if (newVal[1] !== oldVal[1]) {
					$.get(url + 'max/' + newVal[1]);
				}
				oldVal = newVal;
			});
		}
	});
});

var Game = Game || (function() {
	var _bombs		= 0;
	var _hits		= 0;
	var _ships 		= {};
	var _letters 	= "ABCDEFGHIJ";		
	var $rows 		= {};

	function start() {
		var title = document.title;
		interval = setInterval(function(){ 
			if (document.title.length == 11) {
				document.title = 'Carregando..';
			}
			else if (document.title.length == 12){							
				document.title = 'Carregando...';
			}
			else {
				document.title = 'Carregando.';
			}
		}, 500);
		set_table();
		set_coords();
		set_events();
		set_ships();
        play_sound('melody', .25);
		clearInterval(interval);
		document.title = title;
	}
	
	function set_table() {
		$table = $('<table></table>');
		for	(x = 0; x < 10; x++) {
			$tr = $('<tr></tr>');
			for	(z = 0; z < 10; z++) {
				$td = $('<td></td>');
				$tr.append($td);
			}
			$table.append($tr);
		}
		$('#game').html($table);
	}

	function set_coords() {
		$rows = $('#game table tr');
		for (x = 0, length = $rows.length; x < length; x++) {
			$rows.eq(x).attr('data-row', _letters[x]);
			var $cols = $rows.eq(x).find('td');
			for (y = 0, length = $cols.length; y < length; y++) {
				$cols.eq(y).attr('data-col', (y + 1));
				$cols.eq(y).attr('title', 'Jogar bomba em ' + _letters[x] +  (y + 1));
			}
		}
	}

	function set_events() {
		$('#game table td').off('click').click(function() {
			var $this = $(this);
			var row = $this.parent().data('row'); 
			var col = $this.data('col');
			attack($this, row, col);
		});
		$('#game table td').off('hover').hover(function() {			
			play_sound('click');
		});
		$('#sound-checkbox input').off('change').change(function() {
			if(!$(this).is(':checked'))	{
				var $audios = $('audio');
				for (var i = 0, length = $audios.length; i < length; i++) {
					$audios.get(i).pause();
				}
			}	
			else if(_hits < 17) {
				play_sound('melody');
			}
		});
	}

	function set_ships() {
		set_ship(5);
		set_ship(4);
		set_ship(3);
		set_ship(3);
		set_ship(2);
	}

	function can_set_ship(length) {
		var _great = true;
		var _row, _col, _orientation, _direction;
		
		_orientation = random(1, 2);
		_row = random(1, 10);
		_col = random(1, 10);
		
		if (_orientation == 1) { // vertical
			while(!(_row - 10 >= length) && !(_row >= length)) {							
				_row = random(1, 10);
			}
			
			if ((_row >= length) && (_row - 10 >= length)) {
				_direction = random(1, 2);
			}
			else if (_row >= length) {
				_direction = 1;
			}
			else {
				_direction = 2;
			}
			
			row = _row;
			col = _col;
			if (_direction == 1) { // up
				for (x = 0; x < length; x++) {
					if (_ships[_letters[row - 1]] && _ships[_letters[row - 1]][col]) {
						_great = false;
					}
					row--;
				}
			}
			else { // down						
				for (x = 0; x < length; x++) {
					if (_ships[_letters[row - 1]] && _ships[_letters[row - 1]][col]) {
						_great = false;
					}
					row++;
				}
			}
		}
		else { // horizontal
			while(!(_col - 10 >= length) && !(_col >= length)) {							
				_col = random(1, 10);
			}
			
			if ((_col >= length) && (_col - 10 >= length)) {
				_direction = random(1, 2);
			}
			else if (_col >= length) {
				_direction = 1;
			}
			else {
				_direction = 2;
			}
			
			row = _row;
			col = _col;
			if (_direction == 1) { // left	
				for (x = 0; x < length; x++) {
					if (_ships[_letters[row - 1]] && _ships[_letters[row - 1]][col]) {
						_great = false;
					}
					col--;
				}
			}
			else { // right			
				_ships[_letters[_row - 1]] = {};						
				for (x = 0; x < length; x++) {
					if (_ships[_letters[row - 1]] && _ships[_letters[row - 1]][col]) {
						_great = false;
					}
					col++;
				}
			}
		}
		
		if (_great) {
			return { 
				'row'			: _row,
				'col'			: _col,
				'orientation'	: _orientation, 
				'direction' 	: _direction
			};
		}
		else {
			return can_set_ship(length);
		}
	}

	function set_ship(length) {						
		var data 		= can_set_ship(length);
		
		var row 		= data['row'];
		var col 		= data['col'];
		var orientation	= data['orientation']
		var direction 	= data['direction']
		
		if (orientation == 1) { // vertical						
			if (direction == 1) { // up
				for (x = 0; x < length; x++) {
					_ships[_letters[row - 1]] = _ships[_letters[row - 1]] || {};
					_ships[_letters[row - 1]][col] = true;
					row--;
				}
			}
			else { // down						
				for (x = 0; x < length; x++) {
					_ships[_letters[row - 1]] = _ships[_letters[row - 1]] || {};
					_ships[_letters[row - 1]][col] = true;
					row++;
				}
			}
		}
		else { // horizontal
			if (direction == 1) { // left	
				_ships[_letters[row - 1]] = _ships[_letters[row - 1]] || {};
				for (x = 0; x < length; x++) {
					_ships[_letters[row - 1]][col] = true;
					col--;
				}
			}
			else { // right			
				_ships[_letters[_row - 1]] = _ships[_letters[_row - 1]] || {};						
				for (x = 0; x < length; x++) {
					_ships[_letters[row - 1]][col] = true;
					col++;
				}
			}
		}
	}

	function random(start, end) {
		return Math.floor((Math.random() * end) + start);
	}

	function attack($cell, row, column) {
		$cell.off('click');
		_bombs++;
		if (_ships[row] && _ships[row][column]) {
			$cell.css('background-color', 'black');
			$cell.attr('title', 'Você acertou um navio em ' + row + column);
			_hits++;
			play_sound('hit');
		}
		else {						
			$cell.css('background-color', '#0D47A1');
			$cell.attr('title', 'Você já jogou uma bomba em ' + row + column);
			play_sound('miss');
		}
		
		check_game_over();
	}

	function check_game_over() {
		if (_hits == 17) {			
			$('audio#melody').get(0).pause();
			play_sound('win');
			if (confirm('Você ganhou com ' + ((_hits/_bombs) * 100).toFixed() + '% de taxa de acerto.\nTentativas: '+_bombs+'\nAcertos: '+_hits+'\nDeseja iniciar um novo jogo?')) {
				location.reload();
			}
			$('#game td').off('click mouseenter mouseleave');
		}
	}
	
	function play_sound(id, volume) {
		if ($('#sound-checkbox input').is(':checked')) {
			var sound = $('audio#' + id).get(0);
			if  (volume) {
				sound.volume = volume;
			}
			sound.pause();
			sound.currentTime = 0;
			sound.play();
		}
	}

	return {
		start: start
	}
})();

Game.start()
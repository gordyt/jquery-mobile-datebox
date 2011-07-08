/*
 * jQuery Mobile Framework : plugin to provide a date and time picker.
 * Copyright (c) JTSage
 * CC 3.0 Attribution.  May be relicensed without permission/notifcation.
 * https://github.com/jtsage/jquery-mobile-datebox
 */
(function($, undefined ) {
  $.widget( "mobile.datebox", $.mobile.widget, {
	options: {
		theme: 'c',
		pickPageTheme: 'b',
		pickPageInputTheme: 'e',
		pickPageButtonTheme: 'a',
		pickPageHighButtonTheme: 'e',
		pickPageOHighButtonTheme: 'e',
		pickPageODHighButtonTheme: 'e',
		pickPageTodayButtonTheme: 'e',
		pickPageSlideButtonTheme: 'd',
		pickPageFlipButtonTheme: 'b',
		centerWindow: false,
		calHighToday: true,
		calHighPicked: true,
		noAnimation: false,
		
		disabled: false,
		wheelExists: false,
		swipeEnabled: true,
		zindex: '500',
		debug: false,
		
		setDateButtonLabel: 'Set Date',
		setTimeButtonLabel: 'Set Time',
		setDurationButtonLabel: 'Set Duration',
		titleDateDialogLabel: 'Set Date',
		titleTimeDialogLabel: 'Set Time',
		titleDialogLabel: false,
		meridiemLetters: ['AM', 'PM'],
		daysOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
		daysOfWeekShort: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
		monthsOfYear: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
		monthsOfYearShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
		durationLabel: ['Days', 'Hours', 'Minutes', 'Seconds'],
		durationDays: ['Day', 'Days'],
		timeFormat: 24,
		timeFormats: { '12': 'GG:ii AA', '24': 'HH:ii' },
		timeOutput: false,
		
		mode: 'datebox',
		calShowDays: true,
		calShowOnlyMonth: false,
		useDialogForceTrue: false,
		useDialogForceFalse: false,
		useDialog: false,
		useModal: false,
		useInline: false,
		noButtonFocusMode: false,
		noButton: false,
		noSetButton: false,
		closeCallback: false,
		open: false,
		
		fieldsOrder: false,
		dateFieldOrder: ['m', 'd', 'y'],
		timeFieldOrder: ['h', 'i', 'a'],
		slideFieldOrder: ['y', 'm', 'd'],
		durationOrder: ['d', 'h', 'i', 's'],
		headerFormat: 'ddd, mmm dd, YYYY',
		dateFormat: 'YYYY-MM-DD',
		minuteStep: 1,
		calWeekMode: false,
		calWeekModeFirstDay: 1,
		calWeekModeHighlight: true,
		calStartDay: 0,
		defaultDate: false,
		minYear: false,
		maxYear: false,
		afterToday: false,
		beforeToday: false,
		maxDays: false,
		minDays: false,
		highDays: false,
		highDates: false,
		blackDays: false,
		blackDates: false,
		durationNoDays: false,
		durationShort: true,
		durationSteppers: {'d': 1, 'h': 1, 'i': 1, 's': 1},
		disabledDayColor: '#888'
	},
	_dateboxHandler: function(event, payload) {
		if ( ! event.isPropagationStopped() ) {
			switch (payload.method) {
				case 'close':
					$(this).data('datebox').close();
					break;
				case 'open':
					$(this).data('datebox').open();
					break;
				case 'set':
					$(this).val(payload.value);
					$(this).trigger('change');
					break;
				case 'doset':
					if ( $(this).data('datebox').options.mode === 'timebox' || $(this).data('datebox').options.mode === 'durationbox' ) {
						$(this).trigger('datebox', {'method':'set', 'value':$(this).data('datebox')._formatTime($(this).data('datebox').theDate)});
					} else {
						$(this).trigger('datebox', {'method':'set', 'value':$(this).data('datebox')._formatDate($(this).data('datebox').theDate)});
					}
				case 'dooffset':
					$(this).data('datebox')._offset(payload.type, payload.amount, true);
					break;
				case 'dorefresh':
					$(this).data('datebox')._update();
					break;
			}
		} 
	},
	_zeroPad: function(number) {
		return ( ( number < 10 ) ? "0" : "" ) + String(number);
	},
	_makeOrd: function (num) {
		var ending = num % 10;
		if ( num > 9 && num < 21 ) { return 'th'; }
		if ( ending > 3 ) { return 'th'; }
		return ['th','st','nd','rd'][ending];
	},
	_isInt: function (s) {
			return (s.toString().search(/^[0-9]+$/) === 0);
	},
	_dstAdjust: function(date) {
		if (!date) { return null; }
		date.setHours(date.getHours() > 12 ? date.getHours() + 2 : 0);
		return date;
	},
	_getFirstDay: function(date) {
		return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
	},
	_getLastDate: function(date) {
		return 32 - this._dstAdjust(new Date(date.getFullYear(), date.getMonth(), 32)).getDate();
	},
	_getLastDateBefore: function(date) {
		return 32 - this._dstAdjust(new Date(date.getFullYear(), date.getMonth()-1, 32)).getDate();
	},
	_formatter: function(format, date) {
		format = format.replace('SS', this._makeOrd(date.getDate()));
		format = format.replace('YYYY', date.getFullYear());
		format = format.replace('mmm',  this.options.monthsOfYear[date.getMonth()] );
		format = format.replace('MM',   this._zeroPad(date.getMonth() + 1));
		format = format.replace('mm',   date.getMonth() + 1);
		format = format.replace('ddd',  this.options.daysOfWeek[date.getDay()] );
		format = format.replace('DD',   this._zeroPad(date.getDate()));
		format = format.replace('dd',   date.getDate());
		
		format = format.replace('HH',   this._zeroPad(date.getHours()));
		format = format.replace('GG',   this._zeroPad(((date.getHours() === 0 || date.getHours() === 12)?12:((date.getHours()<12)?date.getHours():date.getHours()-12))));
		format = format.replace('hh',   ((date.getHours() === 0 || date.getHours() === 12)?12:((date.getHours()<12)?date.getHours():(date.getHours()-12))));
		format = format.replace('gg',   date.getHours());
		format = format.replace('ii',   this._zeroPad(date.getMinutes()));
		format = format.replace('ss',   this._zeroPad(date.getSeconds()));
		format = format.replace('AA',   ((date.getHours() < 12)?this.options.meridiemLetters[0].toUpperCase():this.options.meridiemLetters[1].toUpperCase()));
		format = format.replace('aa',   ((date.getHours() < 12)?this.options.meridiemLetters[0].toLowerCase():this.options.meridiemLetters[1].toLowerCase()));
		return format;
	},
	_formatHeader: function(date) {
		return this._formatter(this.options.headerFormat, date);
	},
	_formatDate: function(date) {
		return this._formatter(this.options.dateFormat, date);
	},
	_isoDate: function(y,m,d) {
		return String(y) + '-' + (( m < 10 ) ? "0" : "") + String(m) + '-' + ((d < 10 ) ? "0" : "") + String(d);
	},
	_formatTime: function(date) {
		var self = this,
			h, i, y,
			days = '';
			
		if ( this.options.mode === 'durationbox' ) {
			i = ((self.theDate.getTime() - self.theDate.getMilliseconds()) / 1000) - ((self.initDate.getTime() - self.initDate.getMilliseconds()) / 1000);
			y = parseInt( i / (60*60*24),10); // Days
			if ( !self.options.durationNoDays ) {
				days = (y===0) ? '' : String(y) + ' ' + ((y>1) ? this.options.durationDays[1]:this.options.durationDays[0]) + ', ';
				i = i-(y*60*60*24);
			}
			h = parseInt( i / (60*60), 10); i = i-(h*60*60); // Hours
			y = parseInt( i / (60), 10); i = i-(y*60); // Mins
			if ( self.options.durationShort ) {
				return days + ((h>0||days!=='')?self._zeroPad(h) + ':':'') + ((y>0||h>0||days!=='')?self._zeroPad(y) + ':':'') + ((y>0||h>0||days!=='')?self._zeroPad(parseInt(i, 10)):String(i));
			} else {
				return days + self._zeroPad(h) + ':' + self._zeroPad(y) + ':' + self._zeroPad(parseInt(i, 10));
			}
		} else {
			return this._formatter(self.options.timeOutput, date);
		}
	},
	_makeDate: function (str) {
		str = $.trim(str);
		var o = this.options,
			self = this,
			adv = null,
			exp_input = null,
			exp_format = null,
			exp_temp = null,
			date = new Date(),
			seconds = 0,
			durationRegex = /^(?:([0-9]+) .+, )?(?:([0-9]+):)?(?:([0-9]+):)?([0-9]+)$/i,
			match = null,
			i;
		
		if ( o.mode === 'durationbox' ) {
			match = durationRegex.exec(str);
			if ( match === null ) {
				return new Date(self.initDate.getTime());
			} else {
				seconds = ((self.initDate.getTime() - self.initDate.getMilliseconds()) / 1000) + parseInt(match[4],10);
				if ( typeof match[3] !== 'undefined' ) { seconds = seconds + (parseInt(match[3],10)*60); }
				if ( typeof match[2] !== 'undefined' ) { 
					if ( typeof match[3] === 'undefined' ) {
						seconds = seconds + (parseInt(match[2],10)*60); 
					} else {
						seconds = seconds + (parseInt(match[2],10)*60*60); 
					}
				}
				if ( typeof match[1] !== 'undefined' ) { seconds = seconds + (parseInt(match[1],10)*60*60*24); }
				seconds = seconds * 1000;
				return new Date(seconds);
			}
		} else {
			if ( o.mode === 'timebox' || o.mode === 'timeflipbox' ) { adv = o.timeOutput; } else { adv = o.dateFormat; }
			
			adv = adv.replace(/ddd|SS/g, '.+?');
			adv = adv.replace(/mmm|AA/g, '(.+?)');
			adv = adv.replace(/yyyy|dd|mm|gg|hh|ii/ig, '([0-9yYdDmMgGhHi]+)');
			adv = adv.replace(/ss/g, '([0-9s]+)');
			adv = RegExp('^' + adv + '$');
			exp_input = adv.exec(str);
			if ( o.mode === 'timebox' || o.mode === 'timeflipbox' ) {
				exp_format = adv.exec(o.timeOutput);
			} else {
				exp_format = adv.exec(o.dateFormat);
			}
			
			if ( o.debug ) {
				console.log({'info': 'EXPERIMENTAL REGEX MODE ENABLED', 'string': str, 'regex':adv, 'input':exp_input, 'format':exp_format});
			}
			
			if ( exp_input === null || exp_input.length !== exp_format.length ) {
				if ( o.defaultDate !== false ) {
					if ( $.isArray(o.defaultDate) && o.defaultDate.length === 3 ) {
						return new Date(o.defaultDate[0], o.defaultDate[1], o.defaultDate[2], 0, 0, 0, 0);
					} else {
						exp_temp = o.defaultDate.split('-');
						if ( exp_temp.length === 3 ) {
							date = new Date(parseInt(exp_temp[0],10),parseInt(exp_temp[1],10)-1,parseInt(exp_temp[2],10),0,0,0,0);
							if ( isNaN(date.getDate()) ) { date = new Date(); }
						}
					}
				}
			} else {
				for ( i=0; i<exp_input.length; i++ ) {
					if ( exp_format[i].match(/^gg$/i) )   { date.setHours(parseInt(exp_input[i],10)); }
					if ( exp_format[i].match(/^hh$/i) )   { date.setHours(parseInt(exp_input[i],10)); }
					if ( exp_format[i].match(/^ii$/i) )   { date.setMinutes(parseInt(exp_input[i],10)); }
					if ( exp_format[i].match(/^ss$/ ) )   { date.setSeconds(parseInt(exp_input[i],10)); }
					if ( exp_format[i].match(/^dd$/i) )   { date.setDate(parseInt(exp_input[i],10)); }
					if ( exp_format[i].match(/^mm$/i) )   { date.setMonth(parseInt(exp_input[i],10)-1); }
					if ( exp_format[i].match(/^yyyy$/i) ) { date.setYear(parseInt(exp_input[i],10)); }
					if ( exp_format[i].match(/^AA$/i) )   { 
						if ( exp_input[i].toLowerCase().charAt(0) === 'a' && date.getHours() === 12 ) {
							date.setHours(0);
						} else if ( exp_input[i].toLowerCase().charAt(0) === 'p' && date.getHours() !== 12 ) {
							date.setHours(date.getHours() + 12);
						}
					}
					if ( exp_format[i].match(/^mmm$/i) )  { 
						exp_temp = $.inArray(exp_input[i], o.monthsOfYear);
						if ( exp_temp > -1 ) {
							date.setMonth(exp_temp);
						}
					}
				}
			}
			if ( exp_format[0].match(/G|g|i|s|H|h|A/) ) { 
				return date;
			} else {
				return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0); // Normalize time for raw dates
			}
		}
	},
	_checker: function(date) {
		return parseInt(String(date.getFullYear()) + this._zeroPad(date.getMonth()+1) + this._zeroPad(date.getDate()),10);
	},
	_hoover: function(item) {
		$(item).toggleClass('ui-btn-up-'+$(item).attr('data-theme')+' ui-btn-down-'+$(item).attr('data-theme'));
	},
	_offset: function(mode, amount, update) {
		var self = this,
			o = this.options;
			
		if ( typeof(update) === "undefined" ) { update = true; }
		self.input.trigger('datebox', {'method':'offset', 'type':mode, 'amount':amount});
		switch(mode) {
			case 'y':
				self.theDate.setYear(self.theDate.getFullYear() + amount);
				break;
			case 'm':
				self.theDate.setMonth(self.theDate.getMonth() + amount);
				break;
			case 'd':
				self.theDate.setDate(self.theDate.getDate() + amount);
				break;
			case 'h':
				self.theDate.setHours(self.theDate.getHours() + amount);
				break;
			case 'i':
				self.theDate.setMinutes(self.theDate.getMinutes() + amount);
				break;
			case 's':
				self.theDate.setSeconds(self.theDate.getSeconds() + amount);
				break;
			case 'a':
				if ( self.pickerMeri.val() === o.meridiemLetters[0] ) { 
					self._offset('h',12,false);
				} else {
					self._offset('h',-12,false);
				}
				break;
		}
		if ( update === true ) { self._update(); }
	},
	_updateduration: function() {
		var self = this,
			secs = (self.initDate.getTime() - self.initDate.getMilliseconds()) / 1000;
		
		if ( !self._isInt(self.pickerDay.val())  ) { self.pickerDay.val(0); }
		if ( !self._isInt(self.pickerHour.val()) ) { self.pickerHour.val(0); }
		if ( !self._isInt(self.pickerMins.val()) ) { self.pickerMins.val(0); }
		if ( !self._isInt(self.pickerSecs.val()) ) { self.pickerSecs.val(0); }
		
		secs = secs + (parseInt(self.pickerDay.val(),10) * 60 * 60 * 24);
		secs = secs + (parseInt(self.pickerHour.val(),10) * 60 * 60);
		secs = secs + (parseInt(self.pickerMins.val(),10) * 60);
		secs = secs + (parseInt(self.pickerSecs.val(),10));
		self.theDate.setTime( secs * 1000 );
		self._update();
	},
	_update: function() {
		var self = this,
			o = self.options, 
			testDate = null,
			i, gridWeek, gridDay, skipThis, thisRow, y, cTheme, inheritDate, thisPRow, tmpVal,
			interval = {'d': 60*60*24, 'h': 60*60, 'i': 60, 's':1},
			calmode = {};
			
		self.input.trigger('datebox', {'method':'refresh'});
		/* BEGIN:DURATIONBOX */
		if ( o.mode === 'durationbox' ) {
			i = ((self.theDate.getTime() - self.theDate.getMilliseconds()) / 1000) - ((self.initDate.getTime() - self.initDate.getMilliseconds()) / 1000);
			if ( i<0 ) { i = 0; self.theDate.setTime(self.initDate.getTime()); }
			
			/* DAYS */
			y = parseInt( i / interval['d'],10); 
			i = i - ( y * interval['d'] ); 
			self.pickerDay.val(y);
			
			/* HOURS */
			y = parseInt( i / interval['h'], 10);
			i = i - ( y * interval['h'] );
			self.pickerHour.val(y);
			
			/* MINS AND SECS */
			y = parseInt( i / interval['i'], 10);
			i = i - ( y * interval['i']); 
			self.pickerMins.val(y);
			self.pickerSecs.val(parseInt(i,10));
		}
		/* END:DURATIONBOX */
		/* BEGIN:TIMEBOX */
		if ( o.mode === 'timebox' ) {
			if ( o.minuteStep !== 1 ) {
				i = self.theDate.getMinutes() % o.minuteStep;
				if ( i !== 0 ) { self.theDate.setMinutes(self.theDate.getMinutes() - i); }
			}
			self.pickerMins.val(self._zeroPad(self.theDate.getMinutes()));
			if ( o.timeFormat === 12 ) {
				if ( self.theDate.getHours() > 11 ) {
					self.pickerMeri.val(o.meridiemLetters[1]);
					if ( self.theDate.getHours() === 12 ) {
						self.pickerHour.val(12);
					} else {
						self.pickerHour.val(self.theDate.getHours() - 12);
					}
				} else {
					self.pickerMeri.val(o.meridiemLetters[0]);
					if ( self.theDate.getHours() === 0 ) {
						self.pickerHour.val(12);
					} else {
						self.pickerHour.val(self.theDate.getHours());
					}
				}
			} else {
				self.pickerHour.val(self.theDate.getHours());
			}
		}
		/* END:TIMEBOX */
		/* BEGIN:FLIPBOX */
		if ( o.mode === 'flipbox' || o.mode === 'timeflipbox' ) {
			if ( o.afterToday !== false ) {
				testDate = new Date();
				if ( self.theDate < testDate ) { self.theDate = testDate; }
			}
			if ( o.maxDays !== false ) {
				testDate = new Date();
				testDate.setDate(testDate.getDate() + o.maxDays);
				if ( self.theDate > testDate ) { self.theDate = testDate; }
			}
			if ( o.minDays !== false ) {
				testDate = new Date();
				testDate.setDate(testDate.getDate() - o.minDays);
				if ( self.theDate < testDate ) { self.theDate = testDate; }
			}
			if ( o.maxYear !== false ) {
				testDate = new Date(o.maxYear, 0, 1);
				testDate.setDate(testDate.getDate() - 1);
				if ( self.theDate > testDate ) { self.theDate = testDate; }
			}
			if ( o.minYear !== false ) {
				testDate = new Date(o.minYear, 0, 1);
				if ( self.theDate < testDate ) { self.theDate = testDate; }
			}
			
			inheritDate = self._makeDate(self.input.val());
			
			self.controlsHeader.html( self._formatHeader(self.theDate) );
			
			for ( y=0; y<o.fieldsOrder.length; y++ ) {
				tmpVal = true;
				switch (o.fieldsOrder[y]) {
					case 'y':
						thisRow = self.pickerYar.find('ul');
						thisRow.html('');
						for ( i=-15; i<16; i++ ) {
							cTheme = ((inheritDate.getFullYear()===(self.theDate.getFullYear() + i))?o.pickPageHighButtonTheme:o.pickPageFlipButtonTheme);
							if ( i === 0 ) { cTheme = o.pickPageButtonTheme; }
							$("<li>", { 'class' : 'ui-body-'+cTheme, 'style':''+((tmpVal===true)?'margin-top: -453px':'') })
								.html("<span>"+(self.theDate.getFullYear() + i)+"</span>")
								.attr('data-offset', i)
								.attr('data-theme', cTheme)
								.appendTo(thisRow);
							if ( tmpVal === true ) { tmpVal = false; }
						}
						break;
					case 'm':
						thisRow = self.pickerMon.find('ul');
						thisRow.html('');
						for ( i=-12; i<13; i++ ) {
							testDate = new Date(self.theDate.getFullYear(), self.theDate.getMonth(), self.theDate.getDate());
							testDate.setMonth(testDate.getMonth()+i);
							cTheme = ( inheritDate.getMonth() === testDate.getMonth() && inheritDate.getYear() === testDate.getYear() ) ? o.pickPageHighButtonTheme : o.pickPageFlipButtonTheme;
							if ( i === 0 ) { cTheme = o.pickPageButtonTheme; }
							$("<li>", { 'class' : 'ui-body-'+cTheme, 'style':''+((tmpVal===true)?'margin-top: -357px':'') })
								.attr('data-offset',i)
								.attr('data-theme', cTheme)
								.html("<span>"+o.monthsOfYearShort[testDate.getMonth()]+"</span>")
								.appendTo(thisRow);
							if ( tmpVal === true ) { tmpVal = false; }
						}
						break;
					case 'd':
						thisRow = self.pickerDay.find('ul');
						thisRow.html('');
						for ( i=-15; i<16; i++ ) {
							testDate = new Date(self.theDate.getFullYear(), self.theDate.getMonth(), self.theDate.getDate());
							testDate.setDate(testDate.getDate()+i);
							cTheme = ( inheritDate.getDate() === testDate.getDate() && inheritDate.getMonth() === testDate.getMonth() && inheritDate.getYear() === testDate.getYear() ) ? o.pickPageHighButtonTheme : o.pickPageFlipButtonTheme;
							if ( i === 0 ) { cTheme = o.pickPageButtonTheme; }
							$("<li>", { 'class' : 'ui-body-'+cTheme, 'style':''+((tmpVal===true)?'margin-top: -453px':'') })
								.attr('data-offset', i)
								.attr('data-theme', cTheme)
								.html("<span>"+testDate.getDate()+"</span>")
								.appendTo(thisRow);
							if ( tmpVal === true ) { tmpVal = false; }
						}
						break;
					case 'h':
						thisRow = self.pickerHour.find('ul');
						thisRow.html('');
						for ( i=-12; i<13; i++ ) {
							testDate = new Date(self.theDate.getFullYear(), self.theDate.getMonth(), self.theDate.getDate(), self.theDate.getHours());
							testDate.setHours(testDate.getHours()+i);
							cTheme = ( i === 0 ) ?  o.pickPageButtonTheme : o.pickPageFlipButtonTheme;
							$("<li>", { 'class' : 'ui-body-'+cTheme, 'style':''+((tmpVal===true)?'margin-top: -357px':'') })
								.attr('data-offset',i)
								.attr('data-theme', cTheme)
								.html("<span>"+( ( o.timeFormat === 12 ) ? ( ( testDate.getHours() === 0 ) ? '12' : ( ( testDate.getHours() < 12 ) ? testDate.getHours() : ( ( testDate.getHours() === 12 ) ? '12' : (testDate.getHours()-12) ) ) ) : testDate.getHours() )+"</span>")
								.appendTo(thisRow);
							if ( tmpVal === true ) { tmpVal = false; }
						}
						break;
					case 'i':
						thisRow = self.pickerMins.find('ul');
						thisRow.html('');
						for ( i=-30; i<31; i++ ) {
							testDate = new Date(self.theDate.getFullYear(), self.theDate.getMonth(), self.theDate.getDate(), self.theDate.getHours(), self.theDate.getMinutes());
							testDate.setMinutes(testDate.getMinutes()+i);
							cTheme = ( i === 0 ) ?  o.pickPageButtonTheme : o.pickPageFlipButtonTheme;
							$("<li>", { 'class' : 'ui-body-'+cTheme, 'style':''+((tmpVal===true)?'margin-top: -933px':'') })
								.attr('data-offset',i)
								.attr('data-theme', cTheme)
								.html("<span>"+self._zeroPad(testDate.getMinutes())+"</span>")
								.appendTo(thisRow);
							if ( tmpVal === true ) { tmpVal = false; }
						}
						break;
					case 'a':
						thisRow = self.pickerMeri.find('ul');
						thisRow.html('');
						if ( self.theDate.getHours() > 11 ) { 
							tmpVal = '-65';
							cTheme = [o.pickPageFlipButtonTheme, o.pickPageButtonTheme]
						} else {
							tmpVal = '-33';
							cTheme = [o.pickPageButtonTheme, o.pickPageFlipButtonTheme]
						}
						$("<li>").appendTo(thisRow).clone().appendTo(thisRow);
						$("<li>", { 'class' : 'ui-body-'+cTheme[0], 'style':'margin-top: '+tmpVal+'px' })
							.attr('data-offset',1)
							.attr('data-theme', cTheme[0])
							.html("<span>"+o.meridiemLetters[0]+"</span>")
							.appendTo(thisRow);
						$("<li>", { 'class' : 'ui-body-'+cTheme[1] })
							.attr('data-offset',1)
							.attr('data-theme', cTheme[1])
							.html("<span>"+o.meridiemLetters[1]+"</span>")
							.appendTo(thisRow);
						$("<li>").appendTo(thisRow).clone().appendTo(thisRow);
						break;
				}
			}
		}
		/* END:FLIPBOX */
		/* BEGIN:SLIDEBOX */
		if ( o.mode === 'slidebox' ) {
			if ( o.afterToday !== false ) {
				testDate = new Date();
				if ( self.theDate < testDate ) { self.theDate = testDate; }
			}
			if ( o.maxDays !== false ) {
				testDate = new Date();
				testDate.setDate(testDate.getDate() + o.maxDays);
				if ( self.theDate > testDate ) { self.theDate = testDate; }
			}
			if ( o.minDays !== false ) {
				testDate = new Date();
				testDate.setDate(testDate.getDate() - o.minDays);
				if ( self.theDate < testDate ) { self.theDate = testDate; }
			}
			if ( o.maxYear !== false ) {
				testDate = new Date(o.maxYear, 0, 1);
				testDate.setDate(testDate.getDate() - 1);
				if ( self.theDate > testDate ) { self.theDate = testDate; }
			}
			if ( o.minYear !== false ) {
				testDate = new Date(o.minYear, 0, 1);
				if ( self.theDate < testDate ) { self.theDate = testDate; }
			}
			
			inheritDate = self._makeDate(self.input.val());
			
			self.controlsHeader.html( self._formatHeader(self.theDate) );
			self.controlsInput.html('');
			
			for ( y=0; y<o.fieldsOrder.length; y++ ) {
				thisPRow = $("<div>", {'data-rowtype': o.fieldsOrder[y]});
				
				if ( o.wheelExists ) {
					thisPRow.bind('mousewheel', function(e,d) {
						e.preventDefault();
						self._offset($(this).attr('data-rowtype'), ((d>0)?1:-1));
					});
				}
				
				thisRow = $("<div>", {'class': 'ui-datebox-sliderow-int', 'data-rowtype': o.fieldsOrder[y]}).appendTo(thisPRow);
				
				if ( o.swipeEnabled ) {
					thisRow
						.bind(self.START_DRAG, function(e) {
							if ( !self.dragMove ) {
								self.dragMove = true;
								self.dragTarget = $(this);
								self.dragPos = parseInt(self.dragTarget.css('marginLeft').replace(/px/i, ''),10);
								self.dragStart = self.touch ? e.originalEvent.changedTouches[0].pageX : e.pageX;
								self.dragEnd = false;
								e.stopPropagation();
								e.preventDefault();
							}
						});
				}
				switch (o.fieldsOrder[y]) {
					case 'y':
						thisPRow.addClass('ui-datebox-sliderow-ym');
						thisRow.css('marginLeft', '-333px');
						for ( i=-5; i<6; i++ ) {
							cTheme = ((inheritDate.getFullYear()===(self.theDate.getFullYear() + i))?o.pickPageHighButtonTheme:o.pickPageSlideButtonTheme);
							if ( i === 0 ) { cTheme = o.pickPageButtonTheme; }
							$("<div>", { 'class' : 'ui-datebox-slideyear ui-corner-all ui-btn-up-'+cTheme })
								.text(self.theDate.getFullYear() + i)
								.attr('data-offset', i)
								.attr('data-theme', cTheme)
								.bind('vmouseover vmouseout', function() { self._hoover(this); })
								.bind('vclick', function(e) { e.preventDefault(); self._offset('y', parseInt($(this).attr('data-offset'),10)); })
								.appendTo(thisRow);
						}
						break;
					case 'm':
						thisPRow.addClass('ui-datebox-sliderow-ym');
						thisRow.css('marginLeft', '-204px');
						for ( i=-6; i<7; i++ ) {
							testDate = new Date(self.theDate.getFullYear(), self.theDate.getMonth(), self.theDate.getDate());
							testDate.setMonth(testDate.getMonth()+i);
							cTheme = ( inheritDate.getMonth() === testDate.getMonth() && inheritDate.getYear() === testDate.getYear() ) ? o.pickPageHighButtonTheme : o.pickPageSlideButtonTheme;
							if ( i === 0 ) { cTheme = o.pickPageButtonTheme; }
							$("<div>", { 'class' : 'ui-datebox-slidemonth ui-corner-all ui-btn-up-'+cTheme })
								.attr('data-offset',i)
								.attr('data-theme', cTheme)
								.text(o.monthsOfYearShort[testDate.getMonth()])
								.bind('vmouseover vmouseout', function() { self._hoover(this); })
								.bind('vclick', function(e) { e.preventDefault(); self._offset('m', parseInt($(this).attr('data-offset'),10)); })
								.appendTo(thisRow);
						}
						break;
					case 'd':
						thisPRow.addClass('ui-datebox-sliderow-d');
						thisRow.css('marginLeft', '-386px');
						for ( i=-15; i<16; i++ ) {
							testDate = new Date(self.theDate.getFullYear(), self.theDate.getMonth(), self.theDate.getDate());
							testDate.setDate(testDate.getDate()+i);
							cTheme = ( inheritDate.getDate() === testDate.getDate() && inheritDate.getMonth() === testDate.getMonth() && inheritDate.getYear() === testDate.getYear() ) ? o.pickPageHighButtonTheme : o.pickPageSlideButtonTheme;
							if ( i === 0 ) { cTheme = o.pickPageButtonTheme; }
							
							$("<div>", { 'class' : 'ui-datebox-slideday ui-corner-all ui-btn-up-'+cTheme })
								.attr('data-offset', i)
								.attr('data-theme', cTheme)
								.html(testDate.getDate() + '<br /><span class="ui-datebox-slidewday">' + o.daysOfWeekShort[testDate.getDay()] + '</span>')
								.bind('vmouseover vmouseout', function() { self._hoover(this); })
								.bind('vclick', function(e) { e.preventDefault(); self._offset('d', parseInt($(this).attr('data-offset'),10)); })
								.appendTo(thisRow);
						}
						break;
					case 'h':
						thisPRow.addClass('ui-datebox-sliderow-hi');
						thisRow.css('marginLeft', '-284px');
						for ( i=-12; i<13; i++ ) {
							testDate = new Date(self.theDate.getFullYear(), self.theDate.getMonth(), self.theDate.getDate(), self.theDate.getHours());
							testDate.setHours(testDate.getHours()+i);
							cTheme = ( i === 0 ) ?  o.pickPageButtonTheme : o.pickPageSlideButtonTheme;
							$("<div>", { 'class' : 'ui-datebox-slidehour ui-corner-all ui-btn-up-'+cTheme })
								.attr('data-offset',i)
								.attr('data-theme', cTheme)
								.html(( ( o.timeFormat === 12 ) ? ( ( testDate.getHours() === 0 ) ? '12<span class="ui-datebox-slidewday">AM</span>' : ( ( testDate.getHours() < 12 ) ? testDate.getHours() + '<span class="ui-datebox-slidewday">AM</span>' : ( ( testDate.getHours() === 12 ) ? '12<span class="ui-datebox-slidewday">PM</span>' : (testDate.getHours()-12) + '<span class="ui-datebox-slidewday">PM</span>') ) ) : testDate.getHours() ))
								.bind('vmouseover vmouseout', function() { self._hoover(this); })
								.bind('vclick', function(e) { e.preventDefault(); self._offset('h', parseInt($(this).attr('data-offset'),10)); })
								.appendTo(thisRow);
						}
						break;
					case 'i':
						thisPRow.addClass('ui-datebox-sliderow-hi');
						thisRow.css('marginLeft', '-896px');
						for ( i=-30; i<31; i++ ) {
							testDate = new Date(self.theDate.getFullYear(), self.theDate.getMonth(), self.theDate.getDate(), self.theDate.getHours(), self.theDate.getMinutes());
							testDate.setMinutes(testDate.getMinutes()+i);
							cTheme = ( i === 0 ) ?  o.pickPageButtonTheme : o.pickPageSlideButtonTheme;
							$("<div>", { 'class' : 'ui-datebox-slidemins ui-corner-all ui-btn-up-'+cTheme })
								.attr('data-offset',i)
								.attr('data-theme', cTheme)
								.text(self._zeroPad(testDate.getMinutes()))
								.bind('vmouseover vmouseout', function() { self._hoover(this); })
								.bind('vclick', function(e) { e.preventDefault(); self._offset('i', parseInt($(this).attr('data-offset'),10)); })
								.appendTo(thisRow);
						}
						break;
				}
				thisPRow.appendTo(self.controlsInput);
			}
		}
		/* END:SLIDEBOX */
		/* BEGIN:DATEBOX */
		if ( o.mode === 'datebox' ) {
			if ( o.afterToday !== false ) {
				testDate = new Date();
				if ( self.theDate < testDate ) { self.theDate = testDate; }
			}
			if ( o.beforeToday !== false ) {
				testDate = new Date();
				if ( self.theDate > testDate ) { self.theDate = testDate; }
			}
			if ( o.maxDays !== false ) {
				testDate = new Date();
				testDate.setDate(testDate.getDate() + o.maxDays);
				if ( self.theDate > testDate ) { self.theDate = testDate; }
			}
			if ( o.minDays !== false ) {
				testDate = new Date();
				testDate.setDate(testDate.getDate() - o.minDays);
				if ( self.theDate < testDate ) { self.theDate = testDate; }
			}
			if ( o.maxYear !== false ) {
				testDate = new Date(o.maxYear, 0, 1);
				testDate.setDate(testDate.getDate() - 1);
				if ( self.theDate > testDate ) { self.theDate = testDate; }
			}
			if ( o.minYear !== false ) {
				testDate = new Date(o.minYear, 0, 1);
				if ( self.theDate < testDate ) { self.theDate = testDate; }
			}
			
			self.controlsHeader.html( self._formatHeader(self.theDate) );
			self.pickerMon.val(self.theDate.getMonth() + 1);
			self.pickerDay.val(self.theDate.getDate());
			self.pickerYar.val(self.theDate.getFullYear());
		}
		/* END:DATEBOX */
		/* BEGIN:CALBOX */
		if ( o.mode === 'calbox' ) { // Meat and potatos - make the calendar grid.
			self.controlsInput.text( o.monthsOfYear[self.theDate.getMonth()] + " " + self.theDate.getFullYear() );
			self.controlsSet.html('');
			
			calmode = {'today': -1, 'highlightDay': -1, 'presetDay': -1, 'nexttoday': 1,
				'thisDate': new Date(), 'maxDate': new Date(), 'minDate': new Date(),
				'currentMonth': false, 'weekMode': 0, 'weekDays': null, 'thisTheme': o.pickPageButtoTheme };
			calmode.start = self._getFirstDay(self.theDate);
			calmode.end = self._getLastDate(self.theDate);
			calmode.lastend = self._getLastDateBefore(self.theDate);
			calmode.presetDate = self._makeDate(self.input.val());	
			calmode.prevtoday = calmode.lastend - (calmode.start - 1);
			calmode.checkDates = ( o.afterToday !== false || o.beforeToday !== false || o.notToday !== false || o.maxDays !== false || o.minDays !== false || o.blackDates !== false || o.blackDays !== false );
			
			if ( o.calStartDay > 0 ) {
				calmode.start = calmode.start - o.calStartDay;
				if ( calmode.start < 0 ) { calmode.start = calmode.start + 7; }
			}
				
			if ( calmode.thisDate.getMonth() === self.theDate.getMonth() && calmode.thisDate.getFullYear() === self.theDate.getFullYear() ) { calmode.currentMonth = true; calmode.highlightDay = calmode.thisDate.getDate(); } 
			if ( self._checker(calmode.presetDate) === self._checker(self.theDate) ) { calmode.presetDay = calmode.presetDate.getDate(); }
			
			self.calNoPrev = false; self.calNoNext = false;
			
			if ( o.afterToday === true && 
				( calmode.currentMonth === true || ( calmode.thisDate.getMonth() >= self.theDate.getMonth() && self.theDate.getFullYear() === calmode.thisDate.getFullYear() ) ) ) { 
				self.calNoPrev = true; }
			if ( o.beforeToday === true &&
				( calmode.currentMonth === true || ( calmode.thisDate.getMonth() <= self.theDate.getMonth() && self.theDate.getFullYear() === calmode.thisDate.getFullYear() ) ) ) {
				self.calNoNext = true; }
			
			if ( o.minDays !== false ) {
				calmode.minDate.setDate(calmode.minDate.getDate() - o.minDays);
				if ( self.theDate.getFullYear() === calmode.minDate.getFullYear() && self.theDate.getMonth() <= calmode.minDate.getMonth() ) { self.calNoPrev = true;}
			}
			if ( o.maxDays !== false ) {
				calmode.maxDate.setDate(calmode.maxDate.getDate() + o.maxDays);
				if ( self.theDate.getFullYear() === calmode.maxDate.getFullYear() && self.theDate.getMonth() >= calmode.maxDate.getMonth() ) { self.calNoNext = true;}
			}
			
			if ( o.calShowDays ) {
				if ( o.daysOfWeekShort.length < 8 ) { o.daysOfWeekShort = o.daysOfWeekShort.concat(o.daysOfWeekShort); }
				calmode.weekDays = $("<div>", {'class':'ui-datebox-gridrow'}).appendTo(self.controlsSet);
				for ( i=0; i<=6;i++ ) {
					$("<div>"+o.daysOfWeekShort[i+o.calStartDay]+"</div>").addClass('ui-datebox-griddate ui-datebox-griddate-empty ui-datebox-griddate-label').appendTo(calmode.weekDays);
				}
			}
			
			for ( gridWeek=0; gridWeek<=5; gridWeek++ ) {
				if ( gridWeek === 0 || ( gridWeek > 0 && (calmode.today > 0 && calmode.today <= calmode.end) ) ) {
					thisRow = $("<div>", {'class': 'ui-datebox-gridrow'}).appendTo(self.controlsSet);
					for ( gridDay=0; gridDay<=6; gridDay++) {
						if ( gridDay === 0 ) { calmode.weekMode = ( calmode.today < 1 ) ? (calmode.prevtoday - calmode.lastend + o.calWeekModeFirstDay) : (calmode.today + o.calWeekModeFirstDay); }
						if ( gridDay === calmode.start && gridWeek === 0 ) { calmode.today = 1; }
						if ( calmode.today > calmode.end ) { calmode.today = -1; }
						if ( calmode.today < 1 ) {
							if ( o.calShowOnlyMonth ) {
								$("<div>", {'class': 'ui-datebox-griddate ui-datebox-griddate-empty'}).appendTo(thisRow);
							} else {
								if (
									( o.blackDays !== false && $.inArray(gridDay, o.blackDays) > -1 ) ||
									( o.blackDates !== false && $.inArray(self._isoDate(self.theDate.getFullYear(), (self.theDate.getMonth()), calmode.prevtoday), o.blackDates) > -1 ) ||
									( o.blackDates !== false && $.inArray(self._isoDate(self.theDate.getFullYear(), (self.theDate.getMonth()+2), calmode.nexttoday), o.blackDates) > -1 ) ) {
										skipThis = true;
								} else { skipThis = false; }
									
								if ( gridWeek === 0 ) {
									$("<div>"+String(calmode.prevtoday)+"</div>")
										.addClass('ui-datebox-griddate ui-datebox-griddate-empty').appendTo(thisRow)
										.attr('data-date', ((o.calWeekMode)?(calmode.weekMode+calmode.lastend):calmode.prevtoday))
										.bind((!skipThis)?'vclick':'error', function(e) {
											e.preventDefault();
											if ( !self.calNoPrev ) {
												self.theDate.setMonth(self.theDate.getMonth() - 1);
												self.theDate.setDate($(this).attr('data-date'));
												self.input.trigger('datebox', {'method':'set', 'value':self._formatDate(self.theDate)});
												self.input.trigger('datebox', {'method':'close'});
											}
										});
									calmode.prevtoday++;
								} else {
									$("<div>"+String(calmode.nexttoday)+"</div>")
										.addClass('ui-datebox-griddate ui-datebox-griddate-empty').appendTo(thisRow)
										.attr('data-date', ((o.calWeekMode)?calmode.weekMode:calmode.nexttoday))
										.bind((!skipThis)?'vclick':'error', function(e) {
											e.preventDefault();
											if ( !self.calNoNext ) {
												self.theDate.setDate($(this).attr('data-date'));
												if ( !o.calWeekMode ) { self.theDate.setMonth(self.theDate.getMonth() + 1); }
												self.input.trigger('datebox', {'method':'set', 'value':self._formatDate(self.theDate)});
												self.input.trigger('datebox', {'method':'close'});
											}
										});
									calmode.nexttoday++;
								}
							}
						} else {
							skipThis = false;
							if ( calmode.checkDates ) {
								if ( o.afterToday && self._checker(calmode.thisDate) > (self._checker(self.theDate)+calmode.today-self.theDate.getDate()) ) {
									skipThis = true;
								} 
								if ( !skipThis && o.beforeToday && self._checker(calmode.thisDate) < (self._checker(self.theDate)+calmode.today-self.theDate.getDate()) ) {
									skipThis = true;
								}
								if ( !skipThis && o.notToday && calmode.today === calmode.highlightDay ) {
									skipThis = true;
								}
								if ( !skipThis && o.maxDays !== false && self._checker(calmode.maxDate) < (self._checker(self.theDate)+calmode.today-self.theDate.getDate()) ) {
									skipThis = true;
								} 
								if ( !skipThis && o.minDays !== false && self._checker(calmode.minDate) > (self._checker(self.theDate)+calmode.today-self.theDate.getDate()) ) {
									skipThis = true;
								} 
								if ( !skipThis && ( o.blackDays !== false || o.blackDates !== false ) ) { // Blacklists
									if ( 
										( $.inArray(gridDay, o.blackDays) > -1 ) ||
										( $.inArray(self._isoDate(self.theDate.getFullYear(), self.theDate.getMonth()+1, calmode.today), o.blackDates) > -1 ) ) { 
											skipThis = true;
									}
								}
							}
							
							if ( o.calHighPicked && calmode.today === calmode.presetDay ) { 
								calmode.thisTheme = o.pickPageHighButtonTheme;
							} else if ( o.calHighToday && calmode.today === calmode.highlightDay ) {
								calmode.thisTheme = o.pickPageTodayButtonTheme;
							} else if ( $.isArray(o.highDates) && ($.inArray(self._isoDate(self.theDate.getFullYear(), self.theDate.getMonth()+1, calmode.today), o.highDates) > -1 ) ) {
								calmode.thisTheme = o.pickPageOHighButtonTheme;
							} else if ( $.isArray(o.highDays) && $.inArray(gridDay, o.highDays) > -1 ) {
								calmode.thisTheme = o.pickPageODHighButtonTheme;
							} else {
								calmode.thisTheme = o.pickPageButtonTheme;
							}
							
							$("<div>"+String(calmode.today)+"</div>")
								.addClass('ui-datebox-griddate ui-corner-all')
								.attr('data-date', ((o.calWeekMode)?calmode.weekMode:calmode.today))
								.attr('data-theme', calmode.thisTheme)
								.appendTo(thisRow)
								.addClass('ui-btn-up-'+calmode.thisTheme)
								.bind('vmouseover vmouseout', function() { 
									if ( o.calWeekMode !== false && o.calWeekModeHighlight === true ) {
										$(this).parent().find('div').each(function() { self._hoover(this); });
									} else { self._hoover(this); }
								})
								.bind((!skipThis)?'vclick':'error', function(e) {
										e.preventDefault();
										self.theDate.setDate($(this).attr('data-date'));
										self.input.trigger('datebox', {'method':'set', 'value':self._formatDate(self.theDate)});
										self.input.trigger('datebox', {'method':'close'});
								})
								.css((skipThis)?'color':'nocolor', o.disabledDayColor);
							
							calmode.today++;
						}
					}
				}
			}
		}
		/* END:CALBOX */
	},
	_create: function() {
		var self = this,
			o = $.extend(this.options, this.element.data('options')),
			input = this.element,
			focusedEl = input.wrap('<div class="ui-input-datebox ui-shadow-inset ui-corner-all ui-body-'+ o.theme +'"></div>').parent(),
			theDate = new Date(),
			initDate = new Date(theDate.getTime()),
			dialogTitle = ((o.titleDialogLabel === false)?((o.mode==='timebox')?o.titleTimeDialogLabel:o.titleDateDialogLabel):o.titleDialogLabel),
			openbutton = $('<a href="#" class="ui-input-clear" title="date picker">date picker</a>')
				.bind('vclick', function (e) {
					e.preventDefault();
					if ( !o.disabled ) { self.input.trigger('datebox', {'method': 'open'}); }
					setTimeout( function() { $(e.target).closest("a").removeClass($.mobile.activeBtnClass); }, 300);
				})
				.appendTo(focusedEl).buttonMarkup({icon: 'grid', iconpos: 'notext', corners:true, shadow:true})
				.css({'vertical-align': 'middle', 'float': 'right'}),
			thisPage = input.closest('.ui-page'),
			pickPage = $("<div data-role='dialog' class='ui-dialog-datebox' data-theme='" + o.pickPageTheme + "' >" +
						"<div data-role='header' data-backbtn='false' data-theme='a'>" +
							"<div class='ui-title'>" + dialogTitle + "</div>"+
						"</div>"+
						"<div data-role='content'></div>"+
					"</div>")
					.appendTo( $.mobile.pageContainer )
					.page().css('minHeight', '0px').css('zIndex', o.zindex).addClass('pop'),
			pickPageContent = pickPage.find( ".ui-content" ),
			touch = ('ontouchstart' in window),
			START_EVENT = touch ? 'touchstart' : 'mousedown',
			MOVE_EVENT = touch ? 'touchmove' : 'mousemove',
			END_EVENT = touch ? 'touchend' : 'mouseup',
			dragMove = false,
			dragStart = false,
			dragEnd = false,
			dragPos = false,
			dragTarget = false,
			dragThisDelta = 0;
			
		$('label[for='+input.attr('id')+']').addClass('ui-input-text').css('verticalAlign', 'middle');
		
		/* BUILD:MODE */
		
		if ( o.mode === "timeflipbox" ) {
			o.headerFormat = ' ';
		}
		if ( o.timeOutput === false ) {
			o.timeOutput = o.timeFormats[o.timeFormat];
		}
		if ( o.fieldsOrder === false ) {
			switch (o.mode) {
				case 'timebox':
				case 'timeflipbox':
					o.fieldsOrder = o.timeFieldOrder; 
					break;
				case 'slidebox':
					o.fieldsOrder = o.slideFieldOrder; 
					break;
				default:
					o.fieldsOrder = o.dateFieldOrder; 
			}
		}
			
		if ( o.noButtonFocusMode || o.useInline || o.noButton ) { openbutton.hide(); }
		
		focusedEl.bind('vclick', function() {
			if ( !o.disabled && o.noButtonFocusMode ) { input.trigger('datebox', {'method': 'open'}); }
		});
		
		input
			.removeClass('ui-corner-all ui-shadow-inset')
			.focus(function(){
				if ( ! o.disabled ) {
					focusedEl.addClass('ui-focus');
					if ( o.noButtonFocusMode ) { focusedEl.addClass('ui-focus'); input.trigger('datebox', {'method': 'open'}); }
				}
				input.removeClass('ui-focus');
			})
			.blur(function(){
				focusedEl.removeClass('ui-focus');
				input.removeClass('ui-focus');
			})
			.change(function() {
				self.theDate = self._makeDate(self.input.val());
				self._update();
			});
			
		input.bind('datebox', self._dateboxHandler);
		
		pickPage.find( ".ui-header a").bind('vclick', function(e) {
			e.preventDefault();
			e.stopImmediatePropagation();
			self.input.trigger('datebox', {'method':'close'});
		});

		$.extend(self, {
			pickPage: pickPage,
			thisPage: thisPage,
			pickPageContent: pickPageContent,
			input: input,
			theDate: theDate,
			initDate: initDate,
			focusedEl: focusedEl,
			touch: touch,
			START_DRAG: START_EVENT,
			MOVE_DRAG: MOVE_EVENT,
			END_DRAG: END_EVENT,
			dragMove: dragMove,
			dragStart: dragStart,
			dragEnd: dragEnd,
			dragPos: dragPos
		});
		
		if ( typeof $.event.special.mousewheel !== 'undefined' ) { o.wheelExists = true; }
		
		self._buildPage();
		
		if ( o.swipeEnabled ) {
			$(document).bind(self.MOVE_DRAG, function(e) {
				if ( self.dragMove ) {
					if ( o.mode === 'slidebox' ) {
						self.dragEnd = self.touch ? e.originalEvent.changedTouches[0].pageX : e.pageX;
						self.dragTarget.css('marginLeft', (self.dragPos + self.dragEnd - self.dragStart) + 'px');
						e.preventDefault();
						e.stopPropagation();
						return false;
					} else if ( o.mode === 'flipbox' || o.mode === 'timeflipbox' ) {
						self.dragEnd = self.touch ? e.originalEvent.changedTouches[0].pageY : e.pageY;
						self.dragTarget.css('marginTop', (self.dragPos + self.dragEnd - self.dragStart) + 'px');
						e.preventDefault();
						e.stopPropagation();
						return false;
					} else if ( o.mode === 'durationbox' || o.mode === 'timebox' || o.mode === 'datebox' ) {
						self.dragEnd = self.touch ? e.originalEvent.changedTouches[0].pageY : e.pageY;
						if ( (self.dragEnd - self.dragStart) % 2 === 0 ) {
							dragThisDelta = (self.dragEnd - self.dragStart) / -2;
							if ( dragThisDelta < self.dragPos ) {
								self._offset(self.dragTarget, -1*(self.dragTarget==='i'?o.minuteStep:1));
							} else if ( dragThisDelta > self.dragPos ) {
								self._offset(self.dragTarget, 1*(self.dragTarget==='i'?o.minuteStep:1));
							} 
							self.dragPos = dragThisDelta;
						}
						e.preventDefault();
						e.stopPropagation();
						return false;
					}
				} 
			});
			$(document).bind(self.END_DRAG, function(e) {
				if ( self.dragMove ) {
					self.dragMove = false;
					if ( o.mode === 'slidebox' ) {
						if ( self.dragEnd !== false && Math.abs(self.dragStart - self.dragEnd) > 25 ) {
							e.preventDefault();
							e.stopPropagation();
							switch(self.dragTarget.parent().data('rowtype')) {
								case 'y':
									self._offset('y', parseInt(( self.dragStart - self.dragEnd ) / 84, 10));
									break;
								case 'm':
									self._offset('m', parseInt(( self.dragStart - self.dragEnd ) / 51, 10));
									break;
								case 'd':
									self._offset('d', parseInt(( self.dragStart - self.dragEnd ) / 32, 10));
									break;
								case 'h':
									self._offset('h', parseInt(( self.dragStart - self.dragEnd ) / 32, 10));
									break;
								case 'i':
									self._offset('i', parseInt(( self.dragStart - self.dragEnd ) / 32, 10));
									break;
							}
						}
					} else if ( o.mode === 'flipbox' || o.mode === 'timeflipbox' ) {
						if ( self.dragEnd !== false ) {
							e.preventDefault();
							e.stopPropagation();
							self._offset(self.dragTarget.parent().parent().data('field'), parseInt(( self.dragStart - self.dragEnd ) / 30, 10));
						}
					}
					self.dragStart = false;
					self.dragEnd = false;
				}
			});
		}
		
		if ( input.is(':disabled') ) {
			self.disable();
		}
	},
	_buildPage: function () {
		var self = this,
			o = self.options, x, newHour,
			linkdiv =$("<div><a href='#'></a></div>"),
			pickerContent = $("<div>", { "class": 'ui-datebox-container ui-overlay-shadow ui-corner-all ui-datebox-hidden pop ui-body-'+o.pickPageTheme} ).css('zIndex', o.zindex),
			templInput = $("<input type='text' />").addClass('ui-input-text ui-corner-all ui-shadow-inset ui-datebox-input ui-body-'+o.pickPageInputTheme),
			templControls = $("<div>", { "class":'ui-datebox-controls' }),
			templFlip = $("<div class='ui-overlay-shadow'><ul></ul></div>"),
			controlsPlus, controlsInput, controlsMinus, controlsSet, controlsHeader,
			pickerHour, pickerMins, pickerMeri, pickerMon, pickerDay, pickerYar, pickerSecs,
			calNoNext = false,
			calNoPrev = false,
			screen = $("<div>", {'class':'ui-datebox-screen ui-datebox-hidden'+((o.useModal)?' ui-datebox-screen-modal':'')})
				.css({'z-index': o.zindex-1})
				.appendTo(self.thisPage)
				.bind("vclick", function(event) {
					event.preventDefault();
					self.input.trigger('datebox', {'method':'close'});
				});
		
		if ( o.noAnimation ) { pickerContent.removeClass('pop'); }
		
		/* BEGIN:FLIPBOX */
		if ( o.mode === 'flipbox' || o.mode === 'timeflipbox' ) {
			controlsHeader = $("<div class='ui-datebox-header'><h4>Unitialized</h4></div>").appendTo(pickerContent).find("h4");
			controlsInput = $("<div>", {"class":'ui-datebox-flipcontent'}).appendTo(pickerContent);
			controlsPlus = $("<div>", {"class":'ui-datebox-flipcenter ui-overlay-shadow'}).appendTo(pickerContent);
			controlsSet = templControls.clone().appendTo(pickerContent);
			
			pickerDay = templFlip.clone().attr('data-field', 'd');
			pickerMon = templFlip.clone().attr('data-field', 'm');
			pickerYar = templFlip.clone().attr('data-field', 'y');
			pickerHour = templFlip.clone().attr('data-field', 'h');
			pickerMins = templFlip.clone().attr('data-field', 'i');
			pickerMeri = templFlip.clone().attr('data-field', 'a');
			
			if ( o.wheelExists ) {
				pickerYar.bind('mousewheel', function(e,d) { e.preventDefault(); self._offset('y', (d<0)?-1:1); });
				pickerMon.bind('mousewheel', function(e,d) { e.preventDefault(); self._offset('m', (d<0)?-1:1); });
				pickerDay.bind('mousewheel', function(e,d) { e.preventDefault(); self._offset('d', (d<0)?-1:1); });
				pickerHour.bind('mousewheel', function(e,d) { e.preventDefault(); self._offset('h', (d<0)?-1:1); });
				pickerMins.bind('mousewheel', function(e,d) { e.preventDefault(); self._offset('i', ((d<0)?-1:1)*o.minuteStep); });
				pickerMeri.bind('mousewheel', function(e,d) { e.preventDefault(); self._offset('a', d); });
				controlsPlus.bind('mousewheel', function(e,d) { 
					e.preventDefault();
					if ( o.fieldsOrder.length === 3 ) {
						self._offset(o.fieldsOrder[parseInt((e.pageX - $(e.currentTarget).offset().left) / 87, 10)], ((d<0)?-1:1));
					} else if ( o.fieldsOrder.length === 2 ) {
						self._offset(o.fieldsOrder[parseInt((e.pageX - $(e.currentTarget).offset().left) / 130, 10)], ((d<0)?-1:1));
					}
				});
			}
			
			for(x=0; x<=o.fieldsOrder.length; x++) {
				if (o.fieldsOrder[x] === 'y') { pickerYar.appendTo(controlsInput); }
				if (o.fieldsOrder[x] === 'm') { pickerMon.appendTo(controlsInput); }
				if (o.fieldsOrder[x] === 'd') { pickerDay.appendTo(controlsInput); }
				if (o.fieldsOrder[x] === 'h') { pickerHour.appendTo(controlsInput); }
				if (o.fieldsOrder[x] === 'i') { pickerMins.appendTo(controlsInput); }
				if (o.fieldsOrder[x] === 'a' && o.timeFormat === 12 ) { pickerMeri.appendTo(controlsInput); }
			}
			
			if ( o.swipeEnabled ) {
				controlsInput.find('ul').bind(self.START_DRAG, function(e,f) {
					if ( !self.dragMove ) {
						if ( typeof f !== "undefined" ) { e = f; }
						self.dragMove = true;
						self.dragTarget = $(this).find('li').first();
						self.dragPos = parseInt(self.dragTarget.css('marginTop').replace(/px/i, ''),10);
						self.dragStart = self.touch ? e.originalEvent.changedTouches[0].pageY : e.pageY;
						self.dragEnd = false;
						e.stopPropagation();
						e.preventDefault();
					}
				});
				controlsPlus.bind(self.START_DRAG, function(e) {
					if ( !self.dragMove ) {
						self.dragTarget = self.touch ? e.originalEvent.changedTouches[0].pageX - $(e.currentTarget).offset().left : e.pageX - $(e.currentTarget).offset().left;
						if ( o.fieldsOrder.length === 3 ) {
							$(self.controlsInput.find('ul').get(parseInt(self.dragTarget / 87, 10))).trigger(self.START_DRAG, e);
						} else if ( o.fieldsOrder.length === 2 ) {
							$(self.controlsInput.find('ul').get(parseInt(self.dragTarget / 130, 10))).trigger(self.START_DRAG, e);
						}
					}
				});
			}
			
			if ( o.noSetButton === false ) {
				$("<a href='#'>" + o.setDateButtonLabel + "</a>")
					.appendTo(controlsSet).buttonMarkup({theme: o.pickPageTheme, icon: 'check', iconpos: 'left', corners:true, shadow:true})
					.bind('vclick', function(e) {
						e.preventDefault();
						if ( o.mode === 'timeflipbox' ) { self.input.trigger('datebox', {'method':'set', 'value':self._formatTime(self.theDate)}); }
						else { self.input.trigger('datebox', {'method':'set', 'value':self._formatDate(self.theDate)}); }
						self.input.trigger('datebox', {'method':'close'});
					});
			}
			
			$.extend(self, {
				controlsHeader: controlsHeader,
				controlsInput: controlsInput,
				pickerDay: pickerDay,
				pickerMon: pickerMon,
				pickerYar: pickerYar,
				pickerHour: pickerHour,
				pickerMins: pickerMins,
				pickerMeri: pickerMeri
			});
			
			pickerContent.appendTo(self.thisPage);
			
		}
		/* END:FLIPBOX */
		/* BEGIN:DURATIONBOX */
		if ( o.mode === 'durationbox' ) {
			controlsPlus = templControls.clone().removeClass('ui-datebox-controls').addClass('ui-datebox-scontrols').appendTo(pickerContent);
			controlsInput = controlsPlus.clone().appendTo(pickerContent);
			controlsMinus = controlsPlus.clone().appendTo(pickerContent);
			controlsSet = templControls.clone().appendTo(pickerContent);
			
			pickerDay = templInput.removeClass('ui-datebox-input').clone()
				.keyup(function() {	if ( $(this).val() !== '' ) { self._updateduration(); } });
				
			pickerHour = pickerDay.clone().keyup(function() {	if ( $(this).val() !== '' ) { self._updateduration(); } });
			pickerMins = pickerDay.clone().keyup(function() {	if ( $(this).val() !== '' ) { self._updateduration(); } });
			pickerSecs = pickerDay.clone().keyup(function() {	if ( $(this).val() !== '' ) { self._updateduration(); } });
			
			if ( o.wheelExists ) {
					pickerDay.bind('mousewheel', function(e,d) { e.preventDefault(); self._offset('d', ((d<0)?-1:1)*o.durationSteppers['d']); });
					pickerHour.bind('mousewheel', function(e,d) { e.preventDefault(); self._offset('h', ((d<0)?-1:1)*o.durationSteppers['h']); });
					pickerMins.bind('mousewheel', function(e,d) { e.preventDefault(); self._offset('i', ((d<0)?-1:1)*o.durationSteppers['i']); });
					pickerSecs.bind('mousewheel', function(e,d) { e.preventDefault(); self._offset('s', ((d<0)?-1:1)*o.durationSteppers['s']); });
				}
			
			for ( x=0; x<o.durationOrder.length; x++ ) {
				switch ( o.durationOrder[x] ) {
					case 'd':
						$('<div>', {'class': 'ui-datebox-sinput', 'data-field': 'd'}).append(pickerDay).appendTo(controlsInput).prepend('<label>'+o.durationLabel[0]+'</label>');
						break;
					case 'h':
						$('<div>', {'class': 'ui-datebox-sinput', 'data-field': 'h'}).append(pickerHour).appendTo(controlsInput).prepend('<label>'+o.durationLabel[1]+'</label>');
						break;
					case 'i':
						$('<div>', {'class': 'ui-datebox-sinput', 'data-field': 'i'}).append(pickerMins).appendTo(controlsInput).prepend('<label>'+o.durationLabel[2]+'</label>');
						break;
					case 's':
						$('<div>', {'class': 'ui-datebox-sinput', 'data-field': 's'}).append(pickerSecs).appendTo(controlsInput).prepend('<label>'+o.durationLabel[3]+'</label>');
						break;
				}
			}
			
			if ( o.swipeEnabled ) {
				controlsInput.find('input').bind(self.START_DRAG, function(e) {
					if ( !self.dragMove ) {
						self.dragMove = true;
						self.dragTarget = $(this).parent().data('field');
						self.dragPos = 0;
						self.dragStart = self.touch ? e.originalEvent.changedTouches[0].pageY : e.pageY;
						self.dragEnd = false;
						e.stopPropagation();
						//e.preventDefault();
					}
				});
			}
			
			if ( o.noSetButton === false ) {
				$("<a href='#'>" + o.setDurationButtonLabel + "</a>")
					.appendTo(controlsSet).buttonMarkup({theme: o.pickPageTheme, icon: 'check', iconpos: 'left', corners:true, shadow:true})
					.bind('vclick', function(e) {
						e.preventDefault();
						self.input.trigger('datebox', {'method':'set', 'value':self._formatTime(self.theDate)});
						self.input.trigger('datebox', {'method':'close'});
					});
			}
				
			for ( x=0; x<o.durationOrder.length; x++ ) {
				linkdiv.clone()
					.appendTo(controlsPlus).buttonMarkup({theme: o.pickPageButtonTheme, icon: 'plus', iconpos: 'bottom', corners:true, shadow:true})
					.attr('data-field', o.durationOrder[x])
					.bind('vclick', function(e) {
						e.preventDefault();
						self._offset($(this).attr('data-field'),o.durationSteppers[$(this).attr('data-field')]);
					});
					
				linkdiv.clone()
					.appendTo(controlsMinus).buttonMarkup({theme: o.pickPageButtonTheme, icon: 'minus', iconpos: 'top', corners:true, shadow:true})
					.attr('data-field', o.durationOrder[x])
					.bind('vclick', function(e) {
						e.preventDefault();
						self._offset($(this).attr('data-field'),-1*o.durationSteppers[$(this).attr('data-field')]);
					});
			}
			
			$.extend(self, {
				pickerHour: pickerHour,
				pickerMins: pickerMins,
				pickerDay: pickerDay,
				pickerSecs: pickerSecs
			});
			
			pickerContent.appendTo(self.thisPage);
		}
		/* END:DURATIONBOX */
		/* BEGIN:DATETIME */
		if ( o.mode === 'datebox' || o.mode === 'timebox' ) {
			controlsHeader = $("<div class='ui-datebox-header'><h4>Unitialized</h4></div>").appendTo(pickerContent).find("h4");
			controlsPlus = templControls.clone().appendTo(pickerContent);
			controlsInput = templControls.clone().appendTo(pickerContent);
			controlsMinus = templControls.clone().appendTo(pickerContent);
			controlsSet = templControls.clone().appendTo(pickerContent);
			
			if ( o.mode === 'timebox' ) { controlsHeader.parent().html(''); }
			
			pickerMon = templInput.clone()
				.attr('data-field', 'm')
				.keyup(function() {
					if ( $(this).val() !== '' && self._isInt($(this).val()) ) {
						self.theDate.setMonth(parseInt($(this).val(),10)-1);
						self._update();
					}
				});
				
			pickerDay = pickerMon.clone()
				.attr('data-field', 'd')
				.keyup(function() {
					if ( $(this).val() !== '' && self._isInt($(this).val()) ) {
						self.theDate.setDate(parseInt($(this).val(),10));
						self._update();
					}
				});
				
			pickerYar = pickerMon.clone()
				.attr('data-field', 'y')
				.keyup(function() {
					if ( $(this).val() !== '' && self._isInt($(this).val()) ) {
						self.theDate.setFullYear(parseInt($(this).val(),10));
						self._update();
					}
				});
				
			pickerHour = templInput.clone()
				.attr('data-field', 'h')
				.keyup(function() {
					if ( $(this).val() !== '' && self._isInt($(this).val()) ) {
						newHour = parseInt($(this).val(),10);
						if ( newHour === 12 ) {
							if ( o.timeFormat === 12 && pickerMeri.val() === o.meridiemLetters[0] ) { newHour = 0; }
						}
						self.theDate.setHours(newHour);
						self._update();
					}
				});
				
			pickerMins = templInput.clone()
				.attr('data-field', 'i')
				.keyup(function() {
					if ( $(this).val() !== '' && self._isInt($(this).val()) ) {
						self.theDate.setMinutes(parseInt($(this).val(),10));
						self._update();
					}
				});
				
			pickerMeri = templInput.clone()
				.attr('data-field', 'a')
				.keyup(function() {
					if ( $(this).val() !== '' ) {
						self._update();
					}
				});
					
			if ( o.wheelExists ) {
				pickerYar.bind('mousewheel', function(e,d) { e.preventDefault(); self._offset('y', (d<0)?-1:1); });
				pickerMon.bind('mousewheel', function(e,d) { e.preventDefault(); self._offset('m', (d<0)?-1:1); });
				pickerDay.bind('mousewheel', function(e,d) { e.preventDefault(); self._offset('d', (d<0)?-1:1); });
				pickerHour.bind('mousewheel', function(e,d) { e.preventDefault(); self._offset('h', (d<0)?-1:1); });
				pickerMins.bind('mousewheel', function(e,d) { e.preventDefault(); self._offset('i', ((d<0)?-1:1)*o.minuteStep); });
				pickerMeri.bind('mousewheel', function(e,d) { e.preventDefault(); self._offset('a', d); });
			}
		
			for(x=0; x<=o.fieldsOrder.length; x++) {
				if (o.fieldsOrder[x] === 'y') { pickerYar.appendTo(controlsInput); }
				if (o.fieldsOrder[x] === 'm') { pickerMon.appendTo(controlsInput); }
				if (o.fieldsOrder[x] === 'd') { pickerDay.appendTo(controlsInput); }
				if (o.fieldsOrder[x] === 'h') { pickerHour.appendTo(controlsInput); }
				if (o.fieldsOrder[x] === 'i') { pickerMins.appendTo(controlsInput); }
				if (o.fieldsOrder[x] === 'a' && o.timeFormat === 12 ) { pickerMeri.appendTo(controlsInput); }
			}
			
			if ( o.swipeEnabled ) {
				controlsInput.find('input').bind(self.START_DRAG, function(e) {
					if ( !self.dragMove ) {
						self.dragMove = true;
						self.dragTarget = $(this).data('field');
						self.dragPos = 0;
						self.dragStart = self.touch ? e.originalEvent.changedTouches[0].pageY : e.pageY;
						self.dragEnd = false;
						e.stopPropagation();
					}
				});
			}
			
			if ( o.noSetButton === false ) {
				$("<a href='#'>" + o.setDateButtonLabel + "</a>")
					.appendTo(controlsSet).buttonMarkup({theme: o.pickPageTheme, icon: 'check', iconpos: 'left', corners:true, shadow:true})
					.bind('vclick', function(e) {
						e.preventDefault();
						if ( o.mode === 'timebox' ) { self.input.trigger('datebox', {'method':'set', 'value':self._formatTime(self.theDate)}); }
						else { self.input.trigger('datebox', {'method':'set', 'value':self._formatDate(self.theDate)}); }
						self.input.trigger('datebox', {'method':'close'});
					});
			}
			
			for( x=0; x<self.options.fieldsOrder.length; x++ ) {
				if ( o.fieldsOrder[x] !== 'a' || o.timeFormat === 12 ) {
					linkdiv.clone()
						.appendTo(controlsPlus).buttonMarkup({theme: o.pickPageButtonTheme, icon: 'plus', iconpos: 'bottom', corners:true, shadow:true})
						.attr('data-field', o.fieldsOrder[x])
						.bind('vclick', function(e) {
							e.preventDefault();
							self._offset($(this).attr('data-field'),1*($(this).attr('data-field')==='i'?o.minuteStep:1));
					});
					linkdiv.clone()
						.appendTo(controlsMinus).buttonMarkup({theme: o.pickPageButtonTheme, icon: 'minus', iconpos: 'top', corners:true, shadow:true})
						.attr('data-field', o.fieldsOrder[x])
						.bind('vclick', function(e) {
							e.preventDefault();
							self._offset($(this).attr('data-field'),-1*($(this).attr('data-field')==='i'?o.minuteStep:1));
					});
				}
			}
				
			$.extend(self, {
				controlsHeader: controlsHeader,
				pickerDay: pickerDay,
				pickerMon: pickerMon,
				pickerYar: pickerYar,
				pickerHour: pickerHour,
				pickerMins: pickerMins,
				pickerMeri: pickerMeri
			});
			
			pickerContent.appendTo(self.thisPage);
		}
		/* END:DATETIME */
		/* BEGIN:CALBOX */
		if ( o.mode === 'calbox' ) {
			controlsHeader = $("<div>", {"class": 'ui-datebox-gridheader'}).appendTo(pickerContent);
			controlsSet = $("<div>", {"class": 'ui-datebox-grid'}).appendTo(pickerContent);
			controlsInput = $("<div class='ui-datebox-gridlabel'><h4>Uninitialized</h4></div>").appendTo(controlsHeader).find('h4');
			
			if ( o.swipeEnabled ) {
				pickerContent
					.bind('swipeleft', function() { if ( !self.calNoNext ) { self._offset('m', 1); } })
					.bind('swiperight', function() { if ( !self.calNoPrev ) { self._offset('m', -1); } });
			}
			
			if ( o.wheelExists) {
				pickerContent.bind('mousewheel', function(e,d) {
					e.preventDefault();
					if ( d > 0 && !self.calNoNext ) { 
						if ( self.theDate.getDate() > 28 ) { self.theDate.setDate(1); }
						self.theDate.setMonth(self.theDate.getMonth() + 1);
						self._update(); 
					}
					if ( d < 0 && !self.calNoPrev ) {
						if ( self.theDate.getDate() > 28 ) { self.theDate.setDate(1); }
						self.theDate.setMonth(self.theDate.getMonth() - 1);
						self._update();
					}
				});
			}
						
			$("<div class='ui-datebox-gridplus'><a href='#'>Next Month</a></div>")
				.prependTo(controlsHeader).buttonMarkup({theme: o.pickPageButtonTheme, icon: 'plus', inline: true, iconpos: 'notext', corners:true, shadow:true})
				.bind('vclick', function(e) {
					e.preventDefault();
					if ( ! self.calNoNext ) {
						if ( self.theDate.getDate() > 28 ) { self.theDate.setDate(1); }
						self._offset('m',1);
					}
				});
			$("<div class='ui-datebox-gridminus'><a href='#'>Prev Month</a></div>")
				.prependTo(controlsHeader).buttonMarkup({theme: o.pickPageButtonTheme, icon: 'minus', inline: true, iconpos: 'notext', corners:true, shadow:true})
				.bind('vclick', function(e) {
					e.preventDefault();
					if ( ! self.calNoPrev ) {
						if ( self.theDate.getDate() > 28 ) { self.theDate.setDate(1); }
						self._offset('m',-1);
					}
				});
				
					
			$.extend(self, {
				controlsInput: controlsInput,
				controlsSet: controlsSet,
				calNoNext: calNoNext,
				calNoPrev: calNoPrev
			});
			
			pickerContent.appendTo(self.thisPage);
		}
		/* END:CALBOX */
		/* BEGIN:SLIDEBOX */
		if ( o.mode === 'slidebox' ) {
			controlsHeader = $("<div class='ui-datebox-header'><h4>Unitialized</h4></div>").appendTo(pickerContent).find("h4");
			controlsInput = $('<div>').addClass('ui-datebox-slide').appendTo(pickerContent);
			controlsSet = $("<div>", { "class":'ui-datebox-controls'}).appendTo(pickerContent);
				
			if ( o.noSetButton === false ) {
				$("<a href='#'>" + o.setDateButtonLabel + "</a>")
					.appendTo(controlsSet).buttonMarkup({theme: o.pickPageTheme, icon: 'check', iconpos: 'left', corners:true, shadow:true})
					.bind('vclick', function(e) {
						e.preventDefault();
						self.input.trigger('datebox', {'method':'set', 'value':self._formatDate(self.theDate)});
						self.input.trigger('datebox', {'method':'close'});
					});
			}
			
			$.extend(self, {
				controlsHeader: controlsHeader,
				controlsInput: controlsInput
			});
			
			pickerContent.appendTo(self.thisPage);
		}
		/* END:SLIDEBOX */

		$.extend(self, {
			pickerContent: pickerContent,
			screen: screen
		});
		
		if ( o.useInline ) { 
			self.input.parent().parent().append(self.pickerContent);
			if ( o.useInlineHideInput ) { self.input.parent().hide(); }
			self.input.trigger('change');
			self.pickerContent.removeClass('ui-datebox-hidden');
		}
			
	},
	refresh: function() {
		if ( this.options.useInline === true ) {
			this.input.trigger('change');
		}
		this._update();
	},
	open: function() {
		if ( this.options.useInline ) { return false; }
		if ( this.options.open === true ) { return false; } else { this.options.open = true; }
		
		this.input.trigger('change').blur();
		
		var self = this,
			o = this.options,
			inputOffset = self.focusedEl.offset(),
			pickWinHeight = self.pickerContent.outerHeight(),
			pickWinWidth = self.pickerContent.innerWidth(),
			pickWinTop = inputOffset.top + ( self.focusedEl.outerHeight() / 2 )- ( pickWinHeight / 2),
			pickWinLeft = inputOffset.left + ( self.focusedEl.outerWidth() / 2) - ( pickWinWidth / 2);
			
		// TOO FAR RIGHT TRAP
		if ( (pickWinLeft + pickWinWidth) > $(document).width() ) {
			pickWinLeft = $(document).width() - pickWinWidth - 1;
		}
		// TOO FAR LEFT TRAP
		if ( pickWinLeft < 0 ) {
			pickWinLeft = 0;
		}
		if ( o.centerWindow ) {
			pickWinLeft = ( $(document).width() / 2 ) - ( pickWinWidth / 2 );
		}
		
		if ( (pickWinHeight + pickWinTop) > $(document).height() ) {
			pickWinTop = $(document).height() - (pickWinHeight + 2);
		}
		if ( pickWinTop < 45 ) { pickWinTop = 45; }
		
		if ( ( $(document).width() > 400 && !o.useDialogForceTrue ) || o.useDialogForceFalse ) {
			o.useDialog = false;
			if ( o.useModal ) {
				self.screen.fadeIn('slow');
			} else {
				self.screen.removeClass('ui-datebox-hidden');
			}
			self.pickerContent.addClass('ui-overlay-shadow in').css({'position': 'absolute', 'top': pickWinTop, 'left': pickWinLeft}).removeClass('ui-datebox-hidden');
		} else {
			o.useDialog = true;
			self.pickPageContent.append(self.pickerContent);
			self.pickerContent.css({'top': 'auto', 'left': 'auto', 'marginLeft': 'auto', 'marginRight': 'auto'}).removeClass('ui-overlay-shadow ui-datebox-hidden');
			$.mobile.changePage(self.pickPage, {'transition': 'pop'});
		}
	},
	close: function() {
		var self = this,
			callback;

		if ( self.options.useInline ) {
			return true;
		}
		self.options.open = false;

		if ( self.options.useDialog ) {
			$(self.pickPage).dialog('close');
			self.pickerContent.addClass('ui-datebox-hidden').removeAttr('style').css('zIndex', self.options.zindex);
			self.thisPage.append(self.pickerContent);
		} else {
			if ( self.options.useModal ) {
				self.screen.fadeOut('slow');
			} else {
				self.screen.addClass('ui-datebox-hidden');
			}
			self.pickerContent.addClass('ui-datebox-hidden').removeAttr('style').css('zIndex', self.options.zindex).removeClass('in');
		}
		self.focusedEl.removeClass('ui-focus');
		
		if ( self.options.closeCallback !== false ) { callback = new Function(self.options.closeCallback); callback(); }
	},
	disable: function(){
		this.element.attr("disabled",true);
		this.element.parent().addClass("ui-disabled");
		this.options.disabled = true;
		this.element.blur();
		this.input.trigger('datebox', {'method':'disable'});
	},
	enable: function(){
		this.element.attr("disabled", false);
		this.element.parent().removeClass("ui-disabled");
		this.options.disabled = false;
		this.input.trigger('datebox', {'method':'enable'});
	}
	
  });
	
  $( ".ui-page" ).live( "pagecreate", function() { 
	$( 'input[data-role="datebox"]', this ).each(function() {
		$(this).datebox();
	});

  });
	
})( jQuery );

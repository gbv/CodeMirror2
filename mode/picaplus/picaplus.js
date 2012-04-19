/*
 *	PICA+ Mode for CodeMirror 2 
 *	@author Jakob Voss
 *	@link 	https://github.com/gbv/picaplus-codemirror-2
*/
CodeMirror.defineMode("picaplus", function(config, parserConfig) {
	var tagPattern = /^([0-2][0-9][0-9][A-Z@])(\/([0-9][0-9]))?$/;
	var TAG      = 0;
	var SUBFIELD = 1
	var VALUE    = 2;
	var Token = {
		tag		: "keyword",
		subfield: "atom",
		wrongtag: "error",
		value	: "word",
	};
	return {
		startState: function() {
			return {
				lev: 0,
				mode: TAG,
			};
		},
    	token: function(stream, state) {
			if (stream.sol()) {
				state.mode = TAG;
			  	if (stream.eatWhile(/[^\s$]/)) {
			    	var match = tagPattern.exec(stream.current());
			    	if ( match ) {
						/*
						var lev = parseInt(match[1].charAt(0));
						if ((lev == 0 && state.lev > 0) || (lev == 2 && state.lev == 0)) {
							state.lev = lev;
							return Token.wrongtag;
						}
						state.lev = lev;
						*/
						if (!stream.match(/^\s*\$/,false)) {
							return "error";
						}
						return Token.tag;
			    	} else {
						return "error";
			    	}
				}
			} else if (state.mode == VALUE ) {
				state.mode = SUBFIELD;
				while( stream.skipTo('$') ) {
					if ( stream.match('$$') ) {
						stream.next(); stream.next();
				    } else {
			 			return Token.value;
				    }
			  	}
				stream.skipToEnd();
			 	return Token.value;
			} else { // subfield
				if (state.mode == TAG && stream.eatSpace()) return;
			  	if (stream.next() == "$") {
			    	if ( stream.eat(/[a-zA-Z0-9]/) ) {
						state.mode = VALUE;
					 	var look = stream.peek(); // empty subfield
					 	if (!look || (look == '$' && !stream.match(/^$[^$]/))) {
							return "error";
						}
						return Token.subfield;
			    	}
				}
			}
			stream.skipToEnd();
			return "error";
		}
	};
});

CodeMirror.defineMIME("text/x-picaplus", "picaplus");

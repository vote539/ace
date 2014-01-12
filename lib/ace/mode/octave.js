define(function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
// defines the parent mode
var TextMode = require("./text").Mode;
var Tokenizer = require("../tokenizer").Tokenizer;
var MatchingBraceOutdent = require("./matching_brace_outdent").MatchingBraceOutdent;
var Range = require("../range").Range;

// defines the language specific highlighters and folding rules
var OctaveHighlightRules = require("./octave_highlight_rules").OctaveHighlightRules;

var Mode = function() {
	// set everything up
	this.HighlightRules = OctaveHighlightRules;
	this.$outdent = new MatchingBraceOutdent();
};
oop.inherits(Mode, TextMode);

(function() {
	var keywordsYieldingIndent = "if|elseif|else|while|for|do";
	var keywordsYieldingOutdent = "end|else";
	var outdentRegExp = new RegExp("^\\s+(?:"+keywordsYieldingOutdent+")$");

	this.getNextLineIndent = function(state, line, tab) {
		var indent = this.$getIndent(line);

		var tokenizedLine = this.$tokenizer.getLineTokens(line, state);
		var tokens = tokenizedLine.tokens;

		if (tokens.length && tokens[tokens.length-1].type == "comment") {
			return indent;
		}
		
		if (state == "start") {
			var match = line.match("(?:;|^)\\s*(?:"+keywordsYieldingIndent+")[^;]*$");
			var fnMatch = line.match(/^\s*function.+?\=\s*(\w+)\(.*\)\s*$/);
			if (match) {
				indent += tab;
			}else if(fnMatch){
				indent += "% "+fnMatch[1]+": ";
			}
		}

		return indent;
	};

	this.checkOutdent = function(state, line, input) {
		return outdentRegExp.test(line+input);
	};

	this.autoOutdent = function(state, doc, row) {
		// copied from ruby.js
		var indent = this.$getIndent(doc.getLine(row));
		var tab = doc.getTabString();
		if (indent.slice(-tab.length) == tab)
			doc.remove(new Range(row, indent.length-tab.length, row, indent.length));
	};

	/*
	this.createWorker = function(session) {
		var worker = new WorkerClient(["ace"], "ace/mode/octave_worker", "NewWorker");
		worker.attachToDocument(session.getDocument());

		return worker;
	};
	*/
}).call(Mode.prototype);

exports.Mode = Mode;
});
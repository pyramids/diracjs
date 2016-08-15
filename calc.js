(function() {
    "use strict";
    var calcInput, calcNormalize, calcOutput, calcButton,
	fmt = {
	    left: '<span class="bra">&lt;',
	    centerLeft: '<span class="ket">|',
	    centerRight: '|</span>',
	    right: '&gt;</span>',
	    i: '<span class=i>i</span>'
	},
	hasHistory;
    
    document.addEventListener('DOMContentLoaded', function() {
	/*
	  // one could use github.com/pyramids/needjs to load
	  // integrity-verified subresources, with the added benefits 
	  // over current (html5) subresource integrity that
	  // a) the integrity check happens in all browsers and
	  // b) fallbacks can be provided in case the check fails
	need(
	    init, [
		'//cdnjs.cloudflare.com/ajax/libs/mathjs/3.4.1/math.min.js'
		, '//res/math.min.js', ''
	    ], '6f8f3abe87aa63ce39fcfacab6d2fae3b54bab07fad615d893e3f348f57e8db7'
	);
	*/
	init();
    });

    function init() {
	calcInput = document.getElementById("calcinput");
	calcNormalize = document.getElementById("calcnormalize");
	calcOutput = document.getElementById("calcoutput");
	calcButton = document.getElementById("calcbutton");

	calcInput.addEventListener('change', calcEvent);
	calcNormalize.addEventListener('change', calcEvent);
	calcButton.addEventListener('click', calcReuse);

	hasHistory = !!(window.history && window.history.pushState);
	if (hasHistory) {
	    document.getElementById("history-instruction").classList.remove('gone');
	    window.onpopstate = historyEvent;
	}
    }

    function historyEvent(event) {
	calcInput.value = event.state.input;
	calcNormalize.checked = !!event.state.normalize;
	calc(event.state);
    }
    
    function calcEvent(event, reuse) {
	var state = calc({
	    input: calcinput.value
	}, reuse);
	
	if (hasHistory) {
	    window.history.pushState(state, /* title */ state.output);
	}
    }

    function calcReuse(event) {
	calcEvent(event, true);
    }

    function calc(state, reuse) {
	var r;
	try {
	    r = dirac(state.input);
	    state.normalize = !!calcNormalize.checked;
	    if (state.normalize && !r.isScalar() && !r.isOperator()) {
		try {
		    r.normalize();
		} catch (e) {
		    // don't output an error if only normalization
		    // failed (which would happen on operators as that
		    // is unimplemented)
		}
	    }
	    if (reuse) {
		calcinput.value = '(' + r.toString() + ')';
	    }
	    r = r.toString(fmt);
	    calcOutput.classList.remove("error");
	} catch (e) {
	    r = '';
	    calcOutput.classList.add("error");
	}
	//calcOutput.textContent = r;
	calcOutput.innerHTML = r;

	state.output = r;
	return state;
    }
})();

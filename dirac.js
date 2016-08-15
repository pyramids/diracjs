/**
 * @file dirac.js
 * @author Björn Stein
 * @namespace dirac
 *
 * @classdesc Module for quantum-mechanical convenience function in
 * Dirac notation using math.js. Complex numbers are represented as
 * math.complex (see mathjs) or as a Number than can be cast into
 * math.Complex. Bra and ket vectors (and operators) are represented
 * as math.matrix (see mathjs), or as arrays of arrays that can be
 * cast into a math.matrix with two dimensions.
 */

/** 
 * @class dirac
 *
 * @param {String | Number | math.complex | Number[][] |
 *         math.complex[][] | math.matrix} [y=1] the dirac object's
 *         initial value
 *
 * @return dirac
 * @desc Returns a dirac() module, optionally initialized
 */
function dirac(y) {
    var x = math.complex(1), defaultFmt = {
	left: '<',
	center: '|',
	right: '>',
	decimals: 4,
	i : 'i'
    };
    if (y) {
	if (y.ket) {
	    x = y.get();
	} else {
	    if (typeof y === 'string') {
		y = parse(y);
	    }
	    if (!isScalar(y)) {
		x = math.matrix(y);
	    } else {
		//x = math.clone(y);
		x = math.complex(y);
	    }
	}
    }

    // reveal API
    return {
	// functions that return a result (not chainable)
	get: get,
	toString: toString,
	toUnicode: toUnicode,
	toTEX: toTEX,
	valueOf: valueOf,
	isBra: isBra,
	isKet: isKet,
	isScalar: isScalar,
	isOperator: isOperator,
	qubits: qubits,
	// chainable functions
	bra: bra,
	ket: ket,
	ketFromArray: ketFromArray,
	num: num,
	plus:plus,
	minus:minus,
	project:project,
	dagger:dagger,
	abs:abs,
	normalize:normalize
    };

    /** 
     * @function dirac().get
     *
     * @desc Returns value of dirac object, which can be a
     *       math.complex (for scalar values) or a math.matrix (for
     *       bra or ket vectors and for operators).
     *
     * @return {math.complex|math.matrix}
     */
    function get() {
	// check if the result is a scalar (for the side effect of
	// turning it into a true scalar)
	this.isScalar();
	return math.clone(x);
    }

    /** 
     * @function dirac().toUnicode
     * @desc Returns a UTF8 representation.
     * @return String
     */
    function toUnicode() {
	return this.toString({
	    left: '〈',
	    right: '〉',
	    center: '|',
	    i: 'ⅈ'
	});
    }

    /** 
     * @function dirac().toUnicode
     * @desc Returns a TEX math-mode representation.
     * @return String
     */
    function toTEX() {
	return this.toString({
	    left: '\langle',
	    right: '\rangle',
	    center: '|',
	    i: '\imath'
	});
    }

    /** 
     * @function dirac().toUnicode
     *
     * @param {Object} format
     *
     * @desc Returns a String representation following the (optionally
     *       specified) format, with keys for the number of decimals
     *       to print (key 'decimals'), the representation of the
     *       imaginary unit (key 'i'), the representation of angle
     *       brackets (keys 'left' and 'right') and that of vertical
     *       brackets (keys 'centerLeft' and 'centerRight' or simply
     *       'center' if the first two are undefined). Defaults are
     *       used for other missing keys or if not format is given.
     *
     * @return String
     */
    function toString(format) {
	var s = '', isKet, isBra, fmt={}, eps, first = true, qubits;
	if (this.isScalar()) {
	    return x.toString();
	}

	// essentially Firefox'
	// String.prototype.padStart(targetLength, padString):
	// extend the length of string s to len by repeatedly
	// prepending prefix, then return the result
	function extend(s, len, prefix) {
	    /*
	      if (s.length > len) {
	      throw Error('Trying to shorten rather than extend a string.');
	      }
	    */
	    while (s.length < len) {
		s = prefix + s;
	    }
	    return s;
	}
	
	function sket(idx) {
	    return fmt.centerLeft
		+ extend(idx[0].toString(2), qubits, '0')
		+ fmt.right;
	}
	function sbra(idx) {
	    return fmt.left
		+ extend(idx[1].toString(2), qubits, '0')
		+ fmt.centerRight;
	}

	for(var a in defaultFmt) {
	    fmt[a] = defaultFmt[a];
	}
	if (format) {
	    for(var a in format) {
		fmt[a] = format[a];
	    }
	}
	if (!fmt.centerLeft) {
	    fmt.centerLeft = fmt.center;
	}
	if (!fmt.centerRight) {
	    fmt.centerRight = fmt.center;
	}
	eps = 0.5 * Math.pow(0.1, fmt.decimals);
	isKet = this.isKet();
	isBra = this.isBra();
	qubits = Math.max(this.qubits(), fmt.qubits||0);
	x.forEach(function(el, idx) {
	    var str, v = math.complex(el);
	    if (math.abs(v) > eps) {
		str = v.format(fmt.decimals).replace('i', fmt.i);
		if (str === '1') {
		    str = '';
		} else if (str === '-1') {
		    str = '-'
		} else {
		    if (str.indexOf(' + ') >= 0 || str.indexOf(' - ') >= 0 ) {
			// both real and complex parts present
			// (depends on mathjs typesetting spaces
			// around the plus or minus sign)
			str = ['(',')'].join(str);
		    }
		}
		if ((!first) && (str.charAt(0) != '-')) {
		    str = ' + ' + str;
		} else if (str.charAt(0) == '-') {
		    if (first) {
			str = '-' + str.substr(1);
		    } else {
			str = ' - ' + str.substr(1);
		    }
		}
		first=false;
		s = s + str;
		
		if (isKet) {
		    s = s + sket(idx);
		} else if (isBra) {
		    s = s + sbra(idx);
		} else {
		    // operator
		    s = s + sket(idx) + sbra(idx);
		}
	    }
	});
	if (s.length == 0) {
	    return '0';
	};
	return s;
    }

    /**
     * @function dirac.valueOf
     * @return {math.complex | math.matrix} The value represented by this dirac instance.
     */
    function valueOf() {
	//return this.get().valueOf();
	return x.valueOf();
    }

    // used internally to parse a String in Dirac notation
    function parse(s) {
	// parse a string into a math.matrix (or number or
	// math.complex) by using math.eval after substitutions
	// for inputs in dirac matrix notation
	//
	// Problem: mathjs.eval has some quirks

	var qubits = 1;

	function countQubits(s) {
	    // parse s as non-negative, binary number and take that
	    // as the unit vector this ket represents
	    var inner;
	    
	    inner = s.replace(/[^01]+/g,'');
	    //n = parseInt(inner, 2);
	    if (inner.length > qubits) {
		qubits = inner.length;
	    }
	}
	
	function parseKet(s) {
	    // parse s as non-negative, binary number and take that
	    // as the unit vector this ket represents
	    var inner, n, dim, i;
	    
	    inner = s.replace(/[^01]+/g,'');
	    n = parseInt(inner, 2);
	    dim = 1 << Math.max(inner.length, qubits);
	    
	    return log('ket '+s, [
		'([',
		// (n) zero coordinates
		new Array( n+1 ).join('0;'),
		// one unity coordinate
		'1',
		// (dim-n-1) zero coordinates
		new Array( dim-n ).join(';0'),
		'])'
	    ].join(''));
	}
	
	function parseBra(s) { 
	    // evaluate the ket vector's transjugation, since leaving
	    // the function call may interfer with implicit matrix
	    // multiplication inside mathjs' eval function
	    return log('bra '+s, ['(',')'].join(math.eval(
		['conj(transpose(','))'].join(parseKet(s))
	    ).toString()));
	}

	function log(sin, sout) {
	    /*
	      if (console && console.log) {
	      // for debugging
	      console.log(sin, 'becomes', sout);
	      }
	    */
	    return sout;
	}

	// first, normalize brackets and delimiters
	s = s
	// map characters to ASCII: right angle
	    .replace(/⟩|〉|〉/g, '>')
	// map characters to ASCII: left angle
	    .replace(/⟨|〈|〈/g, '<')
	// map characters to ASCII: (vertical delimiter bar)
	    .replace(/∣|│/g, '|')
	// break up brackets: <.|.> becomes <.| |.>
	    .replace(
		    /<[^<>\|]*\|[^<>\|]*>/g,
		function(match) {
		    return match.replace(/\|/, '| |');
		}
	    );

	// count max. number of qubits
	(s.match(/<[^<>\|]+\|/g) || [])
	    .concat(s.match(/\|[^<>\|]+>/g) || [])
	    .forEach(countQubits);
	    
	s = s
	// bra vectors
	    .replace(/<[^<>\|]+\|/g, parseBra)
	// ket vectors
	    .replace(/\|[^<>\|]+>/g, parseKet)
	// functions given as latex commands
	    .replace(
		    /\\([a-z]*)\{([^}]*)\}/g,
		'($1($2))'
	    )
	// imaginary units
	    .replace(/i/g, '(i)')
	// undo the i -> (i) replacement in the function sin(..)
	    .replace(/s\(i\)n\(/g, 'sin(')
	// undo the i -> (i) replacement in the constant pi
	    .replace(/p\(i\)/g, 'pi')
	;

	// finally, let mathjs parse the resulting expression
	return math.eval(log('eval ',s));
    }

    /**
     * @function isKet
     *
     * @param {Number | math.complex | Number[][] | math.complex[][] | math.matrix} y Object to test
     *
     * @desc Tests if the given parameter or, if none is given, this
     *       instance represents a Dirac ket vector, for example |1>.
     *
     * @return Boolean
     */
    function isKet(y) {
	var s = math.matrix([y || x]).size(); // expect: [1,n,1]
	return (s.length === 3 && s[2] === 1);
    }

    /**
     * @function isBra
     *
     * @param {Number | math.complex | Number[][] | math.complex[][] | math.matrix} y Object to test
     *
     * @desc Tests if the given parameter or, if none is given, this
     *       instance represents a Dirac bra vector, for exmaple <1|.
     *
     * @return Boolean
     */
    function isBra(y) {
	var s = math.matrix([y || x]).size(); // expect: [1,1,n]
	return (s.length === 3 && s[1] === 1);
    }

    /**
     * @function isScalar
     *
     * @param {Number | math.complex | Number[][] | math.complex[][] | math.matrix} y Object to test
     *
     * @desc Tests if the given parameter or, if none is given, this
     *       instance represents a scalar value, for example 1.
     *
     * @return Boolean
     */
    function isScalar(y) {
	// hack: turn even a scalar into at least a vector by
	// adding one dimension (by putting it inside an array)
	var s = math.matrix([y || x]).size();
	if (s.length === 3) {
	    // technically, this is a matrix---but does it have
	    // more than one entry?
	    var slike = (s[1] === 1 && s[2] === 1);
	    if (slike && !y) {
		// whilst we are at it: turn x into a true scalar
		x = math.squeeze(x);
	    }
	    return slike;
	}
	return (s.length === 1);
    }

    /**
     * @function isOperator
     *
     * @param {Number | math.complex | Number[][] | math.complex[][] | math.matrix} y Object to test
     *
     * @desc Tests if the given parameter or, if none is given, this
     *       instance represents an operator, for example |1><0|.
     *
     * @return Boolean
     */    
    function isOperator(y) {
	var s = math.matrix([y || x]).size(); // expect: [1,n,m]
	return (s.length === 3 && s[1] > 1 && s[2] > 1);
    }

    /**
     * @function qubits
     *
     * @param {Number | math.complex | Number[][] | math.complex[][] | math.matrix} y Object to evaluate
     *
     * @desc Determine the minimum number of qubits necessary to
     *       represent the given object (parameter or this). Scalar
     *       values need zero qubits; ket vectors, bra vectors and
     *       operators need enough to write them in binary.
     *
     * @return Number
     */
    function qubits(y) {
	var s = math.matrix([y || x]).size(), n, k; // expect: [1,n,m]
	if (s.length === 1) {
	    // scalar value
	    return 0
	}
	n = Math.max(s[1], s[2]);
	k = 1;
	while ((1 << k) < n) {
	    k = k + 1;
	}
	return k;
    }

    function abs() {
	if (this.isOperator()) {
	    throw new Error('unimplemented');
	}
	var y = math.transpose(math.conj(x)), z, s;
	if (this.isKet()) {
	    z = x;
	} else {
	    z = y;
	    y = x;
	}
	// math.squeeze is a hack to get scalar value both if the
	// argument is a scalar already and if it is the single
	// element of a vector or (here) a matrix
	s = math.squeeze(math.matrix([math.multiply(y, z)]));
	return math.sqrt(s);
    }

    function normalize() {
	var n = this.abs();
	if (n != 0) {
	    x = math.multiply(1.0 / n, x);
	}
	return this;
    }

    // enlarge a, if it is a matrix, to dimensions of b (or
    // larger, where a is larger already)
    function extendTo(a, b) {
	var sa, sb, s;
	if (!isScalar(a) && !isScalar(b)) {
	    a = math.clone(a);
	    //a = math.matrix(a);
	    sa = a.size();
	    sb = b.size();
	    s = [Math.max(sa[0],sb[0]), sa[1]];
	    a = a.resize(s);
	    s = [s[0], Math.max(sa[1],sb[1])];
	    a = a.resize(s);
	}
	return a;
    }
    
    function plus(y) {
	if (y.ket) {
	    // accept dirac() object as input
	    y = y.get();
	}
	x = math.add(
	    extendTo(x, y),
	    extendTo(y, x)
	);
	return this;
    }

    function minus(y) {
	if (y.ket) {
	    // accept dirac() object as input
	    y = y.get();
	}
	x = math.subtract(
	    extendTo(x, y),
	    extendTo(y, x)
	);
	return this;
    }

    function num(n) {
	if (n.ket) {
	    // accept dirac() object as input
	    n = n.get();
	}
	
	// assert that n is a Complex (from mathjs) or a
	// javascript number; solve by trying to parse it as such
	n = math.complex(n);
	
	//x = math.multiply(x, n); //fails: leads to matrix mult.	    
	x = math.multiply(n, x);
	return this;
    }

    function bra(b) {
	if (b.ket) {
	    // accept dirac() object as input
	    b = b.get();
	}
	// assert that b is a row vector
	if (!this.isBra(b)) {
	    throw new TypeError("Expect a Dirac bra vector, got " + b.toString);
	}
	x = math.multiply(x, math.matrix(b));
	return this;
    }
    
    function ket(k) {
	if (k.ket) {
	    // accept dirac() object as input
	    k = k.get();
	}
	// assert that k is a column vector
	if (!this.isKet(k)) {
	    throw new TypeError("Expect a Dirac ket vector, got " + k.toString);
	}
	k = math.matrix(k);
	if (!this.isScalar()) {
	    // resize to accomodate previously unseen basis kets
	    var sx = x.size(), sk = k.size();
	    if (sx[1] > sk[0]) {
		sk[0] = sx[1];
		k.resize(sk);
	    } else if (sx[1] < sk[0]) {
		sx[1] = sk[0];
		x.resize(sx);
	    }
	}
	// apply k
	x = math.multiply(x, k);
	// check if the result is a scalar (for the side effect of
	// turning it into a true scalar)
	this.isScalar();
	return this;
    }

    function ketFromArray(k) {
	var ket = [], i;
	for(i=0; i<k.length; i++) {
	    ket.push([k[i]]);
	}
	this.ket(ket);
	return this;
    }

    function dagger() {
	x = math.transpose(math.conj(x));
	return this;
    }

    // create projector |p><p| / <p|p> and apply it
    function project(pKet) {
	var pBra, bracket;
	if (pKet.get) {
	    pKet = pKet.get();
	}
	// assert that pKet is a column vector
	if (!this.isKet(pKet)) {
	    throw new TypeError("Expect a Dirac ket vector, got " + pKet.toString);
	}
	pBra = math.transpose(math.conj(pKet));
	bracket = math.squeeze(math.multiply(pBra, pKet));
	this.ket(pKet).bra(pBra).num(1.0 / bracket);
	return this;
    }
}


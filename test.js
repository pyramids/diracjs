document.addEventListener('DOMContentLoaded', function() {
    var i = math.complex(0,1), minusi = math.complex(0,-1), _r2 = 1.0 / math.sqrt(2);

    QUnit.test('Basics', function(assert) {
	var bra = [[0,1]], ket = [[0],[1]], ket11 = [[1],[1]],
	    keti = [[0], [math.complex(0,1)]], ket1i = [[1], [math.complex(0,1)]];
	
	assert.deepEqual(dirac().get(), math.complex(1), 'dirac() initializes to the identity');
	assert.deepEqual(dirac().num(3.25).toString(), '3.25', 'dirac().num(3.25).toString()');
	assert.deepEqual(dirac().num(math.complex(1,1)).toString(), '1 + i', 'dirac().num(1 + i).toString()');

	assert.deepEqual(dirac().num(3.25).isScalar(), true, 'isScalar() (scalar)');
	assert.deepEqual(dirac().bra(bra).isScalar(), !true, 'isScalar() (bra)');
	assert.deepEqual(dirac().ket(ket).isScalar(), !true, 'isScalar() (ket)');

	assert.deepEqual(dirac().num(3.25).isBra(), false, 'isBra() == false (scalar)');
	assert.deepEqual(dirac().bra(bra).isBra(), true, 'isBra() == true');
	assert.deepEqual(dirac().ket(ket).isBra(), false, 'isBra() == false (ket)');

	assert.deepEqual(dirac().num(3.25).isKet(), false, 'isKet() (scalar)');
	assert.deepEqual(dirac().bra(bra).isKet(), false, 'isKet() (bra)');
	assert.deepEqual(dirac().ket(ket).isKet(), true, 'isKet() (ket)');

	assert.deepEqual(dirac().bra([[0,1]]).ket([[0],[1]]).toString(), '1', '<1|1>');
	assert.deepEqual(dirac().bra([[1,0]]).ket([[0],[1]]).toString(), '0', '<0|1>');
	assert.deepEqual(dirac().bra([[1,0]]).ket([[1],[0]]).toString(), '1', '<0|0>');

	assert.deepEqual(dirac().bra([[0,0,1]]).ket([[1],[0]]).toString(), '0', '<2|0> extend ket');
	assert.deepEqual(dirac().bra([[1,0]]).ket([[0],[0],[1]]).toString(), '0', '<0|2> extend bra');
	assert.deepEqual(dirac().ket([[0],[0],[1]]).toString(), '|10>', '|10> (binary notation)');

	assert.deepEqual(dirac().bra(bra).toString(), '<1|', '<1|');
	assert.deepEqual(dirac().ket(ket).toString(), '|1>', '|1>');
	assert.deepEqual(dirac().ket(ket11).toString(), '|0> + |1>', '|0> + |1>');
	
	//assert.deepEqual(dirac().ket(ket11).dagger().toString(), '<0| + <1|', '(|0> + |1>)<sup>†</sup>');
	assert.deepEqual(dirac().ket(ket11).dagger().toString(), '<0| + <1|', '(|0> + |1>)† = <0| + <1|');
	assert.deepEqual(dirac().ket(keti).dagger().toString(), '-i<1|', '(i|1>)† = -i<1|');
	assert.deepEqual(dirac().ket(ket1i).dagger().toString(), '<0| - i<1|', '(|0> + i|1>)† = <0| - i<1|');
	

	assert.deepEqual(dirac().ket(math.multiply(1.0/Math.sqrt(2), ket11)).toString(),
			 '0.7071|0> + 0.7071|1>', '(sqrt(2)/2) (|0> + |1>)');
	assert.deepEqual(dirac().ket(math.multiply(math.complex(0.5,0.5), ket11)).toString(),
			 '(0.5 + 0.5i)|0> + (0.5 + 0.5i)|1>', '(1 + i)/2 (|0> + |1>)');

	assert.deepEqual(dirac().project(ket).toString(), '|1><1|', '|1><1|');
	assert.deepEqual(dirac().ket(keti).bra(bra).toUnicode(), 'ⅈ|1〉〈1|', 'ⅈ|1〉〈1|');
    });

    QUnit.test('Additions', function(assert) {
	var ket2 = dirac().ketFromArray([0,1]),
	    bra2 = dirac().ketFromArray([0,1]).dagger(),
	    ket3 = dirac().ketFromArray([0,0,1]),
	    bra3 = dirac().ketFromArray([0,0,1]).dagger(),
	    proj2= dirac().project(ket2),
	    proj3= dirac().project(ket3);

	assert.deepEqual(dirac().bra(bra2).plus(bra3).toString(), '<01| + <10|', 'add extended bra vector');
	assert.deepEqual(dirac().ket(ket2).plus(ket3).toString(), '|01> + |10>', 'add extended ket vector');

	assert.deepEqual(proj2.toString(), '|1><1|', '|1><1|');
	assert.deepEqual(dirac(proj2).toString(), '|1><1|', '|1><1|');
	assert.deepEqual(dirac(proj3).toString(), '|10><10|', '|10><10|');

	//assert.deepEqual(dirac(proj2).plus(proj3).qubits(), 2, 'Count qubits of |01><01| + |10><10|');
	assert.deepEqual(
	    dirac(proj2).plus(proj3).toString(),
	    '|01><01| + |10><10|',
	    'add extended operator'
	);
	assert.deepEqual(
	    dirac(proj2).minus(proj3).toString(),
	    '|01><01| - |10><10|',
	    'subtract extended operator'
	);
    });
	
    QUnit.test('Norm and normalization', function(assert) {
	var bra = [[0,1]],
	    ket = dirac().ketFromArray([0,1]).get(),
	    ket2 = dirac().ketFromArray([1,i]).get(),
	    ket2n = dirac().ketFromArray([_r2,math.complex(0,_r2)]).get(),
	    unity = math.complex(1);

	assert.deepEqual(dirac(1).abs(), math.complex(1), '|| 1 || = 1');
	assert.deepEqual(dirac(2).abs(), math.complex(2), '|| 2 || = 2');
	assert.deepEqual(
	    dirac(math.complex(1,-1)).abs(),
	    math.sqrt(math.complex(2,0)),
	    '|| 1 - i || = sqrt(2)'
	);
	
	assert.deepEqual(dirac().ket(ket).toString(), '|1>', '|1>');
	assert.deepEqual(dirac().ket(ket).abs(), unity, '|| |1> || = 1');
	assert.deepEqual(dirac().bra(bra).abs(), unity, '|| <1| || = 1');
	assert.deepEqual(
	    dirac().ket(ket2).abs(),
	    math.sqrt(math.complex(2,0)), '|| |0>  + i |1> || = sqrt(2)'
	);
	assert.deepEqual(
	    dirac().ket(ket2).dagger().abs(),
	    math.sqrt(math.complex(2,0)), '|| <0| - i <1| || = sqrt(2)'
	);

	assert.deepEqual(
	    dirac().ket(ket2).normalize().get(),
	    ket2n,
	    'sqrt(2) (|0>  + i |1>)'
	);

	/*
	  // unimplemented
	assert.deepEqual(
	    dirac().ket(ket).bra(bra).normalize().toString,
	    '|1><1|',
	    'normalize operator'
	);
	*/
    });

    QUnit.test('Parsing', function(assert) {
	function parse(input, output, desc) {
	    var s, cl, log = '';
	    try {
		if (console) {
		    cl = console.log;
		};
		console.log = function(s1,s2,s3) {
		    log = log + s1+' '+s2+' '+s3+'\n';
		}
		s=dirac(input).toString();
	    } catch (e) {
		s = e.toString() + '\nLog:\n'+log;
	    }
	    if (console) {
		console.log=cl;
	    }
	    assert.deepEqual(s, output, desc || input);
	};

	parse('1', '1');
	parse('-i', '-i');
	parse('1-i', '1 - i');

	parse('|0>', '|0>');
	parse('|1>', '|1>');
	parse('|0>+i|1>', '|0> + i|1>');

	parse('<0|', '<0|');
    	parse('<1|', '<1|');

	parse('<0|+i<1|', '<0| + i<1|');
	parse('<1|1>', '1');
	
	parse('sin(pi/4) |0> + cos(pi/4) |1>', '0.7071|0> + 0.7071|1>', 'trigonometric functions');

	parse('|1><1|', '|1><1|');
	parse('(|0>+|1>)(<0|+<1|)', '|0><0| + |0><1| + |1><0| + |1><1|');

	parse('<10| + <1|', '<01| + <10|', 'extend number of qubits in bra vectors');
	parse('|100> + |1>', '|001> + |100>', 'extend number of qubits in ket vectors');
	parse('|0><0| + |100><1|', '|000><000| + |100><001|', 'extend number of qubits in operators');
    });
});

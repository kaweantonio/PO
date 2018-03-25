
var ArvoreBinaria = function (val, z) {
	this.root = {
		solucao : val,
		zSolucao: z
	};
}

ArvoreBinaria.prototype = {
	inserir : function(noPai, posicao, val, z){
		var no = {
			solucao : val,
			zSolucao: z,
			xBifurcacao: null,
			xValor: null,
			esq : null,
			dir : null
		};

		if (posicao === 0) { // esquerda
			noPai.esq = no;
		} else {
			noPai.dir = no;
		}
	}
}

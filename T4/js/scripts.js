var numVars = 2;
var numRestr = 1;
var trocaSinal; // bool para troca de sinal na resolução de problemas de maximização 
var contadorIte = 0;
var contadorIteCortes = 0;
var matriz; // armazena matriz A da tabela Simplex
var copiaMatriz;
var custo; // vetor com custo das variaveis
var copiaCusto;
var custoVarArtificial; // valor de custo para variaveis artificiais
var inteiras; // vetor para armazenar variaveis inteiras
var base; // vetor com as variaveis que estao na base
var artificial; // vetor para armazenar quais sao as variaveis artificiais
var folgas; // vetor para armazenar quais sao as variaveis de folga 
var vetorB; // vetor com o limite das restricoes
var copiaVetorB;
var custoBase; // vetor com custo das variaveis basicas 
var custoReduzido; // vetor para armazenar calculo do custo reduzido
var z; // valor da função objetivo
var zInteiro; // valor da funcao objetivo para solucao Inteira
var menorBA // variavel para armazenar o menor valor positivo de b/[aij]
var conjuntoSolucaoOtima; // vetor para Conj. de Solucao Otima
var resultadoAnaliseSolucao;
var basicaInteira; // armazena qual a variavel basica inteira a se realizar a bifurcação
var conjuntoSolucaoInteira; // vetor para conjunto de Solucao Otima Inteira
var basesSolucao; // vetor para bases do conjunto de solucao otima inteira
var vetorBSolucao; // vetor do vetorB do conjunto de solucao otima inteira
var tree;
var limpou = 0;

$(document).ready(function(){
	limpa();
	alteraTabela();
});

function atribuiValores(){
	numVars = parseInt($('#numVariaveis').val(), 10)
	numRestr = parseInt($('#numRestricoes').val(), 10)
}

function limpa(){
	document.getElementById('form-controle').reset();
}

$("#numVariaveis").on("change", function(){
	if (validacao()) {
		atribuiValores();
		alteraTabela();
		restauraTabela();
	}
});

$("#numRestricoes").on("change", function(){
	if (validacao()) {
		atribuiValores();
		alteraTabela();
		restauraTabela();
	}
});

function alerta(msg){
	$('#msg-alerta').empty();
	$('#msg-alerta').append(msg);

	$('#secao-alerta').show();
}

function isIntegerNumber(evt, element) {

  var charCode = (evt.which) ? evt.which : event.keyCode

  if (
    (charCode != 45 || $(element).val().indexOf('-') != -1) && // “-” CHECK MINUS, AND ONLY ONE.
    (charCode != 8) &&
    (charCode < 48 || charCode > 57))
    return false;

  return true;
}

function isNumber(evt, element) {

  var charCode = (evt.which) ? evt.which : event.keyCode;

  if (
    (charCode != 45 || $(element).val().indexOf('-') != -1) && // “-” CHECK MINUS, AND ONLY ONE.
    (charCode != 44 || $(element).val().indexOf(',') != -1) && // “.” CHECK DOT, AND ONLY ONE.
    (charCode != 8) &&
    (charCode < 48 || charCode > 57))
    return false;

  return true;
}

$('#form-controle input[type="number"]').keypress(function (event) { 
	return isIntegerNumber(event, this) 
});

function validacao(){
	var i, j;
	copiaCusto = [];
	copiaMatriz = [];
	copiaVetorB = [];
	inteiras = [];
	var num;

	$div_var = $('#variaveis-inteiras');

	num = $('#numVariaveis').val();

	if (num === ''){
		alerta("Entre com um valor v&aacute;lido para o N&uacute;mero de Vari&aacute;veis");
		$('#numVariaveis').focus();
		return 0;
	} else if (num > 10 || num < 2) {
		alerta("Entre com um valor entre 2 e 10 para o N&uacute;mero de Vari&aacute;veis");
		$('#numVariaveis').focus();
		return 0;
	}

	num = $('#numRestricoes').val();

	if (num === ''){
		alerta("Entre com um valor v&aacute;lido para o N&uacute;mero de Restri&ccedil;&otilde;es");
		$('#numRestricoes').focus();
		return 0;
	} else if (num > 10 || num < 1) {
		alerta("Entre com um valor entre 1 e 10 para o N&uacute;mero de Restri&ccedil;&otilde;es");
		$('#numRestricoes').focus();
		return 0;
	}

	for (i = 0; i < numVars; i++){
		num = $("#funcao-objetivo").find("input").eq(i).val().replace(/,/,'.');
		if (num === '')
			num = 0;
		copiaCusto.push(parseFloat(num, 10));

		if ($div_var.find("input").eq(i).is(':checked'))
			inteiras.push(i+1);
	}

	for (i = 0; i < numRestr; i++){
		copiaMatriz.push([]);

		for (j = 0; j < numVars; j++){
			num = $("#restr"+(i+1)).find("input").eq(j).val().replace(/,/,'.');
			if (num === '')
				num = 0;
			copiaMatriz[i][j] = parseFloat(num, 10);
		}

		num = $("#restr"+(i+1)).find("input").last().val().replace(/,/,'.');
		if (num === '')
			num = 0;
		copiaVetorB.push(parseFloat(num, 10));
	}

	$('#secao-alerta').hide();
	return 1;
}

function alteraTabela(){
	$div_func = $('#funcao-objetivo');
	$div_var = $('#variaveis-inteiras');
	$div_restr = $('#restricoes');

	$div_func.empty();
	$div_var.empty();
	$div_restr.empty();

	$div_func.append('z = ');
	for (var i = 0; i < numVars; i++){
		$div_func.append('<input id=" x'+(i+1)+'" type="text" placeholder="0"> x<sub>'+(i+1)+'</sub>')
		if (i < numVars-1)
				$div_func.append(' + ');
		$div_var.append('<div class="form-check form-check-inline"><label class="form-check-label lead"><input class="form-check-input" type="checkbox" id="x'+(i+1)+'">x<sub>'+(i+1)+'</sub></label></div>');
	}

	for (var i = 0; i < numRestr; i++){
		$div_restr.append('<div id="restr'+(i+1)+'">');
		$restr = $('#restr'+(i+1));
		for (var j = 0; j < numVars; j++){
			$restr.append('<input id="x'+(i+1)+(j+1)+'" type="text" placeholder="0"> x<sub>'+(j+1)+'</sub>');
			if (j < numVars-1)
				$restr.append(' + ');
			else
				$restr.append('  <select id="cp'+(i+1)+'" type="text" class="opcao-restricao"><option value="0" selected>&le;</option><option value="1">&ge;</option><option value="2">=</option></select> ');		
		}
		$restr.append(' <input id="b'+(i+1)+'" type="text" placeholder="0">&ensp;&ensp;<br>');
	}

	$(':input[type="text"]').keypress(function (event) { 
		return isNumber(event, this) 
	});
}

function restauraTabela(){
	var i, j;

	$div_func = $('#funcao-objetivo');
	for (i = 0; i < copiaCusto.length; i++){
		if (copiaCusto[i] !== 0){
			$div_func.find("input").eq(i).val(copiaCusto[i]);
		}
	}

	for (i = 0; i < copiaMatriz.length; i++){
		$div_restr = $('#restr'+(i+1));
		for (j = 0; j < copiaMatriz[0].length; j++) {
			if (copiaMatriz[i][j] !== 0)
				$div_restr.find("input").eq(j).val(copiaMatriz[i][j]);
		}

		if (copiaVetorB[i] !== 0)
			$div_restr.find("input").last().val(copiaVetorB[i]);
	}
}

function setaValoresPredefinidos(){
	var i, j;
	var num;

	$div_func = $('#funcao-objetivo');

	for (i = 0; i < numVars; i++){
		num = $div_func.find("input").eq(i).val();
		if (num === '')
			$div_func.find("input").eq(i).val(0)
	}

	for (i = 0; i < numRestr; i++){
		$restr = $('#restr'+(i+1));
		for (j = 0; j < numVars; j++) {
			num = $restr.find("input").eq(j).val();
			if (num === '')
			$restr.find("input").eq(j).val(0);
		}

		num = $restr.find("input").last().val() 
		if (num === 0)
			$restr.find("input").last().val(num);
	}
}

$("#btCalcula").click(function (){
	limpou = 0;
	$div_ite = $('#iteracoes');

	if (validacao() && inteiras.length !== 0) {
		$div_ite.empty();
		$div_ite.append('<div class="col-md-12"><h4 class="card-title" style="text-align: center;">Itera&ccedil;&otilde;es</h4><p class="lead" style="text-align: left;">M&eacute;todo realiza Busca em Profundidade para criar as Bifurca&ccedil;&otilde;es.</p></div>');
		$('#resultado-otimo-inteiro').attr('class', 'col-md-12');
		formapadrao();
		BranchAndBound();
		imprimeSolucaoFinal();
		imprimeArvore(tree);

		$('#solucao').show('slow');
		if ($('#mostrarIte').is(':checked')) {
			$div_ite.show('slow');
		}
		else {
			$div_ite.hide('slow');
		}
	} else if (inteiras.length === 0){
		alerta("Nenhuma vari&aacute;vel selecionada como Inteira. Para resolu&ccedil;&atilde;o de Problemas Lineares Reais, utilize o m&eacute;todo <a href='../T1/index.html'>Simplex</a> ou <a href='../T2/index.html'>Simplex - Duas Fases</a>.");
		return;
	}
});

$('#btLimpa').click(function (){
	limpa();
	atribuiValores();
	alteraTabela();
	$('#solucao').hide('slow');
	limpou = 1;
})

$("#mostrarIte").change( function(){
   if($(this).is(':checked') && !limpou){
   	$('#iteracoes').show('slow');
   } else {
   	$('#iteracoes').hide('slow');
   }
});
 
Array.max = function( array ){
   return Math.max.apply( null, array.map(Math.abs));
};

function adicionaZeros(linha, coluna){
	var i; // iterador

	// adiciona zeros na coluna das linhas abaixo e acima da variavel adicionada
	for (i = (linha+1)%numRestr; i != linha; i = (i+1)%numRestr){
		matriz[i][coluna] = 0;
	}
}

function adicionaZerosBifurcacao(salvaMatriz, numRestr, linha, coluna){
	var i; // iterador

	// adiciona zeros na coluna das linhas abaixo e acima da variavel adicionada
	for (i = (linha+1)%numRestr; i != linha; i = (i+1)%numRestr){
		salvaMatriz[i][coluna] = 0;
	}

	return salvaMatriz;
}

function formapadrao(){
	var i, j; // iteradores
	var contador = numVars; // contador para adcionar variáveis de folga e artificial
	var limitanteRestr; // limitante da restricao (<=; >=; =)
	var valorB; // variavel para armazenar valor de b[i] a cada iteração
	matriz = []; custo = []; base = []; artificial = []; vetorB = []; folgas = []; // inicializacao de variaveis
	if($("#objetivo").val() === "1") { // maximização
		trocaSinal = 1;
		zInteiro = -Infinity;
	} else { // minimização
		trocaSinal = 0;
		zInteiro = +Infinity;
	}

	for (i = 0; i < numRestr; i++) {
		matriz.push([]);
	}

	for (i = 0; i < numVars; i++) {
		if(trocaSinal && !Object.is(copiaCusto[i], 0))
			custo.push(-1*copiaCusto[i]);
		else custo.push(copiaCusto[i]);
	}

	custoVarArtificial = Array.max(custo) * 10;

	if (custoVarArtificial === 0)
		custoVarArtificial = 10;	

	for (i = 0; i < numRestr; i++){
		limitanteRestr = $("#cp"+(i+1)).val();

		valorB = copiaVetorB[i];
		if (valorB < 0) {
			vetorB.push((-1)*valorB);
			switch(limitanteRestr) {
				case "0": 
					limitanteRestr="1";
					break;
				case "1":
					limitanteRestr="0";
					break;
			}
		}
		else vetorB.push(valorB);

		for (j = 0; j < numVars; j++) {
			if (valorB < 0)
				matriz[i][j] = (-1)*copiaMatriz[i][j];
			else matriz[i][j] = copiaMatriz[i][j];
		}

		switch (limitanteRestr) {
			case "0": // <= -> adicionar variavel de folga
				custo.push(0);
				matriz[i][contador] = 1;
				adicionaZeros(i, contador);
				contador++;
				base.push(contador);
				folgas.push([contador, i+1]);
				break;
			case "1": // >= -> adicionar variavel de folga negativa e artifical
				custo.push(0);
				matriz[i][contador] = -1;
				adicionaZeros(i, contador);
				contador++;
				folgas.push([contador, i+1]);
				custo.push(custoVarArtificial);
				matriz[i][contador] = 1;
				adicionaZeros(i, contador);
				contador++;
				base.push(contador);
				artificial.push(contador);
				break;
			default: // = -> adcionar variavel artificial
				custo.push(custoVarArtificial);
				matriz[i][contador] = 1;
				adicionaZeros(i, contador);
				contador++;
				base.push(contador);
				artificial.push(contador);				
		}
	}

	imprimeFP();
}

function imprimeFP(){
	var i, j;
	var m = matriz.length;
	var n = matriz[0].length;

	$div_fp = $('#forma-padrao');
	$div_fprestr = $('#forma-padrao-restricoes');

	$div_fp.empty();
	$div_fprestr.empty();

	$div_fp.append('Minimizar ');

	if (trocaSinal)
		$div_fp.append(' -z = ');
	else $div_fp.append(' z = ');

	for (i = 0; i < n; i++) {
		$div_fp.append(custo[i].toString()+'x<sub>'+(i+1)+'</sub>');
		if (i < n-1) {
			if (custo[i+1] >= 0)
				$div_fp.append(' + ');
			else $div_fp.append(' ');
		}
	}

	for (i = 0; i < m; i++) {
		for (j = 0; j < n; j++) {
			$div_fprestr.append(matriz[i][j].toString()+'x<sub>'+(j+1)+'</sub>');
			if (j < n-1) {
				if (matriz[i][j+1] >= 0)
					$div_fprestr.append(' + ');
				else $div_fprestr.append(' ');
			}
			else { 
				$div_fprestr.append(' = '+vetorB[i].toString()+'<br/>');
			}
		}
	}

	$div_fprestr.append(' x &ge; 0 e ');

	for (i = 0; i < inteiras.length-1; i++){
		$div_fprestr.append('x<sub>'+inteiras[i]+'</sub>, ');
	}

	$div_fprestr.append('x<sub>'+inteiras[inteiras.length-1]+'</sub>  '+ ((inteiras.length > 1) ? 'inteiros' : 'inteiro'));
}

function selecaoLexicografica(vetorBA, menorBA, linhaMenorBA){
	var contadorEmpate = vetorBA.filter(k => k === menorBA).length; // contador de quantas linhas houve empate
	var i, j; // iteradores
	var linhasEmpate = []; // armazena os indices das linhas em que houve empate
	var matrizEmpate = []; // armazena as linhas da matriz em que houve empate 
	var vetorBEmpate = []; // armazena b[i] das linhas em que houve empate 
	var linhaMatriz;
	var menor;
	var linhaMenor;
	var igual;

	// salva linhas para analise posterior
	for (i = 0; i < contadorEmpate; i++){
		matrizEmpate.push([]);
		linhasEmpate.push(vetorBA.indexOf(menorBA, i));
		for (j = 0; j < matriz[0].length; j++){
			matrizEmpate[i][j] = matriz[linhasEmpate[i]][j];
		}
		vetorBEmpate.push(vetorB[linhasEmpate[i]]);
	}

	// realiza analise
	linhaMenor = 0;
	for (i = 0; i < matrizEmpate[0].length; i++){ // anda pela coluna
		igual = 0;
		matrizEmpate[0][i] = Math.abs(matrizEmpate[0][i]/vetorBEmpate[0]);
		menor = matrizEmpate[0][i];
		for (j = 1; j < matrizEmpate.length; j++){ // anda pela linha
			matrizEmpate[j][i] = Math.abs(matrizEmpate[j][i]/vetorBEmpate[j]);
			if (matrizEmpate[j][i] < menor){
				menor = matrizEmpate[j][i];
				linhaMenor = j;
				igual = 0;
			} else if (matrizEmpate[j][i] === menor){
				linhaMenor = j;
				igual = 1;
			}
		}

		if (!igual) break;
	}

	if (igual){
		return linhasEmpate[linhasEmpate.length-1];
	} else return linhasEmpate[linhaMenor];
}

function pivotamento(linha, coluna) {
	var i, j; // iteradores
	var pivot; // pivot escolhido

	pivot = matriz[linha][coluna];

	for (i = 0; i < matriz[0].length; i++){
		matriz[linha][i] /= pivot;
	}

	vetorB[linha] /= pivot;

	for (i = (linha+1)%matriz.length; i != linha; i = (i+1)%matriz.length){
		pivot = matriz[i][coluna] / matriz[linha][coluna];

		for (j = 0; j < matriz[0].length; j++){
			matriz[i][j] -= pivot*matriz[linha][j];
		}

		vetorB[i] -= pivot*vetorB[linha];
	}
}

function Simplex(){
	var i, j; // iteradores
	var soma; // variavel auxiliar para calculo da soma da multiplicacao entre custo da base e valores na matriz 
	var menorValor // variavel para armazenar o menor valor no custo reduzido
	var menorBA // variavel para armazenar o menor valor positivo de b/[aij]
	var colunaMenorValor; // identificacao da coluna do menor valor no custo reduzido
	var linhaMenorBA; // coluna do menor BA
	var vetorBA; // vetor para calculo de b/a[ij]
	var basesAnteriores = []; // salva bases anteriores encontradas pelo metodo 
	var baseNova; // armazena nova base a ser utilizada
	var empate; // boolean para indicar que houve empate na escolha do menorBA

	do {
		menorValor = Number.MAX_VALUE;
		menorBA = Number.MAX_VALUE;
		empate = 0;
		custoBase = []; custoReduzido = []; // inicializao de variaveis
		for (i = 0; i < base.length; i++){
			custoBase.push(custo[base[i]-1]);
		}

		for (i = 0; i < custo.length; i++){
			soma = 0;
			for (j = 0; j < base.length; j++){
					soma += custoBase[j] * matriz[j][i];
			}
			custoReduzido.push(custo[i] - soma);
		}

		for (i = 0; i < custoReduzido.length; i++){
			if (custoReduzido[i] < menorValor && !base.includes(i+1)){
				menorValor = custoReduzido[i];
				colunaMenorValor = i;
			}
		}

		if (menorValor < 0){
			vetorBA = [];
			var ba;
			for (i = 0; i < matriz.length; i++){
				ba = vetorB[i]/(matriz[i][colunaMenorValor]);
				if (!Number.isNaN(ba))
					vetorBA.push(ba);
				else vetorBA.push(+Infinity);
			}
		}

		if (typeof vetorBA !== 'undefined' && menorValor <= 0) {
			for (i = 0; i < vetorBA.length; i++){
				if (vetorBA[i] < menorBA && vetorBA[i] >= 0 && !Object.is(vetorBA[i], -0) && isFinite(vetorBA[i])){
					menorBA = vetorBA[i];
					linhaMenorBA = i;
					empate = 0;
				} else if (vetorBA[i] === menorBA && !Object.is(vetorBA[i], -0) && isFinite(vetorBA[i])){
					empate = 1;
				}
			}

			if (empate){
				linhaMenorBA = selecaoLexicografica(vetorBA, menorBA, linhaMenorBA);
			}

			baseNova = [];

			for (i = 0; i < base.length; i++){
				if(i === linhaMenorBA){
					baseNova.push(colunaMenorValor+1);
				} else baseNova.push(base[i]);
			}

			if (basesAnteriores.containsArray(baseNova)) {
				var novaLinhaMenorBA;
				var novoMenorBA = Number.MAX_VALUE;

				for (i = (linhaMenorBA+1)%vetorBA.length; i != linhaMenorBA; i = (i+1)%vetorBA.length){
					if (vetorBA[i] >= menorBA && vetorBA[i] <= novoMenorBA && vetorBA[i] >= 0 && !Object.is(vetorBA[i], -0) && isFinite(vetorBA[i])) {
						novoMenorBA = vetorBA[i];
						novaLinhaMenorBA = i;
					}
				}

				linhaMenorBA = novaLinhaMenorBA;
				menorBA = novoMenorBA;

				baseNova = [];

				for (i = 0; i < base.length; i++){
					if(i == linhaMenorBA){
						baseNova.push(colunaMenorValor+1);
					} else baseNova.push(base[i]);
				}
			}
		}

		if (menorValor < 0 && typeof linhaMenorBA !== 'undefined' && menorBA !== Number.MAX_VALUE) {
			pivotamento(linhaMenorBA, colunaMenorValor);
			basesAnteriores.push(base.slice());
			base[linhaMenorBA] = colunaMenorValor+1;
			custoBase[linhaMenorBA] = custo[colunaMenorValor];
		}

		if (typeof vetorBA === 'undefined' || menorValor > 0) {
			for (i = 0; i < vetorB.length; i++){
				if (vetorB[i] < menorBA && vetorB[i] >= 0 && !Object.is(vetorB[i], -0) && isFinite(vetorB[i])){
					menorBA = vetorB[i];
					// linhaMenorBA = i;
				}
			}	
		}

		if (menorBA === Number.MAX_VALUE)
			break;
	} while (menorValor < 0);

	return menorBA;
}

function criaArvoreBranchAndBound(menorBA, noPai, posicao){
	var i, j; // iteradores
	z = 0; // calculo de custo de z

	resultadoAnaliseSolucao = analisaSolucao(menorBA);
	if (resultadoAnaliseSolucao === 1) { // solucao vaiza
		tree.inserir(noPai, posicao, 'Vazia')
	} else if (resultadoAnaliseSolucao === 2){
		tree.inserir(noPai, posicao, 'Ilimitada')
	} else {

		conjuntoSolucaoOtima = [];
		for (i = 0; i < numVars; i++){
			if (base.includes(i+1)){
				conjuntoSolucaoOtima.push(vetorB[base.indexOf(i+1)]);
			} else {
				conjuntoSolucaoOtima.push(0);
			}
		}
		
		for (i = 0; i < base.length; i++){
			z += custo[base[i]-1] * vetorB[i];
		}

		if (trocaSinal)
			z *= -1;
		tree.inserir(noPai, posicao, conjuntoSolucaoOtima, z)
	}
}

function imprimeArvore(tree){
	var i, j; // iteradores
	var queue = [tree.root];
	var noPai;
	contadorIte = 0;

	$div_ite = $('#iteracoes');

	$div_ite.append('<div class="col-md-4"><div id="card'+contadorIte+'" class="card border-dark" id="iteracao'+contadorIte+'"><h5 id="titulo'+contadorIte+'" class="card-header text-white bg-dark">P'+(contadorIte)+'</h5><div class="card-body"><blockquote class="card-blockquote"><p id="solucao-encontrada'+contadorIte+'" class="lead"><b>Solu&ccedil;&atilde;o encontrada: </b></p><p id="situacao'+contadorIte+'" class="lead"><b>Situa&ccedil;&atilde;o: </p></blockquote></div></div></div>');

	$p_solucao = $('#solucao-encontrada'+contadorIte);
	$p_situacao = $('#situacao'+contadorIte);

	if (Array.isArray(queue[0].solucao)) {
		$p_solucao.append('x<sup>&lowast;</sup> = (');
		for (i = 0; i < queue[0].solucao.length-1; i++){
			$p_solucao.append(round(queue[0].solucao[i])+'&nbsp;&nbsp;');
		}

		$p_solucao.append(round(queue[0].solucao[i])+')<sup>T</sup><br/>');

		$p_solucao.append('z<sup>&lowast;</sup> = '+round(queue[0].zSolucao));

		if (tree.esq !== null){
			queue.push(tree.esq, tree.dir);
			$p_situacao.append('Continuar bifurca&ccedil;&atilde;o em x<sub>'+tree.esq.xBifurcacao+'.</sub>');
		} else {
			$p_situacao.append('Solu&ccedil;&atilde;o Inteira &oacute;tima encontrada, portanto parar bifurca&ccedil;&atilde;o.');
		}
	} else {
		$p_solucao.append(queue[0].solucao+'.');
		$p_situacao.append('Parar bifurca&ccedil;&atilde;o do ramo.');
	}

	queue.shift();
	noPai = new Array(contadorIte, contadorIte);
	contadorIte++;

	while (queue.length > 0) {
		$div_ite.append('<div class="col-md-4"><div id="card'+contadorIte+'" class="card border-dark" id="iteracao'+contadorIte+'"><h5 id="titulo'+contadorIte+'" class="card-header text-white bg-dark">P'+noPai[0]+' > P'+(contadorIte)+'</h5><div class="card-body"><p id="bifurca'+contadorIte+'" class="lead"><b>Bifurca&ccedil;&atilde;o em:</b> x<sub>'+queue[0].xBifurcacao+'</sub> </p><p id="solucao-encontrada'+contadorIte+'" class="lead"><b>Solu&ccedil;&atilde;o encontrada: </b></p><p id="situacao'+contadorIte+'" class="lead"><b>Situa&ccedil;&atilde;o: </p></div></div></div>');

		$p_solucao = $('#solucao-encontrada'+contadorIte);
		$p_situacao = $('#situacao'+contadorIte);
		$p_bifurca = $('#bifurca'+contadorIte);

		if (contadorIte % 2 === 0){
			$p_bifurca.append('&ge; '+queue[0].xValor);
		} else {
			$p_bifurca.append('&le; '+queue[0].xValor);			
		}

		if (Array.isArray(queue[0].solucao)) {
			$p_solucao.append('x<sup>&lowast;</sup> = (');
			for (i = 0; i < queue[0].solucao.length-1; i++){
				$p_solucao.append(round(queue[0].solucao[i])+'&nbsp;&nbsp;');
			}

			$p_solucao.append(round(queue[0].solucao[i])+')<sup>T</sup><br/>');

			$p_solucao.append('z<sup>&lowast;</sup> = '+round(queue[0].zSolucao));
			
			if (queue[0].esq !== null){
				queue.push(queue[0].esq, queue[0].dir);
				noPai.push(contadorIte, contadorIte);
				$p_situacao.append('Continuar bifurca&ccedil;&atilde;o em x<sub>'+queue[0].esq.xBifurcacao+'</sub>.');
			} else {
				if (trocaSinal && queue[0].zSolucao < zInteiro)
					$p_situacao.append('Solu&ccedil;&atilde;o Inteira encontrada com valor de z menor em compara&ccedil;&atilde;o com solu&ccedil;&atilde;o inteira &oacute;tima encontrada anteriormente, portanto parar bifurca&ccedil;&atilde;o do ramo.');
				else if (!trocaSinal && queue[0].zSolucao > zInteiro) {
					$p_situacao.append('Solu&ccedil;&atilde;o Inteira encontrada com valor de z maior em compara&ccedil;&atilde;o com solu&ccedil;&atilde;o inteira &oacute;tima encontrada anteriormente, portanto parar bifurca&ccedil;&atilde;o do ramo.');
				} else {
					$p_situacao.append('Solu&ccedil;&atilde;o Inteira &oacute;tima encontrada, portanto parar bifurca&ccedil;&atilde;o.');
					$('#card'+contadorIte).removeClass('border-dark');
					$('#card'+contadorIte).addClass('border-solucao');
					$('#titulo'+contadorIte).removeClass('bg-dark');
					$('#titulo'+contadorIte).addClass('bg-solucao');
				}
			}
		} else {
			$p_solucao.append(queue[0].solucao+'.');
			$p_situacao.append('Parar bifurca&ccedil;&atilde;o do ramo.');
		}

		queue.shift();
		noPai.shift();
		contadorIte++;		
	}
}

function analisaSolucao(menorBA){
	var i, j; // iteradores

	if (menorBA === Number.MAX_VALUE) {

		if (typeof artificial !== 'undefined'){
			for (i = 0; i < artificial.length; i++) {
				if (base.includes(artificial[i]) && vetorB[base.indexOf(artificial[i])] !== 0){
					return 1; // solucao vazia
				}
			}
		}

		return 2; // solucao ilimitada
	}
	else {
		if (typeof artificial !== 'undefined'){
			for (i = 0; i < artificial.length; i++) {
				if (base.includes(artificial[i]) && vetorB[base.indexOf(artificial[i])] !== 0){
					return 1; // solucao vazia
				}
			}
		}

		for (j = 0; j < custoReduzido.length; j++) {
			if (!base.includes(j+1) && round(custoReduzido[j]) === 0) {
				return 3; // mais de uma solucao				
			}
		}

		return 0;
	}
}

function imprimeSolucaoFinal(){
	var i, j; // iteradores

	$div_result = $('#resultado-final-inteiro');
	$div_result.empty();

	if (conjuntoSolucaoInteira.length === 0){
		$div_result.append('Solu&ccedil;&atilde;o '+tree.root.solucao);
	} else {
		for (i = 0; i < conjuntoSolucaoInteira.length; i++){
			$div_result.append('<b>Solu&ccedil;&atilde;o &oacute;tima '+(i+1)+'</b><br>x<sup>&lowast;</sup> = (');
			for (j = 0; j < conjuntoSolucaoInteira[0].length-1; j++){
				$div_result.append(round(conjuntoSolucaoInteira[i][j])+'&nbsp;&nbsp;');
			}
			$div_result.append(round(conjuntoSolucaoInteira[i][j])+')<sup>T</sup><br/>');

			var temFolga = 0;

			for (j = 0; j < folgas.length; j++){
				if (basesSolucao[i].includes(folgas[j][0])){ // verifica se folga[i] esta na base
					if (!temFolga) {
						$div_result.append('<b>Folga das restri&ccedil;&otilde;es</b>');
						temFolga = 1;
					}

					$div_result.append('<br>r<sub>'+folgas[j][1]+'</sub>: x<sub>'+folgas[j][0]+'</sub> = '+round(vetorBSolucao[i][basesSolucao[i].indexOf(folgas[j][0])]));				
				}
			}

			$div_result.append('<br><br>');
		}

		$div_result.append('z<sup>&lowast;</sup> = '+round(zInteiro));
	}
}

function verificaVariaveis(){
	var i, j; // iteradores
	var inteirasBase; // armazena as variaveis inteiras que estão na base
	var linhaBasicaInteira;
	inteirasBase = base.filter(r => inteiras.includes(r));
	
	for (i = 0; i < inteiras.length; i++){
		if (base.includes(inteiras[i])){
			linhaBasicaInteira = base.indexOf(inteiras[i]);
			valor = vetorB[linhaBasicaInteira];
			if (Math.abs(valor - Math.round(valor)) > 1e-5){
				basicaInteira = inteiras[i];
				return true;
			}
		}
	}
	return false;
}

function verificaVariavel(variavel){
	var i, j; // iteradores
	var inteirasBase; // armazena as variaveis inteiras que estão na base
	var linhaBasicaInteira;
	inteirasBase = base.filter(r => inteiras.includes(r));
	
	if (base.includes(variavel)){
		var linhaBasicaInteira = base.indexOf(variavel);
		var valor = vetorB[linhaBasicaInteira];
		if (Math.abs(valor - Math.round(valor)) > 1e-5){
			basicaInteira = base[linhaBasicaInteira];
			return true;
		} else return false;
	}
}

function BranchAndBound(){
	var i, j;
	var salvaBase = base.slice();
	var salvaVetorB = vetorB.slice();
	var salvaMatriz = [];
	conjuntoSolucaoOtima = [];
	conjuntoSolucaoInteira = [];

	for (i = 0; i < matriz.length; i++){
		salvaMatriz[i] = [];
		for (j = 0; j < matriz[0].length; j++){
			salvaMatriz[i][j] = matriz[i][j]
		}
	}

	var menorBA = Simplex();
	resultadoAnaliseSolucao = analisaSolucao(menorBA);
	if (resultadoAnaliseSolucao === 1) { // solucao vaiza
		tree = new ArvoreBinaria('Vazia');
	} else if (resultadoAnaliseSolucao === 2){
		tree = new ArvoreBinaria('Ilimitada');
	} else {
		z = 0;
		conjuntoSolucaoOtima = []; // solucao otima unica

		for (i = 0; i < numVars; i++){
			if (base.includes(i+1)){
				conjuntoSolucaoOtima.push(vetorB[base.indexOf(i+1)]);
			} else {
				conjuntoSolucaoOtima.push(0);
			}
		}
		
		for (i = 0; i < base.length; i++){
			z += custo[base[i]-1] * vetorB[i];
		}

		if (trocaSinal)
			z *= -1;
		tree = new ArvoreBinaria(conjuntoSolucaoOtima, z);
		tree.esq = null;
	}	
	if (resultadoAnaliseSolucao === 1 || resultadoAnaliseSolucao === 2)
		return;

	var result = verificaVariaveis();

	if (result && ((z >= zInteiro && trocaSinal) || (z <= zInteiro && !trocaSinal))) { // se variaveis inteiras com valor real e z maior que zInteiro encontrado, continua bifurcação
		var val = valor;
		var val2 = valor;
		var basica = basicaInteira-1;
		var basica2 = basicaInteira-1;
		BranchAndBoundRecursivo(numRestr+1, deepClone(salvaMatriz), deepClone(salvaBase), deepClone(salvaVetorB), basica, val, 0, tree, 0); // adiciona restricao com limite inferior
		custo.pop();
		BranchAndBoundRecursivo(numRestr+1, deepClone(salvaMatriz), deepClone(salvaBase), deepClone(salvaVetorB), basica2, val2, 1, tree, 1);
		custo.pop();
		custo.pop();
		artificial.pop();
	} else if (!result && ((z > zInteiro && trocaSinal) || (z < zInteiro && !trocaSinal))) {
		zInteiro = z;
		var solucaoEncontrada = [];
		basesSolucao = [];
		conjuntoSolucaoInteira = [];
		vetorBSolucao = [];

		for (i = 0; i < numVars; i++){
			if (base.includes(i+1)){
				solucaoEncontrada.push(vetorB[base.indexOf(i+1)]);
			} else {
				solucaoEncontrada.push(0);
			}
		}

		conjuntoSolucaoInteira.push(solucaoEncontrada);
		basesSolucao.push(base.slice());
		vetorBSolucao.push(vetorB.slice());
	} else if (!result && (z == zInteiro)){
		var solucaoEncontrada = [];

		for (i = 0; i < numVars; i++){
			if (base.includes(i+1)){
				solucaoEncontrada.push(vetorB[base.indexOf(i+1)]);
			} else {
				solucaoEncontrada.push(0);
			}
		}

		conjuntoSolucaoInteira.push(solucaoEncontrada);
		basesSolucao.push(base.slice());
		vetorBSolucao.push(vetorB.slice());
	}
}

function BranchAndBoundRecursivo(numRestr, salvaMatriz, salvaBase, salvaVetorB, variavel, valorVariavel, operacao, noPai, posicao){
	var i, j; // iteradores

	var n = salvaMatriz.length;
	var m = salvaMatriz[0].length;

	if (operacao === 0){
		salvaMatriz[n] = [];
		custo.push(0);
		for (i = 0; i < m; i++){
			salvaMatriz[n][i] = 0;
		}
		salvaMatriz[n][variavel] = 1;

		salvaMatriz[n].push(1);
		salvaMatriz = adicionaZerosBifurcacao(salvaMatriz, numRestr, n,m);
		m++;
		salvaBase.push(m);
		salvaVetorB.push(Math.floor(valorVariavel));
	} else {
		salvaMatriz[n] = [];
		custo.push(0);
		for (i = 0; i < m; i++){
			salvaMatriz[n][i] = 0;
		}
		salvaMatriz[n][variavel] = 1;

		salvaMatriz[n].push(-1);
		salvaMatriz = adicionaZerosBifurcacao(salvaMatriz, numRestr, n, m);
		m++;
		custo.push(custoVarArtificial);
		salvaMatriz[n].push(1);
		salvaMatriz = adicionaZerosBifurcacao(salvaMatriz, numRestr, n, m);
		m++;
		salvaBase.push(m);
		artificial.push(m);
		salvaVetorB.push(1 + Math.floor(valorVariavel));
	}

	matriz = [];

	for (i = 0; i < salvaMatriz.length; i++){
		matriz[i] = [];
		for (j = 0; j < salvaMatriz[0].length; j++){
			matriz[i][j] = salvaMatriz[i][j]
		}
	}

	base = salvaBase.slice();
	vetorB = salvaVetorB.slice();

	var menorBA = Simplex();
	criaArvoreBranchAndBound(menorBA, noPai, posicao);
	var no;

	if (posicao === 0){
		no = noPai.esq;
	} else no = noPai.dir;

	no.xBifurcacao = variavel+1;
	no.xValor = salvaVetorB[salvaVetorB.length-1];

	if (resultadoAnaliseSolucao === 1 || resultadoAnaliseSolucao === 2)
		return;
	
	var result = verificaVariaveis();

	if (resultadoAnaliseSolucao === 3 && verificaVariavel(variavel+1)){
		procuraConjuntoSolucoes(no, variavel+1);
		result = verificaVariaveis();
	}

	if (result && ((z >= zInteiro && trocaSinal) || (z <= zInteiro && !trocaSinal))) { // se variaveis inteiras com valor real e z maior que zInteiro encontrado, continua bifurcação
		var val = valor;
		var val2 = valor;
		var basica = basicaInteira-1;
		var basica2 = basicaInteira-1;
		BranchAndBoundRecursivo(numRestr+1, deepClone(salvaMatriz), deepClone(salvaBase), deepClone(salvaVetorB), basica, val, 0, no, 0); // adiciona restricao com limite inferior
		custo.pop();
		BranchAndBoundRecursivo(numRestr+1, deepClone(salvaMatriz), deepClone(salvaBase), deepClone(salvaVetorB), basica2, val2, 1, no, 1);
		custo.pop();
		custo.pop();
		artificial.pop();
	} else if (!result && ((z > zInteiro && trocaSinal) || (z < zInteiro && !trocaSinal))) {
		zInteiro = z;
		var solucaoEncontrada = [];
		basesSolucao = [];
		conjuntoSolucaoInteira = [];
		vetorBSolucao = [];

		for (i = 0; i < numVars; i++){
			if (base.includes(i+1)){
				solucaoEncontrada.push(vetorB[base.indexOf(i+1)]);
			} else {
				solucaoEncontrada.push(0);
			}
		}

		conjuntoSolucaoInteira.push(solucaoEncontrada);
		basesSolucao.push(base.slice());
		vetorBSolucao.push(vetorB.slice());
	} else if (!result && (z == zInteiro)){
		var solucaoEncontrada = [];

		for (i = 0; i < numVars; i++){
			if (base.includes(i+1)){
				solucaoEncontrada.push(vetorB[base.indexOf(i+1)]);
			} else {
				solucaoEncontrada.push(0);
			}
		}

		conjuntoSolucaoInteira.push(solucaoEncontrada);
		basesSolucao.push(base.slice());
		vetorBSolucao.push(vetorB.slice());
	}
}

function round(value) {
	return Math.round(value * 1000) / 1000;
}

Array.prototype.containsArray = function(val) {
    var hash = {};
    for(var i=0; i<this.length; i++) {
        hash[this[i]] = i;
    }
    return hash.hasOwnProperty(val);
}

function deepClone(arr) {
  var len = arr.length;
  var newArr = new Array(len);
  for (var i=0; i<len; i++) {
    if (Array.isArray(arr[i])) {
      newArr[i] = deepClone(arr[i]);
    }
    else {
      newArr[i] = arr[i];
    }
  }
  return newArr;
}

function procuraConjuntoSolucoes(no, variavel){
	var i, j; // iteradores
	var soma; // variavel auxiliar para calculo da soma da multiplicacao entre custo da base e valores na matriz 
	var menorValor // variavel para armazenar o menor valor no custo reduzido
	var menorBA // variavel para armazenar o menor valor positivo de b/[aij]
	var colunaMenorValor; // identificacao da coluna do menor valor no custo reduzido
	var linhaMenorBA; // coluna do menor BA
	var vetorBA; // vetor para calculo de b/a[ij]
	conjuntoSolucaoOtima = []; // inicialiazaçaõ de variáveis
	var baseEncontrada = []; // vetor para armazenar a base encontrada na iteração i
	var basesEncontradas = []; // vetor para armazenar as bases encontradas
	var salvaVetorB = []; // vetor para salvar savlores do vetor B de cada base encontrada
	var solucaoEncontrada = []; // armazena a solucao encontrada na iteração i
	var baseCalculada; // boolean para identicar que base ja foi calculada 
 	var empate;
 	var contadorSolucao = 1;

	for (i = 0; i < numVars; i++){
		if (base.includes(i+1)){
			solucaoEncontrada.push(vetorB[base.indexOf(i+1)]);
		} else {
			solucaoEncontrada.push(0);
		}
	}
	conjuntoSolucaoOtima.push(solucaoEncontrada);
	baseEncontrada = base.slice();
	basesEncontradas.push(baseEncontrada);
	salvaVetorB.push(vetorB.slice());

	do {
		menorValor = Number.MAX_VALUE;
		menorBA = Number.MAX_VALUE;
		custoBase = []; custoReduzido = [];// inicializao de variaveis
		for (i = 0; i < base.length; i++){
			custoBase.push(custo[base[i]-1]);
		}

		for (i = 0; i < custo.length; i++){
			soma = 0;
			for (j = 0; j < base.length; j++){
					soma += custoBase[j] * matriz[j][i];
			}

			custoReduzido.push(custo[i] - soma);
		}

		for (i = 0; i < custoReduzido.length; i++){
			if (custoReduzido[i] < menorValor && !base.includes(i+1)){
				menorValor = round(custoReduzido[i]);
				colunaMenorValor = i;
			}
		}

		do {
			baseCalculada = 1;
			baseEncontrada = [];
			
			if (menorValor <= 0){
				vetorBA = [];
				for (i = 0; i < matriz.length; i++){
					ba = vetorB[i]/(matriz[i][colunaMenorValor]);
					if (!Number.isNaN(ba))
						vetorBA.push(ba);
					else vetorBA.push(+Infinity);
				}
			}

			if (typeof vetorBA !== 'undefined') {
				for (i = 0; i < vetorBA.length; i++){
					if (vetorBA[i] < menorBA && vetorBA[i] >= 0 && !Object.is(vetorBA[i], -0) && isFinite(vetorBA[i])){
						menorBA = vetorBA[i];
						linhaMenorBA = i;
						empate = 0;
					} else if (vetorB[i] === menorBA){
						empate = 1;
					}
				}
			}

			if (empate){
				linhaMenorBA = selecaoLexicografica(vetorBA, menorBA, linhaMenorBA);
			}

			for (i = 0; i < base.length; i++){
				if (i === linhaMenorBA)
					baseEncontrada.push(colunaMenorValor+1);
				else baseEncontrada.push(base[i]);
			}

			for (i = 0; i < basesEncontradas.length; i++){
				if (basesEncontradas.containsArray(baseEncontrada)){
					baseCalculada = 1;
					break;
				} else baseCalculada = 0;
			}

			if (baseCalculada){
				var k = colunaMenorValor;
				var n = custoReduzido.length;
				for (i = (k+1)%n; i != k; i = (i+1)%n){
					if (custoReduzido[i] === menorValor && !base.includes(i+1)) {
						colunaMenorValor = i;
						break;
					}
				}
			}
		} while(baseCalculada && basesEncontradas.length !== numVars);

		if (menorValor <= 0 && typeof linhaMenorBA !== 'undefined' && menorBA !== Number.MAX_VALUE) {
			pivotamento(linhaMenorBA, colunaMenorValor);
			base[linhaMenorBA] = colunaMenorValor+1;
			custoBase[linhaMenorBA] = custo[colunaMenorValor];
		}
		
		if (basesEncontradas.length < numVars){
			solucaoEncontrada = [];
			for (i = 0; i < numVars; i++){
				if (base.includes(i+1)){
					solucaoEncontrada.push(vetorB[base.indexOf(i+1)]);
				} else {
					solucaoEncontrada.push(0);
				}
			}
			conjuntoSolucaoOtima.push(solucaoEncontrada);
			basesEncontradas.push(baseEncontrada);
			salvaVetorB.push(vetorB.slice());
			contadorSolucao++;
		}
	} while (contadorSolucao < numVars);

	for (i = 0; i < conjuntoSolucaoOtima.length; i++){
		vetorB = [];
		vetorB = deepClone(salvaVetorB[i]);
		base = [];
		base = deepClone(basesEncontradas[i]);

		if (!verificaVariavel(variavel)){
			no.solucao = conjuntoSolucaoOtima[i];
			return;
		}
	}
}
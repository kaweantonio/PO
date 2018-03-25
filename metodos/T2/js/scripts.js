var numVars = 2;
var numRestr = 1;
var trocaSinal; // bool para troca de sinal na resolução de problemas de maximização 
var duasFases; // bool para indicar que o problema sera resolvido com duas fases
var contadorIte = 0;
var idVariaveis; // vetor com a identificacao das variaveis a serem usadas no metodo
var colunasRemovidas = []; // armazena colunas para o numero de colunas removida da tabela simplex depois da fase 2
var matriz; // armazena matriz A da tabela Simplex
var copiaMatriz;
var custo; // vetor com custo das variaveis - funcao z
var custoArtificial; // vetor com custo das variaveis - funcao zArtificial 
var copiaCusto;
var base; // vetor com as variaveis que estao na base
var artificial; // vetor para armazenar quais sao as variaveis artificiais
var folgas; // vetor para armazenar quais sao as variaveis de folga 
var vetorB; // vetor com o limite das restricoes
var copiaVetorB;
var custoBase; // vetor com custo das variaveis basicas
var custoReduzido; // vetor para armazenar calculo do custo reduzido
var z; // valor da função objetivo
var zArtificial; // valor da função objetivo artificial
var conjuntoSolucaoOtima; // vetor para Conj. de Solucao Otima
var contadorSolucao = 1; // variavel para indicar numero de solucoes
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
	var num;

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
	$div_restr = $('#restricoes');
	
	$div_func.empty();
	$div_restr.empty();

	$div_func.append('z = ');
	for (var i = 0; i < numVars; i++){
		$div_func.append('<input id=" x'+(i+1)+'" type="text" placeholder="0"> x<sub>'+(i+1)+'</sub>')
		if (i < numVars-1)
				$div_func.append(' + ');
	}

	for (var i = 0; i < numRestr; i++){
		$div_restr.append('<div id="restr'+(i+1)+'">');
		$restr = $('#restr'+(i+1));
		for (var j = 0; j < numVars; j++){
			$restr.append('<input id="x'+(i+1)+(j+1)+'" type="text" placeholder="0"> x<sub>'+(j+1)+'</sub>');
			if (j < numVars-1)
				$restr.append(' + ');
			else
				$restr.append('  <select id="cp'+(i+1)+'" type="text" class="opcao-restricao"><option value="0" selected>&le;</option><option value="1">&ge;</option><option value="2">=</option></select>  ');		
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
	$div_ite = $('#iteracoes');
	limpou = 0;

	if (validacao()) {
		$div_ite.empty();
		$div_ite.append('<h4 class="card-title" style="text-align: center;">Itera&ccedil;&otilde;es</h4>');
		formapadrao();
		if (artificial.length > 0){
			duasFases = 1;
			SimplexFase1();
		}
		else { 
			duasFases = 0;
			SimplexFase2();
		}
		$('#solucao').show('slow');
		if ($('#mostrarIte').is(':checked'))
			$div_ite.show('slow');
		else $div_ite.hide('slow');
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
   } else $('#iteracoes').hide('slow');
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

function formapadrao(){
	var i, j; // iteradores
	var contador = numVars; // contador para adcionar variáveis de folga e artificial
	var limitanteRestr; // limitante da restricao (<=; >=; =)
	var valorB; // variavel para armazenar valor de b[i] a cada iteração
	matriz = []; custo = []; custoArtificial = []; base = []; artificial = []; vetorB = []; folgas = []; idVariaveis = []; // inicializacao de variaveis
	if($("#objetivo").val() === "1") {
		trocaSinal = 1;
	} else trocaSinal = 0;

	for (i = 0; i < numRestr; i++) {
		matriz.push([]);
	}

	if(trocaSinal) {
		for (i = 0; i < numVars; i++) {
			if (!Object.is(copiaCusto[i],0))
				custo.push(-1*copiaCusto[i]);
			else custo.push(copiaCusto[i]);
			custoArtificial.push(0);
			idVariaveis.push(i+1);
		}
	}
	else {
		for (i = 0; i < numVars; i++) {
			custo.push(copiaCusto[i]);
			custoArtificial.push(0);
			idVariaveis.push(i+1);
		}
	}

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
				custoArtificial.push(0);
				matriz[i][contador] = 1;
				adicionaZeros(i, contador);
				contador++;
				idVariaveis.push(contador);
				base.push(contador);
				folgas.push([contador, i+1]);
				break;
			case "1": // >= -> adicionar variavel de folga negativa e artifical
				custo.push(0);
				custoArtificial.push(0);
				matriz[i][contador] = -1;
				adicionaZeros(i, contador);
				contador++;
				idVariaveis.push(contador);
				folgas.push([contador, i+1]);
				custo.push(0);
				custoArtificial.push(1);
				matriz[i][contador] = 1;
				adicionaZeros(i, contador);
				contador++;
				idVariaveis.push(contador);
				base.push(contador);
				artificial.push(contador);
				break;
			default: // = -> adcionar variavel artificial
				custo.push(0);
				custoArtificial.push(1);
				matriz[i][contador] = 1;
				adicionaZeros(i, contador);
				contador++;
				idVariaveis.push(contador);
				base.push(contador);
				artificial.push(contador);				
		}
	}

	copiaCusto = custo.slice();
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

	$div_fprestr.append(' x &ge; 0');
}

function imprimeSimplexFase1(vetorBA){
	var i, j; // iteradores
	var contadorLinha = 1;
	zArtificial = 0; // calculo de custo de z

	contadorIte++;
	$("#iteracoes").append('<table class="table table-striped table-hover table-bordered" id="iteracao'+contadorIte+'"><thead class="thead-dark">'+'<tr><th style="text-align:center;	" colspan="'+(custo.length+4)+'">Itera&ccedil&atilde;o '+contadorIte+'</tr></thead><tbody id="corpo'+contadorIte+'"><tr id="cabecalho'+contadorIte+'"><th></th><th>c<sub>&alpha;</sub></th></tr><tr id="it'+contadorIte+'linha'+contadorLinha+'"><th>c<sub>B<sub>&alpha;</sub></sub></th><th>B</th></tr></tbody></table><p id="msg'+contadorIte+'" class="lead" style="text-align:center;"></p><br/>');

	$div_cab = $('#cabecalho'+contadorIte);
	$div_it = $('#it'+contadorIte+'linha'+contadorLinha);
	$div_corpo = $('#corpo'+contadorIte);

	for (i = 0; i < custoArtificial.length; i++) {
		$div_cab.append('<th>'+custoArtificial[i]+'</th>');
		$div_it.append('<th>x<sub>'+idVariaveis[i]+'</sub></th>');
	}

	$div_cab.append('<th></th>');

	if (typeof vetorBA != 'undefined'){
		$div_cab.append('<th></th>');		
	}	

	$div_it.append('<th>b</th>');

	if (typeof vetorBA !== "undefined"){
		$div_it.append('<th>b/a</th>');
	}

	for (i = 0; i < base.length; i++) {
		contadorLinha++;
		$div_corpo.append('<tr id="it'+contadorIte+'linha'+contadorLinha+'"><td>'+custoArtificial[base[i]-1]+'</td><th>x<sub>'+base[i]+'</sub></th></tr>');
		$div_it = $('#it'+contadorIte+'linha'+contadorLinha);
		for (j = 0; j < matriz[0].length; j++)
			$div_it.append('<td>'+round(matriz[i][j])+'</td');

		$div_it.append('<td>'+round(vetorB[i])+'</td>');

		if(typeof vetorBA !== 'undefined'){
			if (isFinite(vetorBA[i]))
				$div_it.append('<td>'+round(vetorBA[i])+'</td>');			
			else $div_it.append('<td>&infin;</td>');
		}
	}

	contadorLinha++;
	$div_corpo.append('<tr id="it'+contadorIte+'linha'+contadorLinha+'"><td></td><th>c<sub>r<sub>&alpha;</sub></sub></tr>');
	$div_it = $('#it'+contadorIte+'linha'+contadorLinha);
	for (i = 0; i < custoReduzido.length; i++) {
		$div_it.append('<td>'+round(custoReduzido[i])+'</td>');			
	}

	for (i = 0; i < base.length; i++){
		zArtificial += custoArtificial[base[i]-1] * vetorB[i];
	}

	$div_it.append('<td>'+round(zArtificial)+'</td>');					

	if (typeof vetorBA !== 'undefined')
		$div_it.append('<td></td>');					
}

function imprimeSimplexFase2(vetorBA){
	var i, j; // iteradores
	var contadorLinha = 1;
	z = 0; // calculo de custo de z

	contadorIte++;
	$("#iteracoes").append('<table class="table table-striped table-hover table-bordered" id="iteracao'+contadorIte+'"><thead class="thead-dark">'+'<tr><th style="text-align:center;	" colspan="'+(custo.length+4)+'">Itera&ccedil&atilde;o '+contadorIte+'</tr></thead><tbody id="corpo'+contadorIte+'"><tr id="cabecalho'+contadorIte+'"><th></th><th>c</th></tr><tr id="it'+contadorIte+'linha'+contadorLinha+'"><th>c<sub>B</sub></th><th>B</th></tr></tbody></table><p id="msg'+contadorIte+'" class="lead" style="text-align:center;"></p><br/>');

	$div_cab = $('#cabecalho'+contadorIte);
	$div_it = $('#it'+contadorIte+'linha'+contadorLinha);
	$div_corpo = $('#corpo'+contadorIte);

	for (i = 0; i < custo.length; i++) {
		$div_cab.append('<th>'+custo[i]+'</th>');
		$div_it.append('<th>x<sub>'+idVariaveis[i]+'</sub></th>');
	}

	$div_cab.append('<th></th>');

	if (typeof vetorBA != 'undefined'){
		$div_cab.append('<th></th>');		
	}	

	$div_it.append('<th>b</th>');

	if (typeof vetorBA !== "undefined"){
		$div_it.append('<th>b/a</th>');
	}

	for (i = 0; i < base.length; i++) {
		contadorLinha++;
		$div_corpo.append('<tr id="it'+contadorIte+'linha'+contadorLinha+'"><td>'+copiaCusto[base[i]-1]+'</td><th>x<sub>'+base[i]+'</sub></th></tr>');
		$div_it = $('#it'+contadorIte+'linha'+contadorLinha);
		for (j = 0; j < matriz[0].length; j++)
			$div_it.append('<td>'+round(matriz[i][j])+'</td');

		$div_it.append('<td>'+round(vetorB[i])+'</td>');

		if(typeof vetorBA !== 'undefined'){
			if (isFinite(vetorBA[i]))
				$div_it.append('<td>'+round(vetorBA[i])+'</td>');			
			else $div_it.append('<td>&infin;</td>');
		}
	}

	contadorLinha++;
	$div_corpo.append('<tr id="it'+contadorIte+'linha'+contadorLinha+'"><td></td><th>c<sub>r</sub></tr>');
	$div_it = $('#it'+contadorIte+'linha'+contadorLinha);
	for (i = 0; i < custoReduzido.length; i++) {
		$div_it.append('<td>'+round(custoReduzido[i])+'</td>');			
	}

	for (i = 0; i < base.length; i++){
		z += copiaCusto[base[i]-1] * vetorB[i];
	}

	$div_it.append('<td>'+round(z)+'</td>');					

	if (typeof vetorBA !== 'undefined')
		$div_it.append('<td></td>');					
}

function SimplexFase1(){
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
	contadorIte = 0;

	do {
		menorValor = Number.MAX_VALUE;
		menorBA = Number.MAX_VALUE;
		empate = 0;
		custoBase = []; custoReduzido = []; // inicializao de variaveis
		for (i = 0; i < base.length; i++){
			custoBase.push(custoArtificial[base[i]-1]);
		}

		for (i = 0; i < custoArtificial.length; i++){
			soma = 0;
			for (j = 0; j < base.length; j++){
					soma += custoBase[j] * matriz[j][i];
			}
			custoReduzido.push(custoArtificial[i] - soma);
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

			imprimeSimplexFase1(vetorBA);
		} else {
			imprimeSimplexFase1();
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
				if(i == linhaMenorBA){
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
			$('#msg'+contadorIte).append('Entra x<sub>'+idVariaveis[colunaMenorValor]+'</sub> e sai x<sub>'+base[linhaMenorBA]+'</sub> da base.<br>Incremento de '+round(custoReduzido[colunaMenorValor]*vetorBA[linhaMenorBA])+' em z<sub>&alpha;</sub> na próxima itera&ccedil;&atilde;o <br>');
			basesAnteriores.push(base.slice());
			base[linhaMenorBA] = colunaMenorValor+1;
			custoBase[linhaMenorBA] = custoArtificial[colunaMenorValor];
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

	$('#msg'+contadorIte).append('Fim da Fase 1');
	analisaSolucaoFase1(menorBA);
}

function SimplexFase2(){
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

	if (duasFases === 0)
		contadorIte = 0;

	do {
		menorValor = Number.MAX_VALUE;
		menorBA = Number.MAX_VALUE;
		empate = 0;
		custoBase = []; custoReduzido = []; // inicializao de variaveis
		for (i = 0; i < base.length; i++){
			custoBase.push(custo[idVariaveis.indexOf(base[i])]);
		}

		for (i = 0; i < custo.length; i++){
			soma = 0;
			for (j = 0; j < base.length; j++){
					soma += custoBase[j] * matriz[j][i];
			}
			custoReduzido.push(custo[i] - soma);
		}

		for (i = 0; i < custoReduzido.length; i++){
			if (custoReduzido[i] < menorValor && !base.includes(idVariaveis[i])){
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

			imprimeSimplexFase2(vetorBA);
		} else {
			imprimeSimplexFase2();
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
					baseNova.push(idVariaveis.indexOf(colunaMenorValor));
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
			$('#msg'+contadorIte).append('Entra x<sub>'+idVariaveis[colunaMenorValor]+'</sub> e sai x<sub>'+base[linhaMenorBA]+'</sub> da base.<br>Incremento de '+round(custoReduzido[colunaMenorValor]*vetorBA[linhaMenorBA])+' em z na próxima itera&ccedil;&atilde;o <br>');
			basesAnteriores.push(base.slice());
			base[linhaMenorBA] = idVariaveis[colunaMenorValor];
			custoBase[linhaMenorBA] = custo[idVariaveis.indexOf(colunaMenorValor)];
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

	if (duasFases)
		$('#msg'+contadorIte).append('Fim da Fase 2');
	else $('#msg'+contadorIte).append('Fim do Simplex');
	analisaSolucaoFase2(menorBA);
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

function removecolunaLinhaArtificial() {
	var i, j;
	var coluna; // coluna onde a variavel artificial se encontra na matriz
	var colunaAux; // armazena coluna - 1
	var index; // posicao da variavel artificial

	while (artificial.length > 0){
		coluna = artificial.pop();
		colunaAux = coluna - 1;
		colunasRemovidas.push(coluna);

		for (i = 0; i < matriz.length; i++) {
			matriz[i].splice(colunaAux, 1);
		}

		custo.splice(colunaAux, 1);
		custoReduzido.splice(colunaAux, 1);
		idVariaveis.splice(colunaAux, 1);

		if (base.includes(coluna)){
			index = base.indexOf(coluna);
			matriz.splice(index, 1);
			base.splice(index, 1);
		}
	}
}

function analisaSolucaoFase1(menorBA){
	var i, j; // iteradores

	$div_result = $('#resultado-final');

	$div_result.empty();
	if (menorBA === Number.MAX_VALUE) {
		if (typeof artificial !== 'undefined'){
			for (i = 0; i < artificial.length; i++) {
				if (base.includes(artificial[i]) && vetorB[base.indexOf(artificial[i])] !== 0){
					$div_result.append('Solu&ccedil;&atilde;o vazia');
					return;
				}
			}
		}

		$div_result.append('Solu&ccedil;&atilde;o ilimitada');
	}
	else {
		if (typeof artificial !== 'undefined'){
			for (i = 0; i < artificial.length; i++) {
				if (base.includes(artificial[i]) && vetorB[base.indexOf(artificial[i])] !== 0){
					$div_result.append('Solu&ccedil;&atilde;o vazia');
					return;
				}
			}
		}

		removecolunaLinhaArtificial();
		SimplexFase2();
	}
}

function analisaSolucaoFase2(menorBA){
	var i, j; // iteradores

	$div_result = $('#resultado-final');

	$div_result.empty();

	if (menorBA === Number.MAX_VALUE) {
		if (typeof artificial !== 'undefined'){
			for (i = 0; i < artificial.length; i++) {
				if (base.includes(artificial[i]) && vetorB[base.indexOf(artificial[i])] !== 0){
					$div_result.append('Solu&ccedil;&atilde;o vazia');
					return;
				}
			}
		}
		
		$div_result.append('Solu&ccedil;&atilde;o ilimitada');
	}
	else {
		if (typeof artificial !== 'undefined'){
			for (i = 0; i < artificial.length; i++) {
				if (base.includes(artificial[i]) && vetorB[base.indexOf(artificial[i])] !== 0){
					$div_result.append('Solu&ccedil;&atilde;o vazia');
					return;
				}
			}
		}

		if (custoReduzido.filter(k => round(k) === 0).length > base.length){
			$('#msg'+contadorIte).append(' e in&iacute;cio da procura por mais solu&ccedil;&otilde;es');
			procuraConjuntoSolucoes();
			return;
		}

		conjuntoSolucaoOtima = []; // solucao otima unica

		for (i = 0; i < numVars; i++){
			if (base.includes(i+1)){
				conjuntoSolucaoOtima.push(vetorB[base.indexOf(i+1)]);
			} else {
				conjuntoSolucaoOtima.push(0);
			}
		}

		$div_result.append('<b>Solu&ccedil;&atilde;o &oacute;tima</b><br>x<sup>&lowast;</sup> = (');
		for (i = 0; i < numVars-1; i++){
			$div_result.append(round(conjuntoSolucaoOtima[i])+'&nbsp;&nbsp;');
		}

		$div_result.append(round(conjuntoSolucaoOtima[numVars-1])+')<sup>T</sup>');

		var temFolga = 0;

		for (i = 0; i < folgas.length; i++){
			if (base.includes(folgas[i][0])){ // verifica se folga[i] esta na base
				if (!temFolga) {
					$div_result.append('<br><b>Folga das restri&ccedil;&otilde;es</b>');
					temFolga = 1;
				}

				$div_result.append('<br>r<sub>'+folgas[i][1]+'</sub>: x<sub>'+folgas[i][0]+'</sub> = '+round(vetorB[base.indexOf(folgas[i][0])]));				
			}
		}

		if (trocaSinal)
			z *= -1;
		$div_result.append('<br><br>z<sup>&lowast;</sup> = '+round(z));
	}
}

function procuraConjuntoSolucoes(){
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
 	contadorSolucao = 1;

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
			custoBase.push(custo[idVariaveis.indexOf(base[i])]);
		}

		for (i = 0; i < custo.length; i++){
			soma = 0;
			for (j = 0; j < base.length; j++){
					soma += custoBase[j] * matriz[j][i];
			}

			custoReduzido.push(custo[i] - soma);
		}

		for (i = 0; i < custoReduzido.length; i++){
			if (custoReduzido[i] < menorValor && !base.includes(idVariaveis[i])){
				menorValor = custoReduzido[i];
				colunaMenorValor = i;
			}
		}

		do {
			baseCalculada = 1;
			baseEncontrada = [];
			
			if (menorValor <= 0){
				vetorBA = [];
				var ba;
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
					} else if (vetorB[i] === menorBA && !Object.is(vetorBA[i], -0) && isFinite(vetorBA[i])){
						empate = 1;
					}
				}
			}

			if (empate){
				linhaMenorBA = selecaoLexicografica(vetorBA, menorBA, linhaMenorBA);
			}

			if (menorBA === Number.MAX_VALUE)
				break;

			for (i = 0; i < base.length; i++){
				if (i === linhaMenorBA)
					baseEncontrada.push(idVariaveis[colunaMenorValor]);
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
		imprimeSimplexFase2(vetorBA);

		if (menorValor <= 0 && typeof linhaMenorBA !== 'undefined' && menorBA !== Number.MAX_VALUE) {
			pivotamento(linhaMenorBA, colunaMenorValor);
			$('#msg'+contadorIte).append('Entra x<sub>'+idVariaveis[colunaMenorValor]+'</sub> e sai x<sub>'+base[linhaMenorBA]+'</sub> da base.<br>Incremento de '+round(custoReduzido[colunaMenorValor]*vetorBA[linhaMenorBA])+' em z na próxima itera&ccedil;&atilde;o');
			base[linhaMenorBA] = idVariaveis[colunaMenorValor];
			custoBase[linhaMenorBA] = custo[idVariaveis.indexOf(colunaMenorValor)];
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

	imprimeSimplexFase2();
	$('#msg'+(contadorIte)).append('Fim da procura por mais solu&ccedil;&otilde;es');	

	$div_result = $('#resultado-final');

	for (i = 0; i < conjuntoSolucaoOtima.length; i++){
		$div_result.append('<b>Solu&ccedil;&atilde;o &oacute;tima '+(i+1)+'</b><br>x<sup>&lowast;</sup> = (');
		for (j = 0; j < conjuntoSolucaoOtima[0].length-1; j++){
			$div_result.append(round(conjuntoSolucaoOtima[i][j])+'&nbsp;&nbsp;');
		}
		$div_result.append(round(conjuntoSolucaoOtima[i][j])+')<sup>T</sup><br/>');

		var temFolga = 0;

		for (j = 0; j < folgas.length; j++){
			if (basesEncontradas[i].includes(folgas[j][0])){ // verifica se folga[i] esta na base
				if (!temFolga) {
					$div_result.append('<b>Folga das restri&ccedil;&otilde;es</b>');
					temFolga = 1;
				}

				$div_result.append('<br>r<sub>'+folgas[j][1]+'</sub>: x<sub>'+folgas[j][0]+'</sub> = '+round(salvaVetorB[i][basesEncontradas[i].indexOf(folgas[j][0])]));				
			}
		}

		$div_result.append('<br><br>');
	}
	if (trocaSinal)
		z *= -1;
	$div_result.append('z<sup>&lowast;</sup> = '+round(z));
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

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
var solucaoReal; // boolean para indicar se o problema tem solucao real
var solucaoInteira; // vetor para Solucao Otima Inteira
var encontrouSolucaInteira // boolean para indicar se o problema tem solucao inteira
var salvaNumRestr; // salva numero de restricoes antes de efetuar os cortes
var maxIte = 100; // maximo de iteracoes do metodo de cortes
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
	$div_ite = $('#iteracoes');
	$div_iteCortes = $('#iteracoes-cortes');
	encontrouSolucaInteira = false;
	limpou = 0;

	if (validacao() && inteiras.length !== 0) {
		$div_ite.empty();
		$div_iteCortes.empty();
		$div_ite.append('<h4 class="card-title" style="text-align: center;">Itera&ccedil;&otilde;es</h4>');
		$div_iteCortes.append('<h4 class="card-title" style="text-align: center;">Itera&ccedil;&otilde;es (Cortes)</h4>');
		$('#resultado-otimo').attr('class', 'col-md-12');
		formapadrao();
		Simplex();

		if (solucaoReal === true)
			Cortes();

		$('#solucao').show('slow');
		if ($('#mostrarIte').is(':checked')) {
			$div_ite.show('slow');
		}
		else {
			$div_ite.hide('slow');
			$div_iteCortes.hide('slow');
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
   	if (encontrouSolucaInteira)
   		$('#iteracoes-cortes').show('slow');
   } else {
   	$('#iteracoes').hide('slow');
   	$('#iteracoes-cortes').hide('slow');
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

function formapadrao(){
	var i, j; // iteradores
	var contador = numVars; // contador para adcionar variáveis de folga e artificial
	var limitanteRestr; // limitante da restricao (<=; >=; =)
	var valorB; // variavel para armazenar valor de b[i] a cada iteração
	matriz = []; custo = []; base = []; artificial = []; vetorB = []; folgas = []; // inicializacao de variaveis
	if($("#objetivo").val() === "1") {
		trocaSinal = 1;
	} else trocaSinal = 0;

	for (i = 0; i < numRestr; i++) {
		matriz.push([]);
	}

	for (i = 0; i < numVars; i++) {
		if(trocaSinal && !Object.is(copiaCusto[i], 0))
			custo.push(-1*copiaCusto[i]);
		else custo.push(copiaCusto[i]);
	}

	custoVarArtificial = Math.abs(Array.max(custo)) * 10;

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

function imprimeSimplex(vetorBA){
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
		$div_it.append('<th>x<sub>'+(i+1)+'</sub></th>');
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
		$div_corpo.append('<tr id="it'+contadorIte+'linha'+contadorLinha+'"><td>'+custo[base[i]-1]+'</td><th>x<sub>'+base[i]+'</sub></th></tr>');
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
		z += custo[base[i]-1] * vetorB[i];
	}

	$div_it.append('<td>'+round(z)+'</td>');					

	if (typeof vetorBA !== 'undefined')
		$div_it.append('<td></td>');					
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
	contadorIte = 0;

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

			imprimeSimplex(vetorBA);
		} else {
			imprimeSimplex();
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
			$('#msg'+contadorIte).append('Entra x<sub>'+(colunaMenorValor+1)+'</sub> e sai x<sub>'+base[linhaMenorBA]+'</sub> da base.<br>Incremento de '+round(custoReduzido[colunaMenorValor]*vetorBA[linhaMenorBA])+' em z na próxima itera&ccedil;&atilde;o <br>');
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

	$('#msg'+contadorIte).append('Fim do Simplex.');
	analisaSolucao(menorBA);
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

function analisaSolucao(menorBA){
	var i, j; // iteradores

	$div_result = $('#resultado-final');
	$div_result.empty();

	if (menorBA === Number.MAX_VALUE) {
		$('#resultado-otimo').attr('class', 'col-md-12');
		$('#resultado-otimo-inteiro').hide();
		$('#iteracoes-cortes').hide('slow');
		solucaoReal = false;

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
					$('#resultado-otimo').attr('class', 'col-md-12');
					$('#resultado-otimo-inteiro').hide();
					$('#iteracoes-cortes').hide('slow');
					$div_result.append('Solu&ccedil;&atilde;o vazia');
					solucaoReal = false;
					return;
				}
			}
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
		solucaoReal = true;
		return;
	}
}

function Cortes(){
	var i, j; // iteradores
	var corte = 0; // variavel boolean que indica se ainda é necessário realizar cortes ou não
	var valor; // valor da variavel inteira no vetorB 
	var basicaInteira; // armazena qual a variavel basica inteira a se realizar o corte
	var linhaBasicaInteira;
	contadorIteCortes = 0;

	salvaNumRestr = numRestr;

	// for (i = 0; i < inteirasBase.length; i++){
	// 	linhaBasicaInteira = base.indexOf(inteirasBase[i]);		
	// 	valor = vetorB[linhaBasicaInteira];
	// 	if (Math.abs(valor - Math.floor(valor)) > 1e-5){
	// 		corte = 1;
	// 		basicaInteira = inteirasBase[i];
	// 		break;
	// 	}
	// }

	for (i = 0; i < inteiras.length; i++){
		if (base.includes(inteiras[i])){
			linhaBasicaInteira = base.indexOf(inteiras[i]);
			valor = vetorB[linhaBasicaInteira];
			if (Math.abs(valor - Math.round(valor)) > 1e-5){
				corte = 1;
				basicaInteira = inteiras[i];
				break;
			}
		}
	}

	if (corte === 0){
		$('#msg'+contadorIte).append('<br>Todas as vari&aacute;veis selecionadas com valor inteiro, portanto nenhum corte &eacute; necess&aacute;rio.');
		$('#resultado-otimo-inteiro').hide('slow');
		$('#iteracoes-cortes').hide('slow');
		return;
	} else {
		$('#msg'+contadorIte).append(' In&iacute;cio dos Cortes.');
	}

	while (corte && contadorIteCortes <= maxIte) {
		var n = matriz.length; // numero de linhas
		var m = matriz[0].length; // numero de colunas
		var num;
		matriz[n] = [];

		for (i = 0; i < m; i++){
			num = matriz[linhaBasicaInteira][i];

			if (num >= 0){
				num = num - Math.trunc(num);
			} else {
				num = 1 - (Math.abs(num) - Math.trunc(Math.abs(num)));
			}

			matriz[n].push(num);
		}

		num = vetorB[linhaBasicaInteira];
		num = num - Math.trunc(num);
		vetorB.push(num);

		imprimeSimplexCortes();
		$div_msgCorte = $('#msgCorte'+contadorIteCortes);
		$div_msgCorte.append('Vari&aacute;vel x<sub>'+basicaInteira+'</sub> n&atilde;o inteira. Inserindo restri&ccedil;&atilde;o: ');

		for (i = 0; i < matriz[n].length-1; i++){
			$div_msgCorte.append(round(matriz[n][i])+'*x<sub>'+(i+1)+'</sub>');
			if (matriz[n][i+1] >= 0)
				$div_msgCorte.append(' + ');
			else $div_msgCorte.append('  ');
		}

		$div_msgCorte.append(round(matriz[n][i])+'*x<sub>'+(i+1)+'</sub> &ge; '+ round(num));		

		numRestr++;
		custo.push(0);
		matriz[n].push(-1);
		adicionaZeros(n, m);
		m++;
		custo.push(custoVarArtificial);
		matriz[n].push(1);
		adicionaZeros(n, m);
		m++;
		base.push(m);
		artificial.push(m);
		
		SimplexCortes();

		if(analisaSolucaoInteira(menorBA))
			return;

		corte = 0;
		
		for (i = 0; i < inteiras.length; i++){
			if (base.includes(inteiras[i])){
				linhaBasicaInteira = base.indexOf(inteiras[i]);
				valor = vetorB[linhaBasicaInteira];
				if (Math.abs(valor - Math.round(valor)) > 1e-5){
					corte = 1;
					basicaInteira = inteiras[i];
					break;
				}
			}
		}
	}

	$('#resultado-otimo').attr('class', 'col-md-6');
	$('#resultado-otimo-inteiro').show('slow');
	$('#iteracoes-cortes').show('slow');
	$div_result = $('#resultado-final-inteiro');
	$div_result.empty();
	$div_result.show();

	if (contadorIteCortes > maxIte){
		$div_result.append("Excedeu n&uacute;mero m&aacute;ximo de itera&ccedil;&otilde;es.");
	} else {
		$div_msgCorte = $('#msgCorte'+contadorIteCortes);
		$div_msgCorte.append('<br>Todas as vari&aacute;veis selecionadas com valor inteiro, portanto fim dos cortes.');

		solucaoInteira = []; // solucao otima unica

		for (i = 0; i < numVars; i++){
			if (base.includes(i+1)){
				solucaoInteira.push(vetorB[base.indexOf(i+1)]);
			} else {
				solucaoInteira.push(0);
			}
		}

		$div_result.append('<b>Solu&ccedil;&atilde;o &oacute;tima</b><br>x<sup>&lowast;</sup> = (');
		for (i = 0; i < numVars-1; i++){
			$div_result.append(round(solucaoInteira[i])+'&nbsp;&nbsp;');
		}

		$div_result.append(round(solucaoInteira[numVars-1])+')<sup>T</sup>');

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

	numRestr = salvaNumRestr;
}

function imprimeSimplexCortes(vetorBA){
	var i, j; // iteradores
	var contadorLinha = 1;
	z = 0; // calculo de custo de z

	contadorIteCortes++;
	
	$("#iteracoes-cortes").append('<table class="table table-striped table-hover table-bordered" id="iteracao-corte'+contadorIteCortes+'"><thead class="thead-dark">'+'<tr><th style="text-align:center;	" colspan="'+(custo.length+4)+'">Itera&ccedil&atilde;o '+contadorIteCortes+'</tr></thead><tbody id="corpo-corte'+contadorIteCortes+'"><tr id="cabecalho-corte'+contadorIteCortes+'"><th></th><th>c</th></tr><tr id="itCorte'+contadorIteCortes+'linha'+contadorLinha+'"><th>c<sub>B</sub></th><th>B</th></tr></tbody></table><p id="msgCorte'+contadorIteCortes+'" class="lead" style="text-align:center;"></p><br/>');

	$div_cab = $('#cabecalho-corte'+contadorIteCortes);
	$div_it = $('#itCorte'+contadorIteCortes+'linha'+contadorLinha);
	$div_corpo = $('#corpo-corte'+contadorIteCortes);

	for (i = 0; i < custo.length; i++) {
		$div_cab.append('<th>'+custo[i]+'</th>');
		$div_it.append('<th>x<sub>'+(i+1)+'</sub></th>');
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
		$div_corpo.append('<tr id="itCorte'+contadorIteCortes+'linha'+contadorLinha+'"><td>'+custo[base[i]-1]+'</td><th>x<sub>'+base[i]+'</sub></th></tr>');
		$div_it = $('#itCorte'+contadorIteCortes+'linha'+contadorLinha);
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
	$div_corpo.append('<tr id="itCorte'+contadorIteCortes+'linha'+contadorLinha+'"><td></td><th>c<sub>r</sub></tr>');
	$div_it = $('#itCorte'+contadorIteCortes+'linha'+contadorLinha);
	for (i = 0; i < custoReduzido.length; i++) {
		$div_it.append('<td>'+round(custoReduzido[i])+'</td>');			
	}
	solucaoReal = false;

	for (i = 0; i < base.length; i++){
		z += custo[base[i]-1] * vetorB[i];
	}

	$div_it.append('<td>'+round(z)+'</td>');					

	if (typeof vetorBA !== 'undefined')
		$div_it.append('<td></td>');					
}

function SimplexCortes(){
	var i, j; // iteradores
	var soma; // variavel auxiliar para calculo da soma da multiplicacao entre custo da base e valores na matriz 
	var menorValor // variavel para armazenar o menor valor no custo reduzido
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

			imprimeSimplexCortes(vetorBA);
		} else {
			imprimeSimplexCortes();
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
			$('#msgCorte'+contadorIteCortes).append('Entra x<sub>'+(colunaMenorValor+1)+'</sub> e sai x<sub>'+base[linhaMenorBA]+'</sub> da base.<br>Incremento de '+round(custoReduzido[colunaMenorValor]*vetorBA[linhaMenorBA])+' em z na próxima itera&ccedil;&atilde;o <br>');
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

	$('#msgCorte'+contadorIteCortes).append('Fim do Simplex.');
}

function analisaSolucaoInteira(menorBA){
	var i, j; // iteradores

	$div_result = $('#resultado-final-inteiro');
	$div_result.empty();

	encontrouSolucaInteira = true;

	if (menorBA === Number.MAX_VALUE) {
		$('#resultado-otimo').attr('class', 'col-md-6');
		$('#resultado-otimo-inteiro').show();
		$('#iteracoes-cortes').show('slow');
		$div_result.append('M&eacute;todo n&atilde;o converge: ')

		if (typeof artificial !== 'undefined'){
			for (i = 0; i < artificial.length; i++) {
				if (base.includes(artificial[i]) && vetorB[base.indexOf(artificial[i])] !== 0){
					$div_result.append('Solu&ccedil;&atilde;o vazia.');
					numRestr = salvaNumRestr;
					return 1;
				}
			}
		}

		$div_result.append('Solu&ccedil;&atilde;o ilimitada.');
		numRestr = salvaNumRestr;
		return 1;
	}
	else {
		if (typeof artificial !== 'undefined'){
			for (i = 0; i < artificial.length; i++) {
				if (base.includes(artificial[i]) && vetorB[base.indexOf(artificial[i])] !== 0){
					$('#resultado-otimo').attr('class', 'col-md-6');
					$('#resultado-otimo-inteiro').show();
					$('#iteracoes-cortes').show();
					$div_result.append('M&eacute;todo n&atilde;o converge: Solu&ccedil;&atilde;o vazia.');
					numRestr = salvaNumRestr;
					return 1;
				}
			}
		}
		return 0;
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
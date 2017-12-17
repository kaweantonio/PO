var limpou = 0;
var numOfertas = 2;
var numDemandas = 2;
// contador de iterações
var contadorIte;
// variáveis para realizar a validação
var copiaMatrizCustos;
var copiaVetorOfertas;
var copiaVetorDemandas;
// variaveis para utilização no método de Transporte
var matrizCustos; // armazena relação de custos entre Ofertas e Demandas
var matriz; // matriz que armazena valores das caselas básicas e não básicas
var matrizIndex; // matriz boolean para identificação de caselas básicas (true) e não básicas (false)
var vetorOfertas; // armazena ofertas dos nós de origem
var vetorDemandas; // armazena demandas dos nós de destino
var valorNoFicticio; // armazena valor de nó fictiocio adicionado no problema original
// vetores para cálculo do sistema de equações u(i) + v(j) = c(i,j), para as caselas básicas
var vetorU, vetorV;
// variáveis para determinar a linha e coluna com maior quantidade de caselas básicas
var linha, contaLinha, coluna, contaColuna;
// variáveis para casela não básica que entrará na base, chamada aqui de 'entrante'
var linhaEntrante, colunaEntrante, valorEntrante;
// vetor para marcação do ciclo
var marcaCiclo;
// valor que será somado e subtraído do ciclo encontrado
var delta;
// indíces da variável de bloqueio
var linhaDelta, colunaDelta;

$(document).ready(function(){
	limpa();
	alteraTabela();
});

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

function round(value) {
	return Math.round(value * 1000) / 1000;
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

$("#btCalcula").click(function (){
	$div_ite = $('#iteracoes');
	limpou = 0;

	if (validacao()) {
		$div_ite.empty();
		$div_ite.append('<h4 class="card-title" style="text-align: center;">Itera&ccedil;&otilde;es</h4>');
		formaPadrao();
		solucaoInicial(deepClone(vetorDemandas), deepClone(vetorOfertas));
		Transporte();
		imprimeSolucaoFinal();
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
});

function limpa(){
	document.getElementById('form-controle').reset();
}

$("#mostrarIte").change( function(){
   if($(this).is(':checked') && !limpou){
   	$('#iteracoes').show('slow');
   } else $('#iteracoes').hide('slow');
});

$('#ofertas').on('change', function(){
	if (validacao()) {
		atribuiValores();
		alteraTabela();
		restauraTabela();
	}
});

$('#demandas').on('change', function(){
	if (validacao()) {
		atribuiValores();
		alteraTabela();
		restauraTabela();
	}
});

function atribuiValores() {
	numOfertas = parseInt($('#ofertas').val(), 10);
	numDemandas = parseInt($('#demandas').val(), 10);
}

function alteraTabela(){
	$div_quadro = $('#quadro');

	$div_quadro.empty();

	$div_quadro.append('<table class="table table-striped table-hover table-bordered"><thead class="table-light">'+'<tr id="cabecalho" style="text-align: center;"><th></th></tr></thead><tbody id="corpo"></tbody></table>');

	$div_cabecalho = $('#cabecalho');
	$div_corpo = $('#corpo');

	for (i = 0; i < numDemandas; i++){
		$div_cabecalho.append('<th>D<sub>'+(i+1)+'</sub></th>');
	}
	$div_cabecalho.append('<th>Ofertas</th>');

	for (i = 0; i < numOfertas; i++){
		$div_corpo.append('<tr id="row'+(i+1)+'"><th style="text-align: right;">O<sub>'+(i+1)+'</sub></th></tr>');
		$div_linha = $('#row'+(i+1));
		for (j = 0; j < numDemandas; j++){
			$div_linha.append('<th><input id="x'+(i+1)+'-'+(j+1)+'" type="text" placeholder="0"></th>');
		}

		$div_linha.append('<th><input id="O'+(i+1)+'" type="text" placeholder="0"></th>');
	}

	$div_corpo.append('<tr id="row-demanda"><th>Demandas</th></tr>');
	$div_linha = $('#row-demanda');

	for (i = 0; i < numDemandas; i++){
		$div_linha.append('<th><input id="D'+(i+1)+'" type="text" placeholder="0"></th>')
	}

	$div_linha.append('<th></th>');
}

function alerta(msg){
	$('#msg-alerta').empty();
	$('#msg-alerta').append(msg);

	$('#secao-alerta').show();
}

function validacao(){
	var i, j;
	copiaMatrizCustos = [];
	copiaVetorOfertas = [];
	copiaVetorDemandas = [];
	var num;

	num = $('#ofertas').val();

	if (num === ''){
		alerta("Entre com um valor v&aacute;lido para o N&uacute;mero de Ofertas");
		$('#ofertas').focus();
		return 0;
	} else if (num > 10 || num < 2){
		alerta("Entre com um valor entre 2 e 10 para o N&uacute;mero de Ofertas");
		$('#ofertas').focus();
		return 0;
	}

	num = $('#demandas').val();

	if (num === ''){
		alerta("Entre com um valor v&aacute;lido para o N&uacute;mero de Demandas");
		$('#demandas').focus();
		return 0;
	} else if (num > 10 || num < 2){
		alerta("Entre com um valor entre 2 e 10 para o N&uacute;mero de Demandas");
		$('#ofertas').focus();
		return 0;
	}

	for (i = 0; i < numOfertas; i++){
		num = $('#O'+(i+1)).val().replace(/,/,'.');
		if (num === '')
			num = 0;
		copiaVetorOfertas.push(parseFloat(num, 10));
	}

	for (i = 0; i < numDemandas; i++){
		num = $('#D'+(i+1)).val().replace(/,/,'.');
		if (num === '')
			num = 0;
		copiaVetorDemandas.push(parseFloat(num, 10));
	}

	for (i = 0; i < numOfertas; i++){
		copiaMatrizCustos.push([]);
		for (j = 0; j < numDemandas; j++){
			num = $('#x'+(i+1)+'-'+(j+1)).val().replace(/,/,'.');
			if (num === '')
				num = 0;
			copiaMatrizCustos[i][j] = parseFloat(num, 10);
		}
	}

	$('#secao-alerta').hide();
	return 1;
}

function restauraTabela(){
	var i, j;

	for (i = 0; i < copiaVetorOfertas.length; i++){
		if (copiaVetorOfertas[i] !== 0){
			$('#O'+(i+1)).val(copiaVetorOfertas[i]);
		}
	}

	for (i = 0; i < copiaVetorDemandas.length; i++){
		if (copiaVetorDemandas[i] !== 0){
			$('#D'+(i+1)).val(copiaVetorDemandas[i]);
		}
	}

	for (i = 0; i < copiaMatrizCustos.length; i++){
		for (j = 0; j < copiaMatrizCustos[0].length; j++){
			if (copiaMatrizCustos[i][j] !== 0)
				$('#x'+(i+1)+'-'+(j+1)).val(copiaMatrizCustos[i][j]);
		}
	}
}

Array.prototype.sumArray = function (){
	return this.reduce((a, b) => a + b, 0);
}

function adicionaNoFicticio(somaOfertas, somaDemandas){
	var i, j; // iteradores

	if (somaOfertas > somaDemandas){
		// adiciona nó ficticio de demanda
		valorNoFicticio = somaOfertas - somaDemandas;
		
		vetorDemandas.push(valorNoFicticio);
		for (i = 0; i < numOfertas; i++){
			matrizCustos[i][numDemandas] = 0;
			matriz[i][numDemandas] = 0;
			matrizIndex[i][numDemandas] = false;
		}
	} else {
		// adiciona nó ficticio de oferta
		valorNoFicticio = somaDemandas - somaOfertas;

		vetorOfertas.push(valorNoFicticio);
		matrizCustos.push([]);
		matrizIndex.push([]);
		matriz.push([]);
		for (i = 0; i < numDemandas; i++){
			matrizCustos[numOfertas][i] = 0;
			matriz[numOfertas][i] = 0;
			matrizIndex[numOfertas][i] = false;
		}
	}
}

function formaPadrao(){
	var i, j; // iteradores
	var somaOfertas, somaDemandas; // somatorio de ofertas e demandas
	matriz = []; matrizCustos = []; matrizIndex = []; vetorOfertas = []; vetorDemandas = []; // inicialização de variaveis

	for (i = 0; i < numOfertas; i++){
		vetorOfertas.push(copiaVetorOfertas[i]);
		matriz.push([]);
		matrizCustos.push([]);
		matrizIndex.push([]);
		for (j = 0; j < numDemandas; j++){
			matrizCustos[i][j] = copiaMatrizCustos[i][j];
			matriz[i][j] = 0;
			matrizIndex[i][j] = false;
		}
	}

	for (i = 0; i < numDemandas; i++){
		vetorDemandas.push(copiaVetorDemandas[i]);
	}

	somaOfertas = vetorOfertas.sumArray();
	somaDemandas = vetorDemandas.sumArray();

	if (somaOfertas !== somaDemandas){
		adicionaNoFicticio(somaOfertas, somaDemandas);
		copiaVetorDemandas = deepClone(vetorDemandas);
		copiaVetorOfertas = deepClone(vetorOfertas);
	}

	imprimeFP(somaOfertas, somaDemandas);
}

function imprimeFP(somaOfertas, somaDemandas){
	$div_fp = $('#forma-padrao');

	$div_fp.empty();

	$div_fp.append('<h4 class="card-title" style="text-align: center;">Forma Padr&atilde;o</h4><table id="tabela-fp" class="table table-striped table-hover table-bordered"><thead class="table-light">'+'<tr id="cabecalho-fp" style="text-align: center;"><th></th></tr></thead><tbody id="corpo-fp"></tbody></table><p id="fp-msg" class="lead" style="text-align: center;"></p><br>');

	$div_cabecalho = $('#cabecalho-fp');
	$div_corpo = $('#corpo-fp');

	for (i = 0; i < matrizCustos[0].length; i++){
		$div_cabecalho.append('<th>D<sub>'+(i+1)+'</sub></th>');
	}
	$div_cabecalho.append('<th>Ofertas</th>');

	for (i = 0; i < matrizCustos.length; i++){
		$div_corpo.append('<tr id="fp-row'+(i+1)+'"><th style="text-align: right;">O<sub>'+(i+1)+'</sub></th></tr>');
		$div_linha = $('#fp-row'+(i+1));
		for (j = 0; j < matrizCustos[0].length; j++){
			$div_linha.append('<td>'+round(matrizCustos[i][j])+'</td>');
		}

		$div_linha.append('<th>'+round(vetorOfertas[i])+'</th>');
	}

	$div_corpo.append('<tr id="fp-row-demanda"><th>Demandas</th></tr>');
	$div_linha = $('#fp-row-demanda');

	for (i = 0; i < matrizCustos[0].length; i++){
		$div_linha.append('<th>'+vetorDemandas[i]+'</th>')
	}

	$div_linha.append('<th></th>');

	$div_msg = $('#fp-msg');

	if (somaOfertas === somaDemandas){
		$div_msg.append('&sum;O = &sum;D, portanto nenhum n&oacute; fict&iacute;cio adicionado.');
	} else if (somaOfertas > somaDemandas) {
		$div_msg.append('&sum;O > &sum;D. Adicionado n&oacute; fict&iacute;cio de demanda D<sub>'+matrizCustos[0].length+'</sub> com oferta de '+valorNoFicticio+'.');
	} else {
		$div_msg.append('&sum;O < &sum;D. Adicionado n&oacute; fict&iacute;cio de oferta O<sub>'+matrizCustos.length+'</sub> com demanda de '+valorNoFicticio+'.');
	}
}

function solucaoInicial(vetorDemandas, vetorOfertas){ // solução inicial pelo método do canto noroeste
	var i, j, k; // iteradores
	var menor; // menor valor entre Oferta(i) e Demanda(j)
	// variáveis para determinar o fim da busca da solução inicial (última casela da matriz de Custos)
	var m = matrizCustos.length-1, n = matrizCustos[0].length-1;

	i = 0;
	j = 0;
	while (i != m && j != n){
		if (vetorOfertas[i] < vetorDemandas[j]){
			matriz[i][j] = vetorOfertas[i];
			matrizIndex[i][j] = true;
			vetorDemandas[j] -= vetorOfertas[i];
			vetorOfertas[i] -= vetorOfertas[i];
		} else {
			matriz[i][j] = vetorDemandas[j];
			matrizIndex[i][j] = true;
			vetorOfertas[i] -= vetorDemandas[j];
			vetorDemandas[j] -= vetorDemandas[j];
		}

		if (vetorOfertas[i] === 0 && vetorDemandas[j] === 0){
			i++;
			matrizIndex[i][j] = true;
			j++;
		} else if (vetorOfertas[i] === 0){
			i++;
		} else { // vetorDemandas[j] === 0
			j++;
		}
	}

	if (i !== m){
		for (k = i; k <= m; k++){
			if (vetorOfertas[k] < vetorDemandas[j]){
				matriz[k][j] = vetorOfertas[k];
				matrizIndex[k][j] = true;
				vetorDemandas[j] -= vetorOfertas[k];
				vetorOfertas[k] -= vetorOfertas[k];
			} else {
				matriz[k][j] = vetorDemandas[j];
				matrizIndex[k][j] = true;
				vetorOfertas[k] -= vetorDemandas[j];
				vetorDemandas[j] -= vetorDemandas[j];
			}
		}
	} else if (j !== n) {
		for (k = j; k <= n; k++){
			if (vetorOfertas[i] < vetorDemandas[k]) {
				matriz[i][k] = vetorOfertas[i];
				matrizIndex[i][k] = true;
				vetorDemandas[k] -= vetorOfertas[i];
				vetorOfertas[i] -= vetorOfertas[i];
			} else {
				matriz[i][k] = vetorDemandas[k];
				matrizIndex[i][k] = true;
				vetorOfertas[i] -= vetorDemandas[k];
				vetorDemandas[k] -= vetorDemandas[k];	
			}
		}
	} else { // i === m && j === n 
		matrizIndex[m][n] = true;

		if (vetorOfertas[m] !== 0){
			matriz[m][n] = vetorOfertas[m];
			vetorOfertas[m] = 0;
		} else if (vetorDemandas[n] !== 0){
			matriz[m][n] = vetorDemandas[n];
			vetorDemandas[n] = 0;
		}
	}
}

/********** Funções para método de Transporte **********/
// conta a quantidade de cáselas básicas para cada linha e coluna da matrizIndex
function contaBasicas(){
	var i, j;
	var soma = 0;

	// contagem para linhas da matrizIndex
	for (i = 0; i < matrizIndex[0].length; i++){
		if (matrizIndex[0][i]) { // matrizIndex[0][j] === true
			soma++;
		}
	}

	linha = 0;
	contaLinha = soma;

	for (i = 1; i < matrizIndex.length; i++){
		soma = 0;
		for (j = 0; j < matrizIndex[0].length; j++){
			if (matrizIndex[i][j]) { // matrizIndex[i][j] === true
				soma++;
			}
		}
		if (soma > contaLinha){
			linha = i;
			contaLinha = soma;
		}
	}

	// contagem para as colunas da matrizIndex
	soma = 0;

	for (i = 0; i < matrizIndex.length; i++){
		if (matrizIndex[i][0]){ // matrizIndex[i][0] === true
			soma++;
		}
	}

	coluna = 0;
	contaColuna = soma;

	for (i = 1; i < matrizIndex[0].length; i++){
		soma = 0;
		for (j = 0; j < matrizIndex.length; j++){
			if(matrizIndex[j][i]){ // matrizIndex[j][i] === true
				soma++;
			}
		}
		if (soma > contaColuna){
			coluna = i;
			contaColuna = soma;
		}
	}
}

// calcula valores de u(i) e v(j) e determina o custo reduzido das caselas não básicas
function calculaCustoReduzido(){
	var i, j;
	vetorU = []; vetorV = []; // inicializa variáveis

	// inicializa todos os u(i) e v(j) com Infinito
	for (i = 0; i < matrizCustos.length; i++)
		vetorU.push(Infinity);
	for (j = 0; j < matrizCustos[0].length; j++)
		vetorV.push(Infinity);

	contaBasicas();

	// se numero de caselas básicas na linha é maior ou igual
	// ao número de caselas básicas na coluna, zera-se u(linha) 
	if (contaLinha >= contaColuna){
		vetorU[linha] = 0;

		// atribui valores para v(j) em relação a u(linha)
		for (j = 0; j < matrizCustos[0].length; j++){
			if(matrizIndex[linha][j]){
				vetorV[j] = matrizCustos[linha][j];
 			}
		}
	} else {
		// caso contrário, zera-se v(coluna)
		vetorV[coluna] = 0;

		// atribui valores para u(i) em relação a v(coluna)
		for (i = 0; i < matrizCustos.length; i++){
			if(matrizIndex[i][coluna]){
				vetorU[i] = matrizCustos[i][coluna];
 			}
		}
	}

	// calcula os valores restante de u(i) e v(j) para as casela  básicas
	while(vetorU.includes(Infinity) || vetorV.includes(Infinity)){
		for (i = 0; i < matrizCustos.length; i++){
			for (j = 0; j < matrizCustos[0].length; j++){
				// identifica casela básica
				if (matrizIndex[i][j]){
					if (vetorU[i] !== Infinity && vetorV[j] === Infinity){
						vetorV[j] = matrizCustos[i][j] - vetorU[i];
					} else if (vetorU[i] === Infinity && vetorV[j] !== Infinity){
						vetorU[i] = matrizCustos[i][j] - vetorV[j];
					}
				}
			}
		}
	}

	// calcula custo reduzido para as caselas não básicas
	for (i = 0; i < matriz.length; i++){
		for (j = 0; j < matriz[0].length; j++){
			// identifica casela não básica
			if (!matrizIndex[i][j]){
				matriz[i][j] = matrizCustos[i][j] - (vetorU[i] + vetorV[j]);
			}
		}
	}
}

// determina casela não básica c(i,j) que entrará na base
function determinaEntrante(){
	var i, j;

	valorEntrante = Number.MAX_VALUE;

	for (i = 0; i < matriz.length; i++){
		for (j = 0; j < matriz[0].length; j++){
			// identifica casela não básica
			if (!matrizIndex[i][j]){
				if (matriz[i][j] < valorEntrante){
					valorEntrante = matriz[i][j];
					linhaEntrante = i;
					colunaEntrante = j;
				}
			}
		}
	}
}

Array.prototype.containsArray = function(val) {
    var hash = {};
    for(var i=0; i<this.length; i++) {
        hash[this[i]] = i;
    }
    return hash.hasOwnProperty(val);
}

function isItemInArray(array, item) {
  for (var i = 0; i < array.length; i++) {
      // This if statement depends on the format of your array
      if (array[i][0] == item[0] && array[i][1] == item[1]) {
          return i;   // Found it
      }
  }
  return -1;   // Not found
}

function procuraCiclo(){
	var i, j;
	// m - número de linhas, n - número de colunas
	var m = matriz.length, n = matriz[0].length;
	// variáveis para salvar os índices i e j da última casela a ser marcada
	var linha = linhaEntrante, coluna = colunaEntrante;
	// variável para indicar o sentido (0 - vertical; 1 - horizontal) da próxima marcação
	var sentido = 0; // sempre começa a procura pela vertical
	var sentidoAnterior; // salva sentido anterior, caso necessite pular uma casela
	// variável boolean para indicar se foi possível realizar a marcação no sentido indicado
	var marcou;
	// variável para armazenar índices da casela básica marcada anteriormente,
	// mas que não foi possível formar ciclo, portanto deve ser pulada
	var marcadoAnteriormente;

	// marca casela não básica que entrará na base
	marcaCiclo.push([linha, coluna]);
	matrizIndex[linha][coluna] = true; // marca casela não básica como casela básica

	do {
		if (!sentido){
			marcou = false;
			// procura casela básica no sentido vertical
			for (i = (linha+1)%m; i != linha; i = (i+1)%m){
				// identifica casela básica
				if(matrizIndex[i][coluna] && (!marcaCiclo.containsArray([i, coluna]) || (i === linhaEntrante && coluna === colunaEntrante))){
					linha = i;
					marcaCiclo.push([linha, coluna]);
					sentidoAnterior = 0;
					sentido = 1; // próxima procura serã no sentido horizontal
					marcou = true;
					break;
				}
			}
		} else { // sentido === 1, procura casela básica no sentido horizontal
			marcou = false;
			// procura casela básica no sentido horizontal
			for (i = (coluna+1)%n; i != coluna; i = (i+1)%n){
				// identifica casela básica
				if(matrizIndex[linha][i] && (!marcaCiclo.containsArray([linha, i]) || (linha === linhaEntrante && i === colunaEntrante))){
					coluna = i;
					marcaCiclo.push([linha, coluna]);
					sentidoAnterior = 1;
					sentido = 0; // próxima procura serã no sentido vertical
					marcou = true;
					break;
				}
			}
		}

		// se não foi possível marcar, pula casela marcada anteriormente e realiza marcação novamente na próxima iteração
		if (!marcou){
			marcadoAnteriormente = marcaCiclo.pop();
			linha = marcadoAnteriormente[0];
			coluna = marcadoAnteriormente[1];
			sentido = sentidoAnterior;
			if (sentidoAnterior) // sentidoAnterior === 1
				sentidoAnterior = 0;
			else sentidoAnterior = 1;
		}
	} while (linha != linhaEntrante || coluna != colunaEntrante);

	matrizIndex[linha][coluna] = false;
}

function criaMarcacao(){
	var i, j;
	marcaCiclo = [];

	determinaEntrante();

	if (valorEntrante >= 0){
		return 0;
	} else {

		procuraCiclo();
		marcaCiclo.pop();

		// determina valor de Delta
		// casela marcada com sinal [-] estão sempre na posições (i) ímpares do vetor
		var linha = marcaCiclo[1][0];
		var coluna = marcaCiclo[1][1];
		delta = matriz[linha][coluna];
		linhaDelta = linha;
		colunaDelta = coluna;
		
		for (i = 3; i < marcaCiclo.length; i += 2){
			linha = marcaCiclo[i][0];
			coluna = marcaCiclo[i][1];

			if (matriz[linha][coluna] < delta){
				delta = matriz[linha][coluna];
				linhaDelta = linha;
				colunaDelta = coluna;
			}
		}

		return 1;
	}
}

function pivotamento(){
	var i, j; // iteradores
	var saiBase = false; // indica se variável de bloqueio já saiu da base
	var casela; // vetor para caminhar nas caselas da matriz
	var linha, coluna; // armazena indice da casela
	// indica qual operação a ser realizada, 0 - soma | 1 - subtração
	var operacao = 0; // sempre começa com soma
	// marca variável que irá entrar na base e altera matrizIndex
	casela = marcaCiclo.shift();
	
	linha = casela[0]; coluna = casela[1];
	matriz[linha][coluna] = delta;
	matrizIndex[linha][coluna] = true;
	operacao = 1;

	while (marcaCiclo.length > 0){
		casela = marcaCiclo.shift();
		linha = casela[0]; coluna = casela[1];
		if (operacao) {
			matriz[linha][coluna] -= delta;
			operacao = 0;
		}
		else { 
			matriz[linha][coluna] += delta;
			operacao = 1;
		}
		if (matriz[linha][coluna] === 0 && !saiBase){
			saiBase = true;
			matrizIndex[linha][coluna] = false;
		}
	}
}

function Transporte(){
	var i, j; // iteradores
	var marcacao; // diz se houve pivotamento ou não
	contadorIte = 0;

	calculaCustoReduzido();
	imprimeSolucaoInicial();
	marcacao = criaMarcacao();
	if (marcacao){
		imprimeTransporte();
		pivotamento();
	}

	while (marcacao){
		calculaCustoReduzido();
		marcacao = criaMarcacao();
		if (marcacao){
			imprimeTransporte();
			pivotamento();
		}
	}

	// do {
	// 	calculaCustoReduzido();
	// 	marcacao = criaMarcacao();
	// 	if (marcacao){
	// 		imprimeTransporte();
	// 		pivotamento();
	// 	}
	// } while (marcacao);

	imprimeTransporteQuadroFinal();
}

function imprimeSolucaoInicial(){
	var i, j;
	var contadorLinha = 1;
	var z = 0;

	$("#iteracoes").append('<table class="table table-striped table-hover table-bordered" id="solucao-inicial"><thead class="thead-dark">'+'<tr><th style="text-align: center;	" colspan="'+(matriz[0].length+2)+'">Solu&ccedil;&atilde;o Inicial</tr></thead><tbody id="si-corpo"><tr id="si-cabecalho"><th></th></tr></tbody></table><p id="si-msg" class="lead" style="text-align:center;"></p><br/>');

	$div_corpo = $('#si-corpo');
	$div_cab = $('#si-cabecalho');

	for (i = 0; i < matriz[0].length; i++){
		$div_cab.append('<th style="text-align: center">D<sub>'+(i+1)+'</sub></th>');
	}

	$div_cab.append('<th style="text-align: left">Ofertas</th>');

	for (i = 0; i < matriz.length; i++){
		$div_corpo.append('<tr id="si-linha'+contadorLinha+'" style="text-align: center;"><th style="text-align: right">O<sub>'+(i+1)+'</sub></th></tr>');
		$div_row = $('#si-linha'+contadorLinha);
		for (j = 0; j < matriz[0].length; j++){
			// casela básica
			if (matrizIndex[i][j]){
				$div_row.append('<td>'+round(matrizCustos[i][j])+' / <b class="basica">'+round(matriz[i][j])+'</b></td>');
				z += matrizCustos[i][j] * matriz[i][j];
			}  else { // casela não básica
				$div_row.append('<td>'+round(matrizCustos[i][j])+'</td>');
			}
		}

		$div_row.append('<th style="text-align: left">'+round(vetorOfertas[i])+'</th>');

		contadorLinha++;
	}

	contadorLinha++;
	$div_corpo.append('<tr id="it'+contadorIte+'linha'+contadorLinha+'" style="text-align: center"><th style="text-align: right;">Demandas</th></tr>');
	$div_row = $('#it'+contadorIte+'linha'+contadorLinha);
	for (i = 0; i < matriz[0].length; i++){
		$div_row.append('<th>'+round(vetorDemandas[i])+'</th>');
	}

	$div_row.append('<th style="text-align: left;">z<sup>&lowast;</sup> = '+round(z)+'</th>');
}

function imprimeTransporte(){
	var i, j;
	var contadorLinha = 1;
	var z = 0;
	var Incremento;

	contadorIte++;

	$("#iteracoes").append('<table class="table table-striped table-hover table-bordered" id="iteracao'+contadorIte+'"><thead class="thead-dark">'+'<tr><th style="text-align: center;	" colspan="'+(matriz[0].length+3)+'">Itera&ccedil&atilde;o '+contadorIte+'</tr></thead><tbody id="corpo'+contadorIte+'"><tr id="cabecalho'+contadorIte+'"><th></th></tr></tbody></table><p id="msg'+contadorIte+'" class="lead" style="text-align:center;"></p><br/>');

	$div_corpo = $('#corpo'+contadorIte);
	$div_cab = $('#cabecalho'+contadorIte);

	for (i = 0; i < matriz[0].length; i++){
		$div_cab.append('<th style="text-align: center">D<sub>'+(i+1)+'</sub></th>');
	}

	$div_cab.append('<th style="text-align: left">Ofertas</th><th>u<sub>i</sub></th>');

	for (i = 0; i < matriz.length; i++){
		$div_corpo.append('<tr id="it'+contadorIte+'linha'+contadorLinha+'" style="text-align: center;"><th style="text-align: right">O<sub>'+(i+1)+'</sub></th></tr>');
		$div_row = $('#it'+contadorIte+'linha'+contadorLinha);
		for (j = 0; j < matriz[0].length; j++){
			// casela básica
			if (matrizIndex[i][j]){
				$div_row.append('<td>'+round(matrizCustos[i][j])+' / <b class="basica">'+round(matriz[i][j])+'</b></td>');
				z += matrizCustos[i][j] * matriz[i][j];
			} else { // casela não básica
				$div_row.append('<td>'+round(matrizCustos[i][j])+' / <b class="nao-basica">('+round(matriz[i][j])+')</b></td>');
			}

			if (marcaCiclo.containsArray([i, j])){
				var index = isItemInArray(marcaCiclo, [i, j]);

				if (index & 1){
					// index é ímpar, portanto marcado com sinal de [-]
					$div_row.find('td').last().append(' / <b class="sinal">[-]</b>');
				} else {
					$div_row.find('td').last().append(' / <b class="sinal">[+]</b>');
				}
			}
		}

		$div_row.append('<th style="text-align: left">'+round(vetorOfertas[i])+'</th><td style="text-align: left">'+vetorU[i]+'</td>');

		contadorLinha++;
	}

	contadorLinha++;
	$div_corpo.append('<tr id="it'+contadorIte+'linha'+contadorLinha+'" style="text-align: center"><th style="text-align: right;">Demandas</th></tr>');
	$div_row = $('#it'+contadorIte+'linha'+contadorLinha);
	for (i = 0; i < matriz[0].length; i++){
		$div_row.append('<th>'+round(vetorDemandas[i])+'</th>');
	}

	$div_row.append('<th colspan="2" style="text-align: left;">z<sup>&lowast;</sup> = '+round(z)+'</th>');

	contadorLinha++;
	$div_corpo.append('<tr id="it'+contadorIte+'linha'+contadorLinha+'" style="text-align: center"><th style="text-align: right;">v<sub>j</sub></th></tr>');
	$div_row = $('#it'+contadorIte+'linha'+contadorLinha);
	for (j = 0; j < vetorV.length; j++){
		$div_row.append('<td>'+round(vetorV[j])+'</td>');	
	}

	Incremento = delta * valorEntrante;

	$div_row.append('<th colspan="2" style="text-align: left;">&Delta; = '+round(delta)+' | Incremento: '+round(Incremento)+'</th>');

	$div_msg = $('#msg'+contadorIte);
	$div_msg.append('Entra na base x<sub>'+(linhaEntrante+1)+(colunaEntrante+1)+'</sub> e sai da base vari&aacute;vel de bloqueio x<sub>'+(linhaDelta+1)+(colunaDelta+1)+'</sub>.');
}

function imprimeTransporteQuadroFinal(){
	var i, j;
	var contadorLinha = 1;
	var z = 0;

	contadorIte++;

	$("#iteracoes").append('<table class="table table-striped table-hover table-bordered" id="iteracao'+contadorIte+'"><thead class="thead-dark">'+'<tr><th style="text-align: center;	" colspan="'+(matriz[0].length+3)+'">Itera&ccedil&atilde;o '+contadorIte+'</tr></thead><tbody id="corpo'+contadorIte+'"><tr id="cabecalho'+contadorIte+'"><th></th></tr></tbody></table><p id="msg'+contadorIte+'" class="lead" style="text-align:center;"></p><br/>');

	$div_corpo = $('#corpo'+contadorIte);
	$div_cab = $('#cabecalho'+contadorIte);

	for (i = 0; i < matriz[0].length; i++){
		$div_cab.append('<th style="text-align: center">D<sub>'+(i+1)+'</sub></th>');
	}

	$div_cab.append('<th style="text-align: left">Ofertas</th><th>u<sub>i</sub></th>');

	for (i = 0; i < matriz.length; i++){
		$div_corpo.append('<tr id="it'+contadorIte+'linha'+contadorLinha+'" style="text-align: center;"><th style="text-align: right">O<sub>'+(i+1)+'</sub></th></tr>');
		$div_row = $('#it'+contadorIte+'linha'+contadorLinha);
		for (j = 0; j < matriz[0].length; j++){
			// casela básica
			if (matrizIndex[i][j]){
				$div_row.append('<td>'+round(matrizCustos[i][j])+' / <b class="basica">'+round(matriz[i][j])+'</b></td>');
				z += matrizCustos[i][j] * matriz[i][j];
			} else { // casela não básica
				$div_row.append('<td>'+round(matrizCustos[i][j])+' / <b class="nao-basica">('+round(matriz[i][j])+')</b></td>');
			}
		}

		$div_row.append('<th style="text-align: left">'+round(vetorOfertas[i])+'</th><td style="text-align: left">'+vetorU[i]+'</td>');

		contadorLinha++;
	}

	contadorLinha++;
	$div_corpo.append('<tr id="it'+contadorIte+'linha'+contadorLinha+'" style="text-align: center"><th style="text-align: right;">Demandas</th></tr>');
	$div_row = $('#it'+contadorIte+'linha'+contadorLinha);
	for (i = 0; i < matriz[0].length; i++){
		$div_row.append('<th>'+round(vetorDemandas[i])+'</th>');
	}

	$div_row.append('<th colspan="2" style="text-align: left;">z<sup>&lowast;</sup> = '+round(z)+'</th>');

	contadorLinha++;
	$div_corpo.append('<tr id="it'+contadorIte+'linha'+contadorLinha+'" style="text-align: center"><th style="text-align: right;">v<sub>j</sub></th></tr>');
	$div_row = $('#it'+contadorIte+'linha'+contadorLinha);
	for (j = 0; j < vetorV.length; j++){
		$div_row.append('<td>'+round(vetorV[j])+'</td>');	
	}

	$div_row.append('<td colspan="2"></td>');

	$div_msg = $('#msg'+contadorIte);
	$div_msg.append('Fim das itera&ccedil;&otilde;es do m&eacute;todo de Transporte.<br>');
	if (valorEntrante === 0)
		$div_msg.append('H&aacute; vari&aacute;veis n&atilde;o b&aacute;sicas com valor igual a zero, portanto existe mais de uma solu&ccedil;&atilde;o &oacute;tima com o mesmo custo (z).');
	else {
		$div_msg.append('Nenhuma vari&aacute;veis n&atilde;o b&aacute;sicas com valor igual a zero, portanto solu&ccedil;&atilde;o &oacute;tima &uatilde;nica.');
	}
}

function imprimeSolucaoFinal(){
	var i, j;
	var contadorLinha = 1;
	var z = 0;

	$div_result = $('#resultado-otimo');
	$div_result.empty();

	$div_result.append('<h4 class="card-title" style="text-align: center;">Resultado obtido</h4><table id="tabela-sf" class="table table-striped table-hover table-bordered"><thead class="table-light">'+'<tr id="sf-cabecalho" style="text-align: center;"><th></th></tr></thead><tbody id="sf-corpo"></tbody></table><br>');

	$div_corpo = $('#sf-corpo');
	$div_cab = $('#sf-cabecalho');

	for (i = 0; i < matriz[0].length; i++){
		$div_cab.append('<th style="text-align: center">D<sub>'+(i+1)+'</sub></th>');
	}

	$div_cab.append('<th style="text-align: left">Ofertas</th>');

	for (i = 0; i < matriz.length; i++){
		$div_corpo.append('<tr id="sf-linha'+contadorLinha+'" style="text-align: center;"><th style="text-align: right">O<sub>'+(i+1)+'</sub></th></tr>');
		$div_row = $('#sf-linha'+contadorLinha);
		for (j = 0; j < matriz[0].length; j++){
			// casela básica
			if (matrizIndex[i][j]){
				$div_row.append('<td>'+round(matrizCustos[i][j])+' / <b class="basica">'+round(matriz[i][j])+'</b></td>');
				z += matrizCustos[i][j] * matriz[i][j];
			}  else { // casela não básica
				$div_row.append('<td>'+round(matrizCustos[i][j])+'</td>');
			}
		}

		$div_row.append('<th style="text-align: left">'+round(vetorOfertas[i])+'</th>');

		contadorLinha++;
	}

	contadorLinha++;
	$div_corpo.append('<tr id="sf-linha'+contadorLinha+'" style="text-align: center"><th style="text-align: right;">Demandas</th></tr>');
	$div_row = $('#sf-linha'+contadorLinha);
	for (i = 0; i < matriz[0].length; i++){
		$div_row.append('<th>'+round(vetorDemandas[i])+'</th>');
	}

	$div_row.append('<th style="text-align: left;">z<sup>&lowast;</sup> = '+round(z)+'</th>');
}
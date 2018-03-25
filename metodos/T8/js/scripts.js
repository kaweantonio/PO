var limpou = 0;
var numCidades = 2;
var trocaSinal; // bool para troca de sinal na resolução de problemas de maximização 
// contador de iterações
var contadorIte;
// variáveis para realizar a validação
var copiaMatrizCustos;
// variaveis para utilização no método de Transporte
var matrizCustos; // armazena relação de custos entre Ofertas e Demandas
var valorNoFicticio; // armazena valor de nó fictiocio adicionado no problema original
// salva índices (linha e coluna) onde há um zero alocado.
// a alocação é determinada pela menor quantidade de zeros em cada linha
var colunasAlocadas, linhasAlocadas;
// salva os índices (linha e coluna) dos zeros cortados,
// ou seja, os zeros das linha e colunas que já tiveram zeros alocadas.
var colunasCortadas, linhasCortadas;
// variáveis para salvar linhas e colunas riscadas
var colunaRiscada = [], linhaRiscada = [];
// variável para armazenar o menor valor das casela não riscadas
var menorValor;

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
		Alocacao();
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

$('#cidades').on('change', function(){
	if (validacao()) {
		atribuiValores();
		alteraTabela();
		restauraTabela();
	}
});

function atribuiValores() {
	numCidades = parseInt($('#cidades').val(), 10);
}

function alteraTabela(){
	$div_quadro = $('#quadro');

	$div_quadro.empty();

	$div_quadro.append('<table class="table table-striped table-hover table-bordered"><thead class="table-light">'+'<tr id="cabecalho" style="text-align: center;"><th></th></tr></thead><tbody id="corpo"></tbody></table>');

	$div_cabecalho = $('#cabecalho');
	$div_corpo = $('#corpo');

	for (i = 0; i < numCidades; i++){
		$div_cabecalho.append('<th>C<sub>'+(i+1)+'</sub></th>');
	}

	for (i = 0; i < numCidades; i++){
		$div_corpo.append('<tr id="row'+(i+1)+'"><th style="text-align: right;">C<sub>'+(i+1)+'</sub></th></tr>');
		$div_linha = $('#row'+(i+1));
		for (j = 0; j < numCidades; j++){
			if (i === j)
				$div_linha.append('<th style="text-align: center;">-</th>');
			else		
				$div_linha.append('<th><input id="x'+(i+1)+'-'+(j+1)+'" type="text" placeholder="0"></th>');
		}
	}

	$(':input[type="text"]').keypress(function (event) { 
		return isNumber(event, this) 
	});
}

function alerta(msg){
	$('#msg-alerta').empty();
	$('#msg-alerta').append(msg);

	$('#secao-alerta').show();
}

function validacao(){
	var i, j;
	copiaMatrizCustos = [];
	arcosNaoExistentes = [];
	var num;

	num = $('#cidades').val();

	if (num === ''){
		alerta("Entre com um valor v&aacute;lido para o N&uacute;mero de Cidades");
		$('#cidades').focus();
		return 0;
	} else if (num > 10 || num < 2){
		alerta("Entre com um valor entre 2 e 10 para o N&uacute;mero de Cidades");
		$('#cidades').focus();
		return 0;
	}

	for (i = 0; i < numCidades; i++){
		copiaMatrizCustos.push([]);
		for (j = 0; j < numCidades; j++){
			try {
				num = $('#x'+(i+1)+'-'+(j+1)).val().replace(/,/,'.');
				if (num === '')
					num = 0;
				else if (num === '-'){
					num = Infinity;
					arcosNaoExistentes.push([i,j]);
				}
			} catch(e){
				num = Infinity;
			}
			copiaMatrizCustos[i][j] = parseFloat(num, 10);
		}
	}

	$('#secao-alerta').hide();
	return 1;
}

function restauraTabela(){
	var i, j;

	for (i = 0; i < copiaMatrizCustos.length; i++){
		for (j = 0; j < copiaMatrizCustos[0].length; j++){
			if (!isFinite(copiaMatrizCustos[i][j]))
				$('#x'+(i+1)+'-'+(j+1)).val('-');
			else if (copiaMatrizCustos[i][j] !== 0)
				$('#x'+(i+1)+'-'+(j+1)).val(copiaMatrizCustos[i][j]);
		}
	}
}

Array.prototype.sumArray = function (){
	return this.reduce((a, b) => a + b, 0);
}

function numDigits(x) {
  return Math.max(Math.floor(Math.log10(Math.abs(x))), 0) + 1;
}

function formaPadrao(){
	var i, j; // iteradores
	var Mgrande; // armazena valor de M grande para arcos que não existem
	var somaOfertas, somaDemandas; // somatorio de ofertas e demandas
	matrizCustos = []; // inicialização de variaveis

	if($("#objetivo").val() === "1") {
		trocaSinal = 1;
	} else trocaSinal = 0;

	var num = Number.MIN_VALUE;
	
	for (i = 0; i < numCidades; i++){
		for (j = 0; j < numCidades; j++){
			if (copiaMatrizCustos[i][j] > num && isFinite(copiaMatrizCustos[i][j]))
				num = copiaMatrizCustos[i][j];
		}
	}

	numDigitos = numDigits(num);

	Mgrande = Math.pow(10, numDigitos+1);

	for (i = 0; i < numCidades; i++){
		matrizCustos.push([]);
		for (j = 0; j < numCidades; j++){
			matrizCustos[i][j] = copiaMatrizCustos[i][j];
		}

		for (j = 0; j < numCidades; j++){
			if (trocaSinal && !Object.is(copiaMatrizCustos[i][j], 0) && isFinite(copiaMatrizCustos[i][j]))
				matrizCustos[i][j] = (-1)*copiaMatrizCustos[i][j];
			else if (!isFinite(copiaMatrizCustos[i][j]))
				matrizCustos[i][j] = Mgrande;
			else matrizCustos[i][j] = copiaMatrizCustos[i][j];
		}
	}

	imprimeFP();
}

function imprimeFP(){
	$div_fp = $('#forma-padrao');

	$div_fp.empty();

	$div_fp.append('<h4 class="card-title" style="text-align: center;">Forma Padr&atilde;o</h4><table id="tabela-fp" class="table table-striped table-hover table-bordered"><thead class="table-light">'+'<tr id="cabecalho-fp" style="text-align: center;"><th></th></tr></thead><tbody id="corpo-fp"></tbody></table><p id="fp-msg" class="lead" style="text-align: center;"></p><br>');

	$div_cabecalho = $('#cabecalho-fp');
	$div_corpo = $('#corpo-fp');

	for (i = 0; i < matrizCustos[0].length; i++){
		$div_cabecalho.append('<th>D<sub>'+(i+1)+'</sub></th>');
	}

	for (i = 0; i < matrizCustos.length; i++){
		$div_corpo.append('<tr id="fp-row'+(i+1)+'"><th style="text-align: right;">O<sub>'+(i+1)+'</sub></th></tr>');
		$div_linha = $('#fp-row'+(i+1));
		for (j = 0; j < matrizCustos[0].length; j++){
			$div_linha.append('<td>'+round(matrizCustos[i][j])+'</td>');
		}
	}
}

function subtraiMenorElementoLinhaColuna(){
	var i, j;
	// salva valores que foram substraídos de cada linha e coluna
	var subLinha = [], subColuna = [];
	var menor;

	// subtrai menor valor de cada linha
	for (i = 0; i < matrizCustos.length; i++){
		menor = matrizCustos[i][0];
		for (j = 1; j < matrizCustos[0].length; j++) {
			if (matrizCustos[i][j] < menor){
				menor = matrizCustos[i][j];
			}
		}

		subLinha.push(menor);

		for (j = 0; j < matrizCustos[0].length; j++){
			matrizCustos[i][j] = round(matrizCustos[i][j]-menor);
		}
	}

	imprimeSubtracaoLinha(subLinha);

	// subtrai menor valor de cada coluna
	for (i = 0; i < matrizCustos[0].length; i++) {
		menor = matrizCustos[0][i];

		for (j = 1; j < matrizCustos.length; j++){
			if (matrizCustos[j][i] < menor){
				menor = matrizCustos[j][i];
			}
		}

		subColuna.push(menor);

		for (j = 0; j < matrizCustos.length; j++){
			matrizCustos[j][i] = round(matrizCustos[j][i]-menor);
		}
	}

	imprimeSubtracaoColuna(subColuna);
}

// verifica se há uma alocação ótima representada por zeros
function verificaSolucaoOtima(){
	var i, j, k, l;
	// variáveis para localizar a linha com a menor quantidade de zeros
	var menor, indiceMenor;
	var cont;
	var cortado;
	var index;
	colunasAlocadas = [], linhasAlocadas = []; colunasCortadas = []; linhasCortadas = []; // inicializa varíaveis 
	// variável para indicar se foi posśivel encontrar um zero a cada busca
	var continua = true;

	while (continua){
		menor = Number.MAX_VALUE;
		continua = false;
		// procura linha com menor quantidade de zeros disponíveis			
		for (i = 0; i < matrizCustos.length; i++){
			cont = 0;
			if (!linhasAlocadas.includes(i)){
				for (j = 0; j < matrizCustos[0].length; j++){
					if (matrizCustos[i][j] === 0 && !colunasAlocadas.includes(j)){
						cortado = false;
						for (k = 0; k < colunasCortadas.length; k++){
							if (linhasCortadas[k] === i && colunasCortadas[k] === j){
								cortado = true;
							}
						}

						if (!cortado)
							cont++;
					}
				}

				if (cont < menor && cont > 0){
					menor = cont;
					indiceMenor = i;
				}
			}
		}

		// se encontrou linha com zero disponível, realiza marcação
		if (menor > 0 && menor !== Number.MAX_VALUE){
			continua = true; // continua procura de linhas disponíveis com zero
			// insere indiceMenor no vetor de linhas,
			// impedindo que mais de um zero seja alocado na mesma linha
			linhasAlocadas.push(indiceMenor);
			
			// salva indice da coluna do primeiro zero encontrada na linha alocada na variável de colunas alocadas
			for (j = 0; j < matrizCustos[0].length; j++){
				if (matrizCustos[indiceMenor][j] === 0 && !colunasAlocadas.includes(j)) {
					colunasAlocadas.push(j);
					break;
				}
			}

			// procura zeros nos índices das linhas e colunas alocadas.
			// caso encontre, salva indices em linhas e colunas cortadas
			k = linhasAlocadas[linhasAlocadas.length-1];
			l = colunasAlocadas[colunasAlocadas.length-1];
			var m = matrizCustos.length;
			var n = matrizCustos[0].length;
			
			//procura pela linha
			for (i = (k+1)%m; i != k; i = (i+1)%m){
				if (matrizCustos[i][l] === 0){
					cortado = false;
					for (j = 0; j < linhasCortadas.length; j++){
						if (linhasCortadas[j] === i && colunasCortadas[j] === l){
							cortado = true; 
							break;
						}
					}

					if (!cortado){
						linhasCortadas.push(i);
						colunasCortadas.push(l);
					}
				}
			}

			// procura pela coluna
			for (j = (l+1)%n; j != l; j = (j+1)%n){
				if (matrizCustos[k][j] === 0){
					cortado = false;
					for (i = 0; i < linhasCortadas.length; i++){
						if (linhasCortadas[i] === k && colunasCortadas[i] === j){
							cortado = true;
							break;
						}
					}

					if (!cortado) {
						linhasCortadas.push(k);
						colunasCortadas.push(j);
					}
				}
			}
		}
	}

	imprimeVerificaoAlocacaoOtima(deepClone(linhasAlocadas), deepClone(colunasAlocadas));

	if (linhasAlocadas.length === matrizCustos.length) {
		$('#vf-msg'+contadorIte).append('Aloca&ccedil;&atilde;o &Oacute;tima encontrada. Fim das itera&ccedil;&otilde;es.');
		return true;
	}
	else { 
		$('#vf-msg'+contadorIte).append('Aloca&ccedil;&atilde;o &Oacute;tima n&atilde;o encontrada. Riscar tabela, alterar valores das caselas e verificar novamente.');
		false;
	}
}

// marca linhas e colunas com o menor número de retas possível
function marcaZeros(){
	var i, j, k; // iteradores=
	var col, lin, index, numColMarcada, auxCol;
	// variáveis para salvar indices das colunas e linhas marcadas
	var colunaMarcada = [], linhaMarcada = [];
	colunaRiscada = [], linhaRiscada = []; // inicializa variáveis

	// marcar todas as linhas que não tenham um zero marcado
	for (i = 0; i < matrizCustos.length; i++){
		if(!linhasAlocadas.includes(i)){
			linhaMarcada.push(i);
		}
	}

	do {
		// marcar colunas com zeros cortados das linhas marcadas
		auxCol = colunaMarcada.length; // salva quantidade de colunas marcadas 
		for (i = 0; i < linhaMarcada.length; i++){
			lin = linhaMarcada[i];
			while(linhasCortadas.includes(lin)){
				index = linhasCortadas.indexOf(lin);
				col = colunasCortadas[index];
				if (!colunaMarcada.includes(col))
					colunaMarcada.push(col);
				linhasCortadas.splice(index,1);
				colunasCortadas.splice(index,1);
			}
		}

		// marcar linhas que tenham zeros alocados nas colunas recentemente marcadas
		for (i = auxCol; i < colunaMarcada.length; i++){
			col = colunaMarcada[i];

			if (colunasAlocadas.includes(col)){
				index = colunasAlocadas.indexOf(col);
				lin = linhasAlocadas[index];
				if (!linhaMarcada.includes(lin))
					linhaMarcada.push(lin);
			}
		}
	} while (auxCol !== colunaMarcada.length);

	// linhas riscadas são aquelas não marcadas
	for (i = 0; i < matrizCustos.length; i++){
		if (!linhaMarcada.includes(i))
			linhaRiscada.push(i);
	}

	// colunas riscadas são aquelas colunas que foram marcadas
	for (i = 0; i < colunaMarcada.length; i++){
		colunaRiscada.push(colunaMarcada[i]);
	}

	imprimeRiscar(deepClone(linhasAlocadas), deepClone(colunasAlocadas));
}

/*Realiza pivotamento do método de Alocação:
	1- Determina o menor número das caselas não riscadas.
	2- Subtrai das caselas não riscadas o valor determinado em 1.
	3- Soma das caselas riscadas duplamente o valor determinado em 1.*/
function pivotaTabela(){
	var i, j; // iteradores
	menorValor = Number.MAX_VALUE;

	// determina menor valor das caselas não riscadas
	for (i = 0; i < matrizCustos.length; i++){
		if (!linhaRiscada.includes(i)){
			for (j = 0; j < matrizCustos[0].length; j++){
				if (!colunaRiscada.includes(j)){
					if (matrizCustos[i][j] < menorValor){
						menorValor = matrizCustos[i][j];
					}
				}
			}
		}
	}

	$('#mc-msg'+contadorIte).append('Menor valor encontrado das caselas n&atilde;o riscadas: '+menorValor+'. Subtrair valor das caselas n&atilde;o riscadas e somar valor nas caselas riscadas duplamente.');

	// subtrai menor valor das caselas não riscadas
	for (i = 0; i < matrizCustos.length; i++){
		if(!linhaRiscada.includes(i)){
			for (j = 0; j < matrizCustos[0].length; j++){
				if (!colunaRiscada.includes(j)){
					matrizCustos[i][j] = round(matrizCustos[i][j]-menorValor);
				}
			}
		}
	}

	// soma menor valor das caselas duplamente riscadas
	for (i = 0; i < linhaRiscada.length; i++){
		for (j = 0; j < colunaRiscada.length; j++){
			matrizCustos[linhaRiscada[i]][colunaRiscada[j]] += menorValor;
		}
	}

	imprimePivotamento();
}

// alocação através do método húngaro
function Alocacao(){
	contadorIte = 0;

	subtraiMenorElementoLinhaColuna();
	contadorIte++;
	while (!verificaSolucaoOtima()) {
		marcaZeros();
		pivotaTabela();
		contadorIte++;
		if (menorValor === 0)
			break;
	}
}

function imprimeSubtracaoLinha(menores){
	var i, j;
	var contadorLinha = 1;
	
	$("#iteracoes").append('<table class="table table-hover table-bordered" id="subtracao-linha"><thead class="thead-dark">'+'<tr><th style="text-align: center;" colspan="'+(matrizCustos[0].length+2)+'">Subtra&ccedil;&atilde;o do menor valor de cada Linha</tr></thead><tbody id="corpo-sbLinha"><tr id="cabecalho-sbLinha"><th></th></tr></tbody></table><p id="msg-sbLinha" class="lead" style="text-align:center;"></p><br/>');

	$div_corpo = $('#corpo-sbLinha');
	$div_cab = $('#cabecalho-sbLinha');

	for (i = 0; i < matrizCustos[0].length; i++){
		$div_cab.append('<th style="text-align: center">D<sub>'+(i+1)+'</sub></th>');
	}

	$div_cab.append('<td></td>');

	for (i = 0; i < matrizCustos.length; i++){
		$div_corpo.append('<tr id="sbLinha-row'+contadorLinha+'" style="text-align: center;"><th style="text-align: right">O<sub>'+(i+1)+'</sub></th></tr>');
		$div_row = $('#sbLinha-row'+contadorLinha);
		for (j = 0; j < matrizCustos[0].length; j++){
			$div_row.append('<td>'+round(matrizCustos[i][j])+'</td>');
		}

		$div_row.append('<td>-('+round(menores[i])+')</td>');

		contadorLinha++;
	}
}

function imprimeSubtracaoColuna(menores){
	var i, j;
	var contadorLinha = 1;
	var z = 0;
	var Incremento;

	$("#iteracoes").append('<table class="table table-hover table-bordered" id="subtracao-coluna"><thead class="thead-dark">'+'<tr><th style="text-align: center;" colspan="'+(matrizCustos[0].length+1)+'">Subtra&ccedil;&atilde;o do menor valor de cada Coluna</tr></thead><tbody id="corpo-sbColuna"><tr id="cabecalho-sbColuna"><th></th></tr></tbody></table><p id="msg-sbColuna" class="lead" style="text-align:center;"></p><br/>');

	$div_corpo = $('#corpo-sbColuna');
	$div_cab = $('#cabecalho-sbColuna');

	for (i = 0; i < matrizCustos[0].length; i++){
		$div_cab.append('<th style="text-align: center">D<sub>'+(i+1)+'</sub></th>');
	}

	for (i = 0; i < matrizCustos.length; i++){
		$div_corpo.append('<tr id="sbColuna-row'+contadorLinha+'" style="text-align: center;"><th style="text-align: right">O<sub>'+(i+1)+'</sub></th></tr>');
		$div_row = $('#sbColuna-row'+contadorLinha);
		for (j = 0; j < matrizCustos[0].length; j++){
			$div_row.append('<td>'+round(matrizCustos[i][j])+'</td>');
		}

		contadorLinha++;
	}

	contadorLinha++;
	$div_corpo.append('<tr id="sbColuna-row'+contadorLinha+'" style="text-align: center"><td></td></tr>');
	$div_row = $('#sbColuna-row'+contadorLinha);
	for (i = 0; i < menores.length; i++){
		$div_row.append('<td>-('+round(menores[i])+')</td>');
	}
}

function imprimeVerificaoAlocacaoOtima(linhas, colunas){
	var i, j;
	var contadorLinha = 1;

	$("#iteracoes").append('<table class="table table-hover table-bordered" id="iteracao-vf'+contadorIte+'"><thead class="thead-dark">'+'<tr><th style="text-align: center;" colspan="'+(matrizCustos[0].length+1)+'">Itera&ccedil;&atilde;o '+contadorIte+' - Verica&ccedil;&atilde;o de Aloca&ccedil;&atilde;o &Oacute;tima</tr></thead><tbody id="vf-corpo'+contadorIte+'"><tr id="vf-cabecalho'+contadorIte+'"><th></th></tr></tbody></table><p id="vf-msg'+contadorIte+'" class="lead" style="text-align:center;"></p><br/>');

	$div_corpo = $('#vf-corpo'+contadorIte);
	$div_cab = $('#vf-cabecalho'+contadorIte);

	for (i = 0; i < matrizCustos[0].length; i++){
		$div_cab.append('<th style="text-align: center">D<sub>'+(i+1)+'</sub></th>');
	}

	for (i = 0; i < matrizCustos.length; i++){
		$div_corpo.append('<tr id="vf-it'+contadorIte+'-row'+contadorLinha+'" style="text-align: center;"><th style="text-align: right">O<sub>'+(i+1)+'</sub></th></tr>');
		$div_row = $('#vf-it'+contadorIte+'-row'+contadorLinha);
		for (j = 0; j < matrizCustos[0].length; j++){
			if (linhas.includes(i) && matrizCustos[i][j] === 0){
				if (colunas[linhas.indexOf(i)] === j) {
					linhas = linhas.filter(item => item !== i);
					colunas = colunas.filter(item => item !== j);
					$div_row.append('<th>['+round(matrizCustos[i][j])+']</th>');
				} else {
					$div_row.append('<td>'+round(matrizCustos[i][j])+'</td>');
				}
			} else {
				$div_row.append('<td>'+round(matrizCustos[i][j])+'</td>');
			}
		}
		contadorLinha++;
	}
}

function imprimeRiscar(linhas, colunas){
	var i, j;
	var contadorLinha = 1;

	$("#iteracoes").append('<table class="table table-hover table-bordered" id="iteracao-mc'+contadorIte+'"><thead class="thead-dark">'+'<tr><th style="text-align: center;" colspan="'+(matrizCustos[0].length+1)+'">Itera&ccedil;&atilde;o '+contadorIte+' - Marca&ccedil;&atilde;o de linhas e colunas</tr></thead><tbody id="mc-corpo'+contadorIte+'"><tr id="mc-cabecalho'+contadorIte+'"><th></th></tr></tbody></table><p id="mc-msg'+contadorIte+'" class="lead" style="text-align:center;"></p><br/>');

	$div_corpo = $('#mc-corpo'+contadorIte);
	$div_cab = $('#mc-cabecalho'+contadorIte);

	for (i = 0; i < matrizCustos[0].length; i++){
		$div_cab.append('<th style="text-align: center">D<sub>'+(i+1)+'</sub></th>');
	}

	for (i = 0; i < matrizCustos.length; i++){
		$div_corpo.append('<tr id="mc-it'+contadorIte+'-row'+contadorLinha+'" style="text-align: center;"><th style="text-align: right">O<sub>'+(i+1)+'</sub></th></tr>');
		$div_row = $('#mc-it'+contadorIte+'-row'+contadorLinha);
		if (linhaRiscada.includes(i)){
			for (j = 0; j < matrizCustos[0].length; j++){
				if (linhas.includes(i) && matrizCustos[i][j] === 0){
					if (colunas[linhas.indexOf(i)] === j){
						linhas = linhas.filter(item => item !== i);
						colunas = colunas.filter(item => item !== j);
						$div_row.append('<th class="table-danger">['+round(matrizCustos[i][j])+']</th>');
					} else {
						$div_row.append('<td class="table-danger">'+round(matrizCustos[i][j])+'</td>');	
					}
				} else {
					$div_row.append('<td class="table-danger">'+round(matrizCustos[i][j])+'</td>');
				}
			}
		} else {
			for (j = 0; j < matrizCustos[0].length; j++){
				if (colunaRiscada.includes(j)) {
					if (linhas.includes(i) && matrizCustos[i][j] === 0){
						if (colunas[linhas.indexOf(i)] === j){
							linhas = linhas.filter(item => item !== i);
							colunas = colunas.filter(item => item !== j);
							$div_row.append('<th class="table-danger">['+round(matrizCustos[i][j])+']</th>');
						} else {
							$div_row.append('<td class="table-danger">'+round(matrizCustos[i][j])+'</td>');
						}
					} else {
						$div_row.append('<td class="table-danger">'+round(matrizCustos[i][j])+'</td>');
					}
				} else {
					if (linhas.includes(i) && matrizCustos[i][j] === 0){
						if (colunas[linhas.indexOf(i)] === j){
							linhas = linhas.filter(item => item !== i);
							colunas = colunas.filter(item => item !== j);
							$div_row.append('<th>['+round(matrizCustos[i][j])+']</th>');
						} else {
							$div_row.append('<td>'+round(matrizCustos[i][j])+'</td>');
						}			
					} else {
						$div_row.append('<td>'+round(matrizCustos[i][j])+'</td>');
					}
				}
			}
		}
		contadorLinha++;
	}
}

function imprimePivotamento(){
	var i, j;
	var contadorLinha = 1;

	$("#iteracoes").append('<table class="table table-hover table-bordered" id="iteracao-pv'+contadorIte+'"><thead class="thead-dark">'+'<tr><th style="text-align: center;" colspan="'+(matrizCustos[0].length+1)+'">Itera&ccedil;&atilde;o '+contadorIte+' - Pivotamento</tr></thead><tbody id="pv-corpo'+contadorIte+'"><tr id="pv-cabecalho'+contadorIte+'"><th></th></tr></tbody></table><p id="pv-msg'+contadorIte+'" class="lead" style="text-align:center;"></p><br/>');

	$div_corpo = $('#pv-corpo'+contadorIte);
	$div_cab = $('#pv-cabecalho'+contadorIte);

	for (i = 0; i < matrizCustos[0].length; i++){
		$div_cab.append('<th style="text-align: center">D<sub>'+(i+1)+'</sub></th>');
	}

	for (i = 0; i < matrizCustos.length; i++){
		$div_corpo.append('<tr id="pv-it'+contadorIte+'-row'+contadorLinha+'" style="text-align: center;"><th style="text-align: right">O<sub>'+(i+1)+'</sub></th></tr>');
		$div_row = $('#pv-it'+contadorIte+'-row'+contadorLinha);
		for (j = 0; j < matrizCustos[0].length; j++){
			$div_row.append('<td>'+round(matrizCustos[i][j])+'</td>');
		}
		contadorLinha++;
	}
}

function imprimeSolucaoFinal(){
	var i, j;
	var contadorLinha = 1;
	var z = 0;

	$div_result = $('#resultado-otimo');
	$div_result.empty();

	$div_result.append('<h4 class="card-title" style="text-align: center;">Resultado obtido</h4><table id="tabela-sf" class="table table-striped table-hover table-bordered"><thead class="table-light"><tr style="text-align: center;"><th>Oferta<th>Demanda</th><th>Custo</th></tr></thead><tbody id="sf-corpo"></tbody></table><br>');

	$div_corpo = $('#sf-corpo');

	for (i = 0; i < matrizCustos.length; i++){
		$div_corpo.append('<tr id="sf-linha'+contadorLinha+'" style="text-align: center;"></tr>');
		$div_row = $('#sf-linha'+contadorLinha);
		for (j = 0; j < matrizCustos[0].length; j++){
			if (linhasAlocadas.includes(i) && matrizCustos[i][j] === 0){
				if (colunasAlocadas[linhasAlocadas.indexOf(i)] === j){
					linhasAlocadas = linhasAlocadas.filter(item => item !== i);
					colunasAlocadas = colunasAlocadas.filter(item => item !== j);

					if (i < copiaMatrizCustos.length && j < copiaMatrizCustos[0].length) {
						$div_row.append('<td>O<sub>'+(i+1)+'</sub></td><td>D<sub>'+(j+1)+'</sub></td><td>'+round(copiaMatrizCustos[i][j])+'</td>');
						z += copiaMatrizCustos[i][j];
					} else {
						$div_row.append('<td>O<sub>'+(i+1)+'</sub></td><td>D<sub>'+(j+1)+'</sub></td><td>0</td>');
					}
				}	
			}
		}
		contadorLinha++;
	}

	contadorLinha++;
	$div_corpo.append('<tr id="sf-linha'+contadorLinha+'" style="text-align: center;"><td></td><th>Total</th><th>'+round(z)+'</th></tr>');
}

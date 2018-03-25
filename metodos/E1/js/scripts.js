var numVars = 2;
var numRestr = 1;
var trocaSinal; // bool para troca de sinal na resolução de problemas de maximização 
var objetivoDual; // objetivo do Dual será a negação de trocaSinal
var primalRevisado; // indica se o problema Primal foi revisado
var restricoes; // vetor para salvar os tipos de restrições do problema Primal
var restricoesPrimalRevisado; // vetor para salvar os tipos de restrições do problema Primal Revisado
var restricoesDual; // vetor para salvar os tipos de restrições do problema Dual
var livres; // vetor para salvar as variáveis livres do problema Primal
var livresDual; // vetor para salvar as variáveis livres do problema Dual
var matriz; // armazena matriz A do problema Primal
var matrizPrimalRevisado; // armazena matriz A do problema Primal Revisado
var matrizDual; // armazena matriz A(t) do problema Dual
var copiaMatriz;
var custo; // vetor com custo das variaveis do problema Primal e Primal Revisado
var custoDual; // vetor com custo das variáveis do problema Primal
var copiaCusto;
var vetorB; // vetor com o limite das restrições do problema Primal
var vetorBPrimalRevisado; // vetor com o limite das restrições do problema Primal Revisado
var vetorBDual; // vetor com o limite das restrições do problema Dual
var copiaVetorB;
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
	livres = [];
	var num;

	num = $('#numVariaveis').val();

	$div_var = $('#variaveis-livres');

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
			livres.push(i);
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
	$div_varLivre = $('#variaveis-livres');

	$div_func.empty();
	$div_restr.empty();
	$div_varLivre.empty();

	$div_func.append('z = ');
	for (var i = 0; i < numVars; i++){
		$div_varLivre.append('<div class="form-check form-check-inline"><label class="form-check-label lead"><input class="form-check-input" type="checkbox" id="x'+(i+1)+'">x<sub>'+(i+1)+'</sub></label></div>');
		$div_func.append('<input id=" x'+(i+1)+'" type="text" placeholder="0"> x<sub>'+(i+1)+'</sub>');
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
	limpou = 0;

	if (validacao()) {
		$div_ite.empty();
		$div_ite.append('<h4 class="card-title" style="text-align: center;">Itera&ccedil;&otilde;es</h4>');
		$('#primal-revisado').hide('slow');
		PrimalDual();
		$('#solucao').show('slow');
	}
});

$('#btLimpa').click(function (){
	limpa();
	atribuiValores();
	alteraTabela();
	$('#solucao').hide('slow');
	limpou = 1;
})
 
Array.max = function( array ){
   return Math.max.apply( null, array.map(Math.abs));
};

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

// salva valores do problema nas variáveis do Primal
function valoresProblema(){
	var i, j; // iteradores
	var limitanteRestr; // limitante da restricao (<=; >=; =)
	matriz = []; custo = []; restricoes = []; vetorB = []; // inicializacao de variaveis
	
	if($("#objetivo").val() === "1") {
		trocaSinal = true; // maximizar
	} else trocaSinal = false; // minimizar

	for (i = 0; i < numRestr; i++) {
		matriz.push([]);
	}

	for (i = 0; i < numVars; i++) {
		custo.push(copiaCusto[i]);
	}

	for (i = 0; i < numRestr; i++){
		limitanteRestr = $("#cp"+(i+1)).val();

		restricoes.push(limitanteRestr);
		vetorB.push(copiaVetorB[i]);

		for (j = 0; j < numVars; j++) {
			matriz[i][j] = copiaMatriz[i][j];
		}
	}

	matrizPrimalRevisado = deepClone(matriz);
	vetorBPrimalRevisado = deepClone(vetorB);
	restricoesPrimalRevisado = deepClone(restricoes);
}

/* função que revisa todo o problema Primal
*  Para problemas com objetivo de Maximização, verifica se todas as restrições tem sinal (<=),
*  e para problemas de Minimização, verifica se todas as restrições tem sinal (>=).
*	 Caso algum restrição tenha sinal troca, inverte-se a restrição multiplicando-a por (-1).
*	 Se uma restrição i for de igualdade - sinal de (=) -, 
	 isso indica que o problema Dual terá uma variável x[i] livre.
	 Para cada variável x[j] livre no Primal, haverá uma restrição j com sinal de igualdade (=).
*/
function revisaPrimal(){
	var i, j; // iteradores
	
	objetivoDual = !trocaSinal;
	
	if (trocaSinal){ // problema de maximização
		// troca os sinais das restrições com sinal de (>= ou "1") para sinal de (<= ou "0")
		for (i = 0; i < restricoesPrimalRevisado.length; i++){
			if (restricoesPrimalRevisado[i] === "1"){ // troca sinal
				for (j = 0; j < matrizPrimalRevisado[0].length; j++){
					matrizPrimalRevisado[i][j] = (-1) * matrizPrimalRevisado[i][j]; // inverte sinal dos fatores da restrição i
				}
				vetorBPrimalRevisado[i] = (-1) * vetorBPrimalRevisado[i]; // inverte sinal do custo da restrição i
				restricoesPrimalRevisado[i] = "0"; // restrição i agora possui sinal de (<=)
			}
		}

		// restrições do Dual terão sinal de (>= ou "1")
		for (i = 0; i < restricoesPrimalRevisado.length; i++){
			restricoesDual.push("1");
		}
	} else { // problema de minimização
		// troca os sinais das restrições com sinal de (<= ou "0") para sinal de (>= ou "1")
		for (i = 0; i < restricoesPrimalRevisado.length; i++){
			if (restricoesPrimalRevisado[i] === "0"){ // troca sinal
				for (j = 0; j < matrizPrimalRevisado[0].length; j++){
					matrizPrimalRevisado[i][j] = (-1) * matrizPrimalRevisado[i][j]; // inverte sinal dos fatores da restrição i
				}
				vetorBPrimalRevisado[i] = (-1) * vetorBPrimalRevisado[i]; // inverte sinal do custo da restrição i
				restricoesPrimalRevisado[i] = "1"; // restrição i agora possui sinal de (>=)
			}
		}

		// restrições do Dual terão sinal de (<= ou "0")
		for (i = 0; i < restricoesPrimalRevisado.length; i++){
			restricoesDual.push("0");
		}
	}

	// altera variável primalRevisado para true se houve troca de sinal de restrições
	for (i = 0; i < restricoes.length; i++){
		if (restricoes[i] !== restricoesPrimalRevisado[i]){
			primalRevisado = true;
			break;
		}
	}

	// relação de variáveis livres no Primal e restrições de (=) no Dual
	for (i = 0; i < livres.length; i++){
		restricoesDual[livres[i]] = "2";
	}

	// relação de restrições de (=) no Primal e variáveis livres no Dual
	for (i = 0; i < restricoesPrimalRevisado.length; i++){
		if (restricoesPrimalRevisado[i] === "2")
			livresDual.push(i);
	}

	vetorBDual = deepClone(custo);
	custoDual = deepClone(vetorBPrimalRevisado);
}

// retorna a transposta da matriz passada por parâmetro
function transpose(matrix) {
	return matrix.reduce(($, row) => row.map((_, i) => [...($[i] || []), row[i]]), [])
}

// converte problema primal em problema dual
function PrimalDual(){
	/// inicialização de variáveis
	restricoesDual = []; livresDual = []; custoDual = []; vetorBDual = [];
	primalRevisado = false;

	valoresProblema();
	revisaPrimal();

	matrizDual = transpose(matrizPrimalRevisado);

	imprimePrimal();
	if (primalRevisado) {
		imprimePrimalRevisado();
	}
	imprimeRevisoes();
	imprimeDual();
}

function imprimePrimal(){
	var i, j;
	var naoLivres = [];
	var m = matriz.length;
	var n = matriz[0].length;
	
	$div_msg = $('#msg-revisao');
	$div_msg.empty();

	$div_fp = $('#problema-primal');
	$div_fprestr = $('#problema-primal-restricoes');

	$div_fp.empty();
	$div_fprestr.empty();


	if (trocaSinal)
		$div_fp.append('Maximizar z = ');
	else {
		$div_fp.append('Minimizar z = ');
	}

	for (i = 0; i < custo.length; i++) {
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
				if (restricoes[i] === "0") {
					$div_fprestr.append(' &le; '+vetorB[i].toString()+'<br/>');
				}
				else if (restricoes[i] === "1") {
					$div_fprestr.append(' &ge; '+vetorB[i].toString()+'<br/>');
				} else {
					$div_fprestr.append(' = '+vetorB[i].toString()+'<br/>');
				}
			}
		}
	}

	if(primalRevisado){
		if (trocaSinal){ // maximização
			$div_msg.append('Todas as restri&ccedil;&otilde;es do tipo (&ge;) foram convertidas para restri&ccedil;&otilde;es do tipo (&le;) multiplicando ambos os lados por (-1).');
		} else {
			$div_msg.append('Todas as restri&ccedil;&otilde;es do tipo (&le;) foram convertidas para restri&ccedil;&otilde;es do tipo (&ge;) multiplicando ambos os lados por (-1).');
		}
	}

	for (i = 0; i < numVars; i++){
		if (!livres.includes(i))
			naoLivres.push(i);
	}

	if (naoLivres.length === numVars){
		$div_fprestr.append(' x &ge; 0');
		return;
	}
		
	if (naoLivres.length > 0) {
		for (i = 0; i < naoLivres.length-1; i++){
			$div_fprestr.append('x<sub>'+(naoLivres[i]+1)+'</sub>, ');
		}

		$div_fprestr.append('x<sub>'+(naoLivres[i]+1)+'</sub> &ge; 0');
	}

	if(livres.length > 0){
		$div_fprestr.append(' e ');

		for (i = 0; i < livres.length-1; i++){
			$div_fprestr.append('x<sub>'+(livres[i]+1)+'</sub>, ');			
		}
		
		$div_fprestr.append('x<sub>'+(livres[i]+1)+'</sub> livre(s)');
	}
}

function imprimePrimalRevisado(){
	var i, j;
	var naoLivres = [];
	var m = matrizPrimalRevisado.length;
	var n = matrizPrimalRevisado[0].length;

	$('#msg-final').empty();

	$('#primal-revisado').show('slow');

	$div_fp = $('#problema-primal-revisado');
	$div_fprestr = $('#problema-primal-revisado-restricoes');

	$div_fp.empty();
	$div_fprestr.empty();


	if (trocaSinal)
		$div_fp.append('Maximizar z = ');
	else {
		$div_fp.append('Minimizar z = ');
	}

	for (i = 0; i < custo.length; i++) {
		$div_fp.append(custo[i].toString()+'x<sub>'+(i+1)+'</sub>');
		if (i < n-1) {
			if (custo[i+1] >= 0)
				$div_fp.append(' + ');
			else $div_fp.append(' ');
		}
	}

	for (i = 0; i < m; i++) {
		for (j = 0; j < n; j++) {
			$div_fprestr.append(matrizPrimalRevisado[i][j].toString()+'x<sub>'+(j+1)+'</sub>');
			if (j < n-1) {
				if (matrizPrimalRevisado[i][j+1] >= 0)
					$div_fprestr.append(' + ');
				else $div_fprestr.append(' ');
			}
			else {
				if (restricoesPrimalRevisado[i] === "0") {
					$div_fprestr.append(' &le; '+vetorBPrimalRevisado[i].toString()+'<br/>');
				}
				else if (restricoesPrimalRevisado[i] === "1") {
					$div_fprestr.append(' &ge; '+vetorBPrimalRevisado[i].toString()+'<br/>');
				} else {
					$div_fprestr.append(' = '+vetorBPrimalRevisado[i].toString()+'<br/>');					
				}
			}
		}
	}

	for (i = 0; i < numVars; i++){
		if (!livres.includes(i))
			naoLivres.push(i);
	}

	if (naoLivres.length === numVars){
		$div_fprestr.append(' x &ge; 0');
		return;
	}
		
	if (naoLivres.length > 0) {	
		for (i = 0; i < naoLivres.length-1; i++){
			$div_fprestr.append('x<sub>'+(naoLivres[i]+1)+'</sub>, ');
		}

		$div_fprestr.append('x<sub>'+(naoLivres[i]+1)+'</sub> &ge; 0');
	}

	if(livres.length > 0){
		$div_fprestr.append(' e ');

		for (i = 0; i < livres.length-1; i++){
			$div_fprestr.append('x<sub>'+(livres[i]+1)+'</sub>, ');			
		}
		
		$div_fprestr.append('x<sub>'+(livres[i]+1)+'</sub> livre(s)');
	}
}

function imprimeDual(){
	var i, j;
	var naoLivres = [];
	var m = matrizDual.length;
	var n = matrizDual[0].length;

	$div_fd = $('#problema-dual');
	$div_fdrestr = $('#problema-dual-restricoes');

	$div_fd.empty();
	$div_fdrestr.empty();


	if (objetivoDual){
		$div_fd.append('Maximizar z = ');
	} 
	else {
		$div_fd.append('Minimizar z = ');
	}

	for (i = 0; i < custoDual.length; i++) {
		$div_fd.append(custoDual[i].toString()+'w<sub>'+(i+1)+'</sub>');
		if (i < n-1) {
			if (custoDual[i+1] >= 0)
				$div_fd.append(' + ');
			else $div_fd.append(' ');
		}
	}

	for (i = 0; i < m; i++) {
		for (j = 0; j < n; j++) {
			$div_fdrestr.append(matrizDual[i][j].toString()+'w<sub>'+(j+1)+'</sub>');
			if (j < n-1) {
				if (matrizDual[i][j+1] >= 0)
					$div_fdrestr.append(' + ');
				else $div_fdrestr.append(' ');
			}
			else {
				if (restricoesDual[i] === "0") {
					$div_fdrestr.append(' &le; '+vetorBDual[i].toString()+'<br/>');
				}
				else if (restricoesDual[i] === "1") {
					$div_fdrestr.append(' &ge; '+vetorBDual[i].toString()+'<br/>');
				} else {
					$div_fdrestr.append(' = '+vetorBDual[i].toString()+'<br/>');					
				}
			}
		}
	}

	for (i = 0; i < n; i++){
		if (!livresDual.includes(i))
			naoLivres.push(i);
	}

	if (naoLivres.length === n){
		$div_fdrestr.append(' w &ge; 0');
		return;
	}
	
	if (naoLivres.length > 0) {	
		for (i = 0; i < naoLivres.length-1; i++){
			$div_fdrestr.append('w<sub>'+(naoLivres[i]+1)+'</sub>, ');
		}

		$div_fdrestr.append('w<sub>'+(naoLivres[i]+1)+'</sub> &ge; 0');
	}

	if(livresDual.length > 0){
		$div_fdrestr.append(' e ');

		for (i = 0; i < livresDual.length-1; i++){
			$div_fdrestr.append('w<sub>'+(livresDual[i]+1)+'</sub>, ');			
		}
		
		$div_fdrestr.append('w<sub>'+(livresDual[i]+1)+'</sub> livre(s)');
	}
}

function imprimeRevisoes(){
	var i, j;
	var restricoesIgual = [];

	if (primalRevisado) {
		$div_msg = $('#msg-final');
		$div_msg.empty();
	} else {
		$div_msg = $('#msg-revisao');
	}

	j = livres.length;
	if (j > 0) {
		if (j === 1) {
			$div_msg.append('A vari&aacute;vel x<sub>'+(livres[0]+1)+'</sub> &eacute; do tipo livre no problema Primal, portanto a restri&ccedil;&atilde;o '+(livres[0]+1)+' ser&aacute; do tipo (=) no problema Dual.<br>');
		}
		else {
			$div_msg.append('As vari&aacute;veis ');

			for (i = 0; i < j-1; i++){
				$div_msg.append('x<sub>'+(livres[i]+1)+'</sub>, ');
			}

			$div_msg.append('x<sub>'+(livres[i]+1)+'</sub> s&atilde;o do tipo livre no problema Primal, portanto as restri&ccedil;&otilde;es ');

			for (i = 0; i < j-1; i++){
				$div_msg.append((livres[i]+1)+', ');
			}

			$div_msg.append((livres[i]+1)+' ser&atilde;o do tipo (=) no problema Dual.<br>');
		}
	}

	j = restricoes.length;

	for (i = 0; i < j; i++){
		if (restricoes[i] === "2")
			restricoesIgual.push(i+1);
	}

	j = restricoesIgual.length;

	if (j > 0){
		if (j === 1){
			$div_msg.append('Como a restri&ccedil;&atilde;o '+restricoesIgual[0]+' &eacute; do tipo (=) no problema Primal, a vari&aacute;vel w<sub>'+restricoesIgual[0]+'</sub> ser&aacute; do tipo livre no problema Dual.');
		} else {
			$div_msg.append('Como as restri&ccedil;&otilde;es ');

			for (i = 0; i < j-1; i++){
				$div_msg.append(restricoesIgual[i]+', ');
			}

			$div_msg.append(restricoesIgual[i]+' s&atilde;o do tipo (=) no problema Primal, as vari&aacute;veis ');

			for (i = 0; i < j-1; i++){
				$div_msg.append('w<sub>'+restricoesIgual[i]+'</sub>, ');
			}

			$div_msg.append('w<sub>'+restricoesIgual[i]+'</sub> ser&atilde;o do tipo livre no problema Dual.');
		}
	}
}

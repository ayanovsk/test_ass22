console.log("IGfunctions.js loaded"); // you'll see this in the debugger console
var IGtheme = { // theme based on bglog "funfair"
/*	NOTE: do NOT copy/paste the theme contents wholesale from bglog. This version of bglog has extra settings
	(verticalTrayCheckers and moveDelay) so to update this theme, use bglog and copy/paste just the individual
	settings you want to change (or edit directly below for the simple settings).
*/
	canvasColor:          "rgba(153, 153, 153, 0)",
	borderColor:          "#bf5f04",
	surfaceColor:         "#f6dd92",
	trayColor:            "#de9a3e",
	barColor:             "#bf5f04",
	pointAcolor:          "#FFF",
	pointBcolor:          "#df8000",
	pointOutlines:        "#717171",
	ourCheckerColor:      "#FFFFFF",
	oppCheckerColor:      "#e71f00",
	textColor:            "#999",
	pipcountTextColor:    "#FFF",
	highlightColor:       "#F00",
	ourDicePipColor:      "#000",
	oppDicePipColor:      "#FFF",
	ourStackingColor:     "#000",
	oppStackingColor:     "#FFF",
	cubeColor:            "#FFF",
	cubeTextColor:        "#F00",
	borderWidth:          5,
	textShadows:          false,
	checkerHighlights:    false,
	threeDshadows:        false,
	animateSpeed:         0.4,
	moveDelay:            400,
	checkerSize:          0,
	numberOfCubes:        1,
	direction:            true,
	swapSides:            false,
	stacking:             false,
	showPointNumbers:     true,
	takiPoints:           true,
	cpStyle:              false,
	showPipCount:         true,
	showScore:            true,
	awayStyle:            false,
	showDice:             true,
	showCube:             true,
	cubeStart:            true,
	showIDs:              true,
	showTurnIndicator:    true,
	verticalTrayCheckers: false
};
var results = [];
var cardPointer = 0;
// events
$('#deckChooser').click(function() {chooseDeck()});
$('#direction').click(function() {bglog.toggleDirection()}); // click event for direction button
$('#prevButton').click(function() {doPrev()}); // click event for "Prev" button
$('#nextButton').click(function() {doNext()}); // click event for "Next" button
$('#swapsides').click(function() {rotate()}); // click event for swapsides button
$('#savesvg').click(function() {saveSVG()}); // click event for Save button
$('.dialog-close').click(function() {document.body.removeChild(dialogBox)});
$(window).keypress(function(e) { doKeypress(e); }); // keyboard shortcuts

chooseDeck();

function chooseDeck() {
	//console.log("chooseDeck, " + decks.length + " found");
	var chooseString="<p class=mast-head>Welcome to Ilia Guzei's backgammon page</p>";
	chooseString += "<table class='evalTables' id='deckHead'><tbody>";
	chooseString += "<tr class=save-diagram><td>Choose a deck...</td></tr>";
	chooseString += "</tbody></table>";
	chooseString += "<table class='evalTables' id='deckTable'><tbody>";
	for (var i=0; i<decks.length; i++) {
		chooseString += "<tr><td><button id='" + decks[i].deckId + "'>" + decks[i].deckName + "</button></td></tr>";
	}
	chooseString += "</tbody></table>";
	$('.diagram').hide();
	$('#eval').hide();
	$('#decksDialog').html(chooseString).show();
	$('#deckTable button').click(function () {
		cards = eval(this.id);
		deckChosen();
	});
}
function deckChosen() {
	bglog.loadTheme(IGtheme); // first we load our theme. If you want multiple themes they can be separated out.
	for (var i=0; i<cards.length; i++) results.push(0);
	cardPointer = 0;
	loadCard(cardPointer); // load the first card so the user has something to look at
	$('#prevButton').prop("disabled", true); // disable the "Prev" button as there is no previous card
	$('#nextButton').prop("disabled", false);
	$('#decksDialog').hide();
	$('.diagram').show();
}
function saveSVG() { // flattens the svg and writes it to the clipboard
	var thisSVG = $('#bglogContainer').html(); //get the current diagram
	thisSVG = thisSVG.replace(/class="([^"]+)"/g, ""); // remove ids
	thisSVG = thisSVG.replace(/id="([^"]+)"/g, ""); // remove classes
	navigator.clipboard // write to clipboard
		.writeText(thisSVG)
		.then (function() { console.log("svg copied to clipboard."); })
		.catch (function() { alert("svg failed to copy.");
	});
}

function rotate() { // rotates the board 180 deg
	var thisCard = cards[cardPointer]; // swap player names
	if ($('#swapsides').hasClass("selected")) { // if already selected
		$('#swapsides').removeClass("selected");
		$('#topPlayerName').text(thisCard.topPlayerName);
		$('#bottomPlayerName').text(thisCard.bottomPlayerName);
	} else {
		$('#swapsides').addClass('selected');
		$('#topPlayerName').text(thisCard.bottomPlayerName);
		$('#bottomPlayerName').text(thisCard.topPlayerName);
	}
	bglog.swapSides(); // rotate
}

function doKeypress(e) {
	var code = e.which || e.keyCode;
	//console.log("keypress, code " + code);
	if (code == 122 || code == 43) doRight(); // 'z' or '+'
	if (code == 120 || code == 45) doWrong(); // 'x' or '-'
	if (code == 62 || code == 50) toggleAnswer(cardPointer); // '>' or numpad 2
	if (code == 60 || code == 52) { // '<' or numpad 4
		if ($('#prevButton').prop("disabled")) {
			return;
		} else doPrev();
	}
	if (code == 63 || code == 54) { // '?' or numpad 6
		if ($('#nextButton').prop("disabled")) {
			return;
		} else doNext();
	}
}

function toggleAnswer() {
	if ($('#show-hide-button').text() == "Show answer") { // Show answer
		$('#show-hide-button').text("Hide answer"); // set Answer button text
		if (cards[cardPointer].positionType == "Checker play") { $('#moveTable').show();} // show the appropriate tables
		else {$('#cubeTable').show();}
		$('#commentTable').show(); // always show comments if present
	} else {
		$('#show-hide-button').text("Show answer"); // set Answer button text 
		if (cards[cardPointer].positionType == "Checker play") {
			$('#moveTable').hide(); // hide table
			$('.eval-move-button').removeClass('active').prop("disabled", false); // set all moves available
			bglog.undoMove(); // undo the active move, if any
		}
		else {$('#cubeTable').hide();}
		$('#moveTable').hide();
		$('#commentTable').hide();
	}
}
function runMove(moveId, move) { // called when a move button is pressed
	if ($('.eval-move-button').hasClass('active')) { // if any move is active,
		bglog.undoMove(); // undo it
		$('.eval-move-button').removeClass('active').prop("disabled", false); // enable move buttons
	} else {
		bglog.parseMove(move); // run move
		$('.eval-move-button').removeClass('active').prop("disabled", true); // disable move buttons
		$(moveId).addClass('active'); // set active
		$(moveId).prop("disabled", false); // enable this move button so it can be undone
	}
}
function doRight() { // answer "right"
	if ($('#buttonRight').hasClass("selected")) { // if already selected
		$('#buttonRight').removeClass("selected"); // remove selected
		results[cardPointer] = 0; // and clear result
	} else {
		$('#buttonRight').addClass("selected"); // if not selected, add selected
		$('#buttonWrong').removeClass("selected"); // deselect other button
		results[cardPointer] = 1; // set reult
	}
}
function doWrong() { // anser "wrong"
	if ($('#buttonWrong').hasClass("selected")) { // if already selected
		$('#buttonWrong').removeClass("selected"); // remove selected
		results[cardPointer] = 0; // clear result
	} else {
		$('#buttonWrong').addClass("selected"); // if not selected, add selected
		$('#buttonRight').removeClass("selected"); // deselect other button
		results[cardPointer] = -1; // set reult
	}
}
function doNext() { // called when Next button is clicked
	cardPointer++;
	if (cardPointer >= cards.length) {
		$('#nextButton').prop("disabled", true); // if this is the last card, disable Next button
		showResults();
	} else {
		$('#prevButton').prop("disabled", false); // if there is a next card, there must be a previous so enable the button
		loadCard(cardPointer);
	}
}
function doPrev() { // called when Prev button is clicked
	$('#nextButton').prop("disabled", false); // if there is a prev card, there must be a next so enable the button
	loadCard(--cardPointer); // decrement our pointer then load the card data
	if (cardPointer <= 0) $('#prevButton').prop("disabled", true); // if this is the first card, disable the Prev button
}
function showResults() {
	var i = wrong = right = unchecked = 0;
	var alertContent = "";
	for (i=0; i<cards.length; i++) {
		if (results[i] == 0) unchecked++;
		if (results[i] == 1) right++;
		if (results[i] == -1) wrong++;
	}
	alertContent += '<div id="resultDialog" class="dialog">';
	alertContent += "<table class='evalTables' id='scoreTable'><tbody>";
	alertContent += "<tr class='comment-head'><td>&nbsp;</td><td>Score</td><td class='pointer'><button onclick='closeAlert()' class='dialog-close'>&#10006;</button></td></tr>";
	alertContent += "<tr class='eval-best'><td class='color-green'>&#10003;</td><td>Right:</td><td>" + right + "</td></tr>";
	alertContent += "<tr class='eval-best'><td class='color-red'>&#10007;</td><td>Wrong:</td><td>" + wrong + "</td></tr>";
	alertContent += "<tr class='eval-best'><td>&nbsp;</td><td>Unchecked:</td><td>" + unchecked + "</td></tr>";
	alertContent += "</tbody></table></div>";
	$('#scoreDialog').html(alertContent);
}
function closeAlert() {
	$('#scoreDialog').html("");
	chooseDeck();
}
function loadCard(pointer) {
	var thisCard = cards[pointer];
	var thisId = thisCard.xgid; // grab the xgid
	bglog.loadXgId(thisId); // load the id
	
	if ($('#swapsides').hasClass("selected")) {
		bglog.swapSides();
		$('#swapsides').removeClass("selected");
	}
	$('#topPlayerName').text(thisCard.topPlayerName);
	$('#bottomPlayerName').text(thisCard.bottomPlayerName);
	
	var thisPlayer = thisCard.topPlayerName;
	if (roll) thisPlayer = thisCard.bottomPlayerName;
	var evalString = "";
	var scoreString = "";
	if ((matchLength > 0) && ((ourScore != 0) || (oppScore != 0))) {
		scoreString = " Score: " + ourScore + "-" + oppScore + "/" + matchLength;
	}
	
	if (thisCard.positionType == "Checker play") {
		evalString += "<table class='evalTables' id='positionTypeTable'><tbody>";
		evalString += "<tr class='position-type'><td><button class='answer-button' id='show-hide-button' onclick=\"toggleAnswer(" + cardPointer + ")\">Show answer</button></td><td>" + thisPlayer + " to play " + leftDie + "-" + rightDie + "." + scoreString + "</td><td class='pointer'>" + (cardPointer + 1) + "/" + cards.length + "</td></tr>";
		evalString += "</tbody></table>";
	} else {
		evalString += "<table class='evalTables' id='positionTypeTable'><tbody>";
		evalString += "<tr class='position-type'><td><button class='answer-button' id='show-hide-button' onclick=\"toggleAnswer(" + cardPointer + ")\">Show answer</button></td><td>" + thisPlayer + " on roll. " + thisCard.positionType + "." + scoreString + "</td><td class='pointer'>" + (cardPointer + 1) + "/" + cards.length + "</td></tr>";
		evalString += "</tbody></table>";
	}
	
	if (thisCard.positionType == "Checker play") {
		evalString += "<table class='evalTables' id='moveTable'><tbody>";
		for (var i=0; i<thisCard.actionlist.length; i++) {
			evalString += "<tr class='eval-move'><td> " + (i+1) + ". </td>"; // sequence
			evalString += "<td>" + thisCard.actionlist[i][1] + "</td>" // analysis level
			evalString += "<td><button class='eval-move-button' title='Play move. Select again to undo' id='move" + (i+1)
				+ "' onclick=\"runMove('#move" + (i+1)
				+ "','" + thisCard.actionlist[i][0]
				+ "')\">" + thisCard.actionlist[i][0]
				+ "</button></td>" // move
			evalString += "<td class='eval-eq'>" + thisCard.actionlist[i][2] + "</td></tr>" // equity
			evalString += "<tr class='eval-pwc'><td></td><td>Player:</td><td>" + thisCard.actionlist[i][3] + "</td><td></td></tr>"; // player gwc
			evalString += "<tr class='eval-pwc'><td></td><td>Opponent:</td><td>" + thisCard.actionlist[i][4] + "</td><td></td></tr>"; // opponent gwc
		}
		evalString += "</tr>";
	} else { // Cube action
		evalString += "<table class='evalTables' id='cubeTable'><tbody>";
		evalString += "<tr class='eval-move'><td width='33%'>Analyzed in " + thisCard.analyzeLevel + "</td><td width='33%'>No double</td><td width='33%'>Double/Take</td></tr>";
		for (var i=0; i<thisCard.actionList.length; i++) {
			evalString += "<tr class='eval-pwc'><td>Player winning chances:</td>";
			evalString += "<td>" + thisCard.actionList[i][1] + "</td><td></td></tr>";
			evalString += "<tr class='eval-pwc'><td>Opponent winning chances:</td>";
			evalString += "<td>" + thisCard.actionList[i][2] + "</td><td></td></tr>";
		}
		evalString += "<tr class='eval-pwc'><td>Cubeless Equities: </td><td>" + thisCard.cubelessEq[0] + "</td><td>" + thisCard.cubelessEq[1] + "</td></tr>";
		evalString += "<tr class='eval-move'><td>Cubeful Equities:</td><td></td><td></td></tr>";
		for (var i=0; i<thisCard.cubefulEq.length; i++) {
			evalString += "<tr class='eval-cubeful'><td class='indent'>" + thisCard.cubefulEq[i][0] + "</td><td>" + thisCard.cubefulEq[i][1] + "</td><td></td></tr>";
		}
		evalString += "<tr class='eval-best'><td colspan='3'>Best Cube action: " + thisCard.best + ".</td></tr>";
	}
	evalString += "</tbody></table>";
	evalString += "<table class='evalTables' id='answerTable'><tbody>";
	evalString += "<tr class='answer'><td><button class='rightWrong' id='buttonRight' onclick='doRight();'>&#10003;</button></td><td><button class='rightWrong' id='buttonWrong' onclick='doWrong();'>&#10007;</button></td></tr>";
	evalString += "</tbody></table>";
	if (thisCard.comment.length) {
		var thisComment = thisCard.comment.replace(/\n/g,"<br />");
		evalString += "<table class='evalTables' id='commentTable'><tbody>";
		evalString += "<tr class='comment-head'><td>Comment</td></tr>";
		evalString += "<tr class='comment'><td>" + thisComment + "</td></tr>";
		evalString += "</tbody></table>";
	}
	//$('#eval').fadeOut(0);
	//$('#eval').html(evalString).fadeIn("slow");
	$('#eval').html(evalString).show();
	$('#moveTable').hide();
	$('#cubeTable').hide();
	$('#commentTable').hide();
}
// IG.js 07/22 simon@bglog.org
import { changeDpiDataUrl } from "https://cdn.skypack.dev/changedpi";
import dataURLtoBlob from "https://cdn.skypack.dev/dataurl-to-blob";
import { fileSave } from "https://cdn.skypack.dev/browser-fs-access";

let defaultFilename = "bglog_diagram";
let defaultStart = "downloads";
let defaultRasterWidth;
let defaultRasterHeight;
let rasterWidthOverHeight;
let defaultDPI = 300;

console.log("IG.js loaded"); // you'll see this in the debugger console
//events
$('#saveDiagram').click(function() {saveDiagram()}); // click event for Save button
// functions
function saveDiagram() {
	//console.log("saveDiagram from " + xgPos);
	let evalString = "";
	evalString += "<table class='evalTables' id='saveTableHead'><tbody>";
	evalString += "<tr class=save-diagram><td>Save Diagram</td></tr>";
	evalString += "</tbody></table>";
	evalString += "<table class='evalTables' id='saveTable'><tbody>";
	evalString += "<tr class=eval-pwc><td style='width: 20%'>XGID:</td><td colspan=2><input type=text id=form-xgid name=xgid></td></tr>";
	evalString += "<tr class=eval-pwc><td>Filename:</td><td colspan=2><input type=text id=form-filename name=filename></td></tr>";
	evalString += "<tr class=eval-pwc><td></td><td><button id=form-reset class=form-button>Reset ID</td>";
	evalString += "<td><button id=form-preview class=form-button>Set ID</td></tr>";
	evalString += "<tr class=eval-pwc><td>Pixels:</td><td>Width: <input class=input-dimension type=number id=form-pixel-width name=pixel-width></td>";
	evalString += "<td>Height: <input class=input-dimension type=number id=form-pixel-height name=pixel-height></td></tr>";
	evalString += "<tr id=physical-units class=eval-pwc><td><input type='radio' id='inches' name='form-physical-units' value='inches' checked><label for='inches'>in</label>";
	evalString += "<input type='radio' id='cm' name='form-physical-units' value='centimeters'><label for='cm'>cm</label></td>";
	evalString += "<td>Width: <input class=input-dimension type=number id=form-physical-width name=physical-width></td>";
	evalString += "<td>Height: <input class=input-dimension type=number id=form-physical-height name=physical-height></td></tr>";
	evalString += "<tr class=eval-pwc><td></td><td>Format: <select name=format id=form-format>";
	evalString += "<option value=png selected>PNG</option><option value=jpg>JPG</option><option value=svg>SVG</option></select>";
	evalString += "<td>DPI: <input class=input-dimension type=number step=100 id=form-dpi name=dpi></td></tr>";
	evalString += "<tr class=eval-pwc><td><button class=form-button id=form-cancel>Cancel</td>";
	evalString += "<td><button class=form-button id=form-clear>Reset form</td>";
	evalString += "<td><button class=form-button id=form-save>Save diagram</td></tr>";
	evalString += "</tbody></table>";
	$('#eval').html(evalString);
	$('#form-filename').val(xgPos);
	$("#form-xgid").val(xgPos);
	$("#form-dpi").val(defaultDPI);
	
	const viewBoxContents = $("#bglogContainer")
	  .html()
	  .match(/viewBox=\"(\d+ \d+ \d+ \d+)\"/)[1]
	  .split(" ");
	defaultRasterWidth = parseInt(viewBoxContents[2]);
	defaultRasterHeight = parseInt(viewBoxContents[3]);
	rasterWidthOverHeight = defaultRasterWidth / defaultRasterHeight;
	$("#form-pixel-width").val(defaultRasterWidth);
	updatePhysicalWidthFromRasterWidth();
	$("#form-pixel-height").val(defaultRasterHeight);
	updatePhysicalHeightFromRasterHeight();

	// form events
	$('#saveDiagram').click(function() {saveDiagram()}); // click event for Save button
	$("#form-pixel-width").on("change", function () {
	  if (isInvalidLength($("#form-pixel-width").val()))
		$("#form-pixel-width").val(defaultRasterWidth);
	  updateRasterHeightFromRasterWidth();
	  updatePhysicalWidthFromRasterWidth();
	  updatePhysicalHeightFromRasterHeight();
	});
	$("#form-pixel-height").on("change", function () {
	  if (isInvalidLength($("#form-pixel-height").val()))
		$("#form-pixel-height").val(defaultRasterHeight);
	  updateRasterWidthFromRasterHeight();
	  updatePhysicalWidthFromRasterWidth();
	  updatePhysicalHeightFromRasterHeight();
	});
	$("#form-physical-width").on("change", function () {
	  if (isInvalidLength($("#form-physical-width").val()))
		updatePhysicalWidthFromRasterWidth();
	  updatePhysicalHeightFromPhysicalWidth();
	  updateRasterWidthFromPhysicalWidth();
	  updateRasterHeightFromPhysicalHeight();
	});
	$("#form-physical-height").on("change", function () {
	  if (isInvalidLength($("#form-physical-height").val()))
		updatePhysicalHeightFromRasterHeight();
	  updatePhysicalWidthFromPhysicalHeight();
	  updateRasterWidthFromPhysicalWidth();
	  updateRasterHeightFromPhysicalHeight();
	});
	$("#form-dpi").on("change", function () {
	  if (isInvalidLength($("#form-dpi").val())) $("#form-dpi").val(defaultDPI);
	  updateRasterWidthFromPhysicalWidth();
	  updateRasterHeightFromPhysicalHeight();
	});
	$("#physical-units").on("change", function () {
	  updatePhysicalWidthFromRasterWidth();
	  updatePhysicalHeightFromRasterHeight();
	});
	$("#form-format").on("change", function () {
	  formatChange();
	});
	// form button events
	$("#form-clear").click(function () {
	  $("#form-format").val("png");
	  formatChange();
  
	  $("#form-dpi").val(defaultDPI);
	  $("#form-physical-units").val("inches");
	  $("#inches").prop( "checked", true );
  
	  $("#form-pixel-width").val(defaultRasterWidth);
	  updatePhysicalWidthFromRasterWidth();
	  $("#form-pixel-height").val(defaultRasterHeight);
	  updatePhysicalHeightFromRasterHeight();
	});
	$("#form-reset").click(function () {
	  bglog.loadXgId(xgEmptyId);
	  $("#form-xgid").val(xgPos);
	  $("#form-filename").val(xgPos);
	});
	$("#form-preview").click(function () {
	  bglog.loadXgId($("#form-xgid").val());
	});
	$("#form-save").click(function () {
	  saveImage();
	});
	$("#form-cancel").click(function () {
	  loadCard(cardPointer);
	});
}

function formatChange() {
  switch ($("#form-format").val()) {
    case "jpg":
    case "png":
	  $("#form-pixel-width").prop("disabled", false);
	  $("#form-pixel-height").prop("disabled", false);
	  $("#form-physical-width").prop("disabled", false);
	  $("#form-physical-height").prop("disabled", false);
	  $("#form-dpi").prop("disabled", false);
      break;
    case "svg":
	  $("#form-pixel-width").prop("disabled", true);
	  $("#form-pixel-height").prop("disabled", true);
	  $("#form-physical-width").prop("disabled", true);
	  $("#form-physical-height").prop("disabled", true);
	  $("#form-dpi").prop("disabled", true);
      break;
    default:
      break;
  }
}

async function saveImage() {
  let SVG = $("#bglogContainer")
    .html()
    .replace(
      /(viewBox=\"\d+ \d+ \d+ \d+\")/,
      '$1 width="' +
        defaultRasterWidth +
        '" height="' +
        defaultRasterHeight +
        '"'
    );
  let blobSVG = new Blob([SVG], {
    type: "image/svg+xml",
  });
  let blobURL = URL.createObjectURL(blobSVG);

  let outputFormat = $("#form-format").val();
  let startin = defaultStart;
  let filename = ($("#form-filename").val() || defaultFilename) + "." + outputFormat;
  switch (outputFormat) {
    case "svg":
	  try {
		await fileSave(blobSVG, {
		  fileName: filename,
		  startIn: startin,
		});
	  } catch (error) {
		  console.log(outputFormat + " fileSave error: " + error);
	  }
      URL.revokeObjectURL(blobURL);
      break;
    case "png":
    case "jpeg":
      let rasterWidth = $("#form-pixel-width").val();
      let rasterHeight = $("#form-pixel-height").val();

      let canvas = document.createElement("canvas");
      canvas.width = rasterWidth;
      canvas.height = rasterHeight;
      let context = canvas.getContext("2d");

      let image = new Image();
      image.onload = async function () {
        // snap image with canvas and download file when image loads
        context.drawImage(image, 0, 0, rasterWidth, rasterHeight);
        let dataURL = changeDpiDataUrl(
          canvas.toDataURL("image/" + outputFormat),
          $("#form-dpi").val()
        );
        let blobRaster = dataURLtoBlob(dataURL);
		try {
		  await fileSave(blobRaster, {
			fileName: filename,
			startIn: "downloads",
		  });
		} catch (error) {
			console.log(outputFormat + " fileSave error: " + error);
			URL.revokeObjectURL(blobURL);
			return;
		}
        URL.revokeObjectURL(blobURL);
		console.log("File " + filename + " saved in " + startin);
      };
      // sets width and height then loads the image with the blobURL
      image.width = rasterWidth;
      image.height = rasterHeight;
      image.src = blobURL;
      break;
    default:
      alert("This file format is not yet supported.");
  }
}

function updateRasterWidthFromRasterHeight() {
  $("#form-pixel-width").val(
    roundToNearest($("#form-pixel-height").val() * rasterWidthOverHeight, 0)
  );
}

function updateRasterHeightFromRasterWidth() {
  $("#form-pixel-height").val(
    roundToNearest($("#form-pixel-width").val() / rasterWidthOverHeight, 0)
  );
}

function updatePhysicalWidthFromPhysicalHeight() {
  $("#form-physical-width").val(
    roundToNearest($("#form-physical-height").val() * rasterWidthOverHeight, 3)
  );
}

function updatePhysicalHeightFromPhysicalWidth() {
  $("#form-physical-height").val(
    roundToNearest($("#form-physical-width").val() / rasterWidthOverHeight, 3)
  );
}

function updateRasterWidthFromPhysicalWidth() {
  let rasterWidth = roundToNearest(
    currentUnitsToInches($("#form-physical-width").val()) *
      $("#form-dpi").val(),
    0
  );
  $("#form-pixel-width").val(rasterWidth);
}

function updateRasterHeightFromPhysicalHeight() {
  let rasterWidth = roundToNearest(
    currentUnitsToInches($("#form-physical-height").val()) *
      $("#form-dpi").val(),
    0
  );
  $("#form-pixel-height").val(rasterWidth);
}

function updatePhysicalWidthFromRasterWidth() {
  let physicalWidth = roundToNearest(
    inchesToCurrentUnits($("#form-pixel-width").val() / $("#form-dpi").val()),
    3
  );
  $("#form-physical-width").val(physicalWidth);
}

function updatePhysicalHeightFromRasterHeight() {
  let physicalHeight = roundToNearest(
    inchesToCurrentUnits($("#form-pixel-height").val() / $("#form-dpi").val()),
    3
  );
  $("#form-physical-height").val(physicalHeight);
}

function currentUnitsToInches(length) {
  switch ($("input[name='form-physical-units']:checked").val()) {
    case "centimeters":
      return length / 2.54;
    case "inches":
    default:
      return length;
  }
}

function inchesToCurrentUnits(length) {
  switch ($("input[name='form-physical-units']:checked").val()) {
    case "centimeters":
      return length * 2.54;
    case "inches":
    default:
      return length;
  }
}

function isInvalidLength(length) {
  return length <= 0 || isNaN(length);
}

function roundToNearest(val, place) {
  return Math.round(val * 10 ** place + Number.EPSILON) / 10 ** place;
}
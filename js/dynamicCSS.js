var sheet = (function() {
	// Create the <style> tag
	var style = document.createElement("style");

	// Add a media (and/or media query) here if you'd like!
	// style.setAttribute("media", "screen")
	// style.setAttribute("media", "only screen and (max-width : 1024px)")

	// WebKit hack :(
	style.appendChild(document.createTextNode(""));

	// Add the <style> element to the page
	document.head.appendChild(style);

	return style.sheet;
})();

function addCSSRule(sheet, selector, rules, index) {
	if("insertRule" in sheet) {
		sheet.insertRule(selector + "{" + rules + "}", index);
	}
	else if("addRule" in sheet) {
		sheet.addRule(selector, rules, index);
	}
}

function createBackgroundBands(theme) {
  var rule =
    "  background: linear-gradient(\n"+
    "    to bottom,\n"
  var bandPercent = 100/cb.length
  cb.forEach(function(color, j) {
    rule += color, j*bandPercent+"%,\n"
    rule += color, (j+1)*bandPercent+"%"+(j!==(cb.length-1)?",":"")+"\n"
  })
  rule +="    )"
  return rule
}

function createBackgroundBandsRule(sheet, selector, theme) {
  var rule = createBackgroundBands(theme)
  addCSSRule(sheet, selector, rule)
}

var dynamicCSS = {
  sheet: sheet,
  addCSSRule: addCSSRule,
  createBackgroundBands: createBackgroundBands,
  createBackgroundBandsRule: createBackgroundBandsRule
}

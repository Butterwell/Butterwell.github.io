var color_themes = require('./100colorthemes.js')
function createBandBackgrounds(themes, prefix) {
   themes.forEach(function(cb, i) {
      console.log("."+prefix+i, "{")
      console.log("  background: linear-gradient(")
      console.log("    to bottom,")
      var bandPercent = 100/cb.length
      cb.forEach(function(color, j) {
        console.log(color, j*bandPercent+"%,")
        console.log(color, (j+1)*bandPercent+"%"+(j!==(cb.length-1)?",":""))
      })
      console.log("    )")
      console.log("}")
   })
}
createBandBackgrounds(color_themes,"cb_")

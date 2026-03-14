const fs = require('fs');
const pdf = require('pdf-parse');

const dataBuffer = fs.readFileSync('data/raw/Talentbaeume.pdf');

// Option: render page 5 (Random Tree) to see text layout
function render_page(pageData) {
    // Check text content
    let render_options = {
        // replace all tabs with spaces
        normalizeWhitespace: false,
        // do not disable combined text items
        disableCombineTextItems: false
    }
 
    return pageData.getTextContent(render_options)
    .then(function(textContent) {
        let lastY, text = '';
        for (let item of textContent.items) {
            if (lastY == item.transform[5] || !lastY){
                text += item.str;
            }  
            else{
                text += '\n' + item.str;
            }    
            lastY = item.transform[5];
        }
        return text;
    });
}

pdf(dataBuffer, {
    max: 5 // Nur erste 5 Seiten zum Testen
}).then(function(data) {
    console.log(data.text);
});

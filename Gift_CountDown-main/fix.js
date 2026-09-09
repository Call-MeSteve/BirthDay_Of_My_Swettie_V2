const fs = require('fs');
let text = fs.readFileSync('gallery.html', 'utf8');
const start = text.indexOf('/* OLD GROWING TREE COMMENTED OUT');
const end = text.indexOf('*/ // END OLD GROWING TREE') + 26;
if (start >= 0 && end > start) {
    text = text.substring(0, start) + text.substring(end);
    fs.writeFileSync('gallery.html', text, 'utf8');
    console.log('Fixed syntax error');
} else {
    console.log('Pattern not found');
}

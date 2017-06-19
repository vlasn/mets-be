let PDFDocument = require('pdfkit'),
fs = require('fs')


module.exports = (res) => {
	var docDefinition = { content: 'This is an sample PDF printed with pdfMake' };

 let obj = {
            "Sihtkoht": "Stora Enso Eesti AS/Imavere/EPMK",
            "Puuliik": "MA",
            "Sortiment": "peenpalk",
            "Diameeter_min": 11,
            "Diameeter_max": 12.9,
            "Pikkus_min": 3.4,
            "Pikkus_max": 3.7,
            "Kvaliteet": "ABC",
            "Hind": 30.2,
            "Ylestootamine": 5,
            "Vosatood": 5,
            "Vedu": 5,
            "Tasu": 2,
            "Tulu": 13.2
        }

  var loremIpsum = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam in...'

	doc.fillColor('black')

	for(row in obj){

		doc.text(row, {
			continued: true,
		   indent: 20,
		   linebreak: false,
		   columns: 1,
		   wordSpacing: 19,
		   align: 'justify',
		   underline: true
		})

	}

	for(row in obj){
		doc.text(obj[row], {
			continued: true,
		   indent: 20,
		   linebreak: false,
		   columns: 1,
		   wordSpacing: 19,

		})

	}



	//doc.pipe(fs.createWriteStream(res))
	doc.pipe(res)
	doc.end()




}
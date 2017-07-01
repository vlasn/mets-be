module.exports = d => {
	let p = new Promise((resolve,reject)=>{
		if(d.unmatched.length == 0 && d.matched.length > 0){
			d.status = "accept"
			for(let row of d.matched){
				if(d.matched.indexOf(row) == 0){
					d.veoselehed[0] = {
						VL_nr: row['Elvise VL nr'],
						cadastre: row['Katastritunnus'],
						rows: [],
						sum: (parseFloat(row['arvestus maht']) * parseFloat(row['Hind']))
					}
					console.log(parseInt(row['arvestus maht']) * parseInt(row['arvestus maht']))
					d.veoselehed[0].rows.push(row)
				} else if(d.matched.indexOf(row) > 0){
					let len = d.veoselehed.length
					for(let el of d.veoselehed){
						if(row['Elvise VL nr'] == el.VL_nr){
							el.sum = parseInt(el.sum) + (parseInt(row['arvestus maht']) *
							parseInt(row['arvestus maht'])) 
							el.rows.push(row)
							break
						} else if(row['Elvise VL nr'] != el.VL_nr){
							d.veoselehed[len] = {
								VL_nr: row['Elvise VL nr'],
								cadastre: row['Katastritunnus'],
								rows: [],
								sum: (parseFloat(row['arvestus maht']) * parseFloat(row['Hind']))
							}
							//console.log()
							el.sum = parseInt(el.sum) + (parseFloat(row['arvestus maht']) * parseFloat(row['Hind']))
							d.veoselehed[len].rows.push(row)
							break
						}
					}
				}
			}
			resolve(d)
		}
	})

	return p
	.then(d=>{
		return d
	})
}
module.exports = d => {
	let promise = new Promise((resolve,reject)=>{
		if(d.unmatched.length == 0 && d.matched.length > 0){
			d.status = "accept"
			for(let row of d.matched){
				if(d.matched.indexOf(row) == 0){
					d.veoselehed[0] = {
						VL_nr: row['Elvise VL nr'],
						cadastre: row['Katastritunnus'],
						rows: []
					}
					d.veoselehed[0].rows.push(row)
				} else if(d.matched.indexOf(row) > 0){
					let len = d.veoselehed.length
					for(let el of d.veoselehed){
						if(row['Elvise VL nr'] == el.VL_nr){
							el.rows.push(row)
							break
						} else if(row['Elvise VL nr'] != el.VL_nr){
							d.veoselehed[len] = {
								VL_nr: row['Elvise VL nr'],
								cadastre: row['Katastritunnus'],
								rows: []
							}
							d.veoselehed[len].rows.push(row)
							break
						}
					}
				}
			}
			resolve(d)
		}
	})

	return promise
	.then(d=>{
		//console.log(d)
		return d
	})
}
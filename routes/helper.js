const responseFactory = (status, msg, data)=>{
	return {
		status: status,
		msg: msg,
		data: data
	}
}

module.exports = {responseFactory}
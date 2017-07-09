function Locals(req) {

	this.user = req ?req.session.user :null;
	this.success = req? req.flash('success').toString() :null;
	this.error = req? req.flash('error').toString() : null;
	this.pageTestScript = null;
}

Locals.prototype.add = function add(key, value) {
	if (key) {
		this[key] = value || null;
	}
};

Locals.prototype.addObj = function add(obj) {
	if (Object.prototype.toString.call(obj) === '[object Object]') {
		for(var key in obj) { // 遍历所以可枚举属性
			if (obj.hasOwnProperty(key)) { // 判断是否是自有属性
				this[key] = obj[key];
			}
		}
	}
};

module.exports = Locals;
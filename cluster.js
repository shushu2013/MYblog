var cluster = require('cluster');
var os = require('os');

// 获取 CPU 的数量
var numCPUs = os.cpus().length;

var workers = {};
if (cluster.isMaster) {
	// 主进程分支
	cluster.on('exit', function (worker) {
		// 当一个工作进程结束时，重启工作进程
		delete workers[worker.pid];
		console.log('worker %d died. restarting...', worker.process.pid);
		worker = cluster.fork();
		workers[worker.pid] = worker;
	});

	cluster.on('listening', function(worker, address) {
		// 监听子进程的 listen 事件
		console.log(`A worker is now connected to ${address.address}:${address.port}`);
	});

	// 初始开启与 CPU 数量相同的工作进程
	for (var i = 0; i < numCPUs; i++) {
		var worker = cluster.fork();
		workers[worker.pid] = worker;
	}
} else {
	// 工作进程分支，启动服务器
	var app = require('./app');
	app.listen(3000);
}

// 当主进程被终止时，关闭所有工作进程
process.on('SIGTERM', function() {
	console.log('主进程结束！');

	for(var pid in workers) {
		process.kill(pid);
	}
	process.exit(0);
});
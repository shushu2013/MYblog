$('.says a.btn').click(function(ev){
	var target = ev.target;
	var flag = target.getAttribute('flag');
	var postid = $(target).siblings("p[postid]").attr("postid");
	var username = $(target).siblings("h2").find("a").text();
	var num = target.text || 0;
	Ajax('get', '/domicrosay', {username: username, id: postid, flag: flag}, 
		function() {
			target.text = parseInt(num) + 1;
		}, function(msg){
			alert(msg);
		});
});

/*
 * 个人设置
 */

 $('#changeImage').on('click', function(ev) {
 	handler.showUpImg();
 });

 $('#upImage').on('click', function(ev) {
 	if (handler.img) {
 		Ajax('Post', window.location, {img: handler.img} ,function(msg){
 			handler.clearUpImg();

			//更改头像图片src
			var avatar = $('a img.img-avatar');
			var upImg = $('img.up-img');
			avatar.attr('src', handler.img);
			upImg.attr('src', handler.img);

 			alert('修改成功');
 		}, function(msg){
 			alert(msg);
 		});
 	} else {
 		alert('请选择图片！');
 	}
 });

 $('.mask').on('click', function(ev) {
 	handler.clearUpImg();
 });

 $('.logo-cut').on('click', '.cut-close',function(ev) {
 	handler.clearUpImg();
 });

$('form #setting').on('click', function(ev) {
	var data = $('form').serialize();
	Ajax('Post', window.location, data ,function(){
		// handler.clearUpImg();
		alert('修改成功');

	}, function(msg){
		alert(msg);
	});

	return false;
});

 var handler = {
 	img:null,
 	imgWidth:0,
 	imgHeight:0,
 	imgSelection:null,
 	imgAreaSelect:null,
 	clearUpImg:  function(){
 		$('.mask').css('display','none');
 		$('.logo-cut').css('display', 'none');
 		// 如果选区存在则取消选区
 		handler.imgAreaSelect && handler.imgAreaSelect.cancelSelection();
 	},
 	showUpImg: function () {
 		$('.mask').css('display','block');
 		$('.logo-cut').css('display', 'block');
 		// 如果选区存在，则恢复选区
 		if(handler.img)
 		{
 			handler.imgAreaSelect.setSelection(handler.imgSelection.x1, handler.imgSelection.y1, 
 				handler.imgSelection.x2, handler.imgSelection.y2);
 			handler.imgAreaSelect.setOptions({show: true});
			handler.imgAreaSelect.update();
		} 
 	},
 	init: function($container) {
 		// 监听是否选择了新图片
 		$container.on("change", "input[type=file]", function(ev) {
 			if (!this.value) return;
			// 获取File对象，传给handleDrop进行处理
			var file = this.files[0];
			handler.handleDrop($(this).closest(".logo-cut"), file);
		});
		// 开启裁剪功能
		handler.imgAreaSelect = $('#img-original').imgAreaSelect({
			handles:true,
			aspectRatio:'1:1',
			minHeight:100,
			minWidth:100,
			instance:true,
			persistent:true,
			// onSelectStart:handler.compressAndUpload,
			onSelectChange:handler.compressAndUpload
		});
 	},
 	handleDrop: function($container, file) {
 		var $img = $container.find("img");
		//读取file内容，并把它转成base64的格式
		handler.readImgFile(file, $img, $container);
	},
	readImgFile: function(file, $img, $container) {
		var reader = new FileReader();
		// 检验用户是否选则是图片文件
		if (file.type.split("/")[0] !== "image") {
			util.toast("请选择一张图片文件！");
		}
		reader.onload = function(event) {
			var base64 = event.target.result;
			// 加載
			var image = new Image();
			image.onload = function() {
				handler.imgWidth = image.width;
				handler.imgHeight = image.height;
			};
			image.src = base64;

			$('#img-original').on('load', function(ev) {
				// 初始化裁剪选区
				handler.imgAreaSelect.setSelection(0,0,100,100,true);
				handler.imgAreaSelect.setOptions({show: true});
				handler.imgAreaSelect.update();
				handler.compressAndUpload(ev.target,handler.imgAreaSelect.getSelection());
			});

			// 给第一个img添加路径
			$('#img-original').attr('src', this.result);
			// 给第二个img添加路径
			$('#img-cut').attr('src', this.result);
			

		};
		reader.readAsDataURL(file);
	},
	compressAndUpload: function(img, selection) {
		handler.showPreview(img, selection);
		handler.compress(img, selection);
	},
	showPreview: function(img, selection) {
		// 判断选取区域不为空
		if(!selection.width || !selection.height)
			return;
		// 分别取高宽比率
		var scaleX = 100 / selection.width;
		var scaleY = 100 / selection.height;

		//给裁剪的图片定义高和宽
		$('.img-preview img').css({
			width: Math.round(scaleX * 170),
			height: Math.round(scaleY * 170),
			marginLeft: -Math.round(scaleX * selection.x1),
			marginTop: -Math.round(scaleY * selection.y1)
		});
	},
	compress: function(img, selection) {
		// 创建一个canvas对象
		var cvs = document.createElement('canvas');
		var startx = selection.x1 / 170 * handler.imgWidth;
		var starty = selection.y1 / 170 * handler.imgHeight;
		var width = selection.width / 170 * handler.imgWidth;
		var height = selection.height / 170 * handler.imgHeight;
		cvs.width = 100;
		cvs.height = 100;
		//　保存选区
		handler.imgSelection = selection;

		// 把图片画到画布上
		var ctx = cvs.getContext("2d");
		ctx.drawImage(img, startx, starty, width, height, 0,0, 100, 100);

		handler.img = cvs.toDataURL();
		// console.log(handler.img);
	}

}

handler.init($('.logo-cut'));


function Ajax(type, url, data, success, failed) {
	// 创建ajax对象
	var xhr = null;
	if(window.XMLHttpRequest) {
		xhr = new XMLHttpRequest();
	} else {
		xhr = new ActiveXObject('Microsoft.XMLHTTP');
	}

	var type = type.toUpperCase();
	// 用于清除缓存
	var random = Math.random();

	if(typeof data == 'object') {
		var str = '';
		for (var key in data) {
			str += key + '=' + data[key] + '&';
		}
		// 去掉最后的&
		data = str.replace(/&$/, '');
	}

	if(type == 'GET') {
		if(data) {
			xhr.open('GET', url + '?' + data, true);
		} else {
			xhr.open('GET', url + '?' + 't=' + random, true);
		}

		xhr.send();
	} else if(type == 'POST') {
		xhr.open('POST', url, true);
		// 如果需要像 html 表单那样 POST 数据，请使用 setRequestHeader() 来添加 http 头
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xhr.send(data);
	}

	// 处理返回数据
	xhr.onreadystatechange = function() {
		if(xhr.readyState == 4) {
			if(xhr.status == 200) {
				console.log(xhr.responseText);
				success(xhr.responseText);
			} else {
				if(failed) {
					failed(xhr.status);
				}
			}
		}
	};
}

var util = {
	toast: function(msg) {
		alert(msg);
	}
}
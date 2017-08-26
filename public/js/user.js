// 点击浏览文章
$('header a[href=#blog]').click(function(ev) {
	var header = $('header.header');
	
	if(header.hasClass('header-collapsed')) return;
	
	header.addClass('header-collapsed');
	$('.divider').addClass('user-hidden');
	$('.user-description').addClass('user-hidden');
});

// 文章点赞
$('.post-meta-tag a[essayid]').click(function(ev) {
	var target = ev.target;
	var id = target.getAttribute('essayid');
	var username = target.getAttribute('username');
	var num = target.text || 0;

	$.ajax({
		type: 'GET',
		url: '/domicroessay',
		data: "username="+username+"&id="+id, 
		dataType: 'json',
		success:function(msg) {
			toastTip(msg.suc);
			target.text = Number.parseInt(num) + 1;
		},
		error: function(r, textStatus, error) {
			// alert(r.responseText);
			var json = JSON.parse(r.responseText);
			toastTip(json.err);
		}
	});
});

// ajax 请求文章页，上一页
$('nav a.up-page').click(function(ev) {
	var page = $('nav span.page-number');
	var name = $('nav.pagination').attr('username');

	var pageNum = parseInt(page.attr('pagenum'), 10);
	var maxPage = parseInt(page.attr('maxpage'), 10);
	var url = "/u/" + name + "/page/";

	if (pageNum === 1) {
		return false;
	}

	url = url + (pageNum - 1);
	$.getJSON(url, function(json) {
		if (pageNum === 2) {
			$(ev.target).toggleClass('btn-inaction');
			$('nav a.next-page').toggleClass('btn-inaction');
		}

		addArticles(json);

		// 更新当前页数
		page.text((pageNum - 1) + ' / ' + maxPage);
		page.attr('pagenum', pageNum -1);

		if (pageNum > 2) {
			// 更新 a 标签的　href 属性
			$(ev.target).attr('href', '/u/' + name + '/?page=' + (pageNum - 2));
			$('nav a.next-page').attr('href', '/u/' + name + '/?page=' + pageNum);
		}
	});

	return false;
});

// 下一页
$('nav a.next-page').click(function(ev) {
	var page = $('nav span.page-number');
	var name = $('nav.pagination').attr('username');

	var pageNum = parseInt(page.attr('pagenum'), 10);
	var maxPage = parseInt(page.attr('maxpage'), 10);
	var url = "/u/" + name + "/page/";

	if (pageNum === maxPage) {
		return false;
	}

	url = url + (pageNum + 1);
	$.getJSON(url, function(json) {
		if (pageNum === (maxPage - 1)) {
			$(ev.target).toggleClass('btn-inaction');
			$('nav a.up-page').toggleClass('btn-inaction');
		}

		addArticles(json);

		page.text((pageNum + 1) + ' / ' + maxPage);
		page.attr('pagenum', pageNum + 1);

		if (pageNum < (maxPage - 2)) {
			// 更新 a 标签的　href 属性
			$(ev.target).attr('href', '/u/' + name + '/?page=' + (pageNum + 2));
			$('nav a.up-page').attr('href', '/u/' + name + '/?page=' + pageNum);
		}

	});
	
	return false;
});

function addArticles(json) {
	var ol = $('div.post-main ol.post-list');
	var articles = json.suc;
	var html = '';

	articles.forEach(function(article, index) {
		var title = '<h2 class="post-title"><a href="' + article.url + '" title="' + 
					article.title + '">' + article.title +	'</a></h2>';
		var text = '<p class="post-text">' + article.text + '</p>';
		var meta = '<div class="post-meta"><time data-time="' + article.time + 
					'" class="post-meta-date">' + article.time + 
					'</time><span>•</span><span class="post-meta-tag">文章</span>' +
					'<a href="' + article.url + 
					'" class="post-reading">继续阅读</a><hr class="post-divider"/></div>';

		html += '<li>' + title + text + meta + '</li>';
	});

	ol.html(html);
}

function toastTip(msg){
	var toast = document.createElement('div');
	var id = document.createAttribute('id');
	var style = document.createAttribute('style');
	var text = document.createTextNode(msg);

	id.value="toasttip";
	style.value="position: absolute; top: 2em; left: 50%; margin-left: -5em; width: 10em; height: 2em; border-radius: 2em; line-height: 2em; text-align:center; background: #eee; color: green;";

	toast.setAttributeNode(id);
	toast.setAttributeNode(style);
	toast.appendChild(text);

	var body = document.getElementsByTagName('body')[0];
	var parent = body.parentNode;
	parent.insertBefore(toast, body);

	setTimeout(function(){
		parent.removeChild(toast);
	}, 400);
}
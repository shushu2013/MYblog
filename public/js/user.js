
// 点击浏览文章
$('header a[href=#blog]').click(function(ev) {
	var header = $('header.header');
	
	if(header.hasClass('header-collapsed')) return;
	
	header.addClass('header-collapsed');
	$('.divider').addClass('user-hidden');
	$('.user-description').addClass('user-hidden');
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

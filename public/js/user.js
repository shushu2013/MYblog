$('header a[href=#blog]').click(function(ev) {
	var header = $('header.header');
	
	if(header.hasClass('header-collapsed')) return;
	
	header.addClass('header-collapsed');
	$('.divider').addClass('user-hidden');
	$('.user-description').addClass('user-hidden');
})

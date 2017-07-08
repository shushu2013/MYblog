/*
 * 这是每个页面都要运行的测试
 */

// 确保页面具有有效的标题
suite('Global Tests', function() {
	test('page has a valid title', function() {
		assert(document.title && document.title.match(/\S/) && 
			document.title.toUpperCase() !== 'TODO');
	});
});
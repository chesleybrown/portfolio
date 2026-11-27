// X (Twitter) conversion tracking base code. Loads the pixel and records a page view.
// Set the ID from X Ads Manager > Tools > Events manager.
(function () {
	var PIXEL_ID = 'rkbt4';
	!function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
	},s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
	a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
	twq('config', PIXEL_ID);
})();

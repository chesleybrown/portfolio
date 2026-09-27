'use strict';

(function () {
	var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	// Reveal on scroll, staggered within each parent.
	var items = document.querySelectorAll('.reveal');
	document.querySelectorAll('.hero .reveal').forEach(function (el, i) { el.style.setProperty('--d', i * 0.09 + 's'); });
	if ('IntersectionObserver' in window && !reduced) {
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (e) {
				if (!e.isIntersecting) return;
				e.target.classList.add('in');
				io.unobserve(e.target);
			});
		}, {rootMargin: '0px 0px -8% 0px', threshold: 0.05});
		items.forEach(function (el) {
			if (el.closest('.hero')) return;
			var siblings = Array.prototype.filter.call(el.parentNode.children, function (c) {
				return c.classList.contains('reveal');
			});
			el.style.setProperty('--d', Math.min(siblings.indexOf(el), 5) * 0.07 + 's');
			io.observe(el);
		});
	} else {
		items.forEach(function (el) { el.classList.add('in'); });
	}

	// Scroll progress bar.
	var bar = document.querySelector('.progress span');
	var ticking = false;
	function progress() {
		var max = document.documentElement.scrollHeight - window.innerHeight;
		bar.style.setProperty('--p', max > 0 ? Math.min(window.scrollY / max, 1) : 0);
		ticking = false;
	}
	window.addEventListener('scroll', function () {
		if (!ticking) { ticking = true; requestAnimationFrame(progress); }
	}, {passive: true});
	progress();

	// Live "shipping since" counter.
	var count = document.querySelector('.uptime .count');
	if (count) {
		var since = new Date(count.getAttribute('data-since') + 'T00:00:00');
		var pad = function (n) { return n < 10 ? '0' + n : String(n); };
		var tick = function () {
			var now = new Date();
			var years = now.getFullYear() - since.getFullYear();
			var anniversary = new Date(since);
			anniversary.setFullYear(since.getFullYear() + years);
			if (anniversary > now) { years -= 1; anniversary.setFullYear(anniversary.getFullYear() - 1); }
			var days = Math.floor((now - anniversary) / 86400000);
			count.textContent = years + 'y ' + days + 'd ' +
				pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
		};
		tick();
		if (!reduced) setInterval(tick, 1000);
	}

	var year = document.getElementById('year');
	if (year) year.textContent = new Date().getFullYear();
})();

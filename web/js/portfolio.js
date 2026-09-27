'use strict';

(function () {
	var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
	var $ = function (s, r) { return (r || document).querySelector(s); };
	var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
	var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
	var rand = function (a, b) { return a + Math.random() * (b - a); };

	/* ---------------- Toast ---------------- */
	var toastEl = $('.toast');
	var toastTimer;
	function toast(msg) {
		toastEl.textContent = msg;
		toastEl.classList.add('on');
		clearTimeout(toastTimer);
		toastTimer = setTimeout(function () { toastEl.classList.remove('on'); }, 2600);
	}

	/* ---------------- Split text into letters ---------------- */
	function splitLetters(el, offset) {
		var text = el.textContent.trim();
		el.setAttribute('aria-label', text);
		el.textContent = '';
		var i = offset || 0;
		text.split(' ').forEach(function (word, wi) {
			if (wi > 0) el.appendChild(document.createTextNode(' '));
			var w = document.createElement('span');
			w.className = 'word';
			w.setAttribute('aria-hidden', 'true');
			word.split('').forEach(function (c) {
				var s = document.createElement('span');
				s.className = 'ch'; s.textContent = c; s.style.setProperty('--i', i++);
				w.appendChild(s);
			});
			el.appendChild(w);
		});
		return i;
	}
	var n = 0;
	$$('.name .w').forEach(function (w) { n = splitLetters(w, n); });
	$$('.split').forEach(function (el) { splitLetters(el); });

	/* ---------------- Rotating words ---------------- */
	var words = ['iPhone apps', 'games', 'distributed systems', 'things people use'];
	var rot = $('.rot-word');
	var wi = 0;
	if (rot && !reduced) {
		setInterval(function () {
			rot.classList.remove('in');
			rot.classList.add('out');
			setTimeout(function () {
				wi = (wi + 1) % words.length;
				rot.textContent = words[wi];
				rot.classList.remove('out');
				rot.classList.add('in');
			}, 330);
		}, 2600);
	}

	/* ---------------- The sea ---------------- */
	var sea = (function () {
		var canvas = $('.sea');
		var hero = $('.hero');
		if (!canvas || !canvas.getContext) return null;
		var ctx = canvas.getContext('2d');
		var PX = 4;
		var W = 0, H = 0, WL = 0;
		var h = [], v = [];
		var bodies = [], drops = [], bubbles = [];
		var sky = document.createElement('canvas');
		var stars = [];
		var t = 0, running = false, visible = true;
		var afloatEl = $('[data-afloat]'), sunkEl = $('[data-sunk]');
		var sunk = 0;
		var nextFish = 240;

		var PAL = {
			m: '#c9b58a', S: '#f6f1e7', s: '#d9d0bd', H: '#e9e2d0', h: '#2b2f55', r: '#c65a5a',
			B: '#6b4226', b: '#a8703f', R: '#9e2f35', q: '#e05a4a', g: '#262033',
			Y: '#ffd23f', O: '#ff8a3d', k: '#111111', f: '#ff4d8d'
		};
		var SPRITES = {
			boat: ['      m         ', '      mSS       ', '      mSSs      ', '      mSSSs     ', '      mSSSSs    ', '      mSSSSSs   ', '      m         ', 'HHHHHHHHHHHHHHHH', ' hhhhhhhhhhhhhh ', '  rrrrrrrrrrrr  '],
			crate: ['BBBBBBB', 'BbbBbbB', 'BbBbBbB', 'BBBBBBB', 'BbBbBbB', 'BbbBbbB', 'BBBBBBB'],
			barrel: [' RRRR ', 'RqqqqR', 'gggggg', 'RqqqqR', 'RqqqqR', 'gggggg', 'RqqqqR', ' RRRR '],
			duck: ['   YY   ', '  YkYY  ', '  YYYYOO', 'Y  YY   ', 'YYYYYYY ', ' YYYYY  ']
		};
		var KINDS = {
			boat: {density: 0.4, sinks: false},
			crate: {density: 0.55, sinks: true},
			barrel: {density: 0.6, sinks: true},
			duck: {density: 0.35, sinks: false}
		};
		var sprite = {};
		Object.keys(SPRITES).forEach(function (k) {
			var rows = SPRITES[k];
			var c = document.createElement('canvas');
			c.width = rows[0].length; c.height = rows.length;
			var x = c.getContext('2d');
			rows.forEach(function (row, y) {
				row.split('').forEach(function (ch, xx) {
					if (PAL[ch]) { x.fillStyle = PAL[ch]; x.fillRect(xx, y, 1, 1); }
				});
			});
			sprite[k] = c;
		});

		function resize() {
			var r = hero.getBoundingClientRect();
			PX = r.width >= 1100 ? 6 : r.width >= 700 ? 5 : 4;
			var nw = Math.ceil(r.width / PX), nh = Math.ceil(r.height / PX);
			var old = h;
			W = nw; H = nh;
			WL = Math.round(H * (r.width < 640 ? 0.72 : 0.66));
			canvas.width = W; canvas.height = H;
			h = new Array(W).fill(0); v = new Array(W).fill(0);
			for (var i = 0; i < Math.min(old.length, W); i++) h[i] = old[i] || 0;
			paintSky();
			bodies.forEach(function (b) { b.x = clamp(b.x, 4, W - 4); });
		}

		function paintSky() {
			sky.width = W; sky.height = WL + 4;
			var s = sky.getContext('2d');
			var g = s.createLinearGradient(0, 0, 0, WL);
			g.addColorStop(0, '#0b1026');
			g.addColorStop(0.45, '#2a2358');
			g.addColorStop(0.78, '#6a3a6e');
			g.addColorStop(1, '#d9685a');
			s.fillStyle = g; s.fillRect(0, 0, W, WL + 4);
			// dithered bands for a pixel-art feel
			s.fillStyle = 'rgba(0,0,0,0.12)';
			for (var y = 0; y < WL; y += 3) for (var x = (y % 2) * 2; x < W; x += 4) s.fillRect(x, y, 1, 1);
			// sun sinking into the sea
			var sx = Math.round(W * 0.78), sy = WL - 2, sr = Math.max(7, Math.round(W * 0.035));
			for (var yy = -sr; yy <= 0; yy++) {
				var half = Math.round(Math.sqrt(sr * sr - yy * yy));
				if ((yy % 3 === 0) && yy > -sr * 0.6) continue;
				s.fillStyle = yy > -sr * 0.5 ? '#ff8a3d' : '#ffd23f';
				s.fillRect(sx - half, sy + yy, half * 2, 1);
			}
			stars = [];
			for (var i = 0; i < W * 0.5; i++) stars.push({x: Math.floor(Math.random() * W), y: Math.floor(Math.random() * WL * 0.6), p: Math.random() * 6.28, big: Math.random() < 0.08});
		}

		function surf(x) {
			var i = clamp(Math.round(x), 0, W - 1);
			return WL + h[i] + Math.sin(i * 0.09 + t * 0.035) * 0.9 + Math.sin(i * 0.031 - t * 0.021) * 1.3;
		}

		function spawn(kind, x, y, vx, vy) {
			var sp = sprite[kind];
			var k = KINDS[kind];
			bodies.push({kind: kind, x: x, y: y, vx: vx || 0, vy: vy || 0, w: sp.width, hgt: sp.height,
				rot: rand(-0.4, 0.4), vr: 0, d: k.density, wet: false, leak: false, age: 0,
				life: k.sinks ? rand(900, 1800) : Infinity});
			if (bodies.length > 36) bodies.shift();
		}

		function splash(x, width, strength) {
			for (var c = Math.floor(x - width / 2); c <= Math.ceil(x + width / 2); c++) {
				if (c >= 0 && c < W) v[c] += strength;
			}
			var count = Math.min(26, Math.round(strength * 7));
			for (var i = 0; i < count; i++) {
				drops.push({x: x + rand(-width / 2, width / 2), y: surf(x) - 1, vx: rand(-1.1, 1.1), vy: -rand(0.6, 1 + strength), c: Math.random() < 0.5 ? '#bdeff2' : '#5ce1e6'});
			}
		}

		function step() {
			t++;
			// water springs
			for (var i = 0; i < W; i++) {
				v[i] += -0.022 * h[i] - 0.018 * v[i];
				h[i] += v[i];
			}
			for (var pass = 0; pass < 3; pass++) {
				for (var j = 0; j < W; j++) {
					if (j > 0) { var dl = 0.22 * (h[j] - h[j - 1]); v[j - 1] += dl; }
					if (j < W - 1) { var dr = 0.22 * (h[j] - h[j + 1]); v[j + 1] += dr; }
				}
			}

			// bodies
			var afloat = 0;
			for (var b = bodies.length - 1; b >= 0; b--) {
				var o = bodies[b];
				o.age++;
				if (o.age > o.life) o.leak = true;
				if (o.leak) o.d += 0.0025;
				o.vy += 0.07;
				var s = surf(o.x);
				var bottom = o.y + o.hgt / 2;
				var f = clamp((bottom - s) / o.hgt, 0, 1);
				if (f > 0) {
					if (!o.wet && o.vy > 0.7) splash(o.x, o.w, Math.min(o.vy * 0.9, 3.2));
					o.wet = true;
					o.vy -= 0.07 * (f / o.d);
					o.vy *= 0.9; o.vx *= 0.985;
					var slope = Math.atan2(surf(o.x + 3) - surf(o.x - 3), 6);
					o.vr += (slope * (f < 1 ? 1 : 0.2) - o.rot) * 0.02;
					o.vr *= 0.86;
					var c = clamp(Math.round(o.x), 0, W - 1);
					v[c] += o.vy * 0.04;
					if (o.d > 1 && Math.random() < 0.3) bubbles.push({x: o.x + rand(-o.w / 3, o.w / 3), y: o.y, vy: -rand(0.2, 0.5)});
				} else {
					o.wet = false;
					o.vr *= 0.98;
				}
				o.rot += o.vr;
				o.x += o.vx; o.y += o.vy;
				if (o.x < 3 || o.x > W - 3) { o.vx *= -0.6; o.x = clamp(o.x, 3, W - 3); }

				// something falling onto a boat
				if (o.vy > 1.2 && !o.wet) {
					for (var q = 0; q < bodies.length; q++) {
						var p = bodies[q];
						if (p === o || p.kind !== 'boat' || p.leak) continue;
						if (Math.abs(p.x - o.x) < (p.w + o.w) / 2 && Math.abs(p.y - o.y) < (p.hgt + o.hgt) / 2) {
							p.leak = true; p.vr += 0.12 * (o.x < p.x ? 1 : -1);
							o.vy *= -0.3; o.vx += (o.x < p.x ? -1 : 1);
							toast('Direct hit! She’s taking on water.');
						}
					}
				}
				if (o.y - o.hgt > H + 4) {
					bodies.splice(b, 1);
					sunk++;
					if (o.kind === 'boat') toast('Scuttled. Scroll down for the full game.');
					continue;
				}
				if (o.d <= 1) afloat++;
			}
			// keep floating things from overlapping
			for (var a1 = 0; a1 < bodies.length; a1++) {
				for (var a2 = a1 + 1; a2 < bodies.length; a2++) {
					var A = bodies[a1], Bd = bodies[a2];
					if (!A.wet || !Bd.wet) continue;
					var dx = Bd.x - A.x, min = (A.w + Bd.w) / 2;
					if (Math.abs(dx) < min && Math.abs(Bd.y - A.y) < (A.hgt + Bd.hgt) / 2) {
						var push = (min - Math.abs(dx)) * 0.05 * (dx < 0 ? -1 : 1);
						A.vx -= push; Bd.vx += push;
					}
				}
			}
			if (afloatEl) { afloatEl.textContent = afloat; sunkEl.textContent = sunk; }

			// drops, fish and bubbles
			for (var d = drops.length - 1; d >= 0; d--) {
				var dr2 = drops[d];
				dr2.vy += 0.09; dr2.x += dr2.vx; dr2.y += dr2.vy;
				if (dr2.vy > 0 && dr2.y > surf(dr2.x)) {
					if (dr2.fish) splash(dr2.x, 3, 1.4);
					drops.splice(d, 1);
				}
			}
			for (var u = bubbles.length - 1; u >= 0; u--) {
				var bb = bubbles[u];
				bb.y += bb.vy; bb.x += Math.sin((t + u) * 0.2) * 0.15;
				if (bb.y < surf(bb.x)) bubbles.splice(u, 1);
			}
			if (--nextFish <= 0) {
				nextFish = Math.round(rand(300, 700));
				var fx = rand(W * 0.1, W * 0.9);
				drops.push({x: fx, y: surf(fx) + 1, vx: rand(-0.6, 0.6), vy: -rand(1.6, 2.3), fish: true, c: '#ff4d8d'});
				splash(fx, 3, 0.8);
			}
		}

		function draw() {
			ctx.clearRect(0, 0, W, H);
			ctx.drawImage(sky, 0, 0);
			// twinkling stars
			for (var i = 0; i < stars.length; i++) {
				var st = stars[i];
				var a = 0.35 + 0.65 * Math.abs(Math.sin(st.p + t * 0.02));
				ctx.fillStyle = 'rgba(246,241,231,' + a.toFixed(2) + ')';
				ctx.fillRect(st.x, st.y, 1, 1);
				if (st.big && a > 0.8) { ctx.fillRect(st.x - 1, st.y, 3, 1); ctx.fillRect(st.x, st.y - 1, 1, 3); }
			}
			// bodies behind the water line
			ctx.imageSmoothingEnabled = false;
			bodies.forEach(function (o) {
				ctx.save();
				ctx.translate(Math.round(o.x), Math.round(o.y));
				ctx.rotate(o.rot);
				ctx.drawImage(sprite[o.kind], -o.w / 2, -o.hgt / 2);
				ctx.restore();
			});
			// water columns
			var g = ctx.createLinearGradient(0, WL - 6, 0, H);
			g.addColorStop(0, 'rgba(38,120,170,0.86)');
			g.addColorStop(0.35, 'rgba(18,70,120,0.94)');
			g.addColorStop(1, 'rgba(6,20,43,1)');
			ctx.fillStyle = g;
			for (var x = 0; x < W; x++) {
				var s = Math.round(surf(x));
				ctx.fillRect(x, s, 1, H - s);
			}
			// foam line and sun glints
			for (var x2 = 0; x2 < W; x2++) {
				var s2 = Math.round(surf(x2));
				ctx.fillStyle = Math.abs(v[x2]) > 0.25 ? '#ffffff' : '#9fe3ea';
				ctx.fillRect(x2, s2, 1, 1);
				if ((x2 + (t >> 3)) % 11 === 0 && x2 > W * 0.62 && x2 < W * 0.94) {
					ctx.fillStyle = 'rgba(255,190,110,0.55)';
					ctx.fillRect(x2, s2 + 3 + ((x2 * 7) % 9), 3, 1);
				}
			}
			// dithered depth bands
			ctx.fillStyle = 'rgba(0,0,0,0.14)';
			for (var y = WL + 8; y < H; y += 4) for (var x3 = (y % 8 === 0 ? 0 : 2); x3 < W; x3 += 4) ctx.fillRect(x3, y, 1, 1);
			drops.forEach(function (d) {
				ctx.fillStyle = d.c;
				ctx.fillRect(Math.round(d.x), Math.round(d.y), d.fish ? 3 : 1, d.fish ? 2 : 1);
			});
			ctx.fillStyle = 'rgba(220,245,255,0.8)';
			bubbles.forEach(function (bb) { ctx.fillRect(Math.round(bb.x), Math.round(bb.y), 1, 1); });
		}

		function loop() {
			if (!running) return;
			step(); draw();
			requestAnimationFrame(loop);
		}
		function start() { if (!running && visible && !reduced) { running = true; requestAnimationFrame(loop); } }
		function stop() { running = false; }

		// Interaction
		var kinds = ['crate', 'barrel', 'duck', 'boat', 'crate', 'barrel'];
		var lastPointer = null;
		function toCell(e) {
			var r = canvas.getBoundingClientRect();
			return {x: (e.clientX - r.left) / PX, y: (e.clientY - r.top) / PX};
		}
		hero.addEventListener('pointerdown', function (e) {
			if (e.target.closest('a')) return;
			var p = toCell(e);
			if (reduced) return;
			if (p.y < surf(p.x) - 2) {
				spawn(kinds[Math.floor(Math.random() * kinds.length)], p.x, p.y, rand(-0.3, 0.3), 0);
			} else {
				splash(p.x, 8, 2.4);
				for (var i = 0; i < 12; i++) bubbles.push({x: p.x + rand(-3, 3), y: p.y + rand(-2, 2), vy: -rand(0.3, 0.8)});
			}
		});
		hero.addEventListener('pointermove', function (e) {
			var p = toCell(e);
			if (lastPointer && Math.abs(p.y - surf(p.x)) < 5) {
				var c = clamp(Math.round(p.x), 0, W - 1);
				v[c] += clamp((p.y - lastPointer.y) * 0.6, -2, 2) + clamp(Math.abs(p.x - lastPointer.x) * 0.08, 0, 0.8);
			}
			lastPointer = p;
			if (cursor) cursor.classList.toggle('sea', !e.target.closest('a'));
		});
		hero.addEventListener('pointerleave', function () { lastPointer = null; if (cursor) cursor.classList.remove('sea'); });

		if ('IntersectionObserver' in window) {
			new IntersectionObserver(function (es) {
				visible = es[0].isIntersecting;
				if (visible) start(); else stop();
			}).observe(hero);
		}
		document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
		var rt;
		window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { resize(); if (reduced) draw(); }, 120); });

		resize();
		spawn('boat', W * 0.3, WL - 8, 0.06, 0);
		spawn('duck', W * 0.55, WL - 4, -0.04, 0);
		for (var warm = 0; warm < 60; warm++) step();
		draw();
		start();

		return {
			rain: function () {
				bodies.forEach(function (b) { if (b.kind === 'boat') b.leak = true; });
				for (var i = 0; i < 16; i++) {
					(function (i) {
						setTimeout(function () { spawn(kinds[i % kinds.length], rand(W * 0.05, W * 0.95), -rand(4, 30), rand(-0.3, 0.3), rand(0, 1)); }, i * 120);
					})(i);
				}
				spawn('boat', W * 0.5, WL - 12, 0, 0);
				setTimeout(function () { bodies.forEach(function (b) { if (b.kind === 'boat') b.leak = true; }); }, 2200);
			}
		};
	})();

	/* ---------------- Split-flap board ---------------- */
	var board = $('.board');
	if (board) {
		var since = new Date(board.getAttribute('data-since') + 'T00:00:00');
		var widths = {y: 2, d: 3, h: 2, m: 2, s: 2};
		var cells = {};
		Object.keys(widths).forEach(function (u) {
			var box = $('.flaps[data-u="' + u + '"]', board);
			cells[u] = [];
			for (var i = 0; i < widths[u]; i++) {
				var f = document.createElement('span');
				f.className = 'flap';
				var b = document.createElement('b');
				b.textContent = '0';
				f.appendChild(b);
				box.appendChild(f);
				cells[u].push(f);
			}
		});
		var pad = function (n, w) { n = String(n); while (n.length < w) n = '0' + n; return n; };
		var setU = function (u, val) {
			var s = pad(val, widths[u]);
			cells[u].forEach(function (f, i) {
				var b = f.firstChild;
				if (b.textContent === s[i]) return;
				b.textContent = s[i];
				if (!reduced) { f.classList.remove('flip'); void f.offsetWidth; f.classList.add('flip'); }
			});
		};
		var tickBoard = function () {
			var now = new Date();
			var years = now.getFullYear() - since.getFullYear();
			var ann = new Date(since); ann.setFullYear(since.getFullYear() + years);
			if (ann > now) { years--; ann.setFullYear(ann.getFullYear() - 1); }
			var days = Math.floor((now - ann) / 86400000);
			setU('y', years); setU('d', days); setU('h', now.getHours()); setU('m', now.getMinutes()); setU('s', now.getSeconds());
			board.setAttribute('aria-label', years + ' years and ' + days + ' days');
		};
		tickBoard();
		if (!reduced) setInterval(tickBoard, 1000);
	}

	/* ---------------- Marquee, faster when you scroll ---------------- */
	var tracks = $$('.marquee .track');
	tracks.forEach(function (tr) { tr.innerHTML += tr.innerHTML + tr.innerHTML; });
	var mOffset = 0, lastY = window.scrollY, boost = 0;
	function marquee() {
		var y = window.scrollY;
		boost = boost * 0.92 + Math.abs(y - lastY) * 0.08;
		lastY = y;
		mOffset += 0.6 + boost * 0.9;
		tracks.forEach(function (tr) {
			var third = tr.scrollWidth / 3;
			var dir = +tr.getAttribute('data-dir');
			var x = (mOffset % third);
			tr.style.transform = 'translate3d(' + (dir > 0 ? -x : x - third) + 'px,0,0)';
		});
		requestAnimationFrame(marquee);
	}
	if (!reduced) requestAnimationFrame(marquee);

	/* ---------------- Tilt + glare ---------------- */
	if (finePointer && !reduced) {
		$$('[data-tilt]').forEach(function (el) {
			var max = el.classList.contains('polaroid') ? 10 : 5;
			el.addEventListener('pointermove', function (e) {
				var r = el.getBoundingClientRect();
				var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
				el.classList.add('live');
				el.style.setProperty('--ry', ((px - 0.5) * max * 2).toFixed(2) + 'deg');
				el.style.setProperty('--rx', ((0.5 - py) * max * 2).toFixed(2) + 'deg');
				el.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
				el.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
			});
			el.addEventListener('pointerleave', function () {
				el.classList.remove('live');
				el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg');
			});
		});
	}

	/* ---------------- Peek at older projects ---------------- */
	var peek = $('.peek'), peekImg = peek && $('img', peek);
	if (peek && finePointer) {
		$$('[data-peek]').forEach(function (a) {
			a.addEventListener('pointerenter', function () { peekImg.src = a.getAttribute('data-peek'); peek.classList.add('on'); });
			a.addEventListener('pointerleave', function () { peek.classList.remove('on'); });
			a.addEventListener('pointermove', function (e) {
				peek.style.setProperty('--px', (e.clientX + 24) + 'px');
				peek.style.setProperty('--py', (e.clientY - 140) + 'px');
			});
		});
	}

	/* ---------------- Reveal, count-ups, timeline ---------------- */
	$$('.card, .stat, .stop, .story, .polaroid, .earlier li, .socials').forEach(function (el) { el.classList.add('rv'); });
	var counters = $$('[data-count]');
	function countUp(el) {
		var end = +el.getAttribute('data-count'), suf = el.getAttribute('data-suffix') || '';
		var t0 = performance.now(), dur = 1400;
		(function f(now) {
			var p = clamp((now - t0) / dur, 0, 1);
			var e = 1 - Math.pow(1 - p, 4);
			el.textContent = Math.round(end * e) + suf;
			if (p < 1) requestAnimationFrame(f);
		})(t0);
	}
	if ('IntersectionObserver' in window && !reduced) {
		counters.forEach(function (c) { c.textContent = '0' + (c.getAttribute('data-suffix') || ''); });
		var io = new IntersectionObserver(function (es) {
			es.forEach(function (e) {
				if (!e.isIntersecting) return;
				e.target.classList.add('in');
				if (e.target.hasAttribute('data-count')) countUp(e.target);
				io.unobserve(e.target);
			});
		}, {rootMargin: '0px 0px -10% 0px'});
		$$('.rv, .split').concat(counters).forEach(function (el) { io.observe(el); });
	} else {
		$$('.rv, .split').forEach(function (el) { el.classList.add('in'); });
	}

	var rail = $('.rail'), stops = $$('.stop'), bar = $('.progress span'), top = $('.top');
	function onScroll() {
		var vh = window.innerHeight, y = window.scrollY;
		var max = document.documentElement.scrollHeight - vh;
		bar.style.setProperty('--p', max > 0 ? clamp(y / max, 0, 1) : 0);
		top.classList.toggle('solid', y > 40);
		if (rail) {
			var r = rail.getBoundingClientRect();
			rail.style.setProperty('--fill', clamp((vh * 0.65 - r.top) / r.height, 0, 1).toFixed(3));
			stops.forEach(function (s) { s.classList.toggle('lit', s.getBoundingClientRect().top < vh * 0.65); });
		}
	}
	var sTick = false;
	window.addEventListener('scroll', function () { if (!sTick) { sTick = true; requestAnimationFrame(function () { onScroll(); sTick = false; }); } }, {passive: true});
	onScroll();

	/* ---------------- Custom cursor ---------------- */
	var cursor = null;
	if (finePointer && !reduced) {
		cursor = $('.cursor');
		document.body.classList.add('has-cursor');
		var cx = -100, cy = -100, rx = -100, ry = -100;
		window.addEventListener('pointermove', function (e) {
			cx = e.clientX; cy = e.clientY;
			cursor.style.setProperty('--x', cx + 'px'); cursor.style.setProperty('--y', cy + 'px');
			cursor.classList.toggle('hover', !!e.target.closest('a, [data-hover], button'));
		}, {passive: true});
		(function follow() {
			rx += (cx - rx) * 0.2; ry += (cy - ry) * 0.2;
			cursor.style.setProperty('--rx', rx + 'px'); cursor.style.setProperty('--ry', ry + 'px');
			requestAnimationFrame(follow);
		})();
	}

	/* ---------------- Scrambled email ---------------- */
	var glyphs = '!<>-_\\/[]{}=+*^?#@$%&';
	$$('[data-scramble]').forEach(function (el) {
		var text = el.textContent, busy = false;
		el.addEventListener('pointerenter', function () {
			if (busy || reduced) return;
			busy = true;
			var frame = 0;
			(function f() {
				el.textContent = text.split('').map(function (c, i) {
					return i < frame / 2 ? c : glyphs[Math.floor(Math.random() * glyphs.length)];
				}).join('');
				if (frame++ < text.length * 2) requestAnimationFrame(f);
				else { el.textContent = text; busy = false; }
			})();
		});
	});

	/* ---------------- Type "sink" ---------------- */
	var typed = '';
	window.addEventListener('keydown', function (e) {
		if (e.metaKey || e.ctrlKey || e.altKey || /input|textarea/i.test(e.target.tagName)) return;
		typed = (typed + e.key.toLowerCase()).slice(-4);
		if (typed === 'sink') { typed = ''; sinkAll(); }
	});
	function sinkAll() {
		if (sea) {
			window.scrollTo({top: 0, behavior: reduced ? 'auto' : 'smooth'});
			toast('Abandon ship!');
			setTimeout(sea.rain, reduced ? 0 : 500);
		}
	}
	var sinkBtn = $('[data-sink]');
	if (sinkBtn) sinkBtn.addEventListener('click', sinkAll);

	var yr = $('#year');
	if (yr) yr.textContent = new Date().getFullYear();
})();

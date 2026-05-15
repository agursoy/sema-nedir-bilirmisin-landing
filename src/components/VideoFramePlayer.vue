<template>
	<div class="frame-player-container">
		<canvas ref="canvas" class="video-canvas"></canvas>
	</div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from "vue";

export default {
	emits: ["preload-completed"],
	expose: ["updateFrame"],
	props: ["canvas_w", "canvas_h"],
	setup(props, { emit }) {
		const isMobile =
			/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
			window.innerWidth < 768;

		// ---------- CONFIG ----------
		const TOTAL_FRAMES = 720;
		const INITIAL_PRELOAD = 500;
		const REMAINING_DELAY = isMobile ? 80 : 50;
		const FRAME_PATH = (i) =>
			`/frames/frame_${String(i).padStart(3, "0")}.webp`;

		const canvasW = props.canvas_w;
		const canvasH = props.canvas_h;

		// ---------- STATE ----------
		const canvas = ref(null);
		let ctx = null;
		const bitmaps = new Array(TOTAL_FRAMES + 1).fill(null);

		let lastRenderedFrame = -1;
		let pendingFrame = -1;
		let rafDrawId = null;

		// createImageBitmap desteğini bir kez kontrol et
		let bitmapSupported = typeof createImageBitmap === "function";

		// ---------- SINGLE IMAGE LOADER ----------
		async function preloadImage(index) {
			if (bitmaps[index]) return;

			try {
				const res = await fetch(FRAME_PATH(index));
				if (!res.ok) return;
				const blob = await res.blob();

				if (bitmapSupported) {
					try {
						bitmaps[index] = await createImageBitmap(blob);
						return;
					} catch {
						bitmapSupported = false; // bir kez başarısız olursa sonraki için devre dışı
					}
				}

				// Fallback: klasik Image
				const img = new Image();
				const url = URL.createObjectURL(blob);
				img.src = url;
				await new Promise((resolve) => {
					img.onload = () => {
						URL.revokeObjectURL(url);
						resolve();
					};
					img.onerror = () => {
						URL.revokeObjectURL(url);
						resolve();
					};
				});
				bitmaps[index] = img;
			} catch {
				// Sessizce geç
			}
		}

		async function preloadRange(start, end) {
			const promises = [];
			for (let i = start; i <= Math.min(end, TOTAL_FRAMES); i++) {
				promises.push(preloadImage(i));
			}
			await Promise.all(promises);
		}

		function preloadRemaining() {
			const startRemaining = async () => {
				for (let i = INITIAL_PRELOAD + 1; i <= TOTAL_FRAMES; i++) {
					await preloadImage(i);
					// Her frame arasında küçük gecikme — CPU'yu boğmaz
					if (i % 10 === 0) {
						await new Promise((r) => setTimeout(r, REMAINING_DELAY));
					}
				}
			};

			if (typeof requestIdleCallback === "function") {
				requestIdleCallback(() => startRemaining(), { timeout: 2000 });
			} else {
				setTimeout(startRemaining, 500);
			}
		}

		// ---------- DRAW ----------
		function drawFrame(index) {
			if (!ctx) return;
			const bmp = bitmaps[index];
			ctx.clearRect(0, 0, canvasW, canvasH);

			if (bmp) {
				const iw = bmp.width;
				const ih = bmp.height;
				const canvasRatio = canvasW / canvasH;
				const imgRatio = iw / ih;

				let dw = canvasW,
					dh = canvasH,
					dx = 0,
					dy = 0;

				if (imgRatio > canvasRatio) {
					dh = canvasH;
					dw = (iw / ih) * dh;
					dx = -(dw - canvasW) / 2;
				} else {
					dw = canvasW;
					dh = (ih / iw) * dw;
					dy = -(dh - canvasH) / 2;
				}
				ctx.drawImage(bmp, dx, dy, dw, dh);
			} else {
				ctx.fillStyle = "#111";
				ctx.fillRect(0, 0, canvasW, canvasH);
				ctx.fillStyle = "#999";
				ctx.font = "16px sans-serif";
				ctx.fillText(
					`frame ${String(index).padStart(3, "0")} yükleniyor...`,
					20,
					40,
				);
			}
		}

		// ---------- FRAME UPDATE (rAF-coalesced) ----------
		function scheduleDrawFrame(index) {
			pendingFrame = index;
			if (!rafDrawId) {
				rafDrawId = requestAnimationFrame(() => {
					rafDrawId = null;
					if (pendingFrame !== lastRenderedFrame) {
						drawFrame(pendingFrame);
						lastRenderedFrame = pendingFrame;
					}
				});
			}
		}

		function updateFrame(scrollPercent) {
			const frameIndex = Math.min(
				TOTAL_FRAMES,
				Math.max(1, Math.floor(scrollPercent * TOTAL_FRAMES) + 1),
			);
			scheduleDrawFrame(frameIndex);
		}

		onMounted(async () => {
			document.body.style.overflow = "hidden";
			document.documentElement.style.overflow = "hidden";

			const el = canvas.value;
			el.width = canvasW;
			el.height = canvasH;
			ctx = el.getContext("2d");

			// İlk frame'i çiz ki canvas boş görünmesin
			ctx.fillStyle = "#111";
			ctx.fillRect(0, 0, canvasW, canvasH);

			await preloadRange(1, INITIAL_PRELOAD);
			preloadRemaining();

			drawFrame(1);
			lastRenderedFrame = 1;

			setTimeout(() => {
				emit("preload-completed");
			}, 6000);
		});

		onBeforeUnmount(() => {
			document.body.style.overflow = "";
			document.documentElement.style.overflow = "";

			if (rafDrawId) cancelAnimationFrame(rafDrawId);

			bitmaps.forEach((bmp) => {
				if (bmp && typeof bmp.close === "function") bmp.close();
			});
		});

		return { canvas, updateFrame };
	},
};
</script>

<style>
.frame-player-container {
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	z-index: 0;
	pointer-events: none;
	overflow: hidden;
}

.video-canvas {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	min-width: 100%;
	min-height: 100%;
	width: auto;
	height: auto;
	object-fit: cover;
	background: #000;
}
</style>

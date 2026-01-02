<template>
	<div class="frame-player-container border-1 border-[#eceee2]/50">
		<div class="left-column">
			<canvas ref="canvas" class="video-canvas"></canvas>
		</div>
	</div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";

export default {
	emit: ["preloadCompleted"],
	expose: ["updateFrame"],
	props: ["canvas_w", "canvas_h"],
	setup(props, { emit }) {
		// ---------- CONFIG ----------
		const TOTAL_FRAMES = 720;
		const INITIAL_PRELOAD = 500;
		const FRAME_PATH = (i) =>
			`/frames/frame_${String(i).padStart(3, "0")}.webp`;

		const { canvas_w, canvas_h } = props;

		// ---------- STATE ----------
		const canvas = ref(null);
		const ctx = ref(null);
		const images = [];
		const loaded = new Array(TOTAL_FRAMES + 1).fill(false);

		const progressBar = ref(null);

		let lastRenderedFrame = -1;

		// ---------- HELPERS ----------
		function pad(n) {
			return String(n).padStart(3, "0");
		}

		function preloadImage(index) {
			return new Promise((resolve) => {
				if (!images[index]) images[index] = new Image();
				images[index].src = FRAME_PATH(index);
				images[index].decoding = "async";
				images[index].loading = "eager";
				images[index].onload = () => {
					loaded[index] = true;
					resolve(images[index]);
				};
				images[index].onerror = () => resolve(null);
			});
		}

		async function preloadInitial() {
			const promises = [];
			for (let i = 1; i <= Math.min(INITIAL_PRELOAD, TOTAL_FRAMES); i++) {
				promises.push(preloadImage(i));
			}
			return await Promise.all(promises);
		}

		function preloadRemaining() {
			setTimeout(async () => {
				for (let i = INITIAL_PRELOAD + 1; i <= TOTAL_FRAMES; i++) {
					await preloadImage(i);
					await new Promise((r) => setTimeout(r, 50));
				}
			}, 500);
		}

		function drawFrame(index) {
			if (!ctx.value) return;
			const img = images[index];
			ctx.value.clearRect(0, 0, canvas_w, canvas_h);

			if (img && loaded[index]) {
				const iw = img.width;
				const ih = img.height;
				const canvasRatio = canvas_w / canvas_h;
				const imgRatio = iw / ih;

				let dw = canvas_w;
				let dh = canvas_h;
				let dx = 0;
				let dy = 0;

				if (imgRatio > canvasRatio) {
					dh = canvas_h;
					dw = (iw / ih) * dh;
					dx = -(dw - canvas_w) / 2;
				} else {
					dw = canvas_w;
					dh = (ih / iw) * dw;
					dy = -(dh - canvas_h) / 2;
				}

				ctx.value.drawImage(img, dx, dy, dw, dh);
			} else {
				ctx.value.fillStyle = "#111";
				ctx.value.fillRect(0, 0, canvas_w, canvas_h);
				ctx.value.fillStyle = "#999";
				ctx.value.font = "16px sans-serif";
				ctx.value.fillText(`frame ${pad(index)} not loaded`, 20, 40);
			}
		}

		// ---------- FRAME UPDATE ----------
		function updateFrame(scrollPercent) {
			const frameIndex = Math.min(
				TOTAL_FRAMES,
				Math.max(1, Math.floor(scrollPercent * TOTAL_FRAMES) + 1)
			);

			if (frameIndex !== lastRenderedFrame) {
				drawFrame(frameIndex);
				lastRenderedFrame = frameIndex;
			}

			// progress bar
			if (progressBar.value) {
				progressBar.value.style.width = `${scrollPercent * 100}%`;
			}
		}

		onMounted(async () => {
			document.body.style.overflow = "hidden";
			document.documentElement.style.overflow = "hidden";

			const el = canvas.value;
			el.width = canvas_w;
			el.height = canvas_h;
			ctx.value = el.getContext("2d");

			await preloadInitial();
			preloadRemaining();

			drawFrame(1);
			lastRenderedFrame = 1;

			setTimeout(function () {
				emit("preload-completed");
			}, 6000);
		});

		return {
			canvas,
			updateFrame,
		};
	},
};
</script>

<style>
.left-column {
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
}

.video-canvas {
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
	background: #000;
}

.right-column {
	position: sticky;
	top: 120px;
}

.text-block {
	max-width: 380px;
	padding: 20px;
	background: rgba(255, 255, 255, 0.02);
	transition: all 0.3s ease-out;
}

.text-block h1 {
	margin: 0 0 12px 0;
	font-size: 24px;
}

.text-block p {
	margin: 0;
	line-height: 1.5;
	color: #e6e6e6;
}

.scroll-progress {
	position: fixed;
	bottom: 0;
	left: 0;
	width: 100%;
	height: 3px;
	background: rgba(255, 255, 255, 0.1);
	z-index: 60;
}

.progress-bar {
	height: 100%;
	width: 0;
	background: #fff;
	transition: width 0.1s linear;
}
</style>

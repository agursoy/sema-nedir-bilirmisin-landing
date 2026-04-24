import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { createTimeline, utils, splitText, stagger } from "animejs";

export function useScrollTimeline(scenes) {
	const isMobile =
		/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
		window.innerWidth < 768;

	const snapThreshold = 0.15;
	const snapForce = 0.08;
	const lerpFactor = isMobile ? 0.25 : 0.2;
	const containerSelector = ".scroll-container";
	const minDelta = isMobile ? 0.0005 : 0.0001;

	const currentIndex = ref(0);

	// Computed properties
	const currentScene = computed(() => scenes[currentIndex.value] || {});
	const currentHeader = computed(() => currentScene.value.header || "");
	const currentParagraph = computed(() => currentScene.value.paragraph || "");
	const currentStyle = computed(() => currentScene.value.style || {});

	let timeline = null;
	let container = null;

	// Smooth progress states
	let targetProgress = 0;
	let currentProgress = ref(0);
	let rafId = null;

	// Scroll handler — doğrudan oku, throttle yerine rAF'a bırak
	const onScroll = () => {
		const maxScroll = container.scrollHeight - container.clientHeight;
		const scrollY = container.scrollTop;
		targetProgress = maxScroll > 0 ? scrollY / maxScroll : 0;
	};

	const smoothUpdate = () => {
		const delta = Math.abs(targetProgress - currentProgress.value);

		if (delta < minDelta) {
			rafId = requestAnimationFrame(smoothUpdate);
			return;
		}

		currentProgress.value +=
			(targetProgress - currentProgress.value) * lerpFactor;

		const sceneStep = 1 / scenes.length;
		const rawIndex = currentProgress.value / sceneStep;
		const index = Math.floor(rawIndex);

		currentIndex.value = Math.min(scenes.length - 1, Math.max(index, 0));

		let local =
			(currentProgress.value - currentIndex.value * sceneStep) / sceneStep;

		// Snap logic
		if (local > 1 - snapThreshold) {
			const snapTarget = (currentIndex.value + 1) * sceneStep;
			currentProgress.value += (snapTarget - currentProgress.value) * snapForce;
			local = 1;
		} else if (local < snapThreshold) {
			const snapTarget = currentIndex.value * sceneStep;
			currentProgress.value += (snapTarget - currentProgress.value) * snapForce;
			local = 0;
		}

		// Timeline seek
		if (timeline) {
			timeline.seek(local * timeline.duration);
		}

		rafId = requestAnimationFrame(smoothUpdate);
	};

	const bindSceneAnimation = (index) => {
		if (timeline) {
			timeline.pause();
			timeline = null;
		}

		const headerEl = document.querySelector(`#header-${index}`);
		const paragraphEl = document.querySelector(`#paragraph-${index}`);

		if (!headerEl || !paragraphEl) {
			console.warn(`Elements not found for scene ${index}`);
			return;
		}

		headerEl.textContent = scenes[index].header;
		paragraphEl.textContent = scenes[index].paragraph;

		headerEl.removeAttribute("style");
		paragraphEl.removeAttribute("style");

		// GPU hints — mobilde sadece transform kullan (daha hafif)
		headerEl.style.willChange = "transform, opacity";
		paragraphEl.style.willChange = "transform, opacity";
		headerEl.style.contain = "layout style";
		paragraphEl.style.contain = "layout style";

		timeline = createTimeline({
			autoplay: false,
		});

		const headerSplitted = splitText(`#header-${index}`, {
			chars: true,
		});

		const paragraphSplitted = splitText(`#paragraph-${index}`, {
			chars: true,
		});

		// Mobilde daha hafif animasyon — daha az random hesaplama, daha küçük offset
		const xRange = isMobile ? 2 : 3;
		const yRange = isMobile ? 3 : 5;
		const rotRange = isMobile ? 90 : 180;

		timeline.add(
			[headerSplitted.chars, paragraphSplitted.chars],
			{
				opacity: [1, 0],
				x: (el, i) => utils.random(-xRange, xRange) + "rem",
				y: (el, i) => utils.random(-yRange, yRange) + "rem",
				rotate: (el, i) => utils.random(-rotRange, rotRange),
				duration: (el, i) => utils.random(200, 750),
				ease: "outCirc",
			},
			stagger(5, { from: "random" })
		);

		timeline.seek(0);
	};

	watch(currentIndex, async (val, oldVal) => {
		if (val !== oldVal) {
			await nextTick();
			bindSceneAnimation(val);
		}
	});

	onMounted(() => {
		container = document.querySelector(containerSelector);

		if (!container) {
			console.warn(
				`[useScrollTimeline] Container not found: ${containerSelector}`
			);
			return;
		}

		// İlk sahneyi hazırla
		nextTick(() => {
			bindSceneAnimation(0);
		});

		container.addEventListener("scroll", onScroll, { passive: true });
		smoothUpdate();
	});

	onUnmounted(() => {
		if (container) {
			container.removeEventListener("scroll", onScroll);
		}

		if (rafId) {
			cancelAnimationFrame(rafId);
		}

		if (timeline) {
			timeline.pause();
		}

		// willChange temizle
		scenes.forEach((_, idx) => {
			const header = document.querySelector(`#header-${idx}`);
			const paragraph = document.querySelector(`#paragraph-${idx}`);
			if (header) header.style.willChange = "auto";
			if (paragraph) paragraph.style.willChange = "auto";
		});
	});

	return {
		currentProgress,
		currentIndex,
		currentHeader,
		currentParagraph,
		currentStyle,
	};
}

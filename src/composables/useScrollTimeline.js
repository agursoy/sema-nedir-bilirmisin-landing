import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { createTimeline, utils, splitText, stagger } from "animejs";

export function useScrollTimeline(scenes) {
	const snapThreshold = 0.15; // %15
	const snapForce = 0.08; // ne kadar güçlü çeksin
	const lerpFactor = 0.2;
	const containerSelector = ".scroll-container";

	const currentIndex = ref(0);
	const currentHeader = computed(
		() => scenes[currentIndex.value]?.header || ""
	);
	const currentParagraph = computed(
		() => scenes[currentIndex.value]?.paragraph || ""
	);

	const currentStyle = computed(() => scenes[currentIndex.value]?.style || {});

	let timeline = null;
	let container = null;

	// Smooth progress states
	let targetProgress = 0;
	let currentProgress = ref(0);
	let rafId = null;

	const onScroll = () => {
		const maxScroll = container.scrollHeight - container.clientHeight;
		const scrollY = container.scrollTop;
		targetProgress = maxScroll > 0 ? scrollY / maxScroll : 0;
	};

	const smoothUpdate = () => {
		const delta = Math.abs(targetProgress - currentProgress.value);

		if (delta < 0.0001) {
			rafId = requestAnimationFrame(smoothUpdate);
			return; // Çok küçük değişimler için hesaplama yapma
		}

		// 1️⃣ Normal lerp
		currentProgress.value +=
			(targetProgress - currentProgress.value) * lerpFactor;

		const sceneStep = 1 / scenes.length;

		// 2️⃣ Scene index
		const rawIndex = currentProgress.value / sceneStep;
		const index = Math.floor(rawIndex);

		currentIndex.value = Math.min(scenes.length - 1, Math.max(index, 0));

		// 3️⃣ Local progress (0–1)
		let local =
			(currentProgress.value - currentIndex.value * sceneStep) / sceneStep;

		// 4️⃣ SNAP LOGIC ⭐
		if (local > 1 - snapThreshold) {
			// Sahnenin SONUNA yapış
			const snapTarget = (currentIndex.value + 1) * sceneStep;

			currentProgress.value += (snapTarget - currentProgress.value) * snapForce;

			local = 1;
		} else if (local < snapThreshold) {
			// Sahnenin BAŞINA yapış
			const snapTarget = currentIndex.value * sceneStep;

			currentProgress.value += (snapTarget - currentProgress.value) * snapForce;

			local = 0;
		}

		// 5️⃣ Timeline seek
		timeline.seek(local * timeline.duration);

		rafId = requestAnimationFrame(smoothUpdate);
	};

	watch(currentIndex, async (val) => {
		if (timeline) {
			await nextTick();

			// clear current timeline
			timeline.seek(0);
			bindSceneAnimation(val);
		}
	});

	const bindSceneAnimation = (index) => {
		// Yeni timeline oluştur
		timeline = createTimeline({
			autoplay: false,
		});

		const headerSplitted = splitText(`#header-${index}`, {
			chars: true,
		});

		const paragraphSplitted = splitText(`#paragraph-${index}`, {
			chars: true,
		});

		// Sahneye özel animasyon
		timeline.add(
			[headerSplitted.chars, paragraphSplitted.chars],
			{
				duration: 10,
				opacity: [1, 0],
				easing: "inOutBounce",
				x: {
					to: () => utils.random(-3, 3) + "rem",
					duration: () => utils.random(150, 500),
				},
				y: () => utils.random(-5, 5) + "rem",
				rotate: () => utils.random(-180, 180),
				duration: () => utils.random(200, 750),
				ease: "outCirc",
			},
			stagger(5, { from: "random" })
		);
	};

	onMounted(() => {
		container = document.querySelector(containerSelector);

		if (!container) {
			console.warn(
				`[useScrollTimeline] Container not found: ${containerSelector}`
			);
			return;
		}

		// find first animation
		bindSceneAnimation(0);
		container.addEventListener("scroll", onScroll);
		smoothUpdate();
	});

	onUnmounted(() => {
		window?.removeEventListener("scroll", onScroll);
		cancelAnimationFrame(rafId);
	});

	return {
		currentProgress,
		currentIndex,
		currentHeader,
		currentParagraph,
		currentStyle,
	};
}

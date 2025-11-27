import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { createTimeline } from "animejs";

export function useScrollTimeline(scenes) {
	const lerpFactor = 0.15;
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
		// Lerp progress
		currentProgress.value +=
			(targetProgress - currentProgress.value) * lerpFactor;

		const sceneStep = 1 / scenes.length;

		const index = Math.floor(currentProgress.value / sceneStep);
		currentIndex.value = Math.min(scenes.length - 1, Math.max(index, 0));

		const local =
			(currentProgress.value - currentIndex.value * sceneStep) / sceneStep;

		// Seek timeline
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

		// Sahneye özel animasyon
		timeline.add(
			[`.header-${index}`, `.paragraph-${index}`],
			{
				duration: 10,
				opacity: [1, 0],
				easing: "inOutBounce",
				y: "-200px",
			},
			0
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

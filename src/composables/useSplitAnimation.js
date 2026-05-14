import { computed } from "vue";

export function useSplitAnimation(currentProgress, isMobile) {
	const splitProgress = computed(() => {
		return Math.max(0, Math.min(1, (currentProgress.value - 0.98) / 0.02));
	});

	const videoSplitStyle = computed(() => {
		const p = splitProgress.value;
		if (p === 0) return {};
		const x = isMobile ? '0' : `-${p * 50}vw`;
		const y = isMobile ? `-${p * 50}vh` : '0';
		return {
			transform: `translate(${x}, ${y})`,
			opacity: 1 - p
		};
	});

	const textSplitStyle = computed(() => {
		const p = splitProgress.value;
		if (p === 0) return {};
		const x = isMobile ? '0' : `${p * 50}vw`;
		const y = isMobile ? `${p * 50}vh` : '0';
		return {
			transform: `translate(${x}, ${y})`,
			opacity: 1 - p
		};
	});

	return {
		splitProgress,
		videoSplitStyle,
		textSplitStyle,
	};
}

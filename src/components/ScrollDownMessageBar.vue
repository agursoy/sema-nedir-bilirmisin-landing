<template>
	<div
		v-show="show"
		ref="scrollDownMessage"
		class="absolute top-full pt-4 left-5 flex flex-row items-center gap-3"
	>
		<span id="scroll-message" class="text-snb-text-default"
			>Sayfayı kaydırmaya devam edin</span
		>
		<scroll-down-icon :width="'20'" />
	</div>
</template>
<script>
import ScrollDownIcon from "./icons/ScrollDownIcon.vue";
import { ref, onMounted, watch } from "vue";
import { animate } from "animejs";

export default {
	props: {
		isScrolling: Boolean,
		isFinished: Boolean,
	},
	components: {
		ScrollDownIcon,
	},
	setup(props) {
		const scrollDownMessage = ref(null);
		const show = ref(true);

		onMounted(() => {
			const animation = animate(scrollDownMessage.value, {
				opacity: [0, 1],
				ease: "bezierIn",
				loop: true,
				duration: 3000,
				alternate: true,
				autoplay: false,
			});

			animation.play();

			watch(
				() => [props.isScrolling, props.isFinished],
				([isScrolling, isFinished]) => {
					if (isFinished) {
						show.value = false;
					} else if (isScrolling) {
						show.value = false;
					} else {
						animation.restart();
						show.value = true;
					}
				},
			);
		});

		return {
			show,
			scrollDownMessage,
		};
	},
};
</script>
